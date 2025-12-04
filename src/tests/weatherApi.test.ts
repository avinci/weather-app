/**
 * Weather API Service Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { cancelSearch } from '@/services/weatherApi'
import { validateLocationSearch } from '@/services/errorHandler'
import { ErrorType } from '@/types/weather'

describe('weatherApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('search validation', () => {
    it('should validate empty query', () => {
      const error = validateLocationSearch('')

      expect(error).not.toBeNull()
      expect(error?.type).toBe(ErrorType.VALIDATION_ERROR)
    })

    it('should validate short query', () => {
      const error = validateLocationSearch('A')

      expect(error).not.toBeNull()
      expect(error?.type).toBe(ErrorType.VALIDATION_ERROR)
    })

    it('should accept valid query', () => {
      const error = validateLocationSearch('New York')

      expect(error).toBeNull()
    })

    it('should accept two character query', () => {
      const error = validateLocationSearch('NY')

      expect(error).toBeNull()
    })
  })

  describe('cancelSearch', () => {
    it('should not throw when called', () => {
      expect(() => cancelSearch()).not.toThrow()
    })
  })
})
