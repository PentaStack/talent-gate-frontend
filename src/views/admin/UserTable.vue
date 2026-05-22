<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import BaseButton from '@/components/shared/BaseButton.vue'
import BaseModal from '@/components/shared/BaseModal.vue'
import { fetchUsers, banUser, promoteUser } from '@/api/admin'
import { useToast } from '@/composables/useToast'
import type { AdminUser, UserRole } from '@/types'

const users = ref<AdminUser[]>([])
const loading = ref(true)
const apiError = ref<string | null>(null)
const modalOpen = ref(false)
const modalAction = ref<'ban' | 'promote'>('ban')
const selectedUser = ref<AdminUser | null>(null)
const promoteRole = ref<UserRole>('employer')
const { show: toast } = useToast()

onMounted(load)

async function load() {
  loading.value = true
  apiError.value = null
  try {
    users.value = await fetchUsers()
  } catch (e) {
    apiError.value = e instanceof Error ? e.message : 'Failed to load users'
    users.value = []
  } finally {
    loading.value = false
  }
}

function openBan(user: AdminUser) {
  selectedUser.value = user
  modalAction.value = 'ban'
  modalOpen.value = true
}

function openPromote(user: AdminUser) {
  selectedUser.value = user
  modalAction.value = 'promote'
  promoteRole.value = user.role === 'candidate' ? 'employer' : 'candidate'
  modalOpen.value = true
}

async function confirmAction() {
  if (!selectedUser.value) return
  const user = selectedUser.value
  try {
    if (modalAction.value === 'ban') {
      await banUser(user.id)
      toast(`${user.name} has been banned`, 'success')
    } else {
      await promoteUser(user.id, promoteRole.value)
      toast(`${user.name} promoted to ${promoteRole.value}`, 'success')
    }
    modalOpen.value = false
    await load()
  } catch {
    toast('Action failed', 'error')
  }
}

function roleChipClass(role: string) {
  return `chip chip--role-${role}`
}
</script>

<template>
  <AppLayout>
    <header class="page-header">
      <h1 class="page-title">User Management</h1>
      <p class="page-subtitle">Directory of platform accounts — ban or promote roles.</p>
    </header>

    <p v-if="apiError" class="alert alert--warn">{{ apiError }}</p>
    <p v-if="loading" class="muted">Loading users…</p>

    <div v-else class="glass-panel table-panel">
      <div class="table-panel__toolbar">
        <span class="label-caps">{{ users.length }} users</span>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>
                <div class="user-cell">
                  <div class="user-cell__avatar">{{ user.name.charAt(0) }}</div>
                  {{ user.name }}
                </div>
              </td>
              <td class="mono">{{ user.email }}</td>
              <td><span :class="roleChipClass(user.role)">{{ user.role }}</span></td>
              <td>
                <span class="chip" :class="user.banned ? 'chip--banned' : 'chip--active'">
                  {{ user.banned ? 'Banned' : 'Active' }}
                </span>
              </td>
              <td>{{ new Date(user.created_at).toLocaleDateString() }}</td>
              <td>
                <div class="actions">
                  <BaseButton
                    v-if="!user.banned && user.role !== 'admin'"
                    variant="danger"
                    size="sm"
                    @click="openBan(user)"
                  >
                    Ban
                  </BaseButton>
                  <BaseButton
                    v-if="!user.banned && user.role !== 'admin'"
                    variant="ghost"
                    size="sm"
                    @click="openPromote(user)"
                  >
                    Promote
                  </BaseButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <BaseModal
      :open="modalOpen"
      :title="modalAction === 'ban' ? 'Ban user' : 'Promote user'"
      @close="modalOpen = false"
    >
      <p v-if="selectedUser">
        <template v-if="modalAction === 'ban'">
          Ban <strong>{{ selectedUser.name }}</strong>? They will lose access.
        </template>
        <template v-else>
          Change role for <strong>{{ selectedUser.name }}</strong>:
          <select v-model="promoteRole" class="select-field modal-select">
            <option value="candidate">Candidate</option>
            <option value="employer">Employer</option>
            <option value="admin">Admin</option>
          </select>
        </template>
      </p>
      <template #footer>
        <BaseButton variant="ghost" @click="modalOpen = false">Cancel</BaseButton>
        <BaseButton :variant="modalAction === 'ban' ? 'danger' : 'primary'" @click="confirmAction">
          Confirm
        </BaseButton>
      </template>
    </BaseModal>
  </AppLayout>
</template>

<style scoped>
.page-header { margin-bottom: 2rem; }
.muted { color: var(--on-surface-variant); }
.alert {
  padding: 0.85rem 1rem;
  border-radius: var(--radius-md);
  margin-bottom: 1rem;
  font-size: 0.9rem;
}
.alert--warn {
  background: rgba(252, 211, 77, 0.1);
  border: 1px solid rgba(252, 211, 77, 0.25);
  color: var(--warning);
}
.table-panel { overflow: hidden; }
.table-panel__toolbar {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-subtle);
  background: rgba(18, 18, 20, 0.4);
}
.table-wrap { overflow-x: auto; }
.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.user-cell__avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: var(--surface-variant);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--primary);
}
.mono { font-family: var(--font-mono),serif; font-size: 0.85rem; color: var(--on-surface-variant); }
.actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.modal-select { display: block; width: 100%; margin-top: 1rem; }
</style>
