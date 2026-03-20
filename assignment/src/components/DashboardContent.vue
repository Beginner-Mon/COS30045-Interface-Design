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
        <div v-if="hasAssistantResponse" class="messages-container">
          <div v-for="(msg, index) in messages" :key="index" class="message" :class="msg.role">
            <div class="message-bubble">
              <div class="message-content">{{ msg.text }}</div>
              <div v-if="msg.role === 'assistant' && msg.exercises?.length" class="exercise-list">
                <div v-for="(exercise, exerciseIndex) in msg.exercises" :key="exerciseIndex" class="exercise-item">
                  {{ exercise }}
                </div>
              </div>
              <button
                v-if="msg.role === 'assistant' && msg.audioUrl"
                type="button"
                class="audio-replay-btn"
                title="Play reply audio"
                @click="playMessageAudio(msg.audioUrl)"
              >
                <i class="bi bi-volume-up-fill"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="chat-input-bar">
          <input
            v-model="userInput"
            type="text"
            class="chat-input-field"
            :placeholder="isThinking ? 'ECA is thinking...' : 'Ask me anything...'"
            :disabled="isThinking"
            @keyup.enter="sendMessage"
          />
          <button class="chat-send-btn" @click="sendMessage" :disabled="!userInput.trim() || isThinking">
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
  justify-content: flex-start;
  gap: 0.65rem;
  width: 100%;
  max-width: none;
  height: 100%;
  pointer-events: auto;
}

.messages-container {
  flex: 1;
  min-height: 0;
  width: 100%;
  max-height: none;
  overflow-y: auto;
  padding: 0;
  border-radius: 0;
  background: transparent;
  border: none;
  backdrop-filter: none;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.message {
  display: flex;
}

.message.user {
  justify-content: flex-end;
}

.message.assistant {
  justify-content: flex-start;
}

.message-bubble {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 100%;
}

.message.user .message-bubble {
  align-items: flex-end;
}

.message-content {
  padding: 0.65rem 0.9rem;
  border-radius: 0.75rem;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  word-break: normal;
}

.message.user .message-content {
  background-color: #5e86e5;
  color: white;
}

.message.assistant .message-content {
  background-color: #f8fbff;
  color: #1f2937;
  border: 1px solid rgba(155, 178, 202, 0.35);
}

.exercise-list {
  margin-top: 0.4rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.exercise-item {
  font-size: 0.82rem;
  line-height: 1.2;
  padding: 0.32rem 0.55rem;
  border-radius: 0.5rem;
  background: rgba(94, 134, 229, 0.14);
  color: #2f4a73;
}

.audio-replay-btn {
  margin-top: 0.35rem;
  border: none;
  background: transparent;
  color: #3c5d85;
  font-size: 0.95rem;
  line-height: 1;
  padding: 0.1rem 0.2rem;
}

.audio-replay-btn:hover {
  color: #1b3f73;
}

.thinking-content {
  display: flex;
  align-items: center;
  gap: 0.15rem;
}

.thinking-dots span {
  display: inline-block;
  animation: thinking-blink 1.2s infinite;
}

.thinking-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.thinking-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

.chat-input-bar {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: auto;
  padding: 0.35rem 0.45rem;
  border: 1px solid rgba(155, 178, 202, 0.35);
  background: rgba(255, 255, 255, 0.92);
  border-radius: 0.6rem;
  box-shadow: 0 6px 16px rgba(56, 95, 138, 0.12);
  backdrop-filter: blur(10px);
}

.chat-input-field {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: 0.45rem 0.6rem;
  color: #1f2937;
}

.chat-input-field:disabled {
  opacity: 0.75;
}

.chat-send-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 0.5rem;
  width: 2.1rem;
  height: 2.1rem;
  background: #5e86e5;
  color: #fff;
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
    width: 100%;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .message-content {
    max-width: 90%;
  }

  .messages-container {
    height: 30vh;
    max-height: 30vh;
    background: rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    border-radius: 0.7rem;
    padding: 0.45rem;
  }

  .chat-input-bar {
    margin-top: 0;
    position: sticky;
    bottom: 0;
    z-index: 3;
  }
}

@keyframes thinking-blink {
  0%, 80%, 100% {
    opacity: 0.25;
  }

  40% {
    opacity: 1;
  }
}
</style>
