<template>
  <div class="dashboard-container">
    <DashboardSidebar v-if="!isMobile" @new-chat="handleNewChat" />
    <DashboardContent
      ref="dashboardContent"
      :show-mobile-menu="isMobile"
      @open-sidebar="openMobileSidebar"
    />

    <div v-if="isMobile && sidebarOpen" class="mobile-backdrop" @click="closeMobileSidebar">
      <div class="mobile-sidebar-shell" @click.stop>
        <DashboardSidebar :mobile-drawer="true" @new-chat="handleNewChat" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import DashboardSidebar from '@/components/DashboardSidebar.vue'
import DashboardContent from '@/components/DashboardContent.vue'

const router = useRouter()
const userStore = useUserStore()
const dashboardContent = ref(null)
const isMobile = ref(false)
const sidebarOpen = ref(false)

// Check authentication
if (!userStore.isAuthenticated) {
  router.push('/auth/login')
}

const handleNewChat = () => {
  dashboardContent.value?.clearMessages()
  sidebarOpen.value = false
}

const openMobileSidebar = () => {
  sidebarOpen.value = true
}

const closeMobileSidebar = () => {
  sidebarOpen.value = false
}

const updateViewportState = () => {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) {
    sidebarOpen.value = false
  }
}

onMounted(() => {
  updateViewportState()
  window.addEventListener('resize', updateViewportState)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateViewportState)
})
</script>

<style scoped>
.dashboard-container {
  display: flex;
  position: relative;
  height: 100vh;
  background-color: #f5f5f5;
  overflow: hidden;
}

.mobile-backdrop {
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: rgba(0, 0, 0, 0.5);
}

.mobile-sidebar-shell {
  position: absolute;
  inset: 0 auto 0 0;
}

@media (min-width: 769px) {
  .mobile-backdrop {
    display: none;
  }
}
</style>
