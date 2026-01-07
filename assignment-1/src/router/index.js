import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/view/Home.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
    },
    {
      path: '/events',
      name: 'Events',
      component: () => import("@/view/Events.vue"),
    },
    {
      path: '/registration',
      name: 'Registration',
      component: () => import('@/view/Registration.vue'),
    },
  ],
})

export default router
