<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/modules/auth/store/authStore'
import { useRouter, useRoute } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const isMenuOpen = ref(false)

// Determine the current vertical based on the route
const currentVertical = computed(() => {
    if (route.path.startsWith('/s3')) return { name: 'Storage', color: 'text-emerald-400', bg: 'bg-emerald-500' }
    if (route.path.startsWith('/compute') || route.path.startsWith('/lambda')) return { name: 'Compute', color: 'text-blue-400', bg: 'bg-blue-500' }
    if (route.path.startsWith('/sagemaker')) return { name: 'AI', color: 'text-pink-400', bg: 'bg-pink-500' }
    if (route.path.startsWith('/gaming') || route.path.startsWith('/gamelift')) return { name: 'Gaming', color: 'text-purple-400', bg: 'bg-purple-500' }
    return null
})

const isLandingPage = computed(() => route.path === '/')

const handleLogout = () => {
    authStore.logout()
    router.push('/login')
}

const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value
}
</script>

<template>
    <template v-if="!isLandingPage">
        <nav class="sticky top-0 z-[100] h-20 bg-[#05080F]/90 backdrop-blur-xl border-b border-white/5 font-sans">
            <div class="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">

                <!-- Left: Branding & Context -->
                <div class="flex items-center gap-8">
                    <router-link to="/dashboard" class="flex items-center gap-3 group">
                        <div
                            class="w-8 h-8 relative flex items-center justify-center bg-white/5 border border-white/10 rounded overflow-hidden group-hover:bg-white/10 transition-colors">
                            <span class="font-bold font-display text-white">S</span>
                        </div>
                        <span class="text-lg font-bold tracking-tight text-white font-display">Serwin<span
                                class="text-indigo-500">_Console</span></span>
                    </router-link>

                    <div v-if="currentVertical" class="hidden md:flex items-center gap-3 pl-4 border-l border-white/10">
                        <div class="w-2 h-2 rounded-full" :class="currentVertical.bg"></div>
                        <span class="text-xs font-bold uppercase tracking-wider text-slate-400">{{ currentVertical.name
                            }}</span>
                    </div>

                    <!-- Mega Menu Trigger -->
                    <button @click="toggleMenu"
                        class="ml-4 p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                <!-- Center: Global Search -->
                <div class="hidden lg:flex flex-1 max-w-lg mx-12">
                    <div class="w-full relative group">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors"
                                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input type="text"
                            class="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-lg leading-5 bg-white/5 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-black focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 sm:text-xs transition-all font-medium"
                            placeholder="Detailed search (Press '/')" />
                        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span
                                class="text-slate-600 text-xs font-mono border border-white/10 rounded px-1.5 py-0.5">/</span>
                        </div>
                    </div>
                </div>

                <!-- Right: Profile & Actions -->
                <div class="flex items-center gap-6">
                    <div v-if="authStore.isAuthenticated" class="flex items-center gap-6">

                        <!-- Quick Stats (Desktop) -->
                        <div
                            class="hidden xl:flex items-center gap-6 text-xs text-slate-500 border-r border-white/10 pr-6">
                            <div class="flex flex-col items-end">
                                <span class="font-bold text-emerald-500">99.99%</span>
                                <span class="text-[10px] uppercase tracking-wider">Health</span>
                            </div>
                            <div class="flex flex-col items-end">
                                <span class="font-bold text-white">us-east-1</span>
                                <span class="text-[10px] uppercase tracking-wider">Region</span>
                            </div>
                        </div>

                        <!-- Profile Dropdown -->
                        <div class="relative group h-16 flex items-center cursor-pointer">
                            <div class="flex items-center gap-3">
                                <div class="text-right hidden sm:block">
                                    <div class="text-xs font-bold text-white">{{ authStore.email?.split('@')[0] }}</div>
                                    <div class="text-[10px] text-slate-500 uppercase tracking-widest">{{ authStore.email
                                        }}</div>
                                </div>
                                <div
                                    class="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[1px]">
                                    <div
                                        class="w-full h-full rounded-full bg-[#05080F] flex items-center justify-center font-bold text-xs text-white">
                                        {{ authStore.email?.charAt(0).toUpperCase() }}
                                    </div>
                                </div>
                            </div>

                            <!-- Dropdown Menu -->
                            <div
                                class="absolute right-0 top-14 w-60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                                <div class="glass-panel rounded-xl mt-2 overflow-hidden flex flex-col p-1">
                                    <router-link to="/account"
                                        class="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-lg text-sm text-slate-300 hover:text-white transition-colors">
                                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Account
                                    </router-link>
                                    <router-link to="/settings"
                                        class="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-lg text-sm text-slate-300 hover:text-white transition-colors">
                                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Settings
                                    </router-link>
                                    <div class="h-px bg-white/5 my-1"></div>
                                    <button @click="handleLogout"
                                        class="flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-sm text-slate-300 transition-colors w-full text-left">
                                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Unauthenticated View -->
                    <div v-else class="flex items-center gap-4">
                        <router-link to="/login"
                            class="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Login</router-link>
                        <router-link to="/register"
                            class="px-5 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-indigo-50 transition-colors rounded-lg">
                            Console
                        </router-link>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Full Screen Mega Menu Overlay -->
        <Transition name="fade">
            <div v-if="isMenuOpen"
                class="fixed inset-0 z-[150] bg-[#05080F]/95 backdrop-blur-3xl flex items-center justify-center p-6"
                @click="isMenuOpen = false">
                <div class="max-w-5xl w-full" @click.stop>
                    <div class="flex justify-between items-center mb-16">
                        <h2 class="text-3xl font-bold font-display text-white">Platform Services</h2>
                        <button @click="isMenuOpen = false"
                            class="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <!-- Compute Card -->
                        <router-link to="/compute" @click="isMenuOpen = false"
                            class="group glass-card p-8 rounded-2xl relative overflow-hidden">
                            <div
                                class="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            </div>
                            <div class="relative z-10">
                                <div
                                    class="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 class="text-xl font-bold text-white mb-2">Compute & Lambda</h3>
                                <p class="text-sm text-slate-400 leading-relaxed">Serverless functions and auto-scaling
                                    bare metal nodes.</p>
                            </div>
                        </router-link>

                        <!-- Storage Card -->
                        <router-link to="/s3" @click="isMenuOpen = false"
                            class="group glass-card p-8 rounded-2xl relative overflow-hidden">
                            <div
                                class="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            </div>
                            <div class="relative z-10">
                                <div
                                    class="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4" />
                                    </svg>
                                </div>
                                <h3 class="text-xl font-bold text-white mb-2">Hyper Storage</h3>
                                <p class="text-sm text-slate-400 leading-relaxed">S3-compatible object storage and
                                    managed RDS databases.</p>
                            </div>
                        </router-link>

                        <!-- Gaming Card -->
                        <router-link to="/gaming" @click="isMenuOpen = false"
                            class="group glass-card p-8 rounded-2xl relative overflow-hidden">
                            <div
                                class="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            </div>
                            <div class="relative z-10">
                                <div
                                    class="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15" />
                                    </svg>
                                </div>
                                <h3 class="text-xl font-bold text-white mb-2">GameLift Edge</h3>
                                <p class="text-sm text-slate-400 leading-relaxed">Low-latency multiplayer server fleet
                                    management.</p>
                            </div>
                        </router-link>

                        <!-- SageMaker Card -->
                        <router-link to="/sagemaker" @click="isMenuOpen = false"
                            class="group glass-card p-8 rounded-2xl relative overflow-hidden">
                            <div
                                class="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            </div>
                            <div class="relative z-10">
                                <div
                                    class="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center text-pink-400 mb-6 group-hover:scale-110 transition-transform">
                                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <h3 class="text-xl font-bold text-white mb-2">SageMaker AI</h3>
                                <p class="text-sm text-slate-400 leading-relaxed">Build, train, and deploy machine
                                    learning models at scale.</p>
                            </div>
                        </router-link>
                    </div>
                </div>
            </div>
        </Transition>
    </template>
</template>

<style scoped>
.glass-panel {
    @apply bg-[#0B0F19]/90 backdrop-blur-xl border border-white/5 shadow-2xl;
}

.glass-card {
    @apply bg-[#0B0F19]/50 border border-white/5 shadow-lg;
}
</style>
