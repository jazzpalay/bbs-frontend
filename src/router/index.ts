import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { refreshToken, getCsrfToken} from '@/api/auth'
const routes = [
  { path: '/', redirect: '/signin' },
  { path: '/signin', component: () => import('@/views/SignIn.vue')},
  { path: '/signup', component: () => import('@/views/SignUp.vue') },
  { path: '/signup/success', component: () => import('@/views/SignupSuccess.vue') },
  { path: '/dashboard', component: () => import('@/views/DashboardView.vue'), meta: { requiresAuth: true } },
  { path: '/TagManagement', component: () => import('@/views/TagManageView.vue'), meta: { requiresAuth: true } },
  { path: '/LogCreation', component: () => import('@/views/LogCreateView.vue'), meta: { requiresAuth: true } },
  { path: '/LogEdit/:logId', name: 'LogEdit', component: () => import('@/views/LogCreateView.vue'), meta: { requiresAuth: true } },
  { path: '/LogDetail/:logId', name: 'LogDetail', component: () => import('@/views/LogDetailView.vue'), meta: { requiresAuth: true } }
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, _, next) => {
  const authStore = useAuthStore()
  let isAuthenticated = authStore.isAuthenticated

  // 認証が必要なページ、またはサインインページの場合
  if (to.meta.requiresAuth || to.path === '/signin') {
    
    // すでにメモリ上にトークンがあるなら、そのまま判定へ
    if (isAuthenticated) {
      if (to.path === '/signin') return next('/dashboard')
      return next()
    }

    // リフレッシュトークンで復元
    try {
      // CSRFトークン発行
      await getCsrfToken()
      // リフレッシュトークン（Cookie）でアクセストークンを再発行
      const newToken = await refreshToken()
      authStore.setToken(newToken)
      
      // 復元成功したらダッシュボードへ
      if (to.path === '/signin') return next('/dashboard')
      return next()

    } catch (error) {
      // 復元失敗
      if (to.path === '/signin') {
        return next()
      }
      
      // 認証が必要なページで失敗したなら、サインインへ
      authStore.logout()
      return next('/signin')
    }
  }

  return next()
})

