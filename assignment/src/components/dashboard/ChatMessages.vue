<template>
  <div class="messages-container d-flex flex-column gap-2">
    <div
      v-for="(msg, index) in messages"
      :key="index"
      class="d-flex"
      :class="msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'"
    >
      <div class="message-bubble d-flex flex-column" :class="msg.role === 'user' ? 'align-items-end' : 'align-items-start'">
        <div
          class="message-content px-3 py-2 rounded-3 border"
          :class="msg.role === 'user' ? 'bg-primary-subtle border-primary-subtle text-dark' : 'bg-light text-dark'"
        >
          {{ msg.text }}
        </div>

        <div v-if="msg.role === 'assistant' && msg.exercises?.length" class="exercise-list">
          <div
            v-for="(exercise, exerciseIndex) in msg.exercises"
            :key="exerciseIndex"
            class="exercise-item badge rounded-pill text-bg-primary-subtle text-primary-emphasis"
          >
            {{ exercise }}
          </div>
        </div>

        <button
          v-if="msg.role === 'assistant' && msg.audioUrl"
          type="button"
          class="audio-replay-btn btn btn-sm btn-link text-secondary p-0 mt-1 text-start"
          title="Play reply audio"
          @click="emit('play-audio', msg.audioUrl)"
        >
          <i class="bi bi-volume-up-fill"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  messages: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['play-audio'])
</script>

<style scoped>
.messages-container {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.message-bubble {
  max-width: 100%;
}

.message-content {
  white-space: pre-wrap;
  overflow-wrap: break-word;
}

.exercise-list {
  margin-top: 0.4rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.exercise-item {
  font-size: 0.78rem;
  font-weight: 500;
}

.audio-replay-btn {
  pointer-events: auto;
}

.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #999;
}
</style>
