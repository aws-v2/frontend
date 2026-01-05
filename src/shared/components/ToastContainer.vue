<script setup lang="ts">
import { useToastStore } from '@/shared/store/toastStore'

const toastStore = useToastStore()
</script>

<template>
    <div class="fixed top-20 right-6 z-50 space-y-4 max-w-sm">
        <div v-for="toast in toastStore.toasts" :key="toast.id"
            class="retro-box p-4 flex items-center gap-4 animate-[slideIn_0.3s_ease]"
            :class="toast.type === 'success' ? 'bg-green-50' : 'bg-red-50'">
            <div class="w-6 h-6 flex items-center justify-center font-black text-lg">
                {{ toast.type === 'success' ? '✓' : '✕' }}
            </div>
            <p class="flex-1 font-medium text-sm">{{ toast.message }}</p>
            <button @click="toastStore.removeToast(toast.id)"
                class="text-xl opacity-40 hover:opacity-100 transition-opacity">
                ×
            </button>
        </div>
    </div>
</template>

<style scoped>
@keyframes slideIn {
    from {
        transform: translateX(400px);
        opacity: 0;
    }

    to {
        transform: translateX(0);
        opacity: 1;
    }
}
</style>
