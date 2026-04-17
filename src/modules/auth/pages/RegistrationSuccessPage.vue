<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/authStore'

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
    authStore.completeRegistration()
})

const goToConsole = () => {
    router.push('/dashboard')
}
</script>

<template>
    <div class="min-h-screen bg-[#0b0d17] relative overflow-hidden font-sans flex items-center justify-center p-6 selection:bg-blue-500/30 selection:text-blue-200">
        <!-- Ambient Background -->
        <div class="absolute inset-0 pointer-events-none">
            <div class="absolute top-[-10%] left-[-5%] w-[60vw] h-[60vw] bg-blue-500/10 rounded-full blur-[120px] opacity-30"></div>
            <div class="absolute bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-indigo-500/10 rounded-full blur-[120px] opacity-20"></div>
            <!-- Grid -->
            <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_100%)]"></div>
        </div>

        <div class="relative z-10 w-full max-w-2xl">
            <!-- Header Logo -->
            <div class="flex justify-center mb-10">
                <div class="flex items-center gap-3 cursor-pointer group" @click="router.push('/')">
                    <!-- Serwin Logo -->
                     <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ff6d5a] to-[#ff9c8f] flex items-center justify-center text-black font-bold text-2xl shadow-[0_0_20px_rgba(255,109,90,0.3)] group-hover:scale-110 transition-transform duration-300">
                        S
                    </div>
                </div>
            </div>

            <div class="glass-panel p-10 md:p-14 text-center rounded-[32px] border border-white/5 relative overflow-hidden backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
                <!-- Top Glow Highlight -->
                <div class="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>

                <!-- Success Icon -->
                <div class="inline-flex items-center justify-center w-28 h-28 rounded-3xl bg-blue-500/10 mb-10 relative group">
                    <div class="absolute inset-0 bg-blue-500/20 rounded-3xl animate-ping opacity-10"></div>
                    <div class="absolute inset-0 bg-blue-500/10 rounded-3xl blur-2xl"></div>
                    <svg class="w-12 h-12 text-blue-400 relative z-10 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h1 class="text-4xl md:text-5xl font-bold text-white mb-6 font-display tracking-tight">Welcome Aboard</h1>
                <p class="text-base text-slate-400 mb-10 leading-relaxed max-w-lg mx-auto font-light">
                    Your <span class="text-white font-medium">Serwin Console</span> account has been provisioned. You now have full access to our global infrastructure network.
                </p>

                <div class="bg-white/[0.02] border border-white/5 p-8 rounded-[24px] text-left max-w-lg mx-auto mb-10 relative overflow-hidden group shadow-inner">
                    <div class="absolute top-0 left-0 w-1 h-full bg-blue-500/50"></div>
                    <h3 class="font-bold text-blue-400 text-xs uppercase tracking-[0.2em] mb-6 flex items-center gap-3 font-mono">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Initialization Steps
                    </h3>
                    <ul class="space-y-4">
                        <li class="flex items-start gap-4 text-sm text-slate-300">
                            <div class="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                            Access your dedicated management dashboard
                        </li>
                        <li class="flex items-start gap-4 text-sm text-slate-300">
                            <div class="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                            Configure your instance fleet across global regions
                        </li>
                    </ul>
                </div>

                <button @click="goToConsole"
                    class="w-full md:w-auto px-12 py-5 bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_rgba(37,99,235,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mx-auto">
                    Launch Management Console
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </button>

                <p class="mt-12 text-[10px] text-slate-600 uppercase tracking-[0.4em] font-bold font-mono group">
                    Serwin Systems <span class="text-blue-500/30 group-hover:text-blue-500/60 transition-colors">Nominal</span>
                </p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.glass-panel {
    @apply bg-[#0B0F19]/80 backdrop-blur-2xl border border-white/5 shadow-2xl;
}
</style>
