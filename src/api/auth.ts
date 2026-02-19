import apiClient from './axios'

interface SignupResponse {
  message: string
}

export const signup = (mailAddress: string, userName: string, password: string) => {
  return apiClient.post<SignupResponse>('/api/v1/users/auth/sign-up', {
    mailAddress,
    userName,
    password,
  })
}

export const signin = (mailAddress: string, password: string) => {
  return apiClient.post<SignupResponse>('/api/v1/users/auth/sign-in', {
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

export const refreshToken = async () => {
  const response = await apiClient.post('/api/v1/users/auth/refresh')
  return response.data.accessToken
}
