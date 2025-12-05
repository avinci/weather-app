<script setup lang="ts">
import { computed } from 'vue'
import { useWeatherStore } from '@/stores/weatherStore'

const store = useWeatherStore()

// Compute UI state
const isRefreshing = computed(() => store.isRefreshing)
const hasLoadedOnce = computed(() => store.weatherData.current !== null)
const isDisabled = computed(() => !hasLoadedOnce || isRefreshing.value)
const hasLocation = computed(() => store.currentLocation !== null)

function handleClick() {
  if (!isDisabled.value && hasLocation.value) {
    store.refreshWeather()
  }
}
</script>

<template>
  <button
    type="button"
    class="refresh-button"
    :disabled="isDisabled"
    :title="isDisabled ? 'Waiting for initial data load...' : 'Refresh weather data'"
    @click="handleClick"
  >
    <!-- Spinner when refreshing -->
    <span v-if="isRefreshing" class="spinner"></span>

    <!-- Refresh icon when not refreshing -->
    <span v-else class="icon">↻</span>

    <!-- Button text -->
    <span class="label">{{ isRefreshing ? 'Refreshing...' : 'Refresh' }}</span>
  </button>
</template>

<style scoped>
.refresh-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 200ms ease;
  min-width: 120px;
}

.refresh-button:hover:not(:disabled) {
  background-color: #5568d3;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.refresh-button:active:not(:disabled) {
  transform: translateY(0);
}

.refresh-button:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #cbd5e1;
}

.icon {
  font-size: 18px;
  display: inline-block;
  transition: transform 200ms ease;
}

.refresh-button:hover:not(:disabled) .icon {
  transform: rotate(180deg);
}

.label {
  font-size: 14px;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
