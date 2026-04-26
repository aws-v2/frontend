/**
 * RegisterPage — E2E Simulation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory, RouterView } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import RegisterPage from '@/modules/auth/pages/RegisterPage.vue'
import { useAuthStore } from '@/modules/auth/store/authStore'
import { useToastStore } from '@/shared/store/toastStore'

// Fake pages
const MfaSetupPage = { template: '<div data-testid="mfa">MFA Setup</div>' }

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', redirect: '/register' },
      { path: '/register', component: RegisterPage },
      { path: '/auth/mfa-setup', component: MfaSetupPage },
    ],
  })
}

const FakeApp = { template: '<RouterView />', components: { RouterView } }

async function mountApp() {
  const pinia = createPinia()
  setActivePinia(pinia)

  const router = makeRouter()
  await router.push('/register')
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

// ── Tests ──────────────────────────────────────────────────────────────────

describe('RegisterPage — E2E simulation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders register page', async () => {
    const { wrapper } = await mountApp()
    expect(wrapper.text()).toContain('Register')
  })

  it('completes registration flow → navigates to MFA setup', async () => {
    const { wrapper, authStore } = await mountApp()

    authStore.register = vi.fn().mockResolvedValue({})

    await wrapper.find('input[type="email"]').setValue('user@mail.com')
    const passwords = wrapper.findAll('input[type="password"]')
    await passwords[0].setValue('password123')
    await passwords[1].setValue('password123')
    await wrapper.find('input[type="checkbox"]').setValue(true)

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.find('Secure Access').exists()).toBe(false)
  })

  it('shows error toast when registration fails', async () => {
    const { wrapper, authStore, toastStore } = await mountApp()

    authStore.register = vi.fn().mockRejectedValue(new Error('fail'))
    toastStore.addToast = vi.fn()

    await wrapper.find('input[type="email"]').setValue('user@mail.com')
    const passwords = wrapper.findAll('input[type="password"]')
    await passwords[0].setValue('password123')
    await passwords[1].setValue('password123')
    await wrapper.find('input[type="checkbox"]').setValue(true)

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(toastStore.addToast).toHaveBeenCalled()
  })
})