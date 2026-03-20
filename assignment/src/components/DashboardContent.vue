<template>
  <main class="chat-main">
    <section class="chat-pane">
      <div class="chat-content-layer">
      <div class="messages-container">
        <div class="messages-scroll">
          <div v-for="(msg, index) in messages" :key="index" class="message" :class="msg.role">
            <div class="message-bubble">
              <div class="message-content">{{ msg.text }}</div>
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

          <div v-if="isThinking" class="message assistant">
            <div class="message-bubble">
              <div class="message-content thinking-content">
                ECA is thinking
                <span class="thinking-dots" aria-hidden="true">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-input-area">
        <div class="input-group">
          <input
            v-model="userInput"
            type="text"
            class="form-control"
            :placeholder="isThinking ? 'ECA is thinking...' : 'Ask me anything...'"
            :disabled="isThinking"
            @keyup.enter="sendMessage"
          />
          <button class="btn btn-primary" @click="sendMessage" :disabled="!userInput.trim() || isThinking">
            <span v-if="isThinking" class="spinner-border spinner-border-sm" aria-hidden="true"></span>
            <i v-else class="bi bi-send"></i>
          </button>
        </div>
      </div>
      </div>
    </section>

    <aside class="motion-pane">
      <!-- <MotionBackground :motion-url="latestMotionUrl" /> -->
      <MotionGlbBackground :motion-url="latestMotionUrl" />
    </aside>
  </main>
</template>

<script setup>
import { onBeforeUnmount, ref } from 'vue'
// import MotionBackground from './MotionBackground.vue'
import MotionGlbBackground from './MotionGlbBackground.vue'
import { fetchOrchestratorAnswer } from '@/api'

const userInput = ref('')
const messages = ref([])
const latestMotion = ref(null)
const latestMotionUrl = ref('')
const isThinking = ref(false)

let audioPlayer = null

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
      audioUrl
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
  background: linear-gradient(135deg, #f7fbff 0%, #eef5fc 48%, #e9f2fb 100%);
}

.chat-pane {
  position: relative;
  z-index: 2;
  flex: 0 0 46%;
  min-width: 21rem;
  display: flex;
  align-items: stretch;
  padding: 1.25rem;
  min-height: 0;
}

.motion-pane {
  position: relative;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  min-height: 0;
}

.chat-content-layer {
  position: relative;
  z-index: 2;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: stretch;
  min-height: 0;
  height: 100%;
  gap: 0.75rem;
  pointer-events: none;
}

.messages-container {
  flex: 1;
  width: 100%;
  max-width: none;
  height: auto;
  min-height: 0;
  overflow: hidden;
  padding: 1rem;
  margin-bottom: 0;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(155, 178, 202, 0.35);
  backdrop-filter: blur(12px);
  box-shadow: 0 18px 42px rgba(56, 95, 138, 0.12);
  pointer-events: auto;
}

.messages-scroll {
  height: 100%;
  overflow-y: auto;
  display: flex;
  pointer-events: auto;
  flex-direction: column;
  gap: 1rem;
}

.message {
  display: flex;
  margin-bottom: 1rem;
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
  padding: 0.75rem 1rem;
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

.chat-input-area {
  width: 100%;
  max-width: none;
  padding: 1.5rem 2rem;
  border: 1px solid rgba(155, 178, 202, 0.35);
  background-color: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  border-radius: 1rem;
  box-shadow: 0 18px 42px rgba(56, 95, 138, 0.12);
  pointer-events: auto;
}

.input-group {
  display: flex;
  gap: 0.5rem;
}

.input-group .form-control {
  border-radius: 2rem;
  border: 1px solid rgba(155, 178, 202, 0.45);
  padding: 0.75rem 1.25rem;
  background: #ffffff;
}

.input-group .form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.input-group .form-control:disabled {
  background-color: rgba(255, 255, 255, 0.65);
}

.input-group .btn {
  border-radius: 2rem;
  padding: 0.75rem 1.5rem;
  min-width: 3.25rem;
}

.messages-scroll::-webkit-scrollbar {
  width: 6px;
}

.messages-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.messages-scroll::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.messages-scroll::-webkit-scrollbar-thumb:hover {
  background: #999;
}

@media (max-width: 768px) {
  .chat-main {
    min-height: 100vh;
    align-items: center;
    justify-content: center;
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
    max-width: 42rem;
    padding: 1rem;
  }

  .chat-content-layer {
    justify-content: center;
    min-height: calc(100vh - 2rem);
  }

  .message-content {
    max-width: 90%;
  }

  .messages-container {
    flex: 1;
    height: auto;
    min-height: 0;
  }

  .chat-input-area {
    padding: 1rem;
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
