import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TemperatureToggle from '@/components/TemperatureToggle.vue'
import CurrentWeather from '@/components/CurrentWeather.vue'
import { useWeatherStore } from '@/stores/weatherStore'

describe('CurrentWeather Integration Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('displays current weather after location is set', async () => {
    const store = useWeatherStore()

    // Set location and weather data directly
    // Note: Store keeps temperatures in Celsius internally, converts on display
    store.currentLocation = {
      id: 'test-1',
      name: 'New York',
      region: 'NY',
      country: 'USA',
      lat: 40.7128,
      lon: -74.006,
    }

    store.weatherData.current = {
      temperature: 22.22, // 72°F in Celsius
      condition: 'Sunny',
      humidity: 60,
      windSpeed: 16.1, // ~10 mph in km/h
    }

    const wrapper = mount(CurrentWeather)
    await wrapper.vm.$nextTick()

    // Verify weather is displayed
    expect(wrapper.findComponent({ name: 'CurrentWeatherDisplay' }).exists()).toBe(true)
    expect(wrapper.text()).toContain('Sunny')
    expect(wrapper.text()).toContain('72°') // Converted to F
  })

  it('updates temperature display when unit is toggled', async () => {
    const store = useWeatherStore()

    // Set location and weather (stored in Celsius internally)
    store.currentLocation = {
      id: 'test-1',
      name: 'New York',
      region: 'NY',
      country: 'USA',
      lat: 40.7128,
      lon: -74.006,
    }

    store.weatherData.current = {
      temperature: 22.22, // 72°F = 22.22°C stored internally
      condition: 'Sunny',
      humidity: 60,
      windSpeed: 16.1,
    }

    const wrapper = mount(CurrentWeather)
    await wrapper.vm.$nextTick()

    // Initial temperature in Fahrenheit
    expect(store.temperatureUnit).toBe('F')
    const tempInF = store.currentWeatherForDisplay?.temperature

    // Toggle to Celsius
    store.toggleTemperatureUnit()
    await wrapper.vm.$nextTick()

    // Temperature should now be returned as-is (already in Celsius)
    const tempInC = store.currentWeatherForDisplay?.temperature
    expect(store.temperatureUnit).toBe('C')
    expect(tempInC).not.toBe(tempInF)

    // Verify: tempInF was 72, tempInC should be ~22.22
    expect(tempInF).toBeCloseTo(72, 0)
    expect(tempInC).toBeCloseTo(22.22, 1)
  })

  it('displays toggle button in header and updates when clicked', async () => {
    const store = useWeatherStore()
    const wrapper = mount(TemperatureToggle)

    // Find temperature toggle
    const buttons = wrapper.findAll('.toggle-button')
    expect(buttons).toHaveLength(2)

    // Initial state should have F as active
    expect(buttons[0].classes()).toContain('active')

    // Click C button
    await buttons[1].trigger('click')
    await wrapper.vm.$nextTick()

    // C button should now be active
    expect(wrapper.findAll('.toggle-button')[1].classes()).toContain('active')
  })

  it('maintains temperature unit across component updates', async () => {
    const store = useWeatherStore()

    // Set temperature unit to Celsius first
    store.toggleTemperatureUnit()
    expect(store.temperatureUnit).toBe('C')

    // Now set weather data (stored in Celsius)
    store.currentLocation = {
      id: 'test-1',
      name: 'Freezing Point',
      region: '',
      country: '',
      lat: 0,
      lon: 0,
    }

    store.weatherData.current = {
      temperature: 0, // 0°C (freezing point)
      condition: 'Rainy',
      humidity: 80,
      windSpeed: 24.1, // ~15 mph in km/h
    }

    const wrapper = mount(CurrentWeather)
    await wrapper.vm.$nextTick()

    // Temperature unit should still be Celsius
    expect(store.temperatureUnit).toBe('C')

    // Temperature should display in Celsius (0°C stays 0°C)
    const displayedTemp = Math.round(store.currentWeatherForDisplay?.temperature || 0)
    expect(displayedTemp).toBe(0)
  })

  it('toggles between units immediately', async () => {
    const store = useWeatherStore()

    // Set up location and weather (stored in Celsius)
    store.currentLocation = {
      id: 'test-1',
      name: 'Test City',
      region: '',
      country: '',
      lat: 0,
      lon: 0,
    }

    store.weatherData.current = {
      temperature: 21.11, // ~70°F in Celsius
      condition: 'Clear',
      humidity: 50,
      windSpeed: 8.05, // ~5 mph in km/h
    }

    const wrapper = mount(CurrentWeather)
    await wrapper.vm.$nextTick()

    // Initial temperature in Fahrenheit
    expect(store.temperatureUnit).toBe('F')
    const tempInF = Math.round(store.currentWeatherForDisplay?.temperature || 0)
    expect(tempInF).toBe(70)

    // Toggle to Celsius
    store.toggleTemperatureUnit()
    await wrapper.vm.$nextTick()

    // Temperature should update immediately
    const tempInC = store.currentWeatherForDisplay?.temperature
    expect(store.temperatureUnit).toBe('C')

    // Should return to original Celsius value
    expect(tempInC).toBeCloseTo(21.11, 1)
  })

  it('shows error state when weather error is set', async () => {
    const store = useWeatherStore()

    store.currentLocation = {
      id: 'test-1',
      name: 'Test City',
      region: '',
      country: '',
      lat: 0,
      lon: 0,
    }

    store.weatherError = {
      type: 'API_ERROR',
      message: 'Weather API is temporarily unavailable',
    }

    const wrapper = mount(CurrentWeather)
    await wrapper.vm.$nextTick()

    // Error message component should be visible
    expect(wrapper.findComponent({ name: 'ErrorMessage' }).exists()).toBe(true)

    // No current weather should be displayed
    expect(store.currentWeatherForDisplay).toBeNull()
  })
})
