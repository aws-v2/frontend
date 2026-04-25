<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchGame, fetchGameManifest } from '../services/gameliftApi'

const route = useRoute()
const router = useRouter()

const gameId = route.params.id as string

const game = ref<any>(null)
const manifest = ref<any>(null)
const loading = ref(true)
const error = ref('')

const statusColor = computed(() => {
    switch (game.value?.status?.toLowerCase()) {
        case 'active':
        case 'running':   return 'text-emerald-600 bg-emerald-50 border-emerald-200'
        case 'deploying':
        case 'initializing': return 'text-amber-600 bg-amber-50 border-amber-200'
        case 'failed':
        case 'stopped':   return 'text-red-600 bg-red-50 border-red-200'
        case 'stored':    return 'text-blue-600 bg-blue-50 border-blue-200'
        default:          return 'text-[#545b64] bg-[#fafafa] border-[#eaeded]'
    }
})

const isLive = computed(() =>
    ['active', 'running'].includes(game.value?.status?.toLowerCase())
)

onMounted(async () => {
    try {
        const [gameData, manifestData] = await Promise.allSettled([
            fetchGame(gameId),
            fetchGameManifest(gameId),
        ])

        if (gameData.status === 'fulfilled') game.value = gameData.value
        else throw new Error(gameData.reason?.message || 'Failed to load game')

        if (manifestData.status === 'fulfilled') manifest.value = manifestData.value
    } catch (e: any) {
        error.value = e.message
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <div class="min-h-screen pb-24 bg-white font-urbanist selection:bg-[#ff9900]/30">
        <!-- Grid background -->
        <div class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none [mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)]"></div>

        <div class="relative z-10 max-w-[1600px] mx-auto px-8 md:px-16 pt-24 pb-20">

            <!-- Back nav -->
            <button @click="router.back()"
                class="inline-flex items-center gap-2 text-[10px] font-black text-[#879196] uppercase tracking-[0.2em] hover:text-[#ff9900] transition-colors mb-10 group">
                <svg class="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Registry
            </button>

            <!-- Loading -->
            <div v-if="loading" class="py-32 text-center">
                <div class="w-8 h-8 border-2 border-[#ff9900] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p class="text-[10px] font-black text-[#879196] uppercase tracking-widest">Loading server data...</p>
            </div>

            <!-- Error -->
            <div v-else-if="error" class="py-32 text-center">
                <p class="text-sm font-bold text-red-600 mb-2">{{ error }}</p>
                <p class="text-[10px] text-[#879196] font-black uppercase tracking-widest">Could not load game server details.</p>
            </div>

            <template v-else-if="game">

                <!-- Header -->
                <header class="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-14">
                    <div>
                        <div class="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-white border border-[#ff9900]/30 text-[#ff9900] text-[10px] font-black tracking-[0.2em] uppercase">
                            <div v-if="isLive" class="w-1.5 h-1.5 bg-[#ff9900] animate-pulse rounded-full"></div>
                            <div v-else class="w-1.5 h-1.5 bg-[#879196] rounded-full"></div>
                            GameLift Server Detail
                        </div>
                        <h1 class="text-5xl md:text-6xl font-black text-[#232f3e] uppercase tracking-tighter mb-3">
                            {{ game.game_name || game.name }}
                        </h1>
                        <div class="flex items-center gap-4 flex-wrap">
                            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 border text-[10px] font-black uppercase tracking-widest"
                                :class="statusColor">
                                <span v-if="isLive" class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                                {{ game.status || 'Unknown' }}
                            </span>
                            <span class="font-mono text-xs text-[#879196]">ID: {{ game.game_id || game.id }}</span>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex items-center gap-3">
                        <button v-if="isLive"
                            class="px-6 py-3 border-2 border-red-500 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-50 transition-all active:scale-95">
                            Stop Fleet
                        </button>
                        <button v-else
                            class="px-6 py-3 border-2 border-emerald-500 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-50 transition-all active:scale-95">
                            Start Fleet
                        </button>
                        <button
                            class="px-6 py-3 bg-[#ff9900] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#ec7211] transition-all active:scale-95">
                            Redeploy
                        </button>
                    </div>
                </header>

                <!-- Stat strip -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-5 mb-12">
                    <div class="bg-[#fafafa] border-2 border-[#232f3e] p-5 relative overflow-hidden">
                        <div class="absolute top-0 right-0 w-2 h-full bg-[#ff9900]"></div>
                        <p class="text-[10px] font-black text-[#879196] uppercase tracking-widest mb-2">Game ID</p>
                        <p class="font-mono text-sm font-bold text-[#232f3e] truncate">{{ game.game_id || game.id || '–' }}</p>
                    </div>
                    <div class="bg-[#fafafa] border-2 border-[#232f3e] p-5 relative overflow-hidden">
                        <div class="absolute top-0 right-0 w-2 h-full bg-blue-500"></div>
                        <p class="text-[10px] font-black text-[#879196] uppercase tracking-widest mb-2">VM / Fleet</p>
                        <p class="font-mono text-sm font-bold text-[#232f3e] truncate">{{ game.vm_id || '–' }}</p>
                    </div>
                    <div class="bg-[#fafafa] border-2 border-[#232f3e] p-5 relative overflow-hidden">
                        <div class="absolute top-0 right-0 w-2 h-full bg-purple-500"></div>
                        <p class="text-[10px] font-black text-[#879196] uppercase tracking-widest mb-2">Owner</p>
                        <p class="font-mono text-sm font-bold text-[#232f3e] truncate">{{ game.user_id || game.owner || '–' }}</p>
                    </div>
                    <div class="bg-[#fafafa] border-2 border-[#232f3e] p-5 relative overflow-hidden">
                        <div class="absolute top-0 right-0 w-2 h-full bg-amber-500"></div>
                        <p class="text-[10px] font-black text-[#879196] uppercase tracking-widest mb-2">Registered</p>
                        <p class="font-mono text-sm font-bold text-[#232f3e]">
                            {{ game.created_at ? new Date(game.created_at).toLocaleDateString() : '–' }}
                        </p>
                    </div>
                </div>

                <!-- Main content grid -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <!-- Manifest Panel -->
                    <div class="lg:col-span-2 border-2 border-[#232f3e] overflow-hidden">
                        <div class="px-8 py-5 bg-[#fafafa] border-b-2 border-[#eaeded] flex items-center justify-between">
                            <h2 class="text-sm font-black text-[#232f3e] uppercase tracking-tighter">Game Manifest</h2>
                            <span class="text-[9px] font-black text-[#879196] uppercase tracking-[0.3em]">Build Config</span>
                        </div>

                        <div v-if="manifest" class="p-8">
                            <!-- Headless Binary -->
                            <div class="mb-8">
                                <p class="text-[10px] font-black text-[#879196] uppercase tracking-widest mb-2">Headless Binary</p>
                                <div class="bg-[#fafafa] border border-[#eaeded] px-4 py-3">
                                    <code class="font-mono text-sm text-[#232f3e]">{{ manifest.headless_bin || manifest.HeadlessBin || '–' }}</code>
                                </div>
                            </div>

                            <!-- Required Files -->
                            <div v-if="manifest.required_files?.length || manifest.RequiredFiles?.length" class="mb-8">
                                <p class="text-[10px] font-black text-[#879196] uppercase tracking-widest mb-3">Required Files</p>
                                <div class="space-y-2">
                                    <div v-for="(file, i) in (manifest.required_files || manifest.RequiredFiles)" :key="i"
                                        class="flex items-center gap-3 px-4 py-3 border border-[#eaeded] bg-[#fafafa]">
                                        <svg class="w-4 h-4 text-[#ff9900] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <code class="font-mono text-xs text-[#545b64]">{{ file }}</code>
                                    </div>
                                </div>
                            </div>

                            <!-- Ports -->
                            <div v-if="manifest.ports || manifest.Ports">
                                <p class="text-[10px] font-black text-[#879196] uppercase tracking-widest mb-3">Exposed Ports</p>
                                <div class="flex flex-wrap gap-2">
                                    <template v-if="Array.isArray(manifest.ports || manifest.Ports)">
                                        <span v-for="(port, i) in (manifest.ports || manifest.Ports)" :key="i"
                                            class="font-mono text-xs px-3 py-1.5 bg-[#232f3e] text-[#ff9900] font-bold">
                                            :{{ port }}
                                        </span>
                                    </template>
                                    <template v-else>
                                        <span v-for="(val, proto) in (manifest.ports || manifest.Ports)" :key="proto"
                                            class="font-mono text-xs px-3 py-1.5 bg-[#232f3e] text-[#ff9900] font-bold">
                                            {{ proto }}:{{ val }}
                                        </span>
                                    </template>
                                </div>
                            </div>

                            <!-- Raw JSON fallback -->
                            <div v-if="!manifest.headless_bin && !manifest.HeadlessBin">
                                <p class="text-[10px] font-black text-[#879196] uppercase tracking-widest mb-3">Raw Manifest</p>
                                <pre class="bg-[#fafafa] border border-[#eaeded] p-4 text-xs font-mono text-[#545b64] overflow-auto max-h-64 whitespace-pre-wrap">{{ JSON.stringify(manifest, null, 2) }}</pre>
                            </div>
                        </div>

                        <div v-else class="p-8 text-center text-[#879196]">
                            <p class="text-[10px] font-black uppercase tracking-widest">No manifest data available</p>
                        </div>
                    </div>

                    <!-- Right sidebar -->
                    <div class="flex flex-col gap-6">

                        <!-- Storage ARN -->
                        <div class="border-2 border-[#232f3e] overflow-hidden">
                            <div class="px-6 py-4 bg-[#fafafa] border-b-2 border-[#eaeded]">
                                <h3 class="text-xs font-black text-[#232f3e] uppercase tracking-tighter">Storage</h3>
                            </div>
                            <div class="p-6">
                                <p class="text-[10px] font-black text-[#879196] uppercase tracking-widest mb-2">Storage ARN</p>
                                <p class="font-mono text-[11px] text-[#545b64] break-all leading-relaxed">
                                    {{ game.storage_arn || '–' }}
                                </p>
                            </div>
                        </div>

                        <!-- Instance Info -->
                        <div class="border-2 border-[#232f3e] overflow-hidden">
                            <div class="px-6 py-4 bg-[#fafafa] border-b-2 border-[#eaeded]">
                                <h3 class="text-xs font-black text-[#232f3e] uppercase tracking-tighter">Instance</h3>
                            </div>
                            <div class="p-6 space-y-5">
                                <div>
                                    <p class="text-[10px] font-black text-[#879196] uppercase tracking-widest mb-1">Instance ID</p>
                                    <p class="font-mono text-sm text-[#232f3e]">{{ game.instance_id || '–' }}</p>
                                </div>
                                <div>
                                    <p class="text-[10px] font-black text-[#879196] uppercase tracking-widest mb-1">Node ID</p>
                                    <p class="font-mono text-sm text-[#232f3e]">{{ game.node_id || '–' }}</p>
                                </div>
                                <div>
                                    <p class="text-[10px] font-black text-[#879196] uppercase tracking-widest mb-1">IP Address</p>
                                    <p class="font-mono text-sm text-[#232f3e]">{{ game.ip_address || game.public_ip || '–' }}</p>
                                </div>
                                <div>
                                    <p class="text-[10px] font-black text-[#879196] uppercase tracking-widest mb-1">Last Updated</p>
                                    <p class="font-mono text-xs text-[#545b64]">
                                        {{ game.updated_at ? new Date(game.updated_at).toLocaleString() : '–' }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Quick links -->
                        <div class="border-2 border-[#232f3e] overflow-hidden">
                            <div class="px-6 py-4 bg-[#fafafa] border-b-2 border-[#eaeded]">
                                <h3 class="text-xs font-black text-[#232f3e] uppercase tracking-tighter">Quick Actions</h3>
                            </div>
                            <div class="p-4 space-y-2">
                                <button
                                    class="w-full text-left px-4 py-3 border border-[#eaeded] hover:border-[#ff9900] hover:bg-[#fffbf3] transition-colors flex items-center gap-3 group">
                                    <svg class="w-4 h-4 text-[#879196] group-hover:text-[#ff9900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <span class="text-[10px] font-black uppercase tracking-widest text-[#545b64] group-hover:text-[#ff9900]">View Logs</span>
                                </button>
                                <button
                                    class="w-full text-left px-4 py-3 border border-[#eaeded] hover:border-[#ff9900] hover:bg-[#fffbf3] transition-colors flex items-center gap-3 group">
                                    <svg class="w-4 h-4 text-[#879196] group-hover:text-[#ff9900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    <span class="text-[10px] font-black uppercase tracking-widest text-[#545b64] group-hover:text-[#ff9900]">Restart Server</span>
                                </button>
                                <button
                                    class="w-full text-left px-4 py-3 border border-[#eaeded] hover:border-red-400 hover:bg-red-50 transition-colors flex items-center gap-3 group">
                                    <svg class="w-4 h-4 text-[#879196] group-hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    <span class="text-[10px] font-black uppercase tracking-widest text-[#545b64] group-hover:text-red-500">Decommission</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>