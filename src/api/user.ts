import { apiClient } from './axios'

export interface UserProfile {
  userName: string
  mailAddress: string
}

export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get('/api/v1/users/me')
  return response.data
}