import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/shared/api/apiClient'

export interface LoginResponse {
  token: string
  email: string
  mfaEnabled: boolean
  mfaRequired: boolean
  message: string
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const email = ref<string | null>(localStorage.getItem('auth_email'))
  const mfaEnabled = ref(localStorage.getItem('auth_mfa_enabled') === 'true')
  const mfaRequired = ref(localStorage.getItem('auth_mfa_required') === 'true')
  const registrationComplete = ref(false)

  // New State for Three-Step Auth
  const isAuthenticated = ref<boolean | null>(null)
  const user = ref<any>(null)
  const loading = ref(false)
  const emailVerified = computed(() => user.value?.emailVerified || false)

  // Actions
  async function initAuth() {
    console.log('[Auth Store] Initializing authentication state...')

    // Check local storage for existing session
    const savedToken = localStorage.getItem('auth_token')
    const savedEmail = localStorage.getItem('auth_email')

    if (savedToken && savedEmail) {
      token.value = savedToken
      email.value = savedEmail
      mfaEnabled.value = localStorage.getItem('auth_mfa_enabled') === 'true'
      mfaRequired.value = localStorage.getItem('auth_mfa_required') === 'true'
      registrationComplete.value = localStorage.getItem(`auth_reg_complete_${savedEmail}`) === 'true'

      // Mark as authenticated
      isAuthenticated.value = true
      console.log('[Auth Store] Session restored for:', savedEmail)
    } else {
      isAuthenticated.value = false
      console.log('[Auth Store] No session found.')
    }
  }

  function setSession(data: any) {
    console.log('Setting session with data:', data)
    // Support all common token keys
    token.value = data.token || data.accessToken || data.auth_token || data.jwt || data.id_token
    email.value = data.email

    // Support both camelCase and snake_case from backend
    mfaEnabled.value = data.mfaEnabled === true || data.mfa_enabled === true
    mfaRequired.value = data.mfaRequired === true || data.mfa_required === true

    // If backend provides this, use it, otherwise check local storage as fallback
    if (data.registrationComplete !== undefined) {
      registrationComplete.value = data.registrationComplete
    } else if (email.value) {
      registrationComplete.value = localStorage.getItem(`auth_reg_complete_${email.value}`) === 'true'
    }

    localStorage.setItem('auth_token', token.value || '')
    localStorage.setItem('auth_email', email.value || '')
    localStorage.setItem('auth_mfa_enabled', String(mfaEnabled.value))
    localStorage.setItem('auth_mfa_required', String(mfaRequired.value))

    if (email.value && registrationComplete.value) {
      localStorage.setItem(`auth_reg_complete_${email.value}`, 'true')
    }

    // Explicitly update authenticated state
    isAuthenticated.value = !!token.value
  }

  function completeRegistration() {
    registrationComplete.value = true
    if (email.value) {
      localStorage.setItem(`auth_reg_complete_${email.value}`, 'true')
    }
  }

  function skipMfa() {
    mfaRequired.value = false
    localStorage.setItem('auth_mfa_required', 'false')
  }

  async function login(payload: any) {
    try {
      console.log('Attempting login for:', payload.email)
      const response = await apiClient.post<LoginResponse>(`${apiClient.defaults.baseURL}auth/login', payload)
      console.log('Login raw response:', response)
      // Ensure email is preserved if not returned by backend
      setSession({
        ...response.data,
        email: response.data.email || payload.email,
      })
      return response.data
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  async function forgotPassword(payload: { email: string }) {
    try {
      const response = await apiClient.post<{ message: string; email: string }>(
        'auth/forgot-password',
        payload,
      )
      return response.data
    } catch (error) {
      console.error('Forgot password request failed:', error)
      throw error
    }
  }

  async function enableMfa() {
    try {
      const response = await apiClient.post<{ qrCode: string; secret: string }>('auth/mfa/enable')
      return response.data
    } catch (error) {
      console.error('MFA Enable failed:', error)
      throw error
    }
  }

  async function verifyMfa(code: string) {
    try {
      const response = await apiClient.post<LoginResponse>('auth/mfa/verify', {
        code,
        email: email.value,
      })
      setSession(response.data)
      return response.data
    } catch (error) {
      console.error('MFA Verification failed:', error)
      throw error
    }
  }

  async function disableMfa(code: string) {
    try {
      const response = await apiClient.post<{ message: string }>('auth/mfa/disable', { code })
      mfaEnabled.value = false
      localStorage.setItem('auth_mfa_enabled', 'false')
      return response.data
    } catch (error) {
      console.error('MFA Disable failed:', error)
      throw error
    }
  }

  async function register(payload: any) {
    try {
      const response = await apiClient.post<LoginResponse>('auth/register', payload)
      // Ensure email is preserved if not returned by backend
      setSession({
        ...response.data,
        email: response.data.email || payload.email,
      })
      return response.data
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  }

  function loginWithGoogle() {
    console.log('Redirecting to Google OAuth...')
    // window.location.href = `${apiClient.defaults.baseURL}/oauth2/authorization/google`
  }

  async function verifyPayment(payload: any) {
    try {
      const response = await apiClient.post('auth/payment/verify', payload)
      return response.data
    } catch (error) {
      console.error('Payment verification failed:', error)
      throw error
    }
  }

  async function verifyEmail(token: string) {
    try {
      loading.value = true
      const response = await apiClient.get('auth/verify-email', { params: { token } })
      if (user.value) {
        user.value.emailVerified = true
      }
      return response.data
    } catch (error) {
      console.error('Email verification failed:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetchUserProfile() {
    try {
      loading.value = true
      // Simulating real API call
      const response = await apiClient.get('auth/me')
      user.value = response.data
      return response.data
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      // Fallback/Mock for local dev if 404
      user.value = {
        fullName: email.value?.split('@')[0] || 'Member',
        email: email.value,
        organization: 'Serwin Systems Internal',
        joinedAt: '2026-01-15',
        emailVerified: user.value?.emailVerified || false,
        paymentMethod: {
          type: 'Visa',
          last4: '4242',
          expiry: '12/28'
        }
      }
    } finally {
      loading.value = false
    }
  }

  function logout() {
    token.value = null
    email.value = null
    user.value = null
    mfaEnabled.value = false
    mfaRequired.value = false
    registrationComplete.value = false
    isAuthenticated.value = false

    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_email')
    localStorage.removeItem('auth_mfa_enabled')
    localStorage.removeItem('auth_mfa_required')
    // Note: We intentionally DO NOT remove auth_reg_complete_{email} 
    // to remember that this user has completed registration on this device.
  }

  return {
    token,
    email,
    user,
    mfaEnabled,
    mfaRequired,
    registrationComplete,
    isAuthenticated,
    loading,
    emailVerified,
    initAuth,
    fetchUserProfile,
    login,
    forgotPassword,
    enableMfa,
    verifyMfa,
    disableMfa,
    register,
    verifyPayment,
    verifyEmail,
    completeRegistration,
    skipMfa,
    loginWithGoogle,
    logout,
  }
})
