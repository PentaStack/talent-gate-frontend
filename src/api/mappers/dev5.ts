import type {
  AdminStats,
  AppNotification,
  EmployerAnalytics,
  Payment,
} from '@/types'

/** Backend GET /api/admin/stats */
export interface BackendAdminStats {
  users: number
  jobs: number
  applications: number
}

export function mapAdminStats(raw: BackendAdminStats): AdminStats {
  return {
    users_count: raw.users,
    jobs_count: raw.jobs,
    applications_count: raw.applications,
    revenue_total: 0,
    jobs_by_month: [],
    users_by_role: [],
    revenue_by_month: [],
  }
}

/** Backend GET /api/employer/analytics */
export interface BackendEmployerAnalytics {
  jobs: Array<{
    id: number
    title: string
    views: number
    applications: number
  }>
}

export function mapEmployerAnalytics(raw: BackendEmployerAnalytics): EmployerAnalytics {
  const jobs = raw.jobs.map((j) => ({
    job_id: j.id,
    title: j.title,
    views: j.views,
    applications: j.applications,
  }))
  return {
    jobs,
    totals: jobs.reduce(
      (acc, j) => ({
        views: acc.views + j.views,
        applications: acc.applications + j.applications,
      }),
      { views: 0, applications: 0 },
    ),
  }
}

/** Backend GET /api/notifications */
export interface BackendNotification {
  id: string
  type: string
  data: Record<string, unknown>
  read_at: string | null
  created_at: string
}

export function mapNotification(raw: BackendNotification): AppNotification {
  const data = raw.data
  const message =
    typeof data.message === 'string'
      ? data.message
      : typeof data.job_title === 'string'
        ? String(data.job_title)
        : 'Notification'

  let notifType: AppNotification['type'] = 'system'
  if (raw.type.includes('Application')) notifType = 'application'
  else if (raw.type.includes('Payment')) notifType = 'payment'
  else if (raw.type.includes('Job')) notifType = 'job'

  const title =
    notifType === 'application' && typeof data.candidate_name === 'string'
      ? 'New application'
      : notifType === 'application' && typeof data.status === 'string'
        ? `Application ${data.status}`
        : notifType === 'application' && raw.type.includes('Viewed')
          ? 'Application viewed'
          : 'Update'

  return {
    id: raw.id,
    title,
    body: message,
    read: raw.read_at !== null,
    type: notifType,
    created_at: raw.created_at,
  }
}

/** Backend GET /api/payments */
export interface BackendPayment {
  id: number
  application_id: number | null
  job_id: number
  job_title: string | null
  candidate_name: string | null
  amount: number
  currency: string
  status: string
  provider: string
  provider_reference?: string
  created_at: string
}

export function mapPayment(raw: BackendPayment): Payment {
  return {
    id: raw.id,
    application_id: raw.application_id ?? 0,
    job_title: raw.job_title ?? 'Job',
    candidate_name: raw.candidate_name ?? '—',
    amount: raw.amount,
    currency: raw.currency,
    status: raw.status as Payment['status'],
    provider: raw.provider as Payment['provider'],
    created_at: raw.created_at,
  }
}
