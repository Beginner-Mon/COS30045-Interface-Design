<template>
  <section class="min-vh-100 w-100 pt-5">
    <div class="container">
      <h2 class="mb-4 fw-bold text-center">Job Application</h2>

      <ApplicationForm :initialCategory="category" />
    </div>
  </section>
</template>

<script setup>
import { useRoute } from 'vue-router'
import ApplicationForm from '@/components/ApplicationForm.vue'

const route = useRoute()
const category = route.query.category || ''
</script>
<style scoped>
section {
  margin-top: 5rem;
}
</style>
