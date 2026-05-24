<template>
  <div class="auth-page auth-page--login">
    <div class="auth-page__ambient auth-page__ambient--primary"></div>
    <div class="auth-page__ambient auth-page__ambient--secondary"></div>

    <header class="auth-topbar glass-panel">
      <div class="auth-topbar__brand">Talent-Gate</div>
      <div class="auth-topbar__links">
        <a href="#support">Support</a>
        <a href="#api">API</a>
      </div>
    </header>

    <main class="auth-shell">
      <section class="auth-copy">
        <p class="auth-kicker">Secure Access</p>
        <h1>Welcome back to the technical frontier.</h1>
        <p class="auth-summary">
          Continue your journey with a focused workspace for candidates and
          employers.
        </p>

        <div class="auth-feature glass-panel">
          <div class="auth-feature__icon">
            <span class="material-symbols-outlined">terminal</span>
          </div>
          <div>
            <p class="auth-feature__title">Identity verification active</p>
            <p class="auth-feature__text">
              Access matching, analytics, and hiring tools from one secure
              portal.
            </p>
          </div>
        </div>
      </section>

      <section class="auth-card glass-panel glass-panel--glow">
        <div class="auth-card__header">
          <h2>Sign In</h2>
          <p>Use your Talent-Gate account to continue.</p>
        </div>

        <div class="role-toggle" aria-label="Account type">
          <button
            id="candidate-button"
            type="button"
            class="role-toggle__button"
            :class="{
              'role-toggle__button--active': selectedRole === 'candidate',
            }"
            @click="selectedRole = 'candidate'"
          >
            Candidate
          </button>
          <button
            id="employer-button"
            type="button"
            class="role-toggle__button"
            :class="{
              'role-toggle__button--active': selectedRole === 'employer',
            }"
            @click="selectedRole = 'employer'"
          >
            Employer
          </button>
        </div>

        <p v-if="successMessage" class="auth-alert auth-alert--success">
          {{ successMessage }}
        </p>
        <p v-if="serverError" class="auth-alert auth-alert--error">
          {{ serverError }}
        </p>

        <form class="auth-form" @submit.prevent="onSubmit">
          <label class="auth-field">
            <span>Email Address</span>
            <div class="auth-input-wrap">
              <span class="material-symbols-outlined auth-input-icon"
                >mail</span
              >
              <input
                v-model.trim="email"
                type="email"
                placeholder="dev@Talent-Gate.io"
                autocomplete="email"
                required
              />
            </div>
          </label>

          <label class="auth-field">
            <span>Password</span>
            <div class="auth-input-wrap auth-input-wrap--with-action">
              <span class="material-symbols-outlined auth-input-icon"
                >lock</span
              >
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                autocomplete="current-password"
                required
              />
              <button
                type="button"
                class="auth-input-action"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? "Hide" : "Show" }}
              </button>
            </div>
          </label>

          <div class="auth-meta">
            <label class="auth-remember">
              <input v-model="remember" type="checkbox" />
              <span>Remember me</span>
            </label>
            <RouterLink to="/forgot-password">Forgot password?</RouterLink>
          </div>

          <button class="auth-submit" type="submit" :disabled="loading">
            {{ loading ? "Signing in..." : "Sign In" }}
          </button>
        </form>

        <!--
        <div class="auth-divider">
          <span></span>
          <p>OR CONTINUE WITH</p>
          <span></span>
        </div>

        <div class="social-grid" aria-label="Social login options">
          <button type="button" class="social-button">
            <span class="material-symbols-outlined">code</span>
            <span>GitHub</span>
          </button>
          <button type="button" class="social-button">
            <span class="material-symbols-outlined">work</span>
            <span>LinkedIn</span>
          </button>
        </div>
        -->

        <p class="auth-switch">
          Don't have an account?
          <RouterLink to="/register">Join the network</RouterLink>
        </p>
      </section>
    </main>

    <footer class="auth-footer">
      <div>
        <h3>Talent-Gate</h3>
        <p>Architecting the future of technical talent acquisition.</p>
      </div>
      <div id="support" class="auth-footer__links">
        <a href="#">About</a>
        <a href="#">Privacy</a>
        <a href="#api">Terms</a>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const email = ref(
  typeof route.query.email === "string" ? route.query.email : "",
);
const password = ref("");
const remember = ref(false);
const showPassword = ref(false);
const loading = ref(false);
const serverError = ref<string | null>(null);
const selectedRole = ref<"candidate" | "employer">("candidate");

const successMessage = computed(() => {
  if (route.query.verified === "1") {
    return "Your account is verified. You can sign in now.";
  }

  return route.query.registered === "1"
    ? "Account created. Please verify your account from the email sent to your Gmail before signing in."
    : null;
});

async function onSubmit() {
  loading.value = true;
  serverError.value = null;

  try {
    await auth.login(email.value, password.value);
    await auth.fetchUser();

    // Role mismatch — the account exists but belongs to a different role.
    // Silently log out and show a generic credentials error to avoid leaking
    // information about which role the account is registered under.
    if (auth.role !== selectedRole.value && auth.role !== "admin") {
      await auth.logout();
      serverError.value = "The provided credentials are incorrect.";
      return;
    }

    const redirectPath =
      typeof route.query.redirect === "string" ? route.query.redirect : null;

    if (redirectPath && redirectPath.startsWith("/")) {
      await router.replace(redirectPath);
      return;
    }

    if (auth.role === "admin") {
      await router.push("/admin/dashboard");
    } else if (auth.role === "employer") {
      await router.push("/employer/analytics");
    } else {
      await router.push("/jobs");
    }
  } catch (error: any) {
    if (error?.response?.status === 401) {
      serverError.value = "The provided credentials are incorrect.";
      return;
    }

    if (error?.response?.status === 422) {
      serverError.value =
        error?.response?.data?.errors?.email?.[0] ??
        "You must verify your account first. Check your email inbox for the verification message.";
      return;
    }

    serverError.value =
      "You must verify your account first. Check your email inbox for the verification message.";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: var(--bg-ink);
  color: var(--on-surface);
}

.auth-page__ambient {
  position: fixed;
  inset: auto;
  width: 36rem;
  height: 36rem;
  border-radius: 9999px;
  filter: blur(120px);
  pointer-events: none;
}

.auth-page__ambient--primary {
  top: -8rem;
  left: -8rem;
  background: rgba(255, 183, 125, 0.08);
}

.auth-page__ambient--secondary {
  right: -8rem;
  bottom: -8rem;
  background: rgba(201, 190, 255, 0.08);
}

.glass-panel {
  background: rgba(26, 26, 28, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 220, 195, 0.15);
  border-radius: 1.5rem;
}

.glass-panel--glow {
  box-shadow: 0 0 30px rgba(255, 183, 125, 0.08);
}

.auth-topbar {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  max-width: 80rem;
  margin: 0 auto;
  padding: 1rem 1.25rem;
}

.auth-topbar__brand,
.auth-footer h3 {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
}

.auth-topbar__links,
.auth-footer__links {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.auth-topbar__links a,
.auth-footer__links a {
  color: var(--on-surface-variant);
  transition: color 0.2s ease;
}

.auth-topbar__links a:hover,
.auth-footer__links a:hover {
  color: var(--primary);
}

.auth-shell {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 0.9fr);
  gap: 2.5rem;
  align-items: center;
  width: min(74rem, calc(100% - 2rem));
  margin: 0 auto;
  padding: 4rem 0 3rem;
}

.auth-copy {
  display: grid;
  gap: 1.25rem;
  max-width: 36rem;
}

.auth-kicker {
  margin: 0;
  color: var(--primary-dim);
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.75rem;
  font-weight: 700;
}

.auth-copy h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(3rem, 6vw, 5.5rem);
  line-height: 0.98;
  letter-spacing: -0.03em;
}

.auth-summary {
  margin: 0;
  max-width: 32rem;
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--on-surface-variant);
}

.auth-feature {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1.25rem;
}

.auth-feature__icon {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 9999px;
  background: rgba(255, 183, 125, 0.12);
  color: var(--primary-dim);
  flex-shrink: 0;
}

.auth-feature__title {
  margin: 0 0 0.35rem;
  font-weight: 700;
}

.auth-feature__text {
  margin: 0;
  color: var(--on-surface-variant);
}

.auth-card {
  padding: 2rem;
}

.auth-card__header h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 2rem;
}

.auth-card__header p {
  margin: 0.35rem 0 0;
  color: var(--on-surface-variant);
}

.role-toggle {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
  margin: 1.5rem 0 1rem;
  padding: 0.35rem;
  background: rgba(18, 18, 20, 0.55);
  border: 1px solid var(--border-subtle);
  border-radius: 9999px;
}

.role-toggle__button {
  border: 0;
  background: transparent;
  color: var(--on-surface-variant);
  border-radius: 9999px;
  padding: 0.85rem 1rem;
  font: inherit;
  cursor: pointer;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.role-toggle__button--active {
  background: var(--primary-container);
  color: var(--on-primary-container);
}

.role-toggle__button:active,
.social-button:active,
.auth-submit:active {
  transform: scale(0.98);
}

.auth-alert {
  margin: 1rem 0 0;
  padding: 0.9rem 1rem;
  border-radius: 1rem;
  font-size: 0.95rem;
}

.auth-alert--success {
  background: rgba(134, 239, 172, 0.08);
  border: 1px solid rgba(134, 239, 172, 0.2);
  color: var(--success);
}

.auth-alert--error {
  background: rgba(255, 180, 171, 0.08);
  border: 1px solid rgba(255, 180, 171, 0.2);
  color: var(--error);
}

.auth-form {
  display: grid;
  gap: 1rem;
  margin-top: 1.25rem;
}

.auth-field {
  display: grid;
  gap: 0.45rem;
  color: var(--on-surface-variant);
}

.auth-field > span {
  padding-left: 0.15rem;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.auth-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.auth-input-icon {
  position: absolute;
  left: 1rem;
  font-size: 1.15rem;
  color: var(--on-surface-variant);
}

.auth-input-wrap input {
  width: 100%;
  min-height: 3.5rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  color: var(--on-surface);
  padding: 0 1rem 0 3rem;
  font: inherit;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.auth-input-wrap--with-action input {
  padding-right: 4.5rem;
}

.auth-input-wrap input::placeholder {
  color: rgba(215, 195, 182, 0.55);
}

.auth-input-wrap input:focus {
  outline: none;
  border-color: var(--primary-dim);
  box-shadow: 0 0 0 3px rgba(255, 183, 125, 0.15);
}

.auth-input-action {
  position: absolute;
  right: 0.85rem;
  border: 0;
  background: transparent;
  color: var(--primary-dim);
  font: inherit;
  cursor: pointer;
}

.auth-meta {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  font-size: 0.9rem;
}

.auth-remember {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--on-surface-variant);
}

.auth-remember input {
  accent-color: var(--primary-dim);
}

.auth-submit {
  margin-top: 0.25rem;
  width: 100%;
  min-height: 3.7rem;
  border: 0;
  border-radius: 9999px;
  background: var(--primary-container);
  color: var(--on-primary);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    filter 0.2s ease;
}

.auth-submit:hover {
  filter: brightness(1.03);
}

.auth-submit:disabled {
  cursor: not-allowed;
  opacity: 0.72;
}

.auth-divider {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1rem;
  align-items: center;
  margin: 1.5rem 0 1.25rem;
  color: rgba(215, 195, 182, 0.55);
}

.auth-divider span {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}

.auth-divider p {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  font-weight: 700;
}

.social-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.social-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  min-height: 3rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  color: var(--on-surface);
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.social-button:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 183, 125, 0.2);
}

.auth-switch {
  margin: 1.5rem 0 0;
  text-align: center;
  color: var(--on-surface-variant);
}

.auth-switch a {
  font-weight: 700;
}

.auth-footer {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
  align-items: center;
  width: min(74rem, calc(100% - 2rem));
  margin: 0 auto;
  padding: 1.5rem 0 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.auth-footer p {
  margin: 0.35rem 0 0;
  color: var(--on-surface-variant);
  max-width: 32rem;
}

@media (max-width: 960px) {
  .auth-shell {
    grid-template-columns: 1fr;
    padding-top: 2rem;
  }

  .auth-copy {
    max-width: none;
  }
}

@media (max-width: 640px) {
  .auth-topbar,
  .auth-footer,
  .auth-shell {
    width: min(100% - 1rem, 74rem);
  }

  .auth-card {
    padding: 1.25rem;
  }

  .social-grid {
    grid-template-columns: 1fr;
  }

  .auth-meta {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
