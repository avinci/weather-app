/**
 * Geolocation Service Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getLocation, isGeolocationSupported } from '@/services/geolocation'

describe('geolocation', () => {
  let mockGetCurrentPosition: any

  beforeEach(() => {
    mockGetCurrentPosition = vi.fn()
    ;(global.navigator as any) = {
      geolocation: {
        getCurrentPosition: mockGetCurrentPosition,
      },
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('isGeolocationSupported', () => {
    it('should return true when geolocation is available', () => {
      expect(isGeolocationSupported()).toBe(true)
    })

    it('should return false when geolocation is not available', () => {
      ;(global.navigator as any) = {}
      expect(isGeolocationSupported()).toBe(false)
    })
  })

  describe('getLocation', () => {
    it('should return success with coordinates on success', async () => {
      const mockCoords = {
        latitude: 40.7128,
        longitude: -74.006,
        accuracy: 10,
      }

      mockGetCurrentPosition.mockImplementation((success: any) => {
        success({ coords: mockCoords })
      })

      const result = await getLocation()

      expect(result.success).toBe(true)
      expect(result.coordinates).toEqual(mockCoords)
      expect(result.error).toBeUndefined()
    })

    it('should return error denied on permission denied', async () => {
      const mockError = {
        code: 1, // PERMISSION_DENIED
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
        message: 'Permission denied',
      }

      mockGetCurrentPosition.mockImplementation((_success: any, error: any) => {
        error(mockError)
      })

      const result = await getLocation()

      expect(result.success).toBe(false)
      expect(result.error).toBe('denied')
      expect(result.coordinates).toBeUndefined()
    })

    it('should return error unavailable on position unavailable', async () => {
      const mockError = {
        code: 2, // POSITION_UNAVAILABLE
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
        message: 'Position unavailable',
      }

      mockGetCurrentPosition.mockImplementation((_success: any, error: any) => {
        error(mockError)
      })

      const result = await getLocation()

      expect(result.success).toBe(false)
      expect(result.error).toBe('unavailable')
    })

    it('should return error timeout on timeout', async () => {
      const mockError = {
        code: 3, // TIMEOUT
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
        message: 'Timeout',
      }

      mockGetCurrentPosition.mockImplementation((_success: any, error: any) => {
        error(mockError)
      })

      const result = await getLocation()

      expect(result.success).toBe(false)
      expect(result.error).toBe('timeout')
    })

    it('should return error unknown for unknown error codes', async () => {
      const mockError = new Error('Unknown error')
      ;(mockError as any).code = 999

      mockGetCurrentPosition.mockImplementation((_success: any, error: any) => {
        error(mockError)
      })

      const result = await getLocation()

      expect(result.success).toBe(false)
      expect(result.error).toBe('unknown')
    })

    it('should pass correct options to getCurrentPosition', async () => {
      mockGetCurrentPosition.mockImplementation((success: any) => {
        success({ coords: { latitude: 0, longitude: 0, accuracy: 0 } })
      })

      await getLocation()

      expect(mockGetCurrentPosition).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        expect.objectContaining({
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 0,
        }),
      )
    })

    it('should return unavailable when geolocation is not supported', async () => {
      ;(global.navigator as any) = {}

      const result = await getLocation()

      expect(result.success).toBe(false)
      expect(result.error).toBe('unavailable')
    })
  })
})
