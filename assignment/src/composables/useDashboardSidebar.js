import { computed, ref, watch } from 'vue'

export const useDashboardSidebar = ({ userStore, router }) => {
  const sidebarCollapsed = ref(false)
  const showLogout = ref(false)
  const logoutMenuPos = ref({ left: 0, top: 0 })
  const avatarRef = ref(null)

  const userInitials = computed(() => {
    const name = userStore.user?.displayName || 'User'
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
  })

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

  watch(sidebarCollapsed, () => {
    setTimeout(updateLogoutMenuPosition, 100)
  })

  return {
    avatarRef,
    sidebarCollapsed,
    showLogout,
    userInitials,
    logoutMenuPosition: computed(() => logoutMenuPos.value),
    toggleLogoutMenu,
    toggleSidebarCollapsed,
    handleLogout
  }
}
