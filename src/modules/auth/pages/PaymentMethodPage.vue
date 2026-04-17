<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/authStore'
import { useToastStore } from '@/shared/store/toastStore'
import PublicNavbar from '@/shared/components/PublicNavbar.vue'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()
const isLoading = ref(false)

const form = reactive<Record<string, string>>({
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
    if (isLoading.value) return
    isLoading.value = true

    // Simulate verification delay
    setTimeout(() => {
        authStore.completeRegistration()
        toastStore.addToast('Payment method verified successfully', 'success')
        router.push('/dashboard')
        isLoading.value = false
    }, 800)
}

const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'))
const currentYear = new Date().getFullYear()
const years = Array.from({ length: 10 }, (_, i) => (currentYear + i).toString())
</script>

<template>
    <div
        class="min-h-screen flex flex-col bg-white text-[#16191f] font-urbanist selection:bg-[#ff9900]/30 selection:text-[#16191f]">

        <PublicNavbar />

        <!-- Spacer for fixed navbar -->
        <div class="h-20"></div>

        <main class="flex-1 bg-[#fafafa] py-16 px-6 lg:px-12">
            <div class="max-w-6xl mx-auto grid lg:grid-cols-12 gap-16">

                <!-- Info Column -->
                <div class="lg:col-span-4 space-y-12 lg:pt-8">
                    <div class="space-y-6">
                        <div class="w-12 h-2 bg-[#ff9900]"></div>
                        <h1 class="text-4xl font-black text-[#232f3e] tracking-tighter uppercase leading-[0.9]">
                            Establish<br />Credentials
                        </h1>
                        <p class="text-[#545b64] font-bold text-sm leading-relaxed">
                            To provision high-performance resources, we require a verified billing method.
                            This allows us to prevent abuse of the <span class="text-[#0073bb]">Serwin Free Tier</span>.
                        </p>
                    </div>

                    <!-- Free Tier Card -->
                    <div class="bg-white border-2 border-[#232f3e] p-8 shadow-none">
                        <div class="flex items-center gap-3 mb-6">
                            <div class="w-8 h-8 bg-[#ff9900] flex items-center justify-center text-white">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 class="font-black text-[#232f3e] uppercase tracking-widest text-sm">Free Tier Allowance
                            </h3>
                        </div>
                        <ul class="space-y-4">
                            <li v-for="item in ['750 hrs/mo Micro Instance', '5GB Object Storage', '1M Lambda Requests']"
                                :key="item" class="flex items-center gap-4 text-xs font-bold text-[#545b64]">
                                <div class="w-1.5 h-1.5 bg-[#ff9900]"></div>
                                {{ item }}
                            </li>
                        </ul>
                    </div>

                    <div
                        class="flex items-center gap-3 text-[10px] text-[#879196] font-black uppercase tracking-[0.2em]">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        256-bit AES Encryption
                    </div>
                </div>

                <!-- Form Column -->
                <div class="lg:col-span-8">
                    <div class="bg-white border-2 border-[#232f3e] p-10 shadow-none">
                        <div class="mb-12 flex items-center justify-between border-b-2 border-[#eaeded] pb-8">
                            <div class="flex items-center gap-6">
                                <div
                                    class="w-14 h-14 bg-[#fafafa] border-2 border-[#232f3e] flex items-center justify-center text-[#232f3e]">
                                    <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 class="text-2xl font-black text-[#232f3e] uppercase tracking-tighter">Billing
                                        Information</h2>
                                    <p class="text-[#879196] text-xs font-bold uppercase tracking-widest mt-1">Identity
                                        verification</p>
                                </div>
                            </div>
                            <div class="hidden sm:flex gap-2">
                                <div v-for="i in 3" :key="i" class="w-12 h-7 bg-[#fafafa] border-2 border-[#eaeded]">
                                </div>
                            </div>
                        </div>

                        <form @submit.prevent="handleSubmit" class="space-y-12">
                            <!-- Card Details -->
                            <div class="space-y-8">
                                <h3 class="text-xs font-black text-[#ff9900] uppercase tracking-[0.3em]">Credit / Debit
                                    Card</h3>

                                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div class="space-y-3">
                                        <label
                                            class="text-[10px] font-black text-[#545b64] uppercase tracking-widest px-1">Cardholder
                                            Name</label>
                                        <input v-model="form.cardholderName" type="text"
                                            class="w-full bg-white border-2 border-[#eaeded] px-5 py-4 text-[#16191f] font-bold placeholder-[#879196] focus:outline-none focus:border-[#ff9900] transition-all rounded-none uppercase"
                                            placeholder="ALEXANDER PIERCE">
                                    </div>
                                    <div class="space-y-3">
                                        <label
                                            class="text-[10px] font-black text-[#545b64] uppercase tracking-widest px-1">Card
                                            Number</label>
                                        <div class="relative">
                                            <input :value="form.cardNumber" @input="formatCardNumber" type="text"
                                                class="w-full bg-white border-2 border-[#eaeded] px-5 py-4 text-[#16191f] font-bold placeholder-[#879196] focus:outline-none focus:border-[#ff9900] transition-all rounded-none"
                                                placeholder="0000 0000 0000 0000">
                                            <div class="absolute right-5 top-1/2 -translate-y-1/2 text-emerald-500">
                                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24"
                                                    stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="3"
                                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div class="md:col-span-2 space-y-3">
                                        <label
                                            class="text-[10px] font-black text-[#545b64] uppercase tracking-widest px-1">Expiration
                                            Date</label>
                                        <div class="flex gap-4">
                                            <select v-model="form.expirationMonth"
                                                class="w-1/2 bg-white border-2 border-[#eaeded] px-5 py-4 text-[#16191f] font-bold focus:outline-none focus:border-[#ff9900] transition-all rounded-none uppercase cursor-pointer">
                                                <option value="">MM</option>
                                                <option v-for="m in months" :key="m" :value="m">{{ m }}</option>
                                            </select>
                                            <select v-model="form.expirationYear"
                                                class="w-1/2 bg-white border-2 border-[#eaeded] px-5 py-4 text-[#16191f] font-bold focus:outline-none focus:border-[#ff9900] transition-all rounded-none uppercase cursor-pointer">
                                                <option value="">YY</option>
                                                <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="space-y-3">
                                        <label
                                            class="text-[10px] font-black text-[#545b64] uppercase tracking-widest px-1 text-center block">CVV</label>
                                        <input v-model="form.cvv" type="text" maxlength="4"
                                            class="w-full bg-white border-2 border-[#eaeded] px-5 py-4 text-[#16191f] font-bold text-center placeholder-[#879196] focus:outline-none focus:border-[#ff9900] transition-all rounded-none"
                                            placeholder="123">
                                    </div>
                                </div>
                            </div>

                            <!-- Billing Address -->
                            <div class="pt-12 border-t-2 border-[#eaeded] space-y-8">
                                <h3 class="text-xs font-black text-[#ff9900] uppercase tracking-[0.3em]">Billing Address
                                </h3>

                                <div class="space-y-6">
                                    <div class="space-y-3">
                                        <label
                                            class="text-[10px] font-black text-[#545b64] uppercase tracking-widest px-1">Address
                                            Line 1</label>
                                        <input v-model="form.address" type="text"
                                            class="w-full bg-white border-2 border-[#eaeded] px-5 py-4 text-[#16191f] font-bold focus:outline-none focus:border-[#ff9900] transition-all rounded-none">
                                    </div>
                                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div class="space-y-3" v-for="field in ['city', 'state', 'zipCode']"
                                            :key="field">
                                            <label
                                                class="text-[10px] font-black text-[#545b64] uppercase tracking-widest px-1 capitalize">{{
                                                    field.replace('Code', '') }}</label>
                                            <input v-model="form[field]" type="text"
                                                class="w-full bg-white border-2 border-[#eaeded] px-5 py-4 text-[#16191f] font-bold focus:outline-none focus:border-[#ff9900] transition-all rounded-none">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Footer Actions -->
                            <div
                                class="pt-12 flex flex-col md:flex-row md:items-center justify-between gap-8 border-t-2 border-[#232f3e]">
                                <button type="button" @click="router.back()"
                                    class="text-xs font-black uppercase tracking-widest text-[#545b64] hover:text-[#232f3e] transition-colors flex items-center gap-2 group">
                                    <span class="text-lg group-hover:-translate-x-1 transition-transform">←</span> Back
                                    to profile
                                </button>
                                <button type="submit" :disabled="isLoading"
                                    class="w-full md:w-auto px-16 py-6 bg-[#ff9900] hover:bg-[#ec7211] text-white font-black uppercase tracking-widest rounded-none shadow-none hover:translate-x-1 active:translate-x-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                    <span v-if="isLoading" class="flex items-center gap-3">
                                        <div
                                            class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin">
                                        </div>
                                        Verifying...
                                    </span>
                                    <span v-else class="flex items-center gap-4">
                                        Verify & Launch Console
                                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                                d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </main>

        <footer class="py-10 bg-white border-t border-[#eaeded] text-center">
            <p class="text-[10px] text-[#879196] font-black uppercase tracking-[0.2em]">© 2026 SERWIN SYSTEMS INC.</p>
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

select {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23545b64' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 1rem center;
    background-repeat: no-repeat;
    background-size: 1.5em 1.5em;
    padding-right: 2.5rem;
}
</style>
