<template>
  <ul class="list-group">
    <li class="list-group-item">
      <router-link to="/jobs">Overview</router-link>
    </li>

    <li v-for="job in jobs" :key="job.job_id" class="list-group-item">
      <router-link :to="`/jobs/${job.job_id}`">
        {{ job.job_id }}
      </router-link>
    </li>
  </ul>
</template>

<script>
import jobs from '@/assets/jobs.json'

export default {
  data() {
    return {
      jobs,
    }
  },
}
</script>
