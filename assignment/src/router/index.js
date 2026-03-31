import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import WebLayout from '@/layouts/WebLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: WebLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/Home.vue'),
        },
        {
          path: 'about',
          name: 'about',
          component: () => import('@/views/About.vue'),
        },
        {
          path: 'news',
          name: 'news',
          component: () => import('@/views/News.vue'),
        },
      ]
    },
    {
      path: '/auth',
      component: AuthLayout,
      children: [
        {
          path: 'login',
          name: 'login',
          component: () => import('@/views/Login.vue'),
        },
        {
          path: 'signup',
          name: 'signup',
          component: () => import('@/views/SignUp.vue'),
        },
      ]
    },
    {
      path: '/dashboard',
      component: DashboardLayout,
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/Dashboard.vue'),
          meta: { requiresAuth: true }
        }
      ]
    }
  ],
})

// Auth guard — waits for Firebase to confirm auth state before deciding
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  // Wait for Firebase to determine if user is logged in (only blocks on first load)
  await userStore.authReady

  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next('/auth/login')
  } else if ((to.name === 'login' || to.name === 'signup') && userStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
