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
    <div
        class="min-h-screen flex flex-col bg-white text-[#16191f] font-urbanist selection:bg-[#ff9900]/30 selection:text-[#16191f]">

        <PublicNavbar buttonText="Log in" buttonLink="/login" />

        <!-- Spacer for fixed navbar -->
        <div class="h-20"></div>

        <main class="flex-1 flex items-center justify-center p-6 bg-[#fafafa]">
            <div class="w-full max-w-md">
                <!-- Register Card - Flat & Sharp -->
                <div class="bg-white border-2 border-[#232f3e] p-10 shadow-none">
                    <div class="mb-10 text-left">
                        <h2 class="text-3xl font-black text-[#232f3e] mb-4 tracking-tighter uppercase">Register</h2>
                        <div class="w-12 h-2 bg-[#ff9900]"></div>
                    </div>

                    <form @submit="handleRegister" class="space-y-6">
                        <div class="space-y-3">
                            <label class="text-[10px] font-black text-[#545b64] uppercase tracking-widest">Email
                                Address</label>
                            <input v-model="email" type="email"
                                class="w-full bg-white border-2 border-[#eaeded] px-4 py-4 text-[#16191f] font-bold placeholder-[#879196] focus:outline-none focus:border-[#ff9900] transition-all rounded-none"
                                placeholder="name@company.com" required>
                        </div>

                        <div class="space-y-3">
                            <label
                                class="text-[10px] font-black text-[#545b64] uppercase tracking-widest">Password</label>
                            <input v-model="password" type="password"
                                class="w-full bg-white border-2 border-[#eaeded] px-4 py-4 text-[#16191f] font-bold placeholder-[#879196] focus:outline-none focus:border-[#ff9900] transition-all rounded-none"
                                placeholder="••••••••" required minlength="8">
                        </div>

                        <div class="space-y-3">
                            <label class="text-[10px] font-black text-[#545b64] uppercase tracking-widest">Confirm
                                Password</label>
                            <input v-model="confirmPassword" type="password"
                                class="w-full bg-white border-2 border-[#eaeded] px-4 py-4 text-[#16191f] font-bold placeholder-[#879196] focus:outline-none focus:border-[#ff9900] transition-all rounded-none"
                                placeholder="••••••••" required>
                        </div>

                        <div class="flex items-start gap-4 py-2">
                            <div class="flex items-center h-6">
                                <input id="terms" type="checkbox"
                                    class="w-5 h-5 border-2 border-[#232f3e] text-[#ff9900] focus:ring-[#ff9900] rounded-none cursor-pointer"
                                    required>
                            </div>
                            <label for="terms" class="text-xs text-[#545b64] font-bold leading-tight">
                                I agree to the <a href="#"
                                    class="text-[#0073bb] hover:text-[#ff9900] transition-colors">Terms of Service</a>
                                and <a href="#" class="text-[#0073bb] hover:text-[#ff9900] transition-colors">Privacy
                                    Policy</a>.
                            </label>
                        </div>

                        <button type="submit" :disabled="isLoading"
                            class="w-full bg-[#ff9900] hover:bg-[#ec7211] text-white font-black py-4 transition-all rounded-none uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed">
                            <span v-if="isLoading">Creating account...</span>
                            <span v-else>Register Profile</span>
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
                            Google Signup
                        </button>
                    </form>
                </div>

                <div class="mt-8 text-center text-sm font-bold text-[#545b64]">
                    Already have an account?
                    <router-link to="/login"
                        class="text-[#0073bb] hover:text-[#ff9900] transition-colors underline decoration-2 underline-offset-4">Sign
                        in</router-link>
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
