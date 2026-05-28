import api from '@/api/client'
import type { ApplicationStatus, CandidateApplication, EmployerApplicationListItem, PaginatedResponse } from '@/types'

export async function applyToJob(jobId: number, coverLetter: string): Promise<CandidateApplication> {
  const { data } = await api.post(`/v1/jobs/${jobId}/apply`, { cover_letter: coverLetter })
  return data.data
}

export async function listCandidateApplications(page = 1): Promise<PaginatedResponse<CandidateApplication>> {
  const { data } = await api.get('/v1/applications', { params: { page } })
  return data
}

export async function getMyCandidateApplication(applicationId: number): Promise<CandidateApplication> {
  const { data } = await api.get(`/v1/applications/${applicationId}`)
  return data.data
}

export async function withdrawApplication(applicationId: number): Promise<CandidateApplication> {
  const { data } = await api.patch(`/v1/applications/${applicationId}/withdraw`)
  return data.data
}

export async function listJobApplications(
  jobId: number,
  status?: ApplicationStatus,
  page = 1,
): Promise<PaginatedResponse<EmployerApplicationListItem>> {
  const { data } = await api.get(`/v1/employer/jobs/${jobId}/applications`, {
    params: { ...(status ? { status } : {}), page },
  })
  return data
}

export async function getApplication(applicationId: number): Promise<EmployerApplicationListItem> {
  const { data } = await api.get(`/v1/employer/applications/${applicationId}`)
  return data.data
}

export async function updateApplicationStatus(
  applicationId: number,
  status: ApplicationStatus,
): Promise<EmployerApplicationListItem> {
  const { data } = await api.patch(`/v1/employer/applications/${applicationId}/status`, { status })
  return data.data
}

export async function openApplicationResume(applicationId: number): Promise<void> {
  const response = await api.get(`/v1/employer/applications/${applicationId}/resume`, {
    responseType: 'blob',
  })
  const blob = new Blob([response.data], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank', 'noopener')
}

export async function updateApplicationNotes(
  applicationId: number,
  notes: string | null,
): Promise<EmployerApplicationListItem> {
  const { data } = await api.patch(`/v1/employer/applications/${applicationId}/notes`, { notes })
  return data.data
}
