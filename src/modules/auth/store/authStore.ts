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

  // Getters
  const isAuthenticated = computed(() => !!token.value)

  // Actions
  function setSession(data: LoginResponse) {
    token.value = data.token
    email.value = data.email
    mfaEnabled.value = data.mfaEnabled
    mfaRequired.value = data.mfaRequired

    localStorage.setItem('auth_token', data.token)
    localStorage.setItem('auth_email', data.email)
    localStorage.setItem('auth_mfa_enabled', String(data.mfaEnabled))
    localStorage.setItem('auth_mfa_required', String(data.mfaRequired))
  }

  async function login(payload: any) {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', payload)
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

  // MFA Actions (Placeholders for backend implementation)
  async function sendSmsOtp(phoneNumber: string) {
    console.log('Sending SMS OTP to:', phoneNumber)
    // await apiClient.post('/auth/mfa/sms/send', { phoneNumber })
    return { success: true }
  }

  async function verifySmsOtp(otp: string) {
    console.log('Verifying SMS OTP:', otp)
    // const response = await apiClient.post('/auth/mfa/sms/verify', { otp })
    mfaEnabled.value = true
    localStorage.setItem('auth_mfa_enabled', 'true')
    return { success: true }
  }

  async function verifyAppOtp(otp: string) {
    console.log('Verifying App OTP:', otp)
    // const response = await apiClient.post('/auth/mfa/app/verify', { otp })
    mfaEnabled.value = true
    localStorage.setItem('auth_mfa_enabled', 'true')
    return { success: true }
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

  function logout() {
    token.value = null
    email.value = null
    mfaEnabled.value = false
    mfaRequired.value = false

    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_email')
    localStorage.removeItem('auth_mfa_enabled')
    localStorage.removeItem('auth_mfa_required')
  }

  return { 
    token, 
    email, 
    mfaEnabled, 
    mfaRequired, 
    isAuthenticated, 
    login,
    forgotPassword,
    sendSmsOtp,
    verifySmsOtp,
    verifyAppOtp,
    register,
    loginWithGoogle, 
    logout 
  }
})
