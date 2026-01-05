<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/authStore'
import { useToastStore } from '@/shared/store/toastStore'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

const isDark = ref(false)

const initTheme = () => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        isDark.value = true
        document.documentElement.setAttribute('data-theme', 'dark')
        document.documentElement.classList.add('dark')
    } else {
        isDark.value = false
        document.documentElement.setAttribute('data-theme', 'light')
        document.documentElement.classList.remove('dark')
    }
}

onMounted(() => {
    initTheme()
})

const toggleTheme = () => {
    isDark.value = !isDark.value
    const theme = isDark.value ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', theme)
    if (isDark.value) {
        document.documentElement.classList.add('dark')
    } else {
        document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
}

const handleLogout = () => {
    authStore.logout()
    toastStore.addToast('Logged out successfully', 'success')
    router.push('/login')
}
</script>

<template>
    <nav class="sticky top-0 z-50 bg-[var(--bg-main)] border-b-2 border-black dark:border-white transition-colors">
        <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <router-link to="/" class="flex items-center gap-3">
                <div class="w-10 h-10 bg-black dark:bg-white flex items-center justify-center">
                    <span class="text-white dark:text-black font-black text-xl">S</span>
                </div>
                <span class="text-2xl font-black uppercase tracking-tighter">Serwin</span>
            </router-link>

            <div class="flex items-center gap-8">
                <!-- Auth Links -->
                <template v-if="!authStore.isAuthenticated">
                    <router-link to="/login"
                        class="text-xs font-black uppercase tracking-widest hover:opacity-60 transition-opacity">
                        Sign In
                    </router-link>
                    <router-link to="/register" class="btn-retro-primary !py-2 !px-5 !text-[10px]">
                        Create Account
                    </router-link>
                </template>

                <template v-else>
                    <router-link to="/dashboard"
                        class="text-xs font-black uppercase tracking-widest hover:opacity-60 transition-opacity">
                        Console
                    </router-link>
                    <button @click="handleLogout"
                        class="text-xs font-black uppercase tracking-widest text-red-500 hover:opacity-60 transition-opacity">
                        Logout
                    </button>
                    <div class="h-4 w-[1px] bg-black/10 dark:bg-white/10"></div>
                    <span class="text-[10px] font-mono opacity-40 uppercase">{{ authStore.email }}</span>
                </template>

                <!-- Theme Toggle -->
                <button @click="toggleTheme"
                    class="w-9 h-9 border-2 border-black dark:border-white flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                    <span class="text-lg">{{ isDark ? '☀' : '☾' }}</span>
                </button>
            </div>
        </div>
    </nav>
</template>
