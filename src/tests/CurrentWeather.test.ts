import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import CurrentWeather from '@/components/CurrentWeather.vue'
import { useWeatherStore } from '@/stores/weatherStore'
import type { CurrentWeather as CurrentWeatherType } from '@/types/weather'

describe('CurrentWeather', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('does not render when no location is selected', () => {
    const wrapper = mount(CurrentWeather)
    expect(wrapper.find('.current-weather').exists()).toBe(false)
  })

  it('renders when location is selected', async () => {
    const store = useWeatherStore()
    const wrapper = mount(CurrentWeather)

    store.currentLocation = {
      id: 'test-1',
      name: 'New York',
      region: 'NY',
      country: 'USA',
      lat: 40.7128,
      lon: -74.006,
    }

    await wrapper.vm.$nextTick()

    expect(wrapper.find('.current-weather').exists()).toBe(true)
  })

  it('shows loading skeleton when fetching weather', async () => {
    const store = useWeatherStore()
    const wrapper = mount(CurrentWeather)

    store.currentLocation = {
      id: 'test-1',
      name: 'New York',
      region: 'NY',
      country: 'USA',
      lat: 40.7128,
      lon: -74.006,
    }
    store.isLoadingWeather = true

    await wrapper.vm.$nextTick()

    expect(wrapper.find('.skeleton-loader').exists()).toBe(true)
  })

  it('displays weather data when available', async () => {
    const store = useWeatherStore()
    const wrapper = mount(CurrentWeather)

    store.currentLocation = {
      id: 'test-1',
      name: 'New York',
      region: 'NY',
      country: 'USA',
      lat: 40.7128,
      lon: -74.006,
    }

    store.weatherData.current = {
      temperature: 72,
      condition: 'Sunny',
      humidity: 60,
      windSpeed: 10,
    }

    await wrapper.vm.$nextTick()

    expect(wrapper.findComponent({ name: 'CurrentWeatherDisplay' }).exists()).toBe(
      true,
    )
  })

  it('passes correct props to CurrentWeatherDisplay', async () => {
    const store = useWeatherStore()
    const wrapper = mount(CurrentWeather)

    store.currentLocation = {
      id: 'test-1',
      name: 'New York',
      region: 'NY',
      country: 'USA',
      lat: 40.7128,
      lon: -74.006,
    }

    store.weatherData.current = {
      temperature: 72,
      condition: 'Sunny',
      humidity: 60,
      windSpeed: 10,
    }

    await wrapper.vm.$nextTick()

    const displayComponent = wrapper.findComponent({ name: 'CurrentWeatherDisplay' })
    expect(displayComponent.props('temperatureUnit')).toBe('F')
    expect(displayComponent.props('weather')).toBeDefined()
  })

  it('shows error message when weather fetch fails', async () => {
    const store = useWeatherStore()
    const wrapper = mount(CurrentWeather)

    store.currentLocation = {
      id: 'test-1',
      name: 'New York',
      region: 'NY',
      country: 'USA',
      lat: 40.7128,
      lon: -74.006,
    }

    store.weatherError = {
      type: 'API_ERROR',
      message: 'Failed to fetch weather data',
    }

    await wrapper.vm.$nextTick()

    expect(wrapper.findComponent({ name: 'ErrorMessage' }).exists()).toBe(true)
  })

  it('hides loading skeleton when data is loaded', async () => {
    const store = useWeatherStore()
    const wrapper = mount(CurrentWeather)

    store.currentLocation = {
      id: 'test-1',
      name: 'New York',
      region: 'NY',
      country: 'USA',
      lat: 40.7128,
      lon: -74.006,
    }

    // Start loading
    store.isLoadingWeather = true
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.skeleton-loader').exists()).toBe(true)

    // Complete loading with data
    store.isLoadingWeather = false
    store.weatherData.current = {
      temperature: 72,
      condition: 'Sunny',
      humidity: 60,
      windSpeed: 10,
    }

    await wrapper.vm.$nextTick()

    expect(wrapper.find('.skeleton-loader').exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'CurrentWeatherDisplay' }).exists()).toBe(true)
  })

  it('passes temperature unit to display component', async () => {
    const store = useWeatherStore()
    const wrapper = mount(CurrentWeather)

    store.currentLocation = {
      id: 'test-1',
      name: 'New York',
      region: 'NY',
      country: 'USA',
      lat: 40.7128,
      lon: -74.006,
    }

    store.weatherData.current = {
      temperature: 72,
      condition: 'Sunny',
      humidity: 60,
      windSpeed: 10,
    }

    store.temperatureUnit = 'C'

    await wrapper.vm.$nextTick()

    const displayComponent = wrapper.findComponent({ name: 'CurrentWeatherDisplay' })
    expect(displayComponent.props('temperatureUnit')).toBe('C')
  })

  it('passes formatted last updated time to display component', async () => {
    const store = useWeatherStore()
    const wrapper = mount(CurrentWeather)

    store.currentLocation = {
      id: 'test-1',
      name: 'New York',
      region: 'NY',
      country: 'USA',
      lat: 40.7128,
      lon: -74.006,
    }

    store.weatherData.current = {
      temperature: 72,
      condition: 'Sunny',
      humidity: 60,
      windSpeed: 10,
    }

    store.lastUpdated = new Date().toISOString()

    await wrapper.vm.$nextTick()

    const displayComponent = wrapper.findComponent({ name: 'CurrentWeatherDisplay' })
    expect(displayComponent.props('formattedLastUpdated')).toBeTruthy()
  })
})
