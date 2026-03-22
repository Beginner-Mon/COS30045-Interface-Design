<template>
  <div class="d-flex position-relative vh-100 overflow-hidden bg-light">
    <DashboardSidebar v-if="!isMobile" @new-chat="handleNewChat" />
    <DashboardContent
      ref="dashboardContent"
      :show-mobile-menu="isMobile"
      @open-sidebar="openMobileSidebar"
    />

    <div
      v-if="isMobile && sidebarOpen"
      class="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
      style="z-index: 3000"
      @click="closeMobileSidebar"
    >
      <div class="position-absolute top-0 start-0 h-100" @click.stop>
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
