/**
 * RegisterPage — Component + API Integration Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import RegisterPage from '@/modules/auth/pages/RegisterPage.vue'
import { useAuthStore } from '@/modules/auth/store/authStore'
import { useToastStore } from '@/shared/store/toastStore'

// ── Helpers ────────────────────────────────────────────────────────────────

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/register', name: 'register', component: RegisterPage },
      { path: '/auth/mfa-setup', name: 'mfa-setup', component: { template: '<div />' } },
    ],
  })
}

async function mountRegisterPage() {
  const pinia = createPinia()
  setActivePinia(pinia)

  const router = makeRouter()
  await router.push('/register')
  await router.isReady()

  const wrapper = mount(RegisterPage, {
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

describe('RegisterPage — component + API integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls authStore.register with correct payload', async () => {
    const { wrapper, authStore } = await mountRegisterPage()

    authStore.register = vi.fn().mockResolvedValue({})

    await wrapper.find('input[type="email"]').setValue('test@mail.com')
    const passwords = wrapper.findAll('input[type="password"]')
    await passwords[0].setValue('password123')
    await passwords[1].setValue('password123')

    await wrapper.find('input[type="checkbox"]').setValue(true)

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(authStore.register).toHaveBeenCalledWith({
      email: 'test@mail.com',
      password: 'password123',
      confirmPassword: 'password123',
    })
  })

  it('shows error if passwords do not match', async () => {
    const { wrapper, toastStore } = await mountRegisterPage()

    toastStore.addToast = vi.fn()

    const passwords = wrapper.findAll('input[type="password"]')
    await passwords[0].setValue('a')
    await passwords[1].setValue('b')

    await wrapper.find('form').trigger('submit')

    expect(toastStore.addToast).toHaveBeenCalledWith('Passwords do not match', 'error')
  })

  it('redirects to mfa-setup on success', async () => {
    const { wrapper, authStore, router } = await mountRegisterPage()

    authStore.register = vi.fn().mockResolvedValue({})
    const pushSpy = vi.spyOn(router, 'push')

    await wrapper.find('input[type="email"]').setValue('test@mail.com')
    const passwords = wrapper.findAll('input[type="password"]')
    await passwords[0].setValue('password123')
    await passwords[1].setValue('password123')
    await wrapper.find('input[type="checkbox"]').setValue(true)

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(pushSpy).toHaveBeenCalledWith({ name: 'mfa-setup' })
  })

  it('shows API error message on failure', async () => {
    const { wrapper, authStore, toastStore } = await mountRegisterPage()

    authStore.register = vi.fn().mockRejectedValue({
      response: { data: { message: 'Email already exists' } },
    })

    toastStore.addToast = vi.fn()

    await wrapper.find('input[type="email"]').setValue('test@mail.com')
    const passwords = wrapper.findAll('input[type="password"]')
    await passwords[0].setValue('password123')
    await passwords[1].setValue('password123')
    await wrapper.find('input[type="checkbox"]').setValue(true)

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(toastStore.addToast).toHaveBeenCalledWith('Email already exists', 'error')
  })
})