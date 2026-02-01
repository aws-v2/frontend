<script setup lang="ts">
// Minimal setup for the landing page
</script>

<template>
    <div
        class="min-h-screen bg-black text-white font-mono selection:bg-rose-500 selection:text-black relative overflow-hidden">
        <!-- Technical Grid Background -->
        <div class="fixed inset-0 z-0 pointer-events-none opacity-20 technical-grid"></div>

        <div class="relative z-10">
            <!-- Hero Section: Gaming Excellence -->
            <header class="max-w-7xl mx-auto px-10 pt-40 pb-24 border-x border-white/5">
                <div class="flex flex-col lg:flex-row gap-24 items-start">
                    <div class="flex-1">
                        <div class="inline-flex items-center gap-4 mb-12">
                            <span class="w-1 h-8 bg-rose-500"></span>
                            <span class="text-[10px] font-bold uppercase tracking-[0.5em] text-rose-500/60">Real-time
                                Matrix Layer</span>
                        </div>
                        <h1
                            class="text-7xl md:text-9xl font-black text-white mb-12 leading-[0.8] tracking-[0.02em] uppercase italic">
                            Serwin.<span class="text-rose-500">Gaming</span>
                        </h1>
                        <p
                            class="text-xl text-white/40 font-bold max-w-2xl leading-relaxed mb-16 uppercase tracking-widest">
                            High-density GPU clusters. Engineered for zero-lag multiplayer orchestration and absolute 4K
                            streaming velocity.
                        </p>
                        <div class="flex flex-wrap gap-8 items-center">
                            <button
                                class="px-12 py-5 bg-white text-black font-black text-xs hover:bg-rose-500 hover:text-black transition-all uppercase tracking-[0.2em] active:scale-95">
                                Initialize Fleet
                            </button>
                            <div
                                class="flex items-center gap-6 px-10 h-16 border border-white/10 bg-black group transition-all cursor-none">
                                <div class="w-1.5 h-1.5 bg-rose-500 animate-ping"></div>
                                <span
                                    class="text-[9px] font-black text-white/30 uppercase tracking-[0.4em] group-hover:text-white Transition-colors">Fleet_Active
                                    // 12ms Avg</span>
                            </div>
                        </div>
                    </div>

                    <!-- Bento Stats: Gaming Throughput -->
                    <div
                        class="w-full lg:w-[480px] grid grid-cols-2 gap-px bg-white/5 border border-white/5 shadow-2xl">
                        <div
                            class="col-span-2 p-12 bg-black flex flex-col justify-between aspect-video relative overflow-hidden group">
                            <div
                                class="absolute top-0 right-0 w-32 h-[2px] bg-rose-500 group-hover:w-full transition-all duration-700">
                            </div>
                            <div class="flex justify-between items-start">
                                <span
                                    class="text-5xl font-black italic tracking-tighter uppercase text-rose-500">1M+</span>
                                <svg class="w-8 h-8 text-white/20" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="square" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <p class="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] mb-4">
                                    Concurrent_Sessions</p>
                                <p
                                    class="text-[11px] font-bold text-white/30 leading-relaxed uppercase tracking-widest">
                                    Ultra-scale multiplayer management with automatic regional handovers.</p>
                            </div>
                        </div>
                        <div class="p-10 bg-black flex flex-col justify-center gap-4 group">
                            <span
                                class="text-3xl font-black text-white tracking-tighter group-hover:text-rose-400 transition-colors">12MS</span>
                            <span class="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">Edge
                                Response</span>
                        </div>
                        <div class="p-10 bg-[#050505] border-l border-white/5 flex flex-col justify-center gap-4 group">
                            <span
                                class="text-3xl font-black text-rose-700 tracking-tighter italic group-hover:text-rose-500 transition-colors">4K/144</span>
                            <span
                                class="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">STREAM_PROTOCOL</span>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Technical Architecture Grid -->
            <section class="max-w-7xl mx-auto px-10 py-40 border-x border-white/5 bg-[#050505] relative">
                <div class="flex flex-col lg:flex-row gap-32">
                    <div class="flex-1">
                        <h2
                            class="text-4xl font-black text-white uppercase tracking-tighter mb-20 inline-flex items-center gap-10">
                            CAPABILITIES
                            <span class="w-24 h-px bg-rose-500/40"></span>
                        </h2>

                        <div class="grid md:grid-cols-2 gap-px bg-white/5 border border-white/5">
                            <div v-for="(spec, i) in [
                                { title: 'Fleet_Manager', desc: 'Secure, resizable game fleets. Optimized for high-concurrency logic.' },
                                { title: 'Stream_Flux', desc: 'Deliver high-fidelity visuals to any global endpoint.' },
                                { title: 'Matchmaker', desc: 'Managed services with custom rulesets and sub-ms sorting.' },
                                { title: 'DDoS_Shield', desc: 'Hardware-level protection against volumetric volumetric attacks.' }
                            ]" :key="i"
                                class="bg-black p-12 hover:bg-white transition-all duration-700 cursor-crosshair group flex flex-col justify-between aspect-square">
                                <div class="text-[10px] font-black text-white/20 group-hover:text-black mb-10">SPEC //
                                    0{{ i + 1 }}</div>
                                <div>
                                    <h4
                                        class="text-2xl font-black text-white group-hover:text-black mb-6 uppercase tracking-tight">
                                        {{ spec.title }}</h4>
                                    <p
                                        class="text-[11px] font-bold text-white/30 group-hover:text-black leading-relaxed uppercase tracking-widest">
                                        {{ spec.desc }}</p>
                                </div>
                                <div class="h-1 w-8 bg-rose-500 mt-10 transition-all group-hover:w-full"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Side Ops: Gaming Sidebar -->
                    <div class="w-full lg:w-96 flex flex-col gap-24 pt-4">
                        <div>
                            <h3 class="text-[9px] font-black text-white/20 mb-12 uppercase tracking-[0.5em] italic">
                                Resource_Registry</h3>
                            <nav class="flex flex-col">
                                <a v-for="link in ['Engine_SDKs', 'Fleet_Metrics', 'Session_History', 'Gaming_Pricing']"
                                    :key="link" href="#"
                                    class="group py-6 border-b border-white/5 text-[11px] font-black text-white/60 hover:text-rose-500 transition-all uppercase tracking-widest flex justify-between items-center">
                                    {{ link }}
                                    <svg class="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all"
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="square" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </a>
                            </nav>
                        </div>

                        <div class="bg-black p-12 border border-white/10 relative overflow-hidden group">
                            <div
                                class="absolute top-0 right-0 w-32 h-[1px] bg-rose-500 group-hover:w-full transition-all duration-700">
                            </div>
                            <h3 class="text-[10px] font-black text-rose-500 mb-12 uppercase tracking-[0.5em] italic">
                                FLEET_OPS</h3>
                            <div class="flex flex-col gap-10">
                                <a v-for="action in ['Create_Fleet', 'Deploy_Alias', 'Setup_Matchmaking']" :key="action"
                                    href="#"
                                    class="text-[10px] font-black text-white/30 hover:text-white transition-colors flex items-center gap-6 uppercase tracking-[0.2em]">
                                    <div class="w-4 h-px bg-white/10 group-hover:bg-rose-500"></div>
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
