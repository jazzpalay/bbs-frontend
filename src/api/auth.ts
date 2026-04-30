import { apiClient, refreshClient } from './axios'

interface SignupResponse {
  message: string
}

interface SigninResponse {
  jwt: string
}

export const signup = (mailAddress: string, userName: string, password: string) => {
  return apiClient.post<SignupResponse>('/api/v1/auth/sign-up', {
    mailAddress,
    userName,
    password,
  })
}

export const signin = (mailAddress: string, password: string) => {
  return apiClient.post<SigninResponse>('/api/v1/auth/sign-in', {
    mailAddress,
    password,
  },
  {
    headers: {
      'X-Device-Id': crypto.randomUUID()
    }
  }
)
}

export const getCsrfToken = async () => {
  const response = await apiClient.get('/api/v1/auth/csrf')
  return response.headers['x-xsrf-token'];
}

export const refreshToken = async () => {
  const response = await refreshClient.post('/api/v1/auth/refresh')
  return response.data.jwt
}

export const signout = async () => {
  await apiClient.post('/api/v1/auth/sign-out')
}
