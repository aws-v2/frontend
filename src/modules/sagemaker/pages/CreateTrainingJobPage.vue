<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSageMakerStore } from '../store/sagemakerStore'
import { useToastStore } from '@/shared/store/toastStore'

const router = useRouter()
const store = useSageMakerStore()
const toast = useToastStore()

const isLoading = ref(false)

const form = ref({
    name: '',
    role: 'arn:aws:iam::123456789012:role/service-role/AmazonSageMaker-ExecutionRole',
    instanceType: 'ml.m5.xlarge',
    instanceCount: 1,
    inputData: '',
    outputData: ''
})

const instanceTypes = [
    { value: 'ml.m5.xlarge', label: 'ml.m5.xlarge (General Purpose) - $0.23/hr' },
    { value: 'ml.c5.2xlarge', label: 'ml.c5.2xlarge (Compute Optimized) - $0.40/hr' },
    { value: 'ml.p3.2xlarge', label: 'ml.p3.2xlarge (GPU Accelerated) - $3.82/hr' },
    { value: 'ml.p4d.24xlarge', label: 'ml.p4d.24xlarge (High-End GPU) - $32.77/hr' },
    { value: 'ml.g5.xlarge', label: 'ml.g5.xlarge (NVIDIA A10G) - $1.20/hr' },
]

const isValid = computed(() => {
   return form.value.name.length > 0 && form.value.inputData.length > 0 && form.value.outputData.length > 0
})

const handleSubmit = async () => {
    if (!isValid.value) {
        toast.addToast('Please complete all required fields.', 'error')
        return
    }

    isLoading.value = true
    try {
        const payload = {
            ...form.value,
            inputData: `s3://${form.value.inputData}`,
            outputData: `s3://${form.value.outputData}`
        }
        await store.createTrainingJob(payload)
        toast.addToast('Training Fleet Provisioning...', 'success')
        router.push('/sagemaker')
    } catch (e) {
        toast.addToast('Failed to start training job', 'error')
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <div class="min-h-screen bg-[#05080F] relative overflow-hidden font-sans">
        <div class="relative z-10 max-w-4xl mx-auto px-6 py-12">

            <!-- Breadcrumb -->
            <div class="flex items-center gap-2 text-sm text-slate-500 mb-8 font-mono">
                <router-link to="/sagemaker" class="hover:text-pink-400 transition-colors">SageMaker</router-link>
                <span>/</span>
                <span class="text-white">New Training Job</span>
            </div>

            <div class="bg-white/[0.02] border border-white/5 shadow-2xl p-10 rounded-2xl border-t-4 border-t-pink-500">
                <div class="mb-10">
                    <h1 class="text-3xl font-bold text-white mb-2 font-display">Configure Training Hull</h1>
                    <p class="text-slate-400">Define the parameters for your ephemeral training fleet.</p>
                </div>

                <form @submit.prevent="handleSubmit" class="space-y-8">

                    <!-- Job Settings -->
                    <div class="space-y-6">
                        <h3 class="text-sm font-bold text-pink-400 uppercase tracking-widest font-mono border-b border-white/5 pb-2">
                            01 // Job Metadata</h3>

                        <div class="space-y-2">
                            <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest">Job Name</label>
                            <input v-model="form.name" type="text" 
                                class="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                                placeholder="e.g. bi-encoder-retraining-v4" required>
                            <p class="text-xs text-slate-500">Unique identifier for this specific training run.</p>
                        </div>

                        <div class="space-y-2">
                            <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest">IAM Execution Role</label>
                            <input v-model="form.role" type="text" 
                                class="w-full bg-black/40 border border-white/[0.02] rounded-lg px-4 py-3 text-slate-500 font-mono text-xs cursor-not-allowed"
                                readonly>
                        </div>
                    </div>

                    <!-- Compute Resources -->
                    <div class="space-y-6 pt-4">
                        <h3 class="text-sm font-bold text-pink-400 uppercase tracking-widest font-mono border-b border-white/5 pb-2">
                            02 // Compute Fleet</h3>

                        <div class="grid md:grid-cols-2 gap-6">
                            <div class="space-y-2">
                                <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest">Instance Type</label>
                                <select v-model="form.instanceType" 
                                    class="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-pink-500/50 transition-colors appearance-none">
                                    <option v-for="type in instanceTypes" :key="type.value" :value="type.value" class="bg-[#05080F]">
                                        {{ type.label }}
                                    </option>
                                </select>
                            </div>

                            <div class="space-y-2">
                                <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest">Instance Count</label>
                                <input v-model="form.instanceCount" type="number" min="1" max="10" 
                                    class="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-pink-500/50 transition-colors">
                            </div>
                        </div>
                    </div>

                    <!-- Data Channels -->
                    <div class="space-y-6 pt-4">
                        <h3 class="text-sm font-bold text-pink-400 uppercase tracking-widest font-mono border-b border-white/5 pb-2">
                            03 // Data Channels</h3>

                        <div class="space-y-4">
                            <div class="space-y-2">
                                <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest">Input Data Location (S3)</label>
                                <div class="relative">
                                    <input v-model="form.inputData" type="text" 
                                        class="w-full bg-black/20 border border-white/10 rounded-lg pl-14 pr-4 py-3 text-white focus:outline-none focus:border-pink-500/50 transition-colors font-mono"
                                        placeholder="bucket-name/dataset/v1/">
                                    <div class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 pointer-events-none">
                                        s3://</div>
                                </div>
                                <p class="text-[10px] text-slate-500 uppercase tracking-wider">Storage bucket containing your dataset artifacts.</p>
                            </div>
                            <div class="space-y-2">
                                <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest">Output Artifacts Location (S3)</label>
                                <div class="relative">
                                    <input v-model="form.outputData" type="text" 
                                        class="w-full bg-black/20 border border-white/10 rounded-lg pl-14 pr-4 py-3 text-white focus:outline-none focus:border-pink-500/50 transition-colors font-mono"
                                        placeholder="bucket-name/models/output/">
                                    <div class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 pointer-events-none">
                                        s3://</div>
                                </div>
                                <p class="text-[10px] text-slate-500 uppercase tracking-wider">Destination bucket for model checkpoints and manifests.</p>
                            </div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="pt-8 flex items-center justify-end gap-6 border-t border-white/10">
                        <router-link to="/sagemaker" class="text-sm font-bold text-slate-500 hover:text-white transition-colors">
                            Cancel
                        </router-link>
                        <button type="submit" :disabled="isLoading || !isValid"
                            class="bg-pink-600 hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg px-8 py-3 flex items-center gap-3 transition-colors">
                            <div v-if="isLoading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span v-else>Launch Training Fleet</span>
                        </button>
                    </div>

                </form>
            </div>
        </div>
    </div>
</template>
