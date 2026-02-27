<template>

    <main class="flex-fill z-1">
      <RouterView />
    </main>


</template>

<script setup>
import { RouterView } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
</script>

