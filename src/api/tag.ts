import { apiClient } from './axios'

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

export const createTag = async (tagName: string, tagColor: string): Promise<TagListResponse> => {
  const response = await apiClient.post('/api/v1/tags/create', {
    tagName,
    tagColor
  })
  return response.data
}

export const updateTag = async (tag: Tag): Promise<void> => {
  const response = await apiClient.put(
    `/api/v1/tags/${tag.tagId}`,
    {
      tagName: tag.tagName,
      tagColor: tag.tagColor
    }
  )

  return response.data
}

export const deleteTag = async (tagId: string): Promise<void> => {
  const response = await apiClient.delete(`/api/v1/tags/${tagId}`)
  return response.data
}
