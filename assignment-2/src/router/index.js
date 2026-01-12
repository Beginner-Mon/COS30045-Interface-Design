import { createRouter, createWebHistory } from 'vue-router'
import JobOverview from '@/components/JobOverview.vue'
import Home from '@/view/Home.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Home,
    },
    {
      path: '/jobs',
      component: JobOverview,
    },
    {
      path: '/application',
      component: () => import('@/view/Application.vue'),
    },
    {
      path: '/jobs/:id',
      component: () => import('@/view/JobDetail.vue'),
      props: true,
    },
  ],
})

export default router
