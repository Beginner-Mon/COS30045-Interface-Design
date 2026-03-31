<template>
    <Header />
    <main class="flex-fill z-1">
      <RouterView />
    </main>
    <Footer />
</template>

<script setup>
import { RouterView } from 'vue-router'
import Header from '@/components/common/Header.vue'
import Footer from '@/components/common/Footer.vue'
</script>
