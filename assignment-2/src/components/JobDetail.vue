<template>
  <div v-if="job">
    <h4>{{ job.job_title }}</h4>

    <p><strong>Company:</strong> {{ job.company }}</p>
    <p><strong>Location:</strong> {{ job.location }}</p>
    <p><strong>Employment Type:</strong> {{ job.employment_type }}</p>
    <p><strong>Salary:</strong> {{ job.salary_range }}</p>
    <p><strong>Job Level:</strong> {{ job.job_level }}</p>

    <p><strong>Description:</strong></p>
    <p>{{ job.job_description }}</p>

    <p><strong>Required Skills:</strong></p>
    <ul>
      <li v-for="skill in job.required_skills" :key="skill">
        {{ skill }}
      </li>
    </ul>

    <p><strong>Preferred Qualifications:</strong></p>
    <ul>
      <li v-for="q in job.preferred_qualifications" :key="q">
        {{ q }}
      </li>
    </ul>

    <p><strong>Application Deadline:</strong> {{ job.application_deadline }}</p>
    <p><strong>Positions Available:</strong> {{ job.positions_available }}</p>
    <p><strong>Supervisor:</strong> {{ job.supervisor }}</p>
  </div>

  <div v-else>
    <p class="text-danger">Job not found.</p>
  </div>
</template>

<script>
import jobs from '@/assets/jobs.json'

export default {
  props: ['id'],
  computed: {
    job() {
      return jobs.find(j => j.job_id === this.id)
    }
  }
}
</script>
