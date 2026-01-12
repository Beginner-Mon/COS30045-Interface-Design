
import { createRouter, createWebHistory } from 'vue-router'
import JobDetail from '@/components/JobDetail.vue'
import JobOverview from '@/components/JobOverview.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/jobs'
    },
    {
      path: '/jobs',
      component: JobOverview
    },
    {
      path: '/jobs/:id',
      component: JobDetail,
      props: true
    }
  ],
})

export default router
