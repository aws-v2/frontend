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
    <template v-if="!isLandingPage && !route.meta.hideNavbar">
        <nav class="fixed top-0 w-full z-[100] h-20 bg-white border-b-2 border-[#eaeded] font-urbanist transition-all">
            <div class="max-w-[1600px] mx-auto px-6 h-full flex items-center justify-between">

                <!-- Left: Branding & Context -->
                <div class="flex items-center gap-8">
                    <router-link to="/" class="flex items-center gap-3 group">
                        <div
                            class="w-10 h-10 bg-[#232f3e] flex items-center justify-center text-[#ff9900] font-black text-xl hover:scale-105 transition-transform">
                            S
                        </div>
                        <div class="flex items-center text-[#232f3e] font-black text-2xl tracking-tighter">
                            Serwin<span class="text-[#545b64] font-normal">Sys</span>
                        </div>
                    </router-link>

                    <div v-if="currentVertical"
                        class="hidden md:flex items-center gap-3 pl-4 border-l-2 border-[#eaeded]">
                        <div class="w-2 h-2 rounded-full" :class="currentVertical.bg"></div>
                        <span class="text-[10px] font-black uppercase tracking-[0.2em] text-[#879196]">{{
                            currentVertical.name
                        }}</span>
                    </div>

                    <!-- Mega Menu Trigger -->
                    <button @click="toggleMenu"
                        class="ml-4 p-2 rounded-none bg-[#fafafa] border border-[#eaeded] text-[#545b64] hover:text-[#232f3e] hover:border-[#232f3e] transition-all">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                <!-- Center: Global Search -->
                <div class="hidden lg:flex flex-1 max-w-lg mx-12">
                    <div class="w-full relative group">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="h-4 w-4 text-[#879196] group-focus-within:text-[#ff9900] transition-colors"
                                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input type="text"
                            class="block w-full pl-10 pr-3 py-2 border-2 border-[#eaeded] rounded-none bg-white text-[#232f3e] placeholder-[#879196] focus:outline-none focus:border-[#232f3e] sm:text-xs transition-all font-black uppercase tracking-widest"
                            placeholder="Detailed search (Press '/')" />
                        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span
                                class="text-[#879196] text-[10px] font-black border border-[#eaeded] px-1.5 py-0.5">/</span>
                        </div>
                    </div>
                </div>

                <!-- Right: Profile & Actions -->
                <div class="flex items-center gap-6">
                    <div v-if="authStore.isAuthenticated" class="flex items-center gap-6">

                        <!-- Console Button -->
                        <router-link to="/dashboard"
                            class="hidden md:flex items-center px-4 py-2 bg-[#ff9900] text-[#232f3e] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#232f3e] hover:text-[#ff9900] transition-all border-b-2 border-transparent">
                            Console
                        </router-link>

                        <!-- Quick Stats (Desktop) -->
                        <div
                            class="hidden xl:flex items-center gap-6 text-[10px] text-[#879196] border-r-2 border-[#eaeded] pr-6 font-black uppercase tracking-widest">
                            <div class="flex flex-col items-end">
                                <span class="text-emerald-500 font-black">99.99%</span>
                                <span class="text-[9px] opacity-60">Health</span>
                            </div>
                            <div class="flex flex-col items-end">
                                <span class="text-[#232f3e] font-black">ke-nbo-ak</span>
                                <span class="text-[9px] opacity-60">Region</span>
                            </div>
                        </div>

                        <!-- Profile Dropdown -->
                        <div class="relative group h-full flex items-center cursor-pointer">
                            <div class="flex items-center gap-3">
                                <div class="text-right hidden sm:block">
                                    <div class="text-xs font-black text-[#232f3e] uppercase">{{
                                        authStore.email?.split('@')[0] }}</div>
                                    <div class="text-[9px] text-[#879196] uppercase tracking-widest font-medium">{{
                                        authStore.email
                                    }}</div>
                                </div>
                                <div class="w-9 h-9 bg-[#232f3e] p-[1px] group-hover:bg-[#ff9900] transition-colors">
                                    <div
                                        class="w-full h-full bg-[#fafafa] flex items-center justify-center font-black text-xs text-[#232f3e]">
                                        {{ authStore.email?.charAt(0).toUpperCase() }}
                                    </div>
                                </div>
                            </div>

                            <!-- Dropdown Menu -->
                            <div
                                class="absolute right-0 top-full w-60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                                <div
                                    class="bg-white border-2 border-[#232f3e] mt-2 overflow-hidden flex flex-col p-1 shadow-2xl">
                                    <router-link to="/account"
                                        class="flex items-center gap-3 px-4 py-3 hover:bg-[#fafafa] text-xs font-black uppercase tracking-widest text-[#545b64] hover:text-[#232f3e] transition-colors">
                                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Account
                                    </router-link>
                                    <router-link to="/settings"
                                        class="flex items-center gap-3 px-4 py-3 hover:bg-[#fafafa] text-xs font-black uppercase tracking-widest text-[#545b64] hover:text-[#232f3e] transition-colors">
                                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        </svg>
                                        Settings
                                    </router-link>
                                    <div class="h-[2px] bg-[#eaeded] my-1"></div>
                                    <button @click="handleLogout"
                                        class="flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-xs font-black uppercase tracking-widest text-red-600 transition-colors w-full text-left">
                                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
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
                            class="px-5 py-2.5 bg-[#232f3e] text-[#ff9900] text-xs font-black uppercase tracking-widest hover:bg-[#ff9900] hover:text-[#232f3e] transition-all">Login</router-link>
                    </div>
                </div>
            </div>
        </nav>

        <Transition name="fade">
            <div v-if="isMenuOpen"
                class="fixed inset-0 z-[150] bg-white/90 backdrop-blur-2xl flex items-center justify-center p-6"
                @click="isMenuOpen = false">
                <!-- Subtle Grid in Modal -->
                <div
                    class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)]">
                </div>
                <div class="max-w-5xl w-full relative z-10" @click.stop>
                    <div class="flex justify-between items-center mb-16 px-4">
                        <h2 class="text-4xl font-black text-[#232f3e] uppercase tracking-tighter">S3 <span
                                class="text-[#ff9900]">Services</span></h2>
                        <button @click="isMenuOpen = false"
                            class="p-4 bg-white border-2 border-[#eaeded] text-[#232f3e] hover:border-[#ff9900] hover:text-[#ff9900] transition-all shadow-sm">
                            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <!-- Storage Card -->
                        <router-link to="/s3/buckets" @click="isMenuOpen = false"
                            class="group bg-white border-2 border-[#eaeded] hover:border-[#ff9900] p-8 transition-all shadow-sm hover:shadow-xl relative overflow-hidden">
                            <div
                                class="absolute inset-0 bg-[#ff9900]/5 opacity-0 group-hover:opacity-100 transition-opacity">
                            </div>
                            <div class="relative z-10">
                                <div
                                    class="w-12 h-12 bg-[#fafafa] border border-[#eaeded] flex items-center justify-center text-[#ff9900] mb-6 group-hover:scale-110 group-hover:border-[#ff9900]/30 transition-transform">
                                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4" />
                                    </svg>
                                </div>
                                <h3 class="text-2xl font-black text-[#232f3e] uppercase tracking-tighter mb-3">Hyper
                                    Storage</h3>
                                <p class="text-sm text-[#545b64] font-medium leading-relaxed">S3-compatible object
                                    storage and
                                    managed RDS databases.</p>
                            </div>
                        </router-link>

                        <!-- Compute Card (Disabled) -->
                        <div
                            class="bg-[#fafafa] border-2 border-[#eaeded] p-8 opacity-60 grayscale cursor-not-allowed relative overflow-hidden">
                            <div
                                class="absolute top-4 right-4 bg-[#232f3e] text-white text-[10px] font-black px-2 py-1 uppercase tracking-tighter">
                                Coming Soon
                            </div>
                            <div class="relative z-10">
                                <div
                                    class="w-12 h-12 bg-white border border-[#eaeded] flex items-center justify-center text-[#879196] mb-6">
                                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h3 class="text-2xl font-black text-[#879196] uppercase tracking-tighter mb-3">Compute
                                </h3>
                                <p class="text-sm text-[#879196] font-medium leading-relaxed">High-performance instances
                                    and
                                    serverless functions.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </template>
</template>

<style scoped>
.glass-panel {
    @apply bg-white/[0.03] backdrop-blur-3xl border border-white/5 shadow-2xl;
}

.glass-card {
    @apply bg-white/[0.02] backdrop-blur-2xl border border-white/5 shadow-lg;
}
</style>
