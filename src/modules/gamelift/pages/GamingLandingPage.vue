<script setup lang="ts">
// Minimal setup for the landing page
</script>

<template>
    <div class="min-h-screen bg-white font-sans selection:bg-rose-100 relative overflow-hidden">
        <!-- Premium Ambient Background -->
        <div class="absolute inset-0 pointer-events-none">
            <div
                class="absolute top-[5%] right-[-15%] w-[55rem] h-[55rem] bg-rose-50/60 rounded-full blur-[140px] animate-pulse">
            </div>
            <div
                class="absolute bottom-[25%] left-[-10%] w-[45rem] h-[45rem] bg-orange-50/40 rounded-full blur-[120px]">
            </div>
        </div>

        <div class="relative z-10">
            <!-- Hero Section: Gaming Excellence -->
            <header class="max-w-7xl mx-auto px-8 md:px-16 pt-32 pb-24">
                <div class="flex flex-col lg:flex-row gap-20 items-start">
                    <div class="flex-1">
                        <div
                            class="inline-flex items-center gap-2 px-3 py-1 bg-rose-600 text-white text-[9px] font-black uppercase tracking-[0.3em] mb-10">
                            Real-time Matrix Layer
                        </div>
                        <h1
                            class="text-7xl md:text-9xl font-black text-gray-900 mb-10 leading-[0.85] tracking-tighter uppercase italic">
                            Flux.<span class="text-rose-500">Gaming</span>
                        </h1>
                        <p class="text-2xl text-gray-500 font-bold max-w-2xl leading-tight mb-12">
                            High-performance game hosting and ultra-low latency streaming protocols. Engineered for the
                            future of interactive entertainment.
                        </p>
                        <div class="flex flex-wrap gap-6 items-center">
                            <button
                                class="px-12 py-6 bg-gray-900 text-white font-black text-xl hover:bg-rose-600 transition-all duration-300 rounded-none uppercase tracking-tighter active:scale-95">
                                Initialize Fleet
                            </button>
                            <div
                                class="flex items-center gap-3 px-6 h-16 border border-gray-100 bg-white/50 backdrop-blur-sm">
                                <div class="w-2 h-2 bg-rose-500 animate-ping"></div>
                                <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global
                                    Fleet: 12ms Avg Latency</span>
                            </div>
                        </div>
                    </div>

                    <!-- Bento Stats: Gaming Throughput -->
                    <div class="w-full lg:w-[480px] grid grid-cols-2 gap-4">
                        <div
                            class="col-span-2 p-12 bg-gray-900 text-white flex flex-col justify-between aspect-video border-b-8 border-rose-500">
                            <div class="flex justify-between items-start">
                                <span class="text-5xl font-black italic tracking-tighter uppercase">1M+</span>
                                <svg class="w-8 h-8 text-rose-500" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="square" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <p class="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-2">
                                    Concurrent Sessions</p>
                                <p class="text-xs font-bold text-gray-400 leading-relaxed uppercase">Ultra-scale
                                    multiplayer session management with automatic regional distribution and zero-lag
                                    handovers.</p>
                            </div>
                        </div>
                        <div class="p-8 bg-white border border-gray-100 flex flex-col justify-center gap-2">
                            <span class="text-4xl font-black text-gray-900 tracking-tighter">12ms</span>
                            <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Edge
                                Response</span>
                        </div>
                        <div class="p-8 bg-rose-50 border border-rose-100 flex flex-col justify-center gap-2">
                            <span class="text-3xl font-black text-rose-700 tracking-tighter italic">4K/120</span>
                            <span
                                class="text-[9px] font-black text-rose-400 uppercase tracking-widest leading-none">STREAMING
                                PROTOCOL</span>
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
                            <span class="w-24 h-[4px] bg-rose-500"></span>
                        </h2>

                        <div class="grid md:grid-cols-2 gap-1px bg-gray-100 border border-gray-100">
                            <div v-for="(spec, i) in [
                                { title: 'Fleet Manager', desc: 'Secure, resizable game server fleets. Optimized for high-concurrency multiplayer logic.' },
                                { title: 'Stream Flux', desc: 'Ultra-low latency game streaming. Deliver high-fidelity visuals to any device anywhere.' },
                                { title: 'Matchmaker', desc: 'Managed matchmaking services with custom-defined rulesets and sub-ms latency sorting.' },
                                { title: 'DDoS Shield', desc: 'Automated hardware-level protection against massive volumetric attacks on game servers.' }
                            ]" :key="i" class="bg-white p-10 hover:bg-gray-50 transition-colors group cursor-default">
                                <div
                                    class="w-12 h-12 bg-gray-900 text-white flex items-center justify-center mb-8 rounded-none group-hover:bg-rose-600 transition-colors">
                                    <span class="text-xs font-black">0{{ i + 1 }}</span>
                                </div>
                                <h4 class="text-xl font-black text-gray-900 mb-4 uppercase tracking-tight">{{ spec.title
                                    }}</h4>
                                <p class="text-sm font-bold text-gray-400 leading-relaxed uppercase tracking-wider">{{
                                    spec.desc }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Side Ops: Gaming Sidebar -->
                    <div class="w-full lg:w-80 flex flex-col gap-16 pt-4">
                        <div>
                            <h3 class="text-xs font-black text-gray-300 mb-10 uppercase tracking-[0.4em]">Resource Hub
                            </h3>
                            <nav class="flex flex-col">
                                <a v-for="link in ['Engine SDKs', 'Fleet Metrics', 'Session History', 'Gaming Pricing']"
                                    :key="link" href="#"
                                    class="group py-5 border-b border-gray-100 text-sm font-black text-gray-900 hover:text-rose-600 transition-all uppercase tracking-tight flex justify-between items-center">
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
                                class="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 transform rotate-45 translate-x-12 -translate-y-12">
                            </div>
                            <h3 class="text-[9px] font-black text-rose-500 mb-10 uppercase tracking-[0.5em] italic">
                                Fleet Ops</h3>
                            <div class="flex flex-col gap-8">
                                <a v-for="action in ['Create Fleet', 'Deploy Alias', 'Setup Matchmaking']" :key="action"
                                    href="#"
                                    class="text-xs font-black text-gray-400 hover:text-white transition-colors flex items-center gap-4 uppercase tracking-widest">
                                    <span class="w-6 h-[1px] bg-gray-700 group-hover:bg-rose-500"></span>
                                    {{ action }}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>
