<template>
  <header
    class="p-4  text-white fixed-top d-flex align-items-center"
    :class="isMobile ? 'justify-content-between' : 'justify-content-center'"
  >
    <!-- Desktop Nav -->
    <nav v-if="!isMobile" class="desktop-nav d-flex align-items-center gap-5 px-4 py-2">
      <RouterLink to="/" class=" text-decoration-none fs-5 fw-bold">
        LOGO
      </RouterLink>
      <RouterLink to="/events" class="text-decoration-none fs-6">
        Events
      </RouterLink>
      <RouterLink to="/registration" class=" text-decoration-none fs-6">
        Registration
      </RouterLink>
    </nav>

    <!-- Mobile Header -->
    <template v-else>
      <RouterLink to="/" class=" text-decoration-none fw-bold">
        LOGO
      </RouterLink>
      <i
        class="bi bi-list fs-2 cursor-pointer"
        role="button"
        @click="openMenu"
      ></i>
    </template>
  </header>

  <!-- MOBILE MODAL -->
  <div
    v-if="menuOpen"
    class="position-fixed top-0 start-0 w-100 h-100 bg-primary text-white z-50"
    v-motion
    :initial="{ y: '-100%' }"
    :enter="{ y: '0%' }"
    :leave="{ y: '-100%' }"
    :transition="{ duration: 0.4, ease: 'easeInOut' }"
  >
    <!-- Close Button -->
    <div class="p-4 d-flex justify-content-end">
      <i
        class="bi bi-x-lg fs-3"
        role="button"
        @click="closeMenu"
      ></i>
    </div>

    <!-- Bottom Nav -->
    <nav
      class="position-absolute bottom-0 w-100 pb-5 d-flex flex-column align-items-center gap-4"
    >
      <RouterLink
        to="/events"
        class="text-white text-decoration-none fs-4"
        @click="closeMenu"
      >
        Events
      </RouterLink>

      <RouterLink
        to="/registration"
        class="text-white text-decoration-none fs-4"
        @click="closeMenu"
      >
        Registration
      </RouterLink>
    </nav>
  </div>
</template>
<style scoped>
  .desktop-nav {
  background: rgba(0, 0, 0, 0.45);     /* semi-transparent */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px); /* Safari */
  border-radius: 999px;               /* pill shape */
  border: 1px solid rgba(255, 255, 255, 0.15);
}

</style>
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
.z-50 {
  z-index: 1050;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
