<template>
  <section class="min-vh-100 p-3">
    <button class="btn btn-link mb-3" @click="router.back()">← Back</button>

    <div v-if="job" class="bg-white rounded p-3">
      <h4 class="fw-bold">{{ job.job_title }}</h4>
      <p class="text-muted">{{ job.category }} · {{ job.location }}</p>

      <hr />

      <p>{{ job.job_description }}</p>

      <ul class="mt-3">
        <li><strong>Company:</strong> {{ job.company }}</li>
        <li><strong>Supervisor:</strong> {{ job.supervisor }}</li>
        <li><strong>Level:</strong> {{ job.job_level }}</li>
        <li><strong>Salary:</strong> {{ job.salary_range }}</li>
        <li><strong>Start:</strong> {{ job.start_date }}</li>
        <li><strong>Deadline:</strong> {{ job.application_deadline }}</li>
      </ul>
    </div>

    <div v-else class="text-muted">Job not found.</div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import jobs from '@/assets/jobs.json'

const route = useRoute()
const router = useRouter()

const job = computed(() => jobs.find((j) => j.job_id === route.params.id))
</script>
