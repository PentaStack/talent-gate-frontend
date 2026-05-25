<template>
  <div class="auth-page auth-page--register">
    <div class="auth-page__ambient auth-page__ambient--primary"></div>
    <div class="auth-page__ambient auth-page__ambient--secondary"></div>

    <header class="auth-topbar glass-panel">
      <div class="auth-topbar__brand">Talent-Gate</div>
      <nav class="auth-topbar__links" aria-label="Primary">
        <RouterLink to="/login">Sign In</RouterLink>
        <a href="#support">Support</a>
      </nav>
    </header>

    <main class="auth-shell auth-shell--register">
      <section class="auth-copy auth-copy--register">
        <p class="auth-kicker">Future of Recruitment</p>
        <h1>Assemble your technical core.</h1>
        <p class="auth-summary">
          Build a high-performance profile for candidate or employer access and
          join the Talent-Gate network.
        </p>

        <div class="auth-feature glass-panel">
          <div class="auth-feature__icon">
            <span class="material-symbols-outlined">verified_user</span>
          </div>
          <div>
            <p class="auth-feature__title">Role-aware onboarding</p>
            <p class="auth-feature__text">
              Set up your account for hiring workflows or candidate matching
              from the start.
            </p>
          </div>
        </div>
      </section>

      <section class="auth-card glass-panel glass-panel--glow">
        <div class="auth-card__header">
          <h2>Create Account</h2>
          <p>Begin your technical journey.</p>
        </div>

        <div class="role-grid" aria-label="Account type">
          <button
            type="button"
            class="role-card"
            :class="{ 'role-card--active': role === 'candidate' }"
            @click="role = 'candidate'"
          >
            <span class="material-symbols-outlined">person_search</span>
            <span>Candidate</span>
          </button>
          <button
            type="button"
            class="role-card"
            :class="{ 'role-card--active': role === 'employer' }"
            @click="role = 'employer'"
          >
            <span class="material-symbols-outlined">corporate_fare</span>
            <span>Employer</span>
          </button>
        </div>

        <form class="auth-form" @submit.prevent="onSubmit">
          <label class="auth-field">
            <span>Full Name</span>
            <div class="auth-input-wrap">
              <span class="material-symbols-outlined auth-input-icon"
                >person</span
              >
              <input
                v-model.trim="form.name"
                type="text"
                placeholder="Janus Cyber"
                autocomplete="name"
                required
              />
            </div>
            <small v-if="errors.name?.[0]" class="field-error">{{
              errors.name[0]
            }}</small>
          </label>

          <label class="auth-field">
            <span>Work Email</span>
            <div class="auth-input-wrap">
              <span class="material-symbols-outlined auth-input-icon"
                >alternate_email</span
              >
              <input
                v-model.trim="form.email"
                type="email"
                placeholder="janus@Talent-Gate.io"
                autocomplete="email"
                required
              />
            </div>
            <small v-if="errors.email?.[0]" class="field-error">{{
              errors.email[0]
            }}</small>
          </label>

          <label class="auth-field">
            <span>Password</span>
            <div class="auth-input-wrap">
              <span class="material-symbols-outlined auth-input-icon"
                >lock</span
              >
              <input
                v-model="form.password"
                type="password"
                placeholder="••••••••••••"
                autocomplete="new-password"
                required
              />
            </div>
            <small v-if="errors.password?.[0]" class="field-error">{{
              errors.password[0]
            }}</small>
            <small class="field-hint"
              >Use At least 8 characters with a mix of symbols.</small
            >
          </label>

          <label class="auth-field">
            <span>Confirm Password</span>
            <div class="auth-input-wrap">
              <span class="material-symbols-outlined auth-input-icon"
                >lock_reset</span
              >
              <input
                v-model="form.password_confirmation"
                type="password"
                placeholder="Repeat password"
                autocomplete="new-password"
                required
              />
            </div>
          </label>

          <button class="auth-submit" type="submit" :disabled="loading">
            {{ loading ? "Creating..." : "Create Account" }}
          </button>
        </form>

        <p class="auth-switch auth-switch--register">
          Already have an account?
          <RouterLink to="/login">Log in</RouterLink>
        </p>
      </section>
    </main>

    <footer class="auth-footer">
      <div>
        <h3>Talent-Gate</h3>
        <p>The premium technical talent layer built for focused hiring.</p>
      </div>
      <div id="support" class="auth-footer__links">
        <a href="#">About</a>
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import * as authApi from "@/api/auth";

const router = useRouter();

const role = ref<"employer" | "candidate">("candidate");
const loading = ref(false);
const errors = reactive<Record<string, string[]>>({});

const form = reactive({
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
});

function clearErrors() {
  for (const key of Object.keys(errors)) {
    delete errors[key];
  }
}

async function onSubmit() {
  loading.value = true;
  clearErrors();

  try {
    await authApi.register({ ...form, role: role.value });
    await router.push({
      name: "login",
      query: { registered: "1", verify: "required", email: form.email },
    });
  } catch (error: any) {
    if (error?.response?.status === 422) {
      Object.assign(errors, error.response.data.errors);
      return;
    }
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
  width: 36rem;
  height: 36rem;
  border-radius: 9999px;
  filter: blur(120px);
  pointer-events: none;
}

.auth-page__ambient--primary {
  top: -8rem;
  right: -8rem;
  background: rgba(255, 183, 125, 0.08);
}

.auth-page__ambient--secondary {
  left: -8rem;
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

.auth-shell--register {
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
}

.auth-copy {
  display: grid;
  gap: 1.25rem;
  max-width: 36rem;
}

.auth-copy h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(3rem, 6vw, 5.25rem);
  line-height: 0.98;
  letter-spacing: -0.03em;
}

.auth-kicker {
  margin: 0;
  color: var(--primary-dim);
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.75rem;
  font-weight: 700;
}

.auth-summary {
  margin: 0;
  max-width: 33rem;
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

.role-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin: 1.5rem 0 1rem;
}

.role-card {
  display: grid;
  gap: 0.45rem;
  place-items: center;
  padding: 1rem;
  border-radius: 1rem;
  border: 1px solid var(--border-subtle);
  background: rgba(255, 255, 255, 0.04);
  color: var(--on-surface-variant);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.role-card--active {
  border-color: rgba(255, 183, 125, 0.6);
  background: rgba(255, 183, 125, 0.1);
  color: var(--primary);
  box-shadow: 0 0 16px rgba(255, 183, 125, 0.15);
}

.role-card:active,
.auth-submit:active {
  transform: scale(0.98);
}

.role-card .material-symbols-outlined {
  font-size: 1.3rem;
}

.auth-form {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

.auth-field {
  display: grid;
  gap: 0.45rem;
}

.auth-field > span {
  padding-left: 0.15rem;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--on-surface-variant);
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

.auth-input-wrap input::placeholder {
  color: rgba(215, 195, 182, 0.55);
}

.auth-input-wrap input:focus {
  outline: none;
  border-color: var(--primary-dim);
  box-shadow: 0 0 0 3px rgba(255, 183, 125, 0.15);
}

.field-error {
  color: var(--error);
  font-size: 0.85rem;
}

.field-hint {
  color: var(--on-surface-variant);
  font-size: 0.8rem;
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

.auth-switch {
  margin: 1.25rem 0 0;
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

  .role-grid {
    grid-template-columns: 1fr;
  }
}
</style>
