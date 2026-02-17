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
