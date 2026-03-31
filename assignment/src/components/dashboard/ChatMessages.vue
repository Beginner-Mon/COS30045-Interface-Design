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
          class="message-content px-3 py-2"
          :class="msg.role === 'user' ? 'rounded-3 border border-primary-subtle bg-primary-subtle text-dark' : 'bg-light text-dark'"
        >
          <AnimatedMarkdown 
            :text="msg.text" 
            :is-assistant="msg.role === 'assistant'" 
            :animated="msg.animated" 
          />
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

        <MiniAudioPlayer 
          v-if="msg.role === 'assistant' && msg.audioUrl"
          :src="msg.audioUrl" 
          :autoplay="msg.animated"
        />

        <!-- Thumbs up / down vote buttons -->
        <div v-if="msg.role === 'assistant' && msg.text" class="vote-row d-flex gap-2 mt-1">
          <button
            class="vote-btn"
            :class="{ 'voted': votes[index] === 'up' }"
            title="Helpful"
            @click="emit('vote', { index, vote: 'up' })"
          >
            <i :class="votes[index] === 'up' ? 'bi bi-hand-thumbs-up-fill' : 'bi bi-hand-thumbs-up'"></i>
          </button>
          <button
            class="vote-btn"
            :class="{ 'voted': votes[index] === 'down' }"
            title="Not helpful"
            @click="emit('vote', { index, vote: 'down' })"
          >
            <i :class="votes[index] === 'down' ? 'bi bi-hand-thumbs-down-fill' : 'bi bi-hand-thumbs-down'"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import AnimatedMarkdown from './AnimatedMarkdown.vue'
import MiniAudioPlayer from './MiniAudioPlayer.vue'

defineProps({
  messages: {
    type: Array,
    default: () => []
  },
  votes: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['vote'])
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

.vote-row {
  padding-left: 0.15rem;
}

.vote-btn {
  background: none;
  border: none;
  padding: 0.15rem 0.3rem;
  font-size: 0.85rem;
  color: #999;
  cursor: pointer;
  border-radius: 0.3rem;
  transition: color 0.15s ease;
  line-height: 1;
}

.vote-btn:hover {
  color: #000;
}

.vote-btn.voted {
  color: #000;
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

