<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/modules/auth/store/authStore'
import { useRouter, useRoute } from 'vue-router'
import ServicesMenu from './ServicesMenu.vue'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const isMenuOpen = ref(false)

const isLandingPage = computed(() => route.path === '/')

const handleLogout = () => {
    authStore.logout()
    router.push('/login')
}
</script>

<template>
    <template v-if="!isLandingPage">
        <ServicesMenu :is-open="isMenuOpen" @close="isMenuOpen = false" />

        <nav
            class="sticky top-0 z-[100] h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 flex items-center justify-between font-sans shadow-none">
            <!-- Left: Branding & Core Navigation -->
            <div class="flex items-center gap-8">
                <router-link to="/" class="flex items-center gap-3 active:scale-95 transition-transform">
                    <div class="w-10 h-10 bg-gray-900 flex items-center justify-center rounded-none">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2.5"
                                d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <span class="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">Serwin</span>
                </router-link>

                <div class="h-8 w-[1px] bg-gray-100 mx-2 hidden md:block"></div>

                <button @click="isMenuOpen = !isMenuOpen"
                    class="flex items-center gap-3 h-10 px-4 bg-gray-50 hover:bg-gray-900 hover:text-white transition-all duration-300 group rounded-none">
                    <div class="flex flex-col gap-1">
                        <div class="w-4 h-[2px] bg-current"></div>
                        <div class="w-2 h-[2px] bg-current"></div>
                    </div>
                    <span class="font-black text-[10px] uppercase tracking-[0.2em]">Console</span>
                </button>

                <!-- Search Field -->
                <div class="relative hidden lg:block">
                    <input type="text" placeholder="Protocol Search..."
                        class="bg-gray-50 border-none px-6 py-2.5 w-64 text-[11px] font-bold focus:ring-2 focus:ring-gray-900 focus:bg-white focus:w-80 transition-all rounded-none placeholder-gray-400">
                    <div
                        class="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-300 tracking-wider">
                        CTRL+K
                    </div>
                </div>
            </div>

            <!-- Right: Control Center -->
            <div class="flex items-center">
                <!-- Systems Icons -->
                <div class="hidden md:flex items-center border-r border-gray-100 pr-6 mr-6 gap-2">
                    <button title="System Monitoring"
                        class="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all rounded-none">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2"
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </button>
                    <button title="Alerts"
                        class="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all rounded-none relative">
                        <span class="absolute top-2 right-2 w-1.5 h-1.5 bg-emerald-500"></span>
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2"
                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </button>
                </div>

                <!-- Profile & Region -->
                <div v-if="authStore.isAuthenticated" class="flex items-center gap-1">
                    <button
                        class="px-4 py-2 hover:bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">
                        NA-EAST-1
                    </button>

                    <div class="relative group h-16 flex items-center">
                        <button
                            class="pl-6 h-10 border-l border-gray-100 flex flex-col justify-center items-end group-hover:bg-gray-50 transition-all px-4">
                            <span
                                class="text-[9px] text-emerald-600 font-black leading-none mb-1 uppercase tracking-tighter">Verified
                                Protocol</span>
                            <div class="flex items-center gap-2">
                                <span class="font-black text-xs uppercase tracking-tight text-gray-900">{{
                                    authStore.email?.split('@')[0] }}</span>
                                <div class="w-2 h-2 bg-gray-900"></div>
                            </div>
                        </button>
                        <!-- Dropdown -->
                        <div
                            class="absolute right-0 top-16 w-64 bg-white border border-gray-100 shadow-none hidden group-hover:block transition-all z-[200]">
                            <div class="p-6 border-b border-gray-50">
                                <p class="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-2">
                                    Authenticated User</p>
                                <p class="text-sm font-black text-gray-900 truncate">{{ authStore.email }}</p>
                            </div>
                            <div class="p-2">
                                <button @click="handleLogout"
                                    class="w-full text-left px-4 py-3 hover:bg-gray-900 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors mb-1">
                                    Terminate Session
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else class="flex gap-4 px-4 items-center h-full">
                    <router-link to="/login"
                        class="px-6 py-2 bg-gray-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-colors">
                        Login
                    </router-link>
                </div>
            </div>
        </nav>
    </template>
</template>
