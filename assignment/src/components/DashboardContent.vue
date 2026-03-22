<template>
  <main class="chat-main">
    <section class="chat-pane">
      <button
        v-if="showMobileMenu"
        type="button"
        class="mobile-menu-btn"
        @click="emit('open-sidebar')"
        aria-label="Open sidebar"
      >
        <i class="bi bi-list"></i>
      </button>

      <div class="chat-content-layer">
        <div v-if="hasAssistantResponse" class="messages-container d-flex flex-column gap-2">
          <div
            v-for="(msg, index) in messages"
            :key="index"
            class="d-flex"
            :class="msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'"
          >
            <div class="message-bubble d-flex flex-column" :class="msg.role === 'user' ? 'align-items-end' : 'align-items-start'">
              <div
                class="message-content px-3 py-2 rounded-3"
                :class="msg.role === 'user' ? 'user-message-tone text-dark border' : 'bg-light border text-dark'"
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
                @click="playMessageAudio(msg.audioUrl)"
              >
                <i class="bi bi-volume-up-fill"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="chat-input-bar input-group border rounded-3 bg-white shadow-sm">
          <input
            v-model="userInput"
            type="text"
            class="chat-input-field form-control border-0 shadow-none"
            :placeholder="isThinking ? 'ECA is thinking...' : 'Ask me anything...'"
            :disabled="isThinking"
            @keyup.enter="sendMessage"
          />
          <button
            class="chat-send-btn btn btn-dark rounded-2"
            @click="sendMessage"
            :disabled="!userInput.trim() || isThinking"
          >
            <span v-if="isThinking" class="spinner-border spinner-border-sm" aria-hidden="true"></span>
            <i v-else class="bi bi-arrow-up"></i>
          </button>
        </div>
      </div>
    </section>

    <aside class="motion-pane">
      <MotionGlbBackground :motion-url="latestMotionUrl" />
    </aside>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
// import MotionBackground from './MotionBackground.vue'
import MotionGlbBackground from './MotionGlbBackground.vue'
import { fetchOrchestratorAnswer } from '@/api'

defineProps({
  showMobileMenu: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['open-sidebar'])

const userInput = ref('')
const messages = ref([])
const latestMotion = ref(null)
const latestMotionUrl = ref('')
const isThinking = ref(false)
const hasAssistantResponse = computed(() => messages.value.some((message) => message.role === 'assistant'))

let audioPlayer = null

const normalizeExercises = (exercises) => {
  if (!Array.isArray(exercises)) return []

  return exercises
    .map((exercise) => {
      if (typeof exercise === 'string') return exercise.trim()
      if (exercise && typeof exercise === 'object') {
        return String(exercise.name || exercise.title || '').trim()
      }
      return ''
    })
    .filter(Boolean)
}

const playMessageAudio = async (url) => {
  if (!url) return

  if (!audioPlayer) {
    audioPlayer = new Audio()
  }

  if (audioPlayer.src !== url) {
    audioPlayer.src = url
  } else {
    audioPlayer.currentTime = 0
  }

  try {
    await audioPlayer.play()
  } catch (error) {
    console.warn('Failed to play TTS audio:', error)
  }
}

const sendMessage = async () => {
  const text = userInput.value.trim()
  if (!text || isThinking.value) return

  messages.value.push({
    role: 'user',
    text
  })

  userInput.value = ''
  isThinking.value = true

  try {
    const conversation_history = messages.value
      .slice(0, -1)
      .map((message) => ({
        role: message.role,
        content: message.text
      }))

    const data = await fetchOrchestratorAnswer({
      query: text,
      user_id: 'default',
      conversation_history
    })

    console.log('Orchestrator full response:', data)
    const audioUrl = data?.tts?.audio_url || ''
    latestMotion.value = data?.motion || null
    latestMotionUrl.value = data?.motion?.motion_file_url || ''

    messages.value.push({
      role: 'assistant',
      text: data?.text_answer || 'No response text received from orchestrator.',
      audioUrl,
      exercises: normalizeExercises(data?.exercises)
    })

    if (latestMotion.value) {
      console.log('Motion content from orchestrator:', latestMotion.value)
    }

    if (audioUrl) {
      await playMessageAudio(audioUrl)
    }
  } catch (error) {
    const message = error?.response?.data?.detail || error?.message || 'Failed to contact orchestrator API.'
    messages.value.push({
      role: 'assistant',
      text: `Error: ${message}`
    })
  } finally {
    isThinking.value = false
  }
}

defineExpose({
  clearMessages: () => {
    messages.value = []
    userInput.value = ''
    isThinking.value = false
    latestMotion.value = null
    latestMotionUrl.value = ''
    if (audioPlayer) {
      audioPlayer.pause()
      audioPlayer.currentTime = 0
    }
  }
})

onBeforeUnmount(() => {
  if (audioPlayer) {
    audioPlayer.pause()
    audioPlayer.src = ''
  }
})
</script>

<style scoped>
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: row;
  position: relative;
  overflow: hidden;
  min-height: 100%;
}

.chat-pane {
  position: relative;
  z-index: 2;
  flex: 0 0 46%;
  min-width: 21rem;
  display: flex;
  align-items: stretch;
  padding: 1rem 1.25rem 1.25rem;
  min-height: 0;
  background: transparent;
}

.motion-pane {
  position: relative;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  min-height: 0;
}

.chat-content-layer {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  height: 100%;
}

.messages-container {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.message-bubble {
  align-items: flex-start;
  max-width: 100%;
}

.message-content {
  white-space: pre-wrap;
  overflow-wrap: break-word;
}

.user-message-tone {
  background-color: #eef2f7;
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

.chat-input-bar {
  margin-top: auto;
  padding: 0.35rem;
}

.chat-input-field {
  min-height: 2.1rem;
  pointer-events: auto;
}

.chat-input-field:disabled {
  opacity: 0.75;
}

.chat-send-btn {
  width: 2.1rem;
  height: 2.1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
}

.audio-replay-btn {
  pointer-events: auto;
}

.chat-send-btn:disabled {
  opacity: 0.55;
}

.mobile-menu-btn {
  position: absolute;
  top: 0.9rem;
  left: 0.9rem;
  width: auto;
  height: auto;
  padding: 0;
  border: none;
  border-radius: 0;
  z-index: 4;
  background: transparent;
  color: #000;
  box-shadow: none;
  backdrop-filter: none;
  font-size: 1.85rem;
  line-height: 1;
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

@media (max-width: 768px) {
  .chat-main {
    min-height: 100vh;
  }

  .motion-pane {
    position: absolute;
    inset: 0;
    z-index: 1;
  }

  .chat-pane {
    flex: 1;
    min-width: 0;
    width: 100%;
    max-width: none;
    z-index: 2;
    padding: 4rem 0.85rem 1rem;
    pointer-events: none;
  }

  .chat-content-layer {
    justify-content: flex-end;
    gap: 0.5rem;
    pointer-events: none;
  }

  .message-content {
    max-width: 90%;
  }

  .messages-container {
    height: 30vh;
    max-height: 30vh;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 0.7rem;
    padding: 0.45rem;
    pointer-events: auto;
  }

  .chat-input-bar {
    margin-top: 0;
    position: sticky;
    bottom: 0;
    z-index: 3;
    pointer-events: auto;
  }
}
</style>
