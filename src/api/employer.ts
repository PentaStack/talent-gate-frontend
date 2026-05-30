import api from '@/api/client'
import type { Category, Technology } from '@/api/jobs'

export interface EmployerJob {
  id: number
  title: string
  status: string
  work_type: string | null
  location: string | null
  salary_range: string | null
  application_deadline: string | null
  applications_count: number
  category: Category | null
  technologies: Technology[]
}

export interface EmployerJobDetail extends EmployerJob {
  description: string | null
  requirements: string | null
  category_id: number | null
  technology_ids: number[]
}

export interface JobPayload {
  title: string
  description: string
  requirements?: string | null
  salary_range?: string | null
  work_type: string
  location?: string | null
  category_id?: number | null
  application_deadline: string
  technology_ids?: number[]
  status?: string
}

export async function fetchEmployerJobs(): Promise<EmployerJob[]> {
  const { data } = await api.get('/v1/employer/jobs')
  return data.data
}

export async function fetchEmployerJob(id: number): Promise<EmployerJobDetail> {
  const { data } = await api.get(`/v1/employer/jobs/${id}`)
  const job = data.data
  return {
    ...job,
    category_id: job.category?.id ?? null,
    technology_ids: (job.technologies ?? []).map((t: Technology) => t.id),
  }
}

export async function createJob(payload: JobPayload): Promise<EmployerJobDetail> {
  const { data } = await api.post('/v1/employer/jobs', payload)
  return data.data ?? data
}

export async function updateJob(id: number, payload: Partial<JobPayload>): Promise<EmployerJobDetail> {
  const { data } = await api.put(`/v1/employer/jobs/${id}`, payload)
  return data.data ?? data
}

export async function deleteJob(id: number): Promise<void> {
  await api.delete(`/v1/employer/jobs/${id}`)
}
