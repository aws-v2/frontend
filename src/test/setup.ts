import { beforeEach, vi } from 'vitest'
import { config } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

// ─── Global mocks ───────────────────────────────────────────────────────────

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

// Mock window.location for navigation tests
Object.defineProperty(globalThis, 'location', {
  value: { href: '', assign: vi.fn() },
  writable: true,
})

// ─── Vue Test Utils global defaults ─────────────────────────────────────────
config.global.stubs = {
  // Stub router-link so we don't need a real router in every test
  RouterLink: { template: '<a><slot /></a>' },
  // Stub PublicNavbar to keep tests focused on LoginPage logic
  PublicNavbar: { template: '<nav />' },
}

// ─── Per-test setup ──────────────────────────────────────────────────────────
beforeEach(() => {
  // Fresh Pinia instance for each test – prevents store state bleeding
  setActivePinia(createPinia())
  // Clear localStorage and mocks
  localStorageMock.clear()
  vi.clearAllMocks()
})
