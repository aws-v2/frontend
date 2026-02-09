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
    <div class="min-h-screen bg-[#05080F] relative overflow-hidden font-sans flex items-center justify-center p-6">
        <!-- Ambient Background -->
        <div class="absolute inset-0 pointer-events-none">
            <div
                class="absolute top-[20%] left-[30%] w-[60vw] h-[60vw] bg-emerald-600/10 rounded-full blur-[120px] opacity-20">
            </div>
            <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]">
            </div>
        </div>

        <div class="relative z-10 w-full max-w-2xl">
            <div class="glass-panel p-12 text-center rounded-3xl border-t border-t-white/10 relative overflow-hidden">
                <!-- Top Highlight -->
                <div
                    class="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent">
                </div>

                <!-- Success Icon -->
                <div
                    class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500/10 mb-8 relative group">
                    <div class="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping opacity-20"></div>
                    <div class="absolute inset-0 bg-emerald-500/10 rounded-full blur-xl"></div>
                    <svg class="w-10 h-10 text-emerald-400 relative z-10" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h1 class="text-4xl font-bold text-white mb-6 font-display">Welcome Aboard!</h1>
                <p class="text-lg text-slate-400 mb-10 leading-relaxed max-w-lg mx-auto">
                    Your Serwin Console account has been successfully provisioned. You now have full access to our
                    global infrastructure.
                </p>

                <div
                    class="bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-xl text-left max-w-lg mx-auto mb-10">
                    <h3 class="font-bold text-indigo-400 mb-4 flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Immediate Actions
                    </h3>
                    <ul class="space-y-3">
                        <li class="flex items-center gap-3 text-sm text-slate-300">
                            <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            Access the Management Console
                        </li>
                        <li class="flex items-center gap-3 text-sm text-slate-300">
                            <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            Review the Getting Started guide sent to your email
                        </li>
                    </ul>
                </div>

                <button @click="goToConsole"
                    class="px-10 py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto">
                    Launch Management Console
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </button>

                <p class="mt-8 text-[10px] text-slate-600 uppercase tracking-widest font-medium">
                    &copy; 2026 Serwin Technologies. All systems nominal.
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
