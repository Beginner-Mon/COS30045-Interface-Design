<template>
  <div class="dashboard-container">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="user-avatar">
          {{ userInitials }}
        </div>
        <div class="user-info">
          <h5 class="mb-0">{{ userStore.userName }}</h5>
          <small class="text-muted">{{ userStore.user?.email }}</small>
        </div>
      </div>

      <nav class="sidebar-nav">
        <button
          v-for="item in navItems"
          :key="item.id"
          @click="activeChat = item.id"
          class="nav-item"
          :class="{ active: activeChat === item.id }"
        >
          <span class="icon">{{ item.icon }}</span>
          <span class="label">{{ item.label }}</span>
        </button>
      </nav>

      <button @click="handleLogout" class="btn btn-outline-danger btn-sm w-100 mt-auto">
        Sign Out
      </button>
    </aside>

    <!-- Main Chat Area -->
    <main class="chat-area">
      <!-- Chat Header -->
      <div class="chat-header">
        <div class="chat-title">
          <h4 class="mb-0">{{ currentChatTitle }}</h4>
          <small class="text-muted">{{ currentChatSubtitle }}</small>
        </div>
        <div class="chat-actions">
          <button class="btn btn-sm btn-light">
            <i class="bi bi-info-circle"></i>
          </button>
        </div>
      </div>

      <!-- Messages Container -->
      <div class="messages-container">
        <!-- User Profile Message -->
        <div v-if="activeChat === 'profile'" class="message-group user-message">
          <div class="message">
            <div class="message-content">
              <h5>Your Profile Information</h5>
              <div class="profile-info">
                <div class="info-item">
                  <label>Name:</label>
                  <span>{{ userStore.user?.displayName || 'Not set' }}</span>
                </div>
                <div class="info-item">
                  <label>Email:</label>
                  <span>{{ userStore.user?.email }}</span>
                </div>
                <div class="info-item">
                  <label>Account Type:</label>
                  <span class="badge bg-primary">{{ userStore.user?.photoURL ? 'Google' : 'Email' }}</span>
                </div>
                <div class="info-item">
                  <label>User ID:</label>
                  <span class="text-muted small">{{ userStore.user?.uid }}</span>
                </div>
              </div>
              <button class="btn btn-sm btn-outline-primary mt-3" @click="editProfile = !editProfile">
                {{ editProfile ? 'Cancel' : 'Edit Profile' }}
              </button>
            </div>
            <span class="message-time">{{ getCurrentTime() }}</span>
          </div>
        </div>

        <!-- Welcome Message -->
        <div v-if="activeChat === 'home'" class="message-group assistant-message">
          <div class="message">
            <div class="message-content">
              <p>Welcome to your Dashboard! 👋</p>
              <p>This is your personal space to manage your account and view your information.</p>
              <p class="small text-muted">Nav through the sidebar to explore different sections.</p>
            </div>
            <span class="message-time">{{ getCurrentTime() }}</span>
          </div>
        </div>

        <!-- Settings Message -->
        <div v-if="activeChat === 'settings'" class="message-group assistant-message">
          <div class="message">
            <div class="message-content">
              <h5>Account Settings</h5>
              <ul class="settings-list">
                <li>
                  <label class="form-check-label">
                    <input type="checkbox" class="form-check-input" v-model="settings.emailNotifications" />
                    Email Notifications
                  </label>
                </li>
                <li>
                  <label class="form-check-label">
                    <input type="checkbox" class="form-check-input" v-model="settings.darkMode" />
                    Dark Mode (Coming Soon)
                  </label>
                </li>
                <li>
                  <label class="form-check-label">
                    <input type="checkbox" class="form-check-input" v-model="settings.twoFactor" />
                    Two-Factor Authentication
                  </label>
                </li>
              </ul>
            </div>
            <span class="message-time">{{ getCurrentTime() }}</span>
          </div>
        </div>

        <!-- Help Message -->
        <div v-if="activeChat === 'help'" class="message-group assistant-message">
          <div class="message">
            <div class="message-content">
              <h5>Help & Support</h5>
              <p>Here are some common questions:</p>
              <ul>
                <li>How to update my profile?</li>
                <li>How to reset my password?</li>
                <li>How to delete my account?</li>
                <li>How to contact support?</li>
              </ul>
              <p class="small text-muted mt-3">Contact us at support@example.com</p>
            </div>
            <span class="message-time">{{ getCurrentTime() }}</span>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="chat-input-area">
        <div class="input-group">
          <input
            v-model="messageInput"
            type="text"
            class="form-control"
            placeholder="Type a message..."
            @keyup.enter="sendMessage"
          />
          <button @click="sendMessage" class="btn btn-primary" :disabled="!messageInput.trim()">
            <i class="bi bi-send"></i> Send
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

export default {
  name: 'Dashboard',
  setup() {
    const router = useRouter()
    const userStore = useUserStore()

    const activeChat = ref('home')
    const messageInput = ref('')
    const editProfile = ref(false)
    const settings = ref({
      emailNotifications: true,
      darkMode: false,
      twoFactor: false
    })

    const navItems = [
      { id: 'home', label: 'Home', icon: '🏠' },
      { id: 'profile', label: 'Profile', icon: '👤' },
      { id: 'settings', label: 'Settings', icon: '⚙️' },
      { id: 'help', label: 'Help', icon: '❓' }
    ]

    const currentChatTitle = computed(() => {
      const item = navItems.find((i) => i.id === activeChat.value)
      return item?.label || 'Dashboard'
    })

    const currentChatSubtitle = computed(() => {
      const subtitles = {
        home: 'Your personal dashboard',
        profile: 'Manage your account',
        settings: 'Customize your experience',
        help: 'Get help and support'
      }
      return subtitles[activeChat.value] || ''
    })

    const userInitials = computed(() => {
      const name = userStore.user?.displayName || 'User'
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    })

    const getCurrentTime = () => {
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const sendMessage = () => {
      if (messageInput.value.trim()) {
        // Handle message send (can be extended with backend)
        messageInput.value = ''
      }
    }

    const handleLogout = async () => {
      try {
        await userStore.logout()
        router.push('/auth/login')
      } catch (error) {
        console.error('Logout error:', error)
      }
    }

    // Check if user is authenticated
    if (!userStore.isAuthenticated) {
      router.push('/auth/login')
    }

    return {
      userStore,
      activeChat,
      messageInput,
      editProfile,
      settings,
      navItems,
      currentChatTitle,
      currentChatSubtitle,
      userInitials,
      getCurrentTime,
      sendMessage,
      handleLogout
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  display: flex;
  height: 100vh;
  background-color: #f5f5f5;
}

/* Sidebar Styles */
.sidebar {
  width: 280px;
  background-color: white;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05);
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-info h5 {
  font-weight: 600;
  color: #212529;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.nav-item {
  background: none;
  border: none;
  padding: 0.75rem 1.5rem;
  text-align: left;
  cursor: pointer;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background-color: #f8f9fa;
  color: #667eea;
}

.nav-item.active {
  background-color: #e7f1ff;
  color: #667eea;
  border-left: 4px solid #667eea;
  padding-left: calc(1.5rem - 4px);
  font-weight: 600;
}

.nav-item .icon {
  font-size: 1.25rem;
}

.sidebar > .btn {
  margin: 1rem;
  margin-top: auto;
}

/* Chat Area */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: white;
}

.chat-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
}

.chat-title h4 {
  font-weight: 600;
  color: #212529;
}

.chat-actions {
  display: flex;
  gap: 0.5rem;
}

/* Messages Container */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
}

.message-group {
  margin-bottom: 1rem;
  display: flex;
}

.user-message {
  justify-content: flex-end;
}

.assistant-message {
  justify-content: flex-start;
}

.message {
  max-width: 70%;
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
}

.user-message .message {
  flex-direction: row-reverse;
}

.message-content {
  padding: 1rem;
  border-radius: 0.75rem;
  word-wrap: break-word;
}

.user-message .message-content {
  background-color: #667eea;
  color: white;
}

.assistant-message .message-content {
  background-color: #e9ecef;
  color: #212529;
}

.message-time {
  font-size: 0.75rem;
  color: #adb5bd;
  min-width: 50px;
}

.profile-info {
  margin-top: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e9ecef;
}

.info-item label {
  font-weight: 600;
  color: #495057;
}

.info-item span {
  color: #212529;
}

.settings-list {
  list-style: none;
  padding: 0;
  margin-top: 1rem;
}

.settings-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #e9ecef;
}

.settings-list .form-check-input {
  margin-right: 0.5rem;
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
  white-space: nowrap;
}

/* Scrollbar */
.messages-container::-webkit-scrollbar,
.sidebar-nav::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track,
.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb,
.sidebar-nav::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover,
.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: #999;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    width: 70px;
  }

  .sidebar-header {
    flex-direction: column;
    align-items: center;
  }

  .user-info {
    display: none;
  }

  .nav-item {
    padding: 0.75rem;
    justify-content: center;
  }

  .nav-item .label {
    display: none;
  }

  .chat-header,
  .chat-input-area {
    padding: 1rem;
  }

  .message {
    max-width: 85%;
  }
}

@media (max-width: 576px) {
  .dashboard-container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
    flex-direction: row;
    border-right: none;
    border-bottom: 1px solid #e9ecef;
  }

  .sidebar-header {
    padding: 1rem;
  }

  .sidebar-nav {
    flex-direction: row;
    overflow-x: auto;
    padding: 0 1rem;
  }

  .nav-item,
  .nav-item.active {
    padding: 0.75rem 1rem;
    border-left: none;
  }

  .nav-item.active {
    border-bottom: 3px solid #667eea;
  }

  .chat-area {
    min-height: 500px;
  }

  .message {
    max-width: 90%;
  }
}
</style>
