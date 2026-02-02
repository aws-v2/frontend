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
        toastStore.addToast('FAILURE // KEY_MISMATCH', 'error')
        return
    }

    isLoading.value = true
    try {
        await authStore.register({
            email: email.value,
            password: password.value,
            confirmPassword: confirmPassword.value
        })
        toastStore.addToast('NODAL_ACCOUNT_INITIALIZED', 'success')
        router.push('/auth/mfa-setup')
    } catch (error: any) {
        toastStore.addToast(error.response?.data?.message || 'REGISTRATION_FAILURE', 'error')
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <div class="auth-container">
        <!-- Abstract Void Background Elements -->
        <div class="absolute inset-0 z-0 pointer-events-none opacity-20 technical-grid"></div>

        <div class="w-full max-w-md relative z-10">
            <!-- Branding Header -->
            <div class="flex flex-col items-center mb-16">
                <router-link to="/" class="flex items-center gap-4 group">
                    <div class="w-8 h-8 bg-white rotate-45 group-hover:scale-125 transition-transform duration-500">
                    </div>
                    <span class="text-3xl font-black uppercase tracking-[0.3em]">Serwin</span>
                </router-link>
            </div>

            <div class="auth-card space-y-10">
                <div class="text-left border-l-2 border-emerald-500 pl-6 py-2">
                    <h1 class="text-2xl font-black uppercase tracking-tighter text-white">Initialize Account</h1>
                    <p class="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em] mt-2 tracking-widest">
                        Protocol Registry v2.4</p>
                </div>

                <form @submit="handleRegister" class="space-y-8">
                    <div class="space-y-3">
                        <label class="aws-label">Registry // Email</label>
                        <input v-model="email" type="email" class="aws-input" placeholder="OPERATOR@SERWIN.IO" required>
                    </div>

                    <div class="space-y-3">
                        <label class="aws-label">Security // Key</label>
                        <input v-model="password" type="password" class="aws-input" placeholder="••••••••" required>
                    </div>

                    <div class="space-y-3">
                        <label class="aws-label">Confirm // Key</label>
                        <input v-model="confirmPassword" type="password" class="aws-input" placeholder="••••••••"
                            required>
                    </div>

                    <div class="flex items-start gap-4 py-2 opacity-80">
                        <div class="mt-1 flex items-center justify-center p-0.5 border border-white/40">
                            <input type="checkbox" id="terms"
                                class="w-2 h-2 appearance-none bg-transparent checked:bg-emerald-500 transition-colors cursor-pointer"
                                required>
                        </div>
                        <label for="terms"
                            class="text-[9px] font-bold text-white/60 uppercase tracking-widest leading-loose select-none cursor-pointer">
                            Accept Serwin Technical Protocol & Operating Agreement.
                        </label>
                    </div>

                    <div class="pt-4">
                        <button type="submit" :disabled="isLoading"
                            class="btn-aws-primary w-full flex items-center justify-center gap-4 py-4 !bg-emerald-500 !text-black">
                            <div v-if="isLoading"
                                class="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin">
                            </div>
                            {{ isLoading ? 'Initializing...' : 'Join_Protocol' }}
                        </button>
                    </div>
                </form>

                <div class="pt-10 border-t border-white/20 text-center">
                    <p class="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em]">
                        Already Authenticated?
                        <router-link to="/login"
                            class="text-white hover:text-emerald-400 transition-colors ml-2 underline underline-offset-4">Authorize
                            Now</router-link>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>
