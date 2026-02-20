<script setup lang="ts">
defineProps<{
    title: string
    message: string
    buttonLabel?: string
    showButton?: boolean
}>()

const emit = defineEmits<{
    action: []
}>()
</script>

<template>
    <div
        class="p-16 text-center border-2 border-dashed border-[#eaeded] bg-white group hover:border-[#ff9900]/50 transition-all italic relative overflow-hidden">
        <div
            class="absolute inset-0 bg-[#fafafa]/50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        </div>

        <div class="relative z-10">
            <div
                class="w-20 h-20 bg-white border-2 border-[#eaeded] flex items-center justify-center mx-auto mb-8 text-[#eaeded] group-hover:text-[#ff9900] group-hover:border-[#ff9900] transition-all duration-500 shadow-sm">
                <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            </div>
            <p class="text-xl font-black text-[#232f3e] mb-3 uppercase tracking-tighter">{{ title }}</p>
            <p
                class="text-[11px] text-[#545b64] mb-10 max-w-sm mx-auto leading-relaxed font-bold uppercase tracking-widest">
                {{ message }}</p>

            <button v-if="showButton" @click="emit('action')"
                class="px-10 py-3 text-[11px] font-black uppercase tracking-widest bg-[#ff9900] text-[#232f3e] hover:bg-[#ff9900]/90 transition-all shadow-xl shadow-[#ff9900]/10 active:scale-95">
                {{ buttonLabel || 'Get Started' }}
            </button>
        </div>
    </div>
</template>
