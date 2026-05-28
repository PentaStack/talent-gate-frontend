import type {
  AdminStats,
  AdminUser,
  AppNotification,
  CheckoutSummary,
  EmployerAnalytics,
  Payment,
  PayPalOrderResponse,
  StripeIntentResponse,
  UserRole,
} from '@/types'

export const mockAdminStats: AdminStats = {
  users_count: 1284,
  jobs_count: 342,
  applications_count: 2156,
  revenue_total: 48750,
  jobs_by_month: [
    { month: 'Jan', count: 22 },
    { month: 'Feb', count: 28 },
    { month: 'Mar', count: 35 },
    { month: 'Apr', count: 41 },
    { month: 'May', count: 38 },
    { month: 'Jun', count: 45 },
  ],
  users_by_role: [
    { role: 'candidate', count: 980 },
    { role: 'employer', count: 285 },
    { role: 'admin', count: 19 },
  ],
  revenue_by_month: [
    { month: 'Jan', amount: 4200 },
    { month: 'Feb', amount: 5100 },
    { month: 'Mar', amount: 6800 },
    { month: 'Apr', amount: 7200 },
    { month: 'May', amount: 8450 },
    { month: 'Jun', amount: 9000 },
  ],
}

export const mockAdminUsers: AdminUser[] = [
  { id: 1, name: 'Admin User', email: 'admin@talentgate.test', role: 'admin', banned: false, created_at: '2025-01-10T08:00:00Z' },
  { id: 2, name: 'TechCorp HR', email: 'employer@talentgate.test', role: 'employer', banned: false, created_at: '2025-02-14T10:30:00Z' },
  { id: 3, name: 'Jane Candidate', email: 'candidate@talentgate.test', role: 'candidate', banned: false, created_at: '2025-03-01T14:20:00Z' },
  { id: 4, name: 'Spam Bot', email: 'spam@bad.test', role: 'candidate', banned: true, created_at: '2025-04-05T09:00:00Z' },
  { id: 5, name: 'Startup Inc', email: 'startup@co.test', role: 'employer', banned: false, created_at: '2025-05-12T11:45:00Z' },
]

export const mockEmployerAnalytics: EmployerAnalytics = {
  jobs: [
    { job_id: 101, title: 'Senior Vue Developer', views: 420, applications: 12 },
    { job_id: 102, title: 'Laravel Backend Engineer', views: 310, applications: 8 },
    { job_id: 103, title: 'Product Manager', views: 185, applications: 5 },
    { job_id: 104, title: 'UI/UX Designer', views: 240, applications: 15 },
  ],
  totals: { views: 1155, applications: 40 },
}

export const mockNotifications: AppNotification[] = [
  { id: 1, title: 'New application', body: 'Jane Candidate applied to Senior Vue Developer', read: false, type: 'application', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, title: 'Application accepted', body: 'Your application for Laravel Backend Engineer was accepted', read: false, type: 'application', created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 5, title: 'Application viewed', body: 'Your application for Senior Vue Developer has been viewed by the employer.', read: false, type: 'application', created_at: new Date(Date.now() - 1800000).toISOString() },
  { id: 3, title: 'Payment received', body: 'Payment of $250.00 completed successfully', read: true, type: 'payment', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 4, title: 'Job approved', body: 'Your job listing "Product Manager" has been approved', read: true, type: 'job', created_at: new Date(Date.now() - 172800000).toISOString() },
]

export const mockPayments: Payment[] = [
  { id: 1, application_id: 501, job_title: 'Senior Vue Developer', candidate_name: 'Jane Candidate', amount: 250, currency: 'USD', status: 'paid', provider: 'stripe', invoice_url: '#', created_at: '2025-05-10T14:30:00Z' },
  { id: 2, application_id: 502, job_title: 'Laravel Backend Engineer', candidate_name: 'John Smith', amount: 250, currency: 'USD', status: 'pending', provider: 'paypal', created_at: '2025-05-18T09:15:00Z' },
  { id: 3, application_id: 503, job_title: 'UI/UX Designer', candidate_name: 'Alex Lee', amount: 250, currency: 'USD', status: 'failed', provider: 'stripe', created_at: '2025-05-20T16:00:00Z' },
]

export function getMockCheckout(applicationId: number): CheckoutSummary {
  const payment = mockPayments.find((p) => p.application_id === applicationId)
  return {
    application_id: applicationId,
    job_title: payment?.job_title ?? 'Senior Vue Developer',
    candidate_name: payment?.candidate_name ?? 'Jane Candidate',
    amount: payment?.amount ?? 250,
    currency: payment?.currency ?? 'USD',
  }
}

export function mockStripeIntent(applicationId: number): StripeIntentResponse {
  return { client_secret: 'mock_secret_' + applicationId, payment_id: Date.now() }
}

export function mockPayPalOrder(applicationId: number): PayPalOrderResponse {
  return { order_id: 'MOCK-PAYPAL-' + applicationId }
}

let usersDb = [...mockAdminUsers]
let notificationsDb = [...mockNotifications]
let paymentsDb = [...mockPayments]

export function getMockUsers() {
  return [...usersDb]
}

export function mockBanUser(id: number) {
  usersDb = usersDb.map((u) => (u.id === id ? { ...u, banned: true } : u))
}

export function mockPromoteUser(id: number, role: UserRole) {
  usersDb = usersDb.map((u) => (u.id === id ? { ...u, role } : u))
}

export function getMockNotifications() {
  return [...notificationsDb]
}

export function mockMarkRead(id: string | number) {
  notificationsDb = notificationsDb.map((n) => (n.id === id ? { ...n, read: true } : n))
}

export function mockMarkAllRead() {
  notificationsDb = notificationsDb.map((n) => ({ ...n, read: true }))
}

export function getMockUnreadCount() {
  return notificationsDb.filter((n) => !n.read).length
}

export function getMockPayments() {
  return [...paymentsDb]
}

export function mockCompletePayment(applicationId: number, provider: 'stripe' | 'paypal') {
  const existing = paymentsDb.find((p) => p.application_id === applicationId)
  if (existing) {
    paymentsDb = paymentsDb.map((p) =>
      p.application_id === applicationId ? { ...p, status: 'paid' as const, provider } : p,
    )
  } else {
    const summary = getMockCheckout(applicationId)
    paymentsDb.unshift({
      id: Date.now(),
      application_id: applicationId,
      job_title: summary.job_title,
      candidate_name: summary.candidate_name,
      amount: summary.amount,
      currency: summary.currency,
      status: 'paid',
      provider,
      invoice_url: '#',
      created_at: new Date().toISOString(),
    })
  }
}
