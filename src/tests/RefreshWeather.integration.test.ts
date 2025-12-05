/**
 * RefreshWeather Integration Tests (AVI-61)
 * Tests the complete refresh flow including button, store actions, and UI updates
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import App from '@/App.vue'
import RefreshButton from '@/components/RefreshButton.vue'
import { useWeatherStore } from '@/stores/weatherStore'
import * as weatherApi from '@/services/weatherApi'
import * as geolocation from '@/services/geolocation'

vi.mock('@/services/geolocation')
vi.mock('@/services/weatherApi')

describe('RefreshWeather Integration (AVI-61)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('RefreshButton disabled/enabled states', () => {
    it('should be disabled before initial data load', () => {
      const wrapper = mount(RefreshButton)

      const button = wrapper.find('.refresh-button')
      expect(button.attributes('disabled')).not.toBeNull()
    })

    it('should be enabled after initial data load', async () => {
      const store = useWeatherStore()
      store.weatherData.current = {
        location: {
          id: '1',
          name: 'Test City',
          region: 'TC',
          country: 'Test Country',
          lat: 40.7128,
          lon: -74.006,
        },
        temperature: 70,
        condition: 'Sunny',
        conditionIcon: 'sunny.png',
        humidity: 50,
        windSpeed: 10,
        lastUpdated: new Date().toISOString(),
      }

      const wrapper = mount(RefreshButton)
      await flushPromises()

      const button = wrapper.find('.refresh-button')
      expect(button.attributes('disabled')).toBeUndefined()
    })
  })

  describe('Refresh button visual feedback', () => {
    it('should show refresh icon when not refreshing', async () => {
      const store = useWeatherStore()
      store.weatherData.current = {
        location: {
          id: '1',
          name: 'Test City',
          region: 'TC',
          country: 'Test Country',
          lat: 40.7128,
          lon: -74.006,
        },
        temperature: 70,
        condition: 'Sunny',
        conditionIcon: 'sunny.png',
        humidity: 50,
        windSpeed: 10,
        lastUpdated: new Date().toISOString(),
      }

      const wrapper = mount(RefreshButton)
      await flushPromises()

      expect(wrapper.find('.icon').exists()).toBe(true)
      expect(wrapper.find('.spinner').exists()).toBe(false)
      expect(wrapper.text()).toContain('Refresh')
    })

    it('should show spinner while refreshing', async () => {
      const store = useWeatherStore()
      store.weatherData.current = {
        location: {
          id: '1',
          name: 'Test City',
          region: 'TC',
          country: 'Test Country',
          lat: 40.7128,
          lon: -74.006,
        },
        temperature: 70,
        condition: 'Sunny',
        conditionIcon: 'sunny.png',
        humidity: 50,
        windSpeed: 10,
        lastUpdated: new Date().toISOString(),
      }
      store.isRefreshing = true

      const wrapper = mount(RefreshButton)
      await flushPromises()

      expect(wrapper.find('.spinner').exists()).toBe(true)
      expect(wrapper.find('.icon').exists()).toBe(false)
      expect(wrapper.text()).toContain('Refreshing...')
    })

    it('should be disabled while refreshing', async () => {
      const store = useWeatherStore()
      store.weatherData.current = {
        location: {
          id: '1',
          name: 'Test City',
          region: 'TC',
          country: 'Test Country',
          lat: 40.7128,
          lon: -74.006,
        },
        temperature: 70,
        condition: 'Sunny',
        conditionIcon: 'sunny.png',
        humidity: 50,
        windSpeed: 10,
        lastUpdated: new Date().toISOString(),
      }
      store.isRefreshing = true

      const wrapper = mount(RefreshButton)
      await flushPromises()

      const button = wrapper.find('.refresh-button')
      expect(button.attributes('disabled')).not.toBeNull()
    })
  })

  describe('Refresh functionality', () => {
    it('should call refreshWeather action when clicked', async () => {
      const store = useWeatherStore()
      store.weatherData.current = {
        location: {
          id: '1',
          name: 'Test City',
          region: 'TC',
          country: 'Test Country',
          lat: 40.7128,
          lon: -74.006,
        },
        temperature: 70,
        condition: 'Sunny',
        conditionIcon: 'sunny.png',
        humidity: 50,
        windSpeed: 10,
        lastUpdated: new Date().toISOString(),
      }
      store.currentLocation = {
        id: '1',
        name: 'Test City',
        region: 'TC',
        country: 'Test Country',
        lat: 40.7128,
        lon: -74.006,
      }

      const refreshSpy = vi.spyOn(store, 'refreshWeather')

      const wrapper = mount(RefreshButton)
      await flushPromises()

      const button = wrapper.find('.refresh-button')
      await button.trigger('click')

      expect(refreshSpy).toHaveBeenCalled()
    })

    it('should prevent duplicate refresh requests (AC4)', async () => {
      const store = useWeatherStore()
      const mockWeatherData = {
        current: {
          location: {
            id: '1',
            name: 'Test City',
            region: 'TC',
            country: 'Test Country',
            lat: 40.7128,
            lon: -74.006,
          },
          temperature: 70,
          condition: 'Sunny',
          conditionIcon: 'sunny.png',
          humidity: 50,
          windSpeed: 10,
          lastUpdated: new Date().toISOString(),
        },
        hourly: [],
        daily: [],
      }

      store.weatherData.current = mockWeatherData.current
      store.currentLocation = {
        id: '1',
        name: 'Test City',
        region: 'TC',
        country: 'Test Country',
        lat: 40.7128,
        lon: -74.006,
      }
      ;(weatherApi.getWeatherByCoordinates as any).mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockWeatherData), 100)
          })
      )

      const wrapper = mount(RefreshButton)
      await flushPromises()

      const button = wrapper.find('.refresh-button')

      // Click refresh to start loading
      await button.trigger('click')
      expect(store.isRefreshing).toBe(true)

      // Try clicking again while refreshing (should be disabled)
      const disabledAttempt = wrapper.find('.refresh-button').attributes('disabled')
      expect(disabledAttempt).not.toBeUndefined()

      // Wait for refresh to complete
      await flushPromises()
      await new Promise((resolve) => setTimeout(resolve, 150))

      expect(store.isRefreshing).toBe(false)
    })
  })

  describe('Last Updated timestamp', () => {
    it('should display last updated timestamp after refresh', async () => {
      const store = useWeatherStore()
      const mockWeatherData = {
        current: {
          location: {
            id: '1',
            name: 'Test City',
            region: 'TC',
            country: 'Test Country',
            lat: 40.7128,
            lon: -74.006,
          },
          temperature: 70,
          condition: 'Sunny',
          conditionIcon: 'sunny.png',
          humidity: 50,
          windSpeed: 10,
          lastUpdated: new Date().toISOString(),
        },
        hourly: [],
        daily: [],
      }

      ;(geolocation.getLocation as any).mockResolvedValueOnce({
        success: true,
        coordinates: { latitude: 40.7128, longitude: -74.006, accuracy: 10 },
      })
      ;(weatherApi.getWeatherByCoordinates as any).mockResolvedValueOnce(mockWeatherData)

      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
          stubs: {
            LocationSearch: { template: '<div class="location-search">Search</div>' },
            ErrorMessage: { template: '<div class="error-message"></div>' },
          },
        },
      })

      await flushPromises()

      // Check that last updated is displayed
      const text = wrapper.text()
      expect(text).toContain('Last updated')
    })

    it('should update timestamp when refresh completes', async () => {
      const store = useWeatherStore()
      const initialTime = new Date('2025-01-01T00:00:00.000Z')
      const mockWeatherData = {
        current: {
          location: {
            id: '1',
            name: 'Test City',
            region: 'TC',
            country: 'Test Country',
            lat: 40.7128,
            lon: -74.006,
          },
          temperature: 70,
          condition: 'Sunny',
          conditionIcon: 'sunny.png',
          humidity: 50,
          windSpeed: 10,
          lastUpdated: new Date().toISOString(),
        },
        hourly: [],
        daily: [],
      }

      store.weatherData.current = mockWeatherData.current
      store.currentLocation = {
        id: '1',
        name: 'Test City',
        region: 'TC',
        country: 'Test Country',
        lat: 40.7128,
        lon: -74.006,
      }
      store.lastUpdated = initialTime.toISOString()
      ;(weatherApi.getWeatherByCoordinates as any).mockResolvedValueOnce(mockWeatherData)

      // Refresh the weather
      await store.refreshWeather()

      // Verify lastUpdated was updated
      expect(store.lastUpdated).not.toBe(initialTime.toISOString())
      expect(store.formattedLastUpdated).toBeTruthy()

      // Verify the timestamp is recent (after initial time)
      const updatedTime = new Date(store.lastUpdated as string)
      const timeDiff = updatedTime.getTime() - initialTime.getTime()
      expect(timeDiff).toBeGreaterThan(0)
    })
  })

  describe('Data updates on refresh', () => {
    it('should update all forecast sections on successful refresh', async () => {
      const store = useWeatherStore()

      const oldWeatherData = {
        current: {
          location: {
            id: '1',
            name: 'Test City',
            region: 'TC',
            country: 'Test Country',
            lat: 40.7128,
            lon: -74.006,
          },
          temperature: 70,
          condition: 'Sunny',
          conditionIcon: 'sunny.png',
          humidity: 50,
          windSpeed: 10,
          lastUpdated: new Date().toISOString(),
        },
        hourly: [
          {
            time: '12:00 PM',
            temperature: 72,
            condition: 'Sunny',
            conditionIcon: 'sunny.png',
            windSpeed: 8,
          },
        ],
        daily: [
          {
            date: '2025-01-01',
            highTemperature: 75,
            lowTemperature: 60,
            condition: 'Sunny',
            conditionIcon: 'sunny.png',
          },
        ],
      }

      const newWeatherData = {
        current: {
          location: {
            id: '1',
            name: 'Test City',
            region: 'TC',
            country: 'Test Country',
            lat: 40.7128,
            lon: -74.006,
          },
          temperature: 75, // Updated
          condition: 'Cloudy', // Updated
          conditionIcon: 'cloudy.png',
          humidity: 65, // Updated
          windSpeed: 12, // Updated
          lastUpdated: new Date().toISOString(),
        },
        hourly: [
          {
            time: '12:00 PM',
            temperature: 76, // Updated
            condition: 'Cloudy', // Updated
            conditionIcon: 'cloudy.png',
            windSpeed: 10, // Updated
          },
        ],
        daily: [
          {
            date: '2025-01-01',
            highTemperature: 80, // Updated
            lowTemperature: 62, // Updated
            condition: 'Cloudy', // Updated
            conditionIcon: 'cloudy.png',
          },
        ],
      }

      store.weatherData = oldWeatherData
      store.currentLocation = {
        id: '1',
        name: 'Test City',
        region: 'TC',
        country: 'Test Country',
        lat: 40.7128,
        lon: -74.006,
      }
      ;(weatherApi.getWeatherByCoordinates as any).mockResolvedValueOnce(newWeatherData)

      // Verify old data
      expect(store.weatherData.current?.temperature).toBe(70)
      expect(store.weatherData.current?.condition).toBe('Sunny')

      // Refresh
      await store.refreshWeather()

      // Verify data was updated
      expect(store.weatherData.current?.temperature).toBe(75)
      expect(store.weatherData.current?.condition).toBe('Cloudy')
      expect(store.weatherData.current?.humidity).toBe(65)
      expect(store.weatherData.hourly[0].temperature).toBe(76)
      expect(store.weatherData.hourly[0].condition).toBe('Cloudy')
      expect(store.weatherData.daily[0].highTemperature).toBe(80)
    })
  })

  describe('Error handling', () => {
    it('should handle refresh errors and maintain previous data', async () => {
      const store = useWeatherStore()
      const oldWeatherData = {
        current: {
          location: {
            id: '1',
            name: 'Test City',
            region: 'TC',
            country: 'Test Country',
            lat: 40.7128,
            lon: -74.006,
          },
          temperature: 70,
          condition: 'Sunny',
          conditionIcon: 'sunny.png',
          humidity: 50,
          windSpeed: 10,
          lastUpdated: new Date().toISOString(),
        },
        hourly: [],
        daily: [],
      }

      store.weatherData = oldWeatherData
      store.currentLocation = {
        id: '1',
        name: 'Test City',
        region: 'TC',
        country: 'Test Country',
        lat: 40.7128,
        lon: -74.006,
      }

      const errorMessage = {
        type: 'API_ERROR',
        message: 'Failed to fetch weather data',
      }

      ;(weatherApi.getWeatherByCoordinates as any).mockResolvedValueOnce(errorMessage)

      // Refresh
      await store.refreshWeather()

      // Verify error was set
      expect(store.weatherError).toEqual(errorMessage)

      // Verify data was NOT cleared (AC in issue: "error: sets weatherError, maintains previous data")
      expect(store.weatherData.current).toEqual(oldWeatherData.current)
    })

    it('should allow retry after error', async () => {
      const store = useWeatherStore()
      const mockWeatherData = {
        current: {
          location: {
            id: '1',
            name: 'Test City',
            region: 'TC',
            country: 'Test Country',
            lat: 40.7128,
            lon: -74.006,
          },
          temperature: 70,
          condition: 'Sunny',
          conditionIcon: 'sunny.png',
          humidity: 50,
          windSpeed: 10,
          lastUpdated: new Date().toISOString(),
        },
        hourly: [],
        daily: [],
      }

      store.weatherData.current = mockWeatherData.current
      store.currentLocation = {
        id: '1',
        name: 'Test City',
        region: 'TC',
        country: 'Test Country',
        lat: 40.7128,
        lon: -74.006,
      }

      // First call fails
      const errorMessage = {
        type: 'API_ERROR',
        message: 'Failed to fetch',
      }
      ;(weatherApi.getWeatherByCoordinates as any).mockResolvedValueOnce(errorMessage)

      await store.refreshWeather()
      expect(store.weatherError).toBeTruthy()

      // Second call succeeds
      ;(weatherApi.getWeatherByCoordinates as any).mockResolvedValueOnce(mockWeatherData)

      await store.refreshWeather()
      expect(store.weatherError).toBeNull()
      expect(store.weatherData.current?.temperature).toBe(70)
    })
  })

  describe('Integration with App (full flow)', () => {
    it('should load weather, enable refresh, and update data on refresh', async () => {
      const mockWeatherData = {
        current: {
          location: {
            id: '1',
            name: 'New York',
            region: 'NY',
            country: 'USA',
            lat: 40.7128,
            lon: -74.006,
          },
          temperature: 70,
          condition: 'Sunny',
          conditionIcon: 'sunny.png',
          humidity: 50,
          windSpeed: 10,
          lastUpdated: new Date().toISOString(),
        },
        hourly: [],
        daily: [],
      }

      const updatedWeatherData = {
        current: {
          location: {
            id: '1',
            name: 'New York',
            region: 'NY',
            country: 'USA',
            lat: 40.7128,
            lon: -74.006,
          },
          temperature: 72,
          condition: 'Cloudy',
          conditionIcon: 'cloudy.png',
          humidity: 65,
          windSpeed: 12,
          lastUpdated: new Date().toISOString(),
        },
        hourly: [],
        daily: [],
      }

      ;(geolocation.getLocation as any).mockResolvedValueOnce({
        success: true,
        coordinates: { latitude: 40.7128, longitude: -74.006, accuracy: 10 },
      })
      ;(weatherApi.getWeatherByCoordinates as any)
        .mockResolvedValueOnce(mockWeatherData)
        .mockResolvedValueOnce(updatedWeatherData)

      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
          stubs: {
            LocationSearch: { template: '<div class="location-search">Search</div>' },
            ErrorMessage: { template: '<div class="error-message"></div>' },
          },
        },
      })

      await flushPromises()

      // Verify initial load
      let text = wrapper.text()
      expect(text).toContain('Sunny')
      expect(text).toContain('Humidity: 50%')

      // Get the store and verify refresh button is now enabled
      const store = useWeatherStore()
      expect(store.currentLocation).toBeTruthy()

      // Trigger refresh
      await store.refreshWeather()
      await flushPromises()

      // Verify data was updated
      expect(store.weatherData.current?.temperature).toBe(72)
      expect(store.weatherData.current?.condition).toBe('Cloudy')
      expect(store.weatherData.current?.humidity).toBe(65)

      text = wrapper.text()
      expect(text).toContain('Cloudy')
      expect(text).toContain('Humidity: 65%')
    })
  })
})
