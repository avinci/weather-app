<script setup lang="ts">
import { computed } from 'vue'
import HourlyCard from './HourlyCard.vue'
import ErrorMessage from './ErrorMessage.vue'
import { useWeatherStore } from '@/stores/weatherStore'

const store = useWeatherStore()

// Compute UI state
const isLoading = computed(() => store.isLoadingWeather)
const hasError = computed(() => store.weatherError !== null)
const hourlyData = computed(() => store.hourlyForecastForDisplay)
const temperatureUnit = computed(() => store.temperatureUnit)
const hasData = computed(() => hourlyData.value.length > 0)

// Error retry handler
function handleRetry() {
  if (store.currentLocation) {
    store.fetchWeather(store.currentLocation.lat, store.currentLocation.lon)
  }
}
</script>

<template>
  <div class="hourly-forecast">
    <!-- Section Title -->
    <h3 class="section-title">12-Hour Forecast</h3>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading forecast...</p>
    </div>

    <!-- Error State -->
    <ErrorMessage
      v-if="hasError && !isLoading"
      :error="store.weatherError"
      :on-retry="handleRetry"
    />

    <!-- Hourly Cards Container -->
    <div v-if="hasData && !isLoading" class="scroll-container">
      <HourlyCard
        v-for="(hour, index) in hourlyData"
        :key="`${hour.time}-${index}`"
        :hour="hour"
        :temperature-unit="temperatureUnit"
      />
    </div>

    <!-- No Data State -->
    <div v-if="!hasData && !isLoading && !hasError" class="no-data-state">
      <p>No hourly forecast available</p>
    </div>
  </div>
</template>

<style scoped>
.hourly-forecast {
  margin: 24px 0;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.scroll-container {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  padding: 8px 0;
  /* Smooth scrolling for all browsers */
  -webkit-overflow-scrolling: touch;
}

/* Scrollbar styling */
.scroll-container::-webkit-scrollbar {
  height: 6px;
}

.scroll-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.scroll-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.scroll-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  color: #6b7280;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-state p {
  margin: 0;
  font-size: 14px;
}

.no-data-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #9ca3af;
}

.no-data-state p {
  margin: 0;
  font-size: 14px;
}
</style>
