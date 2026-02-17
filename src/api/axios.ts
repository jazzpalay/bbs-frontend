import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
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

export default apiClient
