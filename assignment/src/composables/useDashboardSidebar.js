import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { getSessions, deleteSession } from '@/api'

export const useDashboardSidebar = ({ userStore, router }) => {
  const sidebarCollapsed = ref(false)
  const showLogout = ref(false)
  const logoutMenuPos = ref({ left: 0, top: 0 })
  const avatarRef = ref(null)
  
  const chatHistory = ref([])

  const userId = computed(() => userStore.user?.uid || 'default')

  const userInitials = computed(() => {
    const name = userStore.user?.displayName || 'User'
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
  })

  const fetchSessions = async () => {
    try {
      const data = await getSessions(userId.value)
      // data might be array or { sessions: [] } depending on backend
      chatHistory.value = Array.isArray(data) ? data : data.sessions || []
    } catch (error) {
      console.error('Failed to load chat history:', error)
    }
  }

  const handleDeleteSession = async (sessionId) => {
    try {
      await deleteSession(userId.value, sessionId)
      await fetchSessions()
    } catch (error) {
      console.error('Failed to delete session:', error)
    }
  }

  const updateLogoutMenuPosition = () => {
    const avatar = avatarRef.value
    if (!avatar) return

    const rect = avatar.getBoundingClientRect()
    logoutMenuPos.value = {
      left: `${rect.left}px`,
      top: `${rect.top - 65}px`
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

  const toggleSidebarCollapsed = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const handleLogout = async () => {
    try {
      await userStore.logout()
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Auto-collapse sidebar on medium screens (768–992px)
  const COLLAPSE_BREAKPOINT = 992
  const handleResize = () => {
    const w = window.innerWidth
    if (w < COLLAPSE_BREAKPOINT && w > 768) {
      sidebarCollapsed.value = true
    } else if (w >= COLLAPSE_BREAKPOINT) {
      sidebarCollapsed.value = false
    }
  }

  watch(sidebarCollapsed, () => {
    setTimeout(updateLogoutMenuPosition, 100)
  })

  onMounted(() => {
    fetchSessions()
    handleResize() // set initial state
    window.addEventListener('resize', handleResize)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
  })

  // Expose fetchSessions manually if needed after a new chat is created
  return {
    avatarRef,
    sidebarCollapsed,
    showLogout,
    userInitials,
    chatHistory,
    fetchSessions,
    handleDeleteSession,
    logoutMenuPosition: computed(() => logoutMenuPos.value),
    toggleLogoutMenu,
    toggleSidebarCollapsed,
    handleLogout
  }
}
