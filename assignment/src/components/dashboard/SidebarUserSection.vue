<template>
  <div class="p-3 user-section">
    <div class="d-flex align-items-center justify-content-between gap-2 position-relative">
      <div
        :ref="avatarRef"
        class="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 user-avatar text-white fw-bold bg-primary bg-gradient"
        :title="userEmail"
        @click="emit('toggle-logout')"
      >
        {{ userInitials }}
      </div>

      <button
        v-if="!sidebarCollapsed"
        class="btn btn-sm btn-link text-muted p-2 d-none d-lg-flex"
        title="Collapse Sidebar"
        @click="emit('toggle-sidebar')"
      >
        <i class="bi bi-chevron-double-left"></i>
      </button>
    </div>

    <button
      v-if="sidebarCollapsed"
      class="btn btn-sm btn-link text-muted p-2 d-none d-lg-flex w-100 justify-content-center mt-2"
      title="Expand Sidebar"
      @click="emit('toggle-sidebar')"
    >
      <i class="bi bi-chevron-double-right"></i>
    </button>
  </div>

  <Teleport to="body">
    <transition name="logout-fade">
      <div v-if="showLogout" class="logout-menu-teleport" :style="{ left: logoutMenuPosition.left, top: logoutMenuPosition.top }">
        <button class="btn btn-sm w-100 text-dark" @click="emit('logout')">
          <i class="bi bi-box-arrow-right"></i>
          Log Out
        </button>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
defineProps({
  avatarRef: {
    type: Object,
    required: true
  },
  sidebarCollapsed: {
    type: Boolean,
    default: false
  },
  showLogout: {
    type: Boolean,
    default: false
  },
  logoutMenuPosition: {
    type: Object,
    default: () => ({ left: '0px', top: '0px' })
  },
  userInitials: {
    type: String,
    default: 'U'
  },
  userEmail: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['toggle-logout', 'toggle-sidebar', 'logout'])
</script>

<style scoped>
.user-avatar {
  width: 40px;
  height: 40px;
  cursor: pointer;
}

.logout-menu-teleport {
  position: absolute;
  width: 120px;
  min-width: 120px;
  z-index: 9999;
  background-color: var(--bs-light);
  border-radius: 0.375rem;
  padding: 0.2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.logout-fade-enter-active,
.logout-fade-leave-active {
  transition: all 0.3s ease;
}

.logout-fade-enter-from,
.logout-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.logout-fade-enter-to,
.logout-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
