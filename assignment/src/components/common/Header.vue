<template>
  <header
    class="p-4 text-white fixed-top d-flex align-items-center"
    :class="isMobile ? 'justify-content-between' : 'justify-content-center'"
  >
    <!-- Desktop Nav -->
    <nav v-if="!isMobile" class="desktop-nav d-flex align-items-center px-4 py-2">
      <RouterLink
        to="/"
        class="text-decoration-none position-relative d-flex align-items-center me-5"
        style="width: 8px; height: 8px"
      >
        <img
          src="/logo.svg"
          alt="Logo"
          height="55"
          class="logo-white text-white position-absolute"
          style="top: 50%; transform: translate(-50%, -50%)"
        />
      </RouterLink>

      <RouterLink to="/news" class="text-decoration-none fs-6 me-5"> News </RouterLink>

      <RouterLink to="/about" class="text-decoration-none fs-6"> About </RouterLink>
    </nav>

    <!-- Mobile Header -->
    <template v-else>
      <nav class="desktop-nav d-flex align-items-center justify-content-between px-4 py-2 w-100">
        <RouterLink to="/" class="text-decoration-none fw-bold">
          <img src="/logo.svg" alt="Logo" height="35" class="text-white logo-white" />
        </RouterLink>
        <i class="bi bi-list fs-2 cursor-pointer" role="button" @click="openMenu"></i>
      </nav>
    </template>
  </header>

  <!-- MOBILE MODAL -->
  <div v-if="menuOpen" class="position-fixed top-0 start-0 w-100 h-100 bg-dark text-white" style="z-index: 1050">
    <!-- Close Button -->
    <div class="p-4 d-flex justify-content-end">
      <i class="bi bi-x-lg fs-3" role="button" @click="closeMenu"></i>
    </div>

    <!-- Bottom Nav -->
    <nav class="position-absolute bottom-0 w-100 pb-5 d-flex flex-column p-4 gap-4">
      <RouterLink to="/news" class="text-white text-decoration-none fs-4" @click="closeMenu">
        News
      </RouterLink>

      <RouterLink to="/about" class="text-white text-decoration-none fs-4" @click="closeMenu">
        About
      </RouterLink>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useWindowSize } from '@vueuse/core'

const menuOpen = ref(false)

const { width } = useWindowSize()
const isMobile = computed(() => width.value < 768)

const openMenu = () => {
  menuOpen.value = true
}

const closeMenu = () => {
  menuOpen.value = false
}
</script>

<style scoped>
.desktop-nav {
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.logo-white {
  filter: brightness(0) invert(1);
}
</style>
