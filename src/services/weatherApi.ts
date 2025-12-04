/**
 * Weather API Service
 * Integration with WeatherAPI.com for location search and weather data
 */

import axios, { type AxiosInstance } from 'axios'
import type {
  LocationSearchResult,
  CurrentWeather,
  HourlyEntry,
  DailyEntry,
  Location,
  WeatherData,
  WeatherAPIResponse,
  WeatherAPISearchResponse,
  WeatherError,
} from '@/types/weather'
import { handleError, handleHttpError, validateLocationSearch } from './errorHandler'

const API_BASE_URL = 'https://api.weatherapi.com/v1'
const API_KEY = import.meta.env.VITE_WEATHERAPI_KEY
const REQUEST_TIMEOUT = 10000 // 10 seconds
const SEARCH_DEBOUNCE_MS = 300

let axiosInstance: AxiosInstance
let searchAbortController: AbortController | null = null
let lastSearchTime = 0

/**
 * Initialize axios instance
 */
function initializeAxios(): AxiosInstance {
  if (!axiosInstance) {
    axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: REQUEST_TIMEOUT,
      params: {
        key: API_KEY,
      },
    })
  }
  return axiosInstance
}

/**
 * Search for locations by query (city name or zip code)
 * Returns array of LocationSearchResult or error
 */
export async function searchLocations(
  query: string,
): Promise<LocationSearchResult[] | WeatherError> {
  // Cancel previous request if still pending
  if (searchAbortController) {
    searchAbortController.abort()
  }

  // Validate input
  const validationError = validateLocationSearch(query)
  if (validationError) {
    return validationError
  }

  searchAbortController = new AbortController()

  try {
    const client = initializeAxios()

    // Debounce the actual request
    const now = Date.now()
    if (now - lastSearchTime < SEARCH_DEBOUNCE_MS) {
      // Return empty array if debounced
      return []
    }
    lastSearchTime = now

    const response = await client.get<WeatherAPISearchResponse[]>('/search.json', {
      params: {
        q: query,
        aqi: 'no',
      },
      signal: searchAbortController.signal,
    })

    // Transform WeatherAPI response to internal format
    const results: LocationSearchResult[] = response.data.map((item) => ({
      id: `${item.lat}:${item.lon}`,
      name: item.name,
      region: item.region,
      country: item.country,
      lat: item.lat,
      lon: item.lon,
    }))

    return results
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return handleHttpError(error.response.status, error.response.statusText)
      }
    }
    return handleError(error)
  } finally {
    searchAbortController = null
  }
}

/**
 * Get weather data for coordinates (current + hourly + daily forecast)
 * Returns WeatherData or error
 */
export async function getWeatherByCoordinates(
  latitude: number,
  longitude: number,
): Promise<WeatherData | WeatherError> {
  try {
    const client = initializeAxios()
    const query = `${latitude},${longitude}`

    const response = await client.get<WeatherAPIResponse>('/forecast.json', {
      params: {
        q: query,
        days: 7,
        aqi: 'no',
        alerts: 'no',
      },
    })

    return transformWeatherAPIResponse(response.data)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return handleHttpError(error.response.status, error.response.statusText)
      }
    }
    return handleError(error)
  }
}

/**
 * Transform WeatherAPI response to internal WeatherData format
 */
function transformWeatherAPIResponse(apiData: WeatherAPIResponse): WeatherData {
  const location: Location = {
    id: `${apiData.location.lat}:${apiData.location.lon}`,
    name: apiData.location.name,
    region: apiData.location.region,
    country: apiData.location.country,
    lat: apiData.location.lat,
    lon: apiData.location.lon,
  }

  // Transform current weather
  const current: CurrentWeather = {
    location,
    temperature: apiData.current.temp_c, // Store in Celsius, convert on display
    condition: apiData.current.condition.text,
    conditionIcon: apiData.current.condition.icon,
    humidity: apiData.current.humidity,
    windSpeed: apiData.current.wind_kph, // Store in kph, convert on display
    lastUpdated: new Date().toISOString(),
  }

  // Transform hourly forecast (next 12 hours)
  const hourly: HourlyEntry[] = []
  if (apiData.forecast.forecastday.length > 0) {
    const todayForecast = apiData.forecast.forecastday[0]
    if (todayForecast && todayForecast.hour) {
      const now = new Date()

      // Get hourly data for next 12 hours
      for (let i = 0; i < todayForecast.hour.length && hourly.length < 12; i++) {
        const hour = todayForecast.hour[i]
        if (hour) {
          const hourTime = new Date(hour.time)

          // Only include future hours
          if (hourTime > now) {
            hourly.push({
              time: formatHourTime(hour.time),
              temperature: hour.temp_c,
              condition: hour.condition.text,
              conditionIcon: hour.condition.icon,
              windSpeed: hour.wind_kph,
              humidity: hour.humidity,
              precipitationChance: hour.chance_of_rain,
            })
          }
        }
      }
    }
  }

  // Transform daily forecast (next 7 days)
  const daily: DailyEntry[] = []
  for (let i = 0; i < apiData.forecast.forecastday.length; i++) {
    const day = apiData.forecast.forecastday[i]
    if (day) {
      daily.push({
        date: formatDayDate(day.date),
        dayOfWeek: formatDayOfWeek(day.date),
        highTemperature: day.day.maxtemp_c,
        lowTemperature: day.day.mintemp_c,
        condition: day.day.condition.text,
        conditionIcon: day.day.condition.icon,
        precipitationChance: day.day.daily_chance_of_rain,
      })
    }
  }

  return {
    current,
    hourly,
    daily,
  }
}

/**
 * Format hour time as "2:00 PM" or similar
 */
function formatHourTime(isoDateTime: string): string {
  const date = new Date(isoDateTime)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Format day date as "Mon, Dec 4"
 */
function formatDayDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format day of week as "Monday"
 */
function formatDayOfWeek(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
  })
}

/**
 * Cancel any pending search requests
 */
export function cancelSearch(): void {
  if (searchAbortController) {
    searchAbortController.abort()
    searchAbortController = null
  }
}
