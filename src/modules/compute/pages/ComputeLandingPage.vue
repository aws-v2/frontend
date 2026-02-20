<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/modules/auth/store/authStore'
import PublicNavbar from '@/shared/components/PublicNavbar.vue'

const router = useRouter()
const authStore = useAuthStore()

// Mock analytics data
const computeServices = [
    {
        id: 'ec2',
        name: 'EC2 Instances',
        icon: 'server',
        description: 'Virtual servers in the cloud',
        route: { name: 'instances-list' },
        metrics: {
            active: 12,
            total: 15,
            cpu: 45,
            cost: 234.50
        },
        color: 'blue'
    },
    {
        id: 'lambda',
        name: 'AWS Lambda',
        icon: 'bolt',
        description: 'Serverless compute functions',
        route: { name: 'lambda-landing' },
        metrics: {
            active: 28,
            total: 28,
            invocations: '1.2M',
            cost: 89.30
        },
        color: 'indigo'
    },
    {
        id: 'eks',
        name: 'EKS Clusters',
        icon: 'cubes',
        description: 'Managed Kubernetes service',
        route: '/eks',
        metrics: {
            active: 3,
            total: 3,
            pods: 142,
            cost: 456.00
        },
        color: 'cyan',
        comingSoon: true
    }
]

const totalBilling = ref(779.80)
const billingTrend = ref('+12.3')

const navigateTo = (route: any) => {
    if (typeof route === 'string') {
        router.push(route)
    } else {
        router.push(route)
    }
}

onMounted(() => {
    console.log('ComputeLandingPage mounted, auth status:', authStore.isAuthenticated)
})
</script>

<template>
    <div
        class="min-h-screen bg-white text-[#16191f] font-urbanist selection:bg-blue-500/20 selection:text-blue-900 overflow-x-hidden">

        <!-- Navigation -->
        <PublicNavbar activeLink="compute" />

        <div class="relative bg-[#fafafa]">
            <!-- Structural Grid Background -->
            <div
                class="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none">
            </div>

            <!-- Authenticated View: Dashboard -->
            <div v-if="authStore.isAuthenticated" class="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-40">
                <!-- Header -->
                <div class="mb-16">
                    <div class="inline-flex items-center gap-3 mb-8 text-blue-600">
                        <div class="w-12 h-[2px] bg-blue-600"></div>
                        <span class="text-[10px] font-black uppercase tracking-[0.3em]">Compute Infrastructure</span>
                    </div>
                    <h1 class="text-5xl md:text-7xl font-black text-[#232f3e] tracking-tighter mb-4 uppercase">
                        Compute <span class="text-blue-600 italic">Overview</span>
                    </h1>
                    <p class="text-xl text-[#545b64] leading-relaxed max-w-2xl font-medium">
                        Unified control plane for EC2, Lambda, and EKS clusters.
                    </p>
                </div>

                <!-- Billing Summary Card - Sharp & Flat -->
                <div class="bg-white border-2 border-[#232f3e] p-10 mb-16 relative overflow-hidden group shadow-none">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                        <div>
                            <p class="text-[10px] font-black text-[#879196] uppercase tracking-[0.3em] mb-4">Total
                                Compute Billing</p>
                            <div class="flex items-baseline gap-4">
                                <span class="text-6xl font-black text-[#232f3e] tracking-tighter">${{
                                    totalBilling.toFixed(2) }}</span>
                                <span class="text-sm font-black text-emerald-600 uppercase">{{ billingTrend }}%</span>
                            </div>
                            <p class="text-[10px] font-black text-[#879196] uppercase tracking-widest mt-4">Fiscal Feb
                                2026</p>
                        </div>
                        <div class="flex flex-wrap gap-4">
                            <button @click="router.push('/docs/content/ec2-overview')"
                                class="px-8 py-3 bg-white border-2 border-[#232f3e] text-[#232f3e] font-black uppercase tracking-widest hover:bg-[#232f3e] hover:text-white transition-all transform hover:-translate-y-1">
                                View Architecture
                            </button>
                            <button @click="router.push({ name: 'compute-optimization' })"
                                class="px-8 py-4 bg-blue-600 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all rounded-none">
                                Optimize Resources
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Service Cards Grid - Flat & High Contrast -->
                <div class="grid md:grid-cols-3 gap-0 border border-[#eaeded] bg-white mb-16">
                    <div v-for="service in computeServices" :key="service.id"
                        @click="!service.comingSoon && navigateTo(service.route)" :class="[
                            'p-12 border-r border-[#eaeded] hover:bg-[#fafafa] transition-colors relative group',
                            service.comingSoon ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                        ]">

                        <!-- Coming Soon Badge -->
                        <div v-if="service.comingSoon"
                            class="absolute top-6 right-6 px-3 py-1 border-2 border-[#232f3e] bg-white">
                            <span class="text-[9px] font-black text-[#232f3e] uppercase tracking-[0.2em]">Pending</span>
                        </div>

                        <!-- Icon - Sharp -->
                        <div class="w-12 h-12 border-2 flex items-center justify-center mb-10 transition-all group-hover:scale-110"
                            :style="{ borderColor: service.color === 'blue' ? '#2563eb' : service.color === 'indigo' ? '#4f46e5' : '#0891b2', color: service.color === 'blue' ? '#2563eb' : service.color === 'indigo' ? '#4f46e5' : '#0891b2' }">
                            <svg v-if="service.icon === 'server'" class="w-6 h-6" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                    d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 01-2 2v4a2 2 0 012 2h14a2 2 0 012-2v-4a2 2 0 01-2-2m-2-4h.01M17 16h.01" />
                            </svg>
                            <svg v-if="service.icon === 'bolt'" class="w-6 h-6" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                    d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <svg v-if="service.icon === 'cubes'" class="w-6 h-6" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>

                        <!-- Service Info -->
                        <h3 class="text-xl font-black text-[#232f3e] mb-4 uppercase tracking-tight">{{ service.name }}
                        </h3>
                        <p class="text-sm text-[#545b64] mb-10 font-bold leading-relaxed">{{ service.description }}</p>

                        <!-- Metrics - Corporate Style -->
                        <div class="space-y-4 pt-6 border-t-2 border-[#232f3e]">
                            <div
                                class="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[#879196]">
                                <span>Utilization</span>
                                <span class="text-[#232f3e]">{{ service.metrics.active }} / {{ service.metrics.total
                                    }}</span>
                            </div>
                            <div
                                class="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[#879196]">
                                <span>{{ service.id === 'ec2' ? 'Avg Load' : service.id === 'lambda' ? 'Execution' :
                                    'Compute' }}</span>
                                <span class="text-[#232f3e]">{{ service.id === 'ec2' ? `${service.metrics.cpu}%` :
                                    service.id === 'lambda' ? service.metrics.invocations : service.metrics.pods
                                    }}</span>
                            </div>
                            <div class="flex justify-between items-center pt-2">
                                <span
                                    class="text-[10px] font-black uppercase tracking-widest text-[#879196]">Operational
                                    Cost</span>
                                <span class="text-xl font-black italic tracking-tighter"
                                    :style="{ color: service.color === 'blue' ? '#2563eb' : service.color === 'indigo' ? '#4f46e5' : '#0891b2' }">${{
                                        service.metrics.cost.toFixed(2) }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions - Large Buttons -->
                <div class="grid md:grid-cols-2 gap-8">
                    <router-link :to="{ name: 'launch-instance' }"
                        class="bg-white border-2 border-[#232f3e] p-8 hover:bg-[#fafafa] transition-all group flex items-center justify-between">
                        <div class="flex items-center gap-6">
                            <div
                                class="w-12 h-12 border-2 border-blue-600 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <div>
                                <h4 class="text-[#232f3e] font-black text-sm uppercase tracking-widest">Provision EC2
                                    Node</h4>
                                <p class="text-[10px] font-bold text-[#879196] uppercase tracking-[0.2em] mt-1">L1 Bare
                                    Metal Deployment</p>
                            </div>
                        </div>
                        <span class="text-2xl font-black group-hover:translate-x-2 transition-transform">→</span>
                    </router-link>

                    <router-link to="/lambda/create"
                        class="bg-white border-2 border-[#232f3e] p-8 hover:bg-[#fafafa] transition-all group flex items-center justify-between">
                        <div class="flex items-center gap-6">
                            <div
                                class="w-12 h-12 border-2 border-indigo-600 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <div>
                                <h4 class="text-[#232f3e] font-black text-sm uppercase tracking-widest">Execute Atomic
                                    Lambda</h4>
                                <p class="text-[10px] font-bold text-[#879196] uppercase tracking-[0.2em] mt-1">
                                    Cold-Start Optimized Function</p>
                            </div>
                        </div>
                        <span class="text-2xl font-black group-hover:translate-x-2 transition-transform">→</span>
                    </router-link>
                </div>
            </div>

            <!-- Unauthenticated View: Guest Landing Page -->
            <div v-else class="relative z-10 w-full min-h-[90vh] flex flex-col items-center pt-32 pb-40">
                <!-- Diagonal Structural Background -->
                <div
                    class="absolute top-0 right-0 w-1/2 h-full bg-white transform skew-x-[-15deg] translate-x-40 hidden lg:block border-l-2 border-[#eaeded]">
                </div>

                <div class="max-w-7xl mx-auto px-6 relative w-full">
                    <div class="grid lg:grid-cols-5 gap-16 items-center">
                        <div class="lg:col-span-3">
                            <div class="inline-flex items-center gap-3 mb-10 text-blue-600">
                                <div class="w-12 h-[2px] bg-blue-600"></div>
                                <span class="text-[10px] font-black uppercase tracking-[0.3em]">Quantum Compute
                                    Engine</span>
                            </div>

                            <h1
                                class="text-6xl md:text-9xl font-black text-[#232f3e] tracking-tighter mb-10 leading-[0.95] uppercase">
                                Atomic Compute.<br>
                                <span class="text-blue-600 italic">Total Control.</span>
                            </h1>

                            <p class="text-xl md:text-2xl text-[#545b64] leading-relaxed max-w-2xl mb-16 font-medium">
                                Deploy lightning-fast virtual nodes and serverless endpoints on our
                                <strong class="text-[#232f3e] font-black">low-latency global grid</strong>.
                                High-availability infrastructure for modern engineering teams.
                            </p>

                            <div class="flex flex-wrap gap-6">
                                <button @click="router.push('/register')"
                                    class="bg-blue-600 hover:bg-blue-700 text-white font-black px-12 py-6 transition-all rounded-none uppercase tracking-widest text-sm">
                                    Launch First Node
                                </button>
                                <button @click="router.push('/docs/content/ec2-overview')"
                                    class="px-12 py-6 border-2 border-[#232f3e] text-[#232f3e] font-black hover:bg-[#232f3e] hover:text-white transition-all rounded-none uppercase tracking-widest text-sm">
                                    View Architecture &rarr;
                                </button>
                            </div>
                        </div>

                        <!-- Right Decor: Performance Grid -->
                        <div class="lg:col-span-2 hidden lg:block">
                            <div class="grid grid-cols-4 gap-4 opacity-40">
                                <div v-for="i in 16" :key="i"
                                    class="aspect-square border-2 border-[#eaeded] bg-white flex items-center justify-center group hover:bg-blue-50 hover:border-blue-200 transition-all duration-500">
                                    <div
                                        class="w-1.5 h-1.5 bg-[#eaeded] group-hover:bg-blue-600 group-hover:scale-150 transition-all">
                                    </div>
                                </div>
                            </div>

                            <!-- Status Widget -->
                            <div class="mt-10 bg-white border-2 border-[#232f3e] p-8">
                                <div class="flex flex-col gap-6">
                                    <div
                                        class="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-[#879196]">
                                        <span>SYSTEM LOAD</span>
                                        <span class="text-emerald-600 font-black">OPTIMAL</span>
                                    </div>
                                    <div class="h-10 border-2 border-[#eaeded] flex items-center gap-1 p-1">
                                        <div v-for="k in 24" :key="k"
                                            class="flex-1 h-full bg-blue-100 group hover:bg-blue-600 transition-colors"
                                            :class="{ 'bg-blue-600': k < 18 }"></div>
                                    </div>
                                    <div class="text-[10px] font-black uppercase text-[#232f3e] tracking-widest">
                                        Latency: 12.4ms (GLOBAL AVG)</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Tech Preview Grid -->
                    <div class="grid md:grid-cols-3 gap-0 mt-40 border-2 border-[#232f3e] bg-white">
                        <div class="p-12 border-r-2 border-[#232f3e] hover:bg-[#fafafa] transition-colors group">
                            <h3 class="text-xl font-black text-[#232f3e] mb-5 uppercase tracking-tight">EC2 Fleet</h3>
                            <p class="text-sm text-[#545b64] font-bold leading-relaxed">Bare-metal performance for
                                demanding workloads. Custom VM optimization and instant auto-scaling.</p>
                        </div>
                        <div class="p-12 border-r-2 border-[#232f3e] hover:bg-[#fafafa] transition-colors group">
                            <h3 class="text-xl font-black text-[#232f3e] mb-5 uppercase tracking-tight">Pure Serverless
                            </h3>
                            <p class="text-sm text-[#545b64] font-bold leading-relaxed">Event-driven code execution with
                                sub-ms cold starts. Fully isolated environments for atomic logic.</p>
                        </div>
                        <div class="p-12 hover:bg-[#fafafa] transition-colors group">
                            <h3 class="text-xl font-black text-[#232f3e] mb-5 uppercase tracking-tight">K8S Managed</h3>
                            <p class="text-sm text-[#545b64] font-bold leading-relaxed">Enterprise-grade Kubernetes
                                orchestration. One-click zero-downtime upgrades and cluster mesh.</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Stats Bar -->
            <section class="border-y-2 border-[#232f3e] bg-white py-16 relative z-10">
                <div class="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
                    <div v-for="(stat, idx) in [
                        { label: 'Uptime Protocol', val: '99.99%', sub: 'SLI GUARANATEED' },
                        { label: 'Edge Nodes', val: '2,400+', sub: 'GLOBAL DISTRIBUTION' },
                        { label: 'Provision Seg', val: '< 10S', sub: 'VM SPIN-UP TIME' },
                        { label: 'Network Fabric', val: '400G', sub: 'THROUGHPUT RATIO' }
                    ]" :key="idx">
                        <div class="text-[9px] font-black text-[#879196] uppercase tracking-[0.3em] mb-2">{{ stat.label
                            }}</div>
                        <div class="text-4xl md:text-5xl font-black text-[#232f3e] tracking-tighter mb-1 italic">{{
                            stat.val }}</div>
                        <div class="text-[9px] font-black text-blue-600 uppercase tracking-widest">{{ stat.sub }}</div>
                    </div>
                </div>
            </section>

            <!-- Testimonials - Sharp Cards -->
            <section class="py-32 bg-[#fafafa]">
                <div class="max-w-7xl mx-auto px-6">
                    <div class="grid md:grid-cols-3 gap-8">
                        <div v-for="(t, i) in [
                            { quote: 'Serwin Compute reduced our deployment times by 40% in just one week. The L1 performance is unmatched.', name: 'John Doe', role: 'DEVOPS' },
                            { quote: 'Moving heavy workloads was seamless. The performance per dollar ratio redefined our infrastructure costs.', name: 'Jane Smith', role: 'CTO, ORBITER' },
                            { quote: 'The programmable scaling API is incredibly intuitive. Integration took less than an afternoon.', name: 'Mike Ross', role: 'ARCHITECT' }
                        ]" :key="i"
                            class="p-10 border-2 border-[#232f3e] bg-white hover:translate-y-[-4px] transition-transform">
                            <div class="text-blue-600 font-black text-4xl mb-6">"</div>
                            <p class="text-sm text-[#545b64] font-bold leading-relaxed mb-10 italic">{{ t.quote }}</p>
                            <div class="flex items-center gap-4 border-t border-[#eaeded] pt-6">
                                <div class="w-2 h-2 rounded-full bg-blue-600"></div>
                                <div class="text-[10px] font-black text-[#232f3e] uppercase tracking-widest">{{ t.name
                                    }} <span class="text-[#879196] font-medium ml-2">// {{ t.role }}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>

        <footer class="py-20 bg-white border-t-2 border-[#232f3e]">
            <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-[#232f3e] flex items-center justify-center text-white font-black italic">S
                    </div>
                    <span class="font-black text-xl text-[#232f3e] tracking-tighter uppercase">SerwinCompute</span>
                </div>
                <div class="flex gap-10 text-[10px] font-black text-[#879196] uppercase tracking-[0.2em]">
                    <a href="#" class="hover:text-blue-600">Terms</a>
                    <a href="#" class="hover:text-blue-600">Infrastructure</a>
                    <a href="#" class="hover:text-blue-600">Status</a>
                </div>
                <div class="text-[10px] text-[#879196] font-black uppercase tracking-widest">© 2026 SERWIN SYSTEMS INC.
                </div>
            </div>
        </footer>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800;900&display=swap');

.font-urbanist {
    font-family: 'Urbanist', sans-serif;
}

.font-black {
    font-weight: 900;
}
</style>
