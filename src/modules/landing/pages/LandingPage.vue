<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// --- Hero State Management ---
const activeTab = ref<'compute' | 'gaming' | 'storage'>('compute')
const tabs = [
    { id: 'compute', label: 'Compute', icon: 'cpu', color: 'text-blue-400', bg: 'bg-blue-500', desc: 'Elastic Bare-Metal' },
    { id: 'gaming', label: 'Gaming', icon: 'gamepad', color: 'text-purple-400', bg: 'bg-purple-500', desc: 'Low-Latency Edge' },
    { id: 'storage', label: 'Storage', icon: 'database', color: 'text-emerald-400', bg: 'bg-emerald-500', desc: 'Immutable Data' }
] as const

// Auto-rotate tabs every 5 seconds if user hasn't interacted
let autoRotateInterval: any
const pauseAutoRotate = ref(false)

onMounted(() => {
    window.scrollTo(0, 0)
    startAutoRotate()
})

onUnmounted(() => {
    stopAutoRotate()
})

const startAutoRotate = () => {
    autoRotateInterval = setInterval(() => {
        if (pauseAutoRotate.value) return
        const currentIndex = tabs.findIndex(t => t.id === activeTab.value)
        const nextIndex = (currentIndex + 1) % tabs.length
        activeTab.value = tabs[nextIndex].id  ?? 0
    }, 5000)
}

const stopAutoRotate = () => {
    clearInterval(autoRotateInterval)
}

const setTab = (id: typeof activeTab.value) => {
    activeTab.value = id
    pauseAutoRotate.value = true // User took control, stop auto-rotating
}

const handleJoin = () => {
    router.push('/register')
}

// --- Smooth Scroll ---
const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
}

// --- Mouse Tilt Logic (Re-used) ---
const heroRef = ref<HTMLElement | null>(null)
const mouseX = ref(0)
const mouseY = ref(0)

const handleMouseMove = (e: MouseEvent) => {
    if (!heroRef.value) return
    const rect = heroRef.value.getBoundingClientRect()
    // Calculate percentage from center (-1 to 1)
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    
    mouseX.value = (x - 0.5) * 2
    mouseY.value = (y - 0.5) * 2
}

const tiltStyle = computed(() => {
    // Subtle tilt
    return {
        transform: `perspective(1000px) rotateX(${mouseY.value * -2}deg) rotateY(${mouseX.value * 2}deg)`,
    }
})

</script>

<template>
    <div class="min-h-screen bg-[#05080F] text-slate-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden">
        
        <!-- Global Background Effects -->
        <div class="fixed inset-0 z-0 pointer-events-none">
            <!-- Noise -->
            <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04]"></div>
            
            <!-- Dynamic Orbs based on active tab -->
            <div class="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] transition-all duration-1000 ease-in-out opacity-20"
                :class="{
                    'bg-blue-600': activeTab === 'compute',
                    'bg-purple-600': activeTab === 'gaming',
                    'bg-emerald-600': activeTab === 'storage'
                }"></div>
                
             <div class="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] transition-all duration-1000 ease-in-out opacity-20"
                :class="{
                    'bg-cyan-600': activeTab === 'compute',
                    'bg-pink-600': activeTab === 'gaming',
                    'bg-teal-600': activeTab === 'storage'
                }"></div>
        </div>

        <!-- Navigation -->
        <nav class="fixed top-0 left-0 w-full z-50 bg-[#05080F]/80 backdrop-blur-xl border-b border-white/5">
            <div class="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                <div class="flex items-center gap-3 cursor-pointer group" @click="router.push('/')">
                    <div class="w-9 h-9 relative flex items-center justify-center bg-white/5 border border-white/10 rounded overflow-hidden">
                        <div class="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span class="font-bold font-display text-lg tracking-tight">S</span>
                    </div>
                    <span class="text-lg font-bold tracking-tight text-white font-display">Serwin<span class="text-indigo-500">_Sys</span></span>
                </div>
                
                <div class="hidden md:flex items-center p-1 bg-white/5 rounded-full border border-white/5 backdrop-blur-md">
                    <router-link to="/compute" class="px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-white/10 hover:text-white transition-all text-slate-400 cursor-pointer">Compute</router-link>
                    <router-link to="/gaming" class="px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-white/10 hover:text-white transition-all text-slate-400 cursor-pointer">Gaming</router-link>
                    <router-link to="/s3" class="px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-white/10 hover:text-white transition-all text-slate-400 cursor-pointer">Storage</router-link>
                </div>
                
                <div class="flex gap-4 items-center">
                    <router-link to="/login" class="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Login</router-link>
                    <router-link to="/register" class="px-5 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-indigo-50 transition-colors">
                        Console
                    </router-link>
                </div>
            </div>
        </nav>

        <!-- Dynamic Hero Section -->
        <header class="relative pt-40 pb-32 overflow-hidden min-h-screen flex items-center" ref="heroRef" @mousemove="handleMouseMove">
            <div class="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
                
                <!-- Left: Control Center -->
                <div class="lg:col-span-5 space-y-10">
                    <div class="space-y-4">
                        <div class="inline-flex items-center gap-2 text-xs font-mono text-indigo-400">
                            <span class="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                            SYSTEM_STATUS: ONLINE
                        </div>
                        <h1 class="text-6xl md:text-8xl font-bold text-white leading-[0.9] font-display">
                            Build <br/>
                            <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-white">Beyond.</span>
                        </h1>
                        <p class="text-lg text-slate-400 leading-relaxed max-w-md">
                            The unified infrastructure protocol.
                            High-density compute, low-latency gaming, and infinite storage in one atomic platform.
                        </p>
                    </div>

                    <!-- Mode Switcher -->
                    <div class="flex flex-col gap-2">
                        <div v-for="tab in tabs" :key="tab.id" 
                            @click="setTab(tab.id)"
                            class="group cursor-pointer relative p-4 rounded-xl border transition-all duration-300 overflow-hidden"
                            :class="activeTab === tab.id ? 'bg-white/5 border-white/10' : 'bg-transparent border-transparent opacity-50 hover:opacity-100'"
                        >
                            <!-- Progress Bar for Active Tab -->
                            <div v-if="activeTab === tab.id && !pauseAutoRotate" class="absolute bottom-0 left-0 h-0.5 bg-white/20 w-full">
                                <div class="h-full bg-indigo-500 w-full animate-progress origin-left"></div>
                            </div>

                            <div class="flex items-center justify-between relative z-10">
                                <div class="flex items-center gap-4">
                                    <div class="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                                        :class="activeTab === tab.id ? tab.bg + '/20 ' + tab.color : 'bg-white/5 text-slate-500'">
                                        <!-- Icons -->
                                        <svg v-if="tab.id === 'compute'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                                        <svg v-if="tab.id === 'gaming'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>
                                        <svg v-if="tab.id === 'storage'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 01-2 2v4a2 2 0 012 2h14a2 2 0 012-2v-4a2 2 0 01-2-2m-2-4h.01M17 16h.01" /></svg>
                                    </div>
                                    <div>
                                        <h3 class="font-bold text-white text-lg font-display">{{ tab.label }}</h3>
                                        <p class="text-xs text-slate-400 font-mono uppercase tracking-wider">{{ tab.desc }}</p>
                                    </div>
                                </div>
                                <div class="w-2 h-2 rounded-full transition-colors" :class="activeTab === tab.id ? 'bg-white' : 'bg-transparent group-hover:bg-white/20'"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right: Visualizer -->
                <div class="lg:col-span-7 h-[600px] relative perspective-1000" :style="tiltStyle">
                    <!-- Base Container -->
                    <div class="absolute inset-0 bg-[#0A0E18] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col transition-all duration-500">
                        
                        <!-- Header -->
                        <div class="h-12 border-b border-white/5 flex items-center px-6 justify-between bg-white/[0.02]">
                            <div class="flex gap-2">
                                <div class="w-3 h-3 rounded-full bg-red-500/20"></div>
                                <div class="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                                <div class="w-3 h-3 rounded-full bg-green-500/20"></div>
                            </div>
                            <div class="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
                                Visualize // {{ activeTab.toUpperCase() }}_REGION_1
                            </div>
                        </div>

                        <!-- Content Area -->
                        <div class="flex-1 relative p-8">
                            
                            <!-- COMPUTE VISUALIZATION -->
                            <transition name="fade" mode="out-in">
                                <div v-if="activeTab === 'compute'" key="compute" class="h-full flex flex-col">
                                    <div class="grid grid-cols-4 gap-4 h-full">
                                        <div v-for="i in 16" :key="i" class="bg-blue-500/5 border border-blue-500/10 rounded-lg relative overflow-hidden group hover:bg-blue-500/10 transition-colors">
                                            <div class="absolute inset-x-0 bottom-0 h-1 bg-blue-500/50 group-hover:h-full transition-all duration-500 opacity-20"></div>
                                            <div class="absolute top-2 left-2 text-[10px] font-mono text-blue-400 opactiy-50">NODE_{{ i < 10 ? '0'+i : i }}</div>
                                            <div class="absolute bottom-2 right-2 flex gap-1">
                                                <div class="w-1 h-3 bg-blue-500 animate-pulse" :style="{ animationDelay: i * 100 + 'ms' }"></div>
                                                <div class="w-1 h-2 bg-blue-500/50"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="mt-8 flex justify-between items-center bg-blue-900/10 p-4 rounded-xl border border-blue-500/20">
                                        <div class="text-xs font-mono text-blue-300">
                                            <span class="block text-slate-500 mb-1">CLUSTER LOAD</span>
                                            92.4% WARNING
                                        </div>
                                        <div class="text-3xl font-display font-bold text-white">142 TB/s</div>
                                    </div>
                                </div>

                                <!-- GAMING VISUALIZATION -->
                                <div v-else-if="activeTab === 'gaming'" key="gaming" class="h-full flex flex-col justify-center items-center relative">
                                    <!-- Radar / Map Effect -->
                                    <div class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                                        <div class="w-[400px] h-[400px] border border-purple-500/30 rounded-full flex items-center justify-center">
                                            <div class="w-[300px] h-[300px] border border-purple-500/30 rounded-full flex items-center justify-center">
                                                <div class="w-[200px] h-[200px] border border-purple-500/30 rounded-full"></div>
                                            </div>
                                        </div>
                                        <div class="absolute w-full h-[1px] bg-purple-500/30 top-1/2"></div>
                                        <div class="absolute h-full w-[1px] bg-purple-500/30 left-1/2"></div>
                                    </div>
                                    
                                    <div class="relative z-10 grid grid-cols-2 gap-8 w-full">
                                        <div class="bg-purple-900/20 p-6 rounded-2xl border border-purple-500/30 backdrop-blur-sm">
                                            <div class="text-xs text-purple-300 font-mono mb-2">LATENCY</div>
                                            <div class="text-5xl font-mono text-white font-bold">12<span class="text-lg text-purple-400">ms</span></div>
                                            <div class="w-full bg-purple-900/50 h-1 mt-4 rounded-full overflow-hidden">
                                                <div class="h-full bg-purple-500 w-[12%]"></div>
                                            </div>
                                        </div>
                                        <div class="bg-purple-900/20 p-6 rounded-2xl border border-purple-500/30 backdrop-blur-sm">
                                            <div class="text-xs text-purple-300 font-mono mb-2">ACTIVE SESSIONS</div>
                                            <div class="text-5xl font-mono text-white font-bold">8.4<span class="text-lg text-purple-400">M</span></div>
                                            <div class="w-full bg-purple-900/50 h-1 mt-4 rounded-full overflow-hidden">
                                                <div class="h-full bg-purple-500 w-[84%]"></div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="absolute bottom-0 w-full p-4">
                                        <div class="font-mono text-[10px] text-purple-400 text-center animate-pulse">Scanning Matchmaking Regions...</div>
                                    </div>
                                </div>

                                <!-- STORAGE VISUALIZATION -->
                                <div v-else-if="activeTab === 'storage'" key="storage" class="h-full flex flex-col relative overflow-hidden">
                                     <div class="absolute inset-0 flex flex-col gap-1 opacity-50">
                                        <div v-for="n in 20" :key="n" class="h-6 w-full flex gap-1">
                                            <div v-for="m in 15" :key="m" class="h-full flex-1 bg-emerald-500/10 rounded-sm" :style="{ opacity: Math.random() > 0.5 ? 0.2 : 0.8 }"></div>
                                        </div>
                                     </div>
                                     
                                     <div class="relative z-10 bg-[#0A0E18]/90 backdrop-blur-sm flex-1 m-8 border border-emerald-500/20 rounded-xl p-8 flex flex-col justify-center text-center">
                                        <div class="w-20 h-20 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                            <svg class="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                        <h3 class="text-3xl font-bold text-white mb-2">Data Integrity Verified</h3>
                                        <p class="text-emerald-400 font-mono text-sm">HASH: 0x7F2A...9B1C</p>
                                        
                                        <div class="mt-8 grid grid-cols-3 gap-4 text-center">
                                            <div>
                                                <div class="text-2xl font-bold text-white">49 PB</div>
                                                <div class="text-[10px] text-slate-500 uppercase">US-EAST</div>
                                            </div>
                                            <div>
                                                <div class="text-2xl font-bold text-white">112 PB</div>
                                                <div class="text-[10px] text-slate-500 uppercase">EU-WEST</div>
                                            </div>
                                            <div>
                                                <div class="text-2xl font-bold text-white">88 PB</div>
                                                <div class="text-[10px] text-slate-500 uppercase">AP-SOUTH</div>
                                            </div>
                                        </div>
                                     </div>
                                </div>
                            </transition>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <!-- 1. COMPUTE DEEP DIVE -->
        <section id="compute" class="py-32 relative border-t border-white/5 bg-[#080C14]">
            <div class="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
                <div>
                     <div class="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-8 border border-blue-600/40">
                        <svg class="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                     </div>
                     <h2 class="text-5xl font-bold text-white mb-6 font-display">Atomic Compute.</h2>
                     <p class="text-lg text-slate-400 mb-8 leading-relaxed">
                        Access raw, unbridled processing power. Our bare-metal instances strip away the hypervisor tax, giving your code direct access to the silicon.
                     </p>
                     
                     <ul class="space-y-4 font-mono text-sm text-slate-300">
                        <li class="flex items-center gap-3">
                            <span class="text-blue-500">[✓]</span> Intel Xeon Cobalt Series
                        </li>
                        <li class="flex items-center gap-3">
                            <span class="text-blue-500">[✓]</span> 100Gbps Network Fabric
                        </li>
                        <li class="flex items-center gap-3">
                            <span class="text-blue-500">[✓]</span> Instant Provisioning API
                        </li>
                     </ul>

                     <button @click="handleJoin" class="mt-10 px-8 py-4 bg-transparent border border-blue-500 text-blue-400 font-bold uppercase tracking-wider text-xs hover:bg-blue-500 hover:text-white transition-all">
                        Configure Instance
                     </button>
                </div>
                <!-- Visual -->
                <div class="relative aspect-square">
                    <div class="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-3xl"></div>
                    <div class="relative z-10 bg-[#05080F] border border-blue-500/20 rounded-2xl p-1 shadow-2xl skew-y-3 hover:skew-y-0 transition-transform duration-700">
                        <div class="bg-[#05080F] rounded-xl border border-white/5 p-6 h-full flex flex-col gap-4">
                            <!-- Fake Terminal -->
                            <div class="font-mono text-xs text-slate-500 mb-4 border-b border-white/5 pb-4">root@node-x1:~$ neofetch</div>
                            <div class="flex gap-4">
                                <div class="w-1/3 text-blue-500 font-mono text-[10px] leading-tight opacity-70">
                                    {{`
                                      /\\
                                     /  \\
                                    /    \\
                                   /      \\
                                  /________\\
                                    `}}
                                </div>
                                <div class="text-xs text-slate-300 font-mono space-y-2">
                                    <div><span class="text-blue-400">OS:</span> Serwin Linux 4.2</div>
                                    <div><span class="text-blue-400">Kernel:</span> 6.8.9-atomic</div>
                                    <div><span class="text-blue-400">Uptime:</span> 482 days</div>
                                    <div><span class="text-blue-400">CPU:</span> 128 x Core i9</div>
                                    <div><span class="text-blue-400">Memory:</span> 2TB DDR5</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 2. GAMING CENTER -->
        <section id="gaming" class="py-32 relative bg-[#05080F]">
            <div class="absolute inset-0 overflow-hidden">
                <div class="absolute -right-[10%] top-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px]"></div>
            </div>

            <div class="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-24 items-center relative z-10">
                <div class="order-2 md:order-1 relative">
                    <!-- Gaming Map Graphic -->
                    <div class="aspect-video bg-[#0C0F19] rounded-2xl border border-purple-500/20 overflow-hidden relative group">
                        <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1]"></div>
                        <!-- Animated Dots -->
                        <div v-for="i in 5" :key="i" class="absolute w-2 h-2 bg-purple-400 rounded-full animate-ping" :style="{ left: Math.random()*80+10+'%', top: Math.random()*80+10+'%', animationDelay: i+'s' }"></div>
                        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <h4 class="text-9xl font-black text-white/5 uppercase italic tracking-tighter">Velocity</h4>
                        </div>
                        <div class="absolute bottom-6 left-6 right-6 bg-purple-900/40 backdrop-blur-md p-4 rounded-xl border border-purple-500/30">
                            <div class="flex justify-between items-center">
                                <span class="text-xs font-bold text-white uppercase">US-CENTRAL Matchmaking</span>
                                <span class="text-xs font-mono text-purple-300">12ms</span>
                            </div>
                            <div class="w-full bg-black/50 h-1 mt-3 rounded-full overflow-hidden">
                                <div class="h-full bg-purple-500 w-full animate-scan-slow"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="order-1 md:order-2">
                     <div class="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-8 border border-purple-600/40">
                        <svg class="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>
                     </div>
                     <h2 class="text-5xl font-bold text-white mb-6 font-display">Gaming Edge.</h2>
                     <p class="text-lg text-slate-400 mb-8 leading-relaxed">
                        The backbone for the next generation of multiplayer experiences. Dedicated fiber lines to major ISPs ensure your players never miss a frame.
                     </p>
                     
                     <div class="grid grid-cols-2 gap-6 mb-10">
                        <div class="p-4 bg-purple-900/10 border border-purple-500/20 rounded-xl">
                            <div class="text-3xl font-bold text-white mb-1">128</div>
                            <div class="text-[10px] text-purple-400 uppercase tracking-wider">Tick Rate</div>
                        </div>
                        <div class="p-4 bg-purple-900/10 border border-purple-500/20 rounded-xl">
                            <div class="text-3xl font-bold text-white mb-1">Global</div>
                            <div class="text-[10px] text-purple-400 uppercase tracking-wider">Availability</div>
                        </div>
                     </div>

                     <button @click="handleJoin" class="text-purple-400 font-bold uppercase tracking-wider text-xs hover:text-white transition-colors flex items-center gap-2">
                        View Coverage Map <span class="text-xl">→</span>
                     </button>
                </div>
            </div>
        </section>

        <!-- 3. STORAGE ARCHIVE -->
        <section id="storage" class="py-32 relative border-t border-white/5 bg-[#080C14] overflow-hidden">
            <div class="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
                <div>
                     <div class="w-12 h-12 bg-emerald-600/20 rounded-lg flex items-center justify-center mb-8 border border-emerald-600/40">
                        <svg class="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>
                     </div>
                     <h2 class="text-5xl font-bold text-white mb-6 font-display">Infinite Storage.</h2>
                     <p class="text-lg text-slate-400 mb-8 leading-relaxed">
                        Data lakes that grow with you. From hot relational data to cold archival deep-storage, we ensure your bits are preserved for eternity.
                     </p>
                     
                     <div class="bg-emerald-900/10 border border-emerald-500/10 rounded-xl p-6 relative overflow-hidden">
                        <div class="flex items-center gap-4 mb-4">
                            <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span class="text-xs font-mono text-emerald-400">REPLICATION_STATUS: SYNCED</span>
                        </div>
                        <div class="flex gap-1 h-20 items-end">
                            <div v-for="n in 20" :key="n" class="flex-1 bg-emerald-500/20 rounded-t-sm transition-all hover:bg-emerald-400" :style="{ height: Math.random() * 100 + '%' }"></div>
                        </div>
                     </div>
                </div>

                <!-- Abstract Storage Graphic -->
                 <div class="relative h-[400px] w-full bg-[#05080F] border border-emerald-500/10 rounded-2xl p-8 grid grid-cols-4 gap-4 overflow-hidden">
                    <div v-for="n in 32" :key="n" class="bg-emerald-500/5 rounded border border-emerald-500/10 flex items-center justify-center text-[8px] font-mono text-emerald-900/40 hover:bg-emerald-500 hover:text-black hover:scale-110 transition-all duration-300 cursor-none">
                        0x{{ n }}F
                    </div>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="bg-black border-t border-white/5 py-24">
            <div class="max-w-7xl mx-auto px-6 text-center">
                <h2 class="text-2xl font-bold text-white mb-8 font-display">Start Building Today</h2>
                <button @click="handleJoin" class="px-12 py-4 bg-white text-black font-bold rounded-lg hover:scale-105 transition-transform">
                    Create Account
                </button>
                <div class="mt-20 flex justify-center gap-12 text-sm text-slate-600 font-mono">
                    <a href="#" class="hover:text-white transition-colors">COMPUTE_SLA</a>
                    <a href="#" class="hover:text-white transition-colors">GAMING_SDK</a>
                    <a href="#" class="hover:text-white transition-colors">STORAGE_API</a>
                </div>
                <div class="mt-12 text-xs text-slate-700">
                    &copy; 2026 SERWIN SYSTEMS INC. ALL RIGHTS RESERVED.
                </div>
            </div>
        </footer>

    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

.font-sans {
    font-family: 'Inter', sans-serif;
}
.font-display {
    font-family: 'Space Grotesk', sans-serif;
}
.font-mono {
    font-family: 'JetBrains Mono', monospace;
}

.perspective-1000 {
    perspective: 1000px;
}

@keyframes progress {
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
}
.animate-progress {
    animation: progress 5000s linear infinite; /* Adjusted in JS really, but CSS fallback */
    animation: progress 5s linear;
}

@keyframes scan-slow {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}
.animate-scan-slow {
    animation: scan-slow 3s linear infinite;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
