<template>
  <main class="d-flex flex-row position-relative overflow-hidden" style="flex: 1; min-height: 100%">
    <!-- Mobile menu button - outside chat pane so it stays at top -->
    <button
      v-if="showMobileMenu"
      type="button"
      class="mobile-menu-btn"
      @click="emit('open-sidebar')"
      aria-label="Open sidebar"
    >
      <i class="bi bi-list"></i>
    </button>

    <section class="chat-pane">
      <div class="d-flex flex-column gap-3 h-100 w-100 chat-content-layer">
        <ChatMessages
          v-if="hasAssistantResponse"
          :messages="messages"
          :votes="votes"
          @vote="handleVote"
        />

        <ChatInputBar
          v-model="userInput"
          :is-thinking="isThinking"
          @send="sendMessage"
        />
      </div>
    </section>

    <aside class="motion-pane">
      <MotionGlbBackground :motion-url="latestMotionUrl" />
      
      <div 
        v-if="isGeneratingMotion" 
        class="position-absolute top-50 start-50 translate-middle d-flex flex-column align-items-center justify-content-center bg-white bg-opacity-75 rounded-4 p-4 shadow"
        style="z-index: 10; min-width: 220px;"
      >
        <div class="spinner-border text-primary mb-3" role="status" style="width: 2.5rem; height: 2.5rem;">
          <span class="visually-hidden">Loading...</span>
        </div>
        <span class="text-primary fw-bold text-uppercase" style="letter-spacing: 1px;">Generating Model...</span>
      </div>
    </aside>
  </main>
</template>

<script setup>
import MotionGlbBackground from './MotionGlbBackground.vue'
import ChatMessages from './ChatMessages.vue'
import ChatInputBar from './ChatInputBar.vue'
import { useDashboardChat } from '@/composables/useDashboardChat'

defineProps({
  showMobileMenu: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['open-sidebar'])

const {
  userInput,
  messages,
  latestMotionUrl,
  isThinking,
  isGeneratingMotion,
  hasAssistantResponse,
  votes,
  setVote,
  sendMessage,
  clearMessages,
  loadSession
} = useDashboardChat()

const handleVote = ({ index, vote }) => {
  setVote(index, vote)
}

defineExpose({
  clearMessages,
  loadSession
})
</script>

<style scoped>
.chat-pane {
  position: relative;
  z-index: 2;
  flex: 0 0 46%;
  min-width: 21rem;
  display: flex;
  align-items: stretch;
  padding: 1rem 1.25rem 1.25rem;
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
  min-height: 0;
}

.mobile-menu-btn {
  position: absolute;
  top: 0.9rem;
  left: 0.9rem;
  padding: 0;
  border: none;
  z-index: 4;
  background: transparent;
  color: #000;
  font-size: 1.85rem;
  line-height: 1;
  pointer-events: auto;
}

@media (max-width: 768px) {
  .chat-pane {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    top: auto;
    min-width: 0;
    width: 100%;
    z-index: 2;
    padding: 0 0.85rem 1rem;
    pointer-events: none;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    max-height: 100%;
  }

  .motion-pane {
    position: absolute;
    inset: 0;
    z-index: 1;
  }

  .chat-content-layer {
    justify-content: flex-end;
    gap: 0.5rem;
    pointer-events: none;
    flex: none;
  }

  :deep(.messages-container) {
    max-height: 35vh;
    overflow-y: auto;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    border-radius: 0.7rem;
    padding: 0.6rem;
    pointer-events: auto;
  }

  :deep(.chat-input-bar) {
    margin-top: 0;
    pointer-events: auto;
  }
}
</style>
