<script setup lang="ts">
defineProps<{
    title: string
    description?: string
    showEdit?: boolean
    showDelete?: boolean
    showCreate?: boolean
    createLabel?: string
    editLabel?: string
}>()

const emit = defineEmits<{
    edit: []
    delete: []
    create: []
}>()
</script>

<template>
    <div
        class="p-8 border-b-2 border-[#eaeded] flex flex-col md:flex-row justify-between items-start md:items-center bg-[#fafafa] gap-6">
        <div class="space-y-2 flex-1">
            <h2 class="text-3xl font-black text-[#232f3e] tracking-tighter uppercase italic leading-tight">{{ title }}
            </h2>
            <p v-if="description"
                class="text-[13px] text-[#545b64] font-bold leading-relaxed uppercase tracking-tight italic"
                v-html="description"></p>
        </div>
        <div class="flex flex-wrap gap-3 shrink-0">
            <button v-if="showEdit" @click="emit('edit')"
                class="px-6 py-2.5 text-[10px] font-black bg-white border-2 border-[#eaeded] text-[#232f3e] hover:border-[#ff9900] transition-all uppercase tracking-[0.2em] italic active:scale-95">
                {{ editLabel || 'Edit' }}
            </button>
            <button v-if="showDelete" @click="emit('delete')"
                class="px-6 py-2.5 text-[10px] font-black bg-[#232f3e] text-white hover:bg-rose-600 transition-all uppercase tracking-[0.2em] italic active:scale-95 shadow-lg">
                Delete
            </button>
            <button v-if="showCreate" @click="emit('create')"
                class="px-8 py-2.5 text-[11px] font-black bg-[#ff9900] text-[#232f3e] hover:bg-[#ff9900]/90 transition-all uppercase tracking-[0.1em] shadow-xl shadow-[#ff9900]/20 active:scale-95">
                {{ createLabel || 'Create' }}
            </button>
        </div>
    </div>
</template>
