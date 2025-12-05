<script setup lang="ts">
import type { DailyEntry } from '@/types/weather'

interface Props {
  day: DailyEntry
  temperatureUnit: string
}

withDefaults(defineProps<Props>(), {
  temperatureUnit: 'F',
})
</script>

<template>
  <div class="daily-card">
    <!-- Day and Date -->
    <div class="day-info">
      <div class="day-name">{{ day.dayOfWeek }}</div>
      <div class="date">{{ day.date }}</div>
    </div>

    <!-- Weather Icon -->
    <img :src="day.conditionIcon" :alt="day.condition" class="icon" />

    <!-- Condition -->
    <div class="condition">{{ day.condition }}</div>

    <!-- Temperatures -->
    <div class="temperatures">
      <div class="temp-item">
        <span class="label">High</span>
        <span class="value">{{ Math.round(day.highTemperature) }}°</span>
      </div>
      <div class="temp-item">
        <span class="label">Low</span>
        <span class="value">{{ Math.round(day.lowTemperature) }}°</span>
      </div>
    </div>

    <!-- Precipitation Chance -->
    <div class="precipitation">
      <span class="label">Precip</span>
      <span class="value">{{ day.precipitationChance }}%</span>
    </div>
  </div>
</template>

<style scoped>
.daily-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 6px;
  min-width: 140px;
  flex-shrink: 0;
}

.day-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  width: 100%;
}

.day-name {
  font-size: 12px;
  font-weight: 600;
  color: #1f2937;
}

.date {
  font-size: 11px;
  color: #6b7280;
}

.icon {
  width: 44px;
  height: 44px;
  object-fit: contain;
}

.condition {
  font-size: 11px;
  color: #4b5563;
  text-align: center;
  line-height: 1.2;
  max-width: 100%;
  word-break: break-word;
}

.temperatures {
  display: flex;
  gap: 8px;
  width: 100%;
  justify-content: center;
  margin-top: 4px;
}

.temp-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.label {
  font-size: 9px;
  font-weight: 600;
  color: #4b5563;
}

.value {
  font-size: 14px;
  font-weight: 700;
  color: #667eea;
  line-height: 1;
}

.precipitation {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  width: 100%;
  margin-top: 4px;
  font-size: 10px;
}

.precipitation .label {
  font-size: 9px;
  font-weight: 600;
  color: #4b5563;
}

.precipitation .value {
  font-size: 12px;
  font-weight: 600;
  color: #1f2937;
}

/* Responsive sizing for different screens */
@media (max-width: 640px) {
  .daily-card {
    min-width: 130px;
    padding: 10px;
  }

  .icon {
    width: 40px;
    height: 40px;
  }

  .value {
    font-size: 12px;
  }
}
</style>
