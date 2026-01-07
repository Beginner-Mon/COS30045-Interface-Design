<template>
  <footer
    class="bg-dark vh-50 d-flex justify-content-center align-items-center text-white position-sticky bottom-0 py-3 w-100"
  >
    <div class="d-flex flex-column gap-2 justify-content-center align-items-center py-4">
      <h2 class="mb-1">Event Management</h2>

      <div class="d-flex gap-4 fs-4">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" class="text-white">
          <i class="bi bi-facebook"></i>
        </a>

        <a href="mailto:ductri02lt2@gmail.com" class="text-white">
          <i class="bi bi-envelope-fill"></i>
        </a>

        <a href="tel:+123456789" class="text-white">
          <i class="bi bi-telephone-fill"></i>
        </a>
      </div>
    </div>
    <!-- Bottom copyright bar -->
    <div class="position-absolute bottom-0 left-0 w-100 text-center py-2 mb-2">
      <small class="text-secondary"> © {{ year }} Event Management. All rights reserved. </small>
    </div>
  </footer>
</template>
<style scoped>
.vh-50 {
  height: 50vh;
}
</style>
<script setup>
const year = new Date().getFullYear()
</script>
