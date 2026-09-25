<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/authStore'
import { useLambdaStore } from '@/modules/lambda/store/lambdaStore'
import PublicNavbar from '@/shared/components/PublicNavbar.vue'

const router = useRouter()
const authStore = useAuthStore()
const lambdaStore = useLambdaStore()

// Search & Filtering
const searchQuery = ref('')
const selectedRuntimeFilter = ref('ALL')

// Scaling Policy State
const isScalingModalOpen = ref(false)
const scalingCrudMode = ref<'list' | 'create' | 'edit'>('list')
const selectedPolicy = ref<any>(null)
const scalingForm = ref({
    function_id: '',
    metric_name: 'Invocations',
    scale_up_threshold: 100,
    scale_down_threshold: 50,
    max_concurrency_limit: 10,
    cooldown_seconds: 60,
    min_concurrency_limit: 1,
    scale_step: 1
})
const scalingFormError = ref('')

// Analytics simulation & real-time telemetry
const liveInvocations = ref(12480)
const liveAvgLatency = ref(42.5)
const liveErrorRate = ref(0.02)
let intervalId: any = null

const updateMetrics = () => {
    liveInvocations.value += Math.floor(Math.random() * 15)
    liveAvgLatency.value = Math.max(15, Math.min(120, liveAvgLatency.value + (Math.random() - 0.5) * 3))
    liveErrorRate.value = Math.max(0, Math.min(0.5, liveErrorRate.value + (Math.random() - 0.5) * 0.01))
}

onMounted(async () => {
    if (authStore.isAuthenticated) {
        await Promise.all([
            lambdaStore.fetchFunctions(),
            lambdaStore.fetchPolicies()
        ])
        intervalId = setInterval(updateMetrics, 2500)
    }
})

onUnmounted(() => {
    if (intervalId) clearInterval(intervalId)
})

// Filtered Functions
const filteredFunctions = computed(() => {
    return lambdaStore.functions.filter(fn => {
        const matchesSearch = fn.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            fn.id.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            (fn.description && fn.description.toLowerCase().includes(searchQuery.value.toLowerCase()))
        
        const matchesRuntime = selectedRuntimeFilter.value === 'ALL' ||
            fn.runtime.toUpperCase().includes(selectedRuntimeFilter.value.toUpperCase())

        return matchesSearch && matchesRuntime
    })
})

// Available Runtimes for Filter Dropdown
const runtimeOptions = computed(() => {
    const runtimes = new Set(lambdaStore.functions.map(f => f.runtime))
    return ['ALL', ...Array.from(runtimes)]
})

// Scaling Policy Actions
const openScalingModal = async () => {
    isScalingModalOpen.value = true
    scalingCrudMode.value = 'list'
    await lambdaStore.fetchPolicies()
}

const closeScalingModal = () => {
    isScalingModalOpen.value = false
    selectedPolicy.value = null
}

const goToAddPolicy = () => {
    scalingCrudMode.value = 'create'
    scalingForm.value = {
        function_id: lambdaStore.functions[0]?.id || '',
        metric_name: 'Invocations',
        scale_up_threshold: 100,
        scale_down_threshold: 50,
        max_concurrency_limit: 10,
        cooldown_seconds: 60,
        min_concurrency_limit: 1,
        scale_step: 1
    }
    scalingFormError.value = ''
}

const goToEditPolicy = (policy: any) => {
    scalingCrudMode.value = 'edit'
    selectedPolicy.value = policy
    scalingForm.value = {
        function_id: policy.function_id || policy.target_id,
        metric_name: policy.metric_name || 'Invocations',
        scale_up_threshold: policy.scale_up_threshold || policy.target_value || 100,
        scale_down_threshold: policy.scale_down_threshold || policy.scale_down_value || 50,
        max_concurrency_limit: policy.max_concurrency_limit || policy.max_instances || 10,
        cooldown_seconds: policy.cooldown_seconds || policy.scale_out_cooldown || 60,
        min_concurrency_limit: policy.min_concurrency_limit || policy.min_instances || 1,
        scale_step: policy.scale_step || policy.concurrency_step || 1
    }
    scalingFormError.value = ''
}

const submitPolicy = async () => {
    if (!scalingForm.value.function_id) {
        scalingFormError.value = 'Function ID is required'
        return
    }
    try {
        const payload = {
            action: scalingCrudMode.value === 'edit' ? 'update' : 'create',
            policy: { ...scalingForm.value }
        }
        if (scalingCrudMode.value === 'edit' && selectedPolicy.value) {
            await lambdaStore.updatePolicy(selectedPolicy.value.function_id || selectedPolicy.value.target_id, payload)
        } else {
            await lambdaStore.createPolicy(scalingForm.value.function_id, payload)
        }
        scalingCrudMode.value = 'list'
    } catch (e: any) {
        scalingFormError.value = e.message || 'Failed to submit scaling policy'
    }
}

const deletePolicy = async (id: string) => {
    if (confirm('Are you sure you want to delete this scaling policy?')) {
        await lambdaStore.deletePolicy(id)
    }
}

// SDK Snippet Widget
const activeSdk = ref<'java' | 'python' | 'node'>('java')
const sdkSnippets = {
    java: `import com.serwinsys.lambda.SerwinLambdaClient;
import com.serwinsys.lambda.models.InvokeResponse;

SerwinLambdaClient client = new SerwinLambdaClient(credentials);
InvokeResponse result = client.invoke("my-function", Map.of("key", "value"));`,

    node: `import { LambdaClient, InvokeCommand } from "@serwin/sdk-lambda";

const client = new LambdaClient({ region: "us-east-1" });
const response = await client.send(new InvokeCommand({
  FunctionName: "my-function",
  Payload: JSON.stringify({ key: "value" })
}));`,

    python: `import boto3
import json

client = boto3.client('lambda')
response = client.invoke(
    FunctionName='my-function',
    InvocationType='RequestResponse',
    Payload=json.dumps({'key': 'value'})
)`
}
</script>

<template>
    <div class="min-h-screen bg-white text-[#16191f] font-urbanist selection:bg-amber-500/20 selection:text-amber-900 overflow-x-hidden">
        <PublicNavbar activeLink="lambda" />

        <div class="relative min-h-screen pt-24">
            <!-- Grid pattern background -->
            <div class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

            <div class="relative z-10 max-w-[1800px] mx-auto px-8 md:px-24 pt-8 pb-40">
                <!-- Breadcrumb navigation -->
                <nav class="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                    <a href="#" @click.prevent="router.push('/dashboard')" class="text-[#879196] hover:text-amber-600 transition-colors">AWS_GLOBAL</a>
                    <div class="w-1 h-1 bg-[#eaeded] rounded-full"></div>
                    <span class="text-[#232f3e] font-black">SERVERLESS_COMPUTE</span>
                </nav>

                <!-- Top Header Banner -->
                <div class="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 pb-12 border-b-2 border-[#eaeded] mb-12">
                    <div class="flex items-start gap-8">
                        <div class="w-20 h-20 bg-[#232f3e] flex items-center justify-center text-amber-500 relative overflow-hidden group border-2 border-amber-500/20">
                            <div class="absolute inset-0 bg-amber-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            <span class="text-4xl font-black italic relative z-10 group-hover:text-white transition-colors">λ</span>
                        </div>
                        <div>
                            <div class="flex items-center gap-6 mb-3">
                                <h1 class="text-5xl font-black text-[#232f3e] tracking-tighter uppercase leading-none">
                                    Serverless <span class="text-amber-500 italic">Compute</span>
                                </h1>
                                <span class="flex items-center gap-2 text-[10px] font-black px-4 py-1.5 bg-amber-500/10 text-amber-600 border-2 border-amber-500/20 uppercase tracking-widest">
                                    <span class="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                                    FORGE_ENGINE_ACTIVE
                                </span>
                            </div>
                            <p class="text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em] italic">
                                // EVENT_DRIVEN_ARCHITECTURE // ZERO_COLD_START_HYPERVISOR // SCALING_ON_DEMAND
                            </p>
                        </div>
                    </div>

                    <div class="flex flex-wrap gap-4">
                        <button @click="openScalingModal"
                            class="px-6 py-3 border-2 border-[#232f3e] text-[#232f3e] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#232f3e] hover:text-white transition-all transform active:scale-95">
                            Scaling_Policies
                        </button>
                        <button @click="router.push('/lambda/create')"
                            class="px-8 py-3 bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#232f3e] transition-all transform active:scale-95 shadow-[6px_6px_0px_rgba(245,158,11,0.2)]">
                            + Deploy_Function
                        </button>
                    </div>
                </div>

                <!-- Stats Overview Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div class="bg-white border-2 border-[#eaeded] p-8 hover:border-[#232f3e] transition-colors group">
                        <p class="text-[9px] font-black text-[#879196] uppercase tracking-[0.2em] mb-4 italic">// TOTAL_FUNCTIONS</p>
                        <p class="text-4xl font-black text-[#232f3e] tracking-tight uppercase">{{ lambdaStore.functions.length }}</p>
                        <p class="text-[9px] font-black text-amber-600 mt-2 uppercase tracking-widest">Active Deployments</p>
                    </div>

                    <div class="bg-white border-2 border-[#eaeded] p-8 hover:border-[#232f3e] transition-colors group">
                        <p class="text-[9px] font-black text-[#879196] uppercase tracking-[0.2em] mb-4 italic">// INVOCATIONS_24H</p>
                        <p class="text-4xl font-black text-[#232f3e] tracking-tight uppercase">{{ liveInvocations.toLocaleString() }}</p>
                        <p class="text-[9px] font-black text-emerald-600 mt-2 uppercase tracking-widest">+12.4% vs previous window</p>
                    </div>

                    <div class="bg-white border-2 border-[#eaeded] p-8 hover:border-[#232f3e] transition-colors group">
                        <p class="text-[9px] font-black text-[#879196] uppercase tracking-[0.2em] mb-4 italic">// AVG_DURATION</p>
                        <p class="text-4xl font-black text-[#232f3e] tracking-tight uppercase">{{ liveAvgLatency.toFixed(1) }} <span class="text-lg text-amber-500">MS</span></p>
                        <p class="text-[9px] font-black text-[#879196] mt-2 uppercase tracking-widest">Execution Latency</p>
                    </div>

                    <div class="bg-white border-2 border-[#eaeded] p-8 hover:border-[#232f3e] transition-colors group">
                        <p class="text-[9px] font-black text-[#879196] uppercase tracking-[0.2em] mb-4 italic">// SCALING_RULES</p>
                        <p class="text-4xl font-black text-[#232f3e] tracking-tight uppercase">{{ lambdaStore.policies.length }}</p>
                        <p class="text-[9px] font-black text-blue-600 mt-2 uppercase tracking-widest">Automated Concurrency</p>
                    </div>
                </div>

                <!-- Main Section: Functions List & Telemetry Grid -->
                <div class="grid lg:grid-cols-12 gap-10">
                    <!-- Left 8 Cols: Functions Inventory -->
                    <div class="lg:col-span-8 space-y-8">
                        <div class="bg-white border-2 border-[#232f3e] p-8">
                            <!-- Search & Filter Controls -->
                            <div class="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-8 pb-6 border-b-2 border-[#eaeded]">
                                <div>
                                    <h3 class="text-2xl font-black text-[#232f3e] uppercase tracking-tight">Function_Inventory</h3>
                                    <p class="text-[10px] font-black text-[#879196] uppercase tracking-widest">Registered serverless entities</p>
                                </div>

                                <div class="flex items-center gap-4">
                                    <input v-model="searchQuery" type="text" placeholder="Search functions..."
                                        class="bg-[#fafafa] border-2 border-[#eaeded] px-4 py-2 text-xs font-black uppercase tracking-wider text-[#232f3e] outline-none focus:border-amber-500 transition-colors w-48 sm:w-64">

                                    <select v-model="selectedRuntimeFilter"
                                        class="bg-[#fafafa] border-2 border-[#eaeded] px-4 py-2 text-xs font-black uppercase tracking-wider text-[#232f3e] outline-none focus:border-amber-500 transition-colors">
                                        <option v-for="opt in runtimeOptions" :key="opt" :value="opt">{{ opt }}</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Functions Table -->
                            <div class="overflow-x-auto border-2 border-[#eaeded]">
                                <table class="w-full text-left border-collapse">
                                    <thead class="bg-[#fafafa] text-[10px] font-black uppercase tracking-[0.2em] text-[#545b64] border-b-2 border-[#eaeded]">
                                        <tr>
                                            <th class="p-6 border-r-2 border-[#eaeded]">Name / ARN</th>
                                            <th class="p-6 border-r-2 border-[#eaeded]">Runtime</th>
                                            <th class="p-6 border-r-2 border-[#eaeded]">Memory / Timeout</th>
                                            <th class="p-6 border-r-2 border-[#eaeded]">Status</th>
                                            <th class="p-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody class="text-xs divide-y-2 divide-[#eaeded] font-black uppercase">
                                        <tr v-for="func in filteredFunctions" :key="func.id" class="hover:bg-[#fafafa] transition-colors group">
                                            <td class="p-6 border-r-2 border-[#eaeded]">
                                                <div class="flex items-center gap-3">
                                                    <div class="w-8 h-8 bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-amber-600 font-black italic text-xs">
                                                        λ
                                                    </div>
                                                    <div>
                                                        <a href="#" @click.prevent="router.push({ name: 'lambda-details', params: { id: func.id } })"
                                                            class="text-sm font-black text-[#232f3e] hover:text-amber-600 transition-colors tracking-tight">
                                                            {{ func.name }}
                                                        </a>
                                                        <p v-if="func.arn" class="text-[9px] font-mono text-[#879196] truncate max-w-xs">{{ func.arn }}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="p-6 border-r-2 border-[#eaeded]">
                                                <span class="px-3 py-1 bg-amber-500/10 text-amber-700 border border-amber-500/20 text-[9px] font-black tracking-wider">
                                                    {{ func.runtime }}
                                                </span>
                                            </td>
                                            <td class="p-6 border-r-2 border-[#eaeded] text-[#545b64]">
                                                {{ func.memory || 128 }} MB / {{ func.timeout || 3 }}s
                                            </td>
                                            <td class="p-6 border-r-2 border-[#eaeded]">
                                                <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[9px] font-black">
                                                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                                    {{ func.status || 'Active' }}
                                                </span>
                                            </td>
                                            <td class="p-6 text-right">
                                                <button @click="router.push({ name: 'lambda-details', params: { id: func.id } })"
                                                    class="text-amber-600 hover:text-[#232f3e] text-[10px] font-black uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
                                                    Inspect &rarr;
                                                </button>
                                            </td>
                                        </tr>
                                        <tr v-if="filteredFunctions.length === 0">
                                            <td colspan="5" class="p-16 text-center text-[#879196] italic uppercase tracking-[0.3em] font-black opacity-50">
                                                No Lambda functions found matching criteria.
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Real-time Execution Telemetry -->
                        <div class="bg-white border-2 border-[#232f3e] p-8">
                            <div class="flex justify-between items-center mb-6">
                                <h3 class="text-xl font-black text-[#232f3e] uppercase tracking-tight flex items-center gap-3">
                                    <span class="w-2 h-6 bg-amber-500"></span>
                                    Execution_Telemetry_Stream
                                </h3>
                                <span class="text-[9px] font-black text-amber-600 uppercase tracking-widest italic">// LIVE_METRICS</span>
                            </div>

                            <!-- Live Telemetry Graph mockup -->
                            <div class="h-48 bg-[#fafafa] border-2 border-[#eaeded] p-6 relative flex items-end gap-2 overflow-hidden">
                                <div v-for="n in 24" :key="n" class="flex-1 flex flex-col justify-end gap-1 h-full">
                                    <div class="bg-amber-500/80 hover:bg-amber-600 transition-all rounded-none cursor-pointer"
                                        :style="{ height: `${Math.floor(Math.random() * 70) + 15}%` }" :title="`Invocations window ${n}`"></div>
                                </div>
                            </div>
                            <div class="flex justify-between mt-4 text-[9px] font-black text-[#879196] uppercase tracking-widest">
                                <span>T-24m</span>
                                <span>T-18m</span>
                                <span>T-12m</span>
                                <span>T-6m</span>
                                <span>LIVE</span>
                            </div>
                        </div>
                    </div>

                    <!-- Right 4 Cols: SDK Snippet & Quick Actions -->
                    <div class="lg:col-span-4 space-y-8">
                        <!-- SDK Integration Guide -->
                        <div class="bg-[#232f3e] text-white p-8 space-y-6">
                            <div class="flex justify-between items-center pb-4 border-b border-gray-700">
                                <h4 class="text-xs font-black text-amber-400 uppercase tracking-[0.2em] italic">// SDK_INVOCATION_PATTERNS</h4>
                            </div>

                            <div class="flex gap-2">
                                <button v-for="lang in (['java', 'python', 'node'] as const)" :key="lang"
                                    @click="activeSdk = lang"
                                    class="px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-colors border"
                                    :class="activeSdk === lang ? 'bg-amber-500 text-white border-amber-500' : 'bg-transparent text-gray-400 border-gray-700 hover:text-white'">
                                    {{ lang }}
                                </button>
                            </div>

                            <div class="bg-[#1a232e] p-4 border border-gray-700 font-mono text-[11px] overflow-x-auto text-amber-200">
                                <pre>{{ sdkSnippets[activeSdk] }}</pre>
                            </div>
                        </div>

                        <!-- Concurrency & Scaling Summary -->
                        <div class="bg-[#fafafa] border-2 border-[#232f3e] p-8 space-y-6">
                            <h4 class="text-sm font-black text-[#232f3e] uppercase tracking-wider flex items-center justify-between">
                                <span>Scaling Rules</span>
                                <button @click="openScalingModal" class="text-amber-600 text-[10px] hover:underline uppercase tracking-widest">Manage &rarr;</button>
                            </h4>

                            <div v-if="lambdaStore.policies.length > 0" class="space-y-4">
                                <div v-for="pol in lambdaStore.policies.slice(0, 3)" :key="pol.id || pol.target_id"
                                    class="p-4 bg-white border-2 border-[#eaeded] flex justify-between items-center">
                                    <div>
                                        <p class="text-xs font-black text-[#232f3e] uppercase font-mono">{{ pol.function_id || pol.target_id }}</p>
                                        <p class="text-[9px] text-[#879196] font-black uppercase">Scale UP > {{ pol.scale_up_threshold || pol.target_value }}</p>
                                    </div>
                                    <button @click="deletePolicy(pol.function_id || pol.target_id)"
                                        class="text-rose-600 text-[9px] font-black hover:underline uppercase">Del</button>
                                </div>
                            </div>
                            <div v-else class="p-6 border-2 border-dashed border-[#eaeded] text-center text-[#879196] text-[10px] font-black uppercase">
                                No concurrency rules active
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Scaling Policies Modal -->
        <Teleport to="body">
            <div v-if="isScalingModalOpen" class="fixed inset-0 z-[200] flex items-center justify-center bg-[#232f3e]/80 backdrop-blur-md p-8" @click.self="closeScalingModal">
                <div class="bg-white border-4 border-[#232f3e] w-full max-w-3xl overflow-hidden shadow-2xl">
                    <div class="bg-[#232f3e] p-8 flex justify-between items-center text-white">
                        <div>
                            <h2 class="text-2xl font-black uppercase tracking-tighter italic">Lambda_Scaling_Policies</h2>
                            <p class="text-[10px] font-bold uppercase tracking-[0.3em] opacity-60 mt-1">// CONCURRENCY_MANAGEMENT_PROTOCOL</p>
                        </div>
                        <button @click="closeScalingModal" class="hover:text-amber-400 transition-colors">
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div class="p-10 space-y-8">
                        <!-- List Mode -->
                        <div v-if="scalingCrudMode === 'list'" class="space-y-6">
                            <div class="flex justify-between items-center">
                                <h3 class="text-sm font-black text-[#232f3e] uppercase tracking-widest">Active Concurrency Policies</h3>
                                <button @click="goToAddPolicy" class="px-6 py-2 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#232f3e] transition-all">
                                    + Add Policy
                                </button>
                            </div>

                            <div class="border-2 border-[#eaeded] max-h-80 overflow-y-auto">
                                <table class="w-full text-left border-collapse">
                                    <thead class="bg-[#fafafa] text-[10px] font-black uppercase tracking-widest border-b-2 border-[#eaeded]">
                                        <tr>
                                            <th class="p-4">Function</th>
                                            <th class="p-4">Metric</th>
                                            <th class="p-4">Scale Up / Down</th>
                                            <th class="p-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody class="text-xs font-black uppercase divide-y border-[#eaeded]">
                                        <tr v-for="pol in lambdaStore.policies" :key="pol.id || pol.target_id" class="hover:bg-[#fafafa]">
                                            <td class="p-4 text-amber-600 font-mono">{{ pol.function_id || pol.target_id }}</td>
                                            <td class="p-4">{{ pol.metric_name || 'Invocations' }}</td>
                                            <td class="p-4">{{ pol.scale_up_threshold || pol.target_value }} / {{ pol.scale_down_threshold || pol.scale_down_value }}</td>
                                            <td class="p-4 text-right space-x-3">
                                                <button @click="goToEditPolicy(pol)" class="text-blue-600 hover:underline">Edit</button>
                                                <button @click="deletePolicy(pol.function_id || pol.target_id)" class="text-rose-600 hover:underline">Delete</button>
                                            </td>
                                        </tr>
                                        <tr v-if="lambdaStore.policies.length === 0">
                                            <td colspan="4" class="p-8 text-center text-[#879196] italic">No policy configurations defined.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Create/Edit Form Mode -->
                        <div v-else class="space-y-6">
                            <div v-if="scalingFormError" class="p-4 bg-rose-500/10 border-2 border-rose-500 text-rose-600 text-xs font-black uppercase">
                                {{ scalingFormError }}
                            </div>

                            <div class="grid grid-cols-2 gap-6">
                                <div>
                                    <label class="text-[10px] font-black text-[#879196] uppercase tracking-widest block mb-2">// FUNCTION_ID</label>
                                    <select v-model="scalingForm.function_id" :disabled="scalingCrudMode === 'edit'"
                                        class="w-full bg-[#fafafa] border-2 border-[#eaeded] p-4 text-xs font-black uppercase focus:border-amber-500 outline-none">
                                        <option v-for="f in lambdaStore.functions" :key="f.id" :value="f.id">{{ f.name }} ({{ f.id }})</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="text-[10px] font-black text-[#879196] uppercase tracking-widest block mb-2">// METRIC_NAME</label>
                                    <select v-model="scalingForm.metric_name"
                                        class="w-full bg-[#fafafa] border-2 border-[#eaeded] p-4 text-xs font-black uppercase focus:border-amber-500 outline-none">
                                        <option value="Invocations">Invocations</option>
                                        <option value="Throttles">Throttles</option>
                                        <option value="Duration">Duration</option>
                                    </select>
                                </div>

                                <div>
                                    <label class="text-[10px] font-black text-[#879196] uppercase tracking-widest block mb-2">// SCALE_UP_THRESHOLD</label>
                                    <input v-model.number="scalingForm.scale_up_threshold" type="number"
                                        class="w-full bg-[#fafafa] border-2 border-[#eaeded] p-4 text-xs font-black focus:border-amber-500 outline-none">
                                </div>

                                <div>
                                    <label class="text-[10px] font-black text-[#879196] uppercase tracking-widest block mb-2">// SCALE_DOWN_THRESHOLD</label>
                                    <input v-model.number="scalingForm.scale_down_threshold" type="number"
                                        class="w-full bg-[#fafafa] border-2 border-[#eaeded] p-4 text-xs font-black focus:border-amber-500 outline-none">
                                </div>
                            </div>

                            <div class="flex gap-4 pt-4">
                                <button @click="scalingCrudMode = 'list'" class="flex-1 py-4 border-2 border-[#eaeded] text-[#879196] text-xs font-black uppercase tracking-widest hover:bg-[#fafafa]">Cancel</button>
                                <button @click="submitPolicy" class="flex-1 py-4 bg-amber-500 text-white text-xs font-black uppercase tracking-widest hover:bg-[#232f3e]">Save Policy</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>
