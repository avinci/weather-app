import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HourlyCard from '@/components/HourlyCard.vue'
import type { HourlyEntry } from '@/types/weather'

describe('HourlyCard.vue', () => {
  const mockHourData: HourlyEntry = {
    time: '2:00 PM',
    temperature: 72,
    condition: 'Partly Cloudy',
    conditionIcon: 'https://cdn.weatherapi.com/weather/64x64/day/122.png',
    windSpeed: 10,
    humidity: 65,
    precipitationChance: 20,
  }

  it('renders all required fields', () => {
    const wrapper = mount(HourlyCard, {
      props: {
        hour: mockHourData,
        temperatureUnit: 'F',
      },
    })

    expect(wrapper.text()).toContain('2:00 PM')
    expect(wrapper.text()).toContain('72°')
    expect(wrapper.text()).toContain('Partly Cloudy')
    expect(wrapper.text()).toContain('10')
    expect(wrapper.text()).toContain('65%')
    expect(wrapper.text()).toContain('20%')
  })

  it('displays temperature rounded correctly', () => {
    const wrapper = mount(HourlyCard, {
      props: {
        hour: {
          ...mockHourData,
          temperature: 72.7,
        },
        temperatureUnit: 'F',
      },
    })

    expect(wrapper.text()).toContain('73°')
  })

  it('displays wind speed rounded correctly', () => {
    const wrapper = mount(HourlyCard, {
      props: {
        hour: {
          ...mockHourData,
          windSpeed: 10.4,
        },
        temperatureUnit: 'F',
      },
    })

    expect(wrapper.text()).toContain('10')
  })

  it('shows mph unit for Fahrenheit', () => {
    const wrapper = mount(HourlyCard, {
      props: {
        hour: mockHourData,
        temperatureUnit: 'F',
      },
    })

    expect(wrapper.text()).toContain('mph')
  })

  it('shows km/h unit for Celsius', () => {
    const wrapper = mount(HourlyCard, {
      props: {
        hour: mockHourData,
        temperatureUnit: 'C',
      },
    })

    expect(wrapper.text()).toContain('km/h')
  })

  it('displays weather icon with correct alt text', () => {
    const wrapper = mount(HourlyCard, {
      props: {
        hour: mockHourData,
        temperatureUnit: 'F',
      },
    })

    const icon = wrapper.find('img')
    expect(icon.exists()).toBe(true)
    expect(icon.attributes('src')).toBe(mockHourData.conditionIcon)
    expect(icon.attributes('alt')).toBe('Partly Cloudy')
  })

  it('handles different weather conditions', () => {
    const conditions = ['Sunny', 'Rainy', 'Snowy', 'Thunderstorm']

    conditions.forEach((condition) => {
      const wrapper = mount(HourlyCard, {
        props: {
          hour: {
            ...mockHourData,
            condition,
          },
          temperatureUnit: 'F',
        },
      })

      expect(wrapper.text()).toContain(condition)
    })
  })

  it('displays humidity as percentage', () => {
    const wrapper = mount(HourlyCard, {
      props: {
        hour: {
          ...mockHourData,
          humidity: 85,
        },
        temperatureUnit: 'F',
      },
    })

    expect(wrapper.text()).toContain('85%')
  })

  it('displays precipitation chance as percentage', () => {
    const wrapper = mount(HourlyCard, {
      props: {
        hour: {
          ...mockHourData,
          precipitationChance: 60,
        },
        temperatureUnit: 'F',
      },
    })

    expect(wrapper.text()).toContain('60%')
  })

  it('renders with correct CSS classes', () => {
    const wrapper = mount(HourlyCard, {
      props: {
        hour: mockHourData,
        temperatureUnit: 'F',
      },
    })

    expect(wrapper.find('.hourly-card').exists()).toBe(true)
    expect(wrapper.find('.time').exists()).toBe(true)
    expect(wrapper.find('.temperature').exists()).toBe(true)
    expect(wrapper.find('.condition').exists()).toBe(true)
    expect(wrapper.find('.details').exists()).toBe(true)
  })
})
