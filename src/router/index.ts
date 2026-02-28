import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { refreshToken } from '@/api/auth'
const routes = [
  { path: '/', redirect: '/signin' },
  { path: '/signin', component: () => import('@/views/SignIn.vue') },
  { path: '/signup', component: () => import('@/views/SignUp.vue') },
  { path: '/signup/success', component: () => import('@/views/SignupSuccess.vue') },
  { path: '/signup/success', component: () => import('@/views/SignupSuccess.vue') },
  { path: '/dashboard', component: () => import('@/views/DashboardView.vue'), meta: { requiresAuth: true } },
  { path: '/TagManagement', component: () => import('@/views/TagManageView.vue'), meta: { requiresAuth: true } },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, _, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = !!authStore.accessToken

  if (to.meta.requiresAuth) {
    if (isAuthenticated) {
      return next()
    }

    try {
      const newToken = await refreshToken()
      console.log('newToken:', newToken)
      authStore.setToken(newToken)
      console.log('store after set:', authStore.accessToken)
      return next()
    } catch {
      return next('/signin')
    }
  }

  if (to.path === '/signin' && isAuthenticated) {
    return next('/dashboard')
  }
    
  return next()
  
})

