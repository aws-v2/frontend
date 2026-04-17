<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useS3Store } from '../store/s3Store'
import { onMounted, computed } from 'vue'

const router = useRouter()
const s3Store = useS3Store()

onMounted(async () => {
    if (!s3Store.securityData) {
        await s3Store.fetchSecurityData()
    }
})

const scoreColor = computed(() => {
    const score = s3Store.securityData?.score || 0
    if (score >= 90) return 'text-emerald-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
})

const scoreBorderColor = computed(() => {
    const score = s3Store.securityData?.score || 0
    if (score >= 90) return 'border-emerald-500'
    if (score >= 70) return 'border-yellow-500'
    return 'border-red-500'
})

const getSeverityColors = (severity: string) => {
    switch (severity) {
        case 'critical': return 'text-red-600 bg-red-50 border-red-100'
        case 'high': return 'text-orange-600 bg-orange-50 border-orange-100'
        case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-100'
        case 'low': return 'text-blue-600 bg-blue-50 border-blue-100'
        default: return 'text-[#879196] bg-[#eaeded] border-[#eaeded]'
    }
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
                <span class="text-[#ff9900] italic">Security & Access</span>
            </div>

            <!-- Header -->
            <div class="flex justify-between items-end mb-16">
                <div>
                    <div
                        class="inline-flex items-center gap-2 mb-6 px-4 py-1.5 bg-[#ff9900]/5 border border-[#ff9900]/20 text-[#ff9900] text-[10px] font-black tracking-[0.2em] uppercase">
                        <span class="w-1.5 h-1.5 bg-[#ff9900] animate-ping"></span>
                        Security Guard
                    </div>
                    <h1 class="text-4xl md:text-5xl font-black text-[#232f3e] tracking-tighter mb-4 uppercase italic">
                        Access <span class="text-[#ff9900]">Summary</span>
                    </h1>
                    <p class="text-[#545b64] text-sm max-w-2xl leading-relaxed font-medium">
                        Security posture and access analysis for your object storage.
                    </p>
                </div>
                <!-- Refresh indicator -->
                <div v-if="s3Store.isLoading"
                    class="flex items-center gap-2 text-[#ff9900] text-[10px] font-black uppercase tracking-widest animate-pulse">
                    <span class="w-2 h-2 rounded-full bg-[#ff9900]"></span>
                    Analyzing...
                </div>
            </div>

            <div v-if="s3Store.securityData" class="space-y-8 animate-fade-in">

                <!-- Top Section: Score & Key Metrics -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Security Score -->
                    <div
                        class="bg-white p-10 border-2 border-[#eaeded] flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
                        <div class="relative z-10 text-center">
                            <div class="text-[#545b64] text-[10px] uppercase tracking-widest font-black italic mb-6">
                                Security
                                Score</div>
                            <div class="w-40 h-40 rounded-full border-4 flex items-center justify-center mb-6 transition-colors duration-500"
                                :class="scoreBorderColor">
                                <span class="text-5xl font-black tracking-tighter" :class="scoreColor">{{
                                    s3Store.securityData.score }}</span>
                            </div>
                            <div class="text-[10px] uppercase font-black tracking-widest text-[#879196]">
                                <span v-if="s3Store.securityData.score >= 90" class="text-emerald-600">Excellent
                                    posture</span>
                                <span v-else-if="s3Store.securityData.score >= 70" class="text-yellow-600">Improvement
                                    needed</span>
                                <span v-else class="text-red-600">Critical attention required</span>
                            </div>
                        </div>
                    </div>

                    <!-- Critical Risks -->
                    <div class="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div
                            class="bg-white p-8 border-2 border-[#eaeded] flex flex-col justify-between group hover:bg-[#ff9900]/5 transition-colors shadow-sm">
                            <div class="mb-6">
                                <div
                                    class="w-12 h-12 bg-red-50 text-red-600 flex items-center justify-center mb-4 border border-red-100">
                                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div class="text-[#545b64] text-[10px] uppercase tracking-widest font-black italic">
                                    Public
                                    Buckets</div>
                            </div>
                            <div class="flex items-end justify-between">
                                <div class="text-4xl font-black text-[#232f3e] tracking-tighter">{{
                                    s3Store.securityData.publicBucketsCount }}</div>
                                <div
                                    class="text-[10px] text-[#879196] font-black uppercase tracking-widest mb-1 italic">
                                    Buckets</div>
                            </div>
                        </div>

                        <div
                            class="bg-white p-8 border-2 border-[#eaeded] flex flex-col justify-between group hover:bg-[#ff9900]/5 transition-colors shadow-sm">
                            <div class="mb-6">
                                <div
                                    class="w-12 h-12 bg-orange-50 text-orange-600 flex items-center justify-center mb-4 border border-orange-100">
                                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <div class="text-[#545b64] text-[10px] uppercase tracking-widest font-black italic">
                                    Unencrypted
                                </div>
                            </div>
                            <div class="flex items-end justify-between">
                                <div class="text-4xl font-black text-[#232f3e] tracking-tighter">{{
                                    s3Store.securityData.unencryptedCount }}</div>
                                <div
                                    class="text-[10px] text-[#879196] font-black uppercase tracking-widest mb-1 italic">
                                    Buckets</div>
                            </div>
                        </div>

                        <div
                            class="bg-white p-8 border-2 border-[#eaeded] flex flex-col justify-between group hover:bg-[#ff9900]/5 transition-colors shadow-sm">
                            <div class="mb-6">
                                <div
                                    class="w-12 h-12 bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-100">
                                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <div class="text-[#545b64] text-[10px] uppercase tracking-widest font-black italic">MFA
                                    Missing
                                </div>
                            </div>
                            <div class="flex items-end justify-between">
                                <div class="text-4xl font-black text-[#232f3e] tracking-tighter">{{
                                    s3Store.securityData.mfaMissingCount }}</div>
                                <div
                                    class="text-[10px] text-[#879196] font-black uppercase tracking-widest mb-1 italic">
                                    Buckets</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Detailed Findings -->
                <div class="bg-white border-2 border-[#eaeded] shadow-sm overflow-hidden">
                    <div class="p-10 border-b border-[#eaeded] flex justify-between items-center">
                        <h3 class="text-lg font-black text-[#232f3e] uppercase tracking-widest italic">Security Findings
                        </h3>
                        <button
                            class="text-[10px] font-black text-[#ff9900] hover:text-[#232f3e] transition-colors uppercase tracking-[0.2em] italic border-b-2 border-[#ff9900]">Export
                            Report</button>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr
                                    class="text-[10px] uppercase tracking-[0.2em] text-[#879196] font-black border-b-2 border-[#eaeded]">
                                    <th class="p-8 italic">Severity</th>
                                    <th class="p-8 italic">Finding ID</th>
                                    <th class="p-8 italic">Bucket</th>
                                    <th class="p-8 italic">Description</th>
                                    <th class="p-8 italic">Remediation</th>
                                    <th class="p-8 pr-8 text-right italic">Action</th>
                                </tr>
                            </thead>
                            <tbody class="text-xs text-[#545b64]">
                                <tr v-for="finding in s3Store.securityData.findings" :key="finding.id"
                                    class="group hover:bg-[#ff9900]/5 transition-colors border-b border-[#eaeded] last:border-0">
                                    <td class="p-8">
                                        <span
                                            class="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest italic border-2"
                                            :class="getSeverityColors(finding.severity)">
                                            {{ finding.severity }}
                                        </span>
                                    </td>
                                    <td class="p-8 font-black uppercase tracking-tight text-[#879196]">{{ finding.id }}
                                    </td>
                                    <td class="p-8 font-black text-[#232f3e] uppercase italic">{{ finding.bucket_name }}
                                    </td>
                                    <td class="p-8 leading-relaxed">{{ finding.description }}</td>
                                    <td class="p-8 text-[#879196] font-medium leading-relaxed italic">{{
                                        finding.remediation }}</td>
                                    <td class="p-8 pr-8 text-right">
                                        <button
                                            class="text-[#ff9900] hover:text-[#232f3e] font-black text-[10px] uppercase tracking-widest italic transition-colors">Manage</button>
                                    </td>
                                </tr>
                                <tr v-if="s3Store.securityData.findings.length === 0">
                                    <td colspan="6"
                                        class="p-24 text-center text-[#879196] font-black uppercase tracking-widest italic">
                                        No security findings detected. Good job!
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Loading State -->
            <div v-else-if="s3Store.isLoading" class="flex flex-col items-center justify-center py-48 text-[#879196]">
                <div class="w-16 h-16 border-4 border-[#ff9900]/10 border-t-[#ff9900] rounded-none animate-spin mb-8">
                </div>
                <div class="text-[10px] font-black uppercase tracking-[0.2em] animate-pulse italic">Scanning security
                    posture...</div>
            </div>

            <!-- Error State -->
            <div v-else class="flex flex-col items-center justify-center py-48 text-[#879196]">
                <div
                    class="w-16 h-16 bg-red-50 text-red-600 flex items-center justify-center mb-8 border border-red-100">
                    <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <div class="text-[10px] font-black uppercase tracking-[0.2em] italic mb-6">Failed to load security data.
                </div>
                <button @click="s3Store.fetchSecurityData()"
                    class="px-8 py-3 bg-[#ff9900] text-[#232f3e] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#232f3e] hover:text-[#ff9900] transition-all">Retry
                    Analysis</button>
            </div>

        </div>
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
