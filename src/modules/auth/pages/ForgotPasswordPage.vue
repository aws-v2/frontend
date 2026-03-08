<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/modules/auth/store/authStore'
import { useToastStore } from '@/shared/store/toastStore'
import PublicNavbar from '@/shared/components/PublicNavbar.vue'

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
    <div
        class="min-h-screen flex flex-col bg-white text-[#16191f] font-urbanist selection:bg-[#ff9900]/30 selection:text-[#16191f]">

        <PublicNavbar buttonText="Log in" buttonLink="/login" />

        <!-- Spacer for fixed navbar -->
        <div class="h-20"></div>

        <main class="flex-1 flex items-center justify-center p-6 bg-[#fafafa]">
            <div class="w-full max-w-md">
                <!-- Card - Flat & Sharp -->
                <div class="bg-white border-2 border-[#232f3e] p-10 shadow-none">
                    <div class="mb-10 text-left">
                        <h2 class="text-3xl font-black text-[#232f3e] mb-4 tracking-tighter uppercase">Reset Password
                        </h2>
                        <div class="w-12 h-2 bg-[#ff9900]"></div>
                    </div>

                    <div v-if="isSubmitted" class="space-y-8">
                        <div class="p-6 bg-[#ff9900]/5 border-2 border-[#ff9900] text-[#16191f]">
                            <p class="text-sm font-bold leading-relaxed">
                                Instructions for resetting your password have been sent to <strong
                                    class="text-[#232f3e]">{{ email }}</strong>.
                                Please check your email.
                            </p>
                        </div>
                        <router-link to="/login"
                            class="block w-full text-center bg-[#232f3e] hover:bg-[#16191f] text-white font-black py-4 uppercase tracking-widest transition-all">
                            Back to sign in
                        </router-link>
                    </div>

                    <form v-else @submit="handleReset" class="space-y-8">
                        <div class="space-y-3">
                            <label class="text-[10px] font-black text-[#545b64] uppercase tracking-widest">Email
                                Address</label>
                            <input v-model="email" type="email"
                                class="w-full bg-white border-2 border-[#eaeded] px-4 py-4 text-[#16191f] font-bold placeholder-[#879196] focus:outline-none focus:border-[#ff9900] transition-all rounded-none"
                                placeholder="name@company.com" required>
                        </div>

                        <button type="submit" :disabled="isLoading"
                            class="w-full bg-[#ff9900] hover:bg-[#ec7211] text-white font-black py-4 transition-all rounded-none uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed">
                            <span v-if="isLoading">Sending Link...</span>
                            <span v-else>Send Reset Link</span>
                        </button>

                        <div class="pt-4 text-center">
                            <p class="text-sm text-[#545b64] font-bold">
                                Remember your password?
                                <router-link to="/login"
                                    class="text-[#0073bb] hover:text-[#ff9900] transition-colors ml-1 decoration-2 underline-offset-4">Sign
                                    In</router-link>
                            </p>
                        </div>
                    </form>
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
