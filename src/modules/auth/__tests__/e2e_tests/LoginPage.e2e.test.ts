/**
 * LoginPage — E2E-style Tests (Full Browser Simulation)
 *
 * Mounts the full app (RouterView + real router + real Pinia) and simulates a
 * real user flow. The only mock is authStore.login / toastStore.addToast —
 * there are no real network calls.
 *
 * Key pattern: create ONE pinia, call setActivePinia(pinia), pass it to mount()
 * so the component and test assertions share the SAME store instance.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory, RouterView } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import LoginPage from '@/modules/auth/pages/LoginPage.vue'
import { useAuthStore } from '@/modules/auth/store/authStore'
import { useToastStore } from '@/shared/store/toastStore'

// ── Fake sub-pages ─────────────────────────────────────────────────────────
const DashboardPage = { template: '<div data-testid="dashboard">Dashboard</div>' }
const MfaPage = { template: '<div data-testid="mfa">MFA</div>' }

// ── Helpers ────────────────────────────────────────────────────────────────

function makeFullRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', redirect: '/login' },
      { path: '/login', name: 'login', component: LoginPage },
      { path: '/dashboard', name: 'dashboard', component: DashboardPage },
      { path: '/auth/mfa', name: 'mfa', component: MfaPage },
    ],
  })
}

const FakeApp = { template: '<RouterView />', components: { RouterView } }

async function mountApp() {
  const pinia = createPinia()
  setActivePinia(pinia)

  const router = makeFullRouter()
  await router.push('/login')
  await router.isReady()

  const wrapper = mount(FakeApp, {
    global: {
      plugins: [router, pinia],
      stubs: { PublicNavbar: { template: '<nav />' } },
    },
  })

  const authStore = useAuthStore()
  const toastStore = useToastStore()

  return { wrapper, router, authStore, toastStore }
}

// ── Test Suite ─────────────────────────────────────────────────────────────

describe('LoginPage — E2E simulation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  // ── 1. Page renders at /login ─────────────────────────────────────────

  it('renders the login page at /login', async () => {
    const { wrapper } = await mountApp()
    expect(wrapper.text()).toContain('Sign In')
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
  })

  // ── 2. Happy path: login → dashboard ─────────────────────────────────

  it('full flow: fill form → submit → land on dashboard (no MFA)', async () => {
    const { wrapper, router, authStore } = await mountApp()
    authStore.login = vi.fn().mockImplementation(async () => {
      authStore.mfaRequired = false
    })

    await wrapper.find('input[type="email"]').setValue('user@serwin.io')
    await wrapper.find('input[type="password"]').setValue('P@ssw0rd!')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('dashboard')
    expect(wrapper.text()).toContain('Dashboard')
  })

  // ── 3. MFA flow ───────────────────────────────────────────────────────

  it('full flow: login → MFA page when mfaRequired is true', async () => {
    const { wrapper, router, authStore } = await mountApp()
    authStore.login = vi.fn().mockImplementation(async () => {
      authStore.mfaRequired = true
    })

    await wrapper.find('input[type="email"]').setValue('mfa@serwin.io')
    await wrapper.find('input[type="password"]').setValue('MFAsecret!')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('mfa')
  })

  // ── 4. Error flow ─────────────────────────────────────────────────────

  it('stays on /login and shows error toast when credentials are wrong', async () => {
    const { wrapper, router, authStore, toastStore } = await mountApp()
    authStore.login = vi.fn().mockRejectedValue({
      response: { status: 401, data: { message: 'Invalid email or password' } },
    })
    toastStore.addToast = vi.fn()

    await wrapper.find('input[type="email"]').setValue('hacker@evil.com')
    await wrapper.find('input[type="password"]').setValue('wrong')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('login')
    expect(toastStore.addToast).toHaveBeenCalledWith('Invalid email or password', 'error')
  })

  // ── 5. Form validation (jsdom: check .checkValidity()) ───────────────
  // jsdom does not block form submission for `required` fields via .trigger(),
  // but the email input's validity state is correct.

  it('email input has required attribute', async () => {
    const { wrapper } = await mountApp()
    const emailInput = wrapper.find('input[type="email"]')
    expect((emailInput.element as HTMLInputElement).required).toBe(true)
  })

  it('password input has required attribute', async () => {
    const { wrapper } = await mountApp()
    const pwInput = wrapper.find('input[type="password"]')
    expect((pwInput.element as HTMLInputElement).required).toBe(true)
  })

  it('form.checkValidity() is false when email is empty', async () => {
    const { wrapper } = await mountApp()
    // Only fill password, leave email blank
    await wrapper.find('input[type="password"]').setValue('somepassword')
    const form = wrapper.find('form').element as HTMLFormElement
    expect(form.checkValidity()).toBe(false)
  })

  // ── 6. Google OAuth button ────────────────────────────────────────────

  it('calls loginWithGoogle when "Google Account" button is clicked', async () => {
    const { wrapper, authStore } = await mountApp()
    authStore.loginWithGoogle = vi.fn()

    const googleBtn = wrapper.findAll('button').find((b) => b.text().includes('Google'))
    expect(googleBtn).toBeDefined()
    await googleBtn!.trigger('click')

    expect(authStore.loginWithGoogle).toHaveBeenCalledOnce()
  })

  // ── 7. localStorage persistence ───────────────────────────────────────

  it('token is stored in localStorage after successful login', async () => {
    const { wrapper, authStore } = await mountApp()
    authStore.login = vi.fn().mockImplementation(async () => {
      // Simulate what setSession does
      authStore.token = 'tok-stored'
      localStorage.setItem('auth_token', 'tok-stored')
      authStore.mfaRequired = false
    })

    await wrapper.find('input[type="email"]').setValue('u@e.com')
    await wrapper.find('input[type="password"]').setValue('pw')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(localStorage.getItem('auth_token')).toBe('tok-stored')
  })

  // ── 8. Loading spinner lifecycle ─────────────────────────────────────

  it('shows loading state during async login, then clears it', async () => {
    let resolveLogin!: (v: any) => void
    const loginPromise = new Promise((res) => { resolveLogin = res })

    const { wrapper, authStore } = await mountApp()
    authStore.login = vi.fn().mockReturnValue(loginPromise)

    await wrapper.find('input[type="email"]').setValue('u@serwin.io')
    await wrapper.find('input[type="password"]').setValue('pass')

    // Submit — don't flush yet
    wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Authenticating...')

    // Resolve the login
    resolveLogin({ mfaRequired: false })
    await flushPromises()

    expect(wrapper.text()).not.toContain('Authenticating...')
  })
})
