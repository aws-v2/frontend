<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/authStore'
import { useToastStore } from '@/shared/store/toastStore'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

const email = ref('')
const password = ref('')
const isLoading = ref(false)

const handleLogin = async (e: Event) => {
    e.preventDefault()
    isLoading.value = true

    try {
        const response = await authStore.login({
            email: email.value,
            password: password.value
        })

        toastStore.addToast('Successfully authenticated!', 'success')

        // Conditional Redirection Logic
        if (!response.mfaEnabled) {
            // New user or MFA not set up -> Choice Page
            router.push('/auth/mfa-setup')
        } else if (response.mfaRequired) {
            // MFA is enabled and required for this session -> Verify Page
            router.push('/auth/mfa')
        } else {
            // Already authenticated or MFA not required -> Dashboard
            router.push('/dashboard')
        }
    } catch (error: any) {
        toastStore.addToast(error.response?.data?.message || 'Authentication failed', 'error')
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <div class="min-h-[calc(100vh-88px)] flex items-center justify-center p-6 bg-gray-50 dark:bg-transparent">
        <div class="w-full max-w-md">
            <div class="retro-box p-10 space-y-8 bg-white">
                <div class="text-center space-y-2">
                    <h1 class="text-5xl font-black">Login</h1>
                    <p class="font-mono text-sm opacity-60">access_the_console</p>
                </div>

                <form @submit="handleLogin" class="space-y-6">
                    <div>
                        <label class="label-retro">Email Address</label>
                        <input v-model="email" type="email" class="input-retro" placeholder="user@serwin.io" required>
                    </div>

                    <div>
                        <div class="flex justify-between items-baseline">
                            <label class="label-retro">Password</label>
                            <router-link to="/forgot-password"
                                class="text-[10px] font-bold uppercase tracking-widest hover:underline opacity-60">Forgot?</router-link>
                        </div>
                        <input v-model="password" type="password" class="input-retro" placeholder="••••••••" required>
                    </div>

                    <button type="submit" :disabled="isLoading"
                        class="btn-retro-primary w-full py-5 text-xl flex items-center justify-center gap-2">
                        <span v-if="isLoading" class="animate-spin">⟳</span>
                        {{ isLoading ? 'Processing...' : 'Enter System' }}
                    </button>

                    <div class="relative flex items-center py-2">
                        <div class="flex-grow border-t border-black/10 dark:border-white/10"></div>
                        <span
                            class="flex-shrink mx-4 text-[10px] font-mono opacity-40 uppercase tracking-widest">or</span>
                        <div class="flex-grow border-t border-black/10 dark:border-white/10"></div>
                    </div>

                    <button type="button" @click="authStore.loginWithGoogle" class="btn-google">
                        <svg class="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.27.81-.57z" />
                            <path fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Sign in with Google
                    </button>
                </form>

                <div class="pt-6 border-t-2 border-black/10 text-center">
                    <p class="text-sm font-medium">
                        New to Serwin?
                        <router-link to="/register" class="font-black hover:underline ml-1">Create Account</router-link>
                    </p>
                </div>
            </div>

            <div class="mt-8 text-center font-mono text-[10px] uppercase tracking-[0.4em] opacity-40">
                &copy; 2026 Serwin Technologies
            </div>
        </div>
    </div>
</template>
