import apiClient from './axios'

export interface Tag {
  tagId: string
  tagName: string
  tagColor: string
}

export interface TagListResponse {
  userId: string
  list: Tag[]
}

export const getTags = async (): Promise<TagListResponse> => {
  const response = await apiClient.get('/api/v1/tags/all')
  return response.data
}