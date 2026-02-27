<template>
  <aside :class="['sidebar', { collapsed: sidebarCollapsed }]">
    <!-- Logo -->
    <div class="sidebar-logo">
      <img src="/logo.svg" alt="ECA Logo" class="logo-img" />
    </div>

    <!-- Chat Items -->
    <div class="chat-items">
      <!-- New Chat -->
      <div class="chat-item new-chat" @click="$emit('new-chat')">
        <span v-if="!sidebarCollapsed" class="item-label">New Chat</span>
        <i class="bi bi-plus-lg item-icon"></i>
      </div>

      <!-- Chat History -->
      <div v-for="(chat, index) in chatHistory" :key="index" class="chat-item">
        <span v-if="!sidebarCollapsed" class="item-label truncate">{{ chat.title }}</span>
        <i class="bi bi-chat-left item-icon"></i>
      </div>
    </div>

    <!-- User Section -->
    <div class="sidebar-user">
      <div class="user-avatar-section">
        <div class="user-avatar" @click="showLogout = !showLogout" :title="userStore.user?.email">
          {{ userInitials }}
        </div>
        <button
          v-if="!sidebarCollapsed"
          class="toggle-btn"
          @click="sidebarCollapsed = !sidebarCollapsed"
          title="Collapse Sidebar"
        >
          <i class="bi bi-chevron-left"></i>
        </button>
      </div>

      <!-- Logout Menu -->
      <div v-if="showLogout" class="logout-menu">
        <button class="btn btn-danger btn-sm w-100" @click="handleLogout">
          <i class="bi bi-box-arrow-right"></i> Log Out
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()

const sidebarCollapsed = ref(false)
const showLogout = ref(false)

const chatHistory = ref([
  { title: 'Next.js learning' },
  { title: 'Python basics' },
  { title: 'Vue 3 components' }
])

const userInitials = computed(() => {
  const name = userStore.user?.displayName || 'User'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
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
.sidebar {
  width: 280px;
  background-color: white;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 70px;
}

.sidebar-logo {
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo-img {
  height: 40px;
  filter: brightness(0) invert(1);
}

.sidebar.collapsed .logo-img {
  height: 30px;
}

/* Chat Items */
.chat-items {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
}

.chat-item {
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  color: #495057;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.chat-item:hover {
  background-color: #f8f9fa;
  color: #667eea;
}

.chat-item.new-chat {
  font-weight: 600;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.item-label {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-icon {
  flex-shrink: 0;
}

.sidebar.collapsed .chat-item {
  padding: 0.75rem;
  justify-content: center;
}

.sidebar.collapsed .item-label {
  display: none;
}

/* User Section */
.sidebar-user {
  padding: 1rem;
  border-top: 1px solid #e9ecef;
  position: relative;
}

.user-avatar-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  cursor: pointer;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
}

.toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #495057;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
  flex-shrink: 0;
}

.toggle-btn:hover {
  color: #667eea;
}

.sidebar.collapsed .toggle-btn {
  display: none;
}

.logout-menu {
  margin-top: 0.5rem;
}

/* Scrollbar */
.chat-items::-webkit-scrollbar {
  width: 6px;
}

.chat-items::-webkit-scrollbar-track {
  background: transparent;
}

.chat-items::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.chat-items::-webkit-scrollbar-thumb:hover {
  background: #999;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    width: 70px;
  }

  .chat-item {
    padding: 0.75rem;
    justify-content: center;
  }

  .item-label {
    display: none;
  }

  .toggle-btn {
    display: none;
  }
}

@media (max-width: 576px) {
  .sidebar {
    width: 100%;
    height: auto;
    flex-direction: row;
    border-right: none;
    border-bottom: 1px solid #e9ecef;
  }

  .sidebar-logo {
    padding: 0.75rem;
    flex-shrink: 0;
  }

  .chat-items {
    flex-direction: row;
    overflow-x: auto;
    padding: 0;
    display: flex;
  }

  .chat-item {
    padding: 0.75rem;
    white-space: nowrap;
    border-left: none;
    border-bottom: 3px solid transparent;
    flex-shrink: 0;
  }

  .chat-item:hover {
    border-bottom: 3px solid #667eea;
    border-left: none;
  }

  .chat-item.new-chat {
    margin-bottom: 0;
  }

  .sidebar-user {
    border-top: none;
    border-left: 1px solid #e9ecef;
    padding: 0.5rem;
  }

  .user-avatar-section {
    justify-content: center;
  }
}
</style>
