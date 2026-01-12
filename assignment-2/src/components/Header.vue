<template>
  <header
    class="p-4 d-flex align-items-center border-bottom position-fixed top-0 start-0 w-100 bg-white z-3"
    :class="isMobile ? 'justify-content-center position-relative' : 'justify-content-between'"
  >
    <!-- Mobile Menu Icon -->
    <button
      v-if="isMobile"
      class="btn position-absolute start-0"
      data-bs-toggle="modal"
      data-bs-target="#mobileMenu"
    >
      <i class="bi bi-list fs-3"></i>
    </button>

    <!-- Logo -->
    <RouterLink to="/" class="logo text-decoration-none fw-bold fs-4 text-dark">
      Insight Hire
    </RouterLink>

    <!-- Desktop Navigation -->
    <nav v-if="!isMobile" class="d-flex gap-4">
      <RouterLink class="nav-link-custom" to="/jobs">Job Explorer</RouterLink>
      <RouterLink class="nav-link-custom" to="/applications">Job Application</RouterLink>
      <RouterLink class="nav-link-custom" to="/todo">To-Do List</RouterLink>
    </nav>
  </header>

  <!-- Mobile Menu Modal -->
  <div class="modal fade" id="mobileMenu" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-fullscreen-sm-down">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title fw-bold">Menu</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>

        <div class="modal-body d-flex flex-column gap-4 text-center">
          <RouterLink class="nav-link-custom fs-5" to="/jobs" data-bs-dismiss="modal">
            Job Explorer
          </RouterLink>
          <RouterLink class="nav-link-custom fs-5" to="/applications" data-bs-dismiss="modal">
            Job Application
          </RouterLink>
          <RouterLink class="nav-link-custom fs-5" to="/todo" data-bs-dismiss="modal">
            To-Do List
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isMobile = ref(window.innerWidth < 768)

const handleResize = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => window.addEventListener('resize', handleResize))
onUnmounted(() => window.removeEventListener('resize', handleResize))
</script>

<style scoped>
.logo {
  letter-spacing: 0.5px;
}

.nav-link-custom {
  position: relative;
  color: #333;
  font-weight: 500;
  text-decoration: none;
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
