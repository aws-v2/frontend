<script setup lang="ts">
import { useToastStore } from '@/shared/store/toastStore'

const toastStore = useToastStore()

const handleResend = () => {
    toastStore.addToast('Verification link resent to your email.', 'info')
}
</script>

<template>
    <div class="auth-container">
        <div class="w-full max-w-md">
            <div class="auth-card space-y-8 text-center">
                <div class="space-y-4">
                    <div
                        class="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 mx-auto flex items-center justify-center rounded-full text-[var(--aws-blue)] text-3xl">
                        ✉️
                    </div>
                    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Verify your email</h1>
                    <p class="text-sm text-gray-500">Initialization sequence almost complete</p>
                </div>

                <div class="space-y-6">
                    <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        We've sent a verification link to your email address. Please click the link to confirm your
                        account and get started with Serwin.
                    </p>

                    <div class="space-y-3 pt-2">
                        <router-link to="/login" class="btn-aws-primary block w-full py-2.5">
                            Return to sign in
                        </router-link>
                        <button @click="handleResend" class="text-xs text-[var(--aws-blue)] hover:underline font-bold">
                            Resend verification link
                        </button>
                    </div>
                </div>
            </div>

            <div class="mt-8 text-center text-[10px] text-gray-400 uppercase tracking-widest font-medium">
                &copy; 2026 Serwin Technologies or its affiliates.
            </div>
        </div>
    </div>
</template>
