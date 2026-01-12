<template>
  <section class="min-vh-100 w-100 d-flex justify-content-center align-items-center">
    
    <div class="container-fluid">
      <div class="mb-4 text-center">
        <h1 class="job-title mb-4 text-center">
        Job List
      </h1>
      </div>
       
      <div class="row g-4">
        <!-- LEFT NAV (3) -->
        <div class="col-12 col-md-3">
          <div class="d-flex flex-column gap-2">
            <!-- Overview -->
            <div
              class="job-card"
              :class="{ active: selectedJobId === 'overview' }"
              @click="selectOverview"
            >
              <h6 class="fw-bold mb-1">Job Overview</h6>
              <small class="text-muted">{{ jobs.length }} open positions</small>
            </div>

            <!-- Jobs -->
            <div
              v-for="job in jobs"
              :key="job.job_id"
              class="job-card"
              :class="{ active: selectedJobId === job.job_id }"
              @click="handleSelect(job)"
            >
              <h6 class="fw-bold mb-1">{{ job.job_title }}</h6>
              <small class="text-muted">
                {{ job.category }} · {{ job.location }}
              </small>

              <div class="d-flex flex-wrap gap-1 mt-2">
                <span
                  v-for="skill in job.preferred_qualifications"
                  :key="skill"
                  class="skill-tag"
                >
                  {{ skill }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT DETAIL (9) -->
        <div class="right-div col-md-9 d-none d-md-block">
          <div class="detail-panel">
            <!-- SUMMARY -->
            <div class="p-3 rounded bg-white">
              <h5 class="fw-bold mb-1">
                {{ activeJobTitle }}
              </h5>
              <p class="mb-0 text-muted">
                {{ activeJobMeta }}
              </p>
            </div>

            <hr />

            <!-- FULL DETAIL -->
            <div class="detail-scroll p-3">
              <template v-if="selectedJob">
                <p>{{ selectedJob.job_description }}</p>

                <ul class="mt-3">
                  <li><strong>Company:</strong> {{ selectedJob.company }}</li>
                  <li><strong>Supervisor:</strong> {{ selectedJob.supervisor }}</li>
                  <li><strong>Level:</strong> {{ selectedJob.job_level }}</li>
                  <li><strong>Salary:</strong> {{ selectedJob.salary_range }}</li>
                  <li><strong>Start:</strong> {{ selectedJob.start_date }}</li>
                  <li><strong>Deadline:</strong> {{ selectedJob.application_deadline }}</li>
                </ul>
              </template>

              <template v-else>
                <p class="text-muted">Select a job to view details.</p>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import jobs from '@/assets/jobs.json'

const router = useRouter()
const selectedJobId = ref('overview')

const isMobile = () => window.innerWidth < 768

const selectOverview = () => {
  selectedJobId.value = 'overview'
}

const handleSelect = (job) => {
  if (isMobile()) {
    router.push(`/jobs/${job.job_id}`)
  } else {
    selectedJobId.value = job.job_id
  }
}

const selectedJob = computed(() =>
  jobs.find(j => j.job_id === selectedJobId.value)
)

const activeJobTitle = computed(() =>
  selectedJobId.value === 'overview'
    ? 'Job Overview'
    : selectedJob.value?.job_title
)

const activeJobMeta = computed(() =>
  selectedJobId.value === 'overview'
    ? `${jobs.length} open positions`
    : `${selectedJob.value.category} · ${selectedJob.value.location}`
)
</script>

<style scoped>
  section {
    padding-top: 5rem;
    padding-bottom: 5rem;
    padding-left: 4rem;
    padding-right: 4rem;
  }
.job-card {
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  padding: 0.75rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: border-color 0.2s ease;
}

.job-card:hover,
.job-card.active {
  border-color: #0d6efd;
}

.skill-tag {
  padding: 0.25rem 0.5rem;
  background: #f1f3f5;
  border-radius: 0.375rem;
  font-size: 0.75rem;
}
.right-div {

}
.detail-panel {
  position: sticky;
  top: 0;
  height: calc(100vh - 1rem);
  border-radius: 0.75rem;
  background: #fff;
}

.detail-scroll {
  height: 100%;
  overflow-y: auto;
}

/* Scrollbar hidden until hover */
.detail-scroll::-webkit-scrollbar {
  width: 0;
}
.detail-scroll:hover::-webkit-scrollbar {
  width: 6px;
}
.detail-scroll::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
}
</style>
