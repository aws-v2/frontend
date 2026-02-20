<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useToastStore } from '@/shared/store/toastStore'

const router = useRouter()

const toastStore = useToastStore()

const handleUpdate = (e: Event) => {
    e.preventDefault()
    toastStore.addToast('Password has been reset successfully!', 'success')
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

        <div class="relative z-10 w-full max-w-lg">
            <!-- Header Logo -->
            <div class="flex justify-center mb-10">
                <div class="flex items-center gap-3 cursor-pointer group" @click="router.push('/')">
                    <!-- Serwin Logo -->
                     <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ff6d5a] to-[#ff9c8f] flex items-center justify-center text-black font-bold text-2xl shadow-[0_0_20px_rgba(255,109,90,0.3)] group-hover:scale-110 transition-transform duration-300">
                        S
                    </div>
                </div>
            </div>

            <div class="glass-panel p-10 rounded-[32px] border border-white/5 relative overflow-hidden backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
                <!-- Top Glow Highlight -->
                <div class="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>

                <div class="text-center mb-10">
                    <h1 class="text-3xl md:text-4xl font-bold text-white mb-3 font-display tracking-tight">Reset Password</h1>
                    <p class="text-slate-400 text-base leading-relaxed font-light">Enter your new credentials below to restore account access.</p>
                </div>

                <form @submit="handleUpdate" class="space-y-8">
                    <div class="space-y-6">
                        <div class="space-y-3">
                            <label class="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">New password</label>
                            <input type="password" 
                                class="w-full bg-white/[0.03] border border-white/10 px-5 py-4 rounded-2xl focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none text-white placeholder-white/5 transition-all font-mono shadow-inner"
                                placeholder="••••••••••••" required>
                        </div>

                        <div class="space-y-3">
                            <label class="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Confirm new password</label>
                            <input type="password" 
                                class="w-full bg-white/[0.03] border border-white/10 px-5 py-4 rounded-2xl focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none text-white placeholder-white/5 transition-all font-mono shadow-inner"
                                placeholder="••••••••••••" required>
                        </div>
                    </div>

                    <button type="submit" 
                        class="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_rgba(37,99,235,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all">
                        Update password
                    </button>
                </form>
            </div>

            <div class="text-center mt-12 text-[10px] text-slate-600 uppercase tracking-[0.4em] font-bold font-mono group">
                &copy; 2026 Serwin Technologies <span class="text-blue-500/30 group-hover:text-blue-500/60 transition-colors">Nominal</span>
            </div>
        </div>
    </div>
</template>
