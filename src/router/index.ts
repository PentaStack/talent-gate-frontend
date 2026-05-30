import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import type { UserRole } from "@/types";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("@/views/HomeView.vue"),
      meta: { title: "Talent Gate" },
    },
    // Smart dashboard redirect — sends each role to their home page
    {
      path: "/dashboard",
      name: "dashboard",
      redirect: () => {
        const auth = useAuthStore();
        if (auth.role === "admin") return { name: "admin-dashboard" };
        if (auth.role === "employer") return { name: "employer-analytics" };
        return { name: "candidate-jobs" };
      },
      meta: { requiresAuth: true, title: "Dashboard" },
    },
    // Candidate home – job listings with sidebar filters
    {
      path: "/jobs",
      name: "candidate-jobs",
      component: () => import("@/views/CandidateJobsView.vue"),
      meta: {
        requiresAuth: true,
        role: "candidate" as UserRole,
        title: "Find Jobs",
      },
    },
    {
      path: "/jobs/:jobId",
      name: "job-detail",
      component: () => import("@/views/jobs/JobDetailView.vue"),
      meta: {
        requiresAuth: true,
        role: "candidate" as UserRole,
        title: "Job Detail",
      },
      props: true,
    },
    {
      path: "/jobs/:jobId/apply",
      name: "candidate-apply",
      component: () => import("@/views/candidate/ApplyView.vue"),
      meta: {
        requiresAuth: true,
        role: "candidate" as UserRole,
        title: "Apply",
      },
    },
    {
      path: "/applications/:applicationId",
      name: "candidate-application-detail",
      component: () =>
        import("@/views/candidate/CandidateApplicationDetailView.vue"),
      meta: {
        requiresAuth: true,
        role: "candidate" as UserRole,
        title: "Application Detail",
      },
    },
    {
      path: "/applications",
      name: "candidate-applications",
      component: () => import("@/views/candidate/ApplicationsView.vue"),
      meta: {
        requiresAuth: true,
        role: "candidate" as UserRole,
        title: "My Applications",
      },
    },
    {
      path: "/profile/edit",
      name: "profile-edit",
      component: () => import("@/views/profile/ProfileEditView.vue"),
      meta: { requiresAuth: true, title: "Edit Profile" },
    },
    {
      path: "/candidates/:userId",
      name: "candidate-profile",
      component: () => import("@/views/profile/PublicCandidateProfileView.vue"),
      meta: { title: "Candidate Profile" },
      props: true,
    },
    {
      path: "/profile",
      name: "profile-index",
      redirect: () => {
        const auth = useAuthStore();
        if (auth.user) {
          return { name: "public-profile", params: { userId: auth.user.id } };
        }
        return { name: "login" };
      },
      meta: { requiresAuth: true },
    },
    {
      path: "/profile/:userId",
      name: "public-profile",
      component: () => import("@/views/profile/PublicProfileView.vue"),
      meta: { title: "Public Profile" },
      props: true,
    },
    {
      path: "/register",
      name: "register",
      component: () => import("@/views/auth/RegisterView.vue"),
      meta: { requiresGuest: true, title: "Register" },
    },
    {
      path: "/login",
      name: "login",
      component: () => import("@/views/auth/LoginView.vue"),
      meta: { requiresGuest: true, title: "Login" },
    },
    {
      path: "/forgot-password",
      name: "forgot-password",
      component: () => import("@/views/auth/ForgotPasswordView.vue"),
      meta: { requiresGuest: true, title: "Forgot Password" },
    },
    {
      path: "/reset-password",
      name: "reset-password",
      component: () => import("@/views/auth/ResetPasswordView.vue"),
      meta: { requiresGuest: true, title: "Reset Password" },
    },
    {
      path: "/admin/dashboard",
      name: "admin-dashboard",
      component: () => import("@/views/admin/Dashboard.vue"),
      meta: {
        requiresAuth: true,
        role: "admin" as UserRole,
        title: "Admin Dashboard",
      },
    },
    {
      path: "/admin/users",
      name: "admin-users",
      component: () => import("@/views/admin/UserTable.vue"),
      meta: {
        requiresAuth: true,
        role: "admin" as UserRole,
        title: "User Management",
      },
    },
    {
      path: "/admin/approvals",
      name: "admin-approvals",
      component: () => import("@/views/admin/AdminApprovalsView.vue"),
      meta: {
        requiresAuth: true,
        role: "admin" as UserRole,
        title: "Job Approvals",
      },
    },
    {
      path: "/admin/comments",
      name: "admin-comments",
      component: () => import("@/views/admin/AdminCommentsView.vue"),
      meta: {
        requiresAuth: true,
        role: "admin" as UserRole,
        title: "Comment Moderation",
      },
    },
    {
      path: "/employer/jobs",
      name: "employer-jobs",
      component: () => import("@/views/employer/EmployerJobsView.vue"),
      meta: {
        requiresAuth: true,
        role: "employer" as UserRole,
        title: "My Jobs",
      },
    },
    {
      path: "/employer/jobs/create",
      name: "employer-job-create",
      component: () => import("@/views/employer/CreateJobView.vue"),
      meta: {
        requiresAuth: true,
        role: "employer" as UserRole,
        title: "Post New Job",
      },
    },
    {
      path: "/employer/jobs/:jobId/edit",
      name: "employer-job-edit",
      component: () => import("@/views/employer/EditJobView.vue"),
      meta: {
        requiresAuth: true,
        role: "employer" as UserRole,
        title: "Edit Job",
      },
      props: true,
    },
    {
      path: "/employer/analytics",
      name: "employer-analytics",
      component: () => import("@/views/employer/Analytics.vue"),
      meta: {
        requiresAuth: true,
        role: "employer" as UserRole,
        title: "Analytics",
      },
    },
    {
      path: "/employer/jobs/:jobId/applications",
      name: "employer-job-applications",
      component: () => import("@/views/employer/JobApplicationsView.vue"),
      meta: {
        requiresAuth: true,
        role: "employer" as UserRole,
        title: "Job Applications",
      },
    },
    {
      path: "/employer/applications/:applicationId",
      name: "employer-application-detail",
      component: () => import("@/views/employer/ApplicationDetailView.vue"),
      meta: {
        requiresAuth: true,
        role: "employer" as UserRole,
        title: "Application Detail",
      },
    },
    {
      path: "/payments/checkout",
      name: "checkout",
      component: () => import("@/views/payments/Checkout.vue"),
      meta: {
        requiresAuth: true,
        role: "employer" as UserRole,
        title: "Checkout",
      },
    },
    {
      path: "/payments/history",
      name: "payment-history",
      component: () => import("@/views/payments/PaymentHistory.vue"),
      meta: {
        requiresAuth: true,
        role: "employer" as UserRole,
        title: "Payment History",
      },
    },
    {
      path: "/unauthorized",
      name: "unauthorized",
      component: () => import("@/views/UnauthorizedView.vue"),
      meta: { title: "Unauthorized" },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/views/NotFoundView.vue"),
      meta: { title: "Page Not Found" },
    },
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  document.title = `${to.meta.title ?? "Page"} | Talent Gate`;

  // Ensure auth state is restored before applying access guards.
  if (!auth.initialized) {
    await auth.init();
  } else if (!auth.isAuthenticated) {
    await auth.fetchUser();
  }

  if (to.name === "home" && auth.isAuthenticated) {
    return { name: "dashboard" };
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: "login", query: { redirect: to.fullPath } };
  }

  if (to.meta.requiresGuest && auth.isAuthenticated) {
    return { name: "dashboard" };
  }

  const requiredRole = to.meta.role as UserRole | undefined;
  if (requiredRole && auth.isAuthenticated && !auth.hasRole(requiredRole)) {
    return { name: "unauthorized" };
  }
});

export default router;
