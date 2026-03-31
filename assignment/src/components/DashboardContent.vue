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

      <div class="chat-content-layer d-flex flex-column gap-3 h-100 w-100">
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
import ChatMessages from '@/components/dashboard/ChatMessages.vue'
import ChatInputBar from '@/components/dashboard/ChatInputBar.vue'
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
  min-height: 0;
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

  :deep(.messages-container) {
    height: 30vh;
    max-height: 30vh;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 0.7rem;
    padding: 0.45rem;
    pointer-events: auto;
  }

  :deep(.chat-input-bar) {
    margin-top: 0;
    position: sticky;
    bottom: 0;
    z-index: 3;
    pointer-events: auto;
  }
}
</style>
