/**
 * LoginPage — Component + API Integration Tests
 *
 * Pattern: Create ONE pinia instance, pass to mount plugins AND use it via
 * setActivePinia() so that store imports in the test body share the same instance
 * as the component under test.
 *
 * Network layer: authStore.login is mocked directly on the store instance.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import LoginPage from '@/modules/auth/pages/LoginPage.vue'
import { useAuthStore } from '@/modules/auth/store/authStore'
import { useToastStore } from '@/shared/store/toastStore'


// ── Helpers ────────────────────────────────────────────────────────────────

function makeRouter() {
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

/**
 * Mount LoginPage with a shared pinia so the component and tests
 * interact with the SAME store instance.
 */
async function mountLoginPage() {
  const pinia = createPinia()
  setActivePinia(pinia)

  const router = makeRouter()
  await router.push('/login')
  await router.isReady()

  const wrapper = mount(LoginPage, {
    global: {
      plugins: [router, pinia],
      stubs: { PublicNavbar: { template: '<nav />' } },
    },
  })

  // Stores are now backed by the same pinia instance
  const authStore = useAuthStore()
  const toastStore = useToastStore()

  return { wrapper, router, authStore, toastStore }
}

// ── Test Suite ─────────────────────────────────────────────────────────────

describe('LoginPage — component + API integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  // ── 1. Successful login → redirect to dashboard ────────────────────────

  it('calls authStore.login with the entered credentials', async () => {
    const { wrapper, authStore } = await mountLoginPage()
    authStore.login = vi.fn().mockResolvedValue({})

    await wrapper.find('input[type="email"]').setValue('user@example.com')
    await wrapper.find('input[type="password"]').setValue('secret123')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(authStore.login).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'secret123',
    })
  })

  it('navigates to /dashboard on successful login without MFA', async () => {
    const { wrapper, router, authStore } = await mountLoginPage()
    authStore.login = vi.fn().mockResolvedValue({})
    authStore.mfaRequired = false

    await wrapper.find('input[type="email"]').setValue('user@example.com')
    await wrapper.find('input[type="password"]').setValue('password')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('dashboard')
  })

  // ── 2. MFA required → redirect to /auth/mfa ───────────────────────────

  it('navigates to /auth/mfa when MFA is required', async () => {
    const { wrapper, router, authStore } = await mountLoginPage()
    authStore.login = vi.fn().mockImplementation(async () => {
      authStore.mfaRequired = true
    })

    await wrapper.find('input[type="email"]').setValue('mfa@example.com')
    await wrapper.find('input[type="password"]').setValue('password')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('mfa')
  })

  // ── 3. API error → show error toast ───────────────────────────────────

  it('shows error toast when API returns 401', async () => {
    const { wrapper, authStore, toastStore } = await mountLoginPage()
    authStore.login = vi.fn().mockRejectedValue({
      response: { status: 401, data: { message: 'Invalid credentials' } },
    })
    toastStore.addToast = vi.fn()

    await wrapper.find('input[type="email"]').setValue('bad@example.com')
    await wrapper.find('input[type="password"]').setValue('wrong')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(toastStore.addToast).toHaveBeenCalledWith('Invalid credentials', 'error')
  })

  it('shows generic error message when API error has no message', async () => {
    const { wrapper, authStore, toastStore } = await mountLoginPage()
    authStore.login = vi.fn().mockRejectedValue(new Error('Network Error'))
    toastStore.addToast = vi.fn()

    await wrapper.find('input[type="email"]').setValue('bad@example.com')
    await wrapper.find('input[type="password"]').setValue('wrong')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(toastStore.addToast).toHaveBeenCalledWith('Authentication failed', 'error')
  })

  // ── 4. Loading state resets after API call ─────────────────────────────

  it('resets loading state to false after a successful login', async () => {
    const { wrapper, authStore } = await mountLoginPage()
    authStore.login = vi.fn().mockResolvedValue({})

    await wrapper.find('input[type="email"]').setValue('u@e.com')
    await wrapper.find('input[type="password"]').setValue('pw')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.find('button[type="submit"]').text()).not.toContain('Authenticating')
  })

  it('resets loading state to false after a failed login', async () => {
    const { wrapper, authStore } = await mountLoginPage()
    authStore.login = vi.fn().mockRejectedValue({ response: { data: {} } })

    await wrapper.find('input[type="email"]').setValue('u@e.com')
    await wrapper.find('input[type="password"]').setValue('pw')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    const btn = wrapper.find('button[type="submit"]')
    expect((btn.element as HTMLButtonElement).disabled).toBe(false)
  })

  // ── 5. Welcome toast on success ─────────────────────────────────────────

  it('shows welcome toast after successful login', async () => {
    const { wrapper, authStore, toastStore } = await mountLoginPage()
    authStore.login = vi.fn().mockResolvedValue({})
    authStore.mfaRequired = false
    toastStore.addToast = vi.fn()

    await wrapper.find('input[type="email"]').setValue('u@e.com')
    await wrapper.find('input[type="password"]').setValue('pw')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(toastStore.addToast).toHaveBeenCalledWith(
      expect.stringContaining('Welcome'),
      'success',
    )
  })
})
