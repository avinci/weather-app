/**
 * LocationSearch Integration Tests
 * Tests the search-to-display flow with mocked store
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import LocationSearch from '@/components/LocationSearch.vue'
import { useWeatherStore } from '@/stores/weatherStore'
import * as weatherApi from '@/services/weatherApi'

vi.mock('@/services/weatherApi')

describe('LocationSearch Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  it('should emit search event and allow store to handle it', async () => {
    const mockResults = [
      {
        id: '1',
        name: 'New York',
        region: 'NY',
        country: 'USA',
        lat: 40.7128,
        lon: -74.006,
      },
    ]

    ;(weatherApi.searchLocations as any).mockResolvedValueOnce(mockResults)

    const store = useWeatherStore()
    const wrapper = mount(LocationSearch, {
      props: {
        results: store.searchResults,
      },
    })

    // Type "New York"
    const input = wrapper.find('.search-input')
    await input.setValue('New York')

    // Advance past debounce
    vi.advanceTimersByTime(300)
    await flushPromises()

    // Component should emit search event
    expect(wrapper.emitted('search')).toBeTruthy()
    expect(wrapper.emitted('search')?.[0]).toEqual(['New York'])

    // Now manually call store method to simulate app behavior
    await store.searchLocations('New York')

    // Store should have called the API
    expect(weatherApi.searchLocations).toHaveBeenCalledWith('New York')
  })

  it('should display search results in dropdown', async () => {
    const mockResults = [
      {
        id: '1',
        name: 'New York',
        region: 'NY',
        country: 'USA',
        lat: 40.7128,
        lon: -74.006,
      },
      {
        id: '2',
        name: 'New Orleans',
        region: 'LA',
        country: 'USA',
        lat: 29.9511,
        lon: -90.2623,
      },
    ]

    const store = useWeatherStore()
    store.searchResults = mockResults

    const wrapper = mount(LocationSearch, {
      props: {
        results: store.searchResults,
      },
    })

    // Type to trigger dropdown
    const input = wrapper.find('.search-input')
    await input.setValue('New')

    vi.advanceTimersByTime(300)
    await wrapper.vm.$nextTick()

    // Results should display
    const items = wrapper.findAll('.result-item')
    expect(items).toHaveLength(2)
    expect(items[0].text()).toContain('New York')
    expect(items[1].text()).toContain('New Orleans')
  })

  it('should call selectLocation when result is clicked', async () => {
    const mockResults = [
      {
        id: '1',
        name: 'New York',
        region: 'NY',
        country: 'USA',
        lat: 40.7128,
        lon: -74.006,
      },
    ]

    const mockWeatherData = {
      current: {
        location: {
          id: '1',
          name: 'New York',
          region: 'NY',
          country: 'USA',
          lat: 40.7128,
          lon: -74.006,
        },
        temperature: 15,
        condition: 'Cloudy',
        conditionIcon: 'cloud.png',
        humidity: 65,
        windSpeed: 10,
        lastUpdated: new Date().toISOString(),
      },
      hourly: [],
      daily: [],
    }

    ;(weatherApi.getWeatherByCoordinates as any).mockResolvedValueOnce(mockWeatherData)

    const store = useWeatherStore()
    store.searchResults = mockResults

    const wrapper = mount(LocationSearch, {
      props: {
        results: store.searchResults,
      },
    })

    // Open dropdown
    const input = wrapper.find('.search-input')
    await input.setValue('New York')
    vi.advanceTimersByTime(300)
    await flushPromises()
    await wrapper.vm.$nextTick()

    // Click result
    const resultItem = wrapper.find('.result-item')
    await resultItem.trigger('click')

    // Should emit select event
    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')?.[0]).toEqual([mockResults[0]])
  })

  it('should show "No locations" message when search returns no results', async () => {
    const store = useWeatherStore()
    const wrapper = mount(LocationSearch, {
      props: {
        results: store.searchResults,
      },
    })

    // Type a query that returns no results
    const input = wrapper.find('.search-input')
    await input.setValue('XyzNonexistentPlace')

    vi.advanceTimersByTime(300)
    await flushPromises()
    await wrapper.vm.$nextTick()

    // Should show no results message
    expect(wrapper.find('.no-results').exists()).toBe(true)
    expect(wrapper.text()).toContain('No locations match your criteria')
  })

  it('should handle search error gracefully', async () => {
    const mockError = {
      type: 'network' as const,
      message: 'Network error',
      suggestion: 'Check your connection',
      retryable: true,
    }

    ;(weatherApi.searchLocations as any).mockResolvedValueOnce(mockError)

    const store = useWeatherStore()
    const wrapper = mount(LocationSearch, {
      props: {
        results: store.searchResults,
        hasError: true,
      },
    })

    const input = wrapper.find('.search-input')
    await input.setValue('New York')

    vi.advanceTimersByTime(300)
    await flushPromises()

    // Error should be tracked in store, component should still be functional
    expect(input.exists()).toBe(true)
  })

  it('should support keyboard navigation in full flow', async () => {
    const mockResults = [
      {
        id: '1',
        name: 'New York',
        region: 'NY',
        country: 'USA',
        lat: 40.7128,
        lon: -74.006,
      },
      {
        id: '2',
        name: 'New Orleans',
        region: 'LA',
        country: 'USA',
        lat: 29.9511,
        lon: -90.2623,
      },
      {
        id: '3',
        name: 'Newark',
        region: 'NJ',
        country: 'USA',
        lat: 40.7357,
        lon: -74.1724,
      },
    ]

    const store = useWeatherStore()
    store.searchResults = mockResults

    const wrapper = mount(LocationSearch, {
      props: {
        results: store.searchResults,
      },
    })

    const input = wrapper.find('.search-input')
    await input.setValue('New')

    vi.advanceTimersByTime(300)
    await wrapper.vm.$nextTick()

    // Navigate down to first item
    await input.trigger('keydown', { key: 'ArrowDown' })
    await wrapper.vm.$nextTick()

    let items = wrapper.findAll('.result-item')
    expect(items[0].classes()).toContain('highlighted')

    // Navigate down to second item
    await input.trigger('keydown', { key: 'ArrowDown' })
    await wrapper.vm.$nextTick()

    items = wrapper.findAll('.result-item')
    expect(items[1].classes()).toContain('highlighted')

    // Navigate back up
    await input.trigger('keydown', { key: 'ArrowUp' })
    await wrapper.vm.$nextTick()

    items = wrapper.findAll('.result-item')
    expect(items[0].classes()).toContain('highlighted')

    // Select with Enter
    await input.trigger('keydown', { key: 'Enter' })
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')?.[0]).toEqual([mockResults[0]])

    // Input should be cleared
    expect((input.element as HTMLInputElement).value).toBe('')

    // Dropdown should be closed
    expect(wrapper.find('.dropdown-results').exists()).toBe(false)
  })

  it('should handle rapid search queries correctly', async () => {
    const store = useWeatherStore()
    const wrapper = mount(LocationSearch, {
      props: {
        results: store.searchResults,
      },
    })

    const input = wrapper.find('.search-input')

    // Type "L"
    await input.setValue('L')
    vi.advanceTimersByTime(100)

    // Type "Lo" (before first debounce completes)
    await input.setValue('Lo')
    vi.advanceTimersByTime(100)

    // Type "Los" (before first debounce completes)
    await input.setValue('Los')

    // Now let debounce complete
    vi.advanceTimersByTime(300)
    await flushPromises()

    // Component should emit search event only once with final query
    expect(wrapper.emitted('search')).toHaveLength(1)
    expect(wrapper.emitted('search')?.[0]).toEqual(['Los'])
  })
})
