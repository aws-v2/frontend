<script setup lang="ts">
import { useToastStore } from '@/shared/store/toastStore'

const toastStore = useToastStore()

const triggerSuccess = () => {
    toastStore.addToast('Welcome to the future of cloud computing!', 'success')
}

const triggerFailure = () => {
    toastStore.addToast('Failed to connect to the retro-grid.', 'error')
}
</script>

<template>
    <div class="max-w-7xl mx-auto px-6 py-20">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
            <div class="space-y-8">
                <div
                    class="inline-block px-4 py-1 border-2 border-black font-mono text-xs uppercase tracking-[0.3em] font-bold">
                    v1.0.0-alpha.retro
                </div>
                <h1 class="text-7xl lg:text-8xl font-black leading-tight">
                    Cloud <br /> Simplified.
                </h1>
                <p class="text-xl font-medium max-w-md opacity-80 leading-relaxed">
                    The world's first retro-inspired cloud provider. Heavy borders, hard shadows, and lightning-fast
                    performance.
                </p>
                <div class="flex flex-wrap gap-4 pt-4">
                    <router-link to="/register" class="btn-retro-primary text-center">
                        Deploy Now
                    </router-link>
                    <button @click="triggerSuccess" class="btn-retro-secondary">
                        View Console
                    </button>
                </div>
            </div>

            <div class="relative group">
                <div
                    class="absolute -inset-4 bg-black/5 border-2 border-black/10 -z-10 group-hover:bg-black/10 transition-colors">
                </div>
                <div class="retro-box p-8 space-y-6 bg-white">
                    <div class="flex items-center justify-between border-b-2 border-black pb-4">
                        <span class="font-mono text-sm font-bold uppercase">System Status</span>
                        <div class="w-2 h-2 bg-green-500 animate-pulse"></div>
                    </div>
                    <div class="space-y-4">
                        <div v-for="i in 3" :key="i"
                            class="h-8 border-2 border-black/20 flex items-center px-4 font-mono text-xs opacity-40">
                            [SYSTEM_LOG] Initializing node {{ i }}...
                        </div>
                        <div class="loader-retro mt-8">
                            <div class="loader-retro-bar"></div>
                        </div>
                    </div>
                    <div class="flex justify-between items-end pt-4">
                        <button @click="triggerFailure"
                            class="text-[10px] font-bold uppercase tracking-widest hover:underline">
                            Debug System
                        </button>
                        <span class="font-hand text-2xl italic">Serwin OS v1</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-40 grid md:grid-cols-3 gap-8">
            <div v-for="feature in ['Compute', 'Storage', 'Network']" :key="feature"
                class="retro-box p-8 hover:-translate-y-2 transition-transform cursor-default">
                <h3 class="text-3xl font-black mb-4">{{ feature }}</h3>
                <p class="font-medium opacity-70">
                    Scaling your retro applications with enterprise-grade {{ feature.toLowerCase() }} primitives.
                </p>
            </div>
        </div>
    </div>
</template>
