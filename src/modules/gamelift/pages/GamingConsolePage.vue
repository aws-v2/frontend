<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchGames } from '../services/gameliftApi'

const router = useRouter()

const games = ref<any[]>([])
const loading = ref(true)
const error = ref('')

const renderJobs = ref<any[]>([])

const stats = computed(() => ({
    total: games.value.length,
    live: games.value.filter(g => g.status === 'active' || g.status === 'running').length,
    deploying: games.value.filter(g => g.status === 'deploying' || g.status === 'initializing').length,
    renderQueue: renderJobs.value.filter(j => j.status === 'Queued' || j.status === 'Running').length,
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

const loadRenderJobs = () => {
    const stored = localStorage.getItem('renderJobs')
    if (stored) {
        renderJobs.value = JSON.parse(stored)
    } else {
        // Default mock jobs if none exist
        renderJobs.value = [
            { id: '1', name: 'Apartment Floor Render #5', engine: 'Blender', frames: '1-250', status: 'Queued', progress: 0 },
            { id: '2', name: 'Cinematic Flythrough', engine: 'Blender', frames: '1-600', status: 'Running', progress: 60 },
            { id: '3', name: 'Kitchen Lighting Pass', engine: 'Blender', frames: '1-120', status: 'Completed', progress: 100 }
        ]
    }
}

onMounted(async () => {
    loadRenderJobs()
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
  <div class="min-h-screen bg-[#070a10] font-mono text-[#c9d1d9]">

    <!-- Ambient grid texture -->
    <div class="fixed inset-0 pointer-events-none z-0"
      style="background-image: linear-gradient(rgba(255,153,0,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,153,0,0.025) 1px, transparent 1px); background-size: 48px 48px;">
    </div>

    <!-- Top system bar -->
    <div class="relative z-10 border-b border-[#ff9900]/20 bg-[#070a10]/80 backdrop-blur-sm">
      <div class="max-w-[1600px] mx-auto px-8 md:px-16 h-11 flex items-center justify-between">
        <div class="flex items-center gap-6">
          <span class="text-[10px] text-[#ff9900] font-bold tracking-[0.3em] uppercase">GameLift</span>
          <span class="text-[#2a3340] text-xs">|</span>
          <span class="text-[10px] text-[#5a6472] tracking-widest uppercase">Edge Network Console</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
          <span class="text-[10px] text-[#5a6472] tracking-widest uppercase">Systems Operational</span>
        </div>
      </div>
    </div>

    <div class="relative z-10 max-w-[1600px] mx-auto px-8 md:px-16 pt-16 pb-24">

      <!-- ── HEADER ───────────────────────────────────────────── -->
      <header class="mb-14">
        <div class="inline-flex items-center gap-2 mb-5 px-3 py-1.5 border border-[#ff9900]/30 bg-[#ff9900]/5 text-[#ff9900] text-[10px] font-bold tracking-[0.25em] uppercase">
          <span class="w-1.5 h-1.5 bg-[#ff9900] rounded-full animate-pulse"></span>
          GameLift Edge Network
        </div>
        <h1 class="text-5xl md:text-7xl font-black text-[#e8eaed] uppercase tracking-tighter leading-none mb-4">
          Console <span class="text-[#ff9900]">Registry</span>
        </h1>
        <p class="text-[#5a6472] text-sm leading-relaxed max-w-xl font-sans tracking-wide">
          Manage live game server fleets, monitor rendering jobs, and deploy assets across the edge network.
        </p>
      </header>

      <!-- ── STAT CARDS ──────────────────────────────────────── -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">

        <div class="bg-[#0d1117] border border-[#1e2530] p-6 relative overflow-hidden hover:border-[#ff9900]/40 transition-colors">
          <div class="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-[#ff9900]/60 to-transparent"></div>
          <p class="text-[9px] font-bold text-[#5a6472] uppercase tracking-[0.3em] mb-4">Total Games</p>
          <p class="text-5xl font-black text-[#e8eaed]">{{ loading ? '—' : stats.total }}</p>
          <div class="absolute bottom-0 right-0 w-16 h-16 border-l border-t border-[#ff9900]/10 translate-x-4 translate-y-4"></div>
        </div>

        <div class="bg-[#0d1117] border border-[#1e2530] p-6 relative overflow-hidden hover:border-emerald-500/40 transition-colors">
          <div class="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-emerald-500/60 to-transparent"></div>
          <p class="text-[9px] font-bold text-[#5a6472] uppercase tracking-[0.3em] mb-4">Live Fleets</p>
          <p class="text-5xl font-black text-emerald-400">{{ loading ? '—' : stats.live }}</p>
          <div class="absolute bottom-0 right-0 w-16 h-16 border-l border-t border-emerald-500/10 translate-x-4 translate-y-4"></div>
        </div>

        <div class="bg-[#0d1117] border border-[#1e2530] p-6 relative overflow-hidden hover:border-amber-500/40 transition-colors">
          <div class="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-amber-500/60 to-transparent"></div>
          <p class="text-[9px] font-bold text-[#5a6472] uppercase tracking-[0.3em] mb-4">Render Queue</p>
          <p class="text-5xl font-black text-amber-400">{{ stats.renderQueue }}</p>
          <div class="absolute bottom-0 right-0 w-16 h-16 border-l border-t border-amber-500/10 translate-x-4 translate-y-4"></div>
        </div>

        <div class="bg-[#0d1117] border border-[#1e2530] p-6 relative overflow-hidden hover:border-amber-500/40 transition-colors">
          <div class="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-amber-500/60 to-transparent"></div>
          <p class="text-[9px] font-bold text-[#5a6472] uppercase tracking-[0.3em] mb-4">Deploying</p>
          <p class="text-5xl font-black text-[#5a6472]/50">{{ loading ? '—' : stats.deploying }}</p>
          <div class="absolute bottom-0 right-0 w-16 h-16 border-l border-t border-amber-500/10 translate-x-4 translate-y-4"></div>
        </div>

      </div>

      <!-- ── SIDE BY SIDE: FLEETS TABLE + RENDER JOBS ────────── -->
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 mb-10">

        <!-- LEFT — Game Fleets Table -->
        <div class="bg-[#0d1117] border border-[#1e2530] overflow-hidden flex flex-col">

          <div class="px-7 py-5 border-b border-[#1e2530] flex items-center justify-between bg-[#0a0d13] shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-px h-5 bg-emerald-400"></div>
              <h2 class="text-[11px] font-black text-[#e8eaed] uppercase tracking-[0.25em]">Registered Game Fleets</h2>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span class="text-[9px] text-[#5a6472] font-bold uppercase tracking-[0.3em]">Live Stream</span>
            </div>
          </div>

          <!-- Loading -->
          <div v-if="loading" class="p-20 text-center flex-1 flex flex-col items-center justify-center">
            <div class="w-8 h-8 border border-[#ff9900] border-t-transparent rounded-full animate-spin mx-auto mb-5"></div>
            <p class="text-[10px] font-bold text-[#5a6472] uppercase tracking-[0.3em]">Syncing registry...</p>
          </div>

          <!-- Error -->
          <div v-else-if="error" class="p-20 text-center flex-1 flex flex-col items-center justify-center">
            <div class="inline-flex items-center gap-2 px-4 py-3 border border-red-500/30 bg-red-500/5 mb-4">
              <svg class="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
              </svg>
              <p class="text-xs font-bold text-red-400">{{ error }}</p>
            </div>
            <p class="text-[10px] text-[#5a6472] font-bold uppercase tracking-[0.25em]">
              Ensure the GameLift backend is running on port 8080
            </p>
          </div>

          <!-- Empty -->
          <div v-else-if="games.length === 0" class="p-20 text-center flex-1 flex flex-col items-center justify-center">
            <div class="w-20 h-20 border border-dashed border-[#1e2530] flex items-center justify-center mx-auto mb-8 relative">
              <div class="absolute inset-0 border border-dashed border-[#1e2530] scale-110 opacity-40"></div>
              <svg class="w-9 h-9 text-[#3a4450]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M15 11a1 1 0 11-2 0 1 1 0 012 0zm-4-4a1 1 0 11-2 0 1 1 0 012 0zm4 8a1 1 0 11-2 0 1 1 0 012 0zm-8-4a1 1 0 11-2 0 1 1 0 012 0zm11 0a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 class="text-2xl font-black text-[#e8eaed] uppercase tracking-tighter mb-2">No Games Registered</h3>
            <p class="text-[#5a6472] font-sans text-sm">Your game registry is empty. Deploy your first game bundle to get started.</p>
          </div>

          <!-- Table -->
          <div v-else class="overflow-x-auto flex-1">
            <table class="w-full text-left">
              <thead>
                <tr class="border-b border-[#1e2530]">
                  <th class="py-4 px-7 text-[9px] font-black tracking-[0.3em] text-[#3a4450] uppercase">Game</th>
                  <th class="py-4 px-7 text-[9px] font-black tracking-[0.3em] text-[#3a4450] uppercase">Status</th>
                  <th class="py-4 px-7 text-[9px] font-black tracking-[0.3em] text-[#3a4450] uppercase hidden md:table-cell">VM / Fleet</th>
                  <th class="py-4 px-7 text-[9px] font-black tracking-[0.3em] text-[#3a4450] uppercase hidden lg:table-cell">Game ID</th>
                  <th class="py-4 px-7 text-[9px] font-black tracking-[0.3em] text-[#3a4450] uppercase text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="game in games" :key="game.game_id || game.id"
                  class="border-b border-[#1e2530] hover:bg-[#ff9900]/3 transition-colors group">

                  <td class="py-5 px-7">
                    <span class="text-sm font-bold text-[#c9d1d9] group-hover:text-[#ff9900] transition-colors">
                      {{ game.game_name || game.name }}
                    </span>
                  </td>

                  <td class="py-5 px-7">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] border"
                      :class="getStatusColor(game.status)">
                      <span v-if="game.status === 'active' || game.status === 'running'"
                        class="w-1 h-1 rounded-full bg-emerald-400 animate-ping"></span>
                      {{ game.status || 'Unknown' }}
                    </span>
                  </td>

                  <td class="py-5 px-7 hidden md:table-cell">
                    <span class="text-sm text-[#5a6472]">{{ game.vm_id || '—' }}</span>
                  </td>

                  <td class="py-5 px-7 hidden lg:table-cell">
                    <span class="text-xs text-[#3a4450]">{{ game.game_id || game.id || '—' }}</span>
                  </td>

                  <td class="py-5 px-7 text-center">
                    <router-link
                      :to="`/gamelift/games/${game.game_id || game.id}`"
                      class="text-[9px] font-black text-[#5a6472] hover:text-[#ff9900] uppercase tracking-[0.2em] transition-colors border border-[#1e2530] hover:border-[#ff9900]/40 px-4 py-1.5 inline-block hover:bg-[#ff9900]/5">
                      Inspect →
                    </router-link>
                  </td>

                </tr>
              </tbody>
            </table>
          </div>

          <!-- Table footer -->
          <div class="px-7 py-4 border-t border-[#1e2530] bg-[#0a0d13] flex items-center justify-between shrink-0">
            <p class="text-[9px] text-[#3a4450] font-bold uppercase tracking-[0.25em]">
              {{ games.length }} fleet{{ games.length !== 1 ? 's' : '' }} registered
            </p>
            <div class="flex items-center gap-2">
              <span class="w-1 h-1 rounded-full bg-[#ff9900]/60"></span>
              <span class="w-1 h-1 rounded-full bg-[#ff9900]/40"></span>
              <span class="w-1 h-1 rounded-full bg-[#ff9900]/20"></span>
            </div>
          </div>

        </div>

        <!-- RIGHT — Render Jobs -->
        <div class="bg-[#0d1117] border border-[#1e2530] overflow-hidden flex flex-col">

          <div class="px-7 py-5 border-b border-[#1e2530] flex items-center justify-between bg-[#0a0d13] shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-px h-5 bg-amber-400"></div>
              <h2 class="text-[11px] font-black text-[#e8eaed] uppercase tracking-[0.25em]">Render Jobs</h2>
            </div>
            <div class="flex items-center gap-2">
              <router-link to="/gamelift/render-jobs/create" class="px-3 py-1 border border-amber-400/30 text-amber-400 text-[9px] font-bold tracking-widest hover:bg-amber-400/10 transition-colors uppercase">
                New Job +
              </router-link>
              <span class="text-[9px] text-[#5a6472] font-bold uppercase tracking-[0.3em]">Queue</span>
            </div>
          </div>

          <!-- Jobs list -->
          <div class="divide-y divide-[#1e2530] flex-1 overflow-y-auto max-h-[600px]">

            <div v-for="job in renderJobs" :key="job.id" class="px-6 py-5 hover:bg-[#ff9900]/3 transition-colors group">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-bold text-[#c9d1d9] group-hover:text-[#e8eaed] transition-colors truncate">{{ job.name }}</p>
                  <p class="text-[11px] text-[#5a6472] mt-1 font-sans">Frames {{ job.frames }} · {{ job.engine }} · High Quality</p>
                </div>
                <span 
                  class="text-[9px] font-black uppercase tracking-[0.2em] border px-2.5 py-1 shrink-0 flex items-center gap-1.5"
                  :class="{
                    'text-amber-400 border-amber-400/30 bg-amber-400/5': job.status === 'Queued' || job.status === 'Running',
                    'text-emerald-400 border-emerald-400/30 bg-emerald-400/5': job.status === 'Completed',
                    'text-red-400 border-red-400/30 bg-red-400/5': job.status === 'Failed'
                  }"
                >
                  <span v-if="job.status === 'Running'" class="w-1 h-1 rounded-full bg-amber-400 animate-ping"></span>
                  {{ job.status }}
                </span>
              </div>
              <div class="mt-3 h-px bg-[#1e2530] w-full relative overflow-hidden">
                <div 
                  class="absolute inset-y-0 left-0 transition-all duration-1000"
                  :class="{
                    'bg-amber-400/40': job.status === 'Queued' || job.status === 'Running',
                    'bg-emerald-400/40': job.status === 'Completed',
                    'bg-red-400/40': job.status === 'Failed'
                  }"
                  :style="{ width: job.progress + '%' }"
                ></div>
              </div>
            </div>

            <div v-if="renderJobs.length === 0" class="p-10 text-center opacity-40">
              <p class="text-[10px] uppercase tracking-widest">No active render jobs</p>
            </div>

          </div>

          <!-- Panel footer -->
          <div class="px-6 py-4 border-t border-[#1e2530] bg-[#0a0d13] shrink-0">
            <p class="text-[9px] font-bold text-[#3a4450] uppercase tracking-[0.2em]">
              Backend integration pending
            </p>
          </div>

        </div>
        <!-- end right column -->

      </div>
      <!-- end side-by-side grid -->

      <!-- ── BOTTOM ACTION BUTTONS ───────────────────────────── -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

        <!-- Deploy New Game -->
        <router-link to="/gamelift/fleets/create"
          class="group relative flex items-center gap-5 px-8 py-6 bg-[#ff9900] text-[#070a10] hover:bg-[#ffaa22] transition-colors overflow-hidden">
          <span class="absolute inset-0 bg-white/10 translate-x-full group-hover:translate-x-0 transition-transform duration-500 skew-x-12"></span>
          <div class="relative z-10 w-10 h-10 bg-[#070a10]/15 flex items-center justify-center shrink-0">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347c-.75.412-1.667-.13-1.667-.986V5.653Z" />
            </svg>
          </div>
          <div class="relative z-10">
            <p class="text-[10px] font-black uppercase tracking-[0.3em] mb-0.5 opacity-60">Game Fleet</p>
            <p class="text-base font-black uppercase tracking-tight">Deploy New Game</p>
          </div>
          <svg class="w-5 h-5 ml-auto relative z-10 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </router-link>

        <!-- Create Render Job -->
        <router-link to="/gamelift/render-jobs/create"
          class="group relative flex items-center gap-5 px-8 py-6 bg-[#0d1117] border border-[#1e2530] text-[#e8eaed] hover:border-[#ff9900]/50 hover:bg-[#ff9900]/5 transition-colors overflow-hidden">
          <span class="absolute top-0 left-0 h-px w-0 bg-[#ff9900]/60 group-hover:w-full transition-all duration-500"></span>
          <div class="relative z-10 w-10 h-10 border border-[#1e2530] group-hover:border-[#ff9900]/40 flex items-center justify-center shrink-0 transition-colors">
            <svg class="w-5 h-5 text-[#ff9900]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
            </svg>
          </div>
          <div class="relative z-10">
            <p class="text-[10px] font-black uppercase tracking-[0.3em] mb-0.5 text-[#5a6472]">Render Queue</p>
            <p class="text-base font-black uppercase tracking-tight">Create Render Job</p>
          </div>
          <svg class="w-5 h-5 ml-auto text-[#5a6472] group-hover:text-[#ff9900] group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </router-link>

      </div>
      <!-- end action buttons -->

    </div>
  </div>
</template>