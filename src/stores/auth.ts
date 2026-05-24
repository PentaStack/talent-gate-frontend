import { defineStore } from "pinia";
import { ref, computed } from "vue";
import * as authApi from "@/api/auth";
import { useMocks } from "@/api/client";
import type { AuthUser, UserRole } from "@/types";

const STUB_USERS: Record<UserRole, AuthUser> = {
  admin: {
    id: 1,
    name: "Admin User",
    email: "admin@talentgate.test",
    role: "admin",
  },
  employer: {
    id: 2,
    name: "Employer Co",
    email: "employer@talentgate.test",
    role: "employer",
  },
  candidate: {
    id: 3,
    name: "Jane Candidate",
    email: "candidate@talentgate.test",
    role: "candidate",
  },
};

export const useAuthStore = defineStore("auth", () => {
  const user = ref<AuthUser | null>(null);
  const initialized = ref(false);

  const isAuthenticated = computed(() => !!user.value);
  const isEmployer = computed(() => user.value?.role === "employer");
  const isCandidate = computed(() => user.value?.role === "candidate");
  const isAdmin = computed(() => user.value?.role === "admin");
  const role = computed(() => user.value?.role ?? null);

  function setUser(nextUser: AuthUser | null) {
    user.value = nextUser;

    if (nextUser) {
      localStorage.setItem("tg_user", JSON.stringify(nextUser));
      return;
    }

    localStorage.removeItem("tg_user");
  }

  async function init() {
    await fetchUser();
    initialized.value = true;
  }

  async function fetchUser() {
    if (useMocks()) {
      return user.value;
    }

    const currentUser = await authApi.fetchCurrentUser();
    setUser(currentUser);
    return currentUser;
  }

  function loginAs(roleKey: UserRole) {
    setUser(STUB_USERS[roleKey]);
  }

  async function login(email: string, password: string) {
    const currentUser = await authApi.login(email, password);
    setUser(currentUser);
    return currentUser;
  }

  async function register(payload: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: UserRole;
  }) {
    const currentUser = await authApi.register(payload);
    setUser(currentUser);
    return currentUser;
  }

  async function logout() {
    if (!useMocks()) {
      await authApi.logout();
    }
    setUser(null);
  }

  function hasRole(required: UserRole | UserRole[]): boolean {
    if (!user.value) return false;
    const roles = Array.isArray(required) ? required : [required];
    return roles.includes(user.value.role);
  }

  return {
    user,
    initialized,
    isAuthenticated,
    isEmployer,
    isCandidate,
    isAdmin,
    role,
    init,
    fetchUser,
    loginAs,
    login,
    register,
    logout,
    hasRole,
  };
});
