<script setup lang="ts">
import { ref, watch } from 'vue'
import { useComputeStore } from '../store/computeStore'
import type { ScalingPolicy, CreateScalingPolicyPayload, UpdateScalingPolicyPayload } from '../store/computeStore'

const computeStore = useComputeStore()

const props = defineProps<{
    isOpen: boolean
    isLoading: boolean
    policy: ScalingPolicy | null
}>()

const emit = defineEmits(['close', 'submit'])

const form = ref({
    target_id: '',
    metric_name: 'CPUUtilization',
    target_value: 75.0,
    scale_down_value: 20.0,
    max_instances: 5,
    scale_out_cooldown: 300,
    scale_in_cooldown: 300
})

const error = ref('')

watch(() => props.isOpen, (newVal) => {
    if (newVal) {
        if (props.policy) {
            form.value = {
                target_id: props.policy.target_id,
                metric_name: props.policy.metric_name,
                target_value: props.policy.target_value,
                scale_down_value: props.policy.scale_down_value,
                max_instances: props.policy.max_instances,
                scale_out_cooldown: props.policy.scale_out_cooldown,
                scale_in_cooldown: props.policy.scale_in_cooldown
            }
        } else {
            form.value = {
                target_id: '',
                metric_name: 'CPUUtilization',
                target_value: 75.0,
                scale_down_value: 20.0,
                max_instances: 5,
                scale_out_cooldown: 300,
                scale_in_cooldown: 300
            }
        }
        error.value = ''
    }
})

const handleClose = () => {
    emit('close')
}

const handleSubmit = () => {
    if (!form.value.target_id && !props.policy) {
        error.value = 'Target ID is required'
        return
    }
    if (!form.value.metric_name && !props.policy) {
        error.value = 'Metric Name is required'
        return
    }
    if (form.value.target_value <= 0) {
        error.value = 'Target Value must be greater than 0'
        return
    }
    if (form.value.scale_down_value >= form.value.target_value) {
        error.value = 'Scale-Down Value must be less than Target Value'
        return
    }
    if (form.value.max_instances <= 0 || !Number.isInteger(form.value.max_instances)) {
        error.value = 'Max Instances must be an integer greater than 0'
        return
    }

    if (props.policy) {
        const payload: UpdateScalingPolicyPayload = {
            target_value: Number(form.value.target_value),
            scale_down_value: Number(form.value.scale_down_value),
            max_instances: Number(form.value.max_instances),
            scale_out_cooldown: Number(form.value.scale_out_cooldown),
            scale_in_cooldown: Number(form.value.scale_in_cooldown)
        }
        emit('submit', payload)
    } else {
        const payload: CreateScalingPolicyPayload = {
            target_type: 'instance',
            target_id: form.value.target_id,
            metric_name: form.value.metric_name,
            target_value: Number(form.value.target_value),
            scale_down_value: Number(form.value.scale_down_value),
            max_instances: Number(form.value.max_instances),
            scale_out_cooldown: Number(form.value.scale_out_cooldown),
            scale_in_cooldown: Number(form.value.scale_in_cooldown)
        }


        console.log(payload)
        emit('submit', payload)
    }
}
</script>

<template>
    <div v-if="isOpen" class="fixed inset-0 z-[200] flex items-start justify-center pt-20">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-[#232f3e]/60 backdrop-blur-sm" @click="handleClose"></div>

        <!-- Modal Content -->
        <div class="relative bg-white w-full max-w-2xl shadow-2xl flex flex-col border-4 border-[#232f3e] overflow-hidden">
            <!-- Header -->
            <div class="flex items-center justify-between px-10 py-8 border-b-2 border-[#eaeded] bg-[#fafafa]">
                <div>
                    <h2 class="text-4xl font-black text-[#232f3e] tracking-tighter uppercase leading-tight">
                        {{ policy ? 'Edit Policy' : 'Create Policy' }}
                    </h2>
                    <p class="text-[11px] text-amber-500 font-black uppercase tracking-[0.2em] mt-2">
                        Scaling Configuration
                    </p>
                </div>
                <button @click="handleClose"
                    class="text-[#545b64] hover:text-amber-500 transition-all p-2 bg-white border-2 border-[#eaeded] hover:border-amber-500 active:scale-95">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Body -->
            <div class="p-10 flex-1 overflow-y-auto bg-white custom-scrollbar flex flex-col gap-6">
                <!-- Error Alert -->
                <div v-if="error" class="p-4 border-2 border-red-200 bg-red-50 text-red-600 font-bold text-sm uppercase tracking-wider flex items-center justify-between">
                    <span>{{ error }}</span>
                    <button @click="error = ''" class="hover:text-red-800">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-[10px] font-black text-[#879196] uppercase tracking-widest mb-2">Target ID (Instance)</label>
                        <select v-model="form.target_id"
                            :disabled="!!policy"
                            :class="!!policy ? 'opacity-50 cursor-not-allowed' : ''"
                            class="w-full px-4 py-3 bg-[#fafafa] border-2 border-[#eaeded] font-mono text-sm text-[#232f3e] focus:outline-none focus:border-amber-500 transition-colors appearance-none">
                            <option value="" disabled>Select an Instance</option>
                            <option v-for="inst in computeStore.instances" :key="inst.id" :value="inst.id">
                                {{ inst.name }} ({{ inst.id }})
                            </option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-[10px] font-black text-[#879196] uppercase tracking-widest mb-2">Metric Name</label>
                        <select v-model="form.metric_name"
                            :disabled="!!policy"
                            :class="!!policy ? 'opacity-50 cursor-not-allowed' : ''"
                            class="w-full px-4 py-3 bg-[#fafafa] border-2 border-[#eaeded] font-mono text-sm text-[#232f3e] focus:outline-none focus:border-amber-500 transition-colors appearance-none">
                            <option value="CPUUtilization">CPU Utilization</option>
                            <option value="NetworkIn">Network In</option>
                            <option value="NetworkOut">Network Out</option>
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-[10px] font-black text-[#879196] uppercase tracking-widest mb-2" title="Metric threshold to trigger scale-out">Target Value (%)</label>
                        <input v-model.number="form.target_value" type="number" step="0.1" min="1" max="100"
                            class="w-full px-4 py-3 bg-[#fafafa] border-2 border-[#eaeded] font-mono text-sm text-[#232f3e] focus:outline-none focus:border-amber-500 transition-colors">
                    </div>
                    <div>
                        <label class="block text-[10px] font-black text-[#879196] uppercase tracking-widest mb-2" title="Metric threshold below which instance is terminated">Scale-Down Value (%)</label>
                        <input v-model.number="form.scale_down_value" type="number" step="0.1" min="1" max="100"
                            class="w-full px-4 py-3 bg-[#fafafa] border-2 border-[#eaeded] font-mono text-sm text-[#232f3e] focus:outline-none focus:border-amber-500 transition-colors">
                    </div>
                </div>

                <div>
                    <label class="block text-[10px] font-black text-[#879196] uppercase tracking-widest mb-2" title="Maximum allowed running instances in this policy's scope">Max Instances</label>
                    <input v-model.number="form.max_instances" type="number" step="1" min="1"
                        class="w-full px-4 py-3 bg-[#fafafa] border-2 border-[#eaeded] font-mono text-sm text-[#232f3e] focus:outline-none focus:border-amber-500 transition-colors">
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-[10px] font-black text-[#879196] uppercase tracking-widest mb-2">Scale Out Cooldown (sec)</label>
                        <input v-model.number="form.scale_out_cooldown" type="number" step="1" min="0"
                            class="w-full px-4 py-3 bg-[#fafafa] border-2 border-[#eaeded] font-mono text-sm text-[#232f3e] focus:outline-none focus:border-amber-500 transition-colors">
                    </div>
                    <div>
                        <label class="block text-[10px] font-black text-[#879196] uppercase tracking-widest mb-2">Scale In Cooldown (sec)</label>
                        <input v-model.number="form.scale_in_cooldown" type="number" step="1" min="0"
                            class="w-full px-4 py-3 bg-[#fafafa] border-2 border-[#eaeded] font-mono text-sm text-[#232f3e] focus:outline-none focus:border-amber-500 transition-colors">
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="bg-[#fafafa] px-10 py-8 border-t-2 border-[#eaeded] flex justify-end gap-6 shadow-inner relative">
                <button @click="handleClose" class="px-10 py-3 text-[11px] font-black text-[#545b64] hover:text-amber-500 uppercase tracking-widest transition-all active:scale-95">Cancel</button>
                <button @click="handleSubmit" 
                    :disabled="isLoading" 
                    class="px-12 py-3 text-[11px] font-black text-white bg-[#232f3e] hover:bg-black transition-all duration-300 uppercase tracking-widest active:scale-95 flex items-center gap-2 shadow-2xl disabled:opacity-50">
                    <span v-if="isLoading" class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    {{ policy ? 'Save Changes' : 'Create Policy' }}
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
</style>
