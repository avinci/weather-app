<script setup lang="ts">
import { onMounted } from 'vue'
import LocationSearch from './components/LocationSearch.vue'
import ErrorMessage from './components/ErrorMessage.vue'
import TemperatureToggle from './components/TemperatureToggle.vue'
import CurrentWeather from './components/CurrentWeather.vue'
import HourlyForecast from './components/HourlyForecast.vue'
import DailyForecast from './components/DailyForecast.vue'
import RefreshButton from './components/RefreshButton.vue'
import { useWeatherStore } from './stores/weatherStore'

const store = useWeatherStore()

onMounted(() => {
  // Try to detect user's location on app load
  store.tryDetectLocation()
})

function handleLocationSearch(query: string) {
  store.searchLocations(query)
}

function handleLocationSelect(location: any) {
  store.selectLocation(location)
}

function handleSearchFocus() {
  store.resetSearch()
}

function handleRetrySearch() {
  if (store.lastSearchQuery) {
    store.searchLocations(store.lastSearchQuery)
  }
}
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-top">
        <div>
          <h1>Weather App</h1>
          <p class="subtitle">Search for a location to get the current weather</p>
        </div>
        <TemperatureToggle />
      </div>
    </header>

    <main class="app-main">
      <!-- Search Section -->
      <section class="search-section">
        <LocationSearch
          :results="store.searchResults"
          :is-loading="store.isSearching"
          :has-error="store.searchError !== null"
          @search="handleLocationSearch"
          @select="handleLocationSelect"
          @focus="handleSearchFocus"
        />

        <!-- Search Error -->
        <ErrorMessage
          :error="store.searchError"
          :on-retry="handleRetrySearch"
        />
      </section>

      <!-- Weather Display Section -->
      <section v-if="store.currentLocation" class="weather-section">
        <div class="location-header">
          <h2>{{ store.currentLocation.name }}</h2>
          <p v-if="store.currentLocation.region || store.currentLocation.country" class="location-meta">
            <span v-if="store.currentLocation.region">{{ store.currentLocation.region }}</span>
            <span v-if="store.currentLocation.region && store.currentLocation.country">,&nbsp;</span>
            <span v-if="store.currentLocation.country">{{ store.currentLocation.country }}</span>
          </p>
        </div>

        <!-- Current Weather Container -->
        <CurrentWeather />

        <!-- Weather Controls -->
        <div class="weather-controls">
          <RefreshButton />
        </div>

        <!-- Hourly Forecast Container -->
        <HourlyForecast />

        <!-- Daily Forecast Container -->
        <DailyForecast />
      </section>

      <!-- Loading State -->
      <section v-if="store.isLoading && !store.currentLocation" class="loading-section">
        <p>Loading...</p>
      </section>
    </main>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.app-header {
  color: white;
  margin-bottom: 40px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.app-header h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
}

.subtitle {
  margin: 8px 0 0 0;
  font-size: 16px;
  opacity: 0.9;
}

.app-main {
  max-width: 600px;
  margin: 0 auto;
}

.search-section {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  margin-bottom: 24px;
}

.weather-section {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.location-header {
  margin-bottom: 24px;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 16px;
}

.location-header h2 {
  margin: 0;
  font-size: 24px;
  color: #1f2937;
}

.location-meta {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #6b7280;
}

.current-weather {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 6px;
}

.temperature-display {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.temperature-value {
  font-size: 48px;
  font-weight: 700;
  color: #667eea;
  line-height: 1;
}

.temperature-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.condition {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #1f2937;
}

.humidity,
.wind-speed {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.weather-controls {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.control-button {
  flex: 1;
  padding: 10px 16px;
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 200ms;
}

.control-button:hover:not(:disabled) {
  background-color: #5568d3;
}

.control-button:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

.control-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.last-updated {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
  text-align: center;
}

.loading-section {
  background: white;
  padding: 32px;
  border-radius: 8px;
  text-align: center;
  color: #6b7280;
}
</style>
