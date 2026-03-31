<template>
  <div class="chat-input-bar input-group border rounded-3 bg-white shadow-sm">
    <input
      v-autofocus
      :value="modelValue"
      type="text"
      class="chat-input-field form-control border-0 shadow-none"
      :placeholder="isThinking ? 'ECA is thinking...' : 'Ask me anything...'"
      :disabled="isThinking"
      @input="emit('update:modelValue', $event.target.value)"
      @keyup.enter="emit('send')"
    />

    <button
      class="chat-send-btn btn btn-dark rounded-2"
      :disabled="!modelValue.trim() || isThinking"
      @click="emit('send')"
    >
      <span v-if="isThinking" class="spinner-border spinner-border-sm" aria-hidden="true"></span>
      <i v-else class="bi bi-arrow-up"></i>
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  isThinking: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'send'])
</script>

<style scoped>
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

.chat-send-btn:disabled {
  opacity: 0.55;
}
</style>
