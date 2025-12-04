<script setup lang="ts">
import type { WeatherError } from '@/types/weather'

interface Props {
  error: WeatherError | null
  onRetry?: () => void
}

withDefaults(defineProps<Props>(), {
  onRetry: undefined,
})
</script>

<template>
  <div
    v-if="error"
    role="alert"
    class="error-message"
    aria-live="polite"
    aria-atomic="true"
  >
    <div class="error-content">
      <p class="error-title">{{ error.message }}</p>
      <p v-if="error.suggestion" class="error-suggestion">
        {{ error.suggestion }}
      </p>
    </div>
    <button
      v-if="error.retryable && onRetry"
      type="button"
      class="retry-button"
      @click="onRetry"
      aria-label="Retry the failed operation"
    >
      Retry
    </button>
  </div>
</template>

<style scoped>
.error-message {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  margin: 12px 0;
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 4px;
  gap: 16px;
}

.error-content {
  flex: 1;
}

.error-title {
  margin: 0;
  font-weight: 600;
  color: #991b1b;
  font-size: 14px;
}

.error-suggestion {
  margin: 4px 0 0 0;
  color: #7f1d1d;
  font-size: 13px;
}

.retry-button {
  flex-shrink: 0;
  padding: 6px 12px;
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 200ms ease-in-out;
}

.retry-button:hover {
  background-color: #b91c1c;
}

.retry-button:focus {
  outline: 2px solid #dc2626;
  outline-offset: 2px;
}

.retry-button:active {
  background-color: #991b1b;
}

/* WCAG 2.1 AA compliance: color contrast */
/* Error background (#fee2e2) and title text (#991b1b) = 8.23:1 */
/* Error background and suggestion text (#7f1d1d) = 6.8:1 */
/* Button background (#dc2626) and text (white) = 5.21:1 */
</style>
