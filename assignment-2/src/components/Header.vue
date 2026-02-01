<template>
  <header
    class="p-4 d-flex align-items-center border-bottom position-fixed top-0 start-0 w-100 bg-white z-3"
    :class="isMobile ? 'justify-content-center position-relative' : 'justify-content-between'"
  >
    <!-- Mobile Menu Icon -->
    <i
      v-if="isMobile"
      class="bi bi-list fs-3"
      role="button"
      @click="openMenu"
    ></i>

    <!-- Logo -->
    <RouterLink to="/" class="logo text-decoration-none fw-bold fs-4 text-dark">
      Insight Hire
    </RouterLink>

    <!-- Desktop Navigation -->
    <nav v-if="!isMobile" class="d-flex gap-4">
      <RouterLink class="nav-link-custom" to="/jobs">Job Explorer</RouterLink>
      <RouterLink class="nav-link-custom" to="/application">Job Application</RouterLink>
      <RouterLink class="nav-link-custom" to="/todo">To-Do List</RouterLink>
    </nav>
  </header>

  <!-- Mobile Menu Modal -->
  <div
    v-if="menuOpen"
    class="position-fixed top-0 start-0 w-100 h-100 small-modal z-50"
  >
    <!-- Close Button -->
    <div class="p-4 d-flex justify-content-end">
      <i class="bi bi-x-lg fs-3" role="button" @click="closeMenu"></i>
    </div>

    <!-- Bottom Nav -->
    <nav class="position-absolute bottom-0 w-100 pb-5 d-flex flex-column p-4 gap-4">
      <RouterLink to="/application" class=" text-decoration-none fs-4" @click="closeMenu">
        Application Form
      </RouterLink>

      <RouterLink to="/todo" class=" text-decoration-none fs-4" @click="closeMenu">
        To-Do List
      </RouterLink>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isMobile = ref(window.innerWidth < 768)
const menuOpen = ref(false) // ✅ define menuOpen properly

const handleResize = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => window.addEventListener('resize', handleResize))
onUnmounted(() => window.removeEventListener('resize', handleResize))

const openMenu = () => {
  console.log('Opening menu') // Debugging line
  menuOpen.value = true
}

const closeMenu = () => {
  menuOpen.value = false
}
</script>

<style scoped>
.logo {
  letter-spacing: 0.5px;
}
.bi-list {
  position: absolute;
  left: 1.5rem;
}
.nav-link-custom {
  position: relative;
  color: #333;
  font-weight: 500;
  text-decoration: none;
}
.small-modal {
  background: white;
  z-index: 60;
}
/* underline hover */
.nav-link-custom::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -4px;
  width: 0%;
  height: 3px;
  background-color: #0d6efd;
  transition: width 0.25s ease;
}

.nav-link-custom:hover::after,
.router-link-active::after {
  width: 100%;
}
</style>
