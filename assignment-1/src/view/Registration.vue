<script setup>
import TitlePage from '@/components/TitlePage.vue'
import tempImage from '@/assets/temp.jpg'
import Registration from '@/components/Registration.vue';
</script>

<template>
  <TitlePage title="Registration" :image="tempImage" />

  <Registration/>
</template>
