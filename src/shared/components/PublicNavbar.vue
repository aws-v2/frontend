<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/authStore'
import { useToastStore } from '@/shared/store/toastStore'

defineProps<{
    activeLink?: 'compute' | 'storage' | 'gaming' | 'ai' | 'pricing' | 'docs',
    hasPrototypeBadge?: boolean,
    buttonText?: string,
    buttonLink?: string
}>()

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

const handleComingSoon = () => {
    toastStore.addToast('Feature coming soon! 🚀', 'info')
}

const handleS3Click = () => {
    // Smart Navigation: Check auth before choosing destination
    const isAuthenticated = authStore.isAuthenticated || !!localStorage.getItem('auth_token')

    if (isAuthenticated) {
        router.push({ name: 's3-buckets' })
    } else {
        router.push({ name: 's3-landing' })
    }
}
</script>

<template>
    <nav class="fixed w-full z-50 bg-white border-b border-[#eaeded] h-20">
        <div class="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
            <!-- ... logo omitted ... -->
            <div class="flex items-center gap-3 cursor-pointer group" @click="router.push('/')">
                <!-- Serwin Logo - Flat & Sharp -->
                <div
                    class="w-10 h-10 bg-[#232f3e] flex items-center justify-center text-[#ff9900] font-bold text-xl group-hover:scale-105 transition-transform">
                    S
                </div>
                <div class="flex items-center text-[#232f3e] font-bold text-2xl tracking-tight">
                    Serwin<span class="text-[#545b64] font-normal">Sys</span>
                </div>
            </div>

            <!-- ... links omitted ... -->
            <div class="hidden md:flex items-center gap-12 text-sm font-bold text-[#545b64]">
                <button @click="handleComingSoon"
                    class="transition-colors text-[#ff9900]/40 hover:text-[#ff9900]/60 flex items-center gap-1.5">
                    Compute
                </button>
                <a @click="handleS3Click" class="transition-colors cursor-pointer"
                    :class="activeLink === 'storage' ? 'text-[#ff9900]' : 'hover:text-[#ff9900]'">
                    Storage
                </a>
                <button @click="handleComingSoon"
                    class="transition-colors text-[#ff9900]/40 hover:text-[#ff9900]/60 flex items-center gap-1.5">
                    Gaming
                </button>
                <button @click="handleComingSoon"
                    class="transition-colors text-[#ff9900]/40 hover:text-[#ff9900]/60 flex items-center gap-1.5">
                    AI
                </button>
                <router-link to="/pricing" class="transition-colors"
                    :class="activeLink === 'pricing' ? 'text-[#ff9900]' : 'hover:text-[#ff9900]'">
                    Pricing
                </router-link>
                <router-link to="/docs" class="transition-colors"
                    :class="activeLink === 'docs' ? 'text-[#ff9900]' : 'hover:text-[#ff9900]'">
                    Docs
                </router-link>
            </div>

            <div class="flex gap-4 items-center">
                <template v-if="!authStore.isAuthenticated">
                    <router-link :to="buttonLink || '/login'"
                        class="px-5 py-2.5 bg-[#ff9900] text-white text-sm font-bold hover:bg-[#ec7211] transition-all rounded-none ring-1 ring-[#ff9900]">
                        {{ buttonText || 'Log in' }}
                    </router-link>
                </template>
                <template v-else>
                    <button @click="router.push('/dashboard')"
                        class="px-5 py-2.5 bg-[#ff9900] text-white text-sm font-bold hover:bg-[#ec7211] transition-all rounded-none ring-1 ring-[#ff9900]">
                        Console
                    </button>
                </template>
            </div>
        </div>
    </nav>
</template>
