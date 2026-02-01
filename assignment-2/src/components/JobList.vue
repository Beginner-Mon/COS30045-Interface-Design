<template>
  <section class="min-vh-100 w-100 d-flex justify-content-center align-items-center">
    <div class="container-fluid">
      <div class="mb-4 text-center">
        <h1 class="job-title mb-4 text-center">Job List</h1>
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
              <small class="text-muted"> {{ job.category }} · {{ job.location }} </small>

              <div class="d-flex flex-wrap gap-1 mt-2">
                <span v-for="skill in job.preferred_qualifications" :key="skill" class="skill-tag">
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
            <div
              class="p-3 rounded bg-white summary-div d-flex justify-content-between align-items-center"
            >
              <div>
                <h5 class="fw-bold mb-1">
                  {{ activeJobTitle }}
                </h5>
                <p class="mb-0 text-muted">
                  {{ activeJobMeta }}
                </p>
              </div>

              <RouterLink
                v-if="selectedJob"
                :to="{ path: '/application', query: { category: selectedJob.category } }"
                class="btn btn-primary d-flex align-items-center gap-2"
              >
                APPLY NOW <i class="bi bi-plus"></i>
              </RouterLink>
            </div>

            <hr class="blue-hr" />

            <!-- FULL DETAIL -->
            <div class="detail-scroll p-3">
              <template v-if="selectedJob">
                <div class="job-detail-card">
                  <p class="job-desc">
                    {{ selectedJob.job_description }}
                  </p>

                  <!-- META GRID -->
                  <div class="meta-grid">
                    <div>
                      <strong>Company</strong><span>{{ selectedJob.company }}</span>
                    </div>
                    <div>
                      <strong>Supervisor</strong><span>{{ selectedJob.supervisor }}</span>
                    </div>
                    <div>
                      <strong>Level</strong><span>{{ selectedJob.job_level }}</span>
                    </div>
                    <div>
                      <strong>Employment</strong><span>{{ selectedJob.employment_type }}</span>
                    </div>
                    <div>
                      <strong>Salary</strong><span>{{ selectedJob.salary_range }}</span>
                    </div>
                    <div>
                      <strong>Location</strong><span>{{ selectedJob.location }}</span>
                    </div>
                    <div>
                      <strong>Start Date</strong><span>{{ selectedJob.start_date }}</span>
                    </div>
                    <div>
                      <strong>Deadline</strong><span>{{ selectedJob.application_deadline }}</span>
                    </div>
                  </div>

                  <!-- SKILLS -->
                  <div class="mt-4">
                    <h6 class="fw-bold mb-2">Required Skills</h6>
                    <div class="d-flex flex-wrap gap-2">
                      <span
                        v-for="skill in selectedJob.required_skills"
                        :key="skill"
                        class="pill pill-primary"
                      >
                        {{ skill }}
                      </span>
                    </div>
                  </div>

                  <!-- TAGS -->
                  <div class="mt-4">
                    <h6 class="fw-bold mb-2">Tags</h6>
                    <div class="d-flex flex-wrap gap-2">
                      <span v-for="tag in selectedJob.tags" :key="tag" class="pill pill-muted">
                        {{ tag }}
                      </span>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else>
                <div class="overview-box">
                  <p>
                    Browse our current openings to find roles that match your skills, experience,
                    and career goals. Each position includes detailed information about
                    responsibilities, requirements, and benefits.
                  </p>
                  <p>
                    Select a job from the left panel to explore full details and submit your
                    application when you’re ready.
                  </p>
                </div>
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

const selectedJob = computed(() => jobs.find((j) => j.job_id === selectedJobId.value))

const activeJobTitle = computed(() =>
  selectedJobId.value === 'overview' ? 'Job Overview' : selectedJob.value?.job_title,
)

const activeJobMeta = computed(() =>
  selectedJobId.value === 'overview'
    ? `${jobs.length} open positions`
    : `${selectedJob.value.category} · ${selectedJob.value.location}`,
)
</script>

<style scoped>
/* =========================
   LAYOUT & SPACING
========================= */
section {
  padding: 2rem 0;
}

@media (min-width: 767px) {
  section {
    padding: 5rem 4rem;
  }
}

/* =========================
   JOB LIST (LEFT PANEL)
========================= */
.job-card {
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  cursor: pointer;
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

/* =========================
   FULL DETAIL — TYPOGRAPHY SCALE
========================= */
.job-detail-card {
  font-size: 1rem; /* was implicitly ~0.85–0.9 */
}

/* Main description */
.job-desc {
  font-size: 1.05rem;
  line-height: 1.75;
}

/* Section headings (Required Skills, Tags, etc.) */
.job-detail-card h6 {
  font-size: 0.95rem;
  letter-spacing: 0.02em;
}

/* Meta info grid */
.meta-grid div {
  font-size: 0.95rem;
}

.meta-grid strong {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Pills / tags */
.pill {
  font-size: 0.8rem;
  padding: 0.45rem 0.9rem;
}

/* =========================
   SUMMARY HEADER
========================= */
.summary-div {
  border: 1px solid #0d6efd;
}

/* Blue divider */
.blue-hr {
  border-top: 1px solid #0d6efd;
  opacity: 1;
}

/* =========================
   JOB OVERVIEW
========================= */
.overview-box {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 0.75rem;
  color: #495057;
  line-height: 1.6;
}

/* =========================
   JOB DETAIL CONTENT
========================= */
.detail-panel {
  position: sticky;
  top: 5.5rem;
}
.job-detail-card {
  padding: 1rem;
  background: #ffffff;
  border-radius: 0.75rem;
}

.job-desc {
  font-size: 0.95rem;
  color: #343a40;
}

/* Meta info grid */
.meta-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1.5rem;
}

.meta-grid div {
  display: flex;
  flex-direction: column;
  font-size: 0.85rem;
}

.meta-grid strong {
  font-weight: 600;
  color: #6c757d;
}

/* =========================
   PILLS / TAGS
========================= */
.pill {
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.pill-primary {
  background: rgba(13, 110, 253, 0.1);
  color: #0d6efd;
}

.pill-muted {
  background: #e9ecef;
  color: #495057;
}
</style>
