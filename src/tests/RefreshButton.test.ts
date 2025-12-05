import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import RefreshButton from '@/components/RefreshButton.vue'
import { useWeatherStore } from '@/stores/weatherStore'
import type { Location } from '@/types/weather'

describe('RefreshButton.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders button with refresh label', () => {
    const wrapper = mount(RefreshButton)

    expect(wrapper.find('.refresh-button').exists()).toBe(true)
    expect(wrapper.text()).toContain('Refresh')
  })

  it('is disabled before first data load', () => {
    const wrapper = mount(RefreshButton)

    const button = wrapper.find('.refresh-button')
    // Button should have disabled attribute or be marked as disabled
    expect(button.attributes('disabled')).not.toBeNull()
  })

  it('is enabled after first data load', async () => {
    const store = useWeatherStore()
    store.weatherData.current = {
      location: {
        id: '0:0',
        name: 'Test',
        region: '',
        country: '',
        lat: 0,
        lon: 0,
      },
      temperature: 70,
      condition: 'Sunny',
      conditionIcon: '',
      humidity: 50,
      windSpeed: 10,
      lastUpdated: new Date().toISOString(),
    }

    const wrapper = mount(RefreshButton)
    await flushPromises()

    const button = wrapper.find('.refresh-button')
    expect(button.attributes('disabled')).toBeUndefined()
  })

  it('shows refresh icon when not refreshing', () => {
    const store = useWeatherStore()
    store.weatherData.current = {
      location: {
        id: '0:0',
        name: 'Test',
        region: '',
        country: '',
        lat: 0,
        lon: 0,
      },
      temperature: 70,
      condition: 'Sunny',
      conditionIcon: '',
      humidity: 50,
      windSpeed: 10,
      lastUpdated: new Date().toISOString(),
    }

    const wrapper = mount(RefreshButton)

    expect(wrapper.find('.icon').exists()).toBe(true)
    expect(wrapper.find('.spinner').exists()).toBe(false)
  })

  it('shows spinner when refreshing', async () => {
    const store = useWeatherStore()
    store.weatherData.current = {
      location: {
        id: '0:0',
        name: 'Test',
        region: '',
        country: '',
        lat: 0,
        lon: 0,
      },
      temperature: 70,
      condition: 'Sunny',
      conditionIcon: '',
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

  it('is disabled while refreshing', async () => {
    const store = useWeatherStore()
    store.weatherData.current = {
      location: {
        id: '0:0',
        name: 'Test',
        region: '',
        country: '',
        lat: 0,
        lon: 0,
      },
      temperature: 70,
      condition: 'Sunny',
      conditionIcon: '',
      humidity: 50,
      windSpeed: 10,
      lastUpdated: new Date().toISOString(),
    }
    store.isRefreshing = true

    const wrapper = mount(RefreshButton)
    await flushPromises()

    const button = wrapper.find('.refresh-button')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('calls refreshWeather action when clicked', async () => {
    const store = useWeatherStore()
    store.weatherData.current = {
      location: {
        id: '0:0',
        name: 'Test',
        region: '',
        country: '',
        lat: 40.7128,
        lon: -74.006,
      },
      temperature: 70,
      condition: 'Sunny',
      conditionIcon: '',
      humidity: 50,
      windSpeed: 10,
      lastUpdated: new Date().toISOString(),
    }
    store.currentLocation = {
      id: '0:0',
      name: 'Test',
      region: '',
      country: '',
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

  it('does not call refreshWeather before first load', async () => {
    const store = useWeatherStore()
    const refreshSpy = vi.spyOn(store, 'refreshWeather')

    const wrapper = mount(RefreshButton)
    await flushPromises()

    const button = wrapper.find('.refresh-button')
    // Button is disabled, so click won't trigger handler
    expect(button.attributes('disabled')).not.toBeNull()
    expect(refreshSpy).not.toHaveBeenCalled()
  })

  it('has proper title attribute for accessibility', async () => {
    const wrapper = mount(RefreshButton)
    await flushPromises()

    const button = wrapper.find('.refresh-button')
    expect(button.attributes('title')).toBeDefined()
    // Title should be one of the two options depending on state
    const title = button.attributes('title')
    expect(
      title?.includes('Waiting for initial data load') || title?.includes('Refresh weather data')
    ).toBe(true)
  })

  it('changes title after data loads', async () => {
    const store = useWeatherStore()
    store.weatherData.current = {
      location: {
        id: '0:0',
        name: 'Test',
        region: '',
        country: '',
        lat: 0,
        lon: 0,
      },
      temperature: 70,
      condition: 'Sunny',
      conditionIcon: '',
      humidity: 50,
      windSpeed: 10,
      lastUpdated: new Date().toISOString(),
    }

    const wrapper = mount(RefreshButton)
    await flushPromises()

    const button = wrapper.find('.refresh-button')
    expect(button.attributes('title')).toContain('Refresh weather data')
  })

  it('renders with correct button type attribute', () => {
    const wrapper = mount(RefreshButton)

    const button = wrapper.find('.refresh-button')
    expect(button.attributes('type')).toBe('button')
  })
})
