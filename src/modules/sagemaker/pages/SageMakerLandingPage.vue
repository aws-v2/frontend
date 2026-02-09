<script setup lang="ts">
import { useSageMakerStore } from '../store/sagemakerStore'

const store = useSageMakerStore()
</script>

<template>
    <div class="min-h-screen bg-[#05080F] relative overflow-hidden font-sans">
        <!-- Ambient Background -->
        <div class="absolute inset-0 pointer-events-none">
            <div
                class="absolute top-[10%] left-[30%] w-[50vw] h-[50vw] bg-pink-600/10 rounded-full blur-[120px] opacity-30">
            </div>
            <div
                class="absolute bottom-[20%] right-[10%] w-[40vw] h-[40vw] bg-fuchsia-600/10 rounded-full blur-[100px] opacity-20">
            </div>
            <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]">
            </div>
        </div>

        <div class="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-20">
            <!-- Header -->
            <div
                class="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-20 border-b border-white/5 pb-10">
                <div class="max-w-3xl">
                    <div
                        class="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-bold tracking-widest uppercase">
                        <span class="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
                        Neural Training Ground
                    </div>
                    <h1 class="text-6xl md:text-7xl font-bold text-white tracking-tight font-display mb-6">
                        Sage<span
                            class="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-fuchsia-400">Maker</span>
                    </h1>
                    <p class="text-xl text-slate-400 leading-relaxed font-light max-w-2xl">
                        Orchestrate machine learning at scale. Provision ephemeral fleets, inject data, train models,
                        and terminate. Zero idle cost.
                    </p>
                </div>
                <div>
                    <router-link to="/sagemaker/train/create"
                        class="btn-primary bg-pink-600 hover:bg-pink-500 shadow-pink-500/20 px-8 py-4 text-sm tracking-wide flex items-center gap-3">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Start Training Job
                    </router-link>
                </div>
            </div>

            <!-- Conceptual Workflow -->
            <div class="grid md:grid-cols-3 gap-8 mb-24">
                <div class="relative group">
                    <div class="glass-panel p-8 rounded-2xl h-full border-t-2 border-t-pink-500/50">
                        <div class="text-[10px] text-pink-500 font-mono mb-4 uppercase tracking-widest">Step 01 // Input
                        </div>
                        <h3 class="text-xl font-bold text-white mb-3">Prepare Context</h3>
                        <p class="text-sm text-slate-400 leading-relaxed">Define your S3 data lake input and your
                            training algorithm container. We handle the mount points.</p>
                        <div class="absolute -right-4 top-1/2 -translate-y-1/2 text-pink-500/20 hidden md:block">
                            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div class="relative group">
                    <div class="glass-panel p-8 rounded-2xl h-full border-t-2 border-t-pink-500/50">
                        <div class="text-[10px] text-pink-500 font-mono mb-4 uppercase tracking-widest">Step 02 //
                            Execute</div>
                        <h3 class="text-xl font-bold text-white mb-3">Provision & Train</h3>
                        <p class="text-sm text-slate-400 leading-relaxed">We spin up the EC2 fleet, pull your container,
                            and execute your training script. Fleet dies when job ends.</p>
                        <div class="absolute -right-4 top-1/2 -translate-y-1/2 text-pink-500/20 hidden md:block">
                            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div class="relative group">
                    <div class="glass-panel p-8 rounded-2xl h-full border-t-2 border-t-pink-500/50">
                        <div class="text-[10px] text-pink-500 font-mono mb-4 uppercase tracking-widest">Step 03 //
                            Artifacts</div>
                        <h3 class="text-xl font-bold text-white mb-3">Save Model</h3>
                        <p class="text-sm text-slate-400 leading-relaxed">Model artifacts are automatically tarballed
                            and uploaded to your S3 output bucket for inference.</p>
                    </div>
                </div>
            </div>

            <!-- Recent Jobs -->
            <div class="glass-panel rounded-2xl overflow-hidden">
                <div class="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <h3 class="font-bold text-white font-display">Recent Training Jobs</h3>
                    <button
                        class="text-xs text-pink-400 hover:text-white transition-colors uppercase tracking-widest font-bold">View
                        All History</button>
                </div>

                <table class="w-full text-left text-sm">
                    <thead>
                        <tr class="border-b border-white/5 text-xs text-slate-500 uppercase tracking-wider font-mono">
                            <th class="px-8 py-4 font-normal">Job Name</th>
                            <th class="px-8 py-4 font-normal">Status</th>
                            <th class="px-8 py-4 font-normal">Duration</th>
                            <th class="px-8 py-4 font-normal">Instance</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5">
                        <tr v-for="job in store.trainingJobs" :key="job.id"
                            class="hover:bg-white/[0.02] transition-colors group">
                            <td class="px-8 py-5 font-medium text-white group-hover:text-pink-400 transition-colors">{{
                                job.name }}</td>
                            <td class="px-8 py-5">
                                <span
                                    class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium"
                                    :class="{
                                        'bg-emerald-500/10 text-emerald-400': job.status === 'Completed',
                                        'bg-blue-500/10 text-blue-400': job.status === 'Training' || job.status === 'Initializing',
                                        'bg-red-500/10 text-red-400': job.status === 'Failed'
                                    }">
                                    <span class="w-1.5 h-1.5 rounded-full" :class="{
                                        'bg-emerald-400': job.status === 'Completed',
                                        'bg-blue-400 animate-pulse': job.status === 'Training' || job.status === 'Initializing',
                                        'bg-red-400': job.status === 'Failed'
                                    }"></span>
                                    {{ job.status }}
                                </span>
                            </td>
                            <td class="px-8 py-5 text-slate-400 font-mono">{{ job.duration }}</td>
                            <td class="px-8 py-5 text-slate-400 font-mono">{{ job.instance }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>
