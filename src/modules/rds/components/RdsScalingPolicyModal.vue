<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRdsStore } from '../store/rdsStore'
import type { RdsScalingPolicy, CreateRdsScalingPolicyPayload, UpdateRdsScalingPolicyPayload } from '../store/rdsStore'

const rdsStore = useRdsStore()

const props = defineProps<{
    isOpen: boolean
    isLoading: boolean
    policy: RdsScalingPolicy | null
    databaseId: string
}>()

const emit = defineEmits(['close', 'submit'])

const form = ref({
    metric_name: 'CPU',
    target_value: 80.0,
    scale_down_value: 30.0,
    max_instances: 1,
    scale_out_cooldown: 300,
    scale_in_cooldown: 600
})

const error = ref('')

watch(() => props.isOpen, (newVal) => {
    if (newVal) {
        if (props.policy) {
            form.value = {
                metric_name: props.policy.metric_name,
                target_value: props.policy.target_value,
                scale_down_value: props.policy.scale_down_value,
                max_instances: props.policy.max_instances,
                scale_out_cooldown: props.policy.scale_out_cooldown,
                scale_in_cooldown: props.policy.scale_in_cooldown
            }
        } else {
            form.value = {
                metric_name: 'CPU',
                target_value: 80.0,
                scale_down_value: 30.0,
                max_instances: 1,
                scale_out_cooldown: 300,
                scale_in_cooldown: 600
            }
        }
        error.value = ''
    }
})

const handleClose = () => {
    emit('close')
}

const handleSubmit = () => {
    if (form.value.target_value <= 0) {
        error.value = 'Target Value must be greater than 0'
        return
    }
    if (form.value.scale_down_value >= form.value.target_value) {
        error.value = 'Scale-In Value must be less than Target Value'
        return
    }

    if (props.policy) {
        const payload: UpdateRdsScalingPolicyPayload = {
            target_value: Number(form.value.target_value),
            scale_down_value: Number(form.value.scale_down_value),
            max_instances: Number(form.value.max_instances),
            scale_out_cooldown: Number(form.value.scale_out_cooldown),
            scale_in_cooldown: Number(form.value.scale_in_cooldown)
        }
        emit('submit', payload)
    } else {
        const payload: CreateRdsScalingPolicyPayload = {
            target_type: 'instance',
            target_id: props.databaseId,
            metric_name: form.value.metric_name,
            target_value: Number(form.value.target_value),
            scale_down_value: Number(form.value.scale_down_value),
            max_instances: Number(form.value.max_instances),
            scale_out_cooldown: Number(form.value.scale_out_cooldown),
            scale_in_cooldown: Number(form.value.scale_in_cooldown)
        }
        emit('submit', payload)
    }
}
</script>

<template>
    <div v-if="isOpen" class="fixed inset-0 z-[200] flex items-start justify-center pt-20">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-[#232f3e]/60 backdrop-blur-sm" @click="handleClose"></div>

        <!-- Modal Content -->
        <div class="relative bg-white w-full max-w-2xl shadow-2xl flex flex-col border-4 border-[#232f3e] font-urbanist">
            <!-- Header -->
            <div class="flex items-center justify-between px-10 py-8 border-b-2 border-[#eaeded] bg-[#fafafa]">
                <div>
                    <h2 class="text-3xl font-black text-[#232f3e] tracking-tighter uppercase leading-tight">
                        {{ policy ? 'Modify Scaling Policy' : 'Configure Vertical Scaling' }}
                    </h2>
                    <p class="text-[10px] text-amber-500 font-black uppercase tracking-[0.2em] mt-2">
                        RDS Optimization Rule
                    </p>
                </div>
                <button @click="handleClose"
                    class="text-[#545b64] hover:text-amber-500 transition-all p-2 bg-white border-2 border-[#eaeded] hover:border-amber-500 active:scale-95">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Body -->
            <div class="p-10 flex-1 overflow-y-auto bg-white custom-scrollbar flex flex-col gap-8">
                <!-- Error Alert -->
                <div v-if="error" class="p-4 border-2 border-red-200 bg-red-50 text-red-600 font-bold text-[10px] uppercase tracking-wider flex items-center justify-between">
                    <span>{{ error }}</span>
                    <button @click="error = ''" class="hover:text-red-800">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label class="block text-[10px] font-black text-[#879196] uppercase tracking-widest mb-3">Database Instance</label>
                        <div class="px-4 py-3 bg-[#f8f9fa] border-2 border-[#eaeded] font-mono text-sm text-[#232f3e] opacity-60">
                            {{ databaseId }}
                        </div>
                    </div>
                    <div>
                        <label class="block text-[10px] font-black text-[#879196] uppercase tracking-widest mb-3">Target Metric</label>
                        <select v-model="form.metric_name"
                            :disabled="!!policy"
                            class="w-full px-4 py-3 bg-[#fafafa] border-2 border-[#eaeded] font-black text-xs text-[#232f3e] focus:outline-none focus:border-amber-500 transition-colors appearance-none disabled:opacity-40">
                            <option value="CPU">CPU Utilization</option>
                            <option value="MEMORY">Memory Utilization</option>
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label class="block text-[10px] font-black text-[#879196] uppercase tracking-widest mb-3" title="Trigger scale-up when above this value">Scale-Out Threshold (%)</label>
                        <div class="relative">
                            <input v-model.number="form.target_value" type="number" step="1" min="1" max="100"
                                class="w-full px-4 py-3 bg-[#fafafa] border-2 border-[#eaeded] font-mono text-sm text-[#232f3e] focus:outline-none focus:border-amber-500 transition-colors">
                            <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#879196]">%</span>
                        </div>
                    </div>
                    <div>
                        <label class="block text-[10px] font-black text-[#879196] uppercase tracking-widest mb-3" title="Trigger scale-down when below this value">Scale-In Threshold (%)</label>
                        <div class="relative">
                            <input v-model.number="form.scale_down_value" type="number" step="1" min="1" max="100"
                                class="w-full px-4 py-3 bg-[#fafafa] border-2 border-[#eaeded] font-mono text-sm text-[#232f3e] focus:outline-none focus:border-amber-500 transition-colors">
                            <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#879196]">%</span>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label class="block text-[10px] font-black text-[#879196] uppercase tracking-widest mb-3">Scale Out Cooldown (sec)</label>
                        <input v-model.number="form.scale_out_cooldown" type="number" step="30" min="60"
                            class="w-full px-4 py-3 bg-[#fafafa] border-2 border-[#eaeded] font-mono text-sm text-[#232f3e] focus:outline-none focus:border-amber-500 transition-colors">
                    </div>
                    <div>
                        <label class="block text-[10px] font-black text-[#879196] uppercase tracking-widest mb-3">Max Vertical Level (Scale-Limit)</label>
                        <input v-model.number="form.max_instances" type="number" step="1" min="1"
                            class="w-full px-4 py-3 bg-[#fafafa] border-2 border-[#eaeded] font-mono text-sm text-[#232f3e] focus:outline-none focus:border-amber-500 transition-colors">
                    </div>
                </div>

                <div>
                    <label class="block text-[10px] font-black text-[#879196] uppercase tracking-widest mb-3">Scale In Cooldown (sec)</label>
                    <input v-model.number="form.scale_in_cooldown" type="number" step="30" min="60"
                        class="w-full px-4 py-3 bg-[#fafafa] border-2 border-[#eaeded] font-mono text-sm text-[#232f3e] focus:outline-none focus:border-amber-500 transition-colors">
                </div>

                <div class="p-6 border-2 border-amber-100 bg-amber-50/50">
                    <div class="flex gap-4">
                        <svg class="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p class="text-[10px] text-amber-800 font-medium leading-relaxed uppercase tracking-wider">
                            Vertical scaling will upgrade or downgrade the instance class (e.g., db.t3.micro to db.t3.small) based on the observed metrics. This may cause a temporary connection interruption.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="bg-[#fafafa] px-10 py-8 border-t-2 border-[#eaeded] flex justify-end gap-6">
                <button @click="handleClose" class="px-8 py-3 text-[10px] font-black text-[#545b64] hover:text-amber-500 uppercase tracking-widest transition-all">Cancel</button>
                <button @click="handleSubmit" 
                    :disabled="isLoading" 
                    class="px-10 py-3 text-[10px] font-black text-white bg-[#232f3e] hover:bg-black transition-all uppercase tracking-widest disabled:opacity-50 active:scale-95 shadow-[4px_4px_0px_#eaeded]">
                    {{ isLoading ? 'Processing...' : policy ? 'Update Policy' : 'Activate Policy' }}
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
    background: #f59e0b;
}

.font-urbanist {
    font-family: 'Urbanist', sans-serif;
}
</style>
