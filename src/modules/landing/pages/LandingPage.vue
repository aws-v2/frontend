<script setup lang="ts">
import { useToastStore } from '@/shared/store/toastStore'

const toastStore = useToastStore()

const triggerSuccess = () => {
    toastStore.addToast('Welcome to the Serwin Console!', 'success')
}

const triggerExplore = () => {
    toastStore.addToast('Explore our cloud solutions below.', 'info')
}
</script>

<template>
    <div class="bg-white min-h-screen font-sans">
        <!-- Hero Section -->
        <div class="bg-[#16191f] text-white py-24 px-16">
            <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                <div class="space-y-8">
                    <div
                        class="inline-flex items-center gap-2 px-3 py-1 bg-[var(--aws-blue)]/20 border border-[var(--aws-blue)]/30 rounded-full">
                        <span class="w-2 h-2 bg-[var(--aws-blue)] rounded-full animate-pulse"></span>
                        <span class="text-[10px] font-bold uppercase tracking-wider text-blue-400">Now Available: Serwin
                            S3</span>
                    </div>
                    <h1 class="text-6xl font-bold leading-tight">
                        Build the Future <br /> in the Cloud.
                    </h1>
                    <p class="text-xl text-gray-400 max-w-lg leading-relaxed">
                        Serwin provides the most comprehensive and broadly adopted cloud platform, offering over 200
                        fully featured services from data centers globally.
                    </p>
                    <div class="flex flex-wrap gap-4 pt-4">
                        <router-link to="/register" class="btn-aws-primary px-10 py-3 text-base">
                            Create a Free Account
                        </router-link>
                        <router-link to="/login"
                            class="px-10 py-3 bg-transparent border-2 border-white font-bold text-white rounded-sm hover:bg-white/10 transition-all">
                            Sign In to Console
                        </router-link>
                    </div>
                </div>

                <div class="hidden lg:block">
                    <div
                        class="bg-gradient-to-br from-[var(--aws-blue)]/20 to-purple-500/20 border border-white/10 rounded-lg p-12 backdrop-blur-sm">
                        <div class="bg-white/5 border border-white/10 rounded-sm p-8 space-y-6">
                            <div class="flex items-center justify-between border-b border-white/10 pb-4">
                                <span class="text-xs font-bold uppercase tracking-widest text-gray-400">Global
                                    Infrastructure</span>
                                <div class="flex gap-1">
                                    <div class="w-1 h-1 bg-blue-400 rounded-full"></div>
                                    <div class="w-1 h-1 bg-blue-400 rounded-full"></div>
                                    <div class="w-1 h-1 bg-blue-400 rounded-full"></div>
                                </div>
                            </div>
                            <div class="space-y-3">
                                <div v-for="i in 3" :key="i" class="h-6 bg-white/5 rounded-sm w-full animate-pulse"
                                    :style="{ opacity: 1 - (i * 0.2) }"></div>
                            </div>
                            <div class="pt-4 flex justify-between items-end">
                                <div class="space-y-1">
                                    <p class="text-[10px] text-gray-500 uppercase font-bold">Active Regions</p>
                                    <p class="text-2xl font-bold text-white">31</p>
                                </div>
                                <div class="text-[var(--aws-blue)] text-sm font-bold">Explore Global Map →</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Features Grid -->
        <div class="max-w-7xl mx-auto px-16 py-24">
            <div class="text-center mb-16">
                <h2 class="text-3xl font-bold text-gray-900 mb-4">Cloud computing with Serwin</h2>
                <p class="text-gray-500 max-w-2xl mx-auto leading-relaxed">
                    Whether you're looking for compute power, database storage, content delivery, or other
                    functionality, Serwin has the services to help you build sophisticated applications.
                </p>
            </div>

            <div class="grid md:grid-cols-3 gap-8">
                <div v-for="feature in ['Compute', 'Storage', 'Databases']" :key="feature"
                    class="p-8 border border-gray-100 hover:shadow-xl transition-all cursor-pointer group rounded-sm bg-gray-50/30">
                    <div
                        class="w-12 h-12 bg-white flex items-center justify-center border border-gray-200 rounded-sm mb-6 group-hover:border-[var(--aws-blue)] transition-colors">
                        <span class="text-2xl" v-if="feature === 'Compute'">⚡</span>
                        <span class="text-2xl" v-if="feature === 'Storage'">📦</span>
                        <span class="text-2xl" v-if="feature === 'Databases'">🗄️</span>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-4">{{ feature }}</h3>
                    <p class="text-sm text-gray-500 leading-relaxed mb-6">
                        Highly scalable and secure {{ feature.toLowerCase() }} solutions designed to grow with your
                        business needs.
                    </p>
                    <span @click="triggerExplore" class="text-sm font-bold text-[var(--aws-blue)] hover:underline">Learn
                        more →</span>
                </div>
            </div>
        </div>

        <!-- Call to Action -->
        <div class="bg-gray-50 border-y border-gray-200 py-16 px-16">
            <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">Ready to get started?</h2>
                    <p class="text-gray-500">Create your account and start building on Serwin today.</p>
                </div>
                <router-link to="/register" class="btn-aws-primary px-12 py-3 text-base shadow-lg shadow-orange-500/20">
                    Get Started for Free
                </router-link>
            </div>
        </div>
    </div>
</template>
