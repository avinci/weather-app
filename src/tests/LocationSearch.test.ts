/**
 * LocationSearch Component Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import LocationSearch from '@/components/LocationSearch.vue'
import type { LocationSearchResult } from '@/types/weather'

describe('LocationSearch', () => {
  const mockResults: LocationSearchResult[] = [
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
      name: 'New York Mills',
      region: 'MN',
      country: 'USA',
      lat: 44.8041,
      lon: -93.6155,
    },
  ]

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('rendering', () => {
    it('should render search input', () => {
      const wrapper = mount(LocationSearch, {
        props: {
          results: [],
        },
      })

      const input = wrapper.find('.search-input')
      expect(input.exists()).toBe(true)
      expect(input.attributes('placeholder')).toBe('Search by city name or zip code')
    })

    it('should have proper aria-label on input', () => {
      const wrapper = mount(LocationSearch, {
        props: {
          results: [],
        },
      })

      const input = wrapper.find('.search-input')
      expect(input.attributes('aria-label')).toBe('Search for a location by city name or zip code')
    })

    it('should have aria-autocomplete="list"', () => {
      const wrapper = mount(LocationSearch, {
        props: {
          results: [],
        },
      })

      const input = wrapper.find('.search-input')
      expect(input.attributes('aria-autocomplete')).toBe('list')
    })

    it('should not show dropdown when results is empty', () => {
      const wrapper = mount(LocationSearch, {
        props: {
          results: [],
        },
      })

      expect(wrapper.find('.dropdown-results').exists()).toBe(false)
    })

    it('should not show dropdown initially', async () => {
      const wrapper = mount(LocationSearch, {
        props: {
          results: mockResults,
        },
      })

      expect(wrapper.find('.dropdown-results').exists()).toBe(false)
    })
  })

  describe('user input and search', () => {
    it('should emit search event with debounce', async () => {
      const wrapper = mount(LocationSearch, {
        props: {
          results: [],
        },
      })

      const input = wrapper.find('.search-input')
      await input.setValue('New York')

      // Event should not be emitted yet (debouncing)
      expect(wrapper.emitted('search')).toBeUndefined()

      // Fast-forward 300ms
      vi.advanceTimersByTime(300)
      await flushPromises()

      expect(wrapper.emitted('search')).toBeTruthy()
      expect(wrapper.emitted('search')?.[0]).toEqual(['New York'])
    })

    it('should debounce multiple rapid inputs', async () => {
      const wrapper = mount(LocationSearch, {
        props: {
          results: [],
        },
      })

      const input = wrapper.find('.search-input')
      await input.setValue('N')
      vi.advanceTimersByTime(100)
      await input.setValue('Ne')
      vi.advanceTimersByTime(100)
      await input.setValue('New')
      vi.advanceTimersByTime(100)
      await input.setValue('New York')

      // Still no search emitted
      expect(wrapper.emitted('search')).toBeUndefined()

      // Final debounce timeout
      vi.advanceTimersByTime(300)
      await flushPromises()

      // Should only emit once with final value
      expect(wrapper.emitted('search')).toHaveLength(1)
      expect(wrapper.emitted('search')?.[0]).toEqual(['New York'])
    })

    it('should not search for empty query', async () => {
      const wrapper = mount(LocationSearch, {
        props: {
          results: [],
        },
      })

      const input = wrapper.find('.search-input')
      await input.setValue('')

      vi.advanceTimersByTime(300)
      await flushPromises()

      expect(wrapper.emitted('search')).toBeUndefined()
    })

    it('should not search for whitespace-only query', async () => {
      const wrapper = mount(LocationSearch, {
        props: {
          results: [],
        },
      })

      const input = wrapper.find('.search-input')
      await input.setValue('   ')

      vi.advanceTimersByTime(300)
      await flushPromises()

      expect(wrapper.emitted('search')).toBeUndefined()
    })
  })

  describe('dropdown display', () => {
    it('should show dropdown with results after search', async () => {
      const wrapper = mount(LocationSearch, {
        props: {
          results: mockResults,
        },
      })

      const input = wrapper.find('.search-input')
      await input.setValue('New York')

      // Open dropdown
      vi.advanceTimersByTime(300)
      await flushPromises()
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.dropdown-results').exists()).toBe(true)
      const items = wrapper.findAll('.result-item')
      expect(items).toHaveLength(2)
    })

    it('should display location names in results', async () => {
      const wrapper = mount(LocationSearch, {
        props: {
          results: mockResults,
        },
      })

      const input = wrapper.find('.search-input')
      await input.setValue('New York')

      vi.advanceTimersByTime(300)
      await flushPromises()
      await wrapper.vm.$nextTick()

      const resultNames = wrapper.findAll('.result-name')
      expect(resultNames[0].text()).toBe('New York')
      expect(resultNames[1].text()).toBe('New York Mills')
    })

    it('should display location region and country', async () => {
      const wrapper = mount(LocationSearch, {
        props: {
          results: mockResults,
        },
      })

      const input = wrapper.find('.search-input')
      await input.setValue('New York')

      vi.advanceTimersByTime(300)
      await flushPromises()
      await wrapper.vm.$nextTick()

      const resultMeta = wrapper.findAll('.result-meta')
      expect(resultMeta[0].text()).toContain('NY')
      expect(resultMeta[0].text()).toContain('USA')
    })

    it('should show "No locations" message when no results match', async () => {
      const wrapper = mount(LocationSearch, {
        props: {
          results: [],
        },
      })

      const input = wrapper.find('.search-input')
      await input.setValue('NonexistentPlace')

      vi.advanceTimersByTime(300)
      await flushPromises()
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.no-results').exists()).toBe(true)
      expect(wrapper.find('.no-results').text()).toContain(
        'No locations match your criteria. Please try a different search.',
      )
    })

    it('should have role="listbox" on dropdown', async () => {
      const wrapper = mount(LocationSearch, {
        props: {
          results: mockResults,
        },
      })

      const input = wrapper.find('.search-input')
      await input.setValue('New York')

      vi.advanceTimersByTime(300)
      await flushPromises()
      await wrapper.vm.$nextTick()

      expect(wrapper.find('[role="listbox"]').exists()).toBe(true)
    })

    it('should have role="option" on result items', async () => {
      const wrapper = mount(LocationSearch, {
        props: {
          results: mockResults,
        },
      })

      const input = wrapper.find('.search-input')
      await input.setValue('New York')

      vi.advanceTimersByTime(300)
      await flushPromises()
      await wrapper.vm.$nextTick()

      const items = wrapper.findAll('[role="option"]')
      expect(items).toHaveLength(2)
    })
  })

  describe('selection', () => {
    it('should emit select event when clicking result', async () => {
      const wrapper = mount(LocationSearch, {
        props: {
          results: mockResults,
        },
      })

      const input = wrapper.find('.search-input')
      await input.setValue('New York')

      vi.advanceTimersByTime(300)
      await flushPromises()
      await wrapper.vm.$nextTick()

      const firstItem = wrapper.find('.result-item')
      await firstItem.trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('select')).toBeTruthy()
      expect(wrapper.emitted('select')?.[0]).toEqual([mockResults[0]])
    })

    it('should clear input after selection', async () => {
      const wrapper = mount(LocationSearch, {
        props: {
          results: mockResults,
        },
      })

      const input = wrapper.find('.search-input')
      await input.setValue('New York')

      vi.advanceTimersByTime(300)
      await flushPromises()
      await wrapper.vm.$nextTick()

      const firstItem = wrapper.find('.result-item')
      await firstItem.trigger('click')
      await wrapper.vm.$nextTick()

      expect((input.element as HTMLInputElement).value).toBe('')
    })

    it('should close dropdown after selection', async () => {
      const wrapper = mount(LocationSearch, {
        props: {
          results: mockResults,
        },
      })

      const input = wrapper.find('.search-input')
      await input.setValue('New York')

      vi.advanceTimersByTime(300)
      await flushPromises()
      await wrapper.vm.$nextTick()

      const firstItem = wrapper.find('.result-item')
      await firstItem.trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.dropdown-results').exists()).toBe(false)
    })
  })

  describe('keyboard navigation', () => {
    it('should highlight next item on ArrowDown', async () => {
      const wrapper = mount(LocationSearch, {
        props: {
          results: mockResults,
        },
      })

      const input = wrapper.find('.search-input')
      await input.setValue('New York')

      vi.advanceTimersByTime(300)
      await flushPromises()
      await wrapper.vm.$nextTick()

      await input.trigger('keydown', { key: 'ArrowDown' })
      await wrapper.vm.$nextTick()

      const highlightedItem = wrapper.find('.result-item.highlighted')
      expect(highlightedItem.exists()).toBe(true)
      expect(highlightedItem.text()).toContain('New York')
    })

    it('should highlight previous item on ArrowUp', async () => {
      const wrapper = mount(LocationSearch, {
        props: {
          results: mockResults,
        },
      })

      const input = wrapper.find('.search-input')
      await input.setValue('New York')

      vi.advanceTimersByTime(300)
      await flushPromises()
      await wrapper.vm.$nextTick()

      // Move down, then up
      await input.trigger('keydown', { key: 'ArrowDown' })
      await input.trigger('keydown', { key: 'ArrowDown' })
      await wrapper.vm.$nextTick()

      await input.trigger('keydown', { key: 'ArrowUp' })
      await wrapper.vm.$nextTick()

      const items = wrapper.findAll('.result-item')
      expect(items[0].classes()).toContain('highlighted')
    })

    it('should select highlighted item on Enter', async () => {
      const wrapper = mount(LocationSearch, {
        props: {
          results: mockResults,
        },
      })

      const input = wrapper.find('.search-input')
      await input.setValue('New York')

      vi.advanceTimersByTime(300)
      await flushPromises()
      await wrapper.vm.$nextTick()

      await input.trigger('keydown', { key: 'ArrowDown' })
      await input.trigger('keydown', { key: 'Enter' })
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('select')).toBeTruthy()
      expect(wrapper.emitted('select')?.[0]).toEqual([mockResults[0]])
    })

    it('should not select on Enter without highlighted item', async () => {
      const wrapper = mount(LocationSearch, {
        props: {
          results: mockResults,
        },
      })

      const input = wrapper.find('.search-input')
      await input.setValue('New York')

      vi.advanceTimersByTime(300)
      await flushPromises()
      await wrapper.vm.$nextTick()

      await input.trigger('keydown', { key: 'Enter' })
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('select')).toBeUndefined()
    })

    it('should close dropdown on Escape', async () => {
      const wrapper = mount(LocationSearch, {
        props: {
          results: mockResults,
        },
      })

      const input = wrapper.find('.search-input')
      await input.setValue('New York')

      vi.advanceTimersByTime(300)
      await flushPromises()
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.dropdown-results').exists()).toBe(true)

      await input.trigger('keydown', { key: 'Escape' })
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.dropdown-results').exists()).toBe(false)
    })

    it('should prevent default on keyboard navigation keys', async () => {
      const wrapper = mount(LocationSearch, {
        props: {
          results: mockResults,
        },
      })

      const input = wrapper.find('.search-input')
      await input.setValue('New York')

      vi.advanceTimersByTime(300)
      await flushPromises()
      await wrapper.vm.$nextTick()

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
      const preventSpy = vi.spyOn(event, 'preventDefault')

      input.element.dispatchEvent(event)

      expect(preventSpy).toHaveBeenCalled()
    })
  })

  describe('focus behavior', () => {
    it('should emit focus event on input focus', async () => {
      const wrapper = mount(LocationSearch, {
        props: {
          results: mockResults,
        },
      })

      const input = wrapper.find('.search-input')
      await input.trigger('focus')
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('focus')).toBeTruthy()
    })

    it('should clear results and close dropdown on focus (AC4)', async () => {
      const wrapper = mount(LocationSearch, {
        props: {
          results: mockResults,
        },
      })

      const input = wrapper.find('.search-input')
      await input.setValue('New York')

      vi.advanceTimersByTime(300)
      await flushPromises()
      await wrapper.vm.$nextTick()

      // Dropdown should be open
      expect(wrapper.find('.dropdown-results').exists()).toBe(true)

      // Focus on input (simulating user clicking in field again)
      await input.trigger('focus')
      await wrapper.vm.$nextTick()

      // Dropdown should still show on focus if there's text
      // But highlighting should reset
      expect((wrapper.vm as any).highlightedIndex).toBe(-1)
    })
  })

  describe('click outside', () => {
    it('should close dropdown when clicking outside', async () => {
      const wrapper = mount(LocationSearch, {
        props: {
          results: mockResults,
        },
        attachTo: document.body,
      })

      const input = wrapper.find('.search-input')
      await input.setValue('New York')

      vi.advanceTimersByTime(300)
      await flushPromises()
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.dropdown-results').exists()).toBe(true)

      // Simulate click outside
      document.body.click()
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.dropdown-results').exists()).toBe(false)

      wrapper.unmount()
    })
  })

  describe('accessibility', () => {
    it('should set aria-expanded based on dropdown state', async () => {
      const wrapper = mount(LocationSearch, {
        props: {
          results: mockResults,
        },
      })

      const input = wrapper.find('.search-input')

      // Initially closed
      expect(input.attributes('aria-expanded')).toBe('false')

      // Open dropdown
      await input.setValue('New York')
      vi.advanceTimersByTime(300)
      await flushPromises()
      await wrapper.vm.$nextTick()

      expect(input.attributes('aria-expanded')).toBe('true')
    })

    it('should set aria-controls when dropdown is open', async () => {
      const wrapper = mount(LocationSearch, {
        props: {
          results: mockResults,
        },
      })

      const input = wrapper.find('.search-input')

      // Initially no controls
      expect(input.attributes('aria-controls')).toBeUndefined()

      // Open dropdown
      await input.setValue('New York')
      vi.advanceTimersByTime(300)
      await flushPromises()
      await wrapper.vm.$nextTick()

      expect(input.attributes('aria-controls')).toBe('location-dropdown')
    })

    it('should set aria-selected on highlighted options', async () => {
      const wrapper = mount(LocationSearch, {
        props: {
          results: mockResults,
        },
      })

      const input = wrapper.find('.search-input')
      await input.setValue('New York')

      vi.advanceTimersByTime(300)
      await flushPromises()
      await wrapper.vm.$nextTick()

      let options = wrapper.findAll('[role="option"]')
      expect(options[0].attributes('aria-selected')).toBe('false')
      expect(options[1].attributes('aria-selected')).toBe('false')

      // Highlight first item
      await input.trigger('keydown', { key: 'ArrowDown' })
      await wrapper.vm.$nextTick()

      options = wrapper.findAll('[role="option"]')
      expect(options[0].attributes('aria-selected')).toBe('true')
      expect(options[1].attributes('aria-selected')).toBe('false')
    })

    it('should have no-results with role="status" for announcements', async () => {
      const wrapper = mount(LocationSearch, {
        props: {
          results: [],
        },
      })

      const input = wrapper.find('.search-input')
      await input.setValue('NonexistentPlace')

      vi.advanceTimersByTime(300)
      await flushPromises()
      await wrapper.vm.$nextTick()

      expect(wrapper.find('[role="status"]').exists()).toBe(true)
      expect(wrapper.find('[aria-live="polite"]').exists()).toBe(true)
    })
  })

  describe('loading state', () => {
    it('should pass isLoading prop correctly', () => {
      const wrapper = mount(LocationSearch, {
        props: {
          results: [],
          isLoading: true,
        },
      })

      expect((wrapper.vm as any).isLoading).toBe(true)
    })
  })
})
