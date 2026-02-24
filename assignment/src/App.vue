<script setup>
import { RouterView } from 'vue-router'
import Header from './components/Header.vue'
</script>

<template>
  <Header />
  <main class="flex-fill z-1">
    <RouterView />
  </main>
</template>

<style scoped></style>
