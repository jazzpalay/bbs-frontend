import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'
import { refreshToken } from '@/api/auth'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  withCredentials: true,
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

  return config
})


/**
 * レスポンスで401が来たら自動リフレッシュ
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const authStore = useAuthStore()

    const isAuthApi = originalRequest.url?.includes('/api/v1/users/auth/')
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
