import api from '@/api/client'

export interface JobListing {
  id: number
  title: string
  application_deadline: string | null
  employer: {
    company_name: string
    logo_url: string | null
  }
}

export async function fetchJobs(page = 1): Promise<{ data: JobListing[]; meta: { current_page: number; last_page: number } }> {
  const { data } = await api.get('/v1/jobs', { params: { page } })
  return data
}
