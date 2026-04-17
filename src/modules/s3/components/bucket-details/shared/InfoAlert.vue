<script setup lang="ts">
defineProps<{
    message: string
    title?: string
    type?: 'info' | 'warning'
    showButton?: boolean
    buttonLabel?: string
}>()

const emit = defineEmits<{
    action: []
}>()
</script>

<template>
    <div :class="[
        'p-8 flex gap-6 italic border-2 transition-all',
        type === 'warning' ? 'border-[#ff9900] bg-[#ff9900]/5' : 'border-[#eaeded] bg-[#fafafa]'
    ]">
        <div class="mt-1 shrink-0">
            <div class="w-10 h-10 bg-white border-2 flex items-center justify-center rotate-3"
                :class="type === 'warning' ? 'border-[#ff9900] text-[#ff9900]' : 'border-[#eaeded] text-[#545b64]'">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
        </div>
        <div class="flex-1">
            <h4 v-if="title" class="text-[12px] font-black text-[#232f3e] mb-2 uppercase tracking-[0.2em] italic">{{
                title }}</h4>
            <div class="text-[13px] text-[#545b64] leading-relaxed font-bold uppercase tracking-tight" v-html="message">
            </div>
        </div>
        <button v-if="showButton" @click="emit('action')"
            class="px-8 py-3 text-[10px] font-black uppercase tracking-widest bg-[#232f3e] text-white hover:bg-black transition-all active:scale-95 italic self-center">
            {{ buttonLabel || 'Action' }}
        </button>
    </div>
</template>
