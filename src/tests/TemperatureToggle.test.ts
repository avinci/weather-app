import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TemperatureToggle from '@/components/TemperatureToggle.vue'
import { useWeatherStore } from '@/stores/weatherStore'

describe('TemperatureToggle', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders both unit buttons', () => {
    const wrapper = mount(TemperatureToggle)
    const buttons = wrapper.findAll('.toggle-button')
    expect(buttons).toHaveLength(2)
    expect(buttons[0].text()).toBe('°F')
    expect(buttons[1].text()).toBe('°C')
  })

  it('highlights active Fahrenheit button when store is in Fahrenheit', () => {
    const wrapper = mount(TemperatureToggle)
    const buttons = wrapper.findAll('.toggle-button')
    expect(buttons[0].classes()).toContain('active')
    expect(buttons[1].classes()).not.toContain('active')
  })

  it('highlights active Celsius button after toggle', async () => {
    const store = useWeatherStore()
    const wrapper = mount(TemperatureToggle)

    // Toggle to Celsius
    store.toggleTemperatureUnit()
    await wrapper.vm.$nextTick()

    const buttons = wrapper.findAll('.toggle-button')
    expect(buttons[0].classes()).not.toContain('active')
    expect(buttons[1].classes()).toContain('active')
  })

  it('toggles temperature unit when clicking Celsius button', async () => {
    const store = useWeatherStore()
    const wrapper = mount(TemperatureToggle)
    const celsiusButton = wrapper.findAll('.toggle-button')[1]

    await celsiusButton.trigger('click')

    expect(store.temperatureUnit).toBe('C')
  })

  it('toggles temperature unit when clicking Fahrenheit button after being on Celsius', async () => {
    const store = useWeatherStore()
    const wrapper = mount(TemperatureToggle)

    // Start with Fahrenheit, click Celsius
    let buttons = wrapper.findAll('.toggle-button')
    await buttons[1].trigger('click')
    expect(store.temperatureUnit).toBe('C')

    // Now click Fahrenheit
    buttons = wrapper.findAll('.toggle-button')
    await buttons[0].trigger('click')
    expect(store.temperatureUnit).toBe('F')
  })

  it('does not toggle when clicking already active unit', async () => {
    const store = useWeatherStore()
    const wrapper = mount(TemperatureToggle)
    const fahrenheitButton = wrapper.findAll('.toggle-button')[0]

    // Should start as Fahrenheit
    expect(store.temperatureUnit).toBe('F')

    await fahrenheitButton.trigger('click')

    // Should still be Fahrenheit (no toggle occurred)
    expect(store.temperatureUnit).toBe('F')
  })

  it('has proper accessibility attributes', () => {
    const wrapper = mount(TemperatureToggle)
    const buttons = wrapper.findAll('.toggle-button')
    expect(buttons[0].attributes('aria-label')).toBe('Switch to Fahrenheit')
    expect(buttons[1].attributes('aria-label')).toBe('Switch to Celsius')
  })
})
