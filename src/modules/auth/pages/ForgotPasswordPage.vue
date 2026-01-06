<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/modules/auth/store/authStore'
import { useToastStore } from '@/shared/store/toastStore'

const authStore = useAuthStore()
const toastStore = useToastStore()

const email = ref('')
const isLoading = ref(false)
const isSubmitted = ref(false)

const handleReset = async (e: Event) => {
    e.preventDefault()
    isLoading.value = true

    try {
        await authStore.forgotPassword({ email: email.value })
        isSubmitted.value = true
        toastStore.addToast('Reset instructions sent to your email!', 'success')
    } catch (error: any) {
        toastStore.addToast(error.response?.data?.message || 'Failed to send reset link', 'error')
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <div class="auth-container">
        <div class="w-full max-w-md">
            <div class="auth-card space-y-6">
                <div class="text-center">
                    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Forgot password</h1>
                    <p class="text-sm text-gray-500 mt-2">Enter the email address associated with your account</p>
                </div>

                <div v-if="isSubmitted" class="space-y-6">
                    <div
                        class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-sm">
                        <p class="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                            Instructions for resetting your password have been sent to <strong>{{ email }}</strong>.
                            Please check your email.
                        </p>
                    </div>
                    <router-link to="/login" class="btn-aws-primary w-full py-2.5 block text-center">
                        Back to sign in
                    </router-link>
                </div>

                <form v-else @submit="handleReset" class="space-y-4">
                    <div>
                        <label class="aws-label">Email address</label>
                        <input v-model="email" type="email" class="aws-input" placeholder="user@example.com" required>
                    </div>

                    <button type="submit" :disabled="isLoading"
                        class="btn-aws-primary w-full py-2.5 mt-2 flex items-center justify-center gap-2">
                        <svg v-if="isLoading" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                            </path>
                        </svg>
                        {{ isLoading ? 'Sending...' : 'Send reset link' }}
                    </button>

                    <div class="pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                            Remember your password?
                            <router-link to="/login" class="text-[var(--aws-blue)] font-bold hover:underline ml-1">Sign
                                In</router-link>
                        </p>
                    </div>
                </form>
            </div>

            <div class="mt-8 text-center text-[10px] text-gray-400 uppercase tracking-widest font-medium">
                &copy; 2026 Serwin Technologies or its affiliates.
            </div>
        </div>
    </div>
</template>
