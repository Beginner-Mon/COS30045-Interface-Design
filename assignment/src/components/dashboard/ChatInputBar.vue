<template>
  <div class="chat-input-bar input-group border rounded-3 bg-white shadow-sm mt-auto" style="padding: 0.35rem">
    <input
      v-autofocus
      :value="modelValue"
      type="text"
      class="form-control border-0 shadow-none"
      :class="{ 'opacity-75': isThinking }"
      style="min-height: 2.1rem; pointer-events: auto"
      :placeholder="isThinking ? 'ECA is thinking...' : 'Ask me anything...'"
      :disabled="isThinking"
      @input="emit('update:modelValue', $event.target.value)"
      @keyup.enter="emit('send')"
    />

    <button
      class="btn btn-dark rounded-2 d-inline-flex align-items-center justify-content-center"
      style="width: 2.1rem; height: 2.1rem; pointer-events: auto"
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
