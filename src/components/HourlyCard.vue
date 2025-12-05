<script setup lang="ts">
import type { HourlyEntry } from '@/types/weather'

interface Props {
  hour: HourlyEntry
  temperatureUnit: string
}

withDefaults(defineProps<Props>(), {
  temperatureUnit: 'F',
})
</script>

<template>
  <div class="hourly-card">
    <!-- Time -->
    <div class="time">{{ hour.time }}</div>

    <!-- Weather Icon -->
    <img :src="hour.conditionIcon" :alt="hour.condition" class="icon" />

    <!-- Temperature -->
    <div class="temperature">
      {{ Math.round(hour.temperature) }}°
    </div>

    <!-- Condition -->
    <div class="condition">{{ hour.condition }}</div>

    <!-- Details Grid -->
    <div class="details">
      <!-- Wind Speed -->
      <div class="detail-item">
        <span class="label">Wind</span>
        <span class="value">{{ Math.round(hour.windSpeed) }}</span>
        <span class="unit">{{ temperatureUnit === 'F' ? 'mph' : 'km/h' }}</span>
      </div>

      <!-- Humidity -->
      <div class="detail-item">
        <span class="label">Humidity</span>
        <span class="value">{{ hour.humidity }}%</span>
      </div>

      <!-- Precipitation Chance -->
      <div class="detail-item">
        <span class="label">Precip</span>
        <span class="value">{{ hour.precipitationChance }}%</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hourly-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 6px;
  min-width: 120px;
  flex-shrink: 0;
}

.time {
  font-size: 12px;
  font-weight: 600;
  color: #1f2937;
}

.icon {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.temperature {
  font-size: 20px;
  font-weight: 700;
  color: #667eea;
  line-height: 1;
}

.condition {
  font-size: 11px;
  color: #4b5563;
  text-align: center;
  line-height: 1.2;
  max-width: 100%;
  word-break: break-word;
}

.details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  font-size: 10px;
  margin-top: 4px;
}

.detail-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  color: #6b7280;
}

.label {
  font-weight: 600;
  color: #4b5563;
}

.value {
  font-weight: 600;
  color: #1f2937;
}

.unit {
  font-size: 9px;
  color: #9ca3af;
}

/* Responsive sizing for different screens */
@media (max-width: 640px) {
  .hourly-card {
    min-width: 100px;
    padding: 10px;
  }

  .icon {
    width: 36px;
    height: 36px;
  }

  .temperature {
    font-size: 18px;
  }
}
</style>
