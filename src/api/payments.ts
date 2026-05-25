import api, { useMocks } from '@/api/client'
import { mapPayment, type BackendPayment } from '@/api/mappers/dev5'
import {
  getMockCheckout,
  getMockPayments,
  mockCompletePayment,
  mockPayPalOrder,
} from '@/api/mocks/dev5'
import type { CheckoutSummary, Payment, PayPalOrderResponse } from '@/types'

export async function fetchPaymentByApplication(
  applicationId: number,
): Promise<BackendPayment | null> {
  const { data } = await api.get<{ data: BackendPayment[] }>('/payments', {
    params: { application_id: applicationId },
  })
  const row = (data.data ?? [])[0]
  return row ?? null
}

export async function fetchCheckoutSummary(
  applicationId: number,
): Promise<CheckoutSummary> {
  if (useMocks()) {
    await delay(200)
    return getMockCheckout(applicationId)
  }
  const payment = await fetchPaymentByApplication(applicationId)
  if (!payment) {
    throw new Error(
      'No payment found for this application. Accept the candidate first to create a pending payment.',
    )
  }
  return {
    application_id: applicationId,
    job_id: payment.job_id,
    job_title: payment.job_title ?? 'Job',
    candidate_name: payment.candidate_name ?? '—',
    amount: payment.amount,
    currency: payment.currency,
    payment_id: payment.id,
    provider: payment.provider as 'stripe' | 'paypal',
    provider_reference: payment.provider_reference,
  }
}

export async function createPayPalCheckout(
  jobId: number,
  amount: number,
): Promise<PayPalOrderResponse> {
  if (useMocks()) {
    await delay(300)
    const mock = mockPayPalOrder(jobId)
    return { order_id: mock.order_id, approval_url: mock.approval_url }
  }
  const { data } = await api.post<{ payment_id: number; approval_url: string }>(
    '/payments/paypal',
    { job_id: jobId, amount },
  )
  return {
    order_id: String(data.payment_id),
    approval_url: data.approval_url,
  }
}

export async function fetchPaymentHistory(): Promise<Payment[]> {
  if (useMocks()) {
    await delay(300)
    return getMockPayments()
  }
  const { data } = await api.get<{ data: BackendPayment[] }>('/payments')
  return (data.data ?? []).map(mapPayment)
}

export async function completeMockPayment(
  applicationId: number,
  provider: 'stripe' | 'paypal',
): Promise<void> {
  if (useMocks()) {
    mockCompletePayment(applicationId, provider)
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
