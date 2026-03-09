<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useAuthStore } from '@/modules/auth/store/authStore'
import { useComputeStore } from '@/modules/compute/store/computeStore'
import { useLambdaStore } from '@/modules/lambda/store/lambdaStore'
import PublicNavbar from '@/shared/components/PublicNavbar.vue'

const router = useRouter()
const authStore = useAuthStore()
const computeStore = useComputeStore()
const lambdaStore = useLambdaStore()

// --- Lambda Scaling Policy State ---
const isLambdaScalingCrudModalOpen = ref(false)
const lambdaScalingCrudMode = ref<'list' | 'create' | 'edit'>('list')
const selectedLambdaScalingPolicy = ref<any>(null)

const lambdaScalingForm = ref({
    function_id: '',
    metric_name: 'Throttles',
    scale_up_threshold: 100,
    scale_down_threshold: 50,
    max_concurrency_limit: 10,
    cooldown_seconds: 60,
    min_concurrency_limit: 1,
    scale_step: 1
})
const lambdaScalingFormError = ref('')

const openLambdaScalingCrudModal = async () => {
    isLambdaScalingCrudModalOpen.value = true
    lambdaScalingCrudMode.value = 'list'
    await lambdaStore.fetchScalingPolicies()
}

const closeLambdaScalingCrudModal = () => {
    isLambdaScalingCrudModalOpen.value = false
    selectedLambdaScalingPolicy.value = null
}

const goToAddLambdaScalingPolicy = () => {
    lambdaScalingCrudMode.value = 'create'
    lambdaScalingForm.value = {
        function_id: '',
        metric_name: 'Invocations',
        scale_up_threshold: 100,
        scale_down_threshold: 50,
        max_concurrency_limit: 10,
        cooldown_seconds: 60,
        min_concurrency_limit: 1,
        scale_step: 1
    }
    lambdaScalingFormError.value = ''
}

const goToEditLambdaScalingPolicy = (policy: any) => {
    lambdaScalingCrudMode.value = 'edit'
    selectedLambdaScalingPolicy.value = policy
    lambdaScalingForm.value = {
        function_id: policy.function_id || policy.target_id,
        metric_name: policy.metric_name,
        scale_up_threshold: policy.scale_up_threshold || policy.target_value,
        scale_down_threshold: policy.scale_down_threshold || policy.scale_down_value,
        max_concurrency_limit: policy.max_concurrency_limit || policy.max_instances,
        cooldown_seconds: policy.cooldown_seconds || policy.scale_out_cooldown || policy.scale_in_cooldown || 60,
        min_concurrency_limit: policy.min_concurrency_limit || policy.min_instances || 1,
        scale_step: policy.scale_step || policy.concurrency_step || 1
    }
    lambdaScalingFormError.value = ''
}

const deleteLambdaScalingPolicy = async (id: string) => {
    if (confirm('Are you sure you want to delete this Lambda scaling policy?')) {
        await lambdaStore.deletePolicy(id)
    }
}

const submitLambdaScalingPolicy = async () => {
    if (!lambdaScalingForm.value.function_id) {
        lambdaScalingFormError.value = 'Function ID is required'
        return
    }
    if (lambdaScalingForm.value.scale_up_threshold <= 0) {
        lambdaScalingFormError.value = 'Scale Up Threshold must be greater than 0'
        return
    }
    if (lambdaScalingForm.value.scale_down_threshold >= lambdaScalingForm.value.scale_up_threshold) {
        lambdaScalingFormError.value = 'Scale Down Threshold must be less than Scale Up Threshold'
        return
    }

    const payload = {
        action: lambdaScalingCrudMode.value === 'edit' ? 'update' : 'create',
        policy: { ...lambdaScalingForm.value }
    }

    try {
        if (lambdaScalingCrudMode.value === 'edit' && selectedLambdaScalingPolicy.value) {
            await lambdaStore.updateScalingPolicy(selectedLambdaScalingPolicy.value.function_id || selectedLambdaScalingPolicy.value.target_id, payload)
        } else {
            await lambdaStore.createScalingPolicy(lambdaScalingForm.value.function_id, payload)
        }
        lambdaScalingCrudMode.value = 'list'
    } catch (e: any) {
        lambdaScalingFormError.value = e.message || 'Failed to save policy'
    }
}

// State for live-feel metrics
const liveCpu = ref(45.2)
const liveRam = ref(32.8)
const activeTab = ref('nodes')
const activeRuntimeTabIndex = ref(0)
const isCodeModalOpen = ref(false)
let intervalId: any = null

const runtimes = [
    {
        name: 'JAVA',
        code: `package com.serwinsys.lambda;

import com.serwinsys.lambda.models.InvokeResponse;
import com.serwinsys.lambda.models.MetricsResponse;
import com.serwinsys.lambda.config.*;
import java.util.Map;

public class Example {
    public static void main(String[] args) {
        SerwinCredentials credentials = new SerwinCredentials(
                System.getenv().getOrDefault("LAMBDA_ACCESS_KEY", "AKIAPQOQ22BFO8K2CT0Z"),
                System.getenv().getOrDefault("LAMBDA_SECRET_KEY", "pjEspdB9IeF6o98fXrMaQcPeF5K/a/JTSop64vjF"));

        SerwinLambdaClient client = new SerwinLambdaClient(credentials);


        try {
            client.listFunctions().forEach(fn -> System.out.println(" - " + fn.getName()));

            InvokeResponse result = client.invoke("hello-gow", Map.of("name", "SDK User"));

            MetricsResponse metrics = client.getMetrics("hello-gow");
            
            client.listFunctions().stream()
                    .filter(fn -> "another-test".equals(fn.getName()))
                    .findFirst()
                    .ifPresent(fn -> {
                        testInvokeByArn(client, fn.getArn());
                    });
        } catch (Exception e) { e.printStackTrace(); }
    }

    private static void testInvokeByArn(SerwinLambdaClient client, String arn) {
        InvokeResponse result = client.invokeByArn(arn, Map.of("name", "ARN User"));
    }
}`
    }
]

const updateLiveMetrics = () => {
    liveCpu.value = Math.max(10, Math.min(95, liveCpu.value + (Math.random() - 0.5) * 5))
    liveRam.value = Math.max(20, Math.min(80, liveRam.value + (Math.random() - 0.5) * 2))
}

const navigateTo = (route: any) => {
    router.push(route)
}

onMounted(async () => {
    // Set active tab based on route if arriving from a lambda-specific link
    if (router.currentRoute.value.name === 'lambda-landing') {
        activeTab.value = 'functions'
    }

    if (authStore.isAuthenticated) {
        await Promise.all([
            computeStore.fetchInstances(),
            computeStore.fetchFleetOverview(),
            computeStore.fetchRecentEvents(),
            computeStore.fetchVolumes(),
            computeStore.fetchSnapshots(),
            computeStore.fetchTemplates(),
            computeStore.fetchSSHKeys(),
            computeStore.fetchScalingPolicies(),
            lambdaStore.fetchFunctions(),
            lambdaStore.fetchScalingPolicies()
        ])

        intervalId = setInterval(updateLiveMetrics, 3000)
    }
})

onUnmounted(() => {
    if (intervalId) clearInterval(intervalId)
})

const consoleEvents = computed(() => {
    if (computeStore.recentEvents.length > 0) return computeStore.recentEvents
    return [
        { id: '1', timestamp: new Date().toISOString(), type: 'success', message: 'Hypervisor layer initialized', resource: 'SYSTEM' },
        { id: '2', timestamp: new Date().toISOString(), type: 'info', message: 'Fleet sync completed', resource: 'ORCHESTRATOR' },
        { id: '3', timestamp: new Date().toISOString(), type: 'info', message: 'Telemetry stream active', resource: 'MONITOR' }
    ]
})

const getStatusColor = (type: string) => {
    switch (type) {
        case 'success': return 'text-emerald-500'
        case 'warn': return 'text-amber-500'
        case 'error': return 'text-red-500'
        default: return 'text-blue-400'
    }
}
</script>

<template>
    <div
        class="min-h-screen bg-white text-[#16191f] font-urbanist selection:bg-blue-500/20 selection:text-blue-900 overflow-x-hidden">

        <!-- Navigation -->
        <PublicNavbar activeLink="compute" />

        <div class="relative min-h-screen pt-24">
            <!-- Structural Grid Background -->
            <div
                class="absolute inset-0 bg-[linear-gradient(rgba(0,102,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,102,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none">
            </div>

            <!-- Authenticated View: Developer Console -->
            <div v-if="authStore.isAuthenticated" class="relative z-10 max-w-7xl mx-auto px-6 pb-40">
                <!-- Trace Header -->
                <div class="mb-12 border-l-4 border-blue-600 pl-8 py-4 bg-[#fafafa] relative overflow-hidden group">
                    <div
                        class="absolute right-0 top-0 w-32 h-32 bg-blue-600/5 -rotate-45 translate-x-16 -translate-y-16">
                    </div>
                    <div class="flex items-center gap-4 mb-3">
                        <div class="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        <span class="text-[10px] font-black text-blue-600 tracking-[0.3em] uppercase">Compute Protocol
                            v2.0</span>
                        <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    </div>
                    <h1 class="text-6xl font-black tracking-tight text-[#232f3e] uppercase leading-none">
                        Fleet <span class="text-blue-600 italic">Orchestrator</span>
                    </h1>
                </div>

                <!-- Main Grid -->
                <div class="grid lg:grid-cols-12 gap-10">

                    <!-- Left: Metrics & Health -->
                    <div class="lg:col-span-8 space-y-10">

                        <!-- Real-time Cluster Metrics -->
                        <div class="grid md:grid-cols-3 gap-0 border-2 border-[#232f3e] bg-white">
                            <div
                                class="p-8 border-r-2 last:border-r-0 border-[#232f3e] hover:bg-[#fafafa] transition-colors">
                                <p class="text-[10px] font-black text-[#879196] mb-6 tracking-widest uppercase italic">
                                    CPU_LOAD</p>
                                <div class="flex items-end gap-3 mb-6">
                                    <span class="text-6xl font-black text-[#232f3e] tracking-tighter">{{
                                        liveCpu.toFixed(1) }}<span class="text-xl text-blue-600 ml-1">%</span></span>
                                </div>
                                <div class="h-1 bg-[#eaeded] relative overflow-hidden">
                                    <div class="absolute inset-y-0 left-0 bg-blue-600 transition-all duration-1000"
                                        :style="{ width: `${liveCpu}%` }"></div>
                                </div>
                            </div>

                            <div
                                class="p-8 border-r-2 last:border-r-0 border-[#232f3e] hover:bg-[#fafafa] transition-colors">
                                <p class="text-[10px] font-black text-[#879196] mb-6 tracking-widest uppercase italic">
                                    MEM_INDEX</p>
                                <div class="flex items-end gap-3 mb-6">
                                    <span class="text-6xl font-black text-[#232f3e] tracking-tighter">{{
                                        liveRam.toFixed(1) }}<span class="text-xl text-blue-600 ml-1">%</span></span>
                                </div>
                                <div class="h-1 bg-[#eaeded] relative overflow-hidden">
                                    <div class="absolute inset-y-0 left-0 bg-blue-600 transition-all duration-1000"
                                        :style="{ width: `${liveRam}%` }"></div>
                                </div>
                            </div>

                            <div class="p-8 hover:bg-[#fafafa] transition-colors">
                                <p class="text-[10px] font-black text-[#879196] mb-6 tracking-widest uppercase italic">
                                    UPTIME</p>
                                <div class="flex items-end gap-3 mb-6">
                                    <span class="text-6xl font-black text-[#232f3e] tracking-tighter">99.9<span
                                            class="text-xl text-emerald-600 ml-1">9</span></span>
                                </div>
                                <div class="flex gap-1 h-1">
                                    <div v-for="i in 8" :key="i" class="flex-1 bg-emerald-500"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Tab Switcher -->
                        <div class="flex border-b-2 border-[#232f3e] bg-white">
                            <button @click="activeTab = 'nodes'"
                                class="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden hover:bg-[#fafafa]"
                                :class="activeTab === 'nodes' ? 'text-blue-600 bg-white' : 'text-[#879196]'">
                                Cluster_Nodes
                                <div v-if="activeTab === 'nodes'"
                                    class="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"></div>
                            </button>
                            <button @click="activeTab = 'functions'"
                                class="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden hover:bg-[#fafafa]"
                                :class="activeTab === 'functions' ? 'text-amber-600 bg-white' : 'text-[#879196]'">
                                Forge_Functions
                                <div v-if="activeTab === 'functions'"
                                    class="absolute bottom-0 left-0 right-0 h-1 bg-amber-500"></div>
                            </button>
                            <button @click="() => { }"
                                class="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#eaeded] cursor-not-allowed">
                                Mesh_Clusters (TBD)
                            </button>
                        </div>

                        <!-- Nodes Section -->
                        <div v-if="activeTab === 'nodes'"
                            class="bg-white border-x-2 border-b-2 border-[#232f3e] p-10 animate-in fade-in duration-500">
                            <div class="flex justify-between items-end mb-12">
                                <div>
                                    <h3 class="text-2xl font-black text-[#232f3e] uppercase tracking-tight mb-2">
                                        Node_Inventory</h3>
                                    <p class="text-[10px] font-black text-[#879196] uppercase tracking-widest">Active
                                        Hybrid-Core VMS</p>
                                </div>
                                <button @click="router.push({ name: 'instances-list' })"
                                    class="text-[10px] font-black text-blue-600 hover:text-[#232f3e] transition-colors uppercase tracking-[0.2em] border-b-2 border-blue-600 pb-1">View
                                    Terminal &rarr;</button>
                            </div>

                            <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <template v-if="computeStore.instances.length > 0">
                                    <div v-for="inst in computeStore.instances.slice(0, 7)" :key="inst.id"
                                        @click="router.push({ name: 'instance-details', params: { id: inst.id } })"
                                        class="p-5 border-2 border-[#eaeded] hover:border-blue-600 transition-all cursor-pointer group bg-[#fafafa] hover:bg-white relative overflow-hidden">
                                        <div class="flex justify-between items-start mb-4">
                                            <div class="w-3 h-3 border-2 border-emerald-500 bg-emerald-500"></div>
                                            <span class="text-[10px] text-[#879196] font-black tracking-widest">{{
                                                inst.id.substring(0, 8).toUpperCase() }}</span>
                                        </div>
                                        <p
                                            class="text-xs font-black text-[#232f3e] truncate mb-1 uppercase tracking-tight">
                                            {{ inst.name }}</p>
                                        <p class="text-[9px] font-black text-[#879196] uppercase tracking-widest">{{
                                            inst.type }} // {{ inst.az }}</p>
                                    </div>
                                </template>
                                <button @click="router.push({ name: 'launch-instance' })"
                                    class="p-5 border-2 border-dashed border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex flex-col items-center justify-center group font-black uppercase">
                                    <span class="text-2xl mb-1">+</span>
                                    <span class="text-[9px] tracking-widest">Deploy</span>
                                </button>
                            </div>
                        </div>

                        <!-- Functions Section -->
                        <div v-if="activeTab === 'functions'"
                            class="bg-white border-x-2 border-b-2 border-[#232f3e] p-10 animate-in fade-in duration-500">
                            <div class="flex justify-between items-end mb-12">
                                <div>
                                    <h3 class="text-2xl font-black text-[#232f3e] uppercase tracking-tight mb-2">
                                        Active_Functions</h3>
                                    <p class="text-[10px] font-black text-[#879196] uppercase tracking-widest">
                                        Event-Driven Forge Deployments
                                    </p>
                                </div>
                                <div class="flex items-center gap-4">
                                    <button @click="openLambdaScalingCrudModal"
                                        class="px-4 py-2 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-[4px_4px_0px_#232f3e] active:translate-y-1 active:shadow-none">
                                        Scaling Policies
                                    </button>
                                    <button @click="router.push('/lambda/create')"
                                        class="text-[10px] font-black text-amber-600 hover:text-[#232f3e] transition-colors uppercase tracking-[0.2em] border-b-2 border-amber-600 pb-1">Initialize
                                        Forge &rarr;</button>
                                </div>
                            </div>

                            <div class="border-2 border-[#232f3e] overflow-hidden">
                                <table class="w-full text-left border-collapse">
                                    <thead>
                                        <tr class="bg-[#fafafa] border-b-2 border-[#232f3e]">
                                            <th
                                                class="px-6 py-4 text-[10px] font-black text-[#232f3e] uppercase tracking-widest">
                                                Identifier
                                            </th>
                                            <th
                                                class="px-6 py-4 text-[10px] font-black text-[#232f3e] uppercase tracking-widest">
                                                Environment
                                            </th>
                                            <th
                                                class="px-6 py-4 text-[10px] font-black text-[#232f3e] uppercase tracking-widest">
                                                State</th>
                                            <th
                                                class="px-6 py-4 text-[10px] font-black text-[#232f3e] uppercase tracking-widest text-right">
                                                Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="func in lambdaStore.functions.slice(0, 5)" :key="func.id"
                                            class="border-b border-[#eaeded] hover:bg-[#fafafa] transition-colors group">
                                            <td class="px-6 py-4">
                                                <div class="flex items-center gap-3">
                                                    <div
                                                        class="w-8 h-8 border-2 border-[#eaeded] group-hover:border-amber-500 flex items-center justify-center text-[#232f3e] transition-colors font-black italic text-[10px]">
                                                        f</div>
                                                    <button
                                                        @click="router.push({ name: 'lambda-details', params: { id: func.id } })"
                                                        class="text-[11px] font-black text-[#232f3e] hover:text-amber-600 transition-colors uppercase tracking-tight">{{
                                                            func.name }}</button>
                                                </div>
                                            </td>
                                            <td class="px-6 py-4">
                                                <span
                                                    class="text-[9px] font-black text-[#545b64] uppercase tracking-widest">{{
                                                        func.runtime
                                                    }}</span>
                                            </td>
                                            <td class="px-6 py-4">
                                                <div class="flex items-center gap-2">
                                                    <div class="w-1 h-1"
                                                        :class="func.status === 'Active' ? 'bg-amber-500' : 'bg-[#eaeded]'">
                                                    </div>
                                                    <span class="text-[9px] font-black uppercase tracking-widest"
                                                        :class="func.status === 'Active' ? 'text-[#232f3e]' : 'text-[#879196]'">{{
                                                            func.status
                                                        }}</span>
                                                </div>
                                            </td>
                                            <td class="px-6 py-4 text-right">
                                                <button
                                                    class="p-1 border-2 border-transparent hover:border-[#232f3e] text-[#879196] hover:text-[#232f3e] transition-all">
                                                    <svg class="w-3 h-3" fill="none" stroke="currentColor"
                                                        viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            stroke-width="3"
                                                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                        <tr v-if="lambdaStore.functions.length === 0">
                                            <td colspan="4" class="px-6 py-12 text-center">
                                                <p
                                                    class="text-[9px] font-black text-[#879196] uppercase tracking-[0.3em]">
                                                    No_Forge_Entities_Detected</p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Terminal Trace -->
                        <div class="bg-white border-2 border-[#232f3e] overflow-hidden flex flex-col h-[350px]">
                            <div class="bg-[#232f3e] px-6 py-3 flex items-center justify-between">
                                <div class="flex items-center gap-4">
                                    <div class="flex gap-1.5">
                                        <div class="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                                        <div class="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                                        <div class="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                                    </div>
                                    <span
                                        class="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Live_Trace_Protocol</span>
                                </div>
                                <div class="text-emerald-400 text-[9px] font-black uppercase flex items-center gap-2">
                                    <div class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                    Syncing
                                </div>
                            </div>
                            <div class="flex-1 p-6 overflow-y-auto bg-[#fafafa] font-mono">
                                <div v-for="event in consoleEvents" :key="event.id"
                                    class="flex gap-4 mb-3 text-[11px] leading-relaxed group">
                                    <span class="text-slate-400 shrink-0">{{ event.timestamp.substring(11, 19) }}</span>
                                    <span :class="getStatusColor(event.type)" class="shrink-0 font-black">[{{
                                        event.type.toUpperCase()
                                    }}]</span>
                                    <span class="text-blue-600 shrink-0 font-bold">{{ event.resource }}:</span>
                                    <span class="text-[#232f3e] font-medium">{{ event.message }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Extended Resource Management (Below Trace) -->
                        <div v-if="activeTab === 'nodes'"
                            class="grid md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <!-- Volumes Card -->
                            <div
                                class="bg-white border-2 border-[#232f3e] p-8 hover:shadow-[10px_10px_0px_#eaeded] transition-all group">
                                <div class="flex justify-between items-start mb-8">
                                    <p class="text-[10px] font-black text-[#879196] tracking-widest uppercase italic">
                                        Storage_Volumes</p>
                                    <button @click="router.push({ name: 'volumes-list' })"
                                        class="text-[9px] font-black text-blue-600 uppercase border-b border-blue-600">Inventory
                                        &rarr;</button>
                                </div>
                                <div class="flex items-center gap-6">
                                    <div
                                        class="w-12 h-12 border-2 border-[#232f3e] flex items-center justify-center bg-[#fafafa]">
                                        <svg class="w-6 h-6 text-[#232f3e]" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p class="text-2xl font-black text-[#232f3e] leading-none mb-1">{{
                                            computeStore.volumes.length }}</p>
                                        <p class="text-[9px] font-black text-[#879196] uppercase tracking-widest">Active
                                            Block Disks</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Snapshots Card -->
                            <div
                                class="bg-white border-2 border-[#232f3e] p-8 hover:shadow-[10px_10px_0px_#eaeded] transition-all group">
                                <div class="flex justify-between items-start mb-8">
                                    <p class="text-[10px] font-black text-[#879196] tracking-widest uppercase italic">
                                        Data_Snapshots</p>
                                    <button @click="router.push({ name: 'snapshots-list' })"
                                        class="text-[9px] font-black text-blue-600 uppercase border-b border-blue-600">History
                                        &rarr;</button>
                                </div>
                                <div class="flex items-center gap-6">
                                    <div
                                        class="w-12 h-12 border-2 border-[#232f3e] flex items-center justify-center bg-[#fafafa]">
                                        <svg class="w-6 h-6 text-[#232f3e]" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p class="text-2xl font-black text-[#232f3e] leading-none mb-1">{{
                                            computeStore.snapshots.length }}</p>
                                        <p class="text-[9px] font-black text-[#879196] uppercase tracking-widest">Backup
                                            Revision Sets</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Templates Card -->
                            <div
                                class="bg-white border-2 border-[#232f3e] p-8 hover:shadow-[10px_10px_0px_#eaeded] transition-all group">
                                <div class="flex justify-between items-start mb-8">
                                    <p class="text-[10px] font-black text-[#879196] tracking-widest uppercase italic">
                                        Compute_Templates</p>
                                    <button @click="router.push({ name: 'templates-list' })"
                                        class="text-[9px] font-black text-blue-600 uppercase border-b border-blue-600">Patterns
                                        &rarr;</button>
                                </div>
                                <div class="flex items-center gap-6">
                                    <div
                                        class="w-12 h-12 border-2 border-[#232f3e] flex items-center justify-center bg-[#fafafa]">
                                        <svg class="w-6 h-6 text-[#232f3e]" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p class="text-2xl font-black text-[#232f3e] leading-none mb-1">{{
                                            computeStore.templates.length }}</p>
                                        <p class="text-[9px] font-black text-[#879196] uppercase tracking-widest">
                                            Blueprint Archetypes</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Auth Keys Card -->
                            <div
                                class="bg-white border-2 border-[#232f3e] p-8 hover:shadow-[10px_10px_0px_#eaeded] transition-all group">
                                <div class="flex justify-between items-start mb-8">
                                    <p class="text-[10px] font-black text-[#879196] tracking-widest uppercase italic">
                                        SSH_Authentication</p>
                                    <button @click="router.push({ name: 'ssh-keys-list' })"
                                        class="text-[9px] font-black text-blue-600 uppercase border-b border-blue-600">Vault
                                        &rarr;</button>
                                </div>
                                <div class="flex items-center gap-6">
                                    <div
                                        class="w-12 h-12 border-2 border-[#232f3e] flex items-center justify-center bg-[#fafafa]">
                                        <svg class="w-6 h-6 text-[#232f3e]" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p class="text-2xl font-black text-[#232f3e] leading-none mb-1">{{
                                            computeStore.sshKeys.length }}</p>
                                        <p class="text-[9px] font-black text-[#879196] uppercase tracking-widest">Secure
                                            Access Keys</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Scaling Policies Card -->
                            <div
                                class="bg-white border-2 border-[#232f3e] p-8 hover:shadow-[10px_10px_0px_#eaeded] transition-all group">
                                <div class="flex justify-between items-start mb-8">
                                    <p class="text-[10px] font-black text-[#879196] tracking-widest uppercase italic">
                                        Scaling_Policies</p>
                                    <button @click="router.push({ name: 'scaling-policies-list' })"
                                        class="text-[9px] font-black text-blue-600 uppercase border-b border-blue-600">Rules
                                        &rarr;</button>
                                </div>
                                <div class="flex items-center gap-6">
                                    <div
                                        class="w-12 h-12 border-2 border-[#232f3e] flex items-center justify-center bg-[#fafafa]">
                                        <svg class="w-6 h-6 text-[#232f3e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p class="text-2xl font-black text-[#232f3e] leading-none mb-1">{{
                                            computeStore.scalingPolicies?.length || 0 }}</p>
                                        <p class="text-[9px] font-black text-[#879196] uppercase tracking-widest">Auto Scale Rules</p>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Lambda Scaling Card -->
                            <div
                                class="bg-white border-2 border-[#232f3e] p-8 hover:shadow-[10px_10px_0px_#eaeded] transition-all group">
                                <div class="flex justify-between items-start mb-8">
                                    <p class="text-[10px] font-black text-[#879196] tracking-widest uppercase italic">
                                        Forge_Policies</p>
                                    <button @click="openLambdaScalingCrudModal"
                                        class="text-[9px] font-black text-blue-600 uppercase border-b border-blue-600">Forge Rules
                                        &rarr;</button>
                                </div>
                                <div class="flex items-center gap-6">
                                    <div
                                        class="w-12 h-12 border-2 border-[#232f3e] flex items-center justify-center bg-[#fafafa]">
                                        <span class="font-black italic text-[#232f3e]">λ</span>
                                    </div>
                                    <div>
                                        <p class="text-2xl font-black text-[#232f3e] leading-none mb-1">{{
                                            lambdaStore.scalingPolicies?.length || 0 }}</p>
                                        <p class="text-[9px] font-black text-[#879196] uppercase tracking-widest">Lambda Scale Rules</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Code Protocol Widget (Only on Functions tab or Bottom) -->
                        <div v-if="activeTab === 'functions'"
                            class="grid lg:grid-cols-2 gap-10 bg-white border-2 border-[#232f3e] p-10 animate-in slide-in-from-bottom-4 duration-700">
                            <div>
                                <h3 class="text-xl font-black text-[#232f3e] uppercase tracking-tight mb-6">
                                    Code_Protocol</h3>
                                <div class="grid grid-cols-2 gap-4">
                                    <button v-for="(runtime, index) in runtimes" :key="runtime.name"
                                        @click="isCodeModalOpen = true"
                                        class="p-5 border-4 border-[#232f3e] text-xs font-black uppercase tracking-widest transition-all text-center hover:bg-[#232f3e] hover:text-white">
                                        {{ runtime.name }} SDK EXAMPLE
                                    </button>
                                </div>
                            </div>
                            <div
                                class="bg-[#232f3e] p-6 border-2 border-[#232f3e] relative overflow-hidden h-[200px] flex items-center justify-center">
                                <p
                                    class="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] italic text-center z-10">
                                    Select protocol runtime to view <br> integration patterns & SDK implementation.
                                </p>
                                <div
                                    class="absolute inset-0 bg-[linear-gradient(rgba(251,191,36,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(251,191,36,0.02)_1px,transparent_1px)] bg-[size:15px_15px] pointer-events-none">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column -->
                    <div class="lg:col-span-4 space-y-10">
                        <!-- Fleet Stats -->
                        <div class="bg-[#fafafa] border-2 border-[#232f3e] p-8 relative overflow-hidden group">
                            <div
                                class="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 -rotate-45 translate-x-16 -translate-y-16">
                            </div>
                            <h4 class="text-[10px] font-black text-[#879196] mb-8 tracking-[0.3em] uppercase italic">
                                Fleet_Inventory</h4>
                            <div class="space-y-8">
                                <div class="flex justify-between items-end border-b-2 border-[#eaeded] pb-4">
                                    <span
                                        class="text-[10px] font-black text-[#232f3e] uppercase tracking-widest">Instances</span>
                                    <span class="text-5xl font-black text-blue-600 tracking-tighter">{{
                                        computeStore.instances.length
                                    }}</span>
                                </div>
                                <div class="flex justify-between items-end border-b-2 border-[#eaeded] pb-4">
                                    <span
                                        class="text-[10px] font-black text-[#232f3e] uppercase tracking-widest">Volumes</span>
                                    <span class="text-5xl font-black text-[#232f3e] tracking-tighter">{{
                                        computeStore.volumes.length
                                    }}</span>
                                </div>
                                <div class="flex justify-between items-end border-b-2 border-[#eaeded] pb-4">
                                    <span
                                        class="text-[10px] font-black text-[#232f3e] uppercase tracking-widest">Snapshots</span>
                                    <span class="text-5xl font-black text-[#232f3e] tracking-tighter">{{
                                        computeStore.snapshots.length
                                    }}</span>
                                </div>
                                <div class="flex justify-between items-end border-b-2 border-[#eaeded] pb-4">
                                    <span
                                        class="text-[10px] font-black text-[#232f3e] uppercase tracking-widest">Lambda</span>
                                    <span class="text-5xl font-black text-amber-600 tracking-tighter">{{
                                        lambdaStore.functions.length
                                    }}</span>
                                </div>
                                <div class="flex justify-between items-end">
                                    <span class="text-[10px] font-black text-[#232f3e] uppercase tracking-widest">SSH
                                        Keys</span>
                                    <span class="text-5xl font-black text-emerald-600 tracking-tighter">{{
                                        computeStore.sshKeys.length
                                    }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Quick Actions -->
                        <div class="bg-[#232f3e] p-10 space-y-6">
                            <h4 class="text-[10px] font-black text-blue-400 mb-6 tracking-[0.3em] uppercase italic">
                                System_Execution</h4>
                            <button @click="router.push({ name: 'launch-instance' })"
                                class="w-full p-5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest flex justify-between items-center group transition-all">
                                <span>Provision_VM</span>
                                <span class="group-hover:translate-x-1 transition-transform">&rarr;</span>
                            </button>
                            <button @click="router.push('/lambda/create')"
                                class="w-full p-5 border-2 border-amber-500/30 hover:border-amber-500 text-amber-400 hover:text-white text-xs font-black uppercase tracking-widest flex justify-between items-center group transition-all">
                                <span>Deploy_Forge</span>
                                <span class="group-hover:translate-x-1 transition-transform">&rarr;</span>
                            </button>
                        </div>

                        <!-- Documentation Portal -->
                        <div class="bg-white border-2 border-[#232f3e] p-8">
                            <h4 class="text-[10px] font-black text-[#879196] mb-8 tracking-widest uppercase italic">
                                Infrastructure_Docs</h4>
                            <ul class="space-y-6">
                                <li v-for="link in [
                                    { text: 'EC2_API_SPEC', path: '/docs/content/ec2-overview', color: 'bg-blue-600' },
                                    { text: 'LAMBDA_RUNTIME', path: '/docs/content/lambda-overview', color: 'bg-amber-600' },
                                    { text: 'GRID_TOPOLOGY', path: '/docs/vpc', color: 'bg-emerald-600' }
                                ]" :key="link.text">
                                    <a :href="link.path"
                                        class="text-[11px] font-black text-[#232f3e] hover:text-blue-600 flex items-center justify-between group">
                                        <div class="flex items-center gap-3">
                                            <div class="w-1.5 h-1.5" :class="link.color"></div>
                                            {{ link.text }}
                                        </div>
                                        <span class="opacity-0 group-hover:opacity-100 transition-opacity">&rarr;</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Public Landing Page -->
            <div v-else
                class="relative z-10 w-full min-h-[90vh] flex flex-col items-center pt-32 pb-40 bg-white text-[#16191f]">
                <div class="max-w-7xl mx-auto px-6 relative w-full text-center">
                    <div class="inline-flex items-center gap-3 mb-10 text-blue-600">
                        <div class="w-12 h-[2px] bg-blue-600"></div>
                        <span class="text-[10px] font-black uppercase tracking-[0.3em]">Quantum Compute
                            Unified Protocol</span>
                        <div class="w-12 h-[2px] bg-blue-600"></div>
                    </div>

                    <h1 class="text-7xl md:text-9xl font-black tracking-tighter mb-12 leading-[0.95] uppercase">
                        Absolute Compute.<br><span class="text-blue-600 italic">Universal Scaling.</span>
                    </h1>

                    <p class="text-xl md:text-2xl text-[#545b64] leading-relaxed max-w-4xl mx-auto mb-20 font-medium">
                        Deploy lightning-fast virtual nodes and serverless endpoints on our <strong
                            class="text-[#232f3e] font-black uppercase">low-latency global grid</strong>. Orchestrate
                        hybrid fleets
                        with a single atomic protocol.
                    </p>

                    <div class="flex flex-wrap justify-center gap-8">
                        <button @click="router.push('/register')"
                            class="bg-[#232f3e] hover:bg-blue-600 text-white font-black px-16 py-8 transition-all rounded-none uppercase tracking-[0.3em] text-sm group">
                            Launch Cluster <span
                                class="ml-4 group-hover:translate-x-2 transition-transform inline-block">&rarr;</span>
                        </button>
                        <button @click="router.push('/docs/content/ec2-overview')"
                            class="px-16 py-8 border-4 border-[#232f3e] text-[#232f3e] font-black hover:bg-[#232f3e] hover:text-white transition-all rounded-none uppercase tracking-[0.3em] text-sm">
                            View Spec
                        </button>
                    </div>

                    <!-- Features Row -->
                    <div class="grid md:grid-cols-3 gap-0 mt-40 border-2 border-[#232f3e]">
                        <div
                            class="p-12 border-r-2 border-b-2 md:border-b-0 border-[#232f3e] text-left hover:bg-[#fafafa] transition-colors group">
                            <div
                                class="w-10 h-10 border-2 border-blue-600 flex items-center justify-center text-blue-600 mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <span class="font-black italic">vm</span>
                            </div>
                            <h3 class="text-lg font-black text-[#232f3e] mb-4 uppercase tracking-tighter">Hypervisor VM
                            </h3>
                            <p
                                class="text-xs text-[#879196] font-bold leading-relaxed uppercase tracking-widest leading-6">
                                Dedicated hardware isolation with sub-ms NVMe backplanes.</p>
                        </div>
                        <div
                            class="p-12 border-r-2 border-b-2 md:border-b-0 border-[#232f3e] text-left hover:bg-[#fafafa] transition-colors group">
                            <div
                                class="w-10 h-10 border-2 border-amber-500 flex items-center justify-center text-amber-500 mb-8 group-hover:bg-amber-500 group-hover:text-white transition-all">
                                <span class="font-black italic">λ</span>
                            </div>
                            <h3 class="text-lg font-black text-[#232f3e] mb-4 uppercase tracking-tighter">Forge
                                Serverless</h3>
                            <p
                                class="text-xs text-[#879196] font-bold leading-relaxed uppercase tracking-widest leading-6">
                                Event-driven triggers with zero cold-start latency mapping.</p>
                        </div>
                        <div class="p-12 text-left hover:bg-[#fafafa] transition-colors group">
                            <div
                                class="w-10 h-10 border-2 border-emerald-500 flex items-center justify-center text-emerald-500 mb-8 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                <span class="font-black italic">k8</span>
                            </div>
                            <h3 class="text-lg font-black text-[#232f3e] mb-4 uppercase tracking-tighter">Mesh Clusters
                            </h3>
                            <p
                                class="text-xs text-[#879196] font-bold leading-relaxed uppercase tracking-widest leading-6">
                                Managed
                                Kubernetes with integrated service-mesh security.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <footer class="py-20 bg-white border-t-2 border-[#232f3e]">
            <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-[#232f3e] flex items-center justify-center text-white font-black italic">S
                    </div>
                    <span class="font-black text-xl text-[#232f3e] tracking-tighter uppercase">SerwinCompute</span>
                </div>
                <div class="flex gap-10 text-[10px] font-black text-[#879196] uppercase tracking-[0.2em]">
                    <a href="#" class="hover:text-blue-600 transition-colors">Infrastructure_Log</a>
                    <a href="#" class="hover:text-blue-600 transition-colors">Access_Matrix</a>
                    <a href="#" class="hover:text-blue-600 transition-colors">Network_SLA</a>
                </div>
                <div class="text-[10px] text-[#879196] font-black uppercase tracking-widest italic">© 2026 SERWIN
                    INFRASTRUCTURE
                </div>
            </div>
        </footer>

        <!-- Lambda Scaling CRUD Modal -->
        <div v-if="isLambdaScalingCrudModalOpen" class="fixed inset-0 z-[200] flex items-start justify-center pt-20">
            <!-- Backdrop -->
            <div class="fixed inset-0 bg-[#232f3e]/60 backdrop-blur-sm" @click="closeLambdaScalingCrudModal"></div>

            <!-- Modal Content -->
            <div class="relative bg-white w-full max-w-4xl shadow-2xl flex flex-col border-4 border-[#232f3e] font-urbanist max-h-[80vh]">
                <!-- Header -->
                <div class="flex items-center justify-between px-10 py-8 border-b-2 border-[#eaeded] bg-[#fafafa]">
                    <div>
                        <h2 class="text-3xl font-black text-[#232f3e] tracking-tighter uppercase leading-tight">
                            Lambda Scaling Policies
                        </h2>
                        <p class="text-[10px] text-amber-500 font-black uppercase tracking-[0.2em] mt-2">
                            Manage Concurrency & Auto Scaling
                        </p>
                    </div>
                    <button @click="closeLambdaScalingCrudModal"
                        class="text-[#545b64] hover:text-amber-500 transition-all p-2 bg-white border-2 border-[#eaeded] hover:border-amber-500 active:scale-95">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Body: List Mode -->
                <div v-if="lambdaScalingCrudMode === 'list'" class="p-10 flex-1 overflow-y-auto bg-white custom-scrollbar flex flex-col gap-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-black text-[#232f3e] uppercase">Active Policies</h3>
                        <button @click="goToAddLambdaScalingPolicy"
                            class="px-6 py-3 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-[4px_4px_0px_#232f3e] active:translate-y-1 active:shadow-none">
                            + Create Policy
                        </button>
                    </div>

                    <div v-if="lambdaStore.isLoading" class="py-12 text-center text-[#879196] text-[10px] uppercase font-black tracking-widest animate-pulse">
                        Loading Policies...
                    </div>
                    <div v-else-if="(lambdaStore.scalingPolicies?.policies || lambdaStore.scalingPolicies || []).length === 0" class="py-12 text-center border-2 border-dashed border-[#eaeded]">
                        <p class="text-[10px] font-black tracking-widest uppercase text-[#879196] italic">No scaling policies found.</p>
                    </div>
                    <div v-else class="overflow-x-auto border-2 border-[#eaeded]">
                        <table class="w-full text-left border-collapse">
                            <thead class="bg-[#fafafa] border-b-2 border-[#eaeded]">
                                <tr>
                                    <th class="p-4 text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em]">Function</th>
                                    <th class="p-4 text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em]">Metric</th>
                                    <th class="p-4 text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em]">Scale Up / Down</th>
                                    <th class="p-4 text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="policy in (lambdaStore.scalingPolicies?.policies || lambdaStore.scalingPolicies || [])" :key="policy.function_id || policy.target_id" class="border-b border-[#eaeded] hover:bg-[#fafafa]">
                                    <td class="p-4">
                                        <span class="font-mono text-xs text-[#232f3e] font-bold">{{ lambdaStore.functions.find(f => f.id === (policy.function_id || policy.target_id))?.name || (policy.function_id || policy.target_id) }}</span>
                                    </td>
                                    <td class="p-4 font-bold text-xs text-[#545b64]">{{ policy.metric_name }}</td>
                                    <td class="p-4 font-mono text-xs text-[#545b64]">{{ policy.scale_up_threshold || policy.target_value }} / {{ policy.scale_down_threshold || policy.scale_down_value }}</td>
                                    <td class="p-4 text-right space-x-4">
                                        <button @click="goToEditLambdaScalingPolicy(policy)" class="text-[10px] font-black text-amber-600 hover:text-amber-700 uppercase tracking-widest">Edit</button>
                                        <button @click="deleteLambdaScalingPolicy(policy.function_id || policy.target_id)" class="text-[10px] font-black text-[#545b64] hover:text-red-600 uppercase tracking-widest">Delete</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </div>

                <!-- Body: Form Mode -->
                <div v-else class="p-10 flex-1 overflow-y-auto bg-white custom-scrollbar flex flex-col gap-8">
                    <div class="flex items-center gap-4 mb-2">
                        <button @click="lambdaScalingCrudMode = 'list'" class="text-[#879196] hover:text-[#232f3e] transition-colors p-2 bg-[#fafafa] border border-[#eaeded]">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </button>
                        <h3 class="text-xl font-black text-[#232f3e] uppercase">
                            {{ lambdaScalingCrudMode === 'edit' ? 'Edit Scaling Policy' : 'Create Scaling Policy' }}
                        </h3>
                    </div>

                    <div v-if="lambdaScalingFormError" class="p-4 border-2 border-red-200 bg-red-50 text-red-600 font-bold text-[10px] uppercase tracking-wider flex items-center justify-between">
                        <span>{{ lambdaScalingFormError }}</span>
                        <button @click="lambdaScalingFormError = ''" class="hover:text-red-800">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label class="block text-[10px] font-black text-[#879196] uppercase tracking-widest mb-3">Forge Function</label>
                            <select v-model="lambdaScalingForm.function_id" :disabled="lambdaScalingCrudMode === 'edit'" class="w-full px-4 py-3 bg-[#fafafa] border-2 border-[#eaeded] font-mono text-sm text-[#232f3e] focus:outline-none focus:border-amber-500 transition-colors appearance-none disabled:opacity-50">
                                <option value="" disabled>Select Function...</option>
                                <option v-for="func in lambdaStore.functions" :key="func.id" :value="func.id">{{ func.name }} ({{ func.id }})</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-[10px] font-black text-[#879196] uppercase tracking-widest mb-3">Metric</label>
                            <select v-model="lambdaScalingForm.metric_name" :disabled="lambdaScalingCrudMode === 'edit'" class="w-full px-4 py-3 bg-[#fafafa] border-2 border-[#eaeded] font-black text-xs text-[#232f3e] focus:outline-none focus:border-amber-500 transition-colors appearance-none disabled:opacity-50">
                                <option value="Invocations">Invocations</option>
                                <option value="Duration">Duration</option>
                                <option value="Throttles">Throttles</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label class="block text-[10px] font-black text-[#879196] uppercase tracking-widest mb-3" title="Trigger scale-up when above this value">Scale Up Threshold</label>
                            <input v-model.number="lambdaScalingForm.scale_up_threshold" type="number" step="1" min="1" class="w-full px-4 py-3 bg-[#fafafa] border-2 border-[#eaeded] font-mono text-sm text-[#232f3e] focus:outline-none focus:border-amber-500 transition-colors">
                        </div>
                        <div>
                            <label class="block text-[10px] font-black text-[#879196] uppercase tracking-widest mb-3" title="Trigger scale-down when below this value">Scale Down Threshold</label>
                            <input v-model.number="lambdaScalingForm.scale_down_threshold" type="number" step="1" min="1" class="w-full px-4 py-3 bg-[#fafafa] border-2 border-[#eaeded] font-mono text-sm text-[#232f3e] focus:outline-none focus:border-amber-500 transition-colors">
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <label class="block text-[10px] font-black text-[#879196] uppercase tracking-widest mb-3">Min Concurrency</label>
                            <input v-model.number="lambdaScalingForm.min_concurrency_limit" type="number" step="1" min="0" class="w-full px-4 py-3 bg-[#fafafa] border-2 border-[#eaeded] font-mono text-sm text-[#232f3e] focus:outline-none focus:border-amber-500 transition-colors">
                        </div>
                        <div>
                            <label class="block text-[10px] font-black text-[#879196] uppercase tracking-widest mb-3">Max Concurrency</label>
                            <input v-model.number="lambdaScalingForm.max_concurrency_limit" type="number" step="1" min="1" class="w-full px-4 py-3 bg-[#fafafa] border-2 border-[#eaeded] font-mono text-sm text-[#232f3e] focus:outline-none focus:border-amber-500 transition-colors">
                        </div>
                        <div>
                            <label class="block text-[10px] font-black text-[#879196] uppercase tracking-widest mb-3">Concurrency Step</label>
                            <input v-model.number="lambdaScalingForm.scale_step" type="number" step="1" min="1" class="w-full px-4 py-3 bg-[#fafafa] border-2 border-[#eaeded] font-mono text-sm text-[#232f3e] focus:outline-none focus:border-amber-500 transition-colors">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label class="block text-[10px] font-black text-[#879196] uppercase tracking-widest mb-3">Cooldown (sec)</label>
                            <input v-model.number="lambdaScalingForm.cooldown_seconds" type="number" step="30" min="0" class="w-full px-4 py-3 bg-[#fafafa] border-2 border-[#eaeded] font-mono text-sm text-[#232f3e] focus:outline-none focus:border-amber-500 transition-colors">
                        </div>
                    </div>
                    
                    <div class="mt-4 flex justify-end gap-6">
                        <button @click="lambdaScalingCrudMode = 'list'" class="px-8 py-3 text-[10px] font-black text-[#545b64] hover:text-amber-500 uppercase tracking-widest transition-all">Cancel</button>
                        <button @click="submitLambdaScalingPolicy" :disabled="lambdaStore.isLoading" class="px-10 py-3 text-[10px] font-black text-white bg-[#232f3e] hover:bg-black transition-all uppercase tracking-widest disabled:opacity-50 shadow-[4px_4px_0px_#eaeded]">
                            {{ lambdaStore.isLoading ? 'Processing...' : (lambdaScalingCrudMode === 'edit' ? 'Update Policy' : 'Create Policy') }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Java SDK Modal -->
        <transition name="fade">
            <div v-if="isCodeModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-6">
                <!-- Backdrop -->
                <div class="absolute inset-0 bg-[#232f3e]/90 backdrop-blur-sm" @click="isCodeModalOpen = false"></div>

                <!-- Modal Content -->
                <div
                    class="relative w-full max-w-4xl bg-white border-4 border-[#232f3e] shadow-[20px_20px_0px_#eaeded] animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                    <div class="flex items-center justify-between p-8 border-b-4 border-[#232f3e] bg-[#fafafa]">
                        <div>
                            <h2 class="text-3xl font-black text-[#232f3e] uppercase tracking-tighter mb-1">
                                JAVA_SDK_PROTOCOL
                            </h2>
                            <p class="text-[10px] font-black text-[#879196] uppercase tracking-[0.2em] italic">Forge
                                V2.0
                                Integration Pattern</p>
                        </div>
                        <button @click="isCodeModalOpen = false"
                            class="p-3 border-4 border-[#232f3e] hover:bg-red-500 hover:text-white transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div class="flex-1 p-8 bg-[#232f3e] overflow-auto font-mono text-xs text-slate-300">
                        <div
                            class="flex items-center justify-between mb-6 pb-2 border-b border-white/10 sticky top-0 bg-[#232f3e] z-10">
                            <span
                                class="text-[10px] font-black text-amber-500 uppercase tracking-widest italic">kernel.java.sdk</span>
                            <span class="text-[9px] text-[#879196] font-bold uppercase tracking-widest">Read-Only
                                Pattern</span>
                        </div>
                        <pre class="whitespace-pre"><code>{{ runtimes[0]?.code }}</code></pre>
                    </div>

                    <div class="p-8 border-t-4 border-[#232f3e] bg-[#fafafa] flex justify-end">
                        <button @click="isCodeModalOpen = false"
                            class="px-12 py-5 bg-[#232f3e] text-white font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all">
                            ACKNOWLEDGE_PROTOCOL
                        </button>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800;900&display=swap');

.font-urbanist {
    font-family: 'Urbanist', sans-serif;
}

@keyframes scan {
    0% {
        transform: translateX(-100%);
    }

    100% {
        transform: translateX(100%);
    }
}

.animate-scan {
    width: 30%;
    animation: scan 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
</style>
