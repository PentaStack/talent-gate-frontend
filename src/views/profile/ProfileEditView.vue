<template>
  <AppLayout>
    <EmployerProfileEditView v-if="auth.user?.role === 'employer'" />
    <CandidateProfileEditView v-else />
  </AppLayout>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import AppLayout from "@/layouts/AppLayout.vue";
import CandidateProfileEditView from "./CandidateProfileEditView.vue";
import EmployerProfileEditView from "./EmployerProfileEditView.vue";

const auth = useAuthStore();
</script>
