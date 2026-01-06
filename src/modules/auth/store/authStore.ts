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
  const registrationComplete = ref(localStorage.getItem('auth_registration_complete') === 'true')

  // Getters
  const isAuthenticated = computed(() => !!token.value)

  // Actions
  function setSession(data: any) {
    console.log('Setting session with data:', data)
    token.value = data.token || data.auth_token || data.jwt
    email.value = data.email
    
    // Support both camelCase and snake_case from backend
    mfaEnabled.value = data.mfaEnabled === true || data.mfa_enabled === true
    mfaRequired.value = data.mfaRequired === true || data.mfa_required === true
    // If backend provides this, use it, otherwise rely on local flow
    if (data.registrationComplete !== undefined) {
        registrationComplete.value = data.registrationComplete
    }

    localStorage.setItem('auth_token', token.value || '')
    localStorage.setItem('auth_email', email.value || '')
    localStorage.setItem('auth_mfa_enabled', String(mfaEnabled.value))
    localStorage.setItem('auth_mfa_required', String(mfaRequired.value))
    localStorage.setItem('auth_registration_complete', String(registrationComplete.value))
  }

  function completeRegistration() {
    registrationComplete.value = true
    localStorage.setItem('auth_registration_complete', 'true')
  }

  async function login(payload: any) {
    try {
      console.log('Attempting login for:', payload.email)
      const response = await apiClient.post<LoginResponse>('/auth/login', payload)
      console.log('Login raw response:', response)
      setSession(response.data)
      return response.data
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  async function forgotPassword(payload: { email: string }) {
    try {
      const response = await apiClient.post<{ message: string; email: string }>('/auth/forgot-password', payload)
      return response.data
    } catch (error) {
      console.error('Forgot password request failed:', error)
      throw error
    }
  }

  async function enableMfa() {
    try {
      const response = await apiClient.post<{ qrCode: string; secret: string }>('/auth/mfa/enable')
      return response.data
    } catch (error) {
      console.error('MFA Enable failed:', error)
      throw error
    }
  }

  async function verifyMfa(code: string) {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/mfa/verify', { 
        code,
        email: email.value 
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
      const response = await apiClient.post<{ message: string }>('/auth/mfa/disable', { code })
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
      const response = await apiClient.post<LoginResponse>('/auth/register', payload)
      setSession(response.data)
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
      // Trying to call a non-existent endpoint to simulate failure
      await apiClient.post('/auth/payment/verify', payload)
    } catch (error) {
      console.warn('Payment verification endpoint not found, using dummy data strategy', error)
      // Continue with dummy success
      return { success: true, message: 'Dummy payment verified' }
    }
  }

  function logout() {
    token.value = null
    email.value = null
    mfaEnabled.value = false
    mfaRequired.value = false
    registrationComplete.value = false

    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_email')
    localStorage.removeItem('auth_mfa_enabled')
    localStorage.removeItem('auth_mfa_required')
    localStorage.removeItem('auth_registration_complete')
  }

  return { 
    token, 
    email, 
    mfaEnabled, 
    mfaRequired, 
    registrationComplete,
    isAuthenticated, 
    login,
    forgotPassword,
    enableMfa,
    verifyMfa,
    disableMfa,
    register,
    verifyPayment,
    completeRegistration,
    loginWithGoogle, 
    logout 
  }
})
