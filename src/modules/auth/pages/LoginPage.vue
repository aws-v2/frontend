<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/authStore'
import { useToastStore } from '@/shared/store/toastStore'
import PublicNavbar from '@/shared/components/PublicNavbar.vue'

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
        toastStore.addToast('Welcome back to Serwin Console', 'success')

        // Check if MFA is required for login using store values for reliability
        if (authStore.mfaRequired) {
            router.push({ name: 'mfa' })
        }
        // Otherwise go directly to dashboard as requested
        else {
            router.push({ name: 'dashboard' })
        }



    } catch (error: any) {
        toastStore.addToast(error.response?.data?.message || 'Authentication failed', 'error')
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <div
        class="min-h-screen flex flex-col bg-white text-[#16191f] font-urbanist selection:bg-[#ff9900]/30 selection:text-[#16191f]">

        <PublicNavbar buttonText="Register" buttonLink="/register" />

        <!-- Spacer for fixed navbar -->
        <div class="h-20"></div>

        <main class="flex-1 flex items-center justify-center p-6 bg-[#fafafa]">
            <div class="w-full max-w-md">
                <!-- Login Card - Flat & Sharp -->
                <div class="bg-white border-2 border-[#232f3e] p-10 shadow-none">
                    <div class="mb-10 text-left">
                        <h2 class="text-3xl font-black text-[#232f3e] mb-4 tracking-tighter uppercase">Sign In</h2>
                        <div class="w-12 h-2 bg-[#ff9900]"></div>
                    </div>

                    <form @submit="handleLogin" class="space-y-8">
                        <div class="space-y-3">
                            <label class="text-[10px] font-black text-[#545b64] uppercase tracking-widest">Email
                                Address</label>
                            <input v-model="email" type="email"
                                class="w-full bg-white border-2 border-[#eaeded] px-4 py-4 text-[#16191f] font-bold placeholder-[#879196] focus:outline-none focus:border-[#ff9900] transition-all rounded-none"
                                placeholder="name@company.com" required>
                        </div>

                        <div class="space-y-3">
                            <div class="flex justify-between items-center">
                                <label
                                    class="text-[10px] font-black text-[#545b64] uppercase tracking-widest mb-0">Password</label>
                            </div>
                            <input v-model="password" type="password"
                                class="w-full bg-white border-2 border-[#eaeded] px-4 py-4 text-[#16191f] font-bold placeholder-[#879196] focus:outline-none focus:border-[#ff9900] transition-all rounded-none"
                                placeholder="••••••••" required>
                            <div class="text-right mt-2">
                                <router-link to="/forgot-password"
                                    class="text-xs font-bold text-[#0073bb] hover:text-[#ff9900] transition-colors">Forgot
                                    password?</router-link>
                            </div>
                        </div>

                        <button type="submit" :disabled="isLoading"
                            class="w-full bg-[#ff9900] hover:bg-[#ec7211] text-white font-black py-4 transition-all rounded-none uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed">
                            <span v-if="isLoading">Authenticating...</span>
                            <span v-else>Sign In to Console</span>
                        </button>

                        <div class="relative py-2">
                            <div class="absolute inset-0 flex items-center">
                                <div class="w-full border-t border-[#eaeded]"></div>
                            </div>
                            <div class="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
                                <span class="bg-white px-4 text-[#879196]">Or</span>
                            </div>
                        </div>

                        <button type="button" @click="authStore.loginWithGoogle"
                            class="w-full bg-white border-2 border-[#232f3e] text-[#232f3e] font-black py-4 flex items-center justify-center gap-3 transition-all text-xs uppercase tracking-widest hover:bg-[#232f3e] hover:text-white rounded-none">
                            <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                                <path fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.27.81-.57z" />
                                <path fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google Account
                        </button>
                    </form>
                </div>

                <div class="mt-8 text-center text-sm font-bold text-[#545b64]">
                    Don't have an account?
                    <router-link to="/register"
                        class="text-[#0073bb] hover:text-[#ff9900] transition-colors underline decoration-2 underline-offset-4">Register
                        Now</router-link>
                </div>
            </div>
        </main>

        <footer class="py-10 bg-white border-t border-[#eaeded] text-center">
            <p class="text-[10px] text-[#879196] font-black uppercase tracking-[0.2em]">© 2026 SERWIN SYSTEMS INC.</p>
        </footer>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800;900&display=swap');

.font-urbanist {
    font-family: 'Urbanist', sans-serif;
}

.font-black {
    font-weight: 900;
}
</style>
