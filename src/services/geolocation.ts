/**
 * Geolocation Service
 * Wrapper around browser Geolocation API with silent failure handling
 */

import type { GeolocationResult } from '@/types/weather'

/**
 * Request user's current location
 * Returns null on any error (silent failure per spec)
 */
export async function getLocation(): Promise<GeolocationResult> {
  // Check if geolocation is supported
  if (!navigator.geolocation) {
    return {
      success: false,
      error: 'unavailable',
    }
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      // Success callback
      (position) => {
        const coords = position.coords
        const result: GeolocationResult = {
          success: true,
          coordinates: {
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: coords.accuracy,
          },
        }
        resolve(result)
      },
      // Error callback
      (error) => {
        let errorType: 'denied' | 'unavailable' | 'timeout' | 'unknown'

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorType = 'denied'
            break
          case error.POSITION_UNAVAILABLE:
            errorType = 'unavailable'
            break
          case error.TIMEOUT:
            errorType = 'timeout'
            break
          default:
            errorType = 'unknown'
        }

        resolve({
          success: false,
          error: errorType,
        })
      },
      // Options
      {
        enableHighAccuracy: false, // Don't require high accuracy (faster)
        timeout: 10000, // 10 second timeout
        maximumAge: 0, // Don't use cached position
      },
    )
  })
}

/**
 * Check if geolocation is supported by the browser
 */
export function isGeolocationSupported(): boolean {
  return !!navigator.geolocation
}
