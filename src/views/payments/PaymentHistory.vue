<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import BaseButton from '@/components/shared/BaseButton.vue'
import { fetchPaymentHistory } from '@/api/payments'
import type { Payment, PaymentStatus } from '@/types'

const payments = ref<Payment[]>([])
const loading = ref(true)
const router = useRouter()

onMounted(async () => {
  payments.value = await fetchPaymentHistory()
  loading.value = false
})

function statusClass(status: PaymentStatus) {
  return `chip chip--${status}`
}
</script>

<template>
  <AppLayout>
    <header class="page-header page-header--row">
      <div>
        <h1 class="page-title">Payment History</h1>
        <p class="page-subtitle">Track completed and pending transactions.</p>
      </div>
      <BaseButton size="sm" @click="router.push({ name: 'checkout', query: { applicationId: '501' } })">
        <span class="material-symbols-outlined">add_card</span>
        Demo checkout
      </BaseButton>
    </header>

    <p v-if="loading" class="muted">Loading payments…</p>
    <div v-else-if="payments.length === 0" class="glass-panel empty-panel">
      <span class="material-symbols-outlined empty-panel__icon">payments</span>
      <p>No payments yet.</p>
    </div>
    <div v-else class="glass-panel table-panel">
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Job</th>
              <th>Candidate</th>
              <th>Amount</th>
              <th>Provider</th>
              <th>Status</th>
              <th>Invoice</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in payments" :key="payment.id">
              <td>{{ new Date(payment.created_at).toLocaleDateString() }}</td>
              <td>{{ payment.job_title }}</td>
              <td>{{ payment.candidate_name }}</td>
              <td class="amount">{{ payment.currency }} {{ payment.amount.toFixed(2) }}</td>
              <td class="capitalize">{{ payment.provider }}</td>
              <td><span :class="statusClass(payment.status)">{{ payment.status }}</span></td>
              <td>
                <a
                  v-if="payment.invoice_url && payment.status === 'paid'"
                  :href="payment.invoice_url"
                  target="_blank"
                  rel="noopener"
                  class="invoice-link"
                >
                  Download
                </a>
                <span v-else class="muted">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.page-header { margin-bottom: 2rem; }
.page-header--row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}
.muted { color: var(--on-surface-variant); }
.table-panel { overflow: hidden; padding: 0; }
.table-wrap { overflow-x: auto; }
.amount { font-family: var(--font-mono),serif; color: var(--primary-dim); font-weight: 600; }
.capitalize { text-transform: capitalize; }
.invoice-link {
  color: var(--primary-dim);
  font-size: 0.85rem;
}
.invoice-link:hover { color: var(--primary); }
.empty-panel {
  padding: 3rem;
  text-align: center;
  color: var(--on-surface-variant);
}
.empty-panel__icon {
  font-size: 3rem;
  color: var(--primary-dim);
  opacity: 0.5;
  display: block;
  margin-bottom: 1rem;
}
</style>
