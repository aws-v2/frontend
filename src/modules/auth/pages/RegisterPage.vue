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
const confirmPassword = ref('')
const isLoading = ref(false)

const handleRegister = async (e: Event) => {
    e.preventDefault()

    if (password.value !== confirmPassword.value) {
        toastStore.addToast('Passwords do not match', 'error')
        return
    }

    isLoading.value = true
    try {
        await authStore.register({
            email: email.value,
            password: password.value,
            confirmPassword: confirmPassword.value
        })
        toastStore.addToast('Account created successfully', 'success')
        router.push('/auth/mfa-setup')
    } catch (error: any) {
        toastStore.addToast(error.response?.data?.message || 'Registration failed', 'error')
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <div class="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#05080F]">
        <!-- Ambient Background -->
        <div class="absolute inset-0 pointer-events-none">
            <div class="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-indigo-600/10 rounded-full blur-[120px] opacity-40"></div>
            <div class="absolute bottom-[10%] -right-[10%] w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[100px] opacity-30"></div>
            <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
        </div>

        <div class="w-full max-w-md relative z-10 mx-auto">
            <!-- Header -->
            <div class="text-center mb-10">
                <router-link to="/" class="inline-flex items-center gap-3 mb-8 group">
                     <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold font-display shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                        S
                    </div>
                    <span class="text-2xl font-bold font-display text-white">Serwin<span class="text-indigo-400">.io</span></span>
                </router-link>
                <h2 class="text-3xl font-bold font-display text-white mb-3">Create your account</h2>
                <p class="text-slate-400 text-sm">Join thousands of developers building the future.</p>
            </div>

            <!-- Register Card -->
            <div class="glass-panel p-8 rounded-2xl">
                <form @submit="handleRegister" class="space-y-6">
                    <div class="space-y-2">
                        <label class="input-label">Email Address</label>
                        <input v-model="email" type="email" class="input-field" placeholder="name@company.com" required>
                    </div>

                    <div class="space-y-2">
                        <label class="input-label">Password</label>
                        <input v-model="password" type="password" class="input-field" placeholder="••••••••" required minlength="8">
                    </div>

                    <div class="space-y-2">
                        <label class="input-label">Confirm Password</label>
                        <input v-model="confirmPassword" type="password" class="input-field" placeholder="••••••••" required>
                    </div>

                    <div class="flex items-start gap-3 py-2">
                         <div class="flex items-center h-5">
                            <input id="terms" type="checkbox" class="w-4 h-4 rounded border-slate-600 bg-slate-700 text-indigo-600 focus:ring-indigo-500" required>
                        </div>
                        <label for="terms" class="text-xs text-slate-400">
                            I agree to the <a href="#" class="text-indigo-400 hover:text-white">Terms of Service</a> and <a href="#" class="text-indigo-400 hover:text-white">Privacy Policy</a>.
                        </label>
                    </div>

                    <button type="submit" :disabled="isLoading" class="w-full btn-primary py-3 text-sm tracking-wide bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-0">
                        <span v-if="isLoading">Creating account...</span>
                        <span v-else>Get Started</span>
                    </button>
                    
                    <button type="button" @click="authStore.loginWithGoogle" class="w-full btn-secondary py-3 flex items-center justify-center gap-3 text-sm">
                        <svg class="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.27.81-.57z" />
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Sign up with Google
                    </button>
                </form>
            </div>

            <div class="mt-8 text-center text-sm text-slate-500">
                Already have an account? 
                <router-link to="/login" class="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">Sign in</router-link>
            </div>
            
            <div class="mt-12 text-center">
                 <p class="text-xs text-slate-600 font-mono">© 2026 Serwin Systems Inc.</p>
            </div>
        </div>
    </div>
</template>
