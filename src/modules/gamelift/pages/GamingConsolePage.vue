<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchGames } from '../services/gameliftApi'

const router = useRouter()

const games = ref<any[]>([])
const loading = ref(true)
const error = ref('')

const stats = computed(() => ({
    total: games.value.length,
    live: games.value.filter(g => g.status === 'active' || g.status === 'running').length,
    deploying: games.value.filter(g => g.status === 'deploying' || g.status === 'initializing').length,
    stopped: games.value.filter(g => g.status === 'stopped' || g.status === 'failed').length,
}))

const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'active':
        case 'running': return 'text-emerald-600 bg-emerald-50 border-emerald-200'
        case 'deploying':
        case 'initializing': return 'text-amber-600 bg-amber-50 border-amber-200'
        case 'failed':
        case 'stopped': return 'text-red-600 bg-red-50 border-red-200'
        default: return 'text-[#545b64] bg-[#fafafa] border-[#eaeded]'
    }
}

onMounted(async () => {
    try {
        const data = await fetchGames()
        games.value = Array.isArray(data) ? data : []
    } catch (e: any) {
        error.value = e.message
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <div class="min-h-screen pb-24 bg-white font-urbanist selection:bg-[#ff9900]/30">
        <div class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none [mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)]"></div>

        <div class="relative z-10 max-w-[1600px] mx-auto px-8 md:px-16 pt-24 pb-20">

            <!-- Header -->
            <header class="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
                <div>
                    <div class="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-white border border-[#ff9900]/30 text-[#ff9900] text-[10px] font-black tracking-[0.2em] uppercase">
                        <div class="w-1.5 h-1.5 bg-[#ff9900] animate-pulse rounded-full"></div>
                        GameLift Edge Network
                    </div>
                    <h1 class="text-5xl md:text-6xl font-black text-[#232f3e] uppercase tracking-tighter mb-4">Game <span class="text-[#ff9900]">Registry</span></h1>
                    <p class="text-[#545b64] font-medium max-w-xl leading-relaxed text-lg">
                        Manage your live game server fleets, monitor active sessions, and deploy new bundles.
                    </p>
                </div>
                <router-link to="/gamelift/fleets/create"
                    class="px-7 py-4 bg-[#ff9900] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#ec7211] transition-all transform active:scale-95 flex items-center gap-2 whitespace-nowrap">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Deploy New Game
                </router-link>
            </header>

            <!-- Stat Cards -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                <div class="bg-[#fafafa] border-2 border-[#232f3e] p-6 relative overflow-hidden group">
                    <div class="absolute top-0 right-0 w-2 h-full bg-[#ff9900]"></div>
                    <p class="text-[10px] font-black text-[#879196] uppercase tracking-widest mb-3">Total Games</p>
                    <p class="text-5xl font-black text-[#232f3e]">{{ loading ? '–' : stats.total }}</p>
                </div>
                <div class="bg-[#fafafa] border-2 border-[#232f3e] p-6 relative overflow-hidden group">
                    <div class="absolute top-0 right-0 w-2 h-full bg-emerald-500"></div>
                    <p class="text-[10px] font-black text-[#879196] uppercase tracking-widest mb-3">Live Fleets</p>
                    <p class="text-5xl font-black text-emerald-600">{{ loading ? '–' : stats.live }}</p>
                </div>
                <div class="bg-[#fafafa] border-2 border-[#232f3e] p-6 relative overflow-hidden group">
                    <div class="absolute top-0 right-0 w-2 h-full bg-amber-500"></div>
                    <p class="text-[10px] font-black text-[#879196] uppercase tracking-widest mb-3">Deploying</p>
                    <p class="text-5xl font-black text-amber-600">{{ loading ? '–' : stats.deploying }}</p>
                </div>
                <div class="bg-[#fafafa] border-2 border-[#232f3e] p-6 relative overflow-hidden group">
                    <div class="absolute top-0 right-0 w-2 h-full bg-red-500"></div>
                    <p class="text-[10px] font-black text-[#879196] uppercase tracking-widest mb-3">Stopped</p>
                    <p class="text-5xl font-black text-red-600">{{ loading ? '–' : stats.stopped }}</p>
                </div>
            </div>

            <!-- Games Registry Table -->
            <div class="border-2 border-[#232f3e] overflow-hidden">
                <div class="px-8 py-6 bg-[#fafafa] border-b-2 border-[#eaeded] flex items-center justify-between">
                    <h2 class="text-xl font-black text-[#232f3e] uppercase tracking-tighter">Registered Game Fleets</h2>
                    <div class="flex items-center gap-2">
                        <div class="w-2 h-2 bg-emerald-500 animate-ping rounded-full"></div>
                        <span class="text-[9px] text-[#545b64] font-black uppercase tracking-[0.3em]">Live Stream</span>
                    </div>
                </div>

                <!-- Loading -->
                <div v-if="loading" class="p-16 text-center">
                    <div class="w-8 h-8 border-2 border-[#ff9900] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p class="text-[10px] font-black text-[#879196] uppercase tracking-widest">Syncing registry...</p>
                </div>

                <!-- Error -->
                <div v-else-if="error" class="p-16 text-center">
                    <p class="text-sm font-bold text-red-600 mb-2">{{ error }}</p>
                    <p class="text-[10px] text-[#879196] font-black uppercase tracking-widest">Check that the GameLift backend is running on port 8080.</p>
                </div>

                <!-- Empty -->
                <div v-else-if="games.length === 0" class="p-16 text-center">
                    <div class="w-16 h-16 bg-[#fafafa] border-2 border-dashed border-[#eaeded] flex items-center justify-center mx-auto mb-6">
                        <svg class="w-8 h-8 text-[#879196]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a1 1 0 11-2 0 1 1 0 012 0zm-4-4a1 1 0 11-2 0 1 1 0 012 0zm4 8a1 1 0 11-2 0 1 1 0 012 0zm-8-4a1 1 0 11-2 0 1 1 0 012 0zm11 0a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <h3 class="text-2xl font-black text-[#232f3e] uppercase tracking-tighter mb-2">No Games Registered</h3>
                    <p class="text-[#545b64] font-medium mb-8">Your game registry is empty. Deploy your first game bundle to get started.</p>
                    <router-link to="/gamelift/fleets/create"
                        class="px-8 py-4 bg-[#ff9900] text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-[#ec7211] transition-all inline-flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4" />
                        </svg>
                        Deploy First Game
                    </router-link>
                </div>

                <!-- Table -->
                <div v-else class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead>
                            <tr class="border-b-2 border-[#eaeded] bg-[#fafafa]">
                                <th class="py-5 px-8 text-[10px] font-black tracking-[0.2em] text-[#879196] uppercase">Game</th>
                                <th class="py-5 px-8 text-[10px] font-black tracking-[0.2em] text-[#879196] uppercase">Status</th>
                                <th class="py-5 px-8 text-[10px] font-black tracking-[0.2em] text-[#879196] uppercase hidden md:table-cell">VM / Fleet</th>
                                <th class="py-5 px-8 text-[10px] font-black tracking-[0.2em] text-[#879196] uppercase hidden lg:table-cell">Game ID</th>
                                <th class="py-5 px-8 text-[10px] font-black tracking-[0.2em] text-[#879196] uppercase text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="game in games" :key="game.game_id || game.id"
                                class="border-b border-[#eaeded] hover:bg-[#fffbf3] transition-colors group">
                                <td class="py-5 px-8">
                                    <div class="font-black text-[#232f3e] group-hover:text-[#ff9900] transition-colors">{{ game.game_name || game.name }}</div>
                                </td>
                                <td class="py-5 px-8">
                                    <span class="inline-flex items-center gap-1.5 px-3 py-1 border text-[10px] font-black uppercase tracking-widest" :class="getStatusColor(game.status)">
                                        <span v-if="game.status === 'active' || game.status === 'running'" class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                                        {{ game.status || 'Unknown' }}
                                    </span>
                                </td>
                                <td class="py-5 px-8 hidden md:table-cell">
                                    <span class="font-mono text-sm text-[#545b64]">{{ game.vm_id || '–' }}</span>
                                </td>
                                <td class="py-5 px-8 hidden lg:table-cell">
                                    <span class="font-mono text-xs text-[#879196]">{{ game.game_id || game.id || '–' }}</span>
                                </td>
                                <td class="py-5 px-8 text-center">
                                    <button class="text-[10px] font-black text-[#879196] hover:text-[#ff9900] uppercase tracking-widest transition-colors font-mono border border-[#eaeded] hover:border-[#ff9900] px-3 py-1.5">
                                        Inspect
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>
