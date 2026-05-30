<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import BaseButton from '@/components/shared/BaseButton.vue'
import {
  fetchCheckoutSummary,
  createPayPalCheckout,
  completeMockPayment,
  createStripeIntent,
} from '@/api/payments'
import { useMocks } from '@/api/client'
import { useToast } from '@/composables/useToast'
import type { CheckoutSummary } from '@/types'
import { loadStripe, type Stripe, type StripeElements } from '@stripe/stripe-js'

const route = useRoute()
const router = useRouter()
const { show: toast } = useToast()
const mocks = useMocks()

const summary = ref<CheckoutSummary | null>(null)
const loading = ref(true)
const paying = ref(false)
const loadError = ref<string | null>(null)

const applicationId = computed(() => {
  const id = route.query.applicationId
  return id ? Number(id) : null
})

let stripe: Stripe | null = null
let elements: StripeElements | null = null
const stripeContainer = ref<HTMLElement | null>(null)

onMounted(async () => {
  if (!applicationId.value) {
    loading.value = false
    return
  }
  try {
    summary.value = await fetchCheckoutSummary(applicationId.value)
    if (summary.value.provider === 'stripe' && !mocks) {
      setTimeout(() => initStripe(), 100)
    }
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : 'Failed to load checkout'
    toast(loadError.value, 'error')
  } finally {
    loading.value = false
  }
})

async function initStripe() {
  if (!applicationId.value || !stripeContainer.value) return
  try {
    const intent = await createStripeIntent(applicationId.value)
    stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
    if (stripe) {
      elements = stripe.elements({ clientSecret: intent.client_secret, theme: 'night' })
      const paymentElement = elements.create('payment')
      paymentElement.mount(stripeContainer.value)
    }
  } catch (e) {
    console.error('Stripe initialization failed', e)
  }
}

async function payWithStripe() {
  if (mocks) {
    if (applicationId.value) await completeMockPayment(applicationId.value, 'stripe')
    toast('Payment successful (mock)', 'success')
    router.push({ name: 'payment-history' })
    return
  }

  if (!stripe || !elements) return
  paying.value = true
  try {
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payments/history?success=true`,
      },
    })
    if (error) toast(error.message || 'Payment failed', 'error')
  } finally {
    paying.value = false
  }
}

async function payWithPayPal() {
  if (!summary.value?.job_id) {
    toast('Missing job for PayPal checkout', 'error')
    return
  }
  paying.value = true
  try {
    const order = await createPayPalCheckout(summary.value.job_id, summary.value.amount)
    if (mocks) {
      if (applicationId.value) await completeMockPayment(applicationId.value, 'paypal')
      toast('Payment successful (mock)', 'success')
      router.push({ name: 'payment-history' })
    } else if (order.approval_url) {
      window.location.href = order.approval_url
    } else {
      toast('PayPal checkout started', 'success')
      router.push({ name: 'payment-history' })
    }
  } catch {
    toast('PayPal payment failed', 'error')
  } finally {
    paying.value = false
  }
}
</script>

<template>
  <AppLayout>
    <header class="page-header">
      <h1 class="page-title">Payment Checkout</h1>
      <p class="page-subtitle">Complete payment after accepting a candidate.</p>
    </header>

    <p v-if="!applicationId" class="glass-panel alert-panel">
      <span class="material-symbols-outlined">link_off</span>
      Missing <code>applicationId</code>. Dev 4 should navigate to
      <code>/payments/checkout?applicationId=1</code>
    </p>
    <p v-else-if="loading" class="muted">Loading…</p>
    <p v-else-if="loadError" class="alert alert--error">{{ loadError }}</p>

    <template v-else-if="summary">
      <div class="checkout-grid">
        <section class="glass-panel summary-card">
          <h2 class="summary-card__title font-display">Order summary</h2>
          <dl class="summary-dl">
            <dt>Job</dt>
            <dd>{{ summary.job_title }}</dd>
            <dt>Candidate</dt>
            <dd>{{ summary.candidate_name }}</dd>
            <dt>Amount</dt>
            <dd class="summary-dl__amount">{{ summary.currency }} {{ summary.amount.toFixed(2) }}</dd>
            <template v-if="summary.provider">
              <dt>Provider</dt>
              <dd class="capitalize">{{ summary.provider }}</dd>
            </template>
            <template v-if="summary.provider_reference">
              <dt>Reference</dt>
              <dd class="mono">{{ summary.provider_reference }}</dd>
            </template>
          </dl>
        </section>

        <section class="glass-panel pay-card">
          <div v-if="summary.provider === 'stripe'" class="pay-block">
            <div class="pay-block__head">
              <span class="material-symbols-outlined">credit_card</span>
              <h3>Stripe payment</h3>
            </div>
            <p class="pay-block__hint">Complete your payment securely with Stripe.</p>
            <div ref="stripeContainer" class="stripe-element"></div>
            <BaseButton variant="primary" :disabled="paying" @click="payWithStripe" class="mt-4">
              {{ paying ? 'Processing…' : 'Pay with Stripe' }}
            </BaseButton>
          </div>

          <div class="pay-block">
            <div class="pay-block__head">
              <span class="material-symbols-outlined">account_balance_wallet</span>
              <h3>Pay with PayPal</h3>
            </div>
            <p class="pay-block__hint">Job #{{ summary.job_id }} — employer checkout flow.</p>
            <BaseButton variant="secondary" :disabled="paying" @click="payWithPayPal">
              {{ paying ? 'Processing…' : 'Pay with PayPal' }}
            </BaseButton>
          </div>

          <router-link :to="{ name: 'payment-history' }" class="history-link">
            View payment history →
          </router-link>
        </section>
      </div>
    </template>
  </AppLayout>
</template>

<style scoped>
.page-header { margin-bottom: 2rem; }
.muted { color: var(--on-surface-variant); }
.alert { padding: 1rem; border-radius: var(--radius-md); font-size: 0.9rem; }
.alert--error {
  background: rgba(255, 180, 171, 0.1);
  border: 1px solid rgba(255, 180, 171, 0.25);
  color: var(--error);
}
.alert-panel {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1.25rem;
  color: var(--on-surface-variant);
  font-size: 0.9rem;
}
.checkout-grid {
  display: grid;
  gap: 1.5rem;
  max-width: 900px;
}
@media (min-width: 768px) {
  .checkout-grid { grid-template-columns: 1fr 1fr; }
}
.summary-card, .pay-card { padding: 1.5rem; }
.summary-card__title { font-size: 1.25rem; margin: 0 0 1.25rem; color: var(--on-surface); }
.summary-dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.6rem 1.25rem;
  margin: 0;
}
.summary-dl dt { color: var(--on-surface-variant); font-size: 0.85rem; }
.summary-dl dd { margin: 0; color: var(--on-surface); }
.summary-dl__amount {
  font-family: var(--font-display),serif;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--primary);
}
.mono { font-family: var(--font-mono),serif; font-size: 0.8rem; word-break: break-all; }
.capitalize { text-transform: capitalize; }
.pay-block { margin-bottom: 1.5rem; }
.pay-block__head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  color: var(--primary-dim);
}
.pay-block__head h3 { margin: 0; font-size: 1rem; color: var(--on-surface); }
.pay-block__hint {
  font-size: 0.85rem;
  color: var(--on-surface-variant);
  margin: 0 0 1rem;
  line-height: 1.5;
}
.history-link {
  display: inline-block;
  font-size: 0.9rem;
  color: var(--primary-dim);
}
.history-link:hover { color: var(--primary); }
.stripe-element { margin-bottom: 1rem; min-height: 200px; }
.mt-4 { margin-top: 1rem; }
</style>
