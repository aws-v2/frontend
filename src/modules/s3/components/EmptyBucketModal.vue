<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToastStore } from '@/shared/store/toastStore'
import apiClient from '@/shared/api/apiClient'

const props = defineProps<{
    isOpen: boolean
    bucketName: string
    bucketId: string
}>()

const emit = defineEmits(['close', 'success'])
const toastStore = useToastStore()

const confirmationInput = ref('')
const isLoading = ref(false)

const isConfirmationValid = computed(() => {
    return confirmationInput.value === 'permanently delete'
})

const handleEmpty = async () => {
    if (!isConfirmationValid.value) return

    isLoading.value = true
    try {
        await apiClient.post(`/s3/buckets/${props.bucketId}/empty`)

        toastStore.addToast(`Successfully emptied bucket "${props.bucketName}"`, 'success')
        emit('success')
        handleClose()
    } catch (error: any) {
        toastStore.addToast(error.response?.data?.error || 'Failed to empty bucket', 'error')
    } finally {
        isLoading.value = false
    }
}

const handleClose = () => {
    confirmationInput.value = ''
    emit('close')
}
</script>

<template>
    <div v-if="isOpen"
        class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#232f3e]/60 backdrop-blur-sm italic"
        role="dialog" aria-modal="true">
        <!-- Backdrop -->
        <div class="fixed inset-0" @click="handleClose"></div>

        <!-- Modal Content -->
        <div
            class="relative bg-white w-full max-w-2xl border-4 border-[#232f3e] flex flex-col overflow-hidden shadow-2xl transition-all font-urbanist">
            <!-- Subtle Grid in Modal -->
            <div
                class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)]">
            </div>

            <!-- Header -->
            <div
                class="px-10 py-8 border-b-2 border-[#eaeded] bg-[#fafafa] flex items-center justify-between relative z-10 italic">
                <h2
                    class="text-3xl font-black text-[#232f3e] flex items-center gap-4 uppercase tracking-tighter italic">
                    Empty Bucket
                    <span
                        class="text-[#ff9900] bg-white border-2 border-[#eaeded] px-3 py-1 uppercase font-black tracking-widest text-[10px] not-italic ml-2 animate-pulse">Mass
                        Purge</span>
                </h2>
                <button @click="handleClose"
                    class="text-[#545b64] hover:text-[#ff9900] transition-colors p-2 bg-white border-2 border-[#eaeded] hover:border-[#ff9900] active:scale-95 shadow-sm">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Body -->
            <div class="p-10 overflow-y-auto max-h-[70vh] relative z-10 bg-white">
                <!-- Warning Alert -->
                <div class="border-2 border-rose-500/30 bg-rose-500/[0.02] p-8 mb-8 italic">
                    <div class="flex items-start gap-6">
                        <div
                            class="w-12 h-12 bg-white border-2 border-rose-500 text-rose-500 flex items-center justify-center shrink-0 rotate-3 shadow-lg shadow-rose-500/10">
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <h3 class="text-xl font-black text-[#232f3e] mb-2 uppercase tracking-tighter italic">
                                Destructive Purge Initiative?</h3>
                            <p
                                class="text-[12px] text-[#232f3e] font-black italic uppercase tracking-widest underline decoration-[#ff9900] decoration-2 underline-offset-4">
                                {{ bucketName }}</p>
                            <p
                                class="text-[12px] text-[#545b64] mt-4 leading-relaxed font-bold uppercase tracking-tight">
                                Operation is finalized upon commitment. Every stored object will be permanently erased
                                from system records.</p>
                        </div>
                    </div>
                </div>

                <!-- Confirmation Card -->
                <div class="border-2 border-[#eaeded] p-8 bg-[#fafafa] shadow-inner italic">
                    <p
                        class="text-[11px] text-[#232f3e] mb-6 font-black uppercase tracking-[0.2em] italic leading-relaxed">
                        To authorize mass asset erasure, type the secure override phrase below:</p>
                    <div class="flex flex-col gap-2 mb-6">
                        <span class="text-[10px] text-[#545b64] font-black uppercase tracking-widest">Required
                            Phrase:</span>
                        <span
                            class="text-lg font-black text-rose-500 uppercase tracking-tighter italic px-4 py-2 border-2 border-rose-500/10 bg-white inline-block w-fit">permanently
                            delete</span>
                    </div>
                    <input v-model="confirmationInput" type="text" placeholder="AUTH PHRASE..."
                        class="w-full border-2 border-[#eaeded] px-6 py-5 text-xl font-black italic uppercase tracking-tight text-[#232f3e] focus:border-rose-500 focus:outline-none placeholder-[#eaeded] bg-white shadow-inner transition-all">
                </div>
            </div>

            <!-- Footer -->
            <div
                class="px-10 py-8 border-t-2 border-[#eaeded] bg-[#fafafa] flex justify-end gap-6 relative z-10 italic">
                <button @click="handleClose"
                    class="px-8 py-3 text-[11px] font-black text-[#545b64] hover:text-[#ff9900] uppercase tracking-widest transition-all italic active:scale-95">Cancel</button>
                <button @click="handleEmpty" :disabled="!isConfirmationValid || isLoading"
                    :class="[!isConfirmationValid || isLoading ? 'opacity-20 grayscale cursor-not-allowed bg-white border-2 border-[#eaeded] text-[#545b64]' : 'bg-rose-500 text-white hover:bg-black shadow-2xl']"
                    class="px-12 py-3 text-[11px] font-black uppercase tracking-widest flex items-center gap-3 transition-all italic active:scale-95">
                    <svg v-if="isLoading" class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                    Execute Purge
                </button>
            </div>
        </div>
    </div>
</template>
