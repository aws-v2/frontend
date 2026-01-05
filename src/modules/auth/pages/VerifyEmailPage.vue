<script setup lang="ts">
import { useToastStore } from '@/shared/store/toastStore'

const toastStore = useToastStore()

const handleResend = () => {
    toastStore.addToast('Verification link resent to your email.', 'success')
}
</script>

<template>
    <div class="min-h-[calc(100vh-88px)] flex items-center justify-center p-6 bg-gray-50 dark:bg-transparent">
        <div class="w-full max-w-md">
            <div class="retro-box p-10 space-y-10 bg-white text-center">
                <div class="space-y-4">
                    <div class="w-24 h-24 bg-black mx-auto flex items-center justify-center">
                        <div class="w-12 h-1 bg-white rotate-45 absolute"></div>
                        <div class="w-12 h-1 bg-white -rotate-45 absolute"></div>
                        <div class="w-10 h-10 border-4 border-white"></div>
                    </div>
                    <h1 class="text-5xl font-black">Verify</h1>
                    <p class="font-mono text-sm opacity-60">awaiting_email_confirmation</p>
                </div>

                <div class="space-y-6">
                    <p class="text-sm font-medium leading-relaxed opacity-70">
                        We've sent a verification link to your email address. Please click the link to initialize your
                        Serwin account.
                    </p>

                    <div class="space-y-4 pt-4">
                        <router-link to="/login" class="btn-retro-primary block w-full py-4">
                            Return to Login
                        </router-link>
                        <button @click="handleResend"
                            class="text-xs font-bold uppercase tracking-widest hover:underline opacity-50">
                            Resend verification link
                        </button>
                    </div>
                </div>

                <div class="font-hand text-2xl italic pt-4">Almost there...</div>
            </div>
        </div>
    </div>
</template>
