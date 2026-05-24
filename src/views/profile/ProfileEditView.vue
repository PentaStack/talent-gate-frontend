<template>
  <AppLayout>
    <div v-if="!auth.user" class="profile-error">
      Please log in to edit your profile.
    </div>
    <EmployerProfileEditView v-else-if="auth.user.role === 'employer'" />
    <CandidateProfileEditView v-else-if="auth.user.role === 'candidate'" />
    <div v-else class="profile-error">
      Profile editing is not available for your role.
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import AppLayout from "@/layouts/AppLayout.vue";
import CandidateProfileEditView from "./CandidateProfileEditView.vue";
import EmployerProfileEditView from "./EmployerProfileEditView.vue";

const auth = useAuthStore();
</script>

<style scoped>
.profile-error {
  margin: 2rem auto;
  max-width: 48rem;
  padding: 1rem 1.25rem;
  border: 1px solid #f0c7c7;
  border-radius: 0.75rem;
  background: #fff5f5;
  color: #7f1d1d;
  font-weight: 600;
}
</style>
