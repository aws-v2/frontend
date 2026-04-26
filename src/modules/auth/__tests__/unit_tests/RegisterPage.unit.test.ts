/**
 * RegisterPage — Unit Tests (Component Only)
 *
 * Scope: Rendering + DOM behavior only.
 * All store actions are mocked.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import RegisterPage from '@/modules/auth/pages/RegisterPage.vue'

// ── Helpers ────────────────────────────────────────────────────────────────

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/register', name: 'register', component: RegisterPage },
    ],
  })
}

async function mountRegisterPage() {
  const router = createTestRouter()
  await router.push('/register')
  await router.isReady()

  const wrapper = mount(RegisterPage, {
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

describe('RegisterPage — unit', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders the Register heading', async () => {
    const { wrapper } = await mountRegisterPage()
    expect(wrapper.text()).toContain('Register')
  })

  it('renders email input', async () => {
    const { wrapper } = await mountRegisterPage()
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
  })

  it('renders password inputs', async () => {
    const { wrapper } = await mountRegisterPage()
    const inputs = wrapper.findAll('input[type="password"]')
    expect(inputs.length).toBe(2)
  })

  it('renders submit button', async () => {
    const { wrapper } = await mountRegisterPage()
    expect(wrapper.find('button[type="submit"]').text()).toContain('Register Profile')
  })

  it('renders Google signup button', async () => {
    const { wrapper } = await mountRegisterPage()
    const buttons = wrapper.findAll('button')
    const googleBtn = buttons.find(b => b.text().includes('Google'))
    expect(googleBtn).toBeDefined()
  })

  it('renders terms checkbox', async () => {
    const { wrapper } = await mountRegisterPage()
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true)
  })
})