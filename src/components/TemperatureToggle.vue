<script setup lang="ts">
import { useWeatherStore } from '@/stores/weatherStore'

const store = useWeatherStore()

function toggleUnit(unit: string) {
  if (store.temperatureUnit !== unit) {
    store.toggleTemperatureUnit()
  }
}
</script>

<template>
  <div class="temperature-toggle">
    <button
      :class="['toggle-button', { active: store.temperatureUnit === 'F' }]"
      @click="toggleUnit('F')"
      aria-label="Switch to Fahrenheit"
    >
      °F
    </button>
    <button
      :class="['toggle-button', { active: store.temperatureUnit === 'C' }]"
      @click="toggleUnit('C')"
      aria-label="Switch to Celsius"
    >
      °C
    </button>
  </div>
</template>

<style scoped>
.temperature-toggle {
  display: flex;
  gap: 8px;
  background: white;
  padding: 8px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.toggle-button {
  padding: 8px 16px;
  border: 2px solid transparent;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  background-color: #f3f4f6;
  color: #6b7280;
  transition: all 200ms ease;
}

.toggle-button:hover {
  background-color: #e5e7eb;
}

.toggle-button:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

.toggle-button.active {
  background-color: #667eea;
  color: white;
  border-color: #667eea;
}

.toggle-button.active:hover {
  background-color: #5568d3;
}
</style>
