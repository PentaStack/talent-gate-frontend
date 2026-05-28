import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as applicationsApi from '@/api/applications'
import type { CandidateApplication } from '@/types'

export const useApplicationsStore = defineStore('applications', () => {
  const appliedJobIds = ref<Set<number>>(new Set())
  const candidateApplications = ref<CandidateApplication[]>([])
  const isLoading = ref(false)
  const currentPage = ref(1)
  const lastPage = ref(1)

  async function fetchMyApplications(page = 1) {
    isLoading.value = true
    try {
      const response = await applicationsApi.listCandidateApplications(page)
      if (page === 1) {
        candidateApplications.value = response.data
      } else {
        candidateApplications.value = [...candidateApplications.value, ...response.data]
      }
      currentPage.value = response.meta.current_page
      lastPage.value = response.meta.last_page
      for (const app of response.data) {
        appliedJobIds.value.add(app.job.id)
      }
    } finally {
      isLoading.value = false
    }
  }

  async function submitApplication(jobId: number, coverLetter: string) {
    isLoading.value = true
    try {
      await applicationsApi.applyToJob(jobId, coverLetter)
      appliedJobIds.value.add(jobId)
    } finally {
      isLoading.value = false
    }
  }

  async function withdraw(applicationId: number) {
    isLoading.value = true
    try {
      await applicationsApi.withdrawApplication(applicationId)
      const app = candidateApplications.value.find((a) => a.id === applicationId)
      if (app) {
        app.status = 'withdrawn'
      }
    } finally {
      isLoading.value = false
    }
  }

  return {
    appliedJobIds,
    candidateApplications,
    isLoading,
    currentPage,
    lastPage,
    fetchMyApplications,
    submitApplication,
    withdraw,
  }
})
