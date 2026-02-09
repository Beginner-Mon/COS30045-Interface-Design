import { createRouter, createWebHistory } from 'vue-router'

import Home from '@/view/Home.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/jobs',
    },
    {
      path: '/jobs',
      component: Home,
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
    {
      path: '/todo',
      component: () => import('@/view/ToDoList.vue'),

    }
  ],
})

export default router
