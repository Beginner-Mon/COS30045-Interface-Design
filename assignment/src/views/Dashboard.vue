<template>
  <div class="dashboard-container">
    <DashboardSidebar @new-chat="handleNewChat" />
    <DashboardContent ref="dashboardContent" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import DashboardSidebar from '@/components/DashboardSidebar.vue'
import DashboardContent from '@/components/DashboardContent.vue'

const router = useRouter()
const userStore = useUserStore()
const dashboardContent = ref(null)

// Check authentication
if (!userStore.isAuthenticated) {
  router.push('/auth/login')
}

const handleNewChat = () => {
  dashboardContent.value?.clearMessages()
}
</script>

<style scoped>
.dashboard-container {
  display: flex;
  height: 100vh;
  background-color: #f5f5f5;
}
</style>
