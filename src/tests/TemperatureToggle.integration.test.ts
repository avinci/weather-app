/**
 * Temperature Toggle Integration Tests (Phase 8)
 *
 * Tests for verifying temperature toggle works across all sections:
 * - Current weather display
 * - Hourly forecast display
 * - Daily forecast display
 * - New location searches respect selected unit
 * - Edge cases (fractional temps, zero, negative, wind speeds)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useWeatherStore } from '@/stores/weatherStore'
import { TemperatureUnit } from '@/types/weather'
import * as weatherApi from '@/services/weatherApi'

vi.mock('@/services/weatherApi')

describe('TemperatureToggle Integration Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('Toggle across all display sections', () => {
    it('should update all temperatures when toggling from °F to °C', async () => {
      const mockWeatherData = {
        current: {
          location: { id: '1', name: 'NY', region: 'NY', country: 'USA', lat: 40, lon: -74 },
          temperature: 0,
          condition: 'Clear',
          conditionIcon: 'clear.png',
          humidity: 50,
          windSpeed: 16.1,
          lastUpdated: new Date().toISOString(),
        },
        hourly: [
          {
            time: '2:00 PM',
            temperature: 5,
            condition: 'Cloudy',
            conditionIcon: 'cloud.png',
            windSpeed: 16.1,
            humidity: 60,
            precipitationChance: 10,
          },
          {
            time: '3:00 PM',
            temperature: 10,
            condition: 'Cloudy',
            conditionIcon: 'cloud.png',
            windSpeed: 24.14,
            humidity: 65,
            precipitationChance: 20,
          },
        ],
        daily: [
          {
            date: 'Mon, Dec 4',
            dayOfWeek: 'Monday',
            highTemperature: 10,
            lowTemperature: 0,
            condition: 'Cloudy',
            conditionIcon: 'cloud.png',
            precipitationChance: 20,
          },
          {
            date: 'Tue, Dec 5',
            dayOfWeek: 'Tuesday',
            highTemperature: 15,
            lowTemperature: 5,
            condition: 'Clear',
            conditionIcon: 'clear.png',
            precipitationChance: 0,
          },
        ],
      }
      ;(weatherApi.getWeatherByCoordinates as any).mockResolvedValueOnce(mockWeatherData)

      const store = useWeatherStore()
      const location = {
        id: '1',
        name: 'New York',
        region: 'NY',
        country: 'USA',
        lat: 40,
        lon: -74,
      }

      await store.selectLocation(location)

      expect(store.temperatureUnit).toBe(TemperatureUnit.FAHRENHEIT)
      expect(store.currentWeatherForDisplay?.temperature).toBe(32)
      expect(store.hourlyForecastForDisplay[0].temperature).toBe(41)
      expect(store.dailyForecastForDisplay[0].highTemperature).toBe(50)
      expect(store.dailyForecastForDisplay[0].lowTemperature).toBe(32)

      store.toggleTemperatureUnit()

      expect(store.temperatureUnit).toBe(TemperatureUnit.CELSIUS)
      expect(store.currentWeatherForDisplay?.temperature).toBe(0)
      expect(store.hourlyForecastForDisplay[0].temperature).toBe(5)
      expect(store.hourlyForecastForDisplay[1].temperature).toBe(10)
      expect(store.dailyForecastForDisplay[0].highTemperature).toBe(10)
      expect(store.dailyForecastForDisplay[0].lowTemperature).toBe(0)
      expect(store.dailyForecastForDisplay[1].highTemperature).toBe(15)
      expect(store.dailyForecastForDisplay[1].lowTemperature).toBe(5)
    })

    it('should update all temperatures when toggling from °C to °F', async () => {
      const mockWeatherData = {
        current: {
          location: { id: '1', name: 'NY', region: 'NY', country: 'USA', lat: 40, lon: -74 },
          temperature: 20,
          condition: 'Clear',
          conditionIcon: 'clear.png',
          humidity: 50,
          windSpeed: 16.1,
          lastUpdated: new Date().toISOString(),
        },
        hourly: [
          {
            time: '2:00 PM',
            temperature: 15,
            condition: 'Cloudy',
            conditionIcon: 'cloud.png',
            windSpeed: 8.05,
            humidity: 60,
            precipitationChance: 10,
          },
        ],
        daily: [
          {
            date: 'Mon, Dec 4',
            dayOfWeek: 'Monday',
            highTemperature: 25,
            lowTemperature: 15,
            condition: 'Cloudy',
            conditionIcon: 'cloud.png',
            precipitationChance: 20,
          },
        ],
      }
      ;(weatherApi.getWeatherByCoordinates as any).mockResolvedValueOnce(mockWeatherData)

      const store = useWeatherStore()
      store.temperatureUnit = TemperatureUnit.CELSIUS

      const location = {
        id: '1',
        name: 'New York',
        region: 'NY',
        country: 'USA',
        lat: 40,
        lon: -74,
      }
      await store.selectLocation(location)

      expect(store.temperatureUnit).toBe(TemperatureUnit.CELSIUS)
      expect(store.currentWeatherForDisplay?.temperature).toBe(20)
      expect(store.hourlyForecastForDisplay[0].temperature).toBe(15)
      expect(store.dailyForecastForDisplay[0].highTemperature).toBe(25)

      store.toggleTemperatureUnit()

      expect(store.temperatureUnit).toBe(TemperatureUnit.FAHRENHEIT)
      expect(store.currentWeatherForDisplay?.temperature).toBe(68)
      expect(store.hourlyForecastForDisplay[0].temperature).toBe(59)
      expect(store.dailyForecastForDisplay[0].highTemperature).toBe(77)
      expect(store.dailyForecastForDisplay[0].lowTemperature).toBe(59)
    })
  })

  describe('New location searches respect selected unit', () => {
    it('should display new location data in selected unit (Celsius)', async () => {
      const mockWeatherData = {
        current: {
          location: {
            id: '1',
            name: 'Paris',
            region: '',
            country: 'France',
            lat: 48.85,
            lon: 2.35,
          },
          temperature: 5,
          condition: 'Rainy',
          conditionIcon: 'rain.png',
          humidity: 80,
          windSpeed: 16.1,
          lastUpdated: new Date().toISOString(),
        },
        hourly: [],
        daily: [],
      }
      ;(weatherApi.getWeatherByCoordinates as any).mockResolvedValueOnce(mockWeatherData)

      const store = useWeatherStore()
      store.toggleTemperatureUnit()
      expect(store.temperatureUnit).toBe(TemperatureUnit.CELSIUS)

      const location = {
        id: '1',
        name: 'Paris',
        region: '',
        country: 'France',
        lat: 48.85,
        lon: 2.35,
      }
      await store.selectLocation(location)

      expect(store.currentWeatherForDisplay?.temperature).toBe(5)
    })

    it('should display new location data in selected unit (Fahrenheit)', async () => {
      const mockWeatherData = {
        current: {
          location: { id: '2', name: 'London', region: '', country: 'UK', lat: 51.51, lon: -0.13 },
          temperature: 10,
          condition: 'Cloudy',
          conditionIcon: 'cloud.png',
          humidity: 70,
          windSpeed: 16.1,
          lastUpdated: new Date().toISOString(),
        },
        hourly: [],
        daily: [],
      }
      ;(weatherApi.getWeatherByCoordinates as any).mockResolvedValueOnce(mockWeatherData)

      const store = useWeatherStore()
      expect(store.temperatureUnit).toBe(TemperatureUnit.FAHRENHEIT)

      const location = {
        id: '2',
        name: 'London',
        region: '',
        country: 'UK',
        lat: 51.51,
        lon: -0.13,
      }
      await store.selectLocation(location)

      expect(store.currentWeatherForDisplay?.temperature).toBe(50)
    })
  })

  describe('Rapid toggle succession', () => {
    it('should sync all updates correctly with rapid toggles', async () => {
      const mockWeatherData = {
        current: {
          location: { id: '1', name: 'NY', region: 'NY', country: 'USA', lat: 40, lon: -74 },
          temperature: 0,
          condition: 'Clear',
          conditionIcon: 'clear.png',
          humidity: 50,
          windSpeed: 16.1,
          lastUpdated: new Date().toISOString(),
        },
        hourly: [
          {
            time: '2:00 PM',
            temperature: 5,
            condition: 'Cloudy',
            conditionIcon: 'cloud.png',
            windSpeed: 16.1,
            humidity: 60,
            precipitationChance: 10,
          },
        ],
        daily: [
          {
            date: 'Mon, Dec 4',
            dayOfWeek: 'Monday',
            highTemperature: 10,
            lowTemperature: 0,
            condition: 'Cloudy',
            conditionIcon: 'cloud.png',
            precipitationChance: 20,
          },
        ],
      }
      ;(weatherApi.getWeatherByCoordinates as any).mockResolvedValueOnce(mockWeatherData)

      const store = useWeatherStore()
      const location = {
        id: '1',
        name: 'New York',
        region: 'NY',
        country: 'USA',
        lat: 40,
        lon: -74,
      }
      await store.selectLocation(location)

      store.toggleTemperatureUnit()
      expect(store.currentWeatherForDisplay?.temperature).toBe(0)
      expect(store.hourlyForecastForDisplay[0].temperature).toBe(5)

      store.toggleTemperatureUnit()
      expect(store.currentWeatherForDisplay?.temperature).toBe(32)
      expect(store.hourlyForecastForDisplay[0].temperature).toBe(41)

      store.toggleTemperatureUnit()
      expect(store.currentWeatherForDisplay?.temperature).toBe(0)
      expect(store.dailyForecastForDisplay[0].highTemperature).toBe(10)

      store.toggleTemperatureUnit()
      expect(store.currentWeatherForDisplay?.temperature).toBe(32)
      expect(store.dailyForecastForDisplay[0].highTemperature).toBe(50)
    })
  })

  describe('Edge cases', () => {
    it('should handle fractional temperatures correctly', async () => {
      const mockWeatherData = {
        current: {
          location: { id: '1', name: 'NY', region: 'NY', country: 'USA', lat: 40, lon: -74 },
          temperature: 22.5,
          condition: 'Clear',
          conditionIcon: 'clear.png',
          humidity: 50,
          windSpeed: 16.1,
          lastUpdated: new Date().toISOString(),
        },
        hourly: [
          {
            time: '2:00 PM',
            temperature: -5.5,
            condition: 'Cloudy',
            conditionIcon: 'cloud.png',
            windSpeed: 16.1,
            humidity: 60,
            precipitationChance: 10,
          },
        ],
        daily: [
          {
            date: 'Mon, Dec 4',
            dayOfWeek: 'Monday',
            highTemperature: 18.3,
            lowTemperature: 10.7,
            condition: 'Cloudy',
            conditionIcon: 'cloud.png',
            precipitationChance: 20,
          },
        ],
      }
      ;(weatherApi.getWeatherByCoordinates as any).mockResolvedValueOnce(mockWeatherData)

      const store = useWeatherStore()
      const location = {
        id: '1',
        name: 'New York',
        region: 'NY',
        country: 'USA',
        lat: 40,
        lon: -74,
      }
      await store.selectLocation(location)

      expect(store.currentWeatherForDisplay?.temperature).toBe(72.5)
      expect(store.hourlyForecastForDisplay[0].temperature).toBeCloseTo(22.1, 0)
      expect(store.dailyForecastForDisplay[0].highTemperature).toBeCloseTo(64.94, 0)

      store.toggleTemperatureUnit()
      expect(store.currentWeatherForDisplay?.temperature).toBe(22.5)
      expect(store.hourlyForecastForDisplay[0].temperature).toBe(-5.5)
      expect(store.dailyForecastForDisplay[0].highTemperature).toBe(18.3)
    })

    it('should handle zero temperature correctly', async () => {
      const mockWeatherData = {
        current: {
          location: { id: '1', name: 'NY', region: 'NY', country: 'USA', lat: 40, lon: -74 },
          temperature: 0,
          condition: 'Snow',
          conditionIcon: 'snow.png',
          humidity: 80,
          windSpeed: 16.1,
          lastUpdated: new Date().toISOString(),
        },
        hourly: [],
        daily: [],
      }
      ;(weatherApi.getWeatherByCoordinates as any).mockResolvedValueOnce(mockWeatherData)

      const store = useWeatherStore()
      const location = {
        id: '1',
        name: 'New York',
        region: 'NY',
        country: 'USA',
        lat: 40,
        lon: -74,
      }
      await store.selectLocation(location)

      expect(store.currentWeatherForDisplay?.temperature).toBe(32)

      store.toggleTemperatureUnit()
      expect(store.currentWeatherForDisplay?.temperature).toBe(0)
    })

    it('should handle negative temperatures correctly', async () => {
      const mockWeatherData = {
        current: {
          location: {
            id: '1',
            name: 'Montreal',
            region: '',
            country: 'Canada',
            lat: 45.5,
            lon: -73.5,
          },
          temperature: -20,
          condition: 'Clear',
          conditionIcon: 'clear.png',
          humidity: 30,
          windSpeed: 16.1,
          lastUpdated: new Date().toISOString(),
        },
        hourly: [
          {
            time: '2:00 PM',
            temperature: -15,
            condition: 'Clear',
            conditionIcon: 'clear.png',
            windSpeed: 16.1,
            humidity: 35,
            precipitationChance: 0,
          },
        ],
        daily: [
          {
            date: 'Mon, Dec 4',
            dayOfWeek: 'Monday',
            highTemperature: -10,
            lowTemperature: -25,
            condition: 'Clear',
            conditionIcon: 'clear.png',
            precipitationChance: 0,
          },
        ],
      }
      ;(weatherApi.getWeatherByCoordinates as any).mockResolvedValueOnce(mockWeatherData)

      const store = useWeatherStore()
      const location = {
        id: '1',
        name: 'Montreal',
        region: '',
        country: 'Canada',
        lat: 45.5,
        lon: -73.5,
      }
      await store.selectLocation(location)

      expect(store.currentWeatherForDisplay?.temperature).toBe(-4)
      expect(store.hourlyForecastForDisplay[0].temperature).toBe(5)
      expect(store.dailyForecastForDisplay[0].highTemperature).toBe(14)
      expect(store.dailyForecastForDisplay[0].lowTemperature).toBe(-13)

      store.toggleTemperatureUnit()
      expect(store.currentWeatherForDisplay?.temperature).toBe(-20)
      expect(store.hourlyForecastForDisplay[0].temperature).toBe(-15)
      expect(store.dailyForecastForDisplay[0].highTemperature).toBe(-10)
      expect(store.dailyForecastForDisplay[0].lowTemperature).toBe(-25)
    })

    it('should handle wind speed conversions correctly', async () => {
      const mockWeatherData = {
        current: {
          location: { id: '1', name: 'NY', region: 'NY', country: 'USA', lat: 40, lon: -74 },
          temperature: 20,
          condition: 'Windy',
          conditionIcon: 'wind.png',
          humidity: 50,
          windSpeed: 32.19,
          lastUpdated: new Date().toISOString(),
        },
        hourly: [
          {
            time: '2:00 PM',
            temperature: 15,
            condition: 'Windy',
            conditionIcon: 'wind.png',
            windSpeed: 40.23,
            humidity: 60,
            precipitationChance: 10,
          },
        ],
        daily: [],
      }
      ;(weatherApi.getWeatherByCoordinates as any).mockResolvedValueOnce(mockWeatherData)

      const store = useWeatherStore()
      const location = {
        id: '1',
        name: 'New York',
        region: 'NY',
        country: 'USA',
        lat: 40,
        lon: -74,
      }
      await store.selectLocation(location)

      expect(store.currentWeatherForDisplay?.windSpeed).toBeCloseTo(20, 1)
      expect(store.hourlyForecastForDisplay[0].windSpeed).toBeCloseTo(25, 1)

      store.toggleTemperatureUnit()
      expect(store.currentWeatherForDisplay?.windSpeed).toBe(32.19)
      expect(store.hourlyForecastForDisplay[0].windSpeed).toBe(40.23)
    })
  })

  describe('Temperature unit default behavior', () => {
    it('should default to Fahrenheit on fresh app load', () => {
      const store = useWeatherStore()
      expect(store.temperatureUnit).toBe(TemperatureUnit.FAHRENHEIT)
    })

    it('should not remember unit preference across new store instances', () => {
      const store1 = useWeatherStore()
      store1.toggleTemperatureUnit()
      expect(store1.temperatureUnit).toBe(TemperatureUnit.CELSIUS)

      setActivePinia(createPinia())
      const store2 = useWeatherStore()

      expect(store2.temperatureUnit).toBe(TemperatureUnit.FAHRENHEIT)
    })
  })

  describe('Hourly forecast wind speed conversion across toggle', () => {
    it('should convert wind speeds for all hourly entries when toggling', async () => {
      const mockWeatherData = {
        current: {
          location: { id: '1', name: 'NY', region: 'NY', country: 'USA', lat: 40, lon: -74 },
          temperature: 20,
          condition: 'Clear',
          conditionIcon: 'clear.png',
          humidity: 50,
          windSpeed: 16.1,
          lastUpdated: new Date().toISOString(),
        },
        hourly: [
          {
            time: '2:00 PM',
            temperature: 15,
            condition: 'Clear',
            conditionIcon: 'clear.png',
            windSpeed: 8.05,
            humidity: 55,
            precipitationChance: 5,
          },
          {
            time: '3:00 PM',
            temperature: 18,
            condition: 'Cloudy',
            conditionIcon: 'cloud.png',
            windSpeed: 24.14,
            humidity: 60,
            precipitationChance: 10,
          },
          {
            time: '4:00 PM',
            temperature: 16,
            condition: 'Cloudy',
            conditionIcon: 'cloud.png',
            windSpeed: 40.23,
            humidity: 65,
            precipitationChance: 20,
          },
        ],
        daily: [],
      }
      ;(weatherApi.getWeatherByCoordinates as any).mockResolvedValueOnce(mockWeatherData)

      const store = useWeatherStore()
      const location = {
        id: '1',
        name: 'New York',
        region: 'NY',
        country: 'USA',
        lat: 40,
        lon: -74,
      }
      await store.selectLocation(location)

      expect(store.hourlyForecastForDisplay[0].windSpeed).toBeCloseTo(5, 1)
      expect(store.hourlyForecastForDisplay[1].windSpeed).toBeCloseTo(15, 1)
      expect(store.hourlyForecastForDisplay[2].windSpeed).toBeCloseTo(25, 1)

      store.toggleTemperatureUnit()

      expect(store.hourlyForecastForDisplay[0].windSpeed).toBe(8.05)
      expect(store.hourlyForecastForDisplay[1].windSpeed).toBe(24.14)
      expect(store.hourlyForecastForDisplay[2].windSpeed).toBe(40.23)
    })
  })
})
