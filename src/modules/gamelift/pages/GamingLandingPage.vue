<script setup lang="ts">
// Minimal setup for the landing page
const showComingSoon = import.meta.env.VITE_SHOW_GAMING_COMING_SOON === 'true'
</script>

<template>
    <div class="min-h-screen relative overflow-hidden bg-[#05080F]">
        <!-- Ambient Background -->
        <div class="absolute inset-0 pointer-events-none">
            <div
                class="absolute bottom-[20%] left-[10%] w-[60vw] h-[60vw] bg-purple-600/10 rounded-full blur-[120px] opacity-20">
            </div>
            <div
                class="absolute top-[10%] right-[20%] w-[50vw] h-[50vw] bg-pink-600/10 rounded-full blur-[100px] opacity-20">
            </div>
            <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]">
            </div>
        </div>

        <div class="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-20">
            <!-- Header -->
            <div class="max-w-3xl mb-20">
                <div
                    class="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold tracking-widest uppercase">
                    <span class="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                    GameLift Edge Network
                </div>
                <h1 class="text-6xl md:text-7xl font-bold text-white tracking-tight font-display mb-8">
                    Multiplayer.<br>
                    <span
                        class="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Reinvented.</span>
                </h1>
                <p class="text-xl text-slate-400 leading-relaxed font-light max-w-2xl">
                    Deploy distinct, low-latency game servers. Scale fleets instantly with the industry's most trusted
                    managed service.
                </p>

                <div class="flex flex-wrap gap-4 mt-10">
                    <router-link to="/gamelift/fleets/create"
                        class="btn-primary bg-purple-600 hover:bg-purple-500 shadow-purple-500/20 px-8 py-4 text-sm tracking-wide">
                        Create Fleet
                    </router-link>
                    <button class="btn-secondary px-8 py-4 text-sm tracking-wide">
                        View Documentation
                    </button>
                    <router-link to="/gaming"
                        class="btn-secondary px-8 py-4 text-sm tracking-wide border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
                        Console &rarr;
                    </router-link>
                </div>
            </div>

            <!-- Feature Grid -->
            <div class="grid md:grid-cols-3 gap-6 mb-24">
                <div class="glass-panel p-8 rounded-2xl group hover:bg-white/[0.03] transition-colors">
                    <div
                        class="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15" />
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold text-white mb-3">GameLift Fleets</h3>
                    <p class="text-sm text-slate-400 leading-relaxed">Manage fleets of EC2 instances with auto-scaling
                        to match player demand instantly.</p>
                </div>

                <div class="glass-panel p-8 rounded-2xl group hover:bg-white/[0.03] transition-colors">
                    <div
                        class="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center text-pink-400 mb-6 group-hover:scale-110 transition-transform">
                        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold text-white mb-3">FlexMatch</h3>
                    <p class="text-sm text-slate-400 leading-relaxed">Customizable matchmaking rules to group players
                        based on skill, latency, and custom attributes.</p>
                </div>

                <div class="glass-panel p-8 rounded-2xl group hover:bg-white/[0.03] transition-colors">
                    <div
                        class="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold text-white mb-3">Real-time Analytics</h3>
                    <p class="text-sm text-slate-400 leading-relaxed">Monitor active sessions, player counts, and server
                        health with granular telemetry.</p>
                </div>
            </div>

            <!-- Footer CTA -->
            <div class="mt-32 mb-20 text-center">
                <h2 class="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight font-display">Ready to deploy?
                </h2>
                <p class="text-slate-400 mb-10 max-w-xl mx-auto">
                    Join thousands of developers building the future of multiplayer gaming on Serwin Systems.
                </p>
                <div class="flex flex-col sm:flex-row justify-center gap-4">
                    <button
                        class="px-8 py-3 bg-gradient-to-r from-[#ff6d5a] to-[#ff9c8f] text-black font-bold rounded-lg hover:shadow-[0_0_20px_rgba(255,109,90,0.4)] transition-all transform hover:scale-105">
                        Create Free Account
                    </button>
                    <button
                        class="px-8 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-lg hover:bg-white/10 transition-colors">
                        Contact Sales
                    </button>
                </div>
            </div>
        </div>

        <!-- Status Bar Footer -->
        <div class="border-t border-white/5 bg-[#05080F]/80 backdrop-blur-md py-4">
            <div
                class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                <div class="flex items-center gap-2">
                    <div class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span>Status: All Systems Go</span>
                </div>
                <div class="flex gap-8">
                    <span>Latency: <span class="text-white">12ms</span></span>
                    <span>Uptime: <span class="text-white">99.99%</span></span>
                </div>
                <div class="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
                    <div
                        class="w-4 h-4 rounded-sm bg-gradient-to-br from-[#ff6d5a] to-[#ff9c8f] flex items-center justify-center text-[8px] text-black font-bold">
                        S</div>
                    <span>Serwin Systems</span>
                </div>
            </div>
        </div>

        <!-- Coming Soon Overlay -->
        <div v-if="showComingSoon"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
            <div class="max-w-2xl mx-auto px-8 text-center">
                <div
                    class="inline-flex items-center gap-3 px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-full mb-8">
                    <div class="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <span class="text-xs font-black text-purple-400 uppercase tracking-widest">In Development</span>
                </div>
                <h2 class="text-6xl md:text-7xl font-bold text-white mb-6 tracking-tight">
                    Coming <span
                        class="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Soon</span>
                </h2>
                <p class="text-xl text-slate-400 font-light mb-8 leading-relaxed max-w-xl mx-auto">
                    GameLift Edge is currently under active development. We're building the future of multiplayer gaming
                    infrastructure.
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <a href="/dashboard"
                        class="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all rounded-xl shadow-lg shadow-purple-500/20">
                        ← Back to Dashboard
                    </a>
                    <div class="flex items-center gap-3 px-6 py-4 glass-panel rounded-xl">
                        <div class="w-2 h-2 bg-green-500 animate-ping"></div>
                        <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">ETA: Q2 2026</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
