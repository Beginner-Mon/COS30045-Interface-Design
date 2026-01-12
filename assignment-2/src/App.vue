<script setup>
import Footer from './components/Footer.vue';
import Header from './components/Header.vue'
import { RouterView } from 'vue-router'
</script>
<template>
  <Header />
  <main class="">
    <RouterView />
  </main>
  <Footer/>
</template>
