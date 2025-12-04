/**
 * Error Handler Service Tests
 */

import { describe, it, expect } from 'vitest'
import {
  createWeatherError,
  handleError,
  validateLocationSearch,
  handleHttpError,
} from '@/services/errorHandler'
import { ErrorType } from '@/types/weather'

describe('errorHandler', () => {
  describe('createWeatherError', () => {
    it('should create validation error', () => {
      const error = createWeatherError(ErrorType.VALIDATION_ERROR)
      expect(error.type).toBe(ErrorType.VALIDATION_ERROR)
      expect(error.message).toContain('valid location')
      expect(error.retryable).toBe(true)
    })

    it('should create location not found error', () => {
      const error = createWeatherError(ErrorType.LOCATION_NOT_FOUND)
      expect(error.type).toBe(ErrorType.LOCATION_NOT_FOUND)
      expect(error.message).toContain('No locations match')
      expect(error.retryable).toBe(true)
    })

    it('should create network error', () => {
      const error = createWeatherError(ErrorType.NETWORK_ERROR, 'Network timeout')
      expect(error.type).toBe(ErrorType.NETWORK_ERROR)
      expect(error.message).toContain('Unable to connect')
      expect(error.technicalDetails).toBe('Network timeout')
      expect(error.retryable).toBe(true)
    })

    it('should create API error', () => {
      const error = createWeatherError(ErrorType.API_ERROR)
      expect(error.type).toBe(ErrorType.API_ERROR)
      expect(error.message).toContain('Weather service unavailable')
      expect(error.retryable).toBe(true)
    })

    it('should create timeout error', () => {
      const error = createWeatherError(ErrorType.TIMEOUT_ERROR)
      expect(error.type).toBe(ErrorType.TIMEOUT_ERROR)
      expect(error.message).toContain('took too long')
      expect(error.retryable).toBe(true)
    })

    it('should create geolocation denied error', () => {
      const error = createWeatherError(ErrorType.GEOLOCATION_DENIED)
      expect(error.type).toBe(ErrorType.GEOLOCATION_DENIED)
      expect(error.message).toContain('Location permission denied')
      expect(error.retryable).toBe(false)
    })

    it('should create geolocation unavailable error', () => {
      const error = createWeatherError(ErrorType.GEOLOCATION_UNAVAILABLE)
      expect(error.type).toBe(ErrorType.GEOLOCATION_UNAVAILABLE)
      expect(error.message).toContain('location could not be determined')
      expect(error.retryable).toBe(false)
    })

    it('should create unknown error', () => {
      const error = createWeatherError(ErrorType.UNKNOWN_ERROR)
      expect(error.type).toBe(ErrorType.UNKNOWN_ERROR)
      expect(error.message).toContain('unexpected error')
      expect(error.retryable).toBe(true)
    })
  })

  describe('handleError', () => {
    it('should handle network error', () => {
      const error = new TypeError('Failed to fetch')
      const result = handleError(error)
      expect(result.type).toBe(ErrorType.NETWORK_ERROR)
      expect(result.retryable).toBe(true)
    })

    it('should handle abort error (timeout)', () => {
      const error = new Error('Request aborted')
      error.name = 'AbortError'
      const result = handleError(error)
      expect(result.type).toBe(ErrorType.TIMEOUT_ERROR)
      expect(result.retryable).toBe(true)
    })

    it('should handle not found error', () => {
      const error = new Error('Location not found')
      const result = handleError(error)
      expect(result.type).toBe(ErrorType.LOCATION_NOT_FOUND)
    })

    it('should handle API error', () => {
      const error = new Error('API error occurred')
      const result = handleError(error)
      expect(result.type).toBe(ErrorType.API_ERROR)
    })

    it('should handle timeout error message', () => {
      const error = new Error('Connection timeout')
      const result = handleError(error)
      expect(result.type).toBe(ErrorType.TIMEOUT_ERROR)
    })

    it('should handle unknown error as fallback', () => {
      const error = new Error('Some weird error')
      const result = handleError(error)
      expect(result.type).toBe(ErrorType.UNKNOWN_ERROR)
    })

    it('should handle non-Error objects', () => {
      const result = handleError('random string')
      expect(result.type).toBe(ErrorType.UNKNOWN_ERROR)
      expect(result.message).toContain('unexpected')
    })
  })

  describe('validateLocationSearch', () => {
    it('should return null for valid search', () => {
      const result = validateLocationSearch('New York')
      expect(result).toBeNull()
    })

    it('should return null for two character search', () => {
      const result = validateLocationSearch('NY')
      expect(result).toBeNull()
    })

    it('should return error for empty search', () => {
      const result = validateLocationSearch('')
      expect(result).not.toBeNull()
      expect(result?.type).toBe(ErrorType.VALIDATION_ERROR)
    })

    it('should return error for whitespace only search', () => {
      const result = validateLocationSearch('   ')
      expect(result).not.toBeNull()
      expect(result?.type).toBe(ErrorType.VALIDATION_ERROR)
    })

    it('should return error for single character search', () => {
      const result = validateLocationSearch('A')
      expect(result).not.toBeNull()
      expect(result?.type).toBe(ErrorType.VALIDATION_ERROR)
    })
  })

  describe('handleHttpError', () => {
    it('should handle 404 as location not found', () => {
      const error = handleHttpError(404, 'Not Found')
      expect(error.type).toBe(ErrorType.LOCATION_NOT_FOUND)
      expect(error.retryable).toBe(true)
    })

    it('should handle 500+ as API error', () => {
      const error = handleHttpError(500, 'Internal Server Error')
      expect(error.type).toBe(ErrorType.API_ERROR)
      expect(error.retryable).toBe(true)
    })

    it('should handle 503 as API error', () => {
      const error = handleHttpError(503, 'Service Unavailable')
      expect(error.type).toBe(ErrorType.API_ERROR)
    })

    it('should handle 429 rate limit as API error', () => {
      const error = handleHttpError(429, 'Too Many Requests')
      expect(error.type).toBe(ErrorType.API_ERROR)
      expect(error.message).toContain('Weather service unavailable')
    })

    it('should handle other statuses as unknown', () => {
      const error = handleHttpError(400, 'Bad Request')
      expect(error.type).toBe(ErrorType.UNKNOWN_ERROR)
    })
  })
})
