/**
 * ZIP Code Search Test
 * Tests that ZIP codes like 98072 can be searched
 */

import { describe, it, expect } from 'vitest'
import { validateLocationSearch } from '@/services/errorHandler'

describe('ZIP Code Search', () => {
  it('should accept 98072 as valid search query', () => {
    const error = validateLocationSearch('98072')
    expect(error).toBeNull()
  })

  it('should accept 5-digit zip codes', () => {
    const error = validateLocationSearch('10001')
    expect(error).toBeNull()
  })

  it('should accept 9-digit zip codes (ZIP+4)', () => {
    const error = validateLocationSearch('98072-1234')
    expect(error).toBeNull()
  })

  it('should accept 2-character state codes', () => {
    const error = validateLocationSearch('WA')
    expect(error).toBeNull()
  })

  it('should reject single character', () => {
    const error = validateLocationSearch('9')
    expect(error).not.toBeNull()
  })

  it('should reject empty string', () => {
    const error = validateLocationSearch('')
    expect(error).not.toBeNull()
  })
})
