<script setup lang="ts">
import { ref } from 'vue'
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
    inputData: 's3://',
    outputData: 's3://'
})

const instanceTypes = [
    { value: 'ml.m5.xlarge', label: 'ml.m5.xlarge (General Purpose) - $0.23/hr' },
    { value: 'ml.c5.2xlarge', label: 'ml.c5.2xlarge (Compute Optimized) - $0.40/hr' },
    { value: 'ml.p3.2xlarge', label: 'ml.p3.2xlarge (GPU Accelerated) - $3.82/hr' },
    { value: 'ml.g5.xlarge', label: 'ml.g5.xlarge (NVIDIA A10G) - $1.20/hr' },
]

const handleSubmit = async () => {
    isLoading.value = true
    try {
        await store.createTrainingJob(form.value)
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

            <div class="glass-panel p-10 rounded-2xl border-t-4 border-t-pink-500">
                <div class="mb-10">
                    <h1 class="text-3xl font-bold text-white mb-2 font-display">Configure Training Hull</h1>
                    <p class="text-slate-400">Define the parameters for your ephemeral training fleet.</p>
                </div>

                <form @submit.prevent="handleSubmit" class="space-y-8">

                    <!-- Job Settings -->
                    <div class="space-y-6">
                        <h3
                            class="text-sm font-bold text-pink-400 uppercase tracking-widest font-mono border-b border-white/5 pb-2">
                            01 // Job Metadata</h3>

                        <div class="space-y-2">
                            <label class="input-label">Job Name</label>
                            <input v-model="form.name" type="text" class="input-field"
                                placeholder="e.g. bi-encoder-retraining-v4" required>
                            <p class="text-xs text-slate-500">Unique identifier for this specific training run.</p>
                        </div>

                        <div class="space-y-2">
                            <label class="input-label">IAM Execution Role</label>
                            <input v-model="form.role" type="text" class="input-field font-mono text-xs opacity-70"
                                readonly>
                        </div>
                    </div>

                    <!-- Compute Resources -->
                    <div class="space-y-6 pt-4">
                        <h3
                            class="text-sm font-bold text-pink-400 uppercase tracking-widest font-mono border-b border-white/5 pb-2">
                            02 // Compute Fleet</h3>

                        <div class="grid md:grid-cols-2 gap-6">
                            <div class="space-y-2">
                                <label class="input-label">Instance Type</label>
                                <select v-model="form.instanceType" class="input-field appearance-none">
                                    <option v-for="type in instanceTypes" :key="type.value" :value="type.value">{{
                                        type.label }}</option>
                                </select>
                            </div>

                            <div class="space-y-2">
                                <label class="input-label">Instance Count</label>
                                <input v-model="form.instanceCount" type="number" min="1" max="10" class="input-field">
                            </div>
                        </div>
                    </div>

                    <!-- Data Channels -->
                    <div class="space-y-6 pt-4">
                        <h3
                            class="text-sm font-bold text-pink-400 uppercase tracking-widest font-mono border-b border-white/5 pb-2">
                            03 // Data Channels</h3>

                        <div class="space-y-4">
                            <div class="space-y-2">
                                <label class="input-label">Input Data Location (S3)</label>
                                <div class="relative">
                                    <input v-model="form.inputData" type="text" class="input-field pl-16 font-mono"
                                        placeholder="bucket/path/to/train/">
                                    <div
                                        class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 pointer-events-none">
                                        S3://</div>
                                </div>
                            </div>
                            <div class="space-y-2">
                                <label class="input-label">Output Artifacts Location (S3)</label>
                                <div class="relative">
                                    <input v-model="form.outputData" type="text" class="input-field pl-16 font-mono"
                                        placeholder="bucket/path/to/output/">
                                    <div
                                        class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 pointer-events-none">
                                        S3://</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="pt-8 flex items-center justify-end gap-6 border-t border-white/10">
                        <router-link to="/sagemaker"
                            class="text-sm font-bold text-slate-500 hover:text-white transition-colors">Cancel</router-link>
                        <button type="submit" :disabled="isLoading"
                            class="btn-primary bg-pink-600 hover:bg-pink-500 px-10 py-4 flex items-center gap-3">
                            <div v-if="isLoading"
                                class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span v-else>Launch Training Fleet</span>
                        </button>
                    </div>

                </form>
            </div>
        </div>
    </div>
</template>
