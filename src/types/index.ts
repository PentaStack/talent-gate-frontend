export type UserRole = 'admin' | 'employer' | 'candidate'

export interface AuthUser {
  id: number
  name: string
  email: string
  role: UserRole
  banned?: boolean
}

export interface AdminStats {
  users_count: number
  jobs_count: number
  applications_count: number
  revenue_total: number
  jobs_by_month: { month: string; count: number }[]
  users_by_role: { role: UserRole; count: number }[]
  revenue_by_month: { month: string; amount: number }[]
}

export interface AdminUser {
  id: number
  name: string
  email: string
  role: UserRole
  banned: boolean
  created_at: string
}

export interface JobAnalytics {
  job_id: number
  title: string
  views: number
  applications: number
}

export interface EmployerAnalytics {
  jobs: JobAnalytics[]
  totals: { views: number; applications: number }
}

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface Payment {
  id: number
  application_id: number
  job_title: string
  candidate_name: string
  amount: number
  currency: string
  status: PaymentStatus
  provider: 'stripe' | 'paypal'
  invoice_url?: string
  created_at: string
}

export interface CheckoutSummary {
  application_id: number
  job_id?: number
  job_title: string
  candidate_name: string
  amount: number
  currency: string
  payment_id?: number
  provider?: 'stripe' | 'paypal'
  provider_reference?: string
}

export interface StripeIntentResponse {
  client_secret: string
  payment_id: number
}

export interface PayPalOrderResponse {
  order_id: string
  approval_url?: string
}

export interface AppNotification {
  id: string | number
  title: string
  body: string
  read: boolean
  type: 'application' | 'payment' | 'job' | 'system'
  created_at: string
}
