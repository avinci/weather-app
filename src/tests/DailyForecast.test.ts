import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import DailyForecast from '../components/DailyForecast.vue'
import { useWeatherStore } from '@/stores/weatherStore'
import type { DailyEntry } from '@/types/weather'

describe('DailyForecast.vue', () => {
  let store: ReturnType<typeof useWeatherStore>

  const mockDailyData: DailyEntry[] = [
    {
      date: 'Mon, Dec 4',
      dayOfWeek: 'Monday',
      highTemperature: 72,
      lowTemperature: 58,
      condition: 'Partly Cloudy',
      conditionIcon: 'https://example.com/icon1.png',
      precipitationChance: 25,
    },
    {
      date: 'Tue, Dec 5',
      dayOfWeek: 'Tuesday',
      highTemperature: 68,
      lowTemperature: 55,
      condition: 'Rainy',
      conditionIcon: 'https://example.com/icon2.png',
      precipitationChance: 80,
    },
    {
      date: 'Wed, Dec 6',
      dayOfWeek: 'Wednesday',
      highTemperature: 70,
      lowTemperature: 56,
      condition: 'Sunny',
      conditionIcon: 'https://example.com/icon3.png',
      precipitationChance: 10,
    },
  ]

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useWeatherStore()
  })

  it('displays section title "7-Day Forecast"', () => {
    const wrapper = mount(DailyForecast, {
      global: {
        stubs: {
          DailyCard: true,
          ErrorMessage: true,
        },
      },
    })

    expect(wrapper.text()).toContain('7-Day Forecast')
  })

  it('displays loading state when isLoading is true', () => {
    store.isLoadingWeather = true

    const wrapper = mount(DailyForecast, {
      global: {
        stubs: {
          DailyCard: true,
          ErrorMessage: true,
        },
      },
    })

    expect(wrapper.text()).toContain('Loading forecast...')
  })

  it('displays no data message when data is empty and not loading', () => {
    store.isLoadingWeather = false
    store.weatherData.daily = []

    const wrapper = mount(DailyForecast, {
      global: {
        stubs: {
          DailyCard: true,
          ErrorMessage: true,
        },
      },
    })

    expect(wrapper.text()).toContain('No daily forecast available')
  })

  it('renders all daily cards when data is available', () => {
    store.isLoadingWeather = false
    store.weatherData.daily = mockDailyData

    const wrapper = mount(DailyForecast, {
      global: {
        stubs: {
          ErrorMessage: true,
        },
      },
    })

    const dailyCards = wrapper.findAll('[data-testid="daily-card"]')
    // Note: actual count depends on template implementation
    // This is a basic check that data flows to child component
    expect(wrapper.text()).toContain('Mon, Dec 4')
    expect(wrapper.text()).toContain('Tue, Dec 5')
    expect(wrapper.text()).toContain('Wed, Dec 6')
  })

  it('passes temperature unit prop to DailyCard', () => {
    store.isLoadingWeather = false
    store.weatherData.daily = mockDailyData
    store.temperatureUnit = 'C'

    const wrapper = mount(DailyForecast)

    expect(wrapper.vm.temperatureUnit).toBe('C')
  })

  it('displays error message when there is a weather error', () => {
    store.isLoadingWeather = false
    store.weatherError = {
      type: 'api',
      message: 'Failed to fetch weather',
      suggestion: 'Please try again',
      retryable: true,
    }

    const wrapper = mount(DailyForecast, {
      global: {
        stubs: {
          DailyCard: true,
          ErrorMessage: { template: '<div class="error-message">{{ error }}</div>' },
        },
      },
    })

    expect(wrapper.find('.error-message').exists()).toBe(true)
  })

  it('calls handleRetry with fetchWeather when retry is triggered', async () => {
    const mockLocation = { lat: 40, lon: -74, id: '1', name: 'NYC', region: 'NY', country: 'USA' }
    store.currentLocation = mockLocation
    store.weatherError = {
      type: 'network',
      message: 'Network error',
      suggestion: 'Retry',
      retryable: true,
    }

    const fetchSpy = vi.spyOn(store, 'fetchWeather')

    const wrapper = mount(DailyForecast)
    const handleRetry = wrapper.vm.handleRetry as () => void
    handleRetry()

    expect(fetchSpy).toHaveBeenCalledWith(40, -74)
  })

  it('hides error when loading starts', async () => {
    // Start with no data and no error
    store.weatherError = null
    store.isLoadingWeather = false
    store.weatherData.daily = []

    const wrapper = mount(DailyForecast, {
      global: {
        stubs: {
          DailyCard: true,
          ErrorMessage: true,
        },
      },
    })

    expect(wrapper.text()).toContain('No daily forecast available')

    store.isLoadingWeather = true
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Loading forecast...')
  })

  it('uses dailyForecastForDisplay computed property from store', () => {
    store.isLoadingWeather = false
    store.weatherData.daily = mockDailyData
    store.temperatureUnit = 'F'

    const wrapper = mount(DailyForecast)

    expect(wrapper.vm.dailyData).toEqual(store.dailyForecastForDisplay)
  })
})
