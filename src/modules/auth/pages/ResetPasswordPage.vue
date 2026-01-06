<script setup lang="ts">
import { useToastStore } from '@/shared/store/toastStore'

const toastStore = useToastStore()

const handleUpdate = (e: Event) => {
    e.preventDefault()
    toastStore.addToast('Password has been reset successfully!', 'success')
}
</script>

<template>
    <div class="auth-container">
        <div class="w-full max-w-md">
            <div class="auth-card space-y-6">
                <div class="text-center">
                    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Reset password</h1>
                    <p class="text-sm text-gray-500 mt-2">Enter your new password below</p>
                </div>

                <form @submit="handleUpdate" class="space-y-4">
                    <div>
                        <label class="aws-label">New password</label>
                        <input type="password" class="aws-input" placeholder="At least 12 characters" required>
                    </div>

                    <div>
                        <label class="aws-label">Confirm new password</label>
                        <input type="password" class="aws-input" placeholder="Repeat new password" required>
                    </div>

                    <button type="submit" class="btn-aws-primary w-full py-2.5 mt-2">
                        Update password
                    </button>
                </form>
            </div>

            <div class="mt-8 text-center text-[10px] text-gray-400 uppercase tracking-widest font-medium">
                &copy; 2026 Serwin Technologies or its affiliates.
            </div>
        </div>
    </div>
</template>
