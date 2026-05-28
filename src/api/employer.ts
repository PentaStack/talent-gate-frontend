import api from '@/api/client'

export interface EmployerJob {
  id: number
  title: string
  status: string
  application_deadline: string | null
  applications_count: number
}

export async function fetchEmployerJobs(): Promise<EmployerJob[]> {
  const { data } = await api.get('/v1/employer/jobs')
  return data.data
}
