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
    <div class="min-h-[calc(100vh-88px)] flex items-center justify-center p-6 bg-gray-50 dark:bg-transparent">
        <div class="w-full max-w-md">
            <div class="retro-box p-10 space-y-8 bg-white">
                <div class="text-center space-y-2">
                    <h1 class="text-5xl font-black">Reset</h1>
                    <p class="font-mono text-sm opacity-60">recover_account_access</p>
                </div>

                <div v-if="isSubmitted" class="space-y-6 text-center">
                    <div
                        class="retro-box bg-black text-white p-6 font-mono text-xs uppercase tracking-widest leading-relaxed">
                        Incoming transmission... link dispatched to <br />
                        <span class="underline">{{ email }}</span>
                    </div>
                    <p class="text-sm font-medium">Please check your inbox (and spam folder) for further instructions.
                    </p>
                    <router-link to="/login" class="btn-retro-primary w-full py-5 text-xl block">
                        Return to Login
                    </router-link>
                </div>

                <form v-else @submit="handleReset" class="space-y-6">
                    <div>
                        <label class="label-retro">Email Address</label>
                        <input v-model="email" type="email" class="input-retro" placeholder="user@serwin.io" required>
                        <p class="text-[10px] uppercase font-bold mt-2 opacity-40">We'll send you a reset link</p>
                    </div>

                    <button type="submit" :disabled="isLoading"
                        class="btn-retro-primary w-full py-5 text-xl flex items-center justify-center gap-2">
                        <span v-if="isLoading" class="animate-spin">⟳</span>
                        {{ isLoading ? 'Processing...' : 'Send Reset Link' }}
                    </button>

                    <div class="pt-6 border-t-2 border-black/10 text-center">
                        <p class="text-sm font-medium">
                            Remember your password?
                            <router-link to="/login" class="font-black hover:underline ml-1">Back to Login</router-link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>
