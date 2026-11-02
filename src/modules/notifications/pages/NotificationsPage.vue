<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useNotificationStore, type AppNotification } from '../store/notificationStore'

const store = useNotificationStore()
const route = useRoute()
const isDark = computed(() => !!route.meta.isDarkNavbar)

type Filter = 'all' | 'active' | 'unread' | 'failed'
const filter = ref<Filter>('all')

const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'In progress' },
    { key: 'unread', label: 'Unread' },
    { key: 'failed', label: 'Failed' },
]

const visible = computed(() => {
    switch (filter.value) {
        case 'active': return store.items.filter(n => n.status === 'running')
        case 'unread': return store.items.filter(n => !n.read)
        case 'failed': return store.items.filter(n => n.status === 'failed')
        default: return store.items
    }
})

// relative time that refreshes every 30s
const now = ref(Date.now())
let timer: ReturnType<typeof setInterval>
onMounted(() => (timer = setInterval(() => (now.value = Date.now()), 30000)))
onUnmounted(() => clearInterval(timer))

function timeAgo(iso: string) {
    const s = Math.max(0, Math.floor((now.value - new Date(iso).getTime()) / 1000))
    if (s < 10) return 'just now'
    if (s < 60) return `${s}s ago`
    if (s < 3600) return `${Math.floor(s / 60)}m ago`
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`
    return `${Math.floor(s / 86400)}d ago`
}

const statusStyle: Record<AppNotification['status'], { dot: string; label: string; text: string }> = {
    running:   { dot: 'bg-[#ff9900] animate-pulse', label: 'In progress', text: 'text-[#ff9900]' },
    completed: { dot: 'bg-emerald-500',             label: 'Completed',   text: 'text-emerald-500' },
    failed:    { dot: 'bg-red-500',                 label: 'Failed',      text: 'text-red-500' },
    info:      { dot: 'bg-blue-500',                label: 'Info',        text: 'text-blue-500' },
}
</script>

<template>
    <div class="min-h-screen pt-28 pb-16 px-6 font-urbanist" :class="isDark ? 'bg-[#05080F]' : 'bg-[#fafafa]'">
        <div class="max-w-4xl mx-auto">

            <!-- Header -->
            <div class="flex flex-wrap items-end justify-between gap-4 mb-8">
                <div>
                    <h1 class="text-4xl font-black uppercase tracking-tighter"
                        :class="isDark ? 'text-white' : 'text-[#232f3e]'">
                        Notifi<span class="text-[#ff9900]">cations</span>
                    </h1>
                    <div class="flex items-center gap-2 mt-2 text-[10px] font-black uppercase tracking-[0.2em]"
                        :class="isDark ? 'text-slate-400' : 'text-[#879196]'">
                        <span class="w-2 h-2 rounded-full" :class="store.connected ? 'bg-emerald-500' : 'bg-red-500'"></span>
                        {{ store.connected ? 'Live' : 'Reconnecting…' }}
                        <span v-if="store.activeCount">· {{ store.activeCount }} job{{ store.activeCount > 1 ? 's' : '' }} running</span>
                    </div>
                </div>

                <div class="flex items-center gap-3">
                    <button @click="store.markAllRead()" :disabled="!store.unreadCount"
                        class="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] border-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        :class="isDark ? 'border-white/10 text-slate-300 hover:border-white/30' : 'border-[#eaeded] text-[#545b64] hover:border-[#232f3e] hover:text-[#232f3e]'">
                        Mark all read
                    </button>
                    <button @click="store.clearFinished()"
                        class="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] bg-[#232f3e] text-[#ff9900] hover:bg-[#ff9900] hover:text-[#232f3e] transition-all">
                        Clear finished
                    </button>
                </div>
            </div>

            <!-- Filters -->
            <div class="flex gap-2 mb-6 border-b-2" :class="isDark ? 'border-white/10' : 'border-[#eaeded]'">
                <button v-for="f in filters" :key="f.key" @click="filter = f.key"
                    class="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] -mb-[2px] border-b-2 transition-all"
                    :class="filter === f.key
                        ? 'border-[#ff9900] text-[#ff9900]'
                        : (isDark ? 'border-transparent text-slate-400 hover:text-white' : 'border-transparent text-[#879196] hover:text-[#232f3e]')">
                    {{ f.label }}
                </button>
            </div>

            <!-- Empty state -->
            <div v-if="!visible.length" class="py-24 text-center border-2 border-dashed"
                :class="isDark ? 'border-white/10 text-slate-500' : 'border-[#eaeded] text-[#879196]'">
                <p class="text-xs font-black uppercase tracking-[0.2em]">Nothing here</p>
                <p class="text-sm mt-2 font-medium">Running jobs and system events will show up here.</p>
            </div>

            <!-- List -->
            <TransitionGroup v-else name="list" tag="ul" class="space-y-3">
                <li v-for="n in visible" :key="n.id" @click="store.markRead(n.id)"
                    class="relative p-5 border-2 transition-all cursor-pointer"
                    :class="[
                        isDark ? 'bg-white/[0.03] hover:border-white/30' : 'bg-white hover:border-[#232f3e]',
                        n.read ? (isDark ? 'border-white/10' : 'border-[#eaeded]') : 'border-[#ff9900]'
                    ]">

                    <div class="flex items-start justify-between gap-4">
                        <div class="min-w-0">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="w-2 h-2 rounded-full shrink-0" :class="statusStyle[n.status].dot"></span>
                                <span class="text-[10px] font-black uppercase tracking-[0.2em]"
                                    :class="statusStyle[n.status].text">{{ statusStyle[n.status].label }}</span>
                                <span class="text-[10px] font-black uppercase tracking-[0.2em]"
                                    :class="isDark ? 'text-slate-500' : 'text-[#879196]'">· {{ n.kind.replace(/_/g, ' ') }}</span>
                            </div>
                            <h3 class="text-base font-black truncate" :class="isDark ? 'text-white' : 'text-[#232f3e]'">
                                {{ n.title }}
                            </h3>
                            <p v-if="n.message" class="text-sm mt-1 font-medium break-words"
                                :class="isDark ? 'text-slate-400' : 'text-[#545b64]'">{{ n.message }}</p>
                        </div>

                        <div class="flex flex-col items-end gap-2 shrink-0">
                            <span class="text-[10px] font-black uppercase tracking-widest"
                                :class="isDark ? 'text-slate-500' : 'text-[#879196]'">{{ timeAgo(n.updatedAt) }}</span>
                            <button @click.stop="store.remove(n.id)" aria-label="Dismiss"
                                class="p-1 transition-colors"
                                :class="isDark ? 'text-slate-500 hover:text-white' : 'text-[#879196] hover:text-red-600'">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Progress bar for running jobs -->
                    <div v-if="n.status === 'running' && n.progress !== undefined" class="mt-4">
                        <div class="h-2 w-full overflow-hidden" :class="isDark ? 'bg-white/10' : 'bg-[#eaeded]'">
                            <div class="h-full bg-[#ff9900] transition-all duration-500" :style="{ width: n.progress + '%' }"></div>
                        </div>
                        <div class="mt-1 text-right text-[10px] font-black tracking-widest text-[#ff9900]">{{ n.progress }}%</div>
                    </div>
                </li>
            </TransitionGroup>
        </div>
    </div>
</template>

<style scoped>
.list-enter-active, .list-leave-active { transition: all 0.25s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateY(-8px); }
</style>