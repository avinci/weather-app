/**
 * Weather Data Types
 * All TypeScript interfaces for the weather app
 */

// ============ Temperature Unit ============

export const TemperatureUnit = {
  FAHRENHEIT: 'F' as const,
  CELSIUS: 'C' as const,
} as const

export type TemperatureUnit = (typeof TemperatureUnit)[keyof typeof TemperatureUnit]

// ============ Location Types ============

export interface Location {
  id: string; // Unique identifier (lat:lon)
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
}

export interface LocationSearchResult {
  id: string;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
}

// ============ Current Weather Types ============

export interface CurrentWeather {
  location: Location;
  temperature: number; // In selected unit (store converts)
  condition: string; // e.g., "Partly cloudy"
  conditionIcon: string; // URL to weather icon
  humidity: number; // 0-100
  windSpeed: number; // In selected unit (store converts)
  lastUpdated: string; // ISO timestamp
}

// ============ Hourly Forecast Types ============

export interface HourlyEntry {
  time: string; // Formatted time (e.g., "2:00 PM")
  temperature: number; // In selected unit
  condition: string;
  conditionIcon: string;
  windSpeed: number; // In selected unit
  humidity: number; // 0-100
  precipitationChance: number; // 0-100 percentage
}

// ============ Daily Forecast Types ============

export interface DailyEntry {
  date: string; // Formatted date (e.g., "Mon, Dec 4")
  dayOfWeek: string; // e.g., "Monday"
  highTemperature: number; // In selected unit
  lowTemperature: number; // In selected unit
  condition: string;
  conditionIcon: string;
  precipitationChance: number; // 0-100 percentage
}

// ============ Weather Data Collection ============

export interface WeatherData {
  current: CurrentWeather | null;
  hourly: HourlyEntry[]; // Next 12 hours
  daily: DailyEntry[]; // Next 7 days
}

// ============ Error Types ============

export const ErrorType = {
  VALIDATION_ERROR: 'validation' as const,
  LOCATION_NOT_FOUND: 'not_found' as const,
  NETWORK_ERROR: 'network' as const,
  API_ERROR: 'api' as const,
  TIMEOUT_ERROR: 'timeout' as const,
  GEOLOCATION_DENIED: 'geo_denied' as const,
  GEOLOCATION_UNAVAILABLE: 'geo_unavailable' as const,
  UNKNOWN_ERROR: 'unknown' as const,
} as const

export type ErrorType = (typeof ErrorType)[keyof typeof ErrorType]

export interface WeatherError {
  type: ErrorType;
  message: string; // User-facing message
  suggestion: string; // Recovery action
  technicalDetails?: string; // For logging only
  retryable: boolean;
}

// ============ Geolocation Types ============

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface GeolocationResult {
  success: boolean;
  coordinates?: GeolocationCoordinates;
  error?: 'denied' | 'unavailable' | 'timeout' | 'unknown';
}

// ============ WeatherAPI Response Types ============

export interface WeatherAPILocation {
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  tz_id: string;
  localtime_epoch: number;
  localtime: string;
}

export interface WeatherAPICondition {
  text: string;
  icon: string;
  code: number;
}

export interface WeatherAPICurrent {
  temp_c: number;
  temp_f: number;
  is_day: number;
  condition: WeatherAPICondition;
  wind_kph: number;
  wind_mph: number;
  humidity: number;
  precip_mm: number;
  precip_in: number;
}

export interface WeatherAPIHourly {
  time_epoch: number;
  time: string;
  temp_c: number;
  temp_f: number;
  is_day: number;
  condition: WeatherAPICondition;
  wind_kph: number;
  wind_mph: number;
  humidity: number;
  chance_of_rain: number;
}

export interface WeatherAPIDay {
  maxtemp_c: number;
  maxtemp_f: number;
  mintemp_c: number;
  mintemp_f: number;
  avgtemp_c: number;
  avgtemp_f: number;
  condition: WeatherAPICondition;
  daily_chance_of_rain: number;
  daily_chance_of_snow: number;
}

export interface WeatherAPIForecastDay {
  date: string;
  day: WeatherAPIDay;
  hour: WeatherAPIHourly[];
}

export interface WeatherAPIForecast {
  forecastday: WeatherAPIForecastDay[];
}

export interface WeatherAPIResponse {
  location: WeatherAPILocation;
  current: WeatherAPICurrent;
  forecast: WeatherAPIForecast;
}

export interface WeatherAPISearchResponse {
  id: number;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  url: string;
}

// ============ Temperature Conversion Helpers ============

export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

export function fahrenheitToCelsius(fahrenheit: number): number {
  return ((fahrenheit - 32) * 5) / 9;
}

/**
 * Convert Celsius to selected unit
 */
export function convertTemperature(celsius: number, unit: TemperatureUnit): number {
  return unit === TemperatureUnit.FAHRENHEIT ? celsiusToFahrenheit(celsius) : celsius;
}

/**
 * Format temperature for display
 */
export function formatTemperature(celsius: number, unit: TemperatureUnit): string {
  const value = convertTemperature(celsius, unit);
  return `${Math.round(value)}°${unit}`;
}

// ============ Pinia Store State ============

export interface WeatherStoreState {
  // Data
  weatherData: WeatherData;
  currentLocation: Location | null;

  // UI State
  temperatureUnit: TemperatureUnit;
  isSearching: boolean;
  isLoadingWeather: boolean;
  isRefreshing: boolean;

  // Error State
  searchError: WeatherError | null;
  weatherError: WeatherError | null;

  // For dropdown
  searchResults: LocationSearchResult[];
  lastSearchQuery: string;

  // Metadata
  lastUpdated: string | null; // ISO timestamp of last successful fetch
  abortController: AbortController | null;
}
