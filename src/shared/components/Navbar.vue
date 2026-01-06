<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/modules/auth/store/authStore'
import { useRouter } from 'vue-router'
import ServicesMenu from './ServicesMenu.vue'

const authStore = useAuthStore()
const router = useRouter()
const isMenuOpen = ref(false)

const handleLogout = () => {
    authStore.logout()
    router.push('/login')
}
</script>

<template>
    <ServicesMenu :is-open="isMenuOpen" @close="isMenuOpen = false" />

    <nav
        class="sticky top-0 z-[100] h-12 bg-[var(--nav-bg)] text-[var(--nav-text)] flex items-center justify-between px-4 text-sm shadow-lg">
        <!-- Left: Logo & Services -->
        <div class="flex items-center gap-4">
            <router-link to="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div
                    class="w-8 h-8 bg-[var(--aws-orange)] flex items-center justify-center font-black text-white rounded-sm shadow-inner">
                    S</div>
                <span class="font-bold tracking-tight hidden md:block">Serwin</span>
            </router-link>

            <div class="h-6 w-[1px] bg-gray-700 mx-1"></div>

            <button @click="isMenuOpen = !isMenuOpen"
                class="flex items-center gap-2 px-3 py-1.5 rounded transition-all group"
                :class="isMenuOpen ? 'bg-gray-800 text-white' : 'hover:bg-gray-800 text-gray-300'">
                <div class="grid grid-cols-3 gap-0.5 opacity-60 group-hover:opacity-100">
                    <div v-for="i in 9" :key="i" class="w-0.5 h-0.5 bg-current rounded-full"></div>
                </div>
                <span class="font-bold text-[11px] uppercase tracking-wide">Services</span>
            </button>

            <!-- Search Bar -->
            <div class="relative ml-4 hidden lg:block group">
                <div class="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input type="text" placeholder="Search"
                    class="bg-[#2e343b] border border-gray-600 rounded-md py-1.5 pl-10 pr-20 w-80 text-[11px] focus:ring-1 focus:ring-[var(--aws-orange)] focus:outline-none transition-all placeholder-gray-500">
                <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <span class="text-[9px] text-gray-500 font-mono">[Alt+S]</span>
                </div>
            </div>
        </div>

        <!-- Right: Actions & User -->
        <div class="flex items-center h-full">
            <div class="flex items-center h-full mr-4 border-r border-gray-700 pr-4 gap-1">
                <button title="Terminal" class="p-2 hover:bg-gray-800 rounded transition-colors group relative">
                    <svg class="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </button>
                <button title="Notifications" class="p-2 hover:bg-gray-800 rounded transition-colors">
                    <svg class="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                </button>
            </div>

            <div v-if="authStore.isAuthenticated" class="flex items-center h-full">
                <button
                    class="px-3 h-full hover:bg-gray-800 text-[11px] font-bold flex items-center gap-2 transition-colors">
                    <span>Europe (Stockholm)</span>
                    <svg class="w-3 h-3 opacity-60" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                </button>

                <div class="relative group h-full">
                    <button
                        class="px-3 h-full bg-gray-800/30 hover:bg-gray-800 transition-colors flex flex-col justify-center items-end border-l border-gray-700">
                        <span
                            class="text-[9px] text-[var(--aws-orange)] font-bold leading-none mb-0.5">2805-6005-5441</span>
                        <div class="flex items-center gap-1">
                            <span class="font-bold text-[11px]">{{ authStore.email?.split('@')[0] }}</span>
                            <svg class="w-3 h-3 opacity-60" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                            </svg>
                        </div>
                    </button>
                    <!-- Dropdown Menu -->
                    <div
                        class="absolute right-0 top-12 w-56 bg-white dark:bg-[#1c2732] shadow-2xl border border-gray-200 dark:border-gray-700 hidden group-hover:block text-gray-800 dark:text-white py-2 z-[200]">
                        <div class="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                            <p class="text-[10px] text-gray-500 font-bold uppercase">Signed in as</p>
                            <p class="text-xs font-bold truncate">{{ authStore.email }}</p>
                        </div>
                        <button @click="handleLogout"
                            class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs mt-1">Sign
                            out</button>
                    </div>
                </div>
            </div>
            <div v-else class="flex gap-4 px-4 items-center h-full">
                <router-link to="/login" class="font-bold hover:text-[var(--aws-orange)] transition-colors text-xs">Sign
                    In</router-link>
            </div>
        </div>
    </nav>
</template>
