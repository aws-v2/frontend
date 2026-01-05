<script setup lang="ts">
import { useToastStore } from '@/shared/store/toastStore'

const toastStore = useToastStore()

const handleUpdate = (e: Event) => {
    e.preventDefault()
    toastStore.addToast('Password has been reset successfully!', 'success')
}
</script>

<template>
    <div class="min-h-[calc(100vh-88px)] flex items-center justify-center p-6 bg-gray-50 dark:bg-transparent">
        <div class="w-full max-w-md">
            <div class="retro-box p-10 space-y-8 bg-white">
                <div class="text-center space-y-2">
                    <h1 class="text-5xl font-black">New Pass</h1>
                    <p class="font-mono text-sm opacity-60">update_account_security</p>
                </div>

                <form @submit="handleUpdate" class="space-y-6">
                    <div>
                        <label class="label-retro">New Password</label>
                        <input type="password" class="input-retro" placeholder="••••••••" required>
                        <p class="text-[10px] uppercase font-bold mt-2 opacity-40">Minimum 12 characters</p>
                    </div>

                    <div>
                        <label class="label-retro">Confirm Password</label>
                        <input type="password" class="input-retro" placeholder="••••••••" required>
                    </div>

                    <button type="submit" class="btn-retro-primary w-full py-5 text-xl">
                        Update Password
                    </button>
                </form>
            </div>
        </div>
    </div>
</template>
