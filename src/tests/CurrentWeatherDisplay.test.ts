import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CurrentWeatherDisplay from '@/components/CurrentWeatherDisplay.vue'
import type { CurrentWeather } from '@/types/weather'

describe('CurrentWeatherDisplay', () => {
  const mockWeatherData: CurrentWeather = {
    temperature: 72.5,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 10.5,
  }

  it('displays temperature value rounded', () => {
    const wrapper = mount(CurrentWeatherDisplay, {
      props: {
        weather: mockWeatherData,
        temperatureUnit: 'F',
        formattedLastUpdated: '2:45 PM',
      },
    })
    expect(wrapper.text()).toContain('73°')
  })

  it('displays weather condition capitalized', () => {
    const wrapper = mount(CurrentWeatherDisplay, {
      props: {
        weather: mockWeatherData,
        temperatureUnit: 'F',
        formattedLastUpdated: '2:45 PM',
      },
    })
    expect(wrapper.text()).toContain('Partly Cloudy')
  })

  it('displays humidity percentage', () => {
    const wrapper = mount(CurrentWeatherDisplay, {
      props: {
        weather: mockWeatherData,
        temperatureUnit: 'F',
        formattedLastUpdated: '2:45 PM',
      },
    })
    expect(wrapper.text()).toContain('Humidity: 65%')
  })

  it('displays wind speed with mph for Fahrenheit', () => {
    const wrapper = mount(CurrentWeatherDisplay, {
      props: {
        weather: mockWeatherData,
        temperatureUnit: 'F',
        formattedLastUpdated: '2:45 PM',
      },
    })
    expect(wrapper.text()).toContain('Wind: 11 mph')
  })

  it('displays wind speed with km/h for Celsius', () => {
    const wrapper = mount(CurrentWeatherDisplay, {
      props: {
        weather: mockWeatherData,
        temperatureUnit: 'C',
        formattedLastUpdated: '2:45 PM',
      },
    })
    expect(wrapper.text()).toContain('Wind: 11 km/h')
  })

  it('displays last updated time', () => {
    const wrapper = mount(CurrentWeatherDisplay, {
      props: {
        weather: mockWeatherData,
        temperatureUnit: 'F',
        formattedLastUpdated: '3:30 PM',
      },
    })
    expect(wrapper.text()).toContain('Last updated: 3:30 PM')
  })

  it('does not display last updated section if time is empty', () => {
    const wrapper = mount(CurrentWeatherDisplay, {
      props: {
        weather: mockWeatherData,
        temperatureUnit: 'F',
        formattedLastUpdated: '',
      },
    })
    expect(wrapper.text()).not.toContain('Last updated:')
  })

  it('renders with high temperature values', () => {
    const hotWeather: CurrentWeather = {
      temperature: 95.0,
      condition: 'Sunny',
      humidity: 30,
      windSpeed: 5.0,
    }
    const wrapper = mount(CurrentWeatherDisplay, {
      props: {
        weather: hotWeather,
        temperatureUnit: 'F',
        formattedLastUpdated: '12:00 PM',
      },
    })
    expect(wrapper.text()).toContain('95°')
    expect(wrapper.text()).toContain('Sunny')
  })

  it('renders with low temperature values', () => {
    const coldWeather: CurrentWeather = {
      temperature: 5.0,
      condition: 'Snowing',
      humidity: 95,
      windSpeed: 20.0,
    }
    const wrapper = mount(CurrentWeatherDisplay, {
      props: {
        weather: coldWeather,
        temperatureUnit: 'C',
        formattedLastUpdated: '6:00 AM',
      },
    })
    expect(wrapper.text()).toContain('5°')
    expect(wrapper.text()).toContain('Snowing')
    expect(wrapper.text()).toContain('Humidity: 95%')
  })

  it('displays all required fields together', () => {
    const wrapper = mount(CurrentWeatherDisplay, {
      props: {
        weather: mockWeatherData,
        temperatureUnit: 'F',
        formattedLastUpdated: '2:45 PM',
      },
    })
    const text = wrapper.text()
    expect(text).toContain('73°') // Temperature
    expect(text).toContain('Partly Cloudy') // Condition
    expect(text).toContain('Humidity: 65%') // Humidity
    expect(text).toContain('Wind: 11 mph') // Wind
    expect(text).toContain('Last updated: 2:45 PM') // Last updated
  })
})
