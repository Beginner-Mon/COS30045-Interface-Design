<template>
  <div class="d-flex align-items-center gap-2 bg-white border border-secondary-subtle rounded-pill px-3 py-1 shadow-sm mt-2" style="max-width: 280px; min-height: 38px; pointer-events: auto">
    <!-- Play/Pause Button -->
    <button @click="togglePlay" class="btn btn-sm btn-link p-0 text-primary text-decoration-none shadow-none">
      <i :class="isPlaying ? 'bi bi-pause-circle-fill' : 'bi bi-play-circle-fill'" style="font-size: 1.35rem;"></i>
    </button>
    
    <!-- Progress Bar -->
    <input 
      type="range" 
      class="form-range flex-grow-1 shadow-none custom-range" 
      min="0" 
      :max="duration || 100" 
      :value="currentTime" 
      @input="onSeek"
    >
    
    <!-- Time indicator -->
    <span class="small fw-semibold text-secondary user-select-none" style="font-size: 0.75rem; min-width: 32px; text-align: right;">
      {{ formatTime(currentTime) }}
    </span>

    <audio 
      ref="audioRef" 
      :src="src" 
      @timeupdate="updateProgress" 
      @loadedmetadata="onLoadedMetadata" 
      @ended="onEnded"
      class="d-none"
    ></audio>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  src: {
    type: String,
    required: true
  }
})

const audioRef = ref(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)

const togglePlay = () => {
  if (!audioRef.value) return
  if (isPlaying.value) {
    audioRef.value.pause()
    isPlaying.value = false
  } else {
    audioRef.value.play().catch(e => console.warn('Audio play prevented:', e))
    isPlaying.value = true
  }
}

const updateProgress = () => {
  if (!audioRef.value) return
  currentTime.value = audioRef.value.currentTime
}

const onLoadedMetadata = () => {
  if (!audioRef.value) return
  duration.value = audioRef.value.duration
}

const onSeek = (e) => {
  if (!audioRef.value) return
  const time = Number(e.target.value)
  audioRef.value.currentTime = time
  currentTime.value = time
}

const onEnded = () => {
  isPlaying.value = false
  currentTime.value = 0
}

const formatTime = (time) => {
  if (!Number.isFinite(time)) return '0:00'
  const mins = Math.floor(time / 60)
  const secs = Math.floor(time % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

watch(() => props.src, () => {
  isPlaying.value = false
  currentTime.value = 0
  if (audioRef.value) {
    audioRef.value.pause()
    audioRef.value.load()
  }
})

onBeforeUnmount(() => {
  if (audioRef.value) {
    audioRef.value.pause()
    audioRef.value.src = ''
  }
})
</script>

<style scoped>
.custom-range {
  height: 4px;
}

.custom-range::-webkit-slider-thumb {
  background: var(--bs-primary);
  width: 12px;
  height: 12px;
  margin-top: -4px;
}

.custom-range::-moz-range-thumb {
  background: var(--bs-primary);
  width: 12px;
  height: 12px;
}

button:focus,
input:focus {
  outline: none;
}
</style>
