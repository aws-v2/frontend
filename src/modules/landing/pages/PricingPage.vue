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

        <!-- FAQ or Help Section -->
        <section class="pb-24 max-w-7xl mx-auto px-6">
            <div class="border-t-2 border-[#eaeded] pt-24 grid md:grid-cols-2 gap-16">
                <div>
                    <h2 class="text-3xl font-black text-[#232f3e] mb-6 tracking-tight">Got Questions?</h2>
                    <p class="text-[#545b64] font-medium leading-relaxed mb-8">
                        Our team is here to help you choose the right plan for your current scale. Not sure where to
                        start? Reach out to our technical advisors.
                    </p>
                    <button @click="router.push('/docs/content/billing')"
                        class="text-[#0073bb] font-black uppercase tracking-widest text-sm hover:text-[#ff9900] transition-colors">
                        View Billing Docs →
                    </button>
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
