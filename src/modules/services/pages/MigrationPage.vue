<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Cost Calculator
const storageSize = ref(50) // TB
const transferAmount = ref(10) // TB/mo
const duration = ref(12) // Months

const awsCost = computed(() => {
    return (storageSize.value * 23 + transferAmount.value * 90) * duration.value
})

const serwinCost = computed(() => {
    return (storageSize.value * 6 + transferAmount.value * 0) * duration.value // No egress fees
})

const savings = computed(() => {
    return awsCost.value - serwinCost.value
})

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)
}

// Wizard Steps
const activeStep = ref(1)
const steps = [
    { num: 1, title: 'Connect Source', desc: 'Auth with AWS Read-Only access' },
    { num: 2, title: 'Select Buckets', desc: 'Choose what to migrate' },
    { num: 3, title: 'Configure Transfer', desc: 'Set bandwidth limits & sync' },
    { num: 4, title: 'Start Migration', desc: 'Monitor progress in real-time' }
]
</script>

<template>
    <div class="min-h-screen bg-[#0b0d17] relative overflow-hidden">
        <!-- Background Effects -->
        <div class="absolute inset-0 pointer-events-none">
            <div
                class="absolute top-0 left-1/2 -translate-x-1/2 w-[90vw] h-[40vh] bg-emerald-500/5 blur-[120px] rounded-b-full">
            </div>
            <div
                class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:linear-gradient(to_bottom,black_20%,transparent_100%)]">
            </div>
        </div>

        <div class="relative z-10 px-6 py-32">
            <div class="max-w-7xl mx-auto">
                <!-- Back Button -->
                <button @click="router.push('/dashboard')"
                    class="mb-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
                    <svg class="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span class="text-sm font-bold uppercase tracking-widest">Back to Dashboard</span>
                </button>

                <!-- Header -->
                <div class="mb-20">
                    <div
                        class="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-black tracking-widest uppercase">
                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        Easy Migration
                    </div>
                    <h1 class="text-6xl md:text-7xl font-bold text-white tracking-tight font-display mb-6">
                        Migrate in <span
                            class="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-200">minutes</span>,
                        <br>
                        not months.
                    </h1>
                    <p class="text-slate-400 text-xl font-light max-w-2xl">
                        Our S3-compatible storage layer makes migration a breeze. Use our automated tools or your
                        existing CLI scripts.
                    </p>
                </div>

                <!-- Migration Wizard Preview -->
                <div
                    class="glass-panel rounded-3xl border border-white/10 bg-white/[0.03] p-1 mb-24 relative overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none">
                    </div>

                    <div class="bg-[#0b0d17] rounded-[20px] p-8 md:p-12">
                        <!-- Steps Navigation -->
                        <div class="flex flex-wrap items-center justify-between gap-4 mb-16 relative">
                            <!-- Connector Line -->
                            <div
                                class="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2 hidden md:block z-0">
                            </div>

                            <button v-for="step in steps" :key="step.num" @click="activeStep = step.num"
                                class="relative z-10 flex items-center gap-4 group text-left max-w-[200px]">
                                <div class="w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg font-bold transition-all duration-300 bg-[#0b0d17]"
                                    :class="activeStep >= step.num ? 'border-orange-500 text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.3)]' : 'border-white/10 text-slate-500 group-hover:border-white/30'">
                                    {{ step.num }}
                                </div>
                                <div class="hidden md:block">
                                    <div class="text-sm font-bold transition-colors"
                                        :class="activeStep >= step.num ? 'text-white' : 'text-slate-500'">{{ step.title
                                        }}</div>
                                    <div class="text-[10px] text-slate-600">{{ step.desc }}</div>
                                </div>
                            </button>
                        </div>

                        <!-- Step Content (Interactive Placeholder) -->
                        <div
                            class="min-h-[300px] flex items-center justify-center border-2 border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                            <div class="text-center" v-if="activeStep === 1">
                                <div
                                    class="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-orange-400">
                                    <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                    </svg>
                                </div>
                                <h3 class="text-xl font-bold text-white mb-2">Connect AWS Account</h3>
                                <p class="text-slate-400 text-sm mb-6 max-w-md mx-auto">We'll need an Access Key with
                                    <code class="bg-white/10 px-1 py-0.5 rounded text-white">s3:ListBucket</code> and
                                    <code class="bg-white/10 px-1 py-0.5 rounded text-white">s3:GetObject</code>
                                    permissions.</p>
                                <div class="flex gap-4 justify-center">
                                    <input type="text" placeholder="Access Key ID"
                                        class="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500/50 w-64" />
                                    <button
                                        class="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg text-white font-bold text-sm hover:opacity-90">Verify
                                        Credentials</button>
                                </div>
                            </div>

                            <div class="text-center" v-else>
                                <p class="text-slate-500">Step {{ activeStep }} content placeholder</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Cost Calculator -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
                    <div>
                        <h2 class="text-2xl font-bold text-white mb-6 font-display">Calculate Your Savings</h2>
                        <p class="text-slate-400 mb-8 leading-loose">
                            See how much you can save by moving your archive and active data to Serwin.
                            We don't charge for egress or API requests, making your bill predictable.
                        </p>

                        <div class="space-y-8">
                            <div>
                                <div class="flex justify-between text-sm font-bold text-white mb-2">
                                    <span>Storage Size</span>
                                    <span class="text-orange-400">{{ storageSize }} TB</span>
                                </div>
                                <input type="range" v-model="storageSize" min="1" max="1000"
                                    class="w-full accent-orange-500" />
                            </div>
                            <div>
                                <div class="flex justify-between text-sm font-bold text-white mb-2">
                                    <span>Monthly Egress</span>
                                    <span class="text-orange-400">{{ transferAmount }} TB</span>
                                </div>
                                <input type="range" v-model="transferAmount" min="0" max="500"
                                    class="w-full accent-orange-500" />
                            </div>
                            <div>
                                <div class="flex justify-between text-sm font-bold text-white mb-2">
                                    <span>Contract Duration</span>
                                    <span class="text-orange-400">{{ duration }} Months</span>
                                </div>
                                <input type="range" v-model="duration" min="1" max="36"
                                    class="w-full accent-orange-500" />
                            </div>
                        </div>
                    </div>

                    <div
                        class="glass-panel rounded-3xl border border-white/10 bg-white/[0.03] p-8 flex flex-col items-center justify-center text-center">
                        <div class="text-slate-400 text-sm italic mb-2">Total Savings over {{ duration }} months</div>
                        <div
                            class="text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 mb-8 font-display">
                            {{ formatCurrency(savings) }}
                        </div>

                        <div class="w-full grid grid-cols-2 gap-4">
                            <div class="p-4 rounded-xl bg-white/5 border border-white/5">
                                <div class="text-xs text-slate-500 uppercase tracking-widest mb-1">AWS Cost</div>
                                <div class="text-xl font-bold text-slate-300 line-through decoration-red-500/50">{{
                                    formatCurrency(awsCost) }}</div>
                            </div>
                            <div class="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                                <div class="text-xs text-orange-300 uppercase tracking-widest mb-1">Serwin Cost</div>
                                <div class="text-xl font-bold text-white">{{ formatCurrency(serwinCost) }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Migration Tools -->
                <div class="glass-panel rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center">
                    <h2 class="text-2xl font-bold text-white mb-8 font-display">Tools for Every Workflow</h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div
                            class="p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                            <div class="text-4xl mb-4 group-hover:scale-110 transition-transform">💻</div>
                            <h3 class="text-lg font-bold text-white mb-2">Command Line</h3>
                            <p class="text-sm text-slate-400">Use our optimized <span
                                    class="font-mono text-orange-400">sw-migrate</span> CLI tool for high-performance
                                transfers.</p>
                        </div>
                        <div
                            class="p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                            <div class="text-4xl mb-4 group-hover:scale-110 transition-transform">📦</div>
                            <h3 class="text-lg font-bold text-white mb-2">AWS SDK Compatible</h3>
                            <p class="text-sm text-slate-400">Change the endpoint URL in your existing Python, Node.js,
                                or Go applications.</p>
                        </div>
                        <div
                            class="p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                            <div class="text-4xl mb-4 group-hover:scale-110 transition-transform">☁️</div>
                            <h3 class="text-lg font-bold text-white mb-2">Rclone & Cyberduck</h3>
                            <p class="text-sm text-slate-400">Native support for all major S3 file managers and sync
                                tools.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<style scoped>
.glass-panel {
    @apply backdrop-blur-3xl shadow-2xl;
}
</style>
