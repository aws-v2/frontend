<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import type { Vpc } from '../types/vpc'

const props = defineProps<{
    isOpen: boolean
    resourceId: string
    currentVpcId?: string
    vpcs: Vpc[]
    isLoading: boolean
}>()

const emit = defineEmits(['close', 'refresh', 'create', 'change'])

const searchQuery = ref('')
const selectedVpc = ref(props.currentVpcId || '')
const isCreating = ref(false)
const newVpcName = ref('')
const error = ref('')

const filteredVpcs = computed(() => {
    if (!searchQuery.value) return props.vpcs
    return props.vpcs.filter(v => 
        (v.name && v.name.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
        (v.id && v.id.toLowerCase().includes(searchQuery.value.toLowerCase()))
    )
})

const handleClose = () => {
    emit('close')
    // Reset form state on close
    setTimeout(() => {
        isCreating.value = false
        newVpcName.value = ''
        error.value = ''
    }, 300)
}

const handleSelect = () => {
    if (!selectedVpc.value) return
    emit('change', selectedVpc.value)
}

const handleCreate = () => {
    if (!newVpcName.value) {
        error.value = 'Name is required'
        return
    }
    error.value = ''
    emit('create', newVpcName.value)
    
    // We don't close the form here yet, wait for vpcs to update
    // The parent should handle resetting isCreating if successful
}

const refreshVpcs = () => {
    emit('refresh')
}

// Watch for props change to update selectedVpc if needed
import { watch } from 'vue'
watch(() => props.currentVpcId, (newId) => {
    if (newId) selectedVpc.value = newId
})

watch(() => props.vpcs, (newVpcs, oldVpcs) => {
    // If we were in the middle of creating a VPC and the list changed
    if (isCreating.value && newVpcs && oldVpcs && newVpcs.length > oldVpcs.length) {
        // Find the new VPC (the one that wasn't in oldVpcs)
        const oldIds = new Set(oldVpcs.map(v => v.id))
        const newlyAdded = newVpcs.find(v => !oldIds.has(v.id))
        
        if (newlyAdded) {
            selectedVpc.value = newlyAdded.id
            isCreating.value = false
            newVpcName.value = ''
            error.value = ''
        }
    }
}, { deep: true })
</script>

<template>
    <div v-if="isOpen" class="fixed inset-0 z-[200] flex items-start justify-center pt-20">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-[#232f3e]/60 backdrop-blur-sm" @click="handleClose"></div>

        <!-- Modal Content -->
        <div class="relative bg-white w-full max-w-5xl shadow-2xl flex flex-col max-h-[80vh] border-4 border-[#232f3e] overflow-hidden">
            <!-- Header -->
            <div class="flex items-center justify-between px-10 py-8 border-b-2 border-[#eaeded] bg-[#fafafa]">
                <div>
                    <h2 class="text-4xl font-black text-[#232f3e] tracking-tighter uppercase leading-tight">Change VPC</h2>
                    <p class="text-[11px] text-amber-500 font-black uppercase tracking-[0.2em] mt-2">Network Isolation Layer</p>
                </div>
                <button @click="handleClose"
                    class="text-[#545b64] hover:text-amber-500 transition-all p-2 bg-white border-2 border-[#eaeded] hover:border-amber-500 active:scale-95">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Body -->
            <div class="p-10 flex-1 overflow-y-auto bg-white custom-scrollbar">
                
                <!-- Error Alert -->
                <div v-if="error" class="mb-6 p-4 border-2 border-red-200 bg-red-50 text-red-600 font-bold text-sm uppercase tracking-wider flex items-center justify-between">
                    <span>{{ error }}</span>
                    <button @click="error = ''" class="hover:text-red-800">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <!-- Create VPC Section -->
                <div class="mb-8 border-2 border-[#eaeded] bg-[#fafafa] overflow-hidden">
                    <div class="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-white transition-colors"
                         @click="isCreating = !isCreating">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 bg-amber-500 text-white flex items-center justify-center font-black text-xl leading-none pt-0.5">
                                +
                            </div>
                            <span class="text-sm font-black text-[#232f3e] uppercase tracking-widest">Create New VPC</span>
                        </div>
                        <svg class="w-5 h-5 text-[#545b64] transition-transform duration-300"
                             :class="{ 'rotate-180': isCreating }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                    
                    <div v-show="isCreating" class="p-6 border-t-2 border-[#eaeded] bg-white">
                        <div class="grid md:grid-cols-1 gap-6">
                            <div>
                                <label class="block text-[10px] font-black text-[#879196] uppercase tracking-widest mb-2">VPC Name</label>
                                <input v-model="newVpcName" type="text" placeholder="e.g. prod-network"
                                    class="w-full px-4 py-3 bg-[#fafafa] border-2 border-[#eaeded] font-mono text-sm text-[#232f3e] focus:outline-none focus:border-amber-500 transition-colors">
                            </div>
                        </div>
                        <div class="mt-6 flex justify-end">
                            <button @click="handleCreate" :disabled="isLoading"
                                class="px-6 py-3 bg-[#232f3e] text-white text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2">
                                <span v-if="isLoading" class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                <span v-else>Create VPC</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- VPC List Header/Toolbar -->
                <div class="border-2 border-[#eaeded] overflow-hidden bg-[#fafafa]">
                    <div class="flex flex-col md:flex-row items-center justify-between p-6 border-b-2 border-[#eaeded] bg-white gap-6">
                        <div class="flex items-center gap-6 w-full max-w-2xl">
                            <span class="text-[11px] font-black text-[#545b64] px-4 py-2 border-2 border-[#eaeded] whitespace-nowrap uppercase tracking-widest">
                                VPCs <span class="text-amber-500">({{ filteredVpcs.length }}/{{ vpcs.length }})</span>
                            </span>
                            <div class="relative w-full group">
                                <svg class="w-6 h-6 absolute left-5 top-1/2 -translate-y-1/2 text-[#545b64] group-focus-within:text-amber-500 transition-colors"
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input v-model="searchQuery" type="text" placeholder="FILTER BY NAME OR ID..."
                                    class="w-full pl-14 pr-6 py-4 bg-white border-2 border-[#eaeded] text-sm font-black text-[#232f3e] placeholder-[#eaeded] focus:outline-none focus:border-amber-500 transition-all uppercase tracking-tight shadow-inner">
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <button @click="refreshVpcs"
                                class="text-[#545b64] hover:text-amber-500 transition-all p-2 bg-white border-2 border-[#eaeded] hover:border-amber-500 active:rotate-180 duration-500"
                                :disabled="isLoading">
                                <svg class="w-6 h-6" :class="{ 'animate-spin': isLoading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Table -->
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead class="bg-white border-b-2 border-[#eaeded]">
                                <tr>
                                    <th class="w-20 p-6 border-r-2 border-[#eaeded]"></th>
                                    <th class="p-6 text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em] border-r-2 border-[#eaeded]">Name & ID</th>
                                    <th class="p-6 text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em] border-r-2 border-[#eaeded]">CIDR</th>
                                    <th class="p-6 text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em]">Region</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y-2 divide-[#eaeded]">
                                <tr v-for="vpc in filteredVpcs" :key="vpc.id"
                                    class="group hover:bg-amber-500/[0.02] cursor-pointer transition-colors"
                                    :class="selectedVpc === vpc.id ? 'bg-amber-500/[0.05]' : 'bg-white'"
                                    @click="selectedVpc = vpc.id">
                                    <td class="p-6 text-center border-r-2 border-[#eaeded]">
                                        <div class="flex justify-center">
                                            <div class="w-6 h-6 border-2 border-[#eaeded] rounded-full flex items-center justify-center transition-all bg-white"
                                                :class="selectedVpc === vpc.id ? 'border-amber-500 bg-amber-500/10' : 'group-hover:border-amber-500'">
                                                <div v-if="selectedVpc === vpc.id" class="w-2.5 h-2.5 bg-amber-500 rounded-full"></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="p-6 border-r-2 border-[#eaeded]">
                                        <div class="font-black uppercase tracking-tight" :class="selectedVpc === vpc.id ? 'text-amber-500' : 'text-[#232f3e]'">
                                            {{ vpc.name || 'Unnamed' }} <span v-if="vpc.id === props.currentVpcId" class="ml-2 text-[9px] px-2 py-0.5 bg-gray-100 text-gray-500 tracking-widest border">CURRENT</span>
                                        </div>
                                        <div class="text-[10px] font-mono text-[#879196] mt-1">{{ vpc.id }}</div>
                                    </td>
                                    <td class="p-6 text-sm font-mono text-[#545b64] border-r-2 border-[#eaeded]">
                                        {{ vpc.cidr_block || '—' }}
                                    </td>
                                    <td class="p-6 text-[11px] font-bold text-[#545b64] uppercase tracking-widest">
                                        {{ vpc.region || '—' }}
                                    </td>
                                </tr>
                                <tr v-if="filteredVpcs.length === 0">
                                    <td colspan="4" class="p-24 text-center text-[#eaeded] bg-white relative overflow-hidden">
                                        <div class="relative z-10 flex flex-col items-center gap-6">
                                            <svg class="w-16 h-16 text-[#eaeded]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                            <span class="text-3xl font-black uppercase tracking-tighter">No VPCs Found</span>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="bg-[#fafafa] px-10 py-8 border-t-2 border-[#eaeded] flex justify-end gap-6 shadow-inner relative">
                <button @click="handleClose" class="px-10 py-3 text-[11px] font-black text-[#545b64] hover:text-amber-500 uppercase tracking-widest transition-all active:scale-95">Cancel</button>
                <button @click="handleSelect" 
                    :disabled="!selectedVpc || selectedVpc === props.currentVpcId || isLoading" 
                    :class="selectedVpc && selectedVpc !== props.currentVpcId
                        ? 'bg-[#232f3e] text-white hover:bg-black shadow-2xl' 
                        : 'bg-[#fafafa] text-[#eaeded] border-2 border-[#eaeded] cursor-not-allowed'"
                    class="px-12 py-3 text-[11px] font-black transition-all duration-300 uppercase tracking-widest active:scale-95 flex items-center gap-2">
                    <span v-if="isLoading" class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Assign VPC
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: #fafafa;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #eaeded;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #f59e0b; /* amber-500 */
}
</style>
