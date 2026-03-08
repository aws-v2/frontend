<script setup lang="ts">
const props = defineProps<{
    isOpen: boolean
    isLoading: boolean
    policyId: string | null
}>()

const emit = defineEmits(['close', 'confirm'])

const handleClose = () => {
    emit('close')
}

const handleConfirm = () => {
    if (props.policyId) {
        emit('confirm', props.policyId)
    }
}
</script>

<template>
    <div v-if="isOpen" class="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-[#232f3e]/60 backdrop-blur-sm" @click="handleClose"></div>

        <!-- Modal Content -->
        <div class="relative bg-white w-full max-w-md shadow-2xl flex flex-col border-4 border-[#232f3e]">
            <div class="p-8">
                <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 border-4 border-red-50">
                    <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                
                <h3 class="text-2xl font-black text-[#232f3e] uppercase tracking-tight mb-2">Delete Policy?</h3>
                <p class="text-sm font-medium text-[#545b64] leading-relaxed">
                    Are you sure you want to delete policy <span class="font-mono bg-gray-100 px-1 py-0.5">{{ policyId }}</span>? This action cannot be undone and may affect auto-scaling behavior.
                </p>
            </div>

            <div class="bg-[#fafafa] px-8 py-6 border-t-2 border-[#eaeded] flex justify-end gap-4 shadow-inner">
                <button @click="handleClose" 
                    :disabled="isLoading"
                    class="px-6 py-2.5 text-[11px] font-black text-[#545b64] hover:text-amber-500 uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50">
                    Cancel
                </button>
                <button @click="handleConfirm" 
                    :disabled="isLoading" 
                    class="px-8 py-2.5 text-[11px] font-black text-white bg-red-600 hover:bg-red-700 transition-all duration-300 uppercase tracking-widest active:scale-95 flex items-center gap-2 shadow-lg disabled:opacity-50">
                    <span v-if="isLoading" class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Delete
                </button>
            </div>
        </div>
    </div>
</template>
