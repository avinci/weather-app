<script setup lang="ts">
import type { CurrentWeather } from '@/types/weather'

interface Props {
  weather: CurrentWeather
  temperatureUnit: string
  formattedLastUpdated: string
}

withDefaults(defineProps<Props>(), {
  temperatureUnit: 'F',
  formattedLastUpdated: '',
})
</script>

<template>
  <div class="current-weather-display">
    <div class="weather-main">
      <div class="temperature-section">
        <div class="temperature-value">
          {{ Math.round(weather.temperature) }}°
        </div>
        <div class="weather-details">
          <p class="condition">{{ weather.condition }}</p>
          <p class="details-line">
            Humidity: <strong>{{ weather.humidity }}%</strong>
          </p>
          <p class="details-line">
            Wind: <strong>{{ Math.round(weather.windSpeed) }} {{ temperatureUnit === 'F' ? 'mph' : 'km/h' }}</strong>
          </p>
        </div>
      </div>
    </div>

    <div v-if="formattedLastUpdated" class="last-updated">
      Last updated: {{ formattedLastUpdated }}
    </div>
  </div>
</template>

<style scoped>
.current-weather-display {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 8px;
  margin: 20px 0;
}

.weather-main {
  display: flex;
  align-items: center;
  gap: 24px;
}

.temperature-section {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.temperature-value {
  font-size: 56px;
  font-weight: 700;
  color: #667eea;
  line-height: 1;
}

.weather-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.condition {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  text-transform: capitalize;
}

.details-line {
  margin: 0;
  font-size: 14px;
  color: #4b5563;
}

.details-line strong {
  font-weight: 600;
}

.last-updated {
  font-size: 12px;
  color: #9ca3af;
  text-align: center;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}
</style>
