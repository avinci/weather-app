/**
 * Error Handler Service
 * Centralized error mapping and user-friendly message generation
 */

import type { WeatherError, ErrorType } from '@/types/weather'
import { ErrorType as ErrorTypeConst } from '@/types/weather'

/**
 * Map errors to user-friendly messages and categorize them
 */
export function createWeatherError(
  type: ErrorType,
  technicalDetails?: string,
): WeatherError {
  const errorMap: Record<ErrorType, { message: string; suggestion: string; retryable: boolean }> = {
    [ErrorTypeConst.VALIDATION_ERROR]: {
      message: 'Please enter a valid location (city name or zip code).',
      suggestion: 'Try a different search term.',
      retryable: true,
    },
    [ErrorTypeConst.LOCATION_NOT_FOUND]: {
      message: 'No locations match your criteria. Please try a different search.',
      suggestion: 'Search for a nearby city or try a different spelling.',
      retryable: true,
    },
    [ErrorTypeConst.NETWORK_ERROR]: {
      message: 'Unable to connect. Please check your internet and try again.',
      suggestion: 'Check your connection and retry.',
      retryable: true,
    },
    [ErrorTypeConst.API_ERROR]: {
      message: 'Weather service unavailable. Please try again later.',
      suggestion: 'Try again in a few moments.',
      retryable: true,
    },
    [ErrorTypeConst.TIMEOUT_ERROR]: {
      message: 'Request took too long. Please try again.',
      suggestion: 'Check your connection and retry.',
      retryable: true,
    },
    [ErrorTypeConst.GEOLOCATION_DENIED]: {
      message: 'Location permission denied. Please use the search box to find a location.',
      suggestion: 'You can search for a location manually.',
      retryable: false,
    },
    [ErrorTypeConst.GEOLOCATION_UNAVAILABLE]: {
      message: 'Your location could not be determined. Please use the search box.',
      suggestion: 'You can search for a location manually.',
      retryable: false,
    },
    [ErrorTypeConst.UNKNOWN_ERROR]: {
      message: 'An unexpected error occurred. Please try again.',
      suggestion: 'If the problem persists, try refreshing the page.',
      retryable: true,
    },
  }

  const errorInfo = errorMap[type] ?? errorMap[ErrorTypeConst.UNKNOWN_ERROR]

  return {
    type,
    message: errorInfo.message,
    suggestion: errorInfo.suggestion,
    technicalDetails,
    retryable: errorInfo.retryable,
  }
}

/**
 * Categorize and handle different error types
 */
export function handleError(error: unknown): WeatherError {
  // Handle network errors
  if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
    return createWeatherError(
      ErrorTypeConst.NETWORK_ERROR,
      `${error.name}: ${error.message}`,
    )
  }

  // Handle timeout errors
  if (error instanceof Error && error.name === 'AbortError') {
    return createWeatherError(
      ErrorTypeConst.TIMEOUT_ERROR,
      'Request was aborted or timed out',
    )
  }

  // Handle WeatherAPI errors
  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    if (message.includes('not found') || message.includes('no matching')) {
      return createWeatherError(
        ErrorTypeConst.LOCATION_NOT_FOUND,
        error.message,
      )
    }

    if (message.includes('api') || message.includes('service')) {
      return createWeatherError(
        ErrorTypeConst.API_ERROR,
        error.message,
      )
    }

    if (message.includes('timeout')) {
      return createWeatherError(
        ErrorTypeConst.TIMEOUT_ERROR,
        error.message,
      )
    }
  }

  // Default unknown error
  return createWeatherError(
    ErrorTypeConst.UNKNOWN_ERROR,
    error instanceof Error ? error.message : String(error),
  )
}

/**
 * Validate location search input
 */
export function validateLocationSearch(query: string): WeatherError | null {
  if (!query || query.trim().length === 0) {
    return createWeatherError(
      ErrorTypeConst.VALIDATION_ERROR,
      'Empty search query',
    )
  }

  if (query.trim().length < 2) {
    return createWeatherError(
      ErrorTypeConst.VALIDATION_ERROR,
      'Search query too short',
    )
  }

  return null
}

/**
 * Handle HTTP error responses
 */
export function handleHttpError(status: number, statusText: string): WeatherError {
  if (status === 404) {
    return createWeatherError(
      ErrorTypeConst.LOCATION_NOT_FOUND,
      `HTTP ${status}: ${statusText}`,
    )
  }

  if (status >= 500) {
    return createWeatherError(
      ErrorTypeConst.API_ERROR,
      `HTTP ${status}: ${statusText}`,
    )
  }

  if (status === 429) {
    return createWeatherError(
      ErrorTypeConst.API_ERROR,
      'Too many requests - rate limited',
    )
  }

  return createWeatherError(
    ErrorTypeConst.UNKNOWN_ERROR,
    `HTTP ${status}: ${statusText}`,
  )
}
