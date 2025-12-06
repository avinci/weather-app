# Implementation Plan: Build a Weather App

**Issue**: Linear #AVI-44  
**Project**: Avi's workspace / qbTest  
**Status**: In Progress  
**Spec**: build-a-weather-app.md

---

## Context

**Overview**:

A single-page Vue 3 web application that displays current weather conditions and hourly/daily forecasts for user-selected locations. Users can search by zip code or city name with real-time dropdown suggestions, optional automatic geolocation, and toggle between Fahrenheit and Celsius temperature units.

**Requirements**:
- Location search with real-time dropdown suggestions (zip code or city name)
- Automatic geolocation with silent fallback to manual search
- Current weather conditions display
- 12-hour hourly forecast (horizontal scrollable cards)
- 7-day daily forecast
- Temperature unit toggle (°F ↔ °C)
- Manual refresh button
- Comprehensive error handling and loading states
- No data persistence between sessions

**Acceptance Criteria**:
- Users can search and select a location within 2-3 interactions
- All three forecast sections (current, hourly, daily) visible on single page without excessive scrolling
- Temperature toggles update all displayed values immediately
- Error messages are clear and non-technical
- Loading indicators provide immediate feedback
- App handles all error scenarios gracefully (no crashes)

---

## Technology Stack

### Finalized Decisions

**Frontend**: Vue 3 with Composition API - Modern, reactive framework optimized for single-page applications with excellent developer experience

**State Management**: Pinia - Vue's official state management library, perfect for centralizing weather data, UI state, and loading/error states across components

**Styling**: Tailwind CSS - Utility-first CSS framework enabling rapid responsive design, excellent for desktop-first approach

**Testing**: Vitest + Vue Test Utils - Lightning-fast unit/integration testing optimized for Vue 3, excellent API mocking capabilities

**Weather API**: WeatherAPI.com - 1M calls/month free tier (ample for development), comprehensive hourly + daily forecast data, clean REST API

**Deployment**: Netlify - Simple, free tier sufficient, automatic deployments from repository, built-in environment secrets management

**Environment Management**: Environment variables (.env for development, Netlify secrets for production)

**Browser Support**: Evergreen browsers only (latest 2 versions) - ES2020+ syntax, no transpiling needed

**Accessibility**: WCAG 2.1 Level AA - Semantic HTML, keyboard navigation, screen reader support, good color contrast

---

## Architecture

### Project Structure

```
weather-app/
├── src/
│   ├── components/
│   │   ├── LocationSearch.vue          # Search input + dropdown results
│   │   ├── CurrentWeather.vue          # Current conditions display
│   │   ├── HourlyForecast.vue          # Container for hourly cards
│   │   ├── HourlyCard.vue              # Individual hour card (presentational)
│   │   ├── DailyForecast.vue           # Container for daily cards
│   │   ├── DailyCard.vue               # Individual day card (presentational)
│   │   ├── TemperatureToggle.vue       # °F / °C toggle button
│   │   ├── RefreshButton.vue           # Refresh data button
│   │   ├── LoadingSpinner.vue          # Loading indicator
│   │   └── ErrorMessage.vue            # Error display component
│   ├── stores/
│   │   └── weatherStore.ts             # Pinia store (state, actions, computed)
│   ├── services/
│   │   ├── weatherApi.ts               # WeatherAPI integration + HTTP calls
│   │   ├── geolocation.ts              # Browser geolocation wrapper
│   │   └── errorHandler.ts             # Centralized error handling
│   ├── types/
│   │   └── weather.ts                  # TypeScript interfaces
│   ├── App.vue                         # Root component
│   └── main.ts                         # App entry point
├── tests/
│   ├── unit/
│   │   ├── services/                   # API, geolocation, error handler tests
│   │   ├── stores/                     # Pinia store tests
│   │   └── utils/                      # Utility function tests
│   ├── components/
│   │   ├── LocationSearch.spec.ts
│   │   ├── CurrentWeather.spec.ts
│   │   ├── HourlyForecast.spec.ts
│   │   ├── DailyForecast.spec.ts
│   │   ├── TemperatureToggle.spec.ts
│   │   ├── RefreshButton.spec.ts
│   │   └── ErrorMessage.spec.ts
│   └── integration/
│       ├── search-to-display.spec.ts   # Search → API → Display flow
│       ├── temperature-toggle.spec.ts  # Toggle across all sections
│       └── error-handling.spec.ts      # Error scenarios end-to-end
├── .env.example                        # Template for environment variables
├── vite.config.ts                      # Vite build config
├── vitest.config.ts                    # Vitest config
├── tailwind.config.ts                  # Tailwind configuration
├── tsconfig.json                       # TypeScript configuration
├── package.json                        # Dependencies
└── README.md                           # Project documentation
```

### Key Architectural Patterns

**State Management**:
- Centralized Pinia store manages: current weather, hourly forecast, daily forecast, loading states (initial load, refresh, location search), error states, temperature unit preference
- Components subscribe to store via computed properties and actions
- No component-local state except temporary UI state (e.g., dropdown open/close)

**Data Flow**:
1. User enters search text → LocationSearch component
2. LocationSearch calls `weatherStore.searchLocations(query)`
3. Store action calls `weatherApi.searchLocations(query)` with debouncing
4. Results stream back to dropdown via computed property
5. User selects location → `weatherStore.selectLocation(location)`
6. Store fetches current + hourly + daily via `Promise.all()` for parallel requests
7. Store updates state → all subscribed components reactively update

**Error Handling**:
- Each data section (current, hourly, daily) has independent error state
- Network errors trigger user-friendly messages with retry option
- Validation errors caught at input level (LocationSearch)
- Search errors show "No locations match..." message
- API errors show "Unable to fetch weather. Please try again."
- Errors do NOT blank entire screen

**Loading States**:
- `isSearching` - During location search/dropdown update
- `isLoadingWeather` - During initial weather fetch
- `isRefreshing` - During manual refresh (distinct from initial load)
- Components show appropriate spinners/disabled states for each

**API Integration**:
- Service layer (`weatherApi.ts`) handles all HTTP calls
- Implements timeout (10 seconds) and retry logic for reliability
- Transforms WeatherAPI response to internal format immediately
- Never passes raw API responses to components
- Mock-friendly for testing

**Component Hierarchy** (following Vue best practices):
- **Container components** (App, CurrentWeather container, HourlyForecast container): Manage store subscriptions, pass data to presentational children
- **Presentational components** (CurrentWeather display, HourlyCard, DailyCard): Receive all data via props, no store access, fully reusable

---

## Data Models

```typescript
// ============ API Response Types (from WeatherAPI) ============

interface WeatherAPIResponse {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    tz_id: string;
    localtime_epoch: number;
    localtime: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    is_day: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_kph: number;
    wind_mph: number;
    humidity: number;
    precip_mm: number;
    precip_in: number;
  };
  forecast: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        maxtemp_f: number;
        mintemp_c: number;
        mintemp_f: number;
        avgtemp_c: number;
        avgtemp_f: number;
        condition: {
          text: string;
          icon: string;
          code: number;
        };
        daily_chance_of_rain: number;
        daily_chance_of_snow: number;
      };
      hour: Array<{
        time_epoch: number;
        time: string;
        temp_c: number;
        temp_f: number;
        is_day: number;
        condition: {
          text: string;
          icon: string;
          code: number;
        };
        wind_kph: number;
        wind_mph: number;
        humidity: number;
        chance_of_rain: number;
      }>;
    }>;
  };
}

interface LocationSearchResult {
  id: string;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
}

// ============ Processed Internal Types (for components/store) ============

enum TemperatureUnit {
  FAHRENHEIT = 'F',
  CELSIUS = 'C',
}

interface Location {
  id: string;                    // Unique identifier (lat:lon or name)
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
}

interface CurrentWeather {
  location: Location;
  temperature: number;           // In selected unit (store converts)
  condition: string;             // e.g., "Partly cloudy"
  conditionIcon: string;         // URL to weather icon
  humidity: number;              // 0-100
  windSpeed: number;             // In selected unit (store converts)
  lastUpdated: string;           // ISO timestamp
}

interface HourlyEntry {
  time: string;                  // Formatted time (e.g., "2:00 PM" or "14:00")
  temperature: number;           // In selected unit
  condition: string;
  conditionIcon: string;
  windSpeed: number;             // In selected unit
  humidity: number;              // 0-100
  precipitationChance: number;   // 0-100 percentage
}

interface DailyEntry {
  date: string;                  // Formatted date (e.g., "Mon, Dec 4")
  dayOfWeek: string;             // e.g., "Monday"
  highTemperature: number;       // In selected unit
  lowTemperature: number;        // In selected unit
  condition: string;
  conditionIcon: string;
  precipitationChance: number;   // 0-100 percentage
}

interface WeatherData {
  current: CurrentWeather | null;
  hourly: HourlyEntry[];         // Next 12 hours
  daily: DailyEntry[];           // Next 7 days
}

// ============ Error Types ============

enum ErrorType {
  VALIDATION_ERROR = 'validation',
  LOCATION_NOT_FOUND = 'not_found',
  NETWORK_ERROR = 'network',
  API_ERROR = 'api',
  TIMEOUT_ERROR = 'timeout',
  GEOLOCATION_DENIED = 'geo_denied',
  GEOLOCATION_UNAVAILABLE = 'geo_unavailable',
  UNKNOWN_ERROR = 'unknown',
}

interface WeatherError {
  type: ErrorType;
  message: string;               // User-facing message
  suggestion: string;            // Recovery action ("Try again", "Try a different search", etc.)
  technicalDetails?: string;     // For logging only (not shown to user)
  retryable: boolean;            // Can user retry?
}

// ============ Pinia Store State ============

interface WeatherStoreState {
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
  lastUpdated: string | null;    // ISO timestamp of last successful fetch
  abortController: AbortController | null;
}

// ============ Geolocation Types ============

interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface GeolocationResult {
  success: boolean;
  coordinates?: GeolocationCoordinates;
  error?: 'denied' | 'unavailable' | 'timeout' | 'unknown';
}

// ============ Temperature Conversion Helpers ============

function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9/5) + 32;
}

function fahrenheitToCelsius(fahrenheit: number): number {
  return (fahrenheit - 32) * 5/9;
}

// Convert Celsius to selected unit
function convertTemperature(celsius: number, unit: TemperatureUnit): number {
  return unit === TemperatureUnit.FAHRENHEIT 
    ? celsiusToFahrenheit(celsius) 
    : celsius;
}

// Format temperature for display
function formatTemperature(celsius: number, unit: TemperatureUnit): string {
  const value = convertTemperature(celsius, unit);
  return `${Math.round(value)}°${unit}`;
}
```

---

## Technical Specifications

**Performance Requirements**:
- App loads and becomes interactive within 3 seconds (modern desktop, standard connectivity)
- Search dropdown updates without noticeable lag (< 200ms response after user types)
- Temperature toggle applies immediately across all sections (no reload needed)
- Forecast data fetches complete within 2 seconds

**Scale Considerations**:
- Client-side only application (no backend required)
- Single user per session
- No data persistence between sessions
- No authentication or multi-user sync
- WeatherAPI free tier: 1M calls/month (sufficient for development and small user base)

**Mandatory Constraints**:
- WCAG 2.1 Level AA accessibility compliance
- Works on evergreen browsers only (Chrome, Firefox, Safari, Edge latest 2 versions)
- No data stored locally or on server
- Fresh start on each page load
- Graceful degradation if geolocation unavailable

**Browser API Requirements**:
- Geolocation API for automatic location detection
- Fetch API for HTTP requests (or Axios wrapper)
- LocalStorage not used (spec: no persistence)

---

## Implementation Sequence

### User Stories (Priority Order from Spec)

The implementation will follow this exact order, matching the specification priority:

1. **US-1**: Search and Select Location by Zip Code or City Name
2. **US-2**: Auto-detect User Location with Fallback to Manual Search
3. **US-3**: Display Current Weather Conditions
4. **US-4**: Display 12-hour Hourly Forecast
5. **US-5**: Display 7-day Daily Forecast
6. **US-6**: Toggle Temperature Units Between Fahrenheit and Celsius
7. **US-7**: Manually Refresh Forecast Data
8. **US-8**: Handle Errors and Loading States with User-Friendly Feedback

---

### Phase 1: Project Setup & Infrastructure
**Duration**: 2 days  
**Goal**: Establish working development environment with build tools, project structure, and base configurations

**Tasks**:
- Initialize Vue 3 project with Vite (npm create vite@latest weather-app -- --template vue-ts)
- Install dependencies: pinia, tailwindcss, axios, date-fns
- Configure Tailwind CSS with custom theme and utilities
- Configure Vitest + Vue Test Utils for testing
- Set up TypeScript configuration (tsconfig.json)
- Create project directory structure (components/, stores/, services/, types/, tests/)
- Set up .env.example with required variables (VITE_WEATHERAPI_KEY)
- Configure Netlify deployment (netlify.toml, environment secrets setup)
- Create README with setup instructions
- Create GitHub Actions CI/CD pipeline (run tests on push, deploy to Netlify on main merge)

**Deliverables**:
- ✅ Development environment works (npm run dev launches app)
- ✅ Test runner works (npm run test passes)
- ✅ Build succeeds (npm run build generates dist/)
- ✅ Project structure matches plan
- ✅ Environment variables configured
- ✅ CI/CD pipeline active

**Issue Update**: Change status to "In Progress", add label "setup"

---

### Phase 2: API Integration & Data Layer
**Duration**: 2 days  
**Goal**: Implement weather API service and Pinia store foundation (all phases depend on this)

**Tasks**:
- Create `types/weather.ts` with all TypeScript interfaces from Data Models section
- Implement `services/weatherApi.ts`:
  - `searchLocations(query: string)`: Call WeatherAPI search endpoint with debouncing (300ms)
  - `getWeatherByCoordinates(lat: number, lon: number)`: Fetch current + hourly + daily
  - Error handling with timeout (10s), network errors, API errors
  - Response transformation (API response → internal types)
  - Implement request cancellation (AbortController) for search cancellation
- Implement `services/errorHandler.ts`:
  - Map API errors to user-friendly messages
  - Categorize errors (validation, network, API, timeout, geolocation)
  - Generate retry suggestions
- Implement `services/geolocation.ts`:
  - Wrapper around Geolocation API
  - Silent failure on denial/unavailability (no error thrown)
  - Return coordinates or null
- Create `stores/weatherStore.ts` (Pinia):
  - State: weatherData, currentLocation, loading states, errors, temperature unit
  - Actions: `searchLocations()`, `selectLocation()`, `fetchWeather()`, `toggleTemperatureUnit()`, `refreshWeather()`, `resetSearch()`
  - Computed properties: displayTemperature (converts based on unit), formattedTime(), etc.
  - Validation logic for zip codes/city names
- Write unit tests for all services:
  - `weatherApi.searchLocations()` returns correct structure
  - `weatherApi.getWeatherByCoordinates()` transforms response correctly
  - Error scenarios: network down, 404, timeout, partial data
  - `weatherApi` properly mocks for testing
- Write Pinia store tests:
  - State mutations work correctly
  - Actions call services correctly
  - Temperature conversion computed properties work
  - Error state management

**Deliverables**:
- ✅ All services implemented and tested
- ✅ Pinia store working with full state management
- ✅ API mocking set up for tests (using Vitest mocking)
- ✅ 80%+ test coverage on services and store
- ✅ Zero external API calls during test runs

**Issue Update**: Add comment "API layer complete. Store ready for components.", apply label "api-layer"

---

### Phase 3: User Story 1 - Search & Select Location
**Duration**: 1.5 days  
**Goal**: Implement location search with real-time dropdown suggestions

**User Story**: Users need to find weather information for specific locations. This story covers core location search with real-time dropdown suggestions that refine as the user types.

**Acceptance Criteria** (from spec):
1. **Given** the app is open with the search box visible, **when** a user types, **then** dropdown displays matching results updating with each character
2. **Given** search results display, **when** user clicks a location, **then** app loads and displays weather for that location
3. **Given** search text matches no locations, **when** user attempts search, **then** message appears: "No locations match your criteria. Please try a different search."
4. **Given** user is viewing a location's weather, **when** they click search box again, **then** dropdown clears and is ready for new search

**Implementation Tasks**:
- Create `components/LocationSearch.vue`:
  - Input field with debounced search (300ms)
  - Dropdown displaying search results (or "No results" message)
  - Click handler to select location and trigger `store.selectLocation()`
  - Keyboard navigation (arrow keys to navigate results, Enter to select)
  - Click outside to close dropdown
  - Clearing results when user focuses search again (AC4)
  - Placeholder text and aria-labels for accessibility
- Create `components/ErrorMessage.vue` (reusable):
  - Displays error with suggestion and retry button
  - Semantic HTML (role="alert")
  - Good color contrast for visibility
- Integrate LocationSearch into App.vue
- Write component tests:
  - User can type and see results
  - Typing no matches shows "No locations..." message
  - Clicking result triggers action
  - Keyboard navigation works
  - Accessibility: keyboard focus management, ARIA labels
- Write integration test (search-to-display flow):
  - Type "New York" → results appear
  - Click result → store action called → data fetched (mocked)

**Technical Decisions**:
- Debounce search at 300ms to balance responsiveness and API calls
- Use keyboard-accessible dropdown (semantic HTML, focus management)
- Show all matching results (no limit) for US locations
- Search is case-insensitive (handled by API)

**Deliverables**:
- ✅ LocationSearch component works with real-time dropdown
- ✅ "No locations" error message appears when appropriate
- ✅ Location selection triggers weather fetch
- ✅ All acceptance criteria met
- ✅ Component and integration tests passing
- ✅ Keyboard navigation accessible
- ✅ WCAG 2.1 AA compliant (color contrast, ARIA labels, semantic HTML)

**Issue Update**: Add comment "US-1 complete: Location search working", apply label "us-1"

---

### Phase 4: User Story 2 - Auto-detect Location with Fallback
**Duration**: 1 day  
**Goal**: Implement geolocation with silent fallback to manual search

**User Story**: Users appreciate convenience, but privacy matters. Provide automatic location detection with graceful fallback if denied or fails.

**Acceptance Criteria** (from spec):
1. **Given** app first loads and browser supports geolocation, **when** no location selected, **then** app requests permission
2. **Given** user grants geolocation permission, **when** location detected successfully, **then** app automatically loads and displays weather
3. **Given** user denies permission or geolocation fails, **when** this occurs, **then** app silently falls back to search box (no error message)
4. **Given** user already selected location, **when** they return to app, **then** app starts fresh and prompts for location selection (no memory)

**Implementation Tasks**:
- Update App.vue to call geolocation on mount:
  - Call `geolocation.getLocation()`
  - If success → call `store.selectLocation()` with detected coordinates
  - If denied/unavailable/timeout → show search box (no error message)
  - Update loading state appropriately
- Update `geolocation.ts` service:
  - Handle all error cases: denied, unavailable, timeout, unsupported
  - Return null on any error (silent fallback)
  - Never throw errors from this service
- Add `currentLocationAttempted` flag to store to prevent re-requesting geolocation
- Write geolocation service tests:
  - Success case: returns coordinates
  - Denied: returns null
  - Timeout: returns null
  - Browser unsupported: returns null
- Write App.vue integration test:
  - App calls geolocation on mount
  - If successful, weather fetches
  - If denied, search box shows (no error)

**Technical Decisions**:
- Silent failure (no error messages per spec AC3)
- Geolocation called once per session (no re-request)
- Simple approach: use coordinates, convert to location name (via reverse geocoding or use coordinates directly with API)
- Store fetched location as `currentLocation` for display

**Deliverables**:
- ✅ Geolocation requests permission on first load
- ✅ Success path: automatically loads weather for detected location
- ✅ Failure path: silently falls back to search (no error shown)
- ✅ Fresh start on each session (no data persistence)
- ✅ All acceptance criteria met
- ✅ Geolocation service tests passing

**Issue Update**: Add comment "US-2 complete: Auto-geolocation working", apply label "us-2"

---

### Phase 5: User Story 3 - Current Weather Display
**Duration**: 1.5 days  
**Goal**: Display current weather conditions prominently

**User Story**: Users want an at-a-glance view of current weather. Provide current conditions prominently at top of display.

**Acceptance Criteria** (from spec):
1. **Given** location selected and data loads, **when** page loads successfully, **then** current weather displays at top including temperature and description
2. **Given** conditions display, **when** page viewed, **then** layout is vertical with current above hourly and daily
3. **Given** temperature unit set to Fahrenheit, **when** current conditions display, **then** temperature shows in °F
4. **Given** temperature unit set to Celsius, **when** current conditions display, **then** temperature shows in °C

**Implementation Tasks**:
- Create `components/CurrentWeather.vue` (container):
  - Subscribes to `store.weatherData.current`
  - Shows location name, current temperature, condition, condition icon
  - Shows last updated time
  - Display temperature in selected unit (via store computed property)
  - Handles loading state (show skeleton or spinner)
  - Handles error state (show error message)
- Create `components/CurrentWeatherDisplay.vue` (presentational):
  - Receives current weather data as props
  - Renders temperature, description, icon, location
  - No store access, fully reusable
- Create `components/TemperatureToggle.vue`:
  - Buttons for °F / °C selection
  - Calls `store.toggleTemperatureUnit()`
  - Shows which unit currently selected (highlight active button)
  - Positioned near top for easy access
- Update App.vue layout:
  - Structure: TemperatureToggle (top right), LocationSearch, CurrentWeather, HourlyForecast, DailyForecast
  - Vertical stack as spec requires
- Add to Pinia store (if not already):
  - `currentWeatherForDisplay` computed property that converts temperature to selected unit
  - `formattedLastUpdated` computed property (e.g., "2:45 PM")
- Write component tests:
  - Current weather displays all required fields
  - Temperature displays in correct unit
  - Last updated time formatted correctly
  - Handles loading state
  - Handles error state
- Write integration test:
  - Select location → current weather displays within 2 seconds
  - Toggle temperature → current weather temperature updates immediately

**Technical Decisions**:
- Display location name prominently
- Show last updated timestamp (helps user know freshness)
- Use weather icon from API (WeatherAPI provides icon URLs)
- Display simple condition description (e.g., "Partly cloudy") not technical code

**Deliverables**:
- ✅ CurrentWeather component displays all required information
- ✅ Temperature toggle works across entire app
- ✅ All temperatures update immediately when unit changed
- ✅ All acceptance criteria met
- ✅ Component and integration tests passing
- ✅ Vertical layout established (current > hourly > daily)

**Issue Update**: Add comment "US-3 complete: Current weather display working", apply label "us-3"

---

### Phase 6: User Story 4 - Hourly Forecast
**Duration**: 1.5 days  
**Goal**: Display 12-hour hourly forecast in horizontal scrollable cards

**User Story**: Users want hour-by-hour forecast to plan their day. Display next 12 hours with organized data.

**Acceptance Criteria** (from spec):
1. **Given** location selected and data loads, **when** viewing forecast, **then** 12-hour forecast displays below current conditions
2. **Given** 12-hour forecast displays, **when** viewing each hour, **then** show: hour, temperature, wind speed, humidity, precipitation chance
3. **Given** temperature set to Fahrenheit, **when** hourly temps display, **then** show in °F
4. **Given** temperature set to Celsius, **when** hourly temps display, **then** show in °C
5. **Given** hourly forecast displays, **when** viewing layout, **then** organized in readable format (horizontal scroll confirmed in tech planning)

**Implementation Tasks**:
- Create `components/HourlyForecast.vue` (container):
  - Subscribes to `store.weatherData.hourly`
  - Renders horizontal scrollable container with 12 hourly cards
  - Shows loading spinner while fetching
  - Shows error message if fetch fails (independent of other sections)
  - All temperatures in selected unit
- Create `components/HourlyCard.vue` (presentational):
  - Receives hour data as props
  - Displays: time (e.g., "2:00 PM"), temp, wind speed, humidity, precipitation chance
  - Weather icon
  - Responsive sizing (card fits in scroll container)
  - No store access
- Create `components/RefreshButton.vue`:
  - Button with refresh icon
  - Calls `store.refreshWeather()`
  - Shows spinner while refreshing
  - Disabled during initial load (only enabled after first successful load)
  - Positioned near top for visibility
- Horizontal scroll container styling with Tailwind:
  - `overflow-x-auto overflow-y-hidden`
  - Smooth scrolling
  - Mobile-responsive (card size adjusts for desktop focus)
- Update Pinia store:
  - `hourlyForecastForDisplay` computed property that converts temperatures and formats times
  - Format times as "2:00 PM" (12-hour format, simple approach per tech planning)
- Write component tests:
  - Hourly forecast displays all 12 hours
  - Each hour shows all required fields (time, temp, wind, humidity, precip)
  - Temperatures displayed in correct unit
  - Horizontal scrolling works
  - Clicking refresh triggers store action
  - Loading state shows spinner
  - Error state shows message
- Write integration test:
  - Select location → hourly forecast populates
  - Toggle temperature → all hourly temps update
  - Click refresh → hourly data refreshes

**Technical Decisions**:
- Time format: 12-hour with AM/PM (simple, user-friendly)
- Cards fixed width (e.g., 140px) with horizontal scroll
- Wind speed in selected unit (if API provides mph, convert to kph for Celsius display preference)
- Precipitation as percentage (0-100)
- Next 12 hours taken from API forecast (first 12 of 24-hour forecast available)

**Deliverables**:
- ✅ HourlyForecast displays 12 hours in horizontal scrollable cards
- ✅ All required data visible (time, temp, wind, humidity, precip)
- ✅ Temperatures update with unit toggle
- ✅ Horizontal scrolling works smoothly
- ✅ All acceptance criteria met
- ✅ RefreshButton integrated and functional
- ✅ Component and integration tests passing

**Issue Update**: Add comment "US-4 complete: 12-hour hourly forecast working", apply label "us-4"

---

### Phase 7: User Story 5 - Daily Forecast
**Duration**: 1.5 days  
**Goal**: Display 7-day daily forecast below hourly forecast

**User Story**: Users want extended trends for the week. Provide clear daily forecast for next 7 days.

**Acceptance Criteria** (from spec):
1. **Given** location selected and data loads, **when** viewing forecast, **then** 7-day forecast displays below 12-hour hourly
2. **Given** 7-day forecast displays, **when** viewing each day, **then** show: day, high temp, low temp, condition icon, precipitation probability
3. **Given** temperature set to Fahrenheit, **when** daily temps display, **then** show in °F
4. **Given** temperature set to Celsius, **when** daily temps display, **then** show in °C
5. **Given** daily forecast displays, **when** viewing layout, **then** organized in readable format (horizontal scroll)

**Implementation Tasks**:
- Create `components/DailyForecast.vue` (container):
  - Subscribes to `store.weatherData.daily`
  - Renders horizontal scrollable container with 7 daily cards
  - Shows loading spinner while fetching
  - Shows error message if fetch fails (independent error state)
  - All temperatures in selected unit
- Create `components/DailyCard.vue` (presentational):
  - Receives day data as props
  - Displays: day name (e.g., "Monday"), date (e.g., "Dec 4"), high temp, low temp, condition icon, precipitation chance
  - Card styling matches hourly cards for consistency
  - No store access
- Horizontal scroll container (similar to hourly, consistent styling):
  - Same scroll behavior and sizing
  - Cards slightly wider than hourly to accommodate more text
- Update Pinia store:
  - `dailyForecastForDisplay` computed property that converts temperatures and formats dates
  - Format dates as "Mon, Dec 4" (day + date)
- Write component tests:
  - Daily forecast displays all 7 days
  - Each day shows all required fields (day, date, high, low, condition, precip)
  - Temperatures displayed in correct unit
  - Horizontal scrolling works
  - Loading and error states work independently
- Write integration test:
  - Select location → daily forecast populates
  - Toggle temperature → all daily temps update
  - Hourly error doesn't affect daily display (partial data handling)

**Technical Decisions**:
- Date format: "Mon, Dec 4" (readable, shows day of week)
- High/low temperatures from API daily data
- Precipitation as percentage
- Cards aligned with hourly cards for consistent UX
- Horizontal scroll matches hourly forecast scroll position (can scroll both independently)

**Deliverables**:
- ✅ DailyForecast displays 7 days in horizontal scrollable cards
- ✅ All required data visible (day, date, high, low, condition, precip)
- ✅ Temperatures update with unit toggle
- ✅ Horizontal scrolling works smoothly
- ✅ All acceptance criteria met
- ✅ Component and integration tests passing
- ✅ Partial data handling: one section error doesn't affect others

**Issue Update**: Add comment "US-5 complete: 7-day daily forecast working", apply label "us-5"

---

### Phase 8: User Story 6 - Temperature Unit Toggle
**Duration**: 1 day  
**Goal**: Ensure temperature toggle works across all sections

**User Story**: Users in different regions have temperature preferences. Allow switching between °F and °C.

**Acceptance Criteria** (from spec):
1. **Given** app displays weather, **when** user locates toggle, **then** option to switch between °F and °C visible
2. **Given** toggle activated to change to Celsius, **when** applied, **then** all temps (current, hourly, daily) update to Celsius
3. **Given** toggle activated to change to Fahrenheit, **when** applied, **then** all temps update to Fahrenheit
4. **Given** user toggled unit, **when** they search new location, **then** newly loaded data respects selected unit preference

**Implementation Tasks**:
- Verify `TemperatureToggle.vue` from Phase 5:
  - Two buttons: "°F" and "°C"
  - Currently selected is highlighted/active state
  - Click triggers `store.toggleTemperatureUnit()`
  - Positioned prominently (top right of app)
- Verify Pinia store:
  - `temperatureUnit` state (FAHRENHEIT or CELSIUS)
  - `toggleTemperatureUnit()` action switches unit
  - All computed display properties use this unit for conversion
  - New location search respects current unit (AC4)
- Write comprehensive integration tests:
  - Toggle from °F to °C → all temperatures update (current, hourly, daily)
  - Toggle from °C to °F → all temperatures update
  - Search location while °C selected → new data displays in °C
  - Toggle rapid succession → all updates sync correctly
  - No memory of previous unit preference (fresh app = default to °F)
- Test edge cases:
  - Fractional temperatures round correctly
  - Zero and negative temperatures display correctly
  - Wind speeds convert if needed (e.g., mph to kph)

**Technical Decisions**:
- Default unit: Fahrenheit (US-based app, per spec)
- Temperature rounding: `Math.round()` for clean display
- No persistence of unit preference (spec: no data persistence)
- Toggle updates all sections in real-time via computed properties

**Deliverables**:
- ✅ Temperature toggle button visible and functional
- ✅ All temperatures update immediately across all sections
- ✅ New location searches respect selected unit
- ✅ All acceptance criteria met
- ✅ Integration tests comprehensively covering all scenarios passing
- ✅ Edge cases handled correctly

**Issue Update**: Add comment "US-6 complete: Temperature toggle working across all sections", apply label "us-6"

---

### Phase 9: User Story 7 - Manual Refresh
**Duration**: 1 day  
**Goal**: Implement refresh button for fetching latest data

**User Story**: Users want latest forecast without searching again. Provide refresh button.

**Acceptance Criteria** (from spec):
1. **Given** weather data displayed, **when** user views page, **then** clearly labeled refresh button visible
2. **Given** user clicks refresh, **when** fetch initiated, **then** user-friendly loading indicator displays
3. **Given** refresh completes successfully, **when** updated data returns, **then** weather info updates and spinner disappears
4. **Given** refresh in progress, **when** user clicks refresh again, **then** app queues or ignores duplicate click (no simultaneous requests)

**Implementation Tasks**:
- Verify `RefreshButton.vue` from Phase 6:
  - Refresh icon button
  - Calls `store.refreshWeather()`
  - Shows spinner while refreshing
  - Disabled during refresh (prevent duplicate requests per AC4)
  - Positioned near top, near temperature toggle
- Update Pinia store:
  - Implement `refreshWeather()` action:
    - Calls `weatherApi.getWeatherByCoordinates()` with current location
    - Sets `isRefreshing: true`
    - Updates all forecast data on success
    - Sets `lastUpdated` to current time
    - Sets `isRefreshing: false`
    - On error: sets `weatherError`, maintains previous data
    - Ignores refresh if already refreshing (check `isRefreshing` flag)
- Display "Last Updated" timestamp:
  - Show in CurrentWeather component (e.g., "Last updated 2:45 PM")
  - Updates when refresh completes
  - Format: time only or "2 minutes ago" (simple approach: time only)
- Write component tests:
  - RefreshButton disabled during initial load
  - RefreshButton enabled after first load
  - Click refresh while enabled → spinner shows
  - Click refresh again while spinning → no change (ignored per AC4)
  - Refresh completes → spinner disappears, data updates
  - Refresh error → error message shows, can retry
- Write integration test:
  - Load weather → refresh button enabled
  - Click refresh → all forecast sections update
  - Refresh error → error message appears, data not cleared

**Technical Decisions**:
- Debounce or flag-based: using flag (`isRefreshing`) to prevent simultaneous requests
- Last updated shows time only (simple) not "X minutes ago"
- Refresh doesn't affect temperature unit or location
- Partial failures: if one section fails during refresh, show error but keep previous data for other sections

**Deliverables**:
- ✅ Refresh button clearly visible and functional
- ✅ Loading indicator shows during refresh
- ✅ Data updates on successful refresh
- ✅ Duplicate refresh requests prevented
- ✅ Last updated timestamp displayed and updated
- ✅ All acceptance criteria met
- ✅ Component and integration tests passing

**Issue Update**: Add comment "US-7 complete: Manual refresh working", apply label "us-7"

---

### Phase 10: User Story 8 - Error Handling & Loading States
**Duration**: 1.5 days  
**Goal**: Comprehensive error and loading state handling across entire app

**User Story**: Users need clear feedback about app state and when errors occur. Ensure appropriate visual feedback and error messages.

**Acceptance Criteria** (from spec):
1. **Given** app searching/fetching data, **when** in progress, **then** visible loading indicator displays
2. **Given** location search/fetch fails, **when** error occurs, **then** user-friendly error message with retry suggestion displays
3. **Given** error message displays, **when** user reads it, **then** plain language, no technical details
4. **Given** weather loading, **when** user views search box, **then** search box remains accessible (can start new search)
5. **Given** refresh fails, **when** error resolves, **then** user can retry refresh without reloading page

**Implementation Tasks**:
- Implement comprehensive error scenarios:
  - No search results: "No locations match your criteria. Please try a different search."
  - Network error: "Unable to connect. Please check your internet and try again."
  - API error: "Weather service unavailable. Please try again later."
  - Timeout: "Request took too long. Please try again."
  - Partial data: "Some forecast data unavailable, showing what we have."
- Create error handling strategy:
  - Each section (current, hourly, daily) has independent error state
  - Section shows its error, others unaffected
  - Search errors don't affect weather display
  - Refresh errors don't clear previous data
- Implement loading indicators:
  - Search loading: Spinner in search box or subtle animation
  - Weather loading: Skeleton placeholders or general spinner
  - Refresh loading: Small spinner on refresh button
  - Clear distinction between initial load and refresh
- Update App.vue layout:
  - Search box always accessible (AC4) - position it top regardless of loading
  - Weather sections show spinners while loading
  - Errors shown in designated error containers (AlertBox components)
- Create comprehensive error UI:
  - ErrorMessage component shows: message + suggestion + retry button
  - Error containers have good contrast (WCAG AA)
  - Errors persist until user retries or searches new location
- Write exhaustive tests:
  - Network error during search → error message, can try again
  - Network error during weather fetch → error message, search still works
  - No results from search → "No locations..." message
  - Partial data (hourly fails, daily succeeds) → partial display with error
  - Refresh fails → error shows, previous data retained, can retry
  - Multiple errors in sequence → user can recover from each
  - Search box accessible during all loading states
- Test accessibility:
  - Error messages have proper contrast
  - Error messages announced to screen readers (role="alert")
  - Error messages don't disappear (user has time to read)
  - Retry button keyboard accessible

**Technical Decisions**:
- Plain language errors (no HTTP status codes, API error codes, technical jargon)
- Error messages persist until action taken (don't auto-dismiss)
- Independent error states per section (partial data OK)
- Search box always interactive (never disabled)
- Retry button on every error (clear recovery path)

**Deliverables**:
- ✅ Loading indicators show for all operations (search, fetch, refresh)
- ✅ Error messages clear, actionable, non-technical
- ✅ Search box remains accessible during loading/errors
- ✅ Each section handles errors independently
- ✅ Retry functionality on all errors
- ✅ Partial data handled gracefully (not full screen error)
- ✅ All acceptance criteria met
- ✅ Comprehensive error scenario tests passing
- ✅ WCAG 2.1 AA accessibility verified

**Issue Update**: Add comment "US-8 complete: Error handling and loading states comprehensive", apply label "us-8"

---

### Phase 11: Polish, Integration Testing & Deployment
**Duration**: 2 days  
**Goal**: Final testing, accessibility verification, performance optimization, and production deployment

**Tasks**:
- End-to-end testing across all user stories:
  - Complete flow: App opens → geolocation request → (allowed: load location weather OR denied: show search)
  - Search flow: Type → results appear → select → weather displays → toggle temperature → refresh → works
  - Error flows: network down, API down, no results, geolocation denied
  - Multi-step: search location 1 → refresh → search location 2 → toggle unit → refresh → all work
- Performance optimization:
  - Profile app load time (target: < 3 seconds)
  - Check bundle size
  - Optimize images (weather icons already CDN)
  - Test on slower network (simulate 3G)
- Accessibility audit:
  - Test with screen reader (NVDA or JAWS)
  - Keyboard navigation: Tab through all interactive elements
  - Color contrast verification (using tool like WebAIM)
  - Verify semantic HTML throughout
  - Verify all form inputs have labels
  - Verify all images have alt text
  - Test focus management (where is focus when actions complete?)
- Cross-browser testing:
  - Chrome latest
  - Firefox latest
  - Safari latest (macOS)
  - Edge latest
- Responsive design check (desktop focus, but should not break on smaller screens)
- Code quality:
  - All TypeScript strict mode, no `any` types
  - Consistent formatting (Prettier)
  - Linting passes (ESLint)
  - All tests passing (npm run test)
  - Build succeeds (npm run build)
- Documentation:
  - README with setup and dev instructions
  - Component documentation (props, events)
  - API service documentation
  - Store documentation (actions, state, computed)
- Environment setup:
  - Create WeatherAPI account and get API key
  - Set up Netlify secrets for production
  - Test deployment to staging first
  - Verify env vars work in production
- Deploy to Netlify:
  - Connect repository to Netlify
  - Set environment variables in Netlify UI
  - Trigger deploy
  - Verify production app works
  - Test production app (search, refresh, errors, toggle unit)
  - Set up custom domain (if applicable)

**Deliverables**:
- ✅ All 8 user stories working end-to-end
- ✅ App loads within 3 seconds
- ✅ WCAG 2.1 AA accessibility compliance verified
- ✅ Works across Chrome, Firefox, Safari, Edge (latest versions)
- ✅ 80-90% test coverage across all code
- ✅ Zero console errors
- ✅ All tests passing (npm run test)
- ✅ Build succeeds (npm run build)
- ✅ Deployed to production (Netlify)
- ✅ Production app verified working

**Issue Update**: Change status to "Done", add label "ready-to-deploy", close all subtasks

---

## Issue Tracker Integration

**Status Workflow**:
- **Start**: Todo → In Progress (when Phase 1 begins)
- **Phase 1 Complete**: Add comment with setup summary
- **Phase 2 Complete**: Add comment "API layer ready, all mocked services working"
- **Phase 3-10 Complete**: Add comment for each user story completion
- **Phase 11 Complete**: Change status to Done, add comment with deployment link
- **Final**: Close issue

**Labels** (apply as phases complete):
- `setup` - Phase 1 complete
- `api-layer` - Phase 2 complete
- `us-1`, `us-2`, `us-3`, `us-4`, `us-5`, `us-6`, `us-7`, `us-8` - Each user story phase complete
- `testing-complete` - Phase 11 start
- `ready-to-deploy` - Phase 11 complete, all tests passing
- `deployed` - Deployed to production

**Subtasks** (create for each phase):
- Phase 1: Project Setup & Infrastructure
- Phase 2: API Integration & Data Layer
- Phase 3: Search & Select Location (US-1)
- Phase 4: Auto-detect Location (US-2)
- Phase 5: Current Weather Display (US-3)
- Phase 6: Hourly Forecast (US-4)
- Phase 7: Daily Forecast (US-5)
- Phase 8: Temperature Toggle (US-6)
- Phase 9: Manual Refresh (US-7)
- Phase 10: Error Handling & Loading (US-8)
- Phase 11: Polish & Deployment

**Dependencies**:
- **Blocks**: None (this is the primary weather app epic)
- **Related**: None

---

## Needs Discussion

No blocking issues identified. All functional and technical requirements are explicitly defined in the specification. Estimated timeline: 11-14 days based on 2-day phases.

**Optional Enhancements** (post-MVP):
- Save location search history (requires localStorage, violates FR-013 spec requirement)
- Hourly forecast beyond 12 hours (spec requires exactly 12)
- Weather alerts/warnings (not in spec)
- Share current conditions (not in spec)
- Minute-by-minute precipitation (WeatherAPI tier upgrade required)

---

## Testing Strategy

### Coverage Targets

- **Services (API, geolocation, error handler)**: 85-90% coverage
  - All happy paths
  - All error scenarios
  - Edge cases (null values, empty responses, timeouts)
  - Mocking strategy: Mock fetch/navigator APIs

- **Pinia Store**: 85-90% coverage
  - All state mutations
  - All actions (search, select, fetch, toggle, refresh)
  - All computed properties
  - Error state transitions
  - Mocking strategy: Mock weather service, inject test store

- **Components**: 75-85% coverage
  - User interactions (clicks, typing, keyboard)
  - Props handling
  - Conditional rendering (loading, errors, success)
  - Accessibility features (ARIA, semantic HTML)
  - NOT testing Tailwind CSS styling details

- **Integration Tests**: 70% coverage
  - Complete flows (search → select → display → refresh)
  - Cross-component state sharing via store
  - Error recovery paths
  - Temperature unit propagation across all sections

### Test Types & Tools

**Unit Tests** (Vitest + Vue Test Utils):
- Services: Direct function calls, mock HTTP, expect return values
- Store: Actions/mutations, expect state changes, computed properties
- Components: Mount component, interact, expect output

**Component Tests** (Vue Test Utils):
- Isolated component testing
- Props validation
- Event emission
- Slot rendering
- Focus management (for accessibility)

**Integration Tests** (Vitest):
- Multi-component flows
- Store + component interactions
- User journey simulations

**Manual Testing**:
- E2E testing on production build
- Accessibility with screen readers
- Performance profiling
- Cross-browser verification

### Test Examples

**Service Test**:
```typescript
describe('weatherApi', () => {
  it('searchLocations returns array of results', async () => {
    const results = await weatherApi.searchLocations('New York');
    expect(results).toHaveLength(5);
    expect(results[0]).toHaveProperty('name');
  });

  it('handles network error gracefully', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));
    const error = await weatherApi.searchLocations('test');
    expect(error.type).toBe(ErrorType.NETWORK_ERROR);
  });
});
```

**Component Test**:
```typescript
describe('LocationSearch.vue', () => {
  it('displays search results when user types', async () => {
    const wrapper = mount(LocationSearch);
    const input = wrapper.find('input');
    await input.setValue('New York');
    await vi.waitFor(() => {
      expect(wrapper.find('.results').exists()).toBe(true);
    });
  });

  it('emits select event when user clicks result', async () => {
    const wrapper = mount(LocationSearch, {
      props: { results: [{ name: 'New York' }] }
    });
    await wrapper.find('.result-item').trigger('click');
    expect(wrapper.emitted('select')).toBeTruthy();
  });
});
```

**Integration Test**:
```typescript
describe('Search to Display Flow', () => {
  it('user can search location and see weather', async () => {
    const store = useWeatherStore();
    const results = await store.searchLocations('New York');
    
    await store.selectLocation(results[0]);
    
    expect(store.currentLocation).toBeTruthy();
    expect(store.weatherData.current).toBeTruthy();
    expect(store.weatherData.hourly).toHaveLength(12);
  });
});
```

### Accessibility Testing

- Keyboard navigation: Tab through all elements, verify focus visible
- Screen reader: NVDA/JAWS announces all text, labels, and alerts
- Color contrast: Verify WCAG AA (4.5:1 normal text, 3:1 large text)
- Semantic HTML: No divs for buttons, proper heading hierarchy, form labels
- ARIA: Error containers have role="alert", buttons have aria-label if text is icon-only

---

## Summary

This implementation plan breaks the 8 user stories from the specification into 11 sequential phases over 11-14 development days. Each phase:
- Is independently testable with clear success criteria
- Builds on previous phases without blocking them
- Maintains 80-90% test coverage
- Adheres to WCAG 2.1 Level AA accessibility standards
- Follows Vue 3 + Pinia best practices

The architecture emphasizes:
- Centralized state management (Pinia) for weather data and UI state
- Service layer abstraction for API calls and geolocation
- Component hierarchy following container/presentational pattern
- Independent error handling per section (graceful partial failures)
- Type safety throughout (TypeScript interfaces)
- Comprehensive testing strategy

Deployment to Netlify via GitHub Actions CI/CD enables rapid iteration and ensures quality gate (all tests must pass before deploy).

**Effort Estimate**: 11-14 development days (varies by developer experience)  
**Risk**: Low (straightforward requirements, well-scoped, proven tech stack)  
**Complexity**: Medium (weather API integration, geolocation, state management)
