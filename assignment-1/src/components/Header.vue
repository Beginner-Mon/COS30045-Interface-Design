<template>
  <header class="bg-black text-white d-flex justify-content-between align-items-center p-2  ">
    <!-- Logo / Left side -->
    <div class="logo">
      <h2 class="m-0">MyLogo</h2>
    </div>

    <!-- Menu button / Right side -->
    <button class="btn btn-outline-light" @click="showModal = true">☰ Menu</button>
  </header>

  <!-- Fullscreen Modal -->
  <div
    class="modal fade"
    :class="{ show: showModal }"
    tabindex="-1"
    style="display: block"
    v-if="showModal"
  >
    <div class="modal-dialog modal-fullscreen">
      <div
        class="modal-content bg-dark text-white d-flex flex-column justify-content-center align-items-center"
      >
        <button
          type="button"
          class="btn btn-light position-absolute top-0 end-0 m-3"
          @click="showModal = false"
        >
          ✕
        </button>
        <nav class="d-flex flex-column gap-3 fs-2 text-center">
          <router-link class="text-white" to="/" @click="showModal = false">Home</router-link>
          <router-link class="text-white" to="/events" @click="showModal = false"
            >Events</router-link
          >
          <router-link class="text-white" to="/registration" @click="showModal = false"
            >Registration</router-link
          >
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showModal = ref(false)
</script>

<style scoped>
/* Remove background overlay behind modal */
.modal {
  background-color: rgba(0, 0, 0, 0.85);
  transition: opacity 0.3s ease;
  z-index: 1050;
}

/* Smooth fade for modal */
.modal.show {
  opacity: 1;
}

/* Modal nav links hover */
.modal nav a:hover {
  text-decoration: underline;
  color: #f8f9fa;
}
</style>
