<script setup>
import TitlePage from '@/components/TitlePage.vue'
import tempImage from '@/assets/temp.jpg'
import RegistrationForm from '@/components/RegistrationForm.vue'
</script>

<template>
  <TitlePage title="Registration" :image="tempImage" />

  <RegistrationForm />
</template>
