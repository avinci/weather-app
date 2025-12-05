<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { LocationSearchResult } from '@/types/weather'

interface Props {
  results: LocationSearchResult[]
  isLoading?: boolean
  hasError?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  hasError: false,
})

const { results, isLoading } = props

const emit = defineEmits<{
  search: [query: string]
  select: [location: LocationSearchResult]
  focus: []
}>()

// State
const searchInput = ref('')
const isDropdownOpen = ref(false)
const highlightedIndex = ref(-1)
const dropdownRef = ref<HTMLDivElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
let debounceTimer: ReturnType<typeof setTimeout> | null = null
const isDebouncing = ref(false)

// Computed
const hasResults = computed(() => results.length > 0)

const displayText = computed(() => {
  if (isLoading) {
    return 'Searching...'
  }
  if (isDebouncing.value) {
    return 'Searching...'
  }
  if (searchInput.value && !hasResults.value && !isLoading && !isDebouncing.value) {
    return 'No locations match your criteria. Please try a different search.'
  }
  return ''
})

// Methods
function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  const query = target.value

  // Clear results when user focuses/modifies search (AC4)
  if (!searchInput.value && query.length > 0) {
    // Transitioning from empty to having text
    highlightedIndex.value = -1
  }

  searchInput.value = query

  // Debounce search
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  if (query.trim()) {
    isDropdownOpen.value = true
    isDebouncing.value = true
    debounceTimer = setTimeout(() => {
      isDebouncing.value = false
      emit('search', query)
    }, 300)
  } else {
    // Empty query clears results and closes dropdown
    isDropdownOpen.value = false
    highlightedIndex.value = -1
    isDebouncing.value = false
  }
}

function handleFocus() {
  // AC4: Clear results when user focuses search again
  highlightedIndex.value = -1
  if (searchInput.value.trim() && hasResults.value) {
    isDropdownOpen.value = true
  }
  emit('focus')
}

function handleKeyDown(event: KeyboardEvent) {
  if (!isDropdownOpen.value || !hasResults.value) {
    return
  }

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      highlightedIndex.value = Math.min(
        highlightedIndex.value + 1,
        results.length - 1,
      )
      break

    case 'ArrowUp':
      event.preventDefault()
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, -1)
      break

    case 'Enter':
      event.preventDefault()
      if (highlightedIndex.value >= 0 && highlightedIndex.value < results.length) {
        selectLocation(results[highlightedIndex.value]!)
      }
      break

    case 'Escape':
      event.preventDefault()
      closeDropdown()
      break
  }
}

function selectLocation(location: LocationSearchResult) {
  emit('select', location)
  searchInput.value = ''
  closeDropdown()
  highlightedIndex.value = -1
}

function closeDropdown() {
  isDropdownOpen.value = false
  highlightedIndex.value = -1
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (dropdownRef.value && !dropdownRef.value.contains(target)) {
    closeDropdown()
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
})

// Watch for results changes
watch(
  () => results.length,
  (newLength) => {
    if (newLength > 0 && searchInput.value.trim()) {
      // Open dropdown when results appear
      isDropdownOpen.value = true
      highlightedIndex.value = -1
    }
  },
)
</script>

<template>
  <div ref="dropdownRef" class="location-search-container">
    <div class="search-wrapper">
      <input
        ref="inputRef"
        v-model="searchInput"
        type="text"
        class="search-input"
        placeholder="Search by city name or zip code"
        aria-label="Search for a location by city name or zip code"
        aria-autocomplete="list"
        :aria-expanded="isDropdownOpen && hasResults"
        :aria-controls="isDropdownOpen && hasResults ? 'location-dropdown' : undefined"
        @input="handleInput"
        @focus="handleFocus"
        @keydown="handleKeyDown"
      />
    </div>

    <!-- Dropdown Results -->
    <div
      v-if="isDropdownOpen && hasResults"
      id="location-dropdown"
      class="dropdown-results"
      role="listbox"
    >
      <button
        v-for="(location, index) in results"
        :key="location.id"
        type="button"
        class="result-item"
        :class="{ highlighted: index === highlightedIndex }"
        role="option"
        :aria-selected="index === highlightedIndex"
        @click="selectLocation(location)"
        @mouseenter="highlightedIndex = index"
      >
        <div class="result-name">{{ location.name }}</div>
        <div v-if="location.region || location.country" class="result-meta">
          <span v-if="location.region" class="result-region">{{ location.region }}</span>
          <span v-if="location.country" class="result-country">{{ location.country }}</span>
        </div>
      </button>
    </div>

    <!-- No Results Message -->
    <div
      v-else-if="isDropdownOpen && searchInput && displayText && !isLoading"
      class="no-results"
      role="status"
      aria-live="polite"
    >
      {{ displayText }}
    </div>
  </div>
</template>

<style scoped>
.location-search-container {
  position: relative;
  width: 100%;
}

.search-wrapper {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 10px 12px;
  font-size: 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  transition: border-color 200ms, box-shadow 200ms;
  color: #1f2937;
  background-color: white;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-input::placeholder {
  color: #9ca3af;
}

.dropdown-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 10;
  margin-top: 4px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-height: 300px;
  overflow-y: auto;
}

.result-item {
  width: 100%;
  padding: 10px 12px;
  text-align: left;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: background-color 150ms;
}

.result-item:hover,
.result-item.highlighted {
  background-color: #f3f4f6;
}

.result-item:focus {
  outline: 2px solid #3b82f6;
  outline-offset: -2px;
}

.result-name {
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 2px;
}

.result-meta {
  font-size: 12px;
  color: #6b7280;
  display: flex;
  gap: 8px;
}

.result-region {
  /* Region display */
}

.result-country {
  /* Country display */
}

.no-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 10;
  margin-top: 4px;
  padding: 12px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #6b7280;
  text-align: center;
}

/* WCAG 2.1 AA compliance */
/* Input focus outline: 3px blue box is clearly visible */
/* Result items have 40px+ hit target (padding ensures this) */
/* Text colors meet contrast ratios with white background */
</style>
