<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useComputeStore } from '../store/computeStore'
import type { ScalingPolicy, CreateScalingPolicyPayload, UpdateScalingPolicyPayload } from '../store/computeStore'
import ScalingPolicyModal from '../components/ScalingPolicyModal.vue'
import DeleteScalingPolicyModal from '../components/DeleteScalingPolicyModal.vue'

const router = useRouter()
const computeStore = useComputeStore()

onMounted(async () => {
    await computeStore.fetchScalingPolicies()
    if (!computeStore.instances || computeStore.instances.length === 0) {
        await computeStore.fetchInstances()
    }
})

const searchQuery = ref('')

const filteredPolicies = computed(() => {
    const policies = computeStore.scalingPolicies || []
    if (!searchQuery.value) return policies
    const query = searchQuery.value.toLowerCase()
    return policies.filter(p => 
        (p.target_id && p.target_id.toLowerCase().includes(query)) ||
        (p.id && p.id.toLowerCase().includes(query)) ||
        (p.metric_name && p.metric_name.toLowerCase().includes(query))
    )
})

// Modal States
const isModalOpen = ref(false)
const selectedPolicy = ref<ScalingPolicy | null>(null)

const isDeleteModalOpen = ref(false)
const deletePolicyId = ref<string | null>(null)

// Actions
const openCreateModal = () => {
    selectedPolicy.value = null
    isModalOpen.value = true
}

const openEditModal = (policy: ScalingPolicy) => {
    selectedPolicy.value = policy
    isModalOpen.value = true
}

const handleModalSubmit = async (payload: any) => {
    try {
        if (selectedPolicy.value) {
            await computeStore.updateScalingPolicy(selectedPolicy.value.id, payload as UpdateScalingPolicyPayload)
        } else {
            await computeStore.createScalingPolicy(payload as CreateScalingPolicyPayload)
        }
        isModalOpen.value = false
    } catch (e) {
        console.error('Failed to save policy', e)
    }
}

const confirmDelete = (policy: ScalingPolicy) => {
    deletePolicyId.value = policy.id
    isDeleteModalOpen.value = true
}

const handleDelete = async (id: string) => {
    try {
        await computeStore.deleteScalingPolicy(id)
        isDeleteModalOpen.value = false
        deletePolicyId.value = null
    } catch (e) {
        console.error('Failed to delete policy', e)
    }
}

const refreshPolicies = async () => {
    await computeStore.fetchScalingPolicies()
}

</script>

<template>
    <div class="h-full flex flex-col bg-[#eaeded]">
        <!-- Header Section -->
        <div class="bg-[#232f3e] px-10 pt-16 pb-12 shadow-2xl relative overflow-hidden shrink-0">
            <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CgkgPHBhdGggZD0iTTU0LjYyNyAwTDYwIDUuMzczVjBoLTUuMzczek0wIDU0LjYyN0w1LjM3MyA2MEgwdi01LjM3M3oiIGZpbGw9IiMzZTRjNTMiIGZpbGwtb3BhY2l0eT0iMC4xNSIgZmlsbC1ydWxlPSJldmVub2RkIi8+Cjwvc3ZnPg==')] opacity-30"></div>
            
            <div class="relative z-10 flex justify-between items-end">
                <div>
                    <div class="flex items-center gap-3 mb-4">
                        <div class="h-2 w-2 bg-amber-500 rounded-full animate-pulse"></div>
                        <span class="text-amber-500 text-[10px] font-black tracking-[0.3em] uppercase">EC2 Scaling Management</span>
                    </div>
                    <h1 class="text-5xl font-black text-white tracking-tighter uppercase leading-none">
                        Scaling Policies
                    </h1>
                    <p class="text-[#879196] mt-4 max-w-2xl text-sm font-medium leading-relaxed">
                        Manage auto-scaling policies for your instances to dynamically adjust capacity based on resource utilization.
                    </p>
                </div>
                
                <div class="flex gap-4">
                    <button @click="refreshPolicies" 
                            class="px-6 py-4 bg-white/5 hover:bg-white/10 text-white font-black text-[11px] uppercase tracking-widest border border-white/10 transition-all active:scale-95 flex items-center gap-2">
                        <svg class="w-4 h-4" :class="{'animate-spin': computeStore.isLoading}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                    <button @click="openCreateModal"
                            class="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-[#232f3e] font-black text-[11px] uppercase tracking-widest shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center gap-2">
                        Create Policy
                    </button>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="flex-1 p-10 overflow-y-auto">
            <!-- Toolbar -->
            <div class="bg-white border-2 border-[#eaeded] mb-6 flex items-center p-2 shadow-sm">
                <div class="flex-1 relative border-r-2 border-[#eaeded]">
                    <svg class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#879196]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input v-model="searchQuery" type="text" placeholder="Filter by target ID or metric..."
                        class="w-full pl-12 pr-4 py-3 bg-transparent text-sm font-bold text-[#232f3e] placeholder-[#879196] focus:outline-none focus:bg-amber-50/30 transition-colors uppercase tracking-tight">
                </div>
                <div class="px-6 py-2 flex items-center gap-4 bg-[#fafafa]">
                    <span class="text-[10px] font-black text-[#545b64] uppercase tracking-widest">Total Policies:</span>
                    <span class="text-xl font-black text-[#232f3e]">{{ filteredPolicies.length }}</span>
                </div>
            </div>

            <!-- Table -->
            <div class="bg-white border-2 border-[#eaeded] shadow-sm relative overflow-hidden">
                <div v-if="computeStore.isLoading && filteredPolicies.length === 0" class="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div class="w-12 h-12 border-4 border-[#eaeded] border-t-amber-500 rounded-full animate-spin"></div>
                </div>

                <div class="overflow-x-auto min-h-[400px]">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-[#fafafa] border-b-2 border-[#eaeded]">
                            <tr>
                                <th class="p-6 text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em] border-r-2 border-[#eaeded] w-64">Target ID</th>
                                <th class="p-6 text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em] border-r-2 border-[#eaeded]">Metric</th>
                                <th class="p-6 text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em] border-r-2 border-[#eaeded]">Thresholds</th>
                                <th class="p-6 text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em] border-r-2 border-[#eaeded]">Max Instances</th>
                                <th class="p-6 text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em] border-r-2 border-[#eaeded]">Cooldowns (sec)</th>
                                <th class="p-6 text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em] text-right w-32">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y-2 divide-[#eaeded]">
                            <tr v-for="policy in filteredPolicies" :key="policy.id" 
                                class="hover:bg-amber-50/30 transition-colors group">
                                <td class="p-6 border-r-2 border-[#eaeded]">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded bg-[#eaeded]/50 flex items-center justify-center border border-[#eaeded]">
                                            <svg class="w-4 h-4 text-[#545b64]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div class="font-mono font-bold text-[#232f3e]">{{ policy.target_id }}</div>
                                            <div class="text-[10px] font-bold text-[#879196] uppercase tracking-wider mt-1">{{ policy.target_type }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="p-6 border-r-2 border-[#eaeded]">
                                    <div class="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-bold tracking-wide">
                                        {{ policy.metric_name }}
                                    </div>
                                </td>
                                <td class="p-6 border-r-2 border-[#eaeded]">
                                    <div class="flex items-center gap-4">
                                        <div class="flex flex-col">
                                            <span class="text-[9px] uppercase tracking-widest text-[#879196] font-bold">Target Out</span>
                                            <span class="font-mono text-lg font-black text-amber-600">{{ policy.target_value }}%</span>
                                        </div>
                                        <div class="w-px h-8 bg-[#eaeded]"></div>
                                        <div class="flex flex-col">
                                            <span class="text-[9px] uppercase tracking-widest text-[#879196] font-bold">Scale In</span>
                                            <span class="font-mono text-lg font-black text-blue-600">{{ policy.scale_down_value }}%</span>
                                        </div>
                                    </div>
                                </td>
                                <td class="p-6 border-r-2 border-[#eaeded]">
                                    <div class="font-mono text-lg font-black text-[#232f3e]">{{ policy.max_instances }}</div>
                                </td>
                                <td class="p-6 border-r-2 border-[#eaeded]">
                                    <div class="flex items-center gap-4 text-xs font-medium text-[#545b64]">
                                        <div class="flex flex-col">
                                            <span class="text-[9px] uppercase tracking-widest text-[#879196] font-bold">Scale Out</span>
                                            <span class="font-mono mt-1">{{ policy.scale_out_cooldown }}s</span>
                                        </div>
                                        <div class="w-px h-8 bg-[#eaeded]"></div>
                                        <div class="flex flex-col">
                                            <span class="text-[9px] uppercase tracking-widest text-[#879196] font-bold">Scale In</span>
                                            <span class="font-mono mt-1">{{ policy.scale_in_cooldown }}s</span>
                                        </div>
                                    </div>
                                </td>
                                <td class="p-6 text-right">
                                    <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button @click="openEditModal(policy)" 
                                            class="p-2 text-[#545b64] hover:text-amber-500 hover:bg-amber-50 rounded transition-colors" title="Edit">
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button @click="confirmDelete(policy)" 
                                            class="p-2 text-[#545b64] hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr v-if="filteredPolicies.length === 0 && !computeStore.isLoading">
                                <td colspan="5" class="p-24 text-center">
                                    <div class="flex flex-col items-center justify-center">
                                        <div class="w-20 h-20 bg-[#fafafa] rounded-full border-4 border-[#eaeded] flex items-center justify-center mb-6">
                                            <svg class="w-8 h-8 text-[#879196]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                            </svg>
                                        </div>
                                        <h3 class="text-xl font-black text-[#232f3e] uppercase tracking-tight mb-2">No Policies Found</h3>
                                        <p class="text-[#879196] font-medium max-w-sm">
                                            You don't have any scaling policies configured. Create one to automatically manage your capacity.
                                        </p>
                                        <button @click="openCreateModal" class="mt-8 px-6 py-3 bg-white border-2 border-[#eaeded] text-[#232f3e] font-black text-[10px] uppercase tracking-widest hover:border-amber-500 hover:text-amber-500 transition-all">
                                            Create First Policy
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <ScalingPolicyModal
            :is-open="isModalOpen"
            :is-loading="computeStore.isLoading"
            :policy="selectedPolicy"
            @close="isModalOpen = false"
            @submit="handleModalSubmit"
        />

        <DeleteScalingPolicyModal
            :is-open="isDeleteModalOpen"
            :is-loading="computeStore.isLoading"
            :policy-id="deletePolicyId"
            @close="isDeleteModalOpen = false"
            @confirm="handleDelete"
        />
    </div>
</template>
