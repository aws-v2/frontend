<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSageMakerStore } from '../store/sagemakerStore'

const route = useRoute()
const router = useRouter()
const store = useSageMakerStore()

const jobId = computed(() => route.params.id as string)

const job = computed(() => {
    return store.trainingJobs.find(j => j.id === jobId.value)
})

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Completed': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
        case 'Training': return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
        case 'Initializing': return 'text-amber-500 bg-amber-500/10 border-amber-500/20'
        case 'Failed': return 'text-red-500 bg-red-500/10 border-red-500/20'
        case 'Canceled': return 'text-slate-500 bg-slate-500/10 border-slate-500/20'
        default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20'
    }
}

const handleCancel = async () => {
    if (job.value && confirm('Are you sure you want to stop this training job?')) {
        await store.cancelTrainingJob(job.value.id)
    }
}
</script>

<template>
    <div class="min-h-screen bg-[#05080F] text-white font-sans selection:bg-pink-500/30">
        <div v-if="job" class="max-w-[1200px] mx-auto px-8 pt-24 pb-20">
            
            <!-- Breadcrumb -->
            <div class="flex items-center gap-2 text-sm text-slate-500 mb-8 font-mono">
                <router-link to="/sagemaker" class="hover:text-pink-400 transition-colors">SageMaker</router-link>
                <span>/</span>
                <span class="text-white">{{ job.name }}</span>
            </div>

            <!-- Header -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                <div>
                    <div class="flex items-center gap-4 mb-3">
                        <h1 class="text-4xl font-bold tracking-tight font-display">{{ job.name }}</h1>
                        <span class="inline-flex items-center px-3 py-1 border text-[10px] font-bold uppercase tracking-widest rounded-full" 
                            :class="getStatusColor(job.status)">
                            <span v-if="job.status === 'Training' || job.status === 'Initializing'" class="w-1.5 h-1.5 bg-current rounded-full animate-ping mr-2"></span>
                            {{ job.status }}
                        </span>
                    </div>
                    <p class="text-slate-400 font-mono text-sm max-w-2xl">Job ID: {{ job.id }} <br/> Created: {{ new Date(job.createdAt).toLocaleString() }}</p>
                </div>
                <div class="flex gap-4">
                    <button v-if="job.status === 'Training' || job.status === 'Initializing'" 
                        @click="handleCancel"
                        class="px-6 py-2 border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors">
                        Abort Job
                    </button>
                    <button @click="router.push('/sagemaker')" class="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors">
                        Back to Registry
                    </button>
                </div>
            </div>

            <!-- Content Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <!-- Left Column (General Details) -->
                <div class="lg:col-span-1 space-y-8">
                    <!-- Instance Config -->
                    <div class="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                        <h3 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 font-mono">Compute Environment</h3>
                        <div class="space-y-4">
                            <div>
                                <p class="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Instance Type</p>
                                <p class="font-mono text-pink-400">{{ job.instance }}</p>
                            </div>
                            <div>
                                <p class="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Duration</p>
                                <p class="font-mono">{{ job.duration }}</p>
                            </div>
                            <div>
                                <p class="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Pricing Model</p>
                                <p class="font-mono">On-Demand</p>
                            </div>
                        </div>
                    </div>

                    <!-- Output Artifacts (Integrated S3 display) -->
                    <div class="bg-white/[0.02] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                        <div class="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-bl-full translate-x-8 -translate-y-8 pointer-events-none"></div>
                        <h3 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 font-mono flex items-center gap-2">
                            <svg class="w-4 h-4 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            Storage Integration
                        </h3>
                        
                        <div class="space-y-6">
                            <div>
                                <p class="text-[10px] uppercase text-slate-500 font-bold tracking-widest mb-1">Input Data Source</p>
                                <div class="bg-black/40 border border-white/5 rounded py-2 px-3 text-xs font-mono truncate text-slate-300">
                                    {{ job.inputPath || 's3://bucket/data/' }}
                                </div>
                            </div>
                            <div>
                                <p class="text-[10px] uppercase text-slate-500 font-bold tracking-widest mb-1">Model Output Artifacts</p>
                                <div class="bg-black/40 border border-white/5 rounded py-2 px-3 text-xs font-mono truncate text-slate-300 group cursor-pointer hover:border-pink-500/50 transition-colors">
                                    {{ job.outputPath || 's3://bucket/output/' }}
                                </div>
                                <p class="text-[9px] text-slate-500 mt-2 italic">* Artifacts replicate to Hyper Storage when completed.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right Column (Terminal / Logs) -->
                <div class="lg:col-span-2">
                    <div class="bg-black/40 border border-white/5 rounded-2xl overflow-hidden h-full flex flex-col shadow-2xl">
                        <div class="bg-white/5 border-b border-white/5 px-4 py-3 flex justify-between items-center">
                            <div class="flex items-center gap-2">
                                <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span class="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">CloudWatch / Training Streams</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <div class="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                                <div class="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                                <div v-if="job.status === 'Training'" class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                <div v-else class="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                            </div>
                        </div>
                        <div class="p-6 font-mono text-sm leading-relaxed text-[#4ade80] flex-1 overflow-y-auto">
                            <div v-if="job.status === 'Initializing'">
                                <p class="text-slate-400">[INFO] Provisioning compute cluster...</p>
                                <p class="text-slate-400 max-w-full truncate animate-pulse">[INFO] Connecting to Hyper Storage {{ job.inputPath }}...</p>
                            </div>
                            <div v-else-if="job.status === 'Training'">
                                <p>[INFO] Downloading dataset from S3: {{ job.inputPath }}...</p>
                                <p>[INFO] Unpacking tensors...</p>
                                <p>[INFO] Starting epoch 1/50...</p>
                                <p>[METRIC] Epoch 1 - Loss: 0.8124, Accuracy: 0.65</p>
                                <p>[METRIC] Epoch 2 - Loss: 0.6190, Accuracy: 0.72</p>
                                <p>[METRIC] Epoch 3 - Loss: 0.4421, Accuracy: 0.81</p>
                                <p class="animate-pulse">_</p>
                            </div>
                            <div v-else-if="job.status === 'Completed'" class="text-slate-300">
                                <p>[INFO] Training completed successfully.</p>
                                <p>[METRIC] Final Loss: 0.1201, Final Accuracy: 0.94</p>
                                <p class="text-[#38bdf8]">[INFO] Uploading model artifacts to {{ job.outputPath }}...</p>
                                <p class="text-[#38bdf8]">[SUCCESS] Artifacts safely stored in Hyper Storage bucket.</p>
                                <p>[INFO] Instance torn down.</p>
                            </div>
                            <div v-else-if="job.status === 'Failed'" class="text-red-400">
                                <p>[ERROR] Out of memory (OOM) during forward pass.</p>
                                <p>[ERROR] Traceback: ... tensor size mismatch in matrix multiplication.</p>
                                <p>[INFO] Aborting job.</p>
                            </div>
                            <div v-else-if="job.status === 'Canceled'" class="text-amber-400">
                                <p>[WARN] Received termination signal from console user.</p>
                                <p>[WARN] Halting training loop...</p>
                                <p>[INFO] Job safely canceled.</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <!-- 404 Fallback -->
        <div v-else class="flex items-center justify-center min-h-screen">
            <div class="text-center">
                <h1 class="text-6xl font-black mb-4">404</h1>
                <p class="text-xl text-slate-400 mb-8">Training Job Not Found</p>
                <router-link to="/sagemaker" class="px-8 py-3 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-500 transition-colors">
                    Return to Registry
                </router-link>
            </div>
        </div>
    </div>
</template>
