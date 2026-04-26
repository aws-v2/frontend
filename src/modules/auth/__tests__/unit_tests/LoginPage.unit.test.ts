/**
 * LoginPage — Unit Tests (Component Only)
 *
 * Scope: Pure rendering and DOM-level behaviour.
 * No real network calls; the authStore.login action is fully mocked.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import LoginPage from '@/modules/auth/pages/LoginPage.vue'

// ── Helpers ────────────────────────────────────────────────────────────────

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/login', name: 'login', component: LoginPage },
      { path: '/dashboard', name: 'dashboard', component: { template: '<div />' } },
      { path: '/auth/mfa', name: 'mfa', component: { template: '<div />' } },
    ],
  })
}

async function mountLoginPage() {
  const router = createTestRouter()
  await router.push('/login')
  await router.isReady()

  const wrapper = mount(LoginPage, {
    global: {
      plugins: [router, createPinia()],
      stubs: {
        PublicNavbar: { template: '<nav data-testid="navbar" />' },
      },
    },
  })
  return { wrapper, router }
}

// ── Test Suite ─────────────────────────────────────────────────────────────

describe('LoginPage — unit', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // ── 1. Rendering ──────────────────────────────────────────────────────────

  it('renders the Sign In heading', async () => {
    const { wrapper } = await mountLoginPage()
    expect(wrapper.text()).toContain('Sign In')
  })

  it('renders an email input', async () => {
    const { wrapper } = await mountLoginPage()
    const input = wrapper.find('input[type="email"]')
    expect(input.exists()).toBe(true)
  })

  it('renders a password input', async () => {
    const { wrapper } = await mountLoginPage()
    const input = wrapper.find('input[type="password"]')
    expect(input.exists()).toBe(true)
  })

  it('renders the submit button with "Sign In to Console" text', async () => {
    const { wrapper } = await mountLoginPage()
    const button = wrapper.find('button[type="submit"]')
    expect(button.text()).toContain('Sign In to Console')
  })

  it('renders the "Continue with Google" button', async () => {
    const { wrapper } = await mountLoginPage()
    const buttons = wrapper.findAll('button')
    const googleBtn = buttons.find((b) => b.text().includes('Google'))
    expect(googleBtn).toBeDefined()
  })

  it('renders the "Forgot password?" link', async () => {
    const { wrapper } = await mountLoginPage()
    expect(wrapper.text()).toContain('Forgot')
  })

  it('renders the "Register Now" link', async () => {
    const { wrapper } = await mountLoginPage()
    expect(wrapper.text()).toContain('Register')
  })

  // ── 2. v-model form binding ───────────────────────────────────────────────

  it('updates email reactive ref when user types', async () => {
    const { wrapper } = await mountLoginPage()
    const emailInput = wrapper.find('input[type="email"]')
    await emailInput.setValue('user@example.com')
    // The value should be reflected in the DOM
    expect((emailInput.element as HTMLInputElement).value).toBe('user@example.com')
  })

  it('updates password reactive ref when user types', async () => {
    const { wrapper } = await mountLoginPage()
    const pwInput = wrapper.find('input[type="password"]')
    await pwInput.setValue('secret123')
    expect((pwInput.element as HTMLInputElement).value).toBe('secret123')
  })

  // ── 3. Loading state ──────────────────────────────────────────────────────

  it('shows "Authenticating..." label while loading', async () => {
    // Mock login to never resolve so we can observe the loading state
    const { wrapper } = await mountLoginPage()

    // Access the component's internal store and stub login
    const authStore = (await import('@/modules/auth/store/authStore')).useAuthStore()
    authStore.login = vi.fn(() => new Promise(() => {})) // never resolves

    const emailInput = wrapper.find('input[type="email"]')
    const pwInput = wrapper.find('input[type="password"]')
    await emailInput.setValue('user@example.com')
    await pwInput.setValue('password123')

    const form = wrapper.find('form')
    await form.trigger('submit')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Authenticating...')
  })

  it('disables the submit button while loading', async () => {
    const { wrapper } = await mountLoginPage()
    const authStore = (await import('@/modules/auth/store/authStore')).useAuthStore()
    authStore.login = vi.fn(() => new Promise(() => {}))

    await wrapper.find('input[type="email"]').setValue('user@example.com')
    await wrapper.find('input[type="password"]').setValue('password123')
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()

    const submitButton = wrapper.find('button[type="submit"]')
    expect((submitButton.element as HTMLButtonElement).disabled).toBe(true)
  })

  // ── 4. Footer ─────────────────────────────────────────────────────────────

  it('renders the footer copyright notice', async () => {
    const { wrapper } = await mountLoginPage()
    expect(wrapper.text()).toContain('SERWIN SYSTEMS INC.')
  })
})
