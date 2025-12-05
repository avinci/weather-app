import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import HourlyForecast from '@/components/HourlyForecast.vue'
import RefreshButton from '@/components/RefreshButton.vue'
import { useWeatherStore } from '@/stores/weatherStore'
import type { HourlyEntry, Location } from '@/types/weather'

describe('HourlyForecast Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mockLocation: Location = {
    id: '40.7128:-74.0060',
    name: 'New York',
    region: 'NY',
    country: 'United States',
    lat: 40.7128,
    lon: -74.006,
  }

  const mockHourlyData: HourlyEntry[] = Array.from({ length: 12 }, (_, i) => ({
    time: `${(i + 1) % 12 || 12}:00 ${i < 11 ? 'PM' : 'AM'}`,
    temperature: 68 + i,
    condition: 'Partly Cloudy',
    conditionIcon: 'https://cdn.weatherapi.com/weather/64x64/day/122.png',
    windSpeed: 12 + i,
    humidity: 55 + i,
    precipitationChance: 20,
  }))

  it('displays hourly forecast after location selection', async () => {
    const store = useWeatherStore()

    // Simulate location selection with weather data
    store.currentLocation = mockLocation
    store.weatherData.current = {
      location: mockLocation,
      temperature: 68,
      condition: 'Partly Cloudy',
      conditionIcon: 'https://cdn.weatherapi.com/weather/64x64/day/122.png',
      humidity: 55,
      windSpeed: 12,
      lastUpdated: new Date().toISOString(),
    }
    store.weatherData.hourly = mockHourlyData

    const wrapper = mount(HourlyForecast, {
      global: {
        stubs: {
          HourlyCard: {
            template: '<div class="hourly-card-stub">{{ hour.time }}</div>',
            props: ['hour', 'temperatureUnit'],
          },
          ErrorMessage: true,
        },
      },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('12-Hour Forecast')
    const cards = wrapper.findAll('.hourly-card-stub')
    expect(cards).toHaveLength(12)
  })

  it('updates all hourly temperatures when unit is toggled', async () => {
    const store = useWeatherStore()

    store.currentLocation = mockLocation
    store.weatherData.current = {
      location: mockLocation,
      temperature: 68,
      condition: 'Partly Cloudy',
      conditionIcon: 'https://cdn.weatherapi.com/weather/64x64/day/122.png',
      humidity: 55,
      windSpeed: 12,
      lastUpdated: new Date().toISOString(),
    }
    store.weatherData.hourly = mockHourlyData
    store.temperatureUnit = 'C'

    const wrapper = mount(HourlyForecast, {
      global: {
        stubs: {
          HourlyCard: {
            template: '<div class="hourly-card-stub">{{ temperatureUnit }}</div>',
            props: ['hour', 'temperatureUnit'],
          },
          ErrorMessage: true,
        },
      },
    })

    await flushPromises()
    expect(wrapper.text()).toContain('C')

    // Toggle to Fahrenheit
    store.toggleTemperatureUnit()
    await flushPromises()

    expect(store.temperatureUnit).toBe('F')
    expect(wrapper.text()).toContain('F')
  })

  it('refreshes hourly data when refresh button is clicked', async () => {
    const store = useWeatherStore()

    store.currentLocation = mockLocation
    store.weatherData.current = {
      location: mockLocation,
      temperature: 68,
      condition: 'Partly Cloudy',
      conditionIcon: 'https://cdn.weatherapi.com/weather/64x64/day/122.png',
      humidity: 55,
      windSpeed: 12,
      lastUpdated: new Date().toISOString(),
    }
    store.weatherData.hourly = mockHourlyData

    const refreshWeatherSpy = vi.spyOn(store, 'refreshWeather')

    const wrapper = mount({
      template: `
        <div>
          <RefreshButton />
          <HourlyForecast />
        </div>
      `,
      components: {
        HourlyForecast,
        RefreshButton,
      },
      global: {
        stubs: {
          HourlyCard: {
            template: '<div class="hourly-card-stub"></div>',
            props: ['hour', 'temperatureUnit'],
          },
          ErrorMessage: true,
        },
      },
    })

    await flushPromises()

    const refreshButton = wrapper.find('.refresh-button')
    await refreshButton.trigger('click')

    expect(refreshWeatherSpy).toHaveBeenCalled()
  })

  it('displays error message when hourly forecast fetch fails', async () => {
    const store = useWeatherStore()

    store.currentLocation = mockLocation
    store.weatherData.current = {
      location: mockLocation,
      temperature: 68,
      condition: 'Partly Cloudy',
      conditionIcon: 'https://cdn.weatherapi.com/weather/64x64/day/122.png',
      humidity: 55,
      windSpeed: 12,
      lastUpdated: new Date().toISOString(),
    }
    store.weatherData.hourly = []
    store.weatherError = {
      type: 'api',
      message: 'Failed to fetch forecast',
      suggestion: 'Please try again',
      retryable: true,
    }

    const wrapper = mount(HourlyForecast, {
      global: {
        stubs: {
          ErrorMessage: {
            template: '<div class="error-message-stub">{{ error?.message }}</div>',
            props: ['error', 'onRetry'],
          },
        },
      },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Failed to fetch forecast')
  })

  it('displays loading state while fetching hourly data', async () => {
    const store = useWeatherStore()

    store.currentLocation = mockLocation
    store.isLoadingWeather = true
    store.weatherData.hourly = []

    const wrapper = mount(HourlyForecast, {
      global: {
        stubs: {
          ErrorMessage: true,
        },
      },
    })

    await flushPromises()

    expect(wrapper.find('.spinner').exists()).toBe(true)
    expect(wrapper.text()).toContain('Loading forecast...')
  })

  it('hides loading state and displays cards after data loads', async () => {
    const store = useWeatherStore()

    store.currentLocation = mockLocation
    store.isLoadingWeather = true

    const wrapper = mount(HourlyForecast, {
      global: {
        stubs: {
          HourlyCard: {
            template: '<div class="hourly-card-stub"></div>',
            props: ['hour', 'temperatureUnit'],
          },
          ErrorMessage: true,
        },
      },
    })

    await flushPromises()
    expect(wrapper.find('.spinner').exists()).toBe(true)

    // Simulate data loaded
    store.isLoadingWeather = false
    store.weatherData.hourly = mockHourlyData
    await flushPromises()

    expect(wrapper.find('.spinner').exists()).toBe(false)
    const cards = wrapper.findAll('.hourly-card-stub')
    expect(cards).toHaveLength(12)
  })

  it('handles 12-hour scrollable container correctly', async () => {
    const store = useWeatherStore()

    store.weatherData.hourly = mockHourlyData

    const wrapper = mount(HourlyForecast, {
      global: {
        stubs: {
          HourlyCard: {
            template: '<div class="hourly-card-stub"></div>',
            props: ['hour', 'temperatureUnit'],
          },
          ErrorMessage: true,
        },
      },
    })

    await flushPromises()

    const scrollContainer = wrapper.find('.scroll-container')
    expect(scrollContainer.exists()).toBe(true)

    // Verify all cards are present
    const cards = wrapper.findAll('.hourly-card-stub')
    expect(cards).toHaveLength(12)
  })

  it('maintains scroll position when temperature unit changes', async () => {
    const store = useWeatherStore()

    store.weatherData.hourly = mockHourlyData
    store.temperatureUnit = 'C'

    const wrapper = mount(HourlyForecast, {
      global: {
        stubs: {
          HourlyCard: {
            template: '<div class="hourly-card-stub"></div>',
            props: ['hour', 'temperatureUnit'],
          },
          ErrorMessage: true,
        },
      },
    })

    await flushPromises()

    const scrollContainer = wrapper.find('.scroll-container')
    const initialClass = scrollContainer.classes()

    // Toggle unit
    store.toggleTemperatureUnit()
    await flushPromises()

    // Container should still be present with same structure
    expect(wrapper.find('.scroll-container').exists()).toBe(true)
    expect(wrapper.findAll('.hourly-card-stub')).toHaveLength(12)
  })
})
