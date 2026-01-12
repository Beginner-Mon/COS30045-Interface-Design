<template>
  <div class="container mt-4">
    <h2 class="text-center mb-4">Insight Hire</h2>

    <div class="row">
      <div class="col-3">
        <JobList />
      </div>

      <div class="col-9">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import JobList from '@/components/JobList.vue'

export default {
  components: { JobList }
}
</script>
