<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/authStore'
import PublicNavbar from '@/shared/components/PublicNavbar.vue'

const router = useRouter()
const authStore = useAuthStore()

const handleGetStarted = () => {
    if (authStore.isAuthenticated) {
        router.push('/dashboard')
    } else {
        router.push('/register')
    }
}

const tiers = [
    {
        name: 'FREELANCER',
        price: '0',
        description: 'Perfect for small projects and learning the ropes.',
        features: [
            '2 vCPU Instances',
            '5GB S3 Storage',
            'Community Support',
            'Global Edge Network'
        ],
        cta: 'Start Building',
        popular: false,
        disabled: false
    },
    {
        name: 'BUILDER',
        price: '3',
        description: 'Portfolio prototype pricing. For growing teams requiring more power.',
        features: [
            '16 vCPU Instances',
            '500GB S3 Storage',
            'Priority Email Support',
            'Custom Domain Support',
            'Advanced Analytics'
        ],
        cta: 'Coming Soon',
        popular: true,
        disabled: true
    },
    {
        name: 'ENTERPRISE',
        price: '3',
        description: 'Portfolio prototype pricing. Dedicated infrastructure.',
        features: [
            'Unlimited Scale',
            'Dedicated H100 Clusters',
            '24/7 Phone Support',
            'SLA Guarantee',
            'Custom Integrations'
        ],
        cta: 'Coming Soon',
        popular: false,
        disabled: true
    }
]

onMounted(() => {
    window.scrollTo(0, 0)
})
</script>

<template>
    <div class="min-h-screen bg-white text-[#16191f] font-urbanist selection:bg-[#ff9900]/30 selection:text-[#16191f]">
        <!-- Navigation -->
        <PublicNavbar activeLink="pricing" :hasPrototypeBadge="true" />

        <!-- Pricing Header -->
        <header class="pt-40 pb-20 bg-[#fafafa] border-b border-[#eaeded]">
            <div class="max-w-7xl mx-auto px-6 text-center">
                <h1 class="text-5xl md:text-7xl font-black text-[#232f3e] mb-6 tracking-tighter">Simple Pricing.</h1>
                <p class="text-xl text-[#545b64] max-w-2xl mx-auto font-medium">
                    Transparent, predictable billing for everything from personal projects to global enterprises.
                </p>
            </div>
        </header>

        <!-- Pricing Grid -->
        <main class="py-24 max-w-7xl mx-auto px-6">
            <div class="grid md:grid-cols-3 gap-0 border-2 border-[#232f3e]">
                <div v-for="tier in tiers" :key="tier.name"
                    class="p-12 flex flex-col items-start bg-white transition-all group relative" :class="[
                        tier.popular ? 'ring-2 ring-inset ring-[#ff9900] z-10' : 'hover:bg-[#fafafa]',
                        tier.disabled ? 'grayscale opacity-75' : ''
                    ]">

                    <div v-if="tier.popular"
                        class="absolute top-0 right-0 bg-[#ff9900] text-white text-[10px] font-black px-4 py-1 uppercase tracking-widest">
                        Most Popular
                    </div>

                    <div v-if="tier.disabled"
                        class="absolute top-4 right-4 bg-[#232f3e] text-white text-[9px] font-black px-2 py-0.5 uppercase tracking-tighter">
                        Coming Soon
                    </div>

                    <div class="text-[11px] font-black uppercase tracking-widest mb-10"
                        :class="tier.popular ? 'text-[#ff9900]' : 'text-[#879196]'">
                        {{ tier.name }}
                    </div>

                    <div class="flex items-baseline gap-1 mb-6">
                        <span class="text-xs font-black" v-if="tier.price !== 'Custom'">$</span>
                        <span class="text-6xl font-black tracking-tighter">{{ tier.price }}</span>
                        <span class="text-sm font-bold opacity-60" v-if="tier.price !== 'Custom'">/mo</span>
                    </div>

                    <p class="text-sm font-medium mb-10 leading-relaxed text-[#545b64]">
                        {{ tier.description }}
                    </p>

                    <ul class="space-y-4 mb-12 w-full">
                        <li v-for="feature in tier.features" :key="feature"
                            class="flex items-center gap-3 text-sm font-bold"
                            :class="tier.disabled ? 'opacity-50' : ''">
                            <svg class="w-4 h-4 text-[#ff9900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                    d="M5 13l4 4L19 7" />
                            </svg>
                            {{ feature }}
                        </li>
                    </ul>

                    <button @click="handleGetStarted" :disabled="tier.disabled"
                        class="mt-auto w-full py-4 font-black transition-all border-2 rounded-none uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        :class="[
                            tier.popular
                                ? 'bg-[#ff9900] border-[#ff9900] text-white hover:bg-white hover:text-[#232f3e]'
                                : 'bg-transparent border-[#232f3e] text-[#232f3e] hover:bg-[#232f3e] hover:text-white'
                        ]">
                        {{ tier.cta }}
                    </button>
                </div>
            </div>
        </main>

        <!-- New Section: Predictable Economics -->
        <section class="py-24 bg-[#232f3e] text-white">
            <div class="max-w-7xl mx-auto px-6">
                <div class="grid md:grid-cols-2 gap-20 items-center">
                    <div>
                        <h2 class="text-4xl md:text-6xl font-black mb-8 tracking-tighter">
                            The End of <br/><span class="text-[#ff9900]">Licensing Taxes.</span>
                        </h2>
                        <p class="text-slate-400 text-lg leading-relaxed mb-8">
                            Most infrastructure providers charge you twice: once for the hardware, and again for the right to use it. 
                            At Serwin, we believe licenses are another form of rental. Our platform is built on open-foundation 
                            principles with zero licensing overhead.
                        </p>
                        <ul class="space-y-4">
                            <li class="flex items-center gap-3">
                                <div class="w-1.5 h-1.5 bg-[#ff9900]"></div>
                                <span class="text-sm font-bold uppercase tracking-widest text-slate-300">Unlimited API Access</span>
                            </li>
                            <li class="flex items-center gap-3">
                                <div class="w-1.5 h-1.5 bg-[#ff9900]"></div>
                                <span class="text-sm font-bold uppercase tracking-widest text-slate-300">No Per-Seat Maintenance</span>
                            </li>
                            <li class="flex items-center gap-3">
                                <div class="w-1.5 h-1.5 bg-[#ff9900]"></div>
                                <span class="text-sm font-bold uppercase tracking-widest text-slate-300">Elastic Scaling without Renewals</span>
                            </li>
                        </ul>
                    </div>
                    <div class="bg-white/5 border border-white/10 p-10 backdrop-blur-sm relative overflow-hidden">
                        <div class="absolute top-0 right-0 w-32 h-32 bg-[#ff9900]/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
                        <div class="text-[10px] font-black text-[#ff9900] uppercase tracking-widest mb-6">Comparative_Analysis_v1.0</div>
                        <div class="space-y-6">
                            <div class="flex justify-between items-end border-b border-white/5 pb-4">
                                <div class="text-xs font-bold text-slate-400 uppercase">Legacy Providers</div>
                                <div class="text-xl font-black text-slate-200">$4.2M / Yr</div>
                            </div>
                            <div class="flex justify-between items-end border-b border-[#ff9900]/20 pb-4">
                                <div class="text-xs font-black text-[#ff9900] uppercase">Serwin Protocol</div>
                                <div class="text-xl font-black text-white">$1.8M / Yr</div>
                            </div>
                        </div>
                        <p class="mt-8 text-[10px] text-slate-500 italic">Based on 10,000 core deployment with standard enterprise features.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- FAQ or Help Section -->
        <section class="py-24 max-w-7xl mx-auto px-6">
            <div class="grid md:grid-cols-2 gap-16">
                <div>
                    <h2 class="text-3xl font-black text-[#232f3e] mb-6 tracking-tight">Enterprise Scale</h2>
                    <p class="text-[#545b64] font-medium leading-relaxed mb-8">
                        Our infrastructure is designed for the most demanding compliance and security requirements. 
                        Whether you're in FinTech, Healthcare, or Public Sector, we provide the isolation and 
                        auditability you need.
                    </p>
                    <div class="flex flex-wrap gap-4 opacity-50">
                        <span class="px-3 py-1 bg-[#eaeded] text-[#232f3e] text-[10px] font-black uppercase tracking-widest">SOC 2 TYPE II</span>
                        <span class="px-3 py-1 bg-[#eaeded] text-[#232f3e] text-[10px] font-black uppercase tracking-widest">HIPAA Ready</span>
                        <span class="px-3 py-1 bg-[#eaeded] text-[#232f3e] text-[10px] font-black uppercase tracking-widest">PCI DSS</span>
                        <span class="px-3 py-1 bg-[#eaeded] text-[#232f3e] text-[10px] font-black uppercase tracking-widest">GDPR COMPLIANT</span>
                    </div>
                </div>
                <div class="space-y-8">
                    <div>
                        <h4 class="font-black text-[#232f3e] mb-2">Can I change plans later?</h4>
                        <p class="text-sm text-[#545b64] font-medium leading-relaxed">Yes, you can upgrade or downgrade
                            your plan at any time through the console settings.</p>
                    </div>
                    <div>
                        <h4 class="font-black text-[#232f3e] mb-2">Do you offer yearly discounts?</h4>
                        <p class="text-sm text-[#545b64] font-medium leading-relaxed">Contact our sales team for custom
                            enterprise pricing and long-term commitments.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="bg-white py-12 border-t border-[#eaeded]">
            <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-[#232f3e] flex items-center justify-center text-[#ff9900] font-black italic">
                        S</div>
                    <span class="font-black text-xl text-[#232f3e]">SerwinSystems</span>
                </div>
                <div class="text-[10px] text-[#879196] font-bold">© 2026 SERWIN SYSTEMS INC.</div>
            </div>
        </footer>
    </div>
</template>

<style scoped>
.font-black {
    font-weight: 900;
}
</style>
