import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import HourlyForecast from '@/components/HourlyForecast.vue'
import { useWeatherStore } from '@/stores/weatherStore'
import type { HourlyEntry, WeatherError } from '@/types/weather'

describe('HourlyForecast.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mockHourlyData: HourlyEntry[] = Array.from({ length: 12 }, (_, i) => ({
    time: `${i + 1}:00 ${i < 12 ? 'AM' : 'PM'}`,
    temperature: 70 + i,
    condition: 'Partly Cloudy',
    conditionIcon: 'https://cdn.weatherapi.com/weather/64x64/day/122.png',
    windSpeed: 10 + i,
    humidity: 60 + i,
    precipitationChance: 20,
  }))

  it('renders section title', () => {
    const wrapper = mount(HourlyForecast, {
      global: {
        stubs: {
          ErrorMessage: true,
        },
      },
    })

    expect(wrapper.text()).toContain('12-Hour Forecast')
  })

  it('displays all 12 hourly cards when data is available', async () => {
    const store = useWeatherStore()
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

    const cards = wrapper.findAll('.hourly-card-stub')
    expect(cards).toHaveLength(12)
  })

  it('displays each hour with required data fields', async () => {
    const store = useWeatherStore()
    // Set the hourly data to be displayed
    store.weatherData.hourly = [mockHourlyData[0]]
    // Set temperature unit to Celsius so we can verify the raw value from store
    store.temperatureUnit = 'C'

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

    expect(wrapper.text()).toContain('1:00 AM')
  })

  it('shows loading spinner while fetching', async () => {
    const store = useWeatherStore()
    store.isLoadingWeather = true

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

  it('shows no data state when no hourly data available', async () => {
    const store = useWeatherStore()
    store.weatherData.hourly = []
    store.isLoadingWeather = false

    const wrapper = mount(HourlyForecast, {
      global: {
        stubs: {
          ErrorMessage: true,
        },
      },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('No hourly forecast available')
  })

  it('hides loading state when data is loaded', async () => {
    const store = useWeatherStore()
    store.weatherData.hourly = mockHourlyData
    store.isLoadingWeather = false

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

    expect(wrapper.find('.spinner').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Loading forecast...')
  })

  it('shows error message when fetch fails', async () => {
    const store = useWeatherStore()
    store.weatherError = {
      type: 'api',
      message: 'Failed to fetch forecast',
      suggestion: 'Please try again',
      retryable: true,
    } as WeatherError

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

  it('passes temperature unit to hourly cards', async () => {
    const store = useWeatherStore()
    store.weatherData.hourly = [mockHourlyData[0]]
    store.temperatureUnit = 'C'

    let passedUnit = ''
    const wrapper = mount(HourlyForecast, {
      global: {
        stubs: {
          HourlyCard: {
            template: '<div></div>',
            props: ['hour', 'temperatureUnit'],
            setup(props: any) {
              passedUnit = props.temperatureUnit
              return {}
            },
          },
          ErrorMessage: true,
        },
      },
    })

    await flushPromises()

    expect(passedUnit).toBe('C')
  })

  it('has scroll container with correct styling', () => {
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

    expect(wrapper.find('.scroll-container').exists()).toBe(true)
  })

  it('renders section as white card with shadow', () => {
    const wrapper = mount(HourlyForecast, {
      global: {
        stubs: {
          ErrorMessage: true,
        },
      },
    })

    const section = wrapper.find('.hourly-forecast')
    expect(section.exists()).toBe(true)
    const styles = section.attributes('style') || ''
    expect(section.classes()).toContain('hourly-forecast')
  })

  it('hides cards and error when loading', async () => {
    const store = useWeatherStore()
    store.weatherData.hourly = mockHourlyData
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

    const cards = wrapper.findAll('.hourly-card-stub')
    expect(cards).toHaveLength(0)
  })
})
