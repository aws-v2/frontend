<script setup lang="ts">
// Minimal setup for the landing page
</script>

<template>
    <div class="min-h-screen bg-white font-sans selection:bg-indigo-100 relative overflow-hidden">
        <!-- Premium Ambient Background -->
        <div class="absolute inset-0 pointer-events-none">
            <div
                class="absolute top-[15%] right-[-10%] w-[50rem] h-[50rem] bg-indigo-50/60 rounded-full blur-[130px] animate-pulse">
            </div>
            <div class="absolute bottom-[10%] left-[-5%] w-[40rem] h-[40rem] bg-purple-50/50 rounded-full blur-[110px]">
            </div>
        </div>

        <div class="relative z-10">
            <!-- Hero Section: AI Excellence -->
            <header class="max-w-7xl mx-auto px-8 md:px-16 pt-32 pb-24">
                <div class="flex flex-col lg:flex-row gap-20 items-start">
                    <div class="flex-1">
                        <div
                            class="inline-flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-[0.3em] mb-10">
                            Neural Engine Layer
                        </div>
                        <h1
                            class="text-7xl md:text-9xl font-black text-gray-900 mb-10 leading-[0.85] tracking-tighter uppercase italic">
                            Sage.<span class="text-indigo-500">AI</span>
                        </h1>
                        <p class="text-2xl text-gray-500 font-bold max-w-2xl leading-tight mb-12">
                            Next-generation machine intelligence. Build, train, and deploy sophisticated models at
                            planetary scale.
                        </p>
                        <div class="flex flex-wrap gap-6 items-center">
                            <button
                                class="px-12 py-6 bg-gray-900 text-white font-black text-xl hover:bg-indigo-600 transition-all duration-300 rounded-none uppercase tracking-tighter active:scale-95">
                                Start Training
                            </button>
                            <div
                                class="flex items-center gap-3 px-6 h-16 border border-gray-100 bg-white/50 backdrop-blur-sm">
                                <div class="w-2 h-2 bg-indigo-500 animate-ping"></div>
                                <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inference
                                    Cluster: Online</span>
                            </div>
                        </div>
                    </div>

                    <!-- Bento Stats: AI Throughput -->
                    <div class="w-full lg:w-[480px] grid grid-cols-2 gap-4">
                        <div
                            class="col-span-2 p-12 bg-gray-900 text-white flex flex-col justify-between aspect-video border-b-8 border-indigo-500">
                            <div class="flex justify-between items-start">
                                <span class="text-5xl font-black italic tracking-tighter uppercase">500k</span>
                                <svg class="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="square" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <p class="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-2">
                                    Inferences / Sec</p>
                                <p class="text-xs font-bold text-gray-400 leading-relaxed uppercase">Ultra-low latency
                                    model serving with automatic multi-variant A/B testing protocols.</p>
                            </div>
                        </div>
                        <div class="p-8 bg-white border border-gray-100 flex flex-col justify-center gap-2">
                            <span class="text-4xl font-black text-gray-900 tracking-tighter">10.2T</span>
                            <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Parameters
                                Limit</span>
                        </div>
                        <div class="p-8 bg-indigo-50 border border-indigo-100 flex flex-col justify-center gap-2">
                            <span class="text-3xl font-black text-indigo-700 tracking-tighter italic">P5.48xl</span>
                            <span
                                class="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none">GPU
                                ACCELERATION</span>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Technical Architecture Grid -->
            <section
                class="max-w-7xl mx-auto px-8 md:px-16 py-32 border-t border-gray-50 bg-gray-50/30 backdrop-blur-sm">
                <div class="flex flex-col lg:flex-row gap-24">
                    <div class="flex-1">
                        <h2
                            class="text-4xl font-black text-gray-900 uppercase tracking-tighter mb-16 inline-flex items-center gap-6">
                            Capabilities
                            <span class="w-24 h-[4px] bg-indigo-500"></span>
                        </h2>

                        <div class="grid md:grid-cols-2 gap-1px bg-gray-100 border border-gray-100">
                            <div v-for="(spec, i) in [
                                { title: 'Ground Truth', desc: 'Managed data labeling services with high-precision human-in-the-loop loops.' },
                                { title: 'AutoPilot', desc: 'Fully automated ML lifecycle from data prep to tuning and deployment.' },
                                { title: 'Edge Manager', desc: 'Deploy and manage models across millions of edge devices instantly.' },
                                { title: 'Model Monitor', desc: 'Real-time drift detection and automated re-training triggers.' }
                            ]" :key="i" class="bg-white p-10 hover:bg-gray-50 transition-colors group cursor-default">
                                <div
                                    class="w-12 h-12 bg-gray-900 text-white flex items-center justify-center mb-8 rounded-none group-hover:bg-indigo-600 transition-colors">
                                    <span class="text-xs font-black">0{{ i + 1 }}</span>
                                </div>
                                <h4 class="text-xl font-black text-gray-900 mb-4 uppercase tracking-tight">{{ spec.title
                                    }}</h4>
                                <p class="text-sm font-bold text-gray-400 leading-relaxed uppercase tracking-wider">{{
                                    spec.desc }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Side Ops: AI Sidebar -->
                    <div class="w-full lg:w-80 flex flex-col gap-16 pt-4">
                        <div>
                            <h3 class="text-xs font-black text-gray-300 mb-10 uppercase tracking-[0.4em]">Resource Hub
                            </h3>
                            <nav class="flex flex-col">
                                <a v-for="link in ['Notebook Kernels', 'Algorithm Library', 'Training Jobs', 'Marketplace']"
                                    :key="link" href="#"
                                    class="group py-5 border-b border-gray-100 text-sm font-black text-gray-900 hover:text-indigo-600 transition-all uppercase tracking-tight flex justify-between items-center">
                                    {{ link }}
                                    <svg class="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all"
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="square" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </a>
                            </nav>
                        </div>

                        <div class="bg-gray-900 p-10 text-white relative overflow-hidden">
                            <div
                                class="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 transform rotate-45 translate-x-12 -translate-y-12">
                            </div>
                            <h3 class="text-[9px] font-black text-indigo-500 mb-10 uppercase tracking-[0.5em] italic">
                                Model Ops</h3>
                            <div class="flex flex-col gap-8">
                                <a v-for="action in ['Create Notebook', 'New Training Job', 'Deploy Endpoint']"
                                    :key="action" href="#"
                                    class="text-xs font-black text-gray-400 hover:text-white transition-colors flex items-center gap-4 uppercase tracking-widest">
                                    <span class="w-6 h-[1px] bg-gray-700 group-hover:bg-indigo-500"></span>
                                    {{ action }}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>

        <!-- Coming Soon Overlay -->
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
            <div class="max-w-2xl mx-auto px-8 text-center">
                <div class="inline-flex items-center gap-3 px-4 py-2 bg-indigo-600/20 border border-indigo-500/30 rounded-full mb-8">
                    <div class="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                    <span class="text-xs font-black text-indigo-400 uppercase tracking-widest">In Development</span>
                </div>
                <h2 class="text-6xl md:text-7xl font-black text-white mb-6 tracking-tighter uppercase italic">
                    Coming <span class="text-indigo-500">Soon</span>
                </h2>
                <p class="text-xl text-gray-400 font-bold mb-8 leading-relaxed">
                    SageMaker is currently under active development. We're building something extraordinary for machine learning at scale.
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <a href="/dashboard" class="px-8 py-4 bg-white text-gray-900 font-black text-sm hover:bg-gray-100 transition-all rounded-none uppercase tracking-tight">
                        ← Back to Dashboard
                    </a>
                    <div class="flex items-center gap-3 px-6 py-4 border border-gray-700 bg-gray-900/50 backdrop-blur-sm rounded-none">
                        <div class="w-2 h-2 bg-green-500 animate-ping"></div>
                        <span class="text-xs font-black text-gray-400 uppercase tracking-widest">ETA: Q2 2026</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Scoped styles if needed */
</style>
