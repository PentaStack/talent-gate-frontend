import api, { useMocks } from '@/api/client'
import type { JobComment, PaginatedResponse } from '@/types'

export async function fetchComments(jobId: number, page = 1): Promise<PaginatedResponse<JobComment>> {
  if (useMocks()) {
    return { data: [], meta: { current_page: 1, last_page: 1, per_page: 20, total: 0 } }
  }
  const { data } = await api.get<PaginatedResponse<JobComment>>(`/v1/jobs/${jobId}/comments?page=${page}`)
  return data
}

export async function postComment(jobId: number, body: string): Promise<JobComment> {
  const { data } = await api.post<{ data: JobComment }>(`/v1/jobs/${jobId}/comments`, { body })
  return data.data
}

export async function deleteComment(commentId: number): Promise<void> {
  await api.delete(`/v1/comments/${commentId}`)
}
