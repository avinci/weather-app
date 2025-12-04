<script setup lang="ts">
import { computed } from 'vue'
import { useWeatherStore } from '@/stores/weatherStore'
import CurrentWeatherDisplay from './CurrentWeatherDisplay.vue'
import ErrorMessage from './ErrorMessage.vue'

const store = useWeatherStore()

const hasWeatherData = computed(() => store.currentWeatherForDisplay !== null)

const isLoadingWeather = computed(() => store.isLoadingWeather)
</script>

<template>
  <div v-if="store.currentLocation" class="current-weather">
    <!-- Error State -->
    <ErrorMessage
      :error="store.weatherError"
      :on-retry="() => store.refreshWeather()"
    />

    <!-- Loading State -->
    <div v-if="isLoadingWeather && !hasWeatherData" class="loading-state">
      <div class="skeleton-loader">
        <div class="skeleton skeleton-temp"></div>
        <div class="skeleton skeleton-details"></div>
      </div>
    </div>

    <!-- Weather Display -->
    <CurrentWeatherDisplay
      v-if="hasWeatherData && store.currentWeatherForDisplay"
      :weather="store.currentWeatherForDisplay"
      :temperature-unit="store.temperatureUnit"
      :formatted-last-updated="store.formattedLastUpdated"
    />
  </div>
</template>

<style scoped>
.current-weather {
  width: 100%;
}

.loading-state {
  padding: 20px;
}

.skeleton-loader {
  display: flex;
  gap: 16px;
  align-items: center;
}

.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.skeleton-temp {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  flex-shrink: 0;
}

.skeleton-details {
  flex: 1;
  height: 60px;
  border-radius: 8px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
