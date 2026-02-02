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
    if (route.path.startsWith('/s3')) return { name: 'Storage', color: 'var(--color-storage)' }
    if (route.path.startsWith('/compute')) return { name: 'Compute', color: 'var(--color-compute)' }
    if (route.path.startsWith('/sagemaker')) return { name: 'AI', color: 'var(--color-ai)' }
    if (route.path.startsWith('/gaming') || route.path.startsWith('/gamelift')) return { name: 'Gaming', color: 'var(--color-gaming)' }
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
        <nav
            class="sticky top-0 z-[100] h-20 bg-black text-white flex items-center justify-between px-10 font-mono border-b border-white/5">
            <!-- Left: Branding & Context -->
            <div class="flex items-center gap-10">
                <router-link to="/dashboard" class="flex items-center gap-4 group">
                    <div class="w-6 h-6 bg-white rotate-45 group-hover:scale-110 transition-transform"></div>
                    <span class="text-xl font-black uppercase tracking-[0.2em] italic">Serwin</span>
                </router-link>

                <div v-if="currentVertical" class="hidden md:flex items-center gap-4">
                    <div class="h-4 w-px bg-white/20"></div>
                    <div class="flex items-center gap-3">
                        <div class="w-1.5 h-1.5" :style="{ backgroundColor: currentVertical.color }"></div>
                        <span class="text-[10px] font-black uppercase tracking-[0.4em] text-white/70">{{
                            currentVertical.name }}</span>
                    </div>
                </div>

                <!-- Global Switcher Pulse -->
                <button @click="toggleMenu"
                    class="ml-6 flex items-center gap-4 h-11 px-6 bg-white/5 hover:bg-white/10 transition-all border border-white/5 uppercase group relative overflow-hidden">
                    <div class="flex flex-col gap-1 w-4">
                        <div class="w-full h-[1.5px] bg-white group-hover:bg-[#007AFF] transition-colors"></div>
                        <div class="w-2/3 h-[1.5px] bg-white group-hover:w-full transition-all"></div>
                        <div class="w-full h-[1.5px] bg-white"></div>
                    </div>
                    <span class="text-[9px] font-black tracking-[0.4em] whitespace-nowrap">Frontiers</span>
                </button>
            </div>

            <!-- Center: Universal Search (Flat) -->
            <div class="hidden lg:flex flex-1 max-w-xl mx-20">
                <div class="w-full relative group">
                    <input type="text" placeholder="SERWIN // SEARCH_PROTOCOL..."
                        class="w-full bg-[#050505] border border-white/5 px-8 py-3 text-[10px] font-black tracking-[0.3em] text-white placeholder-white/10 focus:outline-none focus:border-white/20 focus:bg-[#0A0A0A] transition-all uppercase" />
                    <div
                        class="absolute right-6 top-1/2 -translate-y-1/2 text-[8px] font-black text-white/10 group-focus-within:text-white/40 transition-colors uppercase tracking-widest">
                        [ ALT + K ]</div>
                </div>
            </div>

            <!-- Right: Identity & Services -->
            <div class="flex items-center gap-8">
                <div v-if="authStore.isAuthenticated" class="flex items-center gap-8">
                    <!-- Metrics Summary -->
                    <div class="hidden xl:flex items-center gap-12 border-r border-white/20 pr-12 leading-none">
                        <div class="group cursor-crosshair">
                            <div
                                class="text-[8px] font-black text-white/60 uppercase tracking-[0.4em] mb-2 group-hover:text-emerald-500 transition-colors">
                                Latency</div>
                            <div class="text-[10px] font-black text-emerald-400 font-mono tracking-tighter">12MS //
                                NOMINAL</div>
                        </div>
                        <div class="group cursor-crosshair">
                            <div
                                class="text-[8px] font-black text-white/60 uppercase tracking-[0.4em] mb-2 group-hover:text-[#007AFF] transition-colors">
                                Nodes</div>
                            <div class="text-[10px] font-black text-white font-mono tracking-tighter">04_ACTIVE</div>
                        </div>
                    </div>

                    <!-- Profile Context -->
                    <div class="relative group h-20 flex items-center cursor-pointer">
                        <div class="flex flex-col items-end">
                            <span
                                class="text-[8px] font-black text-white/50 uppercase tracking-[0.3em] mb-1">Session_0x1</span>
                            <div class="flex items-center gap-3">
                                <span
                                    class="text-[11px] font-black uppercase tracking-widest text-white/80 group-hover:text-white transition-colors">{{
                                        authStore.email?.split('@')[0] }}</span>
                                <div
                                    class="w-2.5 h-2.5 bg-white group-hover:bg-[#007AFF] group-hover:rotate-45 transition-all">
                                </div>
                            </div>
                        </div>

                        <!-- Minimal Dropdown -->
                        <div
                            class="absolute right-0 top-20 w-72 bg-black border border-white/10 shadow-3xl hidden group-hover:block z-[200]">
                            <div class="p-8 border-b border-white/5">
                                <div class="text-[8px] font-black text-white/20 uppercase tracking-[0.5em] mb-4">
                                    Operator_Registry</div>
                                <div class="text-xs font-black truncate tracking-widest">{{ authStore.email }}</div>
                            </div>
                            <div class="p-3">
                                <button
                                    class="w-full text-left px-5 py-4 hover:bg-white/5 text-[9px] font-black uppercase tracking-[0.4em] transition-colors">System_Core</button>
                                <button
                                    class="w-full text-left px-5 py-4 hover:bg-white/5 text-[9px] font-black uppercase tracking-[0.4em] transition-colors text-[#007AFF]">Security_Vault</button>
                                <div class="h-px bg-white/5 my-3"></div>
                                <button @click="handleLogout"
                                    class="w-full text-left px-5 py-4 hover:bg-red-600 text-[9px] font-black uppercase tracking-[0.4em] transition-colors uppercase">Terminate_Link</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else>
                    <router-link to="/login"
                        class="px-10 py-3 bg-white text-black font-black text-[10px] uppercase tracking-[0.4em] hover:bg-[#007AFF] hover:text-white transition-all">Auth_Connect</router-link>
                </div>
            </div>
        </nav>

        <!-- Global Global Switcher Overlay (Integrated Style) -->
        <Transition name="fade">
            <div v-if="isMenuOpen" class="fixed inset-0 z-[150] bg-black/95 backdrop-blur-xl px-10 pt-40"
                @click="isMenuOpen = false">
                <div class="max-w-7xl mx-auto">
                    <div class="flex items-center gap-6 mb-16 opacity-30">
                        <div class="w-px h-8 bg-white"></div>
                        <div class="text-[11px] font-black text-white uppercase tracking-[0.8em]">Select_Active_Frontier
                        </div>
                    </div>

                    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5 shadow-3xl"
                        @click.stop>

                        <!-- Compute -->
                        <router-link to="/lambda/functions" @click="isMenuOpen = false"
                            class="bg-black p-12 aspect-square flex flex-col justify-between group hover:bg-white transition-all duration-700">
                            <div class="text-white group-hover:text-black transition-colors"
                                style="color: var(--color-compute)">
                                <svg class="w-12 h-12 mb-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2.5"
                                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <h3 class="text-4xl font-black uppercase tracking-tighter">Compute</h3>
                                <p
                                    class="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-4 group-hover:text-black/40">
                                    Atomic // Lambda // Bare_Metal</p>
                            </div>
                        </router-link>

                        <!-- Storage -->
                        <router-link to="/s3/buckets" @click="isMenuOpen = false"
                            class="bg-black p-12 aspect-square flex flex-col justify-between group hover:bg-white transition-all duration-700">
                            <div class="text-white group-hover:text-black transition-colors"
                                style="color: var(--color-storage)">
                                <svg class="w-12 h-12 mb-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2.5"
                                        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4" />
                                </svg>
                                <h3 class="text-4xl font-black uppercase tracking-tighter">Storage</h3>
                                <p
                                    class="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-4 group-hover:text-black/40">
                                    Immutable // S3 // Relational</p>
                            </div>
                        </router-link>

                        <!-- AI -->
                        <router-link to="/sagemaker" @click="isMenuOpen = false"
                            class="bg-black p-12 aspect-square flex flex-col justify-between group hover:bg-white transition-all duration-1000">
                            <div class="text-white group-hover:text-black transition-colors"
                                style="color: var(--color-ai)">
                                <svg class="w-12 h-12 mb-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2.5"
                                        d="M9.663 17h4.673M12 3v1" />
                                </svg>
                                <h3 class="text-4xl font-black uppercase tracking-tighter">Neural</h3>
                                <p
                                    class="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-4 group-hover:text-black/40">
                                    Inference // Weights // clusters</p>
                            </div>
                        </router-link>

                        <!-- Gaming -->
                        <router-link to="/gaming" @click="isMenuOpen = false"
                            class="bg-black p-12 aspect-square flex flex-col justify-between group hover:bg-white transition-all duration-700">
                            <div class="text-white group-hover:text-black transition-colors"
                                style="color: var(--color-gaming)">
                                <svg class="w-12 h-12 mb-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2.5"
                                        d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15" />
                                </svg>
                                <h3 class="text-4xl font-black uppercase tracking-tighter">Gaming</h3>
                                <p
                                    class="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-4 group-hover:text-black/40">
                                    GameLift // Stream_Core // Edge</p>
                            </div>
                        </router-link>

                    </div>

                    <button @click="isMenuOpen = false"
                        class="mt-20 text-[10px] font-black text-white/20 hover:text-white transition-colors uppercase tracking-[1em]">
                        [ ESC ] Terminate Overlay
                    </button>
                </div>
            </div>
        </Transition>
    </template>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.shadow-3xl {
    box-shadow: 0 0 100px rgba(0, 0, 0, 0.8);
}
</style>
