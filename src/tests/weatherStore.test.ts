/**
 * Weather Store (Pinia) Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useWeatherStore } from '@/stores/weatherStore'
import { TemperatureUnit } from '@/types/weather'
import * as weatherApi from '@/services/weatherApi'
import * as geolocation from '@/services/geolocation'

vi.mock('@/services/weatherApi')
vi.mock('@/services/geolocation')

describe('weatherStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have default state', () => {
      const store = useWeatherStore()

      expect(store.weatherData).toEqual({
        current: null,
        hourly: [],
        daily: [],
      })
      expect(store.currentLocation).toBeNull()
      expect(store.temperatureUnit).toBe(TemperatureUnit.FAHRENHEIT)
      expect(store.isSearching).toBe(false)
      expect(store.isLoadingWeather).toBe(false)
      expect(store.isRefreshing).toBe(false)
      expect(store.searchError).toBeNull()
      expect(store.weatherError).toBeNull()
    })
  })

  describe('searchLocations', () => {
    it('should clear results for empty query', async () => {
      const store = useWeatherStore()
      store.searchResults = [
        { id: '1', name: 'Test', region: '', country: '', lat: 0, lon: 0 },
      ]

      await store.searchLocations('')

      expect(store.searchResults).toEqual([])
      expect(store.lastSearchQuery).toBe('')
      expect(store.searchError).toBeNull()
    })

    it('should search locations and update results', async () => {
      const mockResults = [
        { id: '1', name: 'New York', region: 'NY', country: 'USA', lat: 40, lon: -74 },
      ]
      ;(weatherApi.searchLocations as any).mockResolvedValueOnce(mockResults)

      const store = useWeatherStore()
      await store.searchLocations('New York')

      expect(store.isSearching).toBe(false)
      expect(store.searchResults).toEqual(mockResults)
      expect(store.lastSearchQuery).toBe('New York')
      expect(store.searchError).toBeNull()
    })

    it('should handle search errors', async () => {
      const mockError = { type: 'network', message: 'Error', suggestion: 'Retry', retryable: true }
      ;(weatherApi.searchLocations as any).mockResolvedValueOnce(mockError)

      const store = useWeatherStore()
      await store.searchLocations('Test')

      expect(store.searchError).toEqual(mockError)
      expect(store.searchResults).toEqual([])
    })
  })

  describe('selectLocation', () => {
    it('should set current location and fetch weather', async () => {
      const mockWeatherData = {
        current: {
          location: { id: '1', name: 'NY', region: '', country: '', lat: 40, lon: -74 },
          temperature: 15,
          condition: 'Cloudy',
          conditionIcon: 'cloud.png',
          humidity: 65,
          windSpeed: 10,
          lastUpdated: new Date().toISOString(),
        },
        hourly: [],
        daily: [],
      }
      ;(weatherApi.getWeatherByCoordinates as any).mockResolvedValueOnce(mockWeatherData)

      const store = useWeatherStore()
      const location = { id: '1', name: 'New York', region: 'NY', country: 'USA', lat: 40, lon: -74 }

      await store.selectLocation(location)

      expect(store.currentLocation).toEqual({
        id: '1',
        name: 'New York',
        region: 'NY',
        country: 'USA',
        lat: 40,
        lon: -74,
      })
      expect(store.searchResults).toEqual([])
      expect(store.searchError).toBeNull()
    })
  })

  describe('toggleTemperatureUnit', () => {
    it('should toggle from Fahrenheit to Celsius', () => {
      const store = useWeatherStore()
      expect(store.temperatureUnit).toBe(TemperatureUnit.FAHRENHEIT)

      store.toggleTemperatureUnit()

      expect(store.temperatureUnit).toBe(TemperatureUnit.CELSIUS)
    })

    it('should toggle from Celsius to Fahrenheit', () => {
      const store = useWeatherStore()
      store.temperatureUnit = TemperatureUnit.CELSIUS

      store.toggleTemperatureUnit()

      expect(store.temperatureUnit).toBe(TemperatureUnit.FAHRENHEIT)
    })
  })

  describe('computed properties', () => {
    it('should convert temperature on currentWeatherForDisplay', () => {
      const store = useWeatherStore()
      store.weatherData.current = {
        location: { id: '1', name: 'NY', region: '', country: '', lat: 40, lon: -74 },
        temperature: 0, // 0°C = 32°F
        condition: 'Cloudy',
        conditionIcon: 'cloud.png',
        humidity: 65,
        windSpeed: 0,
        lastUpdated: new Date().toISOString(),
      }

      // In Fahrenheit (default)
      expect(store.currentWeatherForDisplay?.temperature).toBe(32)

      // Switch to Celsius
      store.toggleTemperatureUnit()
      expect(store.currentWeatherForDisplay?.temperature).toBe(0)
    })

    it('should convert hourly temperatures', () => {
      const store = useWeatherStore()
      store.weatherData.hourly = [
        {
          time: '2:00 PM',
          temperature: 0, // 0°C = 32°F
          condition: 'Clear',
          conditionIcon: 'clear.png',
          windSpeed: 0,
          humidity: 50,
          precipitationChance: 0,
        },
      ]

      // In Fahrenheit (default)
      expect(store.hourlyForecastForDisplay[0].temperature).toBe(32)

      // Switch to Celsius
      store.toggleTemperatureUnit()
      expect(store.hourlyForecastForDisplay[0].temperature).toBe(0)
    })

    it('should convert daily temperatures', () => {
      const store = useWeatherStore()
      store.weatherData.daily = [
        {
          date: 'Mon, Dec 4',
          dayOfWeek: 'Monday',
          highTemperature: 10, // 10°C = 50°F
          lowTemperature: 0, // 0°C = 32°F
          condition: 'Cloudy',
          conditionIcon: 'cloud.png',
          precipitationChance: 20,
        },
      ]

      // In Fahrenheit (default)
      expect(store.dailyForecastForDisplay[0].highTemperature).toBe(50)
      expect(store.dailyForecastForDisplay[0].lowTemperature).toBe(32)

      // Switch to Celsius
      store.toggleTemperatureUnit()
      expect(store.dailyForecastForDisplay[0].highTemperature).toBe(10)
      expect(store.dailyForecastForDisplay[0].lowTemperature).toBe(0)
    })

    it('should format last updated timestamp', () => {
      const store = useWeatherStore()
      const now = new Date()
      store.lastUpdated = now.toISOString()

      const formatted = store.formattedLastUpdated
      expect(formatted).toContain(':')
      expect(formatted).toMatch(/\d{1,2}:\d{2}/)
    })

    it('should return empty string when lastUpdated is null', () => {
      const store = useWeatherStore()
      expect(store.formattedLastUpdated).toBe('')
    })

    it('should compute isLoading correctly', () => {
      const store = useWeatherStore()
      expect(store.isLoading).toBe(false)

      store.isSearching = true
      expect(store.isLoading).toBe(true)

      store.isSearching = false
      store.isLoadingWeather = true
      expect(store.isLoading).toBe(true)

      store.isLoadingWeather = false
      store.isRefreshing = true
      expect(store.isLoading).toBe(true)
    })
  })

  describe('refreshWeather', () => {
    it('should refresh weather data', async () => {
      const mockWeatherData = {
        current: {
          location: { id: '1', name: 'NY', region: '', country: '', lat: 40, lon: -74 },
          temperature: 20,
          condition: 'Clear',
          conditionIcon: 'clear.png',
          humidity: 50,
          windSpeed: 5,
          lastUpdated: new Date().toISOString(),
        },
        hourly: [],
        daily: [],
      }
      ;(weatherApi.getWeatherByCoordinates as any).mockResolvedValueOnce(mockWeatherData)

      const store = useWeatherStore()
      store.currentLocation = { id: '1', name: 'NY', region: '', country: '', lat: 40, lon: -74 }

      await store.refreshWeather()

      expect(store.isRefreshing).toBe(false)
      expect(store.weatherData).toEqual(mockWeatherData)
      expect(store.weatherError).toBeNull()
    })

    it('should not refresh without current location', async () => {
      const store = useWeatherStore()
      expect(store.currentLocation).toBeNull()

      await store.refreshWeather()

      expect(weatherApi.getWeatherByCoordinates).not.toHaveBeenCalled()
    })

    it('should not allow concurrent refreshes', async () => {
      const store = useWeatherStore()
      store.currentLocation = { id: '1', name: 'NY', region: '', country: '', lat: 40, lon: -74 }
      store.isRefreshing = true

      await store.refreshWeather()

      expect(weatherApi.getWeatherByCoordinates).not.toHaveBeenCalled()
    })
  })

  describe('resetSearch', () => {
    it('should clear search state', () => {
      const store = useWeatherStore()
      store.searchResults = [{ id: '1', name: 'Test', region: '', country: '', lat: 0, lon: 0 }]
      store.lastSearchQuery = 'test'
      store.searchError = { type: 'network', message: 'Error', suggestion: '', retryable: true }

      store.resetSearch()

      expect(store.searchResults).toEqual([])
      expect(store.lastSearchQuery).toBe('')
      expect(store.searchError).toBeNull()
    })
  })

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      const store = useWeatherStore()
      store.weatherData = {
        current: {
          location: { id: '1', name: 'NY', region: '', country: '', lat: 40, lon: -74 },
          temperature: 15,
          condition: 'Cloudy',
          conditionIcon: 'cloud.png',
          humidity: 65,
          windSpeed: 10,
          lastUpdated: new Date().toISOString(),
        },
        hourly: [],
        daily: [],
      }
      store.currentLocation = { id: '1', name: 'NY', region: '', country: '', lat: 40, lon: -74 }
      store.lastUpdated = new Date().toISOString()

      store.reset()

      expect(store.weatherData).toEqual({ current: null, hourly: [], daily: [] })
      expect(store.currentLocation).toBeNull()
      expect(store.lastUpdated).toBeNull()
    })
  })

  describe('tryDetectLocation', () => {
    it('should attempt geolocation on first call', async () => {
      ;(geolocation.getLocation as any).mockResolvedValueOnce({
        success: true,
        coordinates: { latitude: 40, longitude: -74, accuracy: 10 },
      })
      ;(weatherApi.getWeatherByCoordinates as any).mockResolvedValueOnce({
        current: null,
        hourly: [],
        daily: [],
      })

      const store = useWeatherStore()
      const result = await store.tryDetectLocation()

      expect(result).toBe(true)
      expect(geolocation.getLocation).toHaveBeenCalled()
    })

    it('should not attempt geolocation twice', async () => {
      ;(geolocation.getLocation as any).mockResolvedValueOnce({
        success: false,
      })

      const store = useWeatherStore()
      await store.tryDetectLocation()
      await store.tryDetectLocation()

      expect(geolocation.getLocation).toHaveBeenCalledTimes(1)
    })

    it('should return false on geolocation failure', async () => {
      ;(geolocation.getLocation as any).mockResolvedValueOnce({
        success: false,
        error: 'denied',
      })

      const store = useWeatherStore()
      const result = await store.tryDetectLocation()

      expect(result).toBe(false)
    })
  })
})
