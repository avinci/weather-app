/**
 * App.vue Integration Tests
 * Tests the geolocation flow and app initialization
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import App from '@/App.vue'
import * as geolocation from '@/services/geolocation'
import * as weatherApi from '@/services/weatherApi'

vi.mock('@/services/geolocation')
vi.mock('@/services/weatherApi')

describe('App.vue Integration - Geolocation Flow', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('on mount with successful geolocation', () => {
    it('should detect location and fetch weather automatically', async () => {
      const mockCoordinates = { latitude: 40.7128, longitude: -74.006, accuracy: 10 }
      const mockWeatherData = {
        current: {
          location: { id: '1', name: 'New York', region: 'NY', country: 'USA', lat: 40.7128, lon: -74.006 },
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

      ;(geolocation.getLocation as any).mockResolvedValueOnce({
        success: true,
        coordinates: mockCoordinates,
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

      // Verify geolocation was called
      expect(geolocation.getLocation).toHaveBeenCalled()

      // Verify weather API was called with detected coordinates
      expect(weatherApi.getWeatherByCoordinates).toHaveBeenCalledWith(40.7128, -74.006)

      // Verify the app displays weather (temperature and condition should be visible)
      const text = wrapper.text()
      expect(text).toContain('Cloudy')
      expect(text).toContain('Humidity: 65%')
    })

    it('should display temperature and weather details', async () => {
      const mockWeatherData = {
        current: {
          location: { id: '1', name: 'London', region: 'England', country: 'UK', lat: 51.5074, lon: -0.1278 },
          temperature: 10,
          condition: 'Rainy',
          conditionIcon: 'rain.png',
          humidity: 80,
          windSpeed: 15,
          lastUpdated: new Date().toISOString(),
        },
        hourly: [],
        daily: [],
      }

      ;(geolocation.getLocation as any).mockResolvedValueOnce({
        success: true,
        coordinates: { latitude: 51.5074, longitude: -0.1278, accuracy: 20 },
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

      const text = wrapper.text()
      expect(text).toContain('Rainy')
      expect(text).toContain('Humidity: 80%')
      // Verify weather refresh capability exists
      expect(text).toContain('Refresh')
    })
  })

  describe('on mount with permission denied', () => {
    it('should show search box without error message', async () => {
      ;(geolocation.getLocation as any).mockResolvedValueOnce({
        success: false,
        error: 'denied',
      })

      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
          stubs: {
            LocationSearch: { template: '<div class="location-search">Search Box</div>' },
            ErrorMessage: { template: '<div class="error-message" v-if="error">Error: {{ error.message }}</div>' },
          },
        },
      })

      await flushPromises()

      // Verify geolocation was called
      expect(geolocation.getLocation).toHaveBeenCalled()

      // Verify weather API was NOT called (no location to fetch for)
      expect(weatherApi.getWeatherByCoordinates).not.toHaveBeenCalled()

      // Verify search box is visible
      expect(wrapper.text()).toContain('Search Box')

      // Verify no weather section is displayed
      expect(wrapper.text()).not.toContain('Loading...')
    })

    it('should not show error message for denied permission', async () => {
      ;(geolocation.getLocation as any).mockResolvedValueOnce({
        success: false,
        error: 'denied',
      })

      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
          stubs: {
            LocationSearch: { template: '<div class="location-search">Search</div>' },
            ErrorMessage: { 
              props: ['error'],
              template: '<div class="error-message"><p v-if="error">{{ error.message }}</p></div>' 
            },
          },
        },
      })

      await flushPromises()

      // The error message component should receive null error for weather
      const errorComponent = wrapper.findComponent({ name: 'ErrorMessage' })
      if (errorComponent.exists()) {
        const props = errorComponent.props()
        // The first ErrorMessage is for search errors (null), weather error is also null
        expect(props.error).toBeNull()
      }
    })
  })

  describe('on mount with geolocation timeout', () => {
    it('should silently fall back to search without error', async () => {
      ;(geolocation.getLocation as any).mockResolvedValueOnce({
        success: false,
        error: 'timeout',
      })

      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
          stubs: {
            LocationSearch: { template: '<div class="location-search">Search Box</div>' },
            ErrorMessage: { template: '<div class="error-message"></div>' },
          },
        },
      })

      await flushPromises()

      // Verify geolocation was called
      expect(geolocation.getLocation).toHaveBeenCalled()

      // Verify weather API was NOT called
      expect(weatherApi.getWeatherByCoordinates).not.toHaveBeenCalled()

      // Verify search box is visible
      expect(wrapper.text()).toContain('Search Box')
    })
  })

  describe('on mount with unsupported browser', () => {
    it('should silently fall back to search', async () => {
      ;(geolocation.getLocation as any).mockResolvedValueOnce({
        success: false,
        error: 'unavailable',
      })

      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
          stubs: {
            LocationSearch: { template: '<div class="location-search">Search Box</div>' },
            ErrorMessage: { template: '<div class="error-message"></div>' },
          },
        },
      })

      await flushPromises()

      // Verify geolocation was called (even if unavailable)
      expect(geolocation.getLocation).toHaveBeenCalled()

      // Verify weather API was NOT called
      expect(weatherApi.getWeatherByCoordinates).not.toHaveBeenCalled()

      // Verify search box is visible
      expect(wrapper.text()).toContain('Search Box')
    })
  })

  describe('currentLocationAttempted flag', () => {
    it('should prevent re-requesting geolocation on remount', async () => {
      ;(geolocation.getLocation as any).mockResolvedValueOnce({
        success: false,
        error: 'denied',
      })

      const pinia = createPinia()
      setActivePinia(pinia)

      const wrapper = mount(App, {
        global: {
          plugins: [pinia],
          stubs: {
            LocationSearch: { template: '<div class="location-search">Search</div>' },
            ErrorMessage: { template: '<div class="error-message"></div>' },
          },
        },
      })

      await flushPromises()

      // First mount should call geolocation
      expect(geolocation.getLocation).toHaveBeenCalledTimes(1)

      // Remount the app (simulate page refresh or route change that preserves store)
      wrapper.unmount()

      // Create a new instance with the same pinia store
      const wrapper2 = mount(App, {
        global: {
          plugins: [pinia],
          stubs: {
            LocationSearch: { template: '<div class="location-search">Search</div>' },
            ErrorMessage: { template: '<div class="error-message"></div>' },
          },
        },
      })

      await flushPromises()

      // Second mount should NOT call geolocation again (flag prevents it)
      expect(geolocation.getLocation).toHaveBeenCalledTimes(1)
    })
  })

  describe('fresh start on each session', () => {
    it('should reset state for new session', async () => {
      ;(geolocation.getLocation as any).mockResolvedValueOnce({
        success: true,
        coordinates: { latitude: 40, longitude: -74, accuracy: 10 },
      })
      ;(weatherApi.getWeatherByCoordinates as any).mockResolvedValueOnce({
        current: null,
        hourly: [],
        daily: [],
      })

      const pinia1 = createPinia()
      setActivePinia(pinia1)

      const wrapper1 = mount(App, {
        global: {
          plugins: [pinia1],
          stubs: {
            LocationSearch: { template: '<div></div>' },
            ErrorMessage: { template: '<div></div>' },
          },
        },
      })

      await flushPromises()
      expect(geolocation.getLocation).toHaveBeenCalledTimes(1)

      vi.clearAllMocks()

      // Create a new pinia instance (new session)
      const pinia2 = createPinia()
      setActivePinia(pinia2)

      ;(geolocation.getLocation as any).mockResolvedValueOnce({
        success: true,
        coordinates: { latitude: 51, longitude: 0, accuracy: 10 },
      })
      ;(weatherApi.getWeatherByCoordinates as any).mockResolvedValueOnce({
        current: null,
        hourly: [],
        daily: [],
      })

      const wrapper2 = mount(App, {
        global: {
          plugins: [pinia2],
          stubs: {
            LocationSearch: { template: '<div></div>' },
            ErrorMessage: { template: '<div></div>' },
          },
        },
      })

      await flushPromises()

      // New session should attempt geolocation again
      expect(geolocation.getLocation).toHaveBeenCalledTimes(1)
    })
  })
})
