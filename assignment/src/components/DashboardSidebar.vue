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

    <SidebarUserSection
      :avatar-ref="avatarRef"
      :sidebar-collapsed="sidebarCollapsed"
      :show-logout="showLogout"
      :logout-menu-position="logoutMenuPosition"
      :user-initials="userInitials"
      :user-email="userStore.user?.email || ''"
      @toggle-logout="toggleLogoutMenu"
      @toggle-sidebar="toggleSidebarCollapsed"
      @logout="handleLogout"
    />
  </aside>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import SidebarUserSection from '@/components/dashboard/SidebarUserSection.vue'
import { useDashboardSidebar } from '@/composables/useDashboardSidebar'

defineProps({
  mobileDrawer: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['new-chat'])

const router = useRouter()
const userStore = useUserStore()

const {
  avatarRef,
  sidebarCollapsed,
  showLogout,
  userInitials,
  logoutMenuPosition,
  toggleLogoutMenu,
  toggleSidebarCollapsed,
  handleLogout
} = useDashboardSidebar({ userStore, router })
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
</style>
