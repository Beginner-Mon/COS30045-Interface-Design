<template>
  <aside :class="['d-flex', 'flex-column', 'bg-white', 'border-end', 'sidebar-container', { 'sidebar-collapsed': sidebarCollapsed }]">
    <!-- Logo -->
    <div class="d-flex align-items-center p-4">
      <img src="/logo.svg" alt="ECA Logo" class="logo-img" />
      <span v-if="!sidebarCollapsed" class="ms-2 fs-5 fw-bold">ECA</span>  
    </div>

    <!-- Chat Items -->
    <div class="flex-grow-1 overflow-y-auto">
      <!-- New Chat -->
      <div 
        class="d-flex align-items-center justify-content-between gap-2 px-4 py-3 cursor-pointer fw-bold text-primary chat-item-hover" 
        @click="$emit('new-chat')"
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
          class="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 user-avatar"
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

.sidebar-container.sidebar-collapsed {
  width: 70px;
}

.logo-img {
  height: 40px;

}

.sidebar-collapsed .logo-img {
  height: 30px;
}

/* Chat Item Hover Effects */
.chat-item-hover {
  border-left: 3px solid transparent;
  transition: all 0.2s ease;
}

.chat-item-hover:hover {
  background-color: #f8f9fa;
  color: #667eea !important;
  border-left-color: #667eea;
}

/* User Section */
.user-section {
  position: relative;
}

/* User Avatar */
.user-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
}

/* Logout Menu - Deprecated (kept for reference) */
.logout-menu {
  position: absolute;
  left: 0;
  bottom: 100%;
  width: 120px;
  min-width: 120px;
  margin-bottom: 0.5rem;
  z-index: 1000;
  background-color: #f8f9fa;
  border-radius: 0.375rem;
  padding: 0.5rem;
}

/* Logout Menu Teleported */
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

/* Logout Transition Animation */
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

/* Collapsed Sidebar Adjustments */
.sidebar-collapsed .chat-item-hover {
  justify-content: center !important;
  padding: 0.75rem !important;
}

.sidebar-collapsed .text-truncate {
  display: none;
}

/* Scrollbar Styling */
div::-webkit-scrollbar {
  width: 6px;
}

div::-webkit-scrollbar-track {
  background: transparent;
}

div::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

div::-webkit-scrollbar-thumb:hover {
  background: #999;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar-container {
    width: 70px;
  }

  .chat-item-hover {
    justify-content: center !important;
    padding: 0.75rem !important;
  }

  .text-truncate {
    display: none;
  }
}

@media (max-width: 576px) {
  .sidebar-container {
    width: 100%;
    height: auto;
    flex-direction: row !important;
    border-right: none;
    border-bottom: 1px solid #e9ecef;
  }

  .sidebar-container > div:first-child {
    padding: 0.75rem !important;
    flex-shrink: 0;
  }

  .flex-grow-1 {
    flex-direction: row !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    padding: 0 !important;
  }

  .chat-item-hover {
    padding: 0.75rem !important;
    white-space: nowrap;
    border-left: none;
    border-bottom: 3px solid transparent !important;
    flex-shrink: 0;
  }

  .chat-item-hover:hover {
    border-bottom-color: #667eea !important;
    border-left: none;
  }

  .sidebar-container .p-3:last-child {
    border-top: none;
    border-left: 1px solid #e9ecef;
    padding: 0.5rem !important;
  }

  .sidebar-container .d-flex {
    justify-content: center !important;
  }
}
</style>
