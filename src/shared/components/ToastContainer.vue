<script setup lang="ts">
import { useToastStore } from '@/shared/store/toastStore'

const toastStore = useToastStore()

const getTypeClasses = (type: string) => {
    switch (type) {
        case 'success':
            return 'bg-green-700 text-white border-green-800'
        case 'error':
            return 'bg-red-600 text-white border-red-700'
        case 'info':
            return 'bg-[#232f3e] text-white border-gray-900'
        default:
            return 'bg-white text-gray-900 border-gray-200 shadow-lg'
    }
}
</script>

<template>
    <div class="fixed top-20 right-6 z-[9999] space-y-4 max-w-sm">
        <transition-group name="toast">
            <div v-for="toast in toastStore.toasts" :key="toast.id"
                class="aws-card p-4 flex items-center gap-4 shadow-xl border-l-4" :class="getTypeClasses(toast.type)">
                <div class="w-6 h-6 flex items-center justify-center font-bold text-lg">
                    <span v-if="toast.type === 'success'">✓</span>
                    <span v-else-if="toast.type === 'error'">✕</span>
                    <span v-else>ℹ</span>
                </div>
                <p class="flex-1 font-bold text-xs uppercase tracking-tight">{{ toast.message }}</p>
                <button @click="toastStore.removeToast(toast.id)"
                    class="text-xl opacity-60 hover:opacity-100 transition-opacity p-1">
                    ×
                </button>
            </div>
        </transition-group>
    </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
    transition: all 0.3s ease;
}

.toast-enter-from {
    transform: translateX(400px);
    opacity: 0;
}

.toast-leave-to {
    transform: translateX(400px);
    opacity: 0;
}
</style>
