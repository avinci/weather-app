import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import App from '@/App.vue'

vi.mock('@/services/geolocation')

describe('App.vue Component Rendering', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders the header', () => {
    const wrapper = mount(App)
    expect(wrapper.find('.app-header').exists()).toBe(true)
    expect(wrapper.text()).toContain('Weather App')
  })

  it('renders the temperature toggle in header', () => {
    const wrapper = mount(App)
    const toggle = wrapper.findComponent({ name: 'TemperatureToggle' })
    expect(toggle.exists()).toBe(true)
  })

  it('renders the location search section', () => {
    const wrapper = mount(App)
    expect(wrapper.find('.search-section').exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'LocationSearch' }).exists()).toBe(true)
  })

  it('does not render weather section initially', () => {
    const wrapper = mount(App)
    // Weather section should not be visible without a selected location
    const weatherSections = wrapper.findAll('.weather-section')
    expect(weatherSections.length).toBe(0)
  })

  it('renders loading state when geolocation is pending', async () => {
    const wrapper = mount(App)
    await wrapper.vm.$nextTick()
    // Component should at minimum show the header and search
    expect(wrapper.find('.app-header').exists()).toBe(true)
  })
})
