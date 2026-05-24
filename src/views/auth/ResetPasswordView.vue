<template>
  <div class="auth-page auth-page--reset">
    <div class="auth-page__ambient auth-page__ambient--primary"></div>
    <div class="auth-page__ambient auth-page__ambient--secondary"></div>

    <header class="auth-topbar glass-panel">
      <div class="auth-topbar__brand">Talent-Gate</div>
      <nav class="auth-topbar__links" aria-label="Primary">
        <RouterLink to="/login">Sign In</RouterLink>
        <RouterLink to="/register">Register</RouterLink>
      </nav>
    </header>

    <main class="auth-shell">
      <section class="auth-copy">
        <p class="auth-kicker">Password Reset</p>
        <h1>Set a fresh password and get back to work.</h1>
        <p class="auth-summary">
          Use the email address from your secure reset link, choose a new
          password, and return to Talent-Gate.
        </p>

        <div class="auth-feature glass-panel">
          <div class="auth-feature__icon">
            <span class="material-symbols-outlined">verified_user</span>
          </div>
          <div>
            <p class="auth-feature__title">Token-based recovery</p>
            <p class="auth-feature__text">
              This form only works with a valid reset token and the matching
              account email.
            </p>
          </div>
        </div>
      </section>

      <section class="auth-card glass-panel glass-panel--glow">
        <div class="auth-card__header">
          <h2>Set New Password</h2>
          <p>Please enter a new password to restore access to your account.</p>
        </div>

        <p v-if="message" class="auth-alert" :class="messageKindClass">
          {{ message }}
        </p>

        <form class="auth-form" @submit.prevent="onSubmit">
          <label class="auth-field">
            <span>Email Address</span>
            <div class="auth-input-wrap auth-input-wrap--readonly">
              <span class="material-symbols-outlined auth-input-icon"
                >mail</span
              >
              <input v-model="email" type="email" readonly />
            </div>
          </label>

          <label class="auth-field">
            <span>New Password</span>
            <div class="auth-input-wrap">
              <span class="material-symbols-outlined auth-input-icon"
                >lock</span
              >
              <input
                v-model="password"
                type="password"
                autocomplete="new-password"
                placeholder="••••••••••••"
                required
              />
            </div>
          </label>

          <label class="auth-field">
            <span>Confirm Password</span>
            <div class="auth-input-wrap">
              <span class="material-symbols-outlined auth-input-icon"
                >lock_reset</span
              >
              <input
                v-model="passwordConfirmation"
                type="password"
                autocomplete="new-password"
                placeholder="••••••••••••"
                required
              />
            </div>
          </label>

          <div class="auth-hint">
            <h3>Password Requirements</h3>
            <ul>
              <li>At least 8 characters</li>
              <li>Includes a number and a special character</li>
              <li>Use a password you have not reused elsewhere</li>
            </ul>
          </div>

          <button class="auth-submit" type="submit" :disabled="loading">
            {{ loading ? "Updating..." : "Update Password" }}
          </button>
        </form>

        <p class="auth-switch auth-switch--register">
          Return to sign in
          <RouterLink to="/login">Login</RouterLink>
        </p>
      </section>
    </main>

    <footer class="auth-footer">
      <div>
        <h3>Talent-Gate</h3>
        <p>Secure account recovery for candidates and employers.</p>
      </div>
      <div class="auth-footer__links">
        <RouterLink to="/login">Sign In</RouterLink>
        <RouterLink to="/register">Register</RouterLink>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import * as authApi from "@/api/auth";

const route = useRoute();
const router = useRouter();

const token = computed(() =>
  typeof route.query.token === "string" ? route.query.token : "",
);
const email = ref(
  typeof route.query.email === "string" ? route.query.email : "",
);
const password = ref("");
const passwordConfirmation = ref("");
const loading = ref(false);
const message = ref<string | null>(null);
const messageKind = ref<"success" | "error" | null>(null);

const messageKindClass = computed(() => {
  return messageKind.value === "success"
    ? "auth-alert--success"
    : "auth-alert--error";
});

async function onSubmit() {
  if (!token.value) {
    messageKind.value = "error";
    message.value = "Invalid reset link.";
    return;
  }

  loading.value = true;
  message.value = null;
  messageKind.value = null;

  try {
    await authApi.resetPassword({
      token: token.value,
      email: email.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    });

    messageKind.value = "success";
    message.value = "Password updated successfully. Redirecting to login...";

    setTimeout(() => {
      router.push("/login");
    }, 2000);
  } catch (error: any) {
    messageKind.value = "error";
    message.value =
      error?.response?.data?.message ?? "Reset failed. Please try again.";
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
  max-width: 80rem;
  margin: 0 auto;
  padding: 3rem 1.25rem 2rem;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
  gap: 2rem;
  align-items: center;
}

.auth-copy {
  display: grid;
  gap: 1.25rem;
}

.auth-kicker {
  color: var(--primary-fixed-dim);
  text-transform: uppercase;
  letter-spacing: 0.24em;
  font-size: 0.75rem;
  font-weight: 700;
}

.auth-copy h1 {
  font-family: var(--font-display);
  font-size: clamp(2.75rem, 5vw, 5rem);
  line-height: 1.02;
  letter-spacing: -0.04em;
  max-width: 12ch;
}

.auth-summary {
  color: var(--on-surface-variant);
  font-size: 1.05rem;
  line-height: 1.7;
  max-width: 40rem;
}

.auth-feature {
  max-width: 34rem;
  padding: 1.25rem;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem;
  align-items: start;
}

.auth-feature__icon {
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  display: grid;
  place-items: center;
  background: rgba(255, 183, 125, 0.1);
  color: var(--primary-fixed-dim);
}

.auth-feature__title {
  color: var(--bone-white);
  font-weight: 600;
}

.auth-feature__text {
  margin-top: 0.25rem;
  color: var(--on-surface-variant);
  line-height: 1.6;
}

.auth-card {
  padding: 2rem;
}

.auth-card__header {
  display: grid;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.auth-card__header h2 {
  font-family: var(--font-display);
  font-size: 1.85rem;
  color: var(--bone-white);
}

.auth-card__header p {
  color: var(--on-surface-variant);
}

.auth-alert {
  margin-bottom: 1rem;
  padding: 0.9rem 1rem;
  border-radius: 1rem;
  border: 1px solid transparent;
}

.auth-alert--success {
  color: #d6f5dc;
  background: rgba(22, 163, 74, 0.12);
  border-color: rgba(22, 163, 74, 0.2);
}

.auth-alert--error {
  color: #ffd6d2;
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.2);
}

.auth-form {
  display: grid;
  gap: 1.1rem;
}

.auth-field {
  display: grid;
  gap: 0.5rem;
}

.auth-field > span {
  color: var(--on-surface-variant);
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 700;
}

.auth-input-wrap {
  position: relative;
}

.auth-input-wrap--readonly {
  opacity: 0.75;
}

.auth-input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--on-surface-variant);
}

.auth-input-wrap input {
  width: 100%;
  min-height: 3.35rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.05);
  padding: 0.95rem 1rem 0.95rem 3rem;
  color: var(--bone-white);
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.auth-input-wrap input[readonly] {
  cursor: not-allowed;
}

.auth-input-wrap input::placeholder {
  color: rgba(229, 229, 225, 0.45);
}

.auth-input-wrap input:focus {
  border-color: rgba(255, 183, 125, 0.55);
  box-shadow: 0 0 0 4px rgba(255, 183, 125, 0.12);
  background: rgba(255, 255, 255, 0.07);
}

.auth-hint {
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.03);
  padding: 1rem 1.1rem;
}

.auth-hint h3 {
  color: var(--primary-fixed-dim);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
  margin-bottom: 0.75rem;
}

.auth-hint ul {
  display: grid;
  gap: 0.45rem;
  color: var(--on-surface-variant);
  list-style: disc;
  padding-left: 1.1rem;
}

.auth-submit {
  margin-top: 0.25rem;
  min-height: 3.4rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 220, 195, 0.15);
  background: linear-gradient(135deg, var(--primary-fixed), #ffd0a7);
  color: var(--on-primary);
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

.auth-submit:hover:not(:disabled) {
  box-shadow: 0 0 30px rgba(255, 183, 125, 0.15);
  transform: translateY(-1px);
}

.auth-submit:disabled {
  opacity: 0.7;
  cursor: progress;
}

.auth-switch {
  margin-top: 1.5rem;
  color: var(--on-surface-variant);
  text-align: center;
}

.auth-switch a {
  color: var(--primary-fixed-dim);
  font-weight: 700;
}

.auth-footer {
  position: relative;
  z-index: 1;
  max-width: 80rem;
  margin: 0 auto;
  padding: 1.5rem 1.25rem 2rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.auth-footer p {
  margin-top: 0.35rem;
  color: var(--on-surface-variant);
}

@media (max-width: 900px) {
  .auth-shell {
    grid-template-columns: 1fr;
    padding-top: 2rem;
  }

  .auth-copy h1 {
    max-width: none;
  }
}

@media (max-width: 640px) {
  .auth-topbar,
  .auth-footer {
    padding-inline: 1rem;
  }

  .auth-card {
    padding: 1.25rem;
  }

  .auth-topbar__links,
  .auth-footer__links {
    gap: 1rem;
  }
}
</style>
