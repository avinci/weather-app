import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DailyCard from '../components/DailyCard.vue'
import type { DailyEntry } from '@/types/weather'

describe('DailyCard.vue', () => {
  const mockDay: DailyEntry = {
    date: 'Mon, Dec 4',
    dayOfWeek: 'Monday',
    highTemperature: 72,
    lowTemperature: 58,
    condition: 'Partly Cloudy',
    conditionIcon: 'https://example.com/icon.png',
    precipitationChance: 25,
  }

  it('displays day name and date', () => {
    const wrapper = mount(DailyCard, {
      props: {
        day: mockDay,
        temperatureUnit: 'F',
      },
    })

    expect(wrapper.text()).toContain('Monday')
    expect(wrapper.text()).toContain('Mon, Dec 4')
  })

  it('displays high and low temperatures', () => {
    const wrapper = mount(DailyCard, {
      props: {
        day: mockDay,
        temperatureUnit: 'F',
      },
    })

    expect(wrapper.text()).toContain('High')
    expect(wrapper.text()).toContain('72')
    expect(wrapper.text()).toContain('Low')
    expect(wrapper.text()).toContain('58')
  })

  it('displays condition text', () => {
    const wrapper = mount(DailyCard, {
      props: {
        day: mockDay,
        temperatureUnit: 'F',
      },
    })

    expect(wrapper.text()).toContain('Partly Cloudy')
  })

  it('displays precipitation chance with percent symbol', () => {
    const wrapper = mount(DailyCard, {
      props: {
        day: mockDay,
        temperatureUnit: 'F',
      },
    })

    expect(wrapper.text()).toContain('Precip')
    expect(wrapper.text()).toContain('25%')
  })

  it('renders weather condition icon with correct src', () => {
    const wrapper = mount(DailyCard, {
      props: {
        day: mockDay,
        temperatureUnit: 'F',
      },
    })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('https://example.com/icon.png')
    expect(img.attributes('alt')).toBe('Partly Cloudy')
  })

  it('rounds temperatures to nearest integer', () => {
    const wrapper = mount(DailyCard, {
      props: {
        day: {
          ...mockDay,
          highTemperature: 72.7,
          lowTemperature: 58.3,
        },
        temperatureUnit: 'F',
      },
    })

    expect(wrapper.text()).toContain('73')
    expect(wrapper.text()).toContain('58')
  })

  it('displays temperature unit toggle (Fahrenheit)', () => {
    const wrapper = mount(DailyCard, {
      props: {
        day: mockDay,
        temperatureUnit: 'F',
      },
    })

    // Should display temperatures with unit awareness
    expect(wrapper.text()).toContain('72°')
    expect(wrapper.text()).toContain('58°')
  })

  it('handles zero and negative temperatures', () => {
    const wrapper = mount(DailyCard, {
      props: {
        day: {
          ...mockDay,
          highTemperature: 0,
          lowTemperature: -5,
        },
        temperatureUnit: 'F',
      },
    })

    expect(wrapper.text()).toContain('0')
    expect(wrapper.text()).toContain('-5')
  })

  it('uses default temperature unit of F when not provided', () => {
    const wrapper = mount(DailyCard, {
      props: {
        day: mockDay,
        // temperatureUnit not provided
      },
    })

    expect(wrapper.text()).toContain('72°')
    expect(wrapper.text()).toContain('58°')
  })
})
