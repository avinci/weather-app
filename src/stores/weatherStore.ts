/**
 * Weather Store (Pinia)
 * Central state management for weather data, UI state, and errors
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  LocationSearchResult,
  Location,
  WeatherData,
  WeatherError,
  TemperatureUnit,
  CurrentWeather,
  HourlyEntry,
  DailyEntry,
} from '@/types/weather'
import {
  TemperatureUnit as TemperatureUnitEnum,
  convertTemperature,
} from '@/types/weather'
import * as weatherApi from '@/services/weatherApi'
import * as geolocation from '@/services/geolocation'
import { handleError } from '@/services/errorHandler'

export const useWeatherStore = defineStore('weather', () => {
  // ============ State ============

  const weatherData = ref<WeatherData>({
    current: null,
    hourly: [],
    daily: [],
  })

  const currentLocation = ref<Location | null>(null)
  const temperatureUnit = ref<TemperatureUnit>(TemperatureUnitEnum.FAHRENHEIT)
  const isSearching = ref(false)
  const isLoadingWeather = ref(false)
  const isRefreshing = ref(false)
  const searchError = ref<WeatherError | null>(null)
  const weatherError = ref<WeatherError | null>(null)
  const searchResults = ref<LocationSearchResult[]>([])
  const lastSearchQuery = ref('')
  const lastUpdated = ref<string | null>(null)
  const currentLocationAttempted = ref(false)

  // ============ Computed Properties ============

  /**
   * Current weather formatted for display with temperature conversion
   */
  const currentWeatherForDisplay = computed((): CurrentWeather | null => {
    if (!weatherData.value.current) return null

    return {
      ...weatherData.value.current,
      temperature: convertTemperature(
        weatherData.value.current.temperature,
        temperatureUnit.value,
      ),
      windSpeed: convertWindSpeed(
        weatherData.value.current.windSpeed,
        temperatureUnit.value,
      ),
    }
  })

  /**
   * Hourly forecast formatted for display with temperature conversion
   */
  const hourlyForecastForDisplay = computed((): HourlyEntry[] => {
    return weatherData.value.hourly.map((entry: HourlyEntry) => ({
      ...entry,
      temperature: convertTemperature(entry.temperature, temperatureUnit.value),
      windSpeed: convertWindSpeed(entry.windSpeed, temperatureUnit.value),
    }))
  })

  /**
   * Daily forecast formatted for display with temperature conversion
   */
  const dailyForecastForDisplay = computed((): DailyEntry[] => {
    return weatherData.value.daily.map((entry: DailyEntry) => ({
      ...entry,
      highTemperature: convertTemperature(entry.highTemperature, temperatureUnit.value),
      lowTemperature: convertTemperature(entry.lowTemperature, temperatureUnit.value),
    }))
  })

  /**
   * Formatted last updated timestamp
   */
  const formattedLastUpdated = computed((): string => {
    if (!lastUpdated.value) return ''
    const date = new Date(lastUpdated.value)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  })

  /**
   * Check if any data is loading
   */
  const isLoading = computed((): boolean => {
    return isSearching.value || isLoadingWeather.value || isRefreshing.value
  })

  // ============ Actions ============

  /**
   * Search for locations by query
   */
  async function searchLocations(query: string): Promise<void> {
    if (!query.trim()) {
      searchResults.value = []
      lastSearchQuery.value = ''
      searchError.value = null
      return
    }

    isSearching.value = true
    searchError.value = null
    lastSearchQuery.value = query

    try {
      const result = await weatherApi.searchLocations(query)

      if ('type' in result && 'message' in result) {
        // It's an error
        searchError.value = result
        searchResults.value = []
      } else {
        // It's results
        searchResults.value = result
        searchError.value = null
      }
    } catch (error) {
      searchError.value = handleError(error)
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }

  /**
   * Select a location and fetch weather data
   */
  async function selectLocation(location: LocationSearchResult): Promise<void> {
    currentLocation.value = {
      id: location.id,
      name: location.name,
      region: location.region,
      country: location.country,
      lat: location.lat,
      lon: location.lon,
    }

    // Clear search results
    searchResults.value = []
    searchError.value = null

    // Fetch weather for this location
    await fetchWeather(location.lat, location.lon)
  }

  /**
   * Fetch weather data for coordinates
   */
  async function fetchWeather(latitude: number, longitude: number): Promise<void> {
    isLoadingWeather.value = true
    weatherError.value = null

    try {
      const result = await weatherApi.getWeatherByCoordinates(latitude, longitude)

      if ('type' in result && 'message' in result) {
        // It's an error
        weatherError.value = result
        weatherData.value = {
          current: null,
          hourly: [],
          daily: [],
        }
      } else {
        // It's weather data
        weatherData.value = result
        lastUpdated.value = new Date().toISOString()
        weatherError.value = null
      }
    } catch (error) {
      weatherError.value = handleError(error)
      weatherData.value = {
        current: null,
        hourly: [],
        daily: [],
      }
    } finally {
      isLoadingWeather.value = false
    }
  }

  /**
   * Toggle temperature unit between Fahrenheit and Celsius
   */
  function toggleTemperatureUnit(): void {
    temperatureUnit.value =
      temperatureUnit.value === TemperatureUnitEnum.FAHRENHEIT
        ? TemperatureUnitEnum.CELSIUS
        : TemperatureUnitEnum.FAHRENHEIT
  }

  /**
   * Refresh weather data for current location
   */
  async function refreshWeather(): Promise<void> {
    if (!currentLocation.value || isRefreshing.value) {
      return
    }

    isRefreshing.value = true
    weatherError.value = null

    try {
      const result = await weatherApi.getWeatherByCoordinates(
        currentLocation.value.lat,
        currentLocation.value.lon,
      )

      if ('type' in result && 'message' in result) {
        // It's an error
        weatherError.value = result
      } else {
        // It's weather data
        weatherData.value = result
        lastUpdated.value = new Date().toISOString()
        weatherError.value = null
      }
    } catch (error) {
      weatherError.value = handleError(error)
    } finally {
      isRefreshing.value = false
    }
  }

  /**
   * Reset search state
   */
  function resetSearch(): void {
    searchResults.value = []
    lastSearchQuery.value = ''
    searchError.value = null
  }

  /**
   * Clear all data and errors
   */
  function reset(): void {
    weatherData.value = {
      current: null,
      hourly: [],
      daily: [],
    }
    currentLocation.value = null
    searchResults.value = []
    searchError.value = null
    weatherError.value = null
    lastUpdated.value = null
    currentLocationAttempted.value = false
  }

  /**
   * Try to detect user location via geolocation
   */
  async function tryDetectLocation(): Promise<boolean> {
    if (currentLocationAttempted.value) {
      return false
    }

    currentLocationAttempted.value = true

    try {
      const result = await geolocation.getLocation()

      if (result && result.success && result.coordinates) {
        // Fetch weather for detected location
        const location = {
          id: `${result.coordinates.latitude}:${result.coordinates.longitude}`,
          name: '', // Will be filled by API
          region: '',
          country: '',
          lat: result.coordinates.latitude,
          lon: result.coordinates.longitude,
        }

        currentLocation.value = location
        await fetchWeather(result.coordinates.latitude, result.coordinates.longitude)
        return true
      }
    } catch (error) {
      // Silently fail if geolocation throws an error
      console.debug('Geolocation detection failed:', error)
    }

    return false
  }

  // ============ Helper Functions ============

  /**
   * Convert wind speed based on temperature unit
   * km/h for Celsius, mph for Fahrenheit
   */
  function convertWindSpeed(kmh: number, unit: TemperatureUnit): number {
    if (unit === TemperatureUnitEnum.FAHRENHEIT) {
      return kmh * 0.621371 // km/h to mph
    }
    return kmh // keep in km/h for Celsius
  }

  // Return public API
  return {
    // State
    weatherData,
    currentLocation,
    temperatureUnit,
    isSearching,
    isLoadingWeather,
    isRefreshing,
    searchError,
    weatherError,
    searchResults,
    lastSearchQuery,
    lastUpdated,

    // Computed
    currentWeatherForDisplay,
    hourlyForecastForDisplay,
    dailyForecastForDisplay,
    formattedLastUpdated,
    isLoading,

    // Actions
    searchLocations,
    selectLocation,
    fetchWeather,
    toggleTemperatureUnit,
    refreshWeather,
    resetSearch,
    reset,
    tryDetectLocation,
  }
})
