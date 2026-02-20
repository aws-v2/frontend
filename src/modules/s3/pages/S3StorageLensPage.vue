<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useS3Store } from '../store/s3Store'
import { onMounted, computed, ref } from 'vue'
import DocHelpDrawer from '@/modules/docs/components/DocHelpDrawer.vue'
import { useDocsStore } from '@/modules/docs/store/docsStore'
import { HelpCircle } from 'lucide-vue-next'

const router = useRouter()
const s3Store = useS3Store()
const docsStore = useDocsStore()

onMounted(async () => {
    if (!s3Store.storageLensData) {
        await s3Store.fetchStorageLensData()
    }
})

// Formatters
const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(num)
}

// Chart Helpers
// Simple Line Chart for Time Series
const chartPath = computed(() => {
    const data = s3Store.storageLensData?.timeSeries || []
    if (data.length === 0) return ''

    const width = 100 // viewbox width
    const height = 40 // viewbox height
    const padding = 2

    const maxVal = Math.max(...data.map(d => d.storage))
    const minVal = Math.min(...data.map(d => d.storage))
    const range = maxVal - minVal || 1

    if (data.length === 1) {
        const y = height - ((data[0].storage - minVal) / range) * (height - padding * 2) - padding
        return `0,${y} 100,${y}`
    }

    return data.map((d, i) => {
        const x = (i / (data.length - 1)) * width
        // Invert Y axis (SVG 0 is top)
        const storageValue = d?.storage ?? 0
        const y = height - ((storageValue - minVal) / range) * (height - padding * 2) - padding
        return `${x},${y}`
    }).join(' ')
})

// Donut Chart logic
const donutSegments = computed(() => {
    const classes = s3Store.storageLensData?.storageClasses || []
    const total = classes.reduce((acc, curr) => acc + curr.size, 0)

    let currentAngle = 0 // Represents the accumulated percentage (0 to 1) used for offset calculation
    // SVG circle circumference logic:
    // r=15.9155 makes circumference approx 100.
    // stroke-dasharray = "portion gap" where portion + gap = 100.

    return classes.map(cls => {
        const percentage = (cls.size / total) * 100
        const dashArray = `${percentage} ${100 - percentage}`

        // Dashoffset starts at 25 (top, 12 o'clock).
        // Positive offset moves counter-clockwise? No, stroke-dashoffset pushes the start.
        // To stack segments, we need to offset by the previous total.
        // It's tricky with simple CSS.
        // Actually, typical pattern is: 
        // dasharray = "percentage 100"
        // dashoffset = -accumulated_percentage (or something similar depending on direction)

        // Let's use a standard trick:
        // offset = 25 - (previous_percentage)
        const offset = 25 - currentAngle

        const segment = {
            name: cls.name,
            size: cls.size,
            percentage: Math.round(percentage),
            dashArray,
            offset, // This works if we rotate the whole SVG -90deg? No, 25 offset handles the start at top. 
            // Actually, if radius makes C=100.
            // Start at 3 o'clock is 0 offset. Svg rotates 0 deg.
            // We want 12 o'clock. Either rotate -90deg or use offset 25.
            color: cls.color
        }

        currentAngle += percentage
        return segment
    })
})

const getTopBucketGrowth = (size: number | undefined) => {
    // Returning 0 for now as true growth data requires historical aggregation
    return 0
}

</script>
<template>
    <div
        class="min-h-screen bg-white text-[#232f3e] pb-32 font-urbanist relative overflow-hidden selection:bg-[#ff9900]/30 selection:text-[#232f3e]">
        <!-- Subtle Grid -->
        <div
            class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none [mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)]">
        </div>

        <div class="relative z-10 pt-32 pb-8 px-8 md:px-16 max-w-7xl mx-auto">
            <!-- Breadcrumbs -->
            <div class="flex items-center gap-3 text-[10px] uppercase font-black tracking-widest text-[#545b64] mb-12">
                <span @click="router.push('/s3/buckets')"
                    class="hover:text-[#ff9900] cursor-pointer transition-colors italic">S3 Storage</span>
                <span class="text-[#eaeded]">/</span>
                <span class="text-[#ff9900] italic">Storage Lens</span>
            </div>

            <!-- Header -->
            <div class="flex justify-between items-end mb-16">
                <div>
                    <div
                        class="inline-flex items-center gap-2 mb-6 px-4 py-1.5 bg-[#ff9900]/5 border border-[#ff9900]/20 text-[#ff9900] text-[10px] font-black tracking-[0.2em] uppercase">
                        <span class="w-1.5 h-1.5 bg-[#ff9900] animate-ping"></span>
                        Analytics Engine
                    </div>
                    <h1 class="text-4xl md:text-5xl font-black text-[#232f3e] tracking-tighter mb-4 uppercase italic">
                        S3 Storage <span class="text-[#ff9900]">Lens</span>
                    </h1>
                    <p class="text-[#545b64] text-sm max-w-2xl leading-relaxed font-medium">
                        Organization-wide visibility into object storage usage and activity.
                    </p>
                </div>
                <!-- Refresh indicator -->
                <div v-if="s3Store.isLoading"
                    class="flex items-center gap-2 text-[#ff9900] text-[10px] font-black uppercase tracking-widest animate-pulse">
                    <span class="w-2 h-2 rounded-full bg-[#ff9900]"></span>
                    Refreshing Analytics...
                </div>
            </div>

            <div v-if="s3Store.storageLensData" class="space-y-8 animate-fade-in">

                <!-- Summary Metrics -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div class="bg-white p-8 border-2 border-[#eaeded] relative group overflow-hidden shadow-sm">
                        <div class="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <svg class="w-24 h-24 text-[#ff9900]" fill="currentColor" viewBox="0 0 24 24">
                                <path
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <div class="text-[#545b64] text-[10px] uppercase tracking-widest font-black italic mb-3">Total
                            Storage
                        </div>
                        <div class="text-3xl font-black text-[#232f3e] tracking-tighter">{{
                            formatBytes(s3Store.storageLensData.summary.totalStorage) }}</div>
                        <div
                            class="text-emerald-600 text-[10px] font-black uppercase tracking-widest mt-4 flex items-center gap-1">
                            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            +2.4% <span class="text-[#879196] not-italic">vs last week</span>
                        </div>
                    </div>

                    <div class="bg-white p-8 border-2 border-[#eaeded] relative group overflow-hidden shadow-sm">
                        <div class="text-[#545b64] text-[10px] uppercase tracking-widest font-black italic mb-3">Object
                            Count
                        </div>
                        <div class="text-3xl font-black text-[#232f3e] tracking-tighter">{{
                            formatNumber(s3Store.storageLensData.summary.objectCount) }}</div>
                        <div
                            class="text-emerald-600 text-[10px] font-black uppercase tracking-widest mt-4 flex items-center gap-1">
                            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            +120 <span class="text-[#879196] not-italic">new objects</span>
                        </div>
                    </div>

                    <div class="bg-white p-8 border-2 border-[#eaeded] relative group overflow-hidden shadow-sm">
                        <div class="text-[#545b64] text-[10px] uppercase tracking-widest font-black italic mb-3">Active
                            Buckets
                        </div>
                        <div class="text-3xl font-black text-[#232f3e] tracking-tighter">{{
                            s3Store.storageLensData.summary.activeBuckets }}</div>
                        <div class="text-[#879196] text-[10px] font-black uppercase tracking-widest mt-4">
                            Across all regions
                        </div>
                    </div>

                    <div class="bg-white p-8 border-2 border-[#eaeded] relative group overflow-hidden shadow-sm">
                        <div class="text-[#545b64] text-[10px] uppercase tracking-widest font-black italic mb-3">Avg
                            Object Size
                        </div>
                        <div class="text-3xl font-black text-[#232f3e] tracking-tighter">{{
                            formatBytes(s3Store.storageLensData.summary.avgObjectSize) }}</div>
                        <div class="text-[#ff9900] text-[10px] font-black uppercase tracking-widest mt-4">
                            Optimal range
                        </div>
                    </div>
                </div>

                <!-- Charts Section -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <!-- Storage Trend Line Chart -->
                    <div class="md:col-span-2 bg-white p-10 border-2 border-[#eaeded] shadow-sm">
                        <div class="flex justify-between items-center mb-8">
                            <h3 class="text-lg font-black text-[#232f3e] uppercase tracking-widest italic">Storage
                                Trends</h3>
                            <div class="flex gap-4">
                                <button
                                    class="text-[10px] font-black uppercase tracking-widest text-[#ff9900] border-b-2 border-[#ff9900]">14
                                    Days</button>
                                <button
                                    class="text-[10px] font-black uppercase tracking-widest text-[#879196] hover:text-[#232f3e] transition-colors">30
                                    Days</button>
                            </div>
                        </div>

                        <div class="h-64 w-full relative group">
                            <!-- SVG Chart -->
                            <svg class="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                                <!-- Grid lines -->
                                <line x1="0" y1="38" x2="100" y2="38" stroke="rgba(255,255,255,0.05)"
                                    stroke-width="0.2" />
                                <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.05)"
                                    stroke-width="0.2" />
                                <line x1="0" y1="2" x2="100" y2="2" stroke="rgba(255,255,255,0.05)"
                                    stroke-width="0.2" />

                                <!-- Defs for gradient -->
                                <defs>
                                    <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stop-color="#10b981" stop-opacity="0.2" />
                                        <stop offset="100%" stop-color="#10b981" stop-opacity="0" />
                                    </linearGradient>
                                </defs>

                                <!-- Area under curve needs to be a closed shape -->
                                <!-- We use point data + bottom corners -->
                                <polygon :points="chartPath + ' 100,40 0,40'" fill="url(#gradient)" />

                                <!-- The Line itself -->
                                <polyline :points="chartPath" fill="none" stroke="#10b981" stroke-width="0.8"
                                    stroke-linecap="round" stroke-linejoin="round" />
                            </svg>

                            <!-- Tooltip hint -->
                            <div
                                class="absolute top-0 right-0 bg-[#ff9900]/5 text-[#ff9900] px-3 py-1 border-2 border-[#ff9900]/20 text-[9px] font-black uppercase tracking-widest italic">
                                Live Data
                            </div>
                        </div>
                        <div v-if="s3Store.storageLensData && s3Store.storageLensData.timeSeries.length > 0"
                            class="flex justify-between text-[10px] text-[#879196] mt-4 uppercase tracking-[0.2em] font-black">
                            <span>{{ s3Store.storageLensData?.timeSeries?.[0]?.date }}</span>
                            <span>{{ s3Store.storageLensData?.timeSeries?.[s3Store.storageLensData.timeSeries.length -
                                1]?.date }}</span>
                        </div>
                    </div>

                    <!-- Storage Class Distribution Donut -->
                    <div
                        class="bg-white p-10 border-2 border-[#eaeded] flex flex-col items-center justify-center shadow-sm">
                        <h3
                            class="text-lg font-black text-[#232f3e] uppercase tracking-widest italic mb-10 w-full text-left">
                            Storage Classes</h3>

                        <div class="relative w-48 h-48">
                            <svg class="w-full h-full" viewBox="0 0 40 40">
                                <circle cx="20" cy="20" r="15.9155" fill="none" stroke="#eaeded" stroke-width="5" />
                                <circle v-for="seg in donutSegments" :key="seg.name" cx="20" cy="20" r="15.9155"
                                    fill="none" :stroke="seg.color" stroke-width="5" :stroke-dasharray="seg.dashArray"
                                    :stroke-dashoffset="seg.offset" class="transition-all duration-1000 ease-out" />
                            </svg>
                            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span class="text-2xl font-black text-[#232f3e] tracking-tighter">{{
                                    donutSegments[0]?.percentage
                                    }}%</span>
                                <span class="text-[9px] uppercase text-[#879196] font-black tracking-[0.2em] italic">{{
                                    donutSegments[0]?.name }}</span>
                            </div>
                        </div>

                        <!-- Legend -->
                        <div class="w-full mt-12 space-y-4">
                            <div v-for="seg in donutSegments" :key="seg.name"
                                class="flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
                                <div class="flex items-center gap-3 text-[#545b64]">
                                    <span class="w-1.5 h-1.5 rounded-none"
                                        :style="{ backgroundColor: seg.color }"></span>
                                    {{ seg.name }}
                                </div>
                                <div class="text-[#232f3e] italic">{{ formatBytes(seg.size) }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Top Buckets -->
                <div class="bg-white p-10 border-2 border-[#eaeded] shadow-sm">
                    <h3 class="text-lg font-black text-[#232f3e] uppercase tracking-widest italic mb-10">Top Buckets by
                        Usage</h3>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr
                                    class="text-[10px] uppercase text-[#879196] tracking-[0.2em] font-black border-b-2 border-[#eaeded]">
                                    <th class="pb-6 pl-4 italic">Bucket Name</th>
                                    <th class="pb-6 italic">Region</th>
                                    <th class="pb-6 italic">Storage Used</th>
                                    <th class="pb-6 italic">Total Objects</th>
                                    <th class="pb-6 pr-4 text-right italic">Trend</th>
                                </tr>
                            </thead>
                            <tbody class="text-xs">
                                <tr v-for="bucket in s3Store.storageLensData.topBuckets" :key="bucket.name"
                                    class="group hover:bg-[#ff9900]/5 transition-colors border-b border-[#eaeded] last:border-0">
                                    <td
                                        class="py-6 pl-4 font-black text-[#232f3e] uppercase group-hover:text-[#ff9900] transition-colors italic">
                                        {{ bucket.name }}
                                    </td>
                                    <td class="py-6 text-[#545b64] font-black uppercase tracking-tight">{{ bucket.region
                                        }}</td>
                                    <td class="py-6 font-black text-[#232f3e] tracking-tighter italic">{{
                                        formatBytes(bucket.size) }}</td>
                                    <td class="py-6 font-black text-[#232f3e] tracking-tighter italic">{{
                                        formatNumber(bucket.objectCount) }}
                                    </td>
                                    <td class="py-6 pr-4 text-right">
                                        <div
                                            class="inline-flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 border border-emerald-100 text-[9px] font-black uppercase tracking-widest italic">
                                            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                            </svg>
                                            {{ getTopBucketGrowth(bucket.size) }}%
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Fallback loading state (initial) -->
            <div v-if="!s3Store.storageLensData && !s3Store.isLoading"
                class="flex flex-col items-center justify-center py-32 text-slate-500">
                <div class="mb-4">No data available</div>
                <button @click="s3Store.fetchStorageLensData()"
                    class="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-md text-white transition-colors">Retry</button>
            </div>
            <div v-if="s3Store.isLoading && !s3Store.storageLensData" class="flex items-center justify-center py-32">
                <div class="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
            </div>

            <!-- Help Trigger -->
            <div @click="docsStore.openHelp('s3', 's3-storage-lens-overview')"
                class="mt-20 bg-[#232f3e] p-10 border border-white/10 shadow-sm flex items-center justify-between cursor-pointer hover:bg-[#2a3644] transition-colors group">
                <div class="flex items-center gap-6 text-white">
                    <div class="p-3 bg-white/5 rounded-sm border border-white/10">
                        <HelpCircle :size="32" class="text-emerald-400" />
                    </div>
                    <div>
                        <h3 class="text-xl font-black uppercase tracking-widest italic leading-none mb-2">Storage Lens
                            Insight</h3>
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-tight">Learn how to optimize your
                            storage usage</p>
                    </div>
                </div>
                <div
                    class="text-emerald-400 opacity-40 group-hover:opacity-100 transition-opacity tracking-tighter font-black uppercase text-xs">
                    View Guide &rarr;</div>
            </div>

        </div>

        <!-- Help Drawer -->
        <DocHelpDrawer :isOpen="docsStore.drawer.isOpen" :service="docsStore.drawer.service || 's3'"
            :slug="docsStore.drawer.slug || ''" @close="docsStore.closeHelp" />
    </div>
</template>

<style scoped>
/* Custom animation for fade in */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in {
    animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
