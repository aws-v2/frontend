<script setup lang="ts">
// Minimal setup for the landing page
</script>

<template>
    <div class="min-h-screen relative overflow-hidden bg-[#05080F]">
        <!-- Ambient Background -->
        <div class="absolute inset-0 pointer-events-none">
            <div
                class="absolute top-[20%] left-[20%] w-[60vw] h-[60vw] bg-blue-600/10 rounded-full blur-[120px] opacity-20">
            </div>
            <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]">
            </div>
        </div>

        <div class="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-20">
            <!-- Header -->
            <div class="max-w-3xl mb-20">
                <div
                    class="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-widest uppercase">
                    <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    Elastic Compute Cloud
                </div>
                <h1 class="text-6xl md:text-7xl font-bold text-white tracking-tight font-display mb-8">
                    Power Everything.<br>
                    <span
                        class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Instantly.</span>
                </h1>
                <p class="text-xl text-slate-400 leading-relaxed font-light max-w-2xl">
                    Secure, resizable compute capacity. From bare metal to event-driven serverless functions, deploy
                    workloads in milliseconds.
                </p>

                <div class="flex flex-wrap gap-4 mt-10">
                    <router-link to="/lambda/create"
                        class="btn-primary bg-blue-600 hover:bg-blue-500 shadow-blue-500/20 px-8 py-4 text-sm tracking-wide">
                        Create Function
                    </router-link>
                    <router-link to="/compute/instances" class="btn-secondary px-8 py-4 text-sm tracking-wide">
                        Launch Instance
                    </router-link>
                    <router-link to="/compute/instances"
                        class="btn-secondary px-8 py-4 text-sm tracking-wide border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
                        Console &rarr;
                    </router-link>
                </div>
            </div>

            <!-- Feature Grid -->
            <div class="grid md:grid-cols-3 gap-6 mb-24">
                <!-- AWS Lambda Card (Linked) -->
                <router-link to="/lambda"
                    class="glass-panel p-8 rounded-2xl group hover:bg-white/[0.03] transition-colors block">
                    <div
                        class="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold text-white mb-3">AWS Lambda</h3>
                    <p class="text-sm text-slate-400 leading-relaxed">Run code without provisioning servers. Pay only
                        for the compute time you consume with sub-ms scaling.</p>
                </router-link>

                <!-- EC2 Card -->
                <div class="glass-panel p-8 rounded-2xl group hover:bg-white/[0.03] transition-colors">
                    <div
                        class="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold text-white mb-3">EC2 Instances</h3>
                    <p class="text-sm text-slate-400 leading-relaxed">Broadest and deepest compute platform with over
                        500 instances choices for every workload.</p>
                </div>

                <!-- Fargate Card -->
                <div class="glass-panel p-8 rounded-2xl group hover:bg-white/[0.03] transition-colors">
                    <div
                        class="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold text-white mb-3">Fargate</h3>
                    <p class="text-sm text-slate-400 leading-relaxed">Serverless compute for containers. Run EKS and ECS
                        without managing the underlying fleet.</p>
                </div>
            </div>

            <!-- Stats Section -->
            <div class="border-t border-white/5 pt-16">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-12">
                    <div>
                        <div class="text-4xl font-bold text-white font-display mb-2">350<span
                                class="text-blue-500">+</span></div>
                        <div class="text-xs font-semibold text-slate-500 uppercase tracking-widest">Instance Types</div>
                    </div>
                    <div>
                        <div class="text-4xl font-bold text-white font-display mb-2">400<span
                                class="text-blue-500">Gbps</span></div>
                        <div class="text-xs font-semibold text-slate-500 uppercase tracking-widest">Network Bandwidth
                        </div>
                    </div>
                    <div>
                        <div class="text-4xl font-bold text-white font-display mb-2">99.99<span
                                class="text-blue-500">%</span></div>
                        <div class="text-xs font-semibold text-slate-500 uppercase tracking-widest">Availability SLA
                        </div>
                    </div>
                    <div>
                        <div class="text-4xl font-bold text-white font-display mb-2">0<span
                                class="text-blue-500">ms</span></div>
                        <div class="text-xs font-semibold text-slate-500 uppercase tracking-widest">Cold Starts</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
