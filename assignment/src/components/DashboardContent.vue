<template>
  <main class="chat-main">
    <!-- Initial Welcome State -->
    <div v-if="messages.length === 0" class="welcome-container">
      <img src="/logo.svg" alt="ECA" class="welcome-logo" />
      <h2>ECA</h2>
    </div>

    <!-- Messages -->
    <div v-else class="messages-container">
      <div v-for="(msg, index) in messages" :key="index" class="message" :class="msg.role">
        <div class="message-content">{{ msg.text }}</div>
      </div>
    </div>

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
  </main>
</template>

<script setup>
import { ref } from 'vue'

const userInput = ref('')
const messages = ref([])

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
</script>

<style scoped>
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: white;
}

/* Welcome Container */
.welcome-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
}

.welcome-logo {
  height: 100px;
  filter: brightness(0) invert(1);
  opacity: 0.3;
}

.welcome-container h2 {
  font-size: 3rem;
  font-weight: 700;
  color: #667eea;
  opacity: 0.3;
}

/* Messages Container */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
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
  background-color: #e9ecef;
  color: #212529;
}

/* Chat Input */
.chat-input-area {
  padding: 1.5rem 2rem;
  border-top: 1px solid #e9ecef;
  background-color: white;
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

/* Responsive */
@media (max-width: 768px) {
  .messages-container {
    padding: 1rem;
  }

  .message-content {
    max-width: 85%;
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
