<template>
  <main class="chat-main">
    <MotionAvatarBackground ref="motionBgRef" />

    <div class="camera-controls">
      <button type="button" class="btn btn-sm btn-light" @click="zoomIn">+</button>
      <button type="button" class="btn btn-sm btn-light" @click="zoomOut">-</button>
      <button type="button" class="btn btn-sm btn-light" @click="resetView">Reset</button>
    </div>

    <div class="chat-content-layer">
      <!-- <div class="messages-container">
        <div class="messages-scroll">
          <div v-for="(msg, index) in messages" :key="index" class="message" :class="msg.role">
            <div class="message-content">{{ msg.text }}</div>
          </div>
        </div>
      </div> -->

      <!-- Chat Input -->
      <div class="chat-input-area">
        <div class="input-group">
          <input
            v-model="userInput"
            type="text"
            class="form-control"
            placeholder="Ask me anything..."
            @keyup.enter="sendMessage"
          />
          <button class="btn btn-primary" @click="sendMessage" :disabled="!userInput.trim()">
            <i class="bi bi-send"></i>
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import MotionAvatarBackground from './MotionAvatarBackground.vue'
import MotionBackground from './MotionBackground.vue'
const userInput = ref('')
const messages = ref([])
const motionBgRef = ref(null)

const sendMessage = () => {
  if (userInput.value.trim()) {
    messages.value.push({
      role: 'user',
      text: userInput.value
    })

    // Simulate assistant response
    setTimeout(() => {
      messages.value.push({
        role: 'assistant',
        text: 'This is a sample response. Backend integration coming soon.'
      })
    }, 500)

    userInput.value = ''
  }
}

defineExpose({
  clearMessages: () => {
    messages.value = []
  }
})

const zoomIn = () => {
  motionBgRef.value?.zoomIn?.()
}

const zoomOut = () => {
  motionBgRef.value?.zoomOut?.()
}

const resetView = () => {
  motionBgRef.value?.resetView?.()
}
</script>

<style scoped>
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  background: radial-gradient(circle at 50% 50%, rgba(8, 34, 61, 0.18), rgba(8, 34, 61, 0.5));
}

.camera-controls {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 3;
  display: flex;
  gap: 0.5rem;
  pointer-events: auto;
}

.camera-controls .btn {
  min-width: 2.25rem;
  border: none;
  background: rgba(255, 255, 255, 0.85);
}

.chat-content-layer {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  min-height: 100%;
  padding-bottom: 1rem;
  pointer-events: none;
}

/* Messages Container */
.messages-container {
  width: 60%;
  max-width: 800px;
  height: 300px;
  overflow: hidden;
  padding: 1rem;
  margin-bottom: 0.75rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(4px);
  pointer-events: auto;
}

.messages-scroll {
  height: 100%;
  overflow-y: auto;
  display: flex;
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

.message-content {
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  max-width: 60%;
  word-wrap: break-word;
}

.message.user .message-content {
  background-color: #667eea;
  color: white;
}

.message.assistant .message-content {
  background-color: rgba(255, 255, 255, 0.82);
  color: #1f2937;
}

/* Chat Input */
.chat-input-area {
  width: 60%;
  max-width: 800px;
  padding: 1.5rem 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.35);
  background-color: rgba(255, 255, 255, 0.26);
  backdrop-filter: blur(6px);
  border-radius: 0.75rem;
  pointer-events: auto;
}

.input-group {
  display: flex;
  gap: 0.5rem;
}

.input-group .form-control {
  border-radius: 2rem;
  border: 1px solid #e9ecef;
  padding: 0.75rem 1.25rem;
}

.input-group .form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.input-group .btn {
  border-radius: 2rem;
  padding: 0.75rem 1.5rem;
}

/* Scrollbar */
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

/* Responsive */
@media (max-width: 768px) {
  .messages-container {
    width: 88%;
  }

  .message-content {
    max-width: 85%;
  }

  .chat-input-area {
    width: 88%;
    padding: 1rem;
  }
}

@media (max-width: 576px) {
  .chat-main {
    min-height: 500px;
  }

  .message-content {
    max-width: 90%;
  }
}
</style>
