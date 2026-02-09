<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/authStore'
import { useToastStore } from '@/shared/store/toastStore'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()
const isLoading = ref(false)

const form = reactive({
    cardholderName: '',
    cardNumber: '',
    expirationMonth: '',
    expirationYear: '',
    cvv: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
})

const formatCardNumber = (e: Event) => {
    const input = e.target as HTMLInputElement
    let value = input.value.replace(/\D/g, '')
    value = value.substring(0, 16)
    const sections = value.match(/.{1,4}/g)
    form.cardNumber = sections ? sections.join(' ') : value
}

const handleSubmit = async () => {
    isLoading.value = true
    try {
        await authStore.verifyPayment(form)
    } finally {
        isLoading.value = false
        toastStore.addToast('Payment method verified (Sandbox Mode)', 'success')
        router.push('/auth/registration-success')
    }
}

const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'))
const currentYear = new Date().getFullYear()
const years = Array.from({ length: 10 }, (_, i) => (currentYear + i).toString())
</script>

<template>
    <div
        class="min-h-screen bg-[#05080F] relative overflow-hidden font-sans flex items-center justify-center p-6 lg:p-12">
        <!-- Ambient Background -->
        <div class="absolute inset-0 pointer-events-none">
            <div
                class="absolute top-[30%] right-[20%] w-[50vw] h-[50vw] bg-indigo-600/10 rounded-full blur-[120px] opacity-20">
            </div>
            <div
                class="absolute bottom-[20%] left-[20%] w-[40vw] h-[40vw] bg-purple-600/10 rounded-full blur-[100px] opacity-20">
            </div>
            <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]">
            </div>
        </div>

        <div class="relative z-10 w-full max-w-5xl grid lg:grid-cols-12 gap-12">

            <!-- Context / Info Column -->
            <div class="lg:col-span-4 lg:pt-12 space-y-8">
                <div>
                    <h1 class="text-3xl font-bold text-white mb-2 font-display">Establish Credential</h1>
                    <p class="text-slate-400 text-sm leading-relaxed">
                        To provision high-performance resources, we require a verified billing method.
                        Your identity allows us to prevent abuse of the <span class="text-indigo-400">Serwin Free
                            Tier</span>.
                    </p>
                </div>

                <div class="glass-panel p-6 rounded-2xl border-l-4 border-l-indigo-500">
                    <div class="flex items-center gap-3 mb-3">
                        <svg class="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <h3 class="font-bold text-white text-sm">Free Tier Allowance</h3>
                    </div>
                    <ul class="space-y-3">
                        <li class="flex items-center gap-3 text-xs text-slate-400">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            750 hrs/mo Micro Instance
                        </li>
                        <li class="flex items-center gap-3 text-xs text-slate-400">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            5GB Object Storage
                        </li>
                        <li class="flex items-center gap-3 text-xs text-slate-400">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            1M Lambda Requests
                        </li>
                    </ul>
                </div>

                <div class="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                    <svg class="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    256-bit AES Encryption
                </div>
            </div>

            <!-- Form Column -->
            <div class="lg:col-span-8">
                <div class="glass-panel p-8 md:p-10 rounded-3xl relative overflow-hidden">
                    <!-- Top Highlight -->
                    <div
                        class="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent">
                    </div>

                    <div class="mb-8 flex items-center justify-between border-b border-white/5 pb-6">
                        <div class="flex items-center gap-4">
                            <div
                                class="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                            <h2 class="text-xl font-bold text-white font-display">Billing Information</h2>
                        </div>
                        <div class="flex gap-2 opacity-50">
                            <div class="w-8 h-5 bg-white/10 rounded"></div>
                            <div class="w-8 h-5 bg-white/10 rounded"></div>
                            <div class="w-8 h-5 bg-white/10 rounded"></div>
                        </div>
                    </div>

                    <form @submit.prevent="handleSubmit" class="space-y-8">
                        <div>
                            <h3 class="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 font-mono">
                                Credit / Debit Card</h3>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div class="space-y-2">
                                    <label class="text-xs font-medium text-slate-400">Cardholder Name</label>
                                    <input v-model="form.cardholderName" type="text"
                                        class="w-full bg-black/50 border border-white/10 px-4 py-3 rounded-xl focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none text-white placeholder-white/20 transition-all font-mono"
                                        placeholder="ALEXANDER PIERCE">
                                </div>
                                <div class="space-y-2 relative">
                                    <label class="text-xs font-medium text-slate-400">Card Number</label>
                                    <div class="relative">
                                        <input :value="form.cardNumber" @input="formatCardNumber" type="text"
                                            class="w-full bg-black/50 border border-white/10 px-4 py-3 rounded-xl focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none text-white placeholder-white/20 transition-all font-mono"
                                            placeholder="0000 0000 0000 0000">
                                        <div class="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="grid grid-cols-3 gap-6">
                                <div class="col-span-2 space-y-2">
                                    <label class="text-xs font-medium text-slate-400">Expiration Date</label>
                                    <div class="flex gap-4">
                                        <select v-model="form.expirationMonth"
                                            class="w-1/2 bg-black/50 border border-white/10 px-4 py-3 rounded-xl focus:border-indigo-500/50 outline-none text-white font-mono appearance-none">
                                            <option value="" disabled>MM</option>
                                            <option v-for="m in months" :key="m" :value="m">{{ m }}</option>
                                        </select>
                                        <select v-model="form.expirationYear"
                                            class="w-1/2 bg-black/50 border border-white/10 px-4 py-3 rounded-xl focus:border-indigo-500/50 outline-none text-white font-mono appearance-none">
                                            <option value="" disabled>YY</option>
                                            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="space-y-2">
                                    <label class="text-xs font-medium text-slate-400">CVV</label>
                                    <input v-model="form.cvv" type="text" maxlength="4"
                                        class="w-full bg-black/50 border border-white/10 px-4 py-3 rounded-xl focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none text-white placeholder-white/20 transition-all font-mono text-center"
                                        placeholder="123">
                                </div>
                            </div>
                        </div>

                        <div class="pt-6 border-t border-white/5">
                            <h3 class="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 font-mono">
                                Billing Address</h3>

                            <div class="space-y-4">
                                <div class="space-y-2">
                                    <label class="text-xs font-medium text-slate-400">Address Line 1</label>
                                    <input v-model="form.address" type="text"
                                        class="w-full bg-black/50 border border-white/10 px-4 py-3 rounded-xl focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none text-white transition-all font-mono">
                                </div>
                                <div class="grid grid-cols-3 gap-4">
                                    <div class="space-y-2">
                                        <label class="text-xs font-medium text-slate-400">City</label>
                                        <input v-model="form.city" type="text"
                                            class="w-full bg-black/50 border border-white/10 px-4 py-3 rounded-xl focus:border-indigo-500/50 outline-none text-white font-mono">
                                    </div>
                                    <div class="space-y-2">
                                        <label class="text-xs font-medium text-slate-400">State</label>
                                        <input v-model="form.state" type="text"
                                            class="w-full bg-black/50 border border-white/10 px-4 py-3 rounded-xl focus:border-indigo-500/50 outline-none text-white font-mono">
                                    </div>
                                    <div class="space-y-2">
                                        <label class="text-xs font-medium text-slate-400">ZIP</label>
                                        <input v-model="form.zipCode" type="text"
                                            class="w-full bg-black/50 border border-white/10 px-4 py-3 rounded-xl focus:border-indigo-500/50 outline-none text-white font-mono">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="pt-8 flex items-center justify-between border-t border-white/10">
                            <button @click="router.back()"
                                class="text-sm font-bold text-slate-500 hover:text-white transition-colors">
                                ← Back
                            </button>
                            <button @click="handleSubmit" :disabled="isLoading"
                                class="btn-primary bg-indigo-600 hover:bg-indigo-500 px-10 py-4 flex items-center gap-3 shadow-lg shadow-indigo-500/20">
                                <div v-if="isLoading"
                                    class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin">
                                </div>
                                <span v-else>Verify & Launch Console</span>
                                <svg v-if="!isLoading" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.glass-panel {
    @apply bg-[#0B0F19]/80 backdrop-blur-2xl border border-white/5 shadow-2xl;
}

.btn-primary {
    @apply rounded-xl font-bold text-white transition-all duration-200 transform active:scale-95;
}
</style>
