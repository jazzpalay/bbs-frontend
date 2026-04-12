import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'
import { refreshToken } from '@/api/auth'
import { getCookie } from '@/utils/cookie'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * リクエスト前にアクセストークンを自動付与
 */
apiClient.interceptors.request.use((config) => {
  const authStore = useAuthStore()

  if (authStore.accessToken) {
    config.headers.Authorization = `Bearer ${authStore.accessToken}`
  }

  // XSRF-TOKEN を自動付与
if (authStore.csrfToken) {
    config.headers['X-XSRF-TOKEN'] = authStore.csrfToken
  }

  return config
})

/**
 * レスポンスで401が来たら自動リフレッシュ
 */
apiClient.interceptors.response.use(
  (response) => {
    const authStore = useAuthStore()
    // CSRFトークンの受け取り処理
    // axiosはヘッダー名を小文字にするので 'x-xsrf-token' で取得
    const newCsrfToken = response.headers['x-xsrf-token']
    if (newCsrfToken) {
      authStore.setCsrfToken(newCsrfToken)
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config
    const authStore = useAuthStore()

    // エラーでもCSRFトークンのチェック
    const errorCsrfToken = error.response?.headers['x-xsrf-token']
    if (errorCsrfToken) {
      authStore.setCsrfToken(errorCsrfToken)
    }

    const isAuthApi = originalRequest.url?.includes('/api/v1/auth/')
    // auth系 API なら何もしない
    if (isAuthApi) {
      return Promise.reject(error)
    }

    // 401 & リトライ未実施のみ
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const newAccessToken = await refreshToken()
        authStore.setToken(newAccessToken)

        // 再試行リクエストにも、最新のCSRFトークンを載せる
        if (authStore.csrfToken) {
          originalRequest.headers['X-XSRF-TOKEN'] = authStore.csrfToken
        }

        // 新しいトークンで再実行
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return apiClient(originalRequest)
      } catch (e) {
        // refresh失敗 = フロントのみログアウト
        authStore.logout()
        window.location.href = '/signin'
        return Promise.reject(e)
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
