<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useNotificationsStore } from '@/stores/notifications'
import { useAuthStore } from '@/stores/auth'
import NotificationList from './NotificationList.vue'

const store = useNotificationsStore()
const auth = useAuthStore()
const open = ref(false)
const bellRef = ref<HTMLElement | null>(null)

function handleClickOutside(e: MouseEvent) {
  if (bellRef.value && !bellRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  if (auth.isAuthenticated) {
    await store.load()
    store.startPolling()
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  store.stopPolling()
})

function toggle() {
  open.value = !open.value
  if (open.value && auth.isAuthenticated) {
    store.load()
  }
}
</script>

<template>
  <div ref="bellRef" class="bell">
    <button
      type="button"
      class="bell__btn"
      aria-label="Notifications"
      :aria-expanded="open"
      @click.stop="toggle"
    >
      <span class="material-symbols-outlined">notifications</span>
      <span v-if="store.unreadCount > 0" class="bell__badge">{{ store.unreadCount > 9 ? '9+' : store.unreadCount }}</span>
    </button>
    <div v-if="open" class="bell__dropdown glass-panel" @click.stop>
      <NotificationList />
    </div>
  </div>
</template>

<style scoped>
.bell {
  position: relative;
}
.bell__btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: none;
  border: none;
  border-radius: 50%;
  color: var(--on-surface-variant);
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
}
.bell__btn:hover {
  color: var(--primary);
  background: rgba(255, 183, 125, 0.1);
}
.bell__badge {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: var(--primary-dim);
  color: var(--on-primary);
  font-size: 0.65rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bell__dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 340px;
  overflow: hidden;
  border-radius: var(--radius-lg);
  z-index: 100;
}
</style>
