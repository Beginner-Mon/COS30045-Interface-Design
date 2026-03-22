<template>
  <aside
    :class="[
      'd-flex',
      'flex-column',
      'bg-white',
      'border-end',
      'sidebar-container',
      { 'sidebar-collapsed': sidebarCollapsed, 'mobile-drawer': mobileDrawer }
    ]"
  >
    <!-- Logo -->
    <div class="d-flex align-items-center p-4">
      <img src="/logo.svg" alt="ECA Logo" class="logo-img" />
      <span v-if="!sidebarCollapsed" class="ms-2 fs-5 fw-bold">ECA</span>
    </div>

    <!-- Chat Items -->
    <div class="flex-grow-1 overflow-y-auto">
      <!-- New Chat -->
      <div
        class="d-flex align-items-center justify-content-between gap-2 px-4 py-3 fw-semibold text-dark border-start border-3 border-transparent"
        role="button"
        @click="emit('new-chat')"
      >
        <span v-if="!sidebarCollapsed" class="text-truncate">New Chat</span>
        <i class="bi bi-plus-lg flex-shrink-0"></i>
      </div>

      <!-- Chat History (disabled for now)
      <div
        v-for="(chat, index) in chatHistory"
        :key="index"
        class="d-flex align-items-center justify-content-between gap-2 px-4 py-3 cursor-pointer text-muted chat-item-hover"
      >
        <span v-if="!sidebarCollapsed" class="text-truncate">{{ chat.title }}</span>
        <i class="bi bi-chat-left flex-shrink-0"></i>
      </div>
      -->
    </div>

    <!-- User Section -->
    <div class="p-3 user-section">
      <div class="d-flex align-items-center justify-content-between gap-2 position-relative">
        <div 
          ref="avatarRef"
          class="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 user-avatar text-white fw-bold bg-primary bg-gradient"
          @click="toggleLogoutMenu"
          :title="userStore.user?.email"
        >
          {{ userInitials }}
        </div>
        <button
          v-if="!sidebarCollapsed"
          class="btn btn-sm btn-link text-muted p-2 d-none d-lg-flex"
          @click="sidebarCollapsed = !sidebarCollapsed"
          title="Collapse Sidebar"
        >
          <i class="bi bi-chevron-double-left"></i>
        </button>
      </div>

      <!-- Expand Button (visible when collapsed on desktop) -->
      <button
        v-if="sidebarCollapsed"
        class="btn btn-sm btn-link text-muted p-2 d-none d-lg-flex w-100 justify-content-center mt-2"
        @click="sidebarCollapsed = !sidebarCollapsed"
        title="Expand Sidebar"
      >
        <i class="bi bi-chevron-double-right"></i>
      </button>

      <!-- Logout Menu (Teleported outside) -->
    </div>
  </aside>

  <!-- Logout Menu - Teleported to body -->
  <Teleport to="body">
    <transition name="logout-fade">
      <div v-if="showLogout" class="logout-menu-teleport" :style="{ left: logoutMenuPosition.left, top: logoutMenuPosition.top }">
        <button class="btn btn-sm w-100 text-dark" @click="handleLogout">
          <i class="bi bi-box-arrow-right"></i> Log Out
        </button>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

defineProps({
  mobileDrawer: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['new-chat'])

const router = useRouter()
const userStore = useUserStore()

const sidebarCollapsed = ref(false)
const showLogout = ref(false)
const logoutMenuPos = ref({ left: 0, top: 0 })
const avatarRef = ref(null)

/* const chatHistory = ref([
  { title: 'Next.js learning' },
  { title: 'Python basics' },
  { title: 'Vue 3 components' }
]) */

const userInitials = computed(() => {
  const name = userStore.user?.displayName || 'User'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
})

const updateLogoutMenuPosition = () => {
  const avatar = avatarRef.value
  if (!avatar) return
  const rect = avatar.getBoundingClientRect()
  logoutMenuPos.value = {
    left: rect.left + 'px',
    top: (rect.top - 65) + 'px'
  }
}

const toggleLogoutMenu = () => {
  if (showLogout.value) {
    showLogout.value = false
    return
  }

  updateLogoutMenuPosition()
  showLogout.value = true
}

const logoutMenuPosition = computed(() => logoutMenuPos.value)

watch(sidebarCollapsed, () => {
  setTimeout(updateLogoutMenuPosition, 100)
})

const handleLogout = async () => {
  try {
    await userStore.logout()
    router.push('/auth/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}
</script>

<style scoped>
.sidebar-container {
  width: 280px;
  transition: width 0.3s ease;
  overflow: hidden;
}

.sidebar-container.mobile-drawer {
  width: 280px;
  height: 100vh;
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 3100;
  box-shadow: 12px 0 30px rgba(0, 0, 0, 0.25);
}

.sidebar-container.sidebar-collapsed {
  width: 70px;
}

.logo-img {
  height: 40px;
}

.sidebar-collapsed .logo-img {
  height: 30px;
}
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
  background-color: #f8f9fa;
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
