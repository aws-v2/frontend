<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useComputeStore } from '../store/computeStore'
import { useToastStore } from '@/shared/store/toastStore'

const route = useRoute()
const router = useRouter()
const computeStore = useComputeStore()
const toastStore = useToastStore()

const templateId = computed(() => route.params.id as string)

onMounted(async () => {
    await computeStore.fetchTemplate(templateId.value)
})

const template = computed(() => computeStore.currentTemplate)

const goBack = () => router.push('/compute/templates')

const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this template?')) return
    try {
        await computeStore.deleteTemplate(templateId.value)
        toastStore.addToast('Template successfully decommissioned', 'success')
        router.push('/compute/templates')
    } catch (error: any) {
        toastStore.addToast(error.message || 'Failed to delete template', 'error')
    }
}

const launchFromTemplate = () => {
    if (!template.value) return
    router.push({
        name: 'create-instance',
        query: {
            template_id: templateId.value,
            image: template.value.image,
            cpu: template.value.cpu,
            ram: template.value.ram
        }
    })
}
</script>

<template>
    <div
        class="min-h-screen bg-white text-[#16191f] font-urbanist selection:bg-blue-500/20 selection:text-blue-900 overflow-x-hidden pb-40">
        <!-- Structural Grid Background -->
        <div
            class="absolute inset-0 bg-[linear-gradient(rgba(0,102,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,102,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none">
        </div>

        <!-- Loading Overlay -->
        <div v-if="computeStore.isLoading && !template"
            class="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div class="flex flex-col items-center gap-6">
                <div class="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-none animate-spin"></div>
                <p class="text-[10px] font-black uppercase tracking-[0.3em] text-[#232f3e]">Blueprint_Sync_Active...</p>
            </div>
        </div>

        <div v-if="template" class="relative z-10 p-8 px-8 md:px-16 pt-24 space-y-12">
            <!-- Breadcrumbs -->
            <nav class="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                <a href="#" @click.prevent="router.push('/dashboard')"
                    class="text-[#879196] hover:text-blue-600 transition-colors">AWS_GLOBAL</a>
                <div class="w-1 h-1 bg-[#eaeded] rounded-full"></div>
                <a href="#" @click.prevent="router.push('/compute')"
                    class="text-[#879196] hover:text-blue-600 transition-colors">EC2_ENGINE</a>
                <div class="w-1 h-1 bg-[#eaeded] rounded-full"></div>
                <a href="#" @click.prevent="goBack"
                    class="text-[#879196] hover:text-blue-600 transition-colors">TEMPLATES_REGISTRY</a>
                <div class="w-1 h-1 bg-[#eaeded] rounded-full"></div>
                <span class="text-[#232f3e] font-black">{{ templateId.slice(0, 12) }}</span>
            </nav>

            <!-- Header Section -->
            <div
                class="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 pb-12 border-b-2 border-[#eaeded]">
                <div class="flex items-start gap-8">
                    <div
                        class="w-20 h-20 bg-[#232f3e] flex items-center justify-center text-white relative overflow-hidden group">
                        <div
                            class="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        </div>
                        <svg class="w-10 h-10 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <div class="flex items-center gap-6 mb-4">
                            <h1 class="text-5xl font-black text-[#232f3e] tracking-tighter uppercase leading-none">{{
                                template.name || '// UNNAMED_TEMPLATE' }}</h1>
                            <span
                                class="flex items-center gap-2 text-[10px] font-black px-4 py-1.5 bg-blue-500/5 border-2 border-blue-600/20 text-blue-600 uppercase tracking-widest">
                                <span class="w-1.5 h-1.5 bg-blue-600 animate-pulse"></span>
                                ACTIVE_BLUEPRINT
                            </span>
                        </div>
                        <p class="text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em] italic">
                            // TEMPLATE_VERSION: v1.0.0 // OS: {{ template.image }} // ID: {{ template.id }}
                        </p>
                    </div>
                </div>
                <div class="flex flex-wrap gap-4">
                    <button @click="launchFromTemplate"
                        class="px-12 py-5 bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[#232f3e] transition-all shadow-[8px_8px_0px_rgba(37,99,235,0.2)]">Launch_Instance</button>
                    <button @click="handleDelete"
                        class="px-12 py-5 border-2 border-rose-600 text-rose-600 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-rose-600 hover:text-white transition-all">Decommission</button>
                </div>
            </div>

            <!-- Configuration Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <!-- Specifications Column -->
                <div class="lg:col-span-2 space-y-12">
                    <div class="bg-white border-2 border-[#232f3e] p-12 relative overflow-hidden">
                        <div
                            class="absolute right-0 top-0 w-32 h-32 bg-[#fafafa] -rotate-45 translate-x-16 -translate-y-16 border-l-2 border-[#232f3e]">
                        </div>

                        <h3
                            class="text-2xl font-black text-[#232f3e] uppercase tracking-tighter italic flex items-center gap-4 mb-12">
                            <span class="w-2 h-8 bg-blue-600"></span>
                            Instance_Configuration_Profile
                        </h3>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div class="space-y-8">
                                <div v-for="spec in [
                                    { label: 'OS_IMAGE_PROTOCOL', value: template.image, sub: 'Verified_Security_Baseline' },
                                    { label: 'CPU_ARCHITECTURE', value: template.cpu + ' VCPU_CORES', sub: 'Calculated_Compute_Power' }
                                ]" :key="spec.label" class="space-y-2">
                                    <p class="text-[9px] font-black text-[#879196] uppercase tracking-[0.2em] italic">//
                                        {{ spec.label }}</p>
                                    <p class="text-xl font-black text-[#232f3e] uppercase">{{ spec.value }}</p>
                                    <p
                                        class="text-[9px] font-black text-[#545b64] uppercase tracking-widest opacity-60">
                                        {{ spec.sub }}</p>
                                </div>
                            </div>
                            <div class="space-y-8">
                                <div v-for="spec in [
                                    { label: 'MEMORY_ALLOCATION', value: (template.ram / 1024).toFixed(1) + ' GIB_RAM', sub: 'High_Speed_Buffered_Storage' },
                                    { label: 'STORAGE_CONFIGURATION', value: '30GB_EBS_OPTIMIZED', sub: 'General_Purpose_SSD' }
                                ]" :key="spec.label" class="space-y-2">
                                    <p class="text-[9px] font-black text-[#879196] uppercase tracking-[0.2em] italic">//
                                        {{ spec.label }}</p>
                                    <p class="text-xl font-black text-[#232f3e] uppercase">{{ spec.value }}</p>
                                    <p
                                        class="text-[9px] font-black text-[#545b64] uppercase tracking-widest opacity-60">
                                        {{ spec.sub }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Description Card -->
                    <div class="bg-[#fafafa] border-2 border-[#eaeded] p-12 space-y-6">
                        <h4 class="text-[10px] font-black text-[#879196] uppercase tracking-[0.3em] italic">//
                            RESOURCE_ANNOTATION</h4>
                        <p class="text-lg font-bold text-[#232f3e] leading-relaxed uppercase">{{ template.description ||
                            'No_Description_Provided_For_This_Blueprint' }}</p>
                    </div>
                </div>

                <!-- Metadata / Info Column -->
                <div class="space-y-8">
                    <div class="bg-white border-2 border-[#eaeded] p-8 space-y-8">
                        <h4
                            class="text-xs font-black text-[#232f3e] uppercase tracking-widest border-b-2 border-[#eaeded] pb-4">
                            Blueprint_Metadata</h4>

                        <div class="space-y-6">
                            <div v-for="info in [
                                { label: 'Created', value: new Date(template.created_at).toLocaleDateString() },
                                { label: 'Owner', value: 'AWS_USER_ACTIVE' },
                                { label: 'Status', value: 'READY_TO_LAUNCH' }
                            ]" :key="info.label" class="flex justify-between items-end">
                                <span class="text-[9px] font-black text-[#879196] uppercase tracking-widest">{{
                                    info.label }}</span>
                                <span
                                    class="text-[10px] font-black text-[#232f3e] border-b border-dotted border-[#eaeded] flex-grow mx-4 mb-1"></span>
                                <span class="text-xs font-black text-[#232f3e] uppercase">{{ info.value }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="bg-[#232f3e] p-8 text-white space-y-6 relative overflow-hidden">
                        <div class="absolute right-[-10%] bottom-[-20%] opacity-10 scale-150">
                            <svg class="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M13 10V3L4 14H11V21L20 10H13Z" />
                            </svg>
                        </div>
                        <h4 class="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 italic relative z-10">//
                            QUICK_METRICS</h4>
                        <div class="space-y-4 relative z-10">
                            <div class="flex justify-between text-2xl font-black italic tracking-tighter">
                                <span>USAGE_RANK</span>
                                <span class="text-blue-400">#04</span>
                            </div>
                            <p class="text-[9px] font-black uppercase tracking-widest opacity-40 leading-tight">
                                Historical performance suggests 99.9% deployment success rate with current params.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800;900&display=swap');

.font-urbanist {
    font-family: 'Urbanist', sans-serif;
}
</style>
