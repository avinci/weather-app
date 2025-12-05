import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import DailyForecast from '../components/DailyForecast.vue'
import DailyCard from '../components/DailyCard.vue'
import { useWeatherStore } from '@/stores/weatherStore'

// Mock the weather API service
vi.mock('@/services/weatherApi', () => ({
  getWeatherData: vi.fn(),
}))

describe('DailyForecast Integration', () => {
  let store: ReturnType<typeof useWeatherStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useWeatherStore()
  })

  it('displays 7 daily cards in horizontal scroll container', async () => {
    // Set up store with 7 days of daily data
    // Note: Store data is in Celsius; 72°F = 22.2°C, 58°F = 14.4°C
    store.temperatureUnit = 'F'
    store.isLoadingWeather = false
    store.weatherData.daily = Array.from({ length: 7 }, (_, i) => ({
      date: `${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}, Dec ${4 + i}`,
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i],
      highTemperature: 22.2 - i, // Celsius equivalent of 72-i°F
      lowTemperature: 14.4 - i, // Celsius equivalent of 58-i°F
      condition: 'Partly Cloudy',
      conditionIcon: `https://example.com/icon${i}.png`,
      precipitationChance: 25,
    }))

    const wrapper = mount(DailyForecast, {
      global: {
        components: {
          DailyCard,
        },
      },
    })

    await flushPromises()

    const dailyCards = wrapper.findAllComponents(DailyCard)
    expect(dailyCards).toHaveLength(7)
  })

  it('updates all daily temperatures when unit toggle changes', async () => {
    store.temperatureUnit = 'F'
    store.isLoadingWeather = false
    store.weatherData.daily = [
      {
        date: 'Mon, Dec 4',
        dayOfWeek: 'Monday',
        highTemperature: 22.2, // 72°F in Celsius
        lowTemperature: 14.4, // 58°F in Celsius
        condition: 'Sunny',
        conditionIcon: 'https://example.com/icon.png',
        precipitationChance: 10,
      },
    ]

    const wrapper = mount(DailyForecast, {
      global: {
        components: {
          DailyCard,
        },
      },
    })

    await flushPromises()

    // Check initial temperature unit
    let dailyCard = wrapper.findComponent(DailyCard)
    expect(dailyCard.props('temperatureUnit')).toBe('F')

    // Toggle temperature unit
    store.temperatureUnit = 'C'
    await wrapper.vm.$nextTick()

    // Verify temperature unit passed to card updates
    dailyCard = wrapper.findComponent(DailyCard)
    expect(dailyCard.props('temperatureUnit')).toBe('C')
  })

  it('handles loading state independently from other forecast sections', async () => {
    store.isLoadingWeather = true
    store.weatherData.daily = []

    const wrapper = mount(DailyForecast)

    await flushPromises()

    expect(wrapper.text()).toContain('Loading forecast...')

    // Simulate loading complete
    store.isLoadingWeather = false
    store.weatherData.daily = [
      {
        date: 'Mon, Dec 4',
        dayOfWeek: 'Monday',
        highTemperature: 22.2, // 72°F in Celsius
        lowTemperature: 14.4, // 58°F in Celsius
        condition: 'Sunny',
        conditionIcon: 'https://example.com/icon.png',
        precipitationChance: 10,
      },
    ]

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).not.toContain('Loading forecast...')
    expect(wrapper.text()).toContain('Monday')
  })

  it('displays all required data points: day, date, high, low, condition, precip', async () => {
    store.isLoadingWeather = false
    // Data in store is stored in Celsius; convert 72°F = 22.2°C, 58°F = 14.4°C
    store.weatherData.daily = [
      {
        date: 'Mon, Dec 4',
        dayOfWeek: 'Monday',
        highTemperature: 22.2, // 72°F in Celsius
        lowTemperature: 14.4, // 58°F in Celsius
        condition: 'Partly Cloudy',
        conditionIcon: 'https://example.com/icon.png',
        precipitationChance: 25,
      },
    ]

    const wrapper = mount(DailyForecast, {
      global: {
        components: {
          DailyCard,
        },
      },
    })

    await flushPromises()

    const componentText = wrapper.text()

    // Verify all required data points are displayed
    expect(componentText).toContain('Monday')
    expect(componentText).toContain('Mon, Dec 4')
    expect(componentText).toContain('72') // High temp (converted from 22.2°C to 72°F)
    expect(componentText).toContain('58') // Low temp (converted from 14.4°C to 58°F)
    expect(componentText).toContain('Partly Cloudy')
    expect(componentText).toContain('25%') // Precipitation
  })

  it('respects temperature unit for new daily forecast data', async () => {
    // Start with Celsius
    store.temperatureUnit = 'C'
    store.isLoadingWeather = false
    store.weatherData.daily = [
      {
        date: 'Mon, Dec 4',
        dayOfWeek: 'Monday',
        highTemperature: 22, // Already in C from store conversion
        lowTemperature: 14,
        condition: 'Sunny',
        conditionIcon: 'https://example.com/icon.png',
        precipitationChance: 10,
      },
    ]

    const wrapper = mount(DailyForecast, {
      global: {
        components: {
          DailyCard,
        },
      },
    })

    await flushPromises()

    // Verify DailyCard receives Celsius unit
    const dailyCard = wrapper.findComponent(DailyCard)
    expect(dailyCard.props('temperatureUnit')).toBe('C')
  })

  it('horizontal scroll container renders with smooth scroll behavior', async () => {
    store.isLoadingWeather = false
    store.weatherData.daily = Array.from({ length: 7 }, (_, i) => ({
      date: `Day ${i}`,
      dayOfWeek: `Day ${i}`,
      highTemperature: 22.2, // 72°F in Celsius
      lowTemperature: 14.4, // 58°F in Celsius
      condition: 'Sunny',
      conditionIcon: 'https://example.com/icon.png',
      precipitationChance: 10,
    }))

    const wrapper = mount(DailyForecast, {
      global: {
        components: {
          DailyCard,
        },
      },
    })

    await flushPromises()

    const scrollContainer = wrapper.find('.scroll-container')
    expect(scrollContainer.exists()).toBe(true)
    expect(scrollContainer.classes()).toContain('scroll-container')
  })

  it('handles partial data (some days available)', async () => {
    store.isLoadingWeather = false
    store.weatherData.daily = Array.from({ length: 3 }, (_, i) => ({
      date: `${['Mon', 'Tue', 'Wed'][i]}, Dec ${4 + i}`,
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday'][i],
      highTemperature: 22.2, // 72°F in Celsius
      lowTemperature: 14.4, // 58°F in Celsius
      condition: 'Sunny',
      conditionIcon: 'https://example.com/icon.png',
      precipitationChance: 10,
    }))

    const wrapper = mount(DailyForecast, {
      global: {
        components: {
          DailyCard,
        },
      },
    })

    await flushPromises()

    const dailyCards = wrapper.findAllComponents(DailyCard)
    expect(dailyCards).toHaveLength(3)
  })
})
