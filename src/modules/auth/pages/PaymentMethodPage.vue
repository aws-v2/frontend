<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/authStore'
import { useToastStore } from '@/shared/store/toastStore'
import PublicNavbar from '@/shared/components/PublicNavbar.vue'
import apiClient from '@/shared/api/apiClient'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()
const isLoading = ref(false)

// Payment method tab: 'card' | 'mpesa'
const activeTab = ref<'card' | 'mpesa'>('card')

const cardForm = reactive<Record<string, string>>({
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

const mpesaForm = reactive({
    phone: '',
    name: ''
})

// M-Pesa STK push states
const stkSent = ref(false)
const stkConfirmed = ref(false)

const formatCardNumber = (e: Event) => {
    const input = e.target as HTMLInputElement
    let value = input.value.replace(/\D/g, '')
    value = value.substring(0, 16)
    const sections = value.match(/.{1,4}/g)
    cardForm.cardNumber = sections ? sections.join(' ') : value
}

const formatMpesaPhone = (e: Event) => {
    const input = e.target as HTMLInputElement
    let value = input.value.replace(/\D/g, '')
    // Normalize: strip leading 0 or 254 prefix
    if (value.startsWith('254')) value = value.substring(3)
    if (value.startsWith('0')) value = value.substring(1)
    value = value.substring(0, 9)
    // Format: 7XX XXX XXX
    const p1 = value.substring(0, 3)
    const p2 = value.substring(3, 6)
    const p3 = value.substring(6, 9)
    let formatted = p1
    if (p2) formatted += ' ' + p2
    if (p3) formatted += ' ' + p3
    mpesaForm.phone = formatted
}

const normalizedPhone = computed(() => {
    const digits = mpesaForm.phone.replace(/\D/g, '')
    return '+254' + digits
})

const sendStkPush = async () => {
    if (isLoading.value) return
    isLoading.value = true
    stkConfirmed.value = false
 
    try {
        await apiClient.post('billing/mpesa/stk-push', {
            phone: normalizedPhone.value,
            accountName: mpesaForm.name,
        })
        stkSent.value = true
        toastStore.addToast('STK push sent — check your phone', 'success')
    } catch (err: any) {
        const message = err.response?.data?.message ?? 'Failed to send STK push. Please try again.'
        toastStore.addToast(message, 'error')
    } finally {
        isLoading.value = false
    }
}
 
const confirmMpesa = () => {
    if (isLoading.value) return
    isLoading.value = true
    stkConfirmed.value = true
    setTimeout(() => {
        authStore.completeRegistration()
        toastStore.addToast('M-Pesa payment verified successfully', 'success')
        router.push('/dashboard')
        isLoading.value = false
    }, 1000)
}


const handleCardSubmit = async () => {
    if (isLoading.value) return
    isLoading.value = true
 
    try {
        await apiClient.post('billing/card', {
            cardholderName: cardForm.cardholderName,
            cardNumber: cardForm.cardNumber.replace(/\s/g, ''),
            expirationMonth: cardForm.expirationMonth,
            expirationYear: cardForm.expirationYear,
            cvv: cardForm.cvv,
            address: cardForm.address,
            city: cardForm.city,
            state: cardForm.state,
            zipCode: cardForm.zipCode,
        })
        authStore.completeRegistration()
        toastStore.addToast('Payment method verified successfully', 'success')
        router.push('/dashboard')
    } catch (err: any) {
        const message = err.response?.data?.message ?? 'Card verification failed. Please check your details.'
        toastStore.addToast(message, 'error')
    } finally {
        isLoading.value = false
    }
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

                    <!-- Accepted Methods -->
                    <div class="bg-white border-2 border-[#232f3e] p-8 shadow-none">
                        <h3 class="font-black text-[#232f3e] uppercase tracking-widest text-xs mb-5">Accepted Methods
                        </h3>
                        <div class="space-y-4">
                            <!-- Card badge -->
                            <div class="flex items-center gap-3">
                                <div
                                    class="w-8 h-8 bg-[#fafafa] border-2 border-[#eaeded] flex items-center justify-center">
                                    <svg class="w-4 h-4 text-[#545b64]" fill="none" viewBox="0 0 24 24"
                                        stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                                <span class="text-xs font-black text-[#545b64] uppercase tracking-widest">Visa /
                                    Mastercard</span>
                            </div>
                            <!-- M-Pesa badge -->
                            <div class="flex items-center gap-3">
                                <div
                                    class="w-8 h-8 bg-[#00a651]/10 border-2 border-[#00a651]/30 flex items-center justify-center">
                                    <svg class="w-4 h-4 text-[#00a651]" fill="none" viewBox="0 0 24 24"
                                        stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <span class="text-xs font-black text-[#00a651] uppercase tracking-widest">M-Pesa
                                    (Kenya)</span>
                            </div>
                        </div>
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
                    <div class="bg-white border-2 border-[#232f3e] shadow-none">

                        <!-- ── Tab Switcher ── -->
                        <div class="flex border-b-2 border-[#232f3e]">
                            <!-- Card Tab -->
                            <button type="button" @click="activeTab = 'card'; stkSent = false; stkConfirmed = false"
                                :class="[
                                    'relative flex-1 flex items-center justify-center gap-3 px-8 py-5 transition-all duration-200 group',
                                    activeTab === 'card'
                                        ? 'bg-[#ff9900] text-white'
                                        : 'bg-white text-[#545b64] hover:bg-[#fafafa]'
                                ]">
                                <!-- Active left-edge bar -->
                                <div v-if="activeTab === 'card'"
                                    class="absolute left-0 top-0 h-full w-1 bg-[#ec7211]"></div>
                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                    stroke-width="2.5">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                <div class="text-left">
                                    <p class="text-[10px] font-black uppercase tracking-[0.25em] leading-none"
                                        :class="activeTab === 'card' ? 'text-white/70' : 'text-[#879196]'">
                                        Method 01
                                    </p>
                                    <p class="text-sm font-black uppercase tracking-widest mt-1">Credit / Debit Card</p>
                                </div>
                                <!-- Active underline indicator -->
                                <div v-if="activeTab === 'card'"
                                    class="absolute bottom-0 left-0 right-0 h-0.5 bg-white/40"></div>
                            </button>

                            <!-- Divider -->
                            <div class="w-px bg-[#232f3e]"></div>

                            <!-- M-Pesa Tab -->
                            <button type="button" @click="activeTab = 'mpesa'; stkSent = false; stkConfirmed = false"
                                :class="[
                                    'relative flex-1 flex items-center justify-center gap-3 px-8 py-5 transition-all duration-200',
                                    activeTab === 'mpesa'
                                        ? 'bg-[#00a651] text-white'
                                        : 'bg-white text-[#545b64] hover:bg-[#fafafa]'
                                ]">
                                <div v-if="activeTab === 'mpesa'"
                                    class="absolute left-0 top-0 h-full w-1 bg-[#007a3d]"></div>
                                <!-- M-Pesa phone icon -->
                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                    stroke-width="2.5">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <div class="text-left">
                                    <p class="text-[10px] font-black uppercase tracking-[0.25em] leading-none"
                                        :class="activeTab === 'mpesa' ? 'text-white/70' : 'text-[#879196]'">
                                        Method 02
                                    </p>
                                    <p class="text-sm font-black uppercase tracking-widest mt-1">M-Pesa</p>
                                </div>
                                <div v-if="activeTab === 'mpesa'"
                                    class="absolute bottom-0 left-0 right-0 h-0.5 bg-white/40"></div>
                            </button>
                        </div>

                        <!-- ── Panel Body ── -->
                        <div class="p-10">

                            <!-- Panel header -->
                            <div class="mb-12 flex items-center justify-between border-b-2 border-[#eaeded] pb-8">
                                <div class="flex items-center gap-6">
                                    <!-- Icon changes with tab -->
                                    <div :class="[
                                        'w-14 h-14 border-2 border-[#232f3e] flex items-center justify-center transition-colors duration-300',
                                        activeTab === 'mpesa' ? 'bg-[#00a651]/10' : 'bg-[#fafafa]'
                                    ]">
                                        <!-- Card icon -->
                                        <svg v-if="activeTab === 'card'" class="w-7 h-7 text-[#232f3e]" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                        <!-- M-Pesa icon -->
                                        <svg v-else class="w-7 h-7 text-[#00a651]" fill="none" viewBox="0 0 24 24"
                                            stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 class="text-2xl font-black text-[#232f3e] uppercase tracking-tighter">
                                            {{ activeTab === 'card' ? 'Billing Information' : 'M-Pesa Express' }}
                                        </h2>
                                        <p class="text-[#879196] text-xs font-bold uppercase tracking-widest mt-1">
                                            {{ activeTab === 'card' ? 'Identity verification' : 'Lipa na M-Pesa · STK Push' }}
                                        </p>
                                    </div>
                                </div>
                                <!-- Card logos / M-Pesa badge -->
                                <div class="hidden sm:flex gap-2" v-if="activeTab === 'card'">
                                    <div v-for="i in 3" :key="i"
                                        class="w-12 h-7 bg-[#fafafa] border-2 border-[#eaeded]"></div>
                                </div>
                                <div v-else
                                    class="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#00a651]/10 border-2 border-[#00a651]/30">
                                    <div class="w-2 h-2 rounded-full bg-[#00a651] animate-pulse"></div>
                                    <span class="text-[10px] font-black text-[#00a651] uppercase tracking-widest">Live
                                        Network</span>
                                </div>
                            </div>

                            <!-- ═══════════════════════════════════════ -->
                            <!-- CARD FORM                              -->
                            <!-- ═══════════════════════════════════════ -->
                            <form v-if="activeTab === 'card'" @submit.prevent="handleCardSubmit"
                                class="space-y-12">
                                <!-- Card Details -->
                                <div class="space-y-8">
                                    <h3 class="text-xs font-black text-[#ff9900] uppercase tracking-[0.3em]">Credit /
                                        Debit Card</h3>

                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div class="space-y-3">
                                            <label
                                                class="text-[10px] font-black text-[#545b64] uppercase tracking-widest px-1">Cardholder
                                                Name</label>
                                            <input v-model="cardForm.cardholderName" type="text"
                                                class="w-full bg-white border-2 border-[#eaeded] px-5 py-4 text-[#16191f] font-bold placeholder-[#879196] focus:outline-none focus:border-[#ff9900] transition-all rounded-none uppercase"
                                                placeholder="ALEXANDER PIERCE">
                                        </div>
                                        <div class="space-y-3">
                                            <label
                                                class="text-[10px] font-black text-[#545b64] uppercase tracking-widest px-1">Card
                                                Number</label>
                                            <div class="relative">
                                                <input :value="cardForm.cardNumber" @input="formatCardNumber"
                                                    type="text"
                                                    class="w-full bg-white border-2 border-[#eaeded] px-5 py-4 text-[#16191f] font-bold placeholder-[#879196] focus:outline-none focus:border-[#ff9900] transition-all rounded-none"
                                                    placeholder="0000 0000 0000 0000">
                                                <div
                                                    class="absolute right-5 top-1/2 -translate-y-1/2 text-emerald-500">
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
                                                <select v-model="cardForm.expirationMonth"
                                                    class="w-1/2 bg-white border-2 border-[#eaeded] px-5 py-4 text-[#16191f] font-bold focus:outline-none focus:border-[#ff9900] transition-all rounded-none uppercase cursor-pointer">
                                                    <option value="">MM</option>
                                                    <option v-for="m in months" :key="m" :value="m">{{ m }}</option>
                                                </select>
                                                <select v-model="cardForm.expirationYear"
                                                    class="w-1/2 bg-white border-2 border-[#eaeded] px-5 py-4 text-[#16191f] font-bold focus:outline-none focus:border-[#ff9900] transition-all rounded-none uppercase cursor-pointer">
                                                    <option value="">YY</option>
                                                    <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="space-y-3">
                                            <label
                                                class="text-[10px] font-black text-[#545b64] uppercase tracking-widest px-1 text-center block">CVV</label>
                                            <input v-model="cardForm.cvv" type="text" maxlength="4"
                                                class="w-full bg-white border-2 border-[#eaeded] px-5 py-4 text-[#16191f] font-bold text-center placeholder-[#879196] focus:outline-none focus:border-[#ff9900] transition-all rounded-none"
                                                placeholder="123">
                                        </div>
                                    </div>
                                </div>

                                <!-- Billing Address -->
                                <div class="pt-12 border-t-2 border-[#eaeded] space-y-8">
                                    <h3 class="text-xs font-black text-[#ff9900] uppercase tracking-[0.3em]">Billing
                                        Address</h3>

                                    <div class="space-y-6">
                                        <div class="space-y-3">
                                            <label
                                                class="text-[10px] font-black text-[#545b64] uppercase tracking-widest px-1">Address
                                                Line 1</label>
                                            <input v-model="cardForm.address" type="text"
                                                class="w-full bg-white border-2 border-[#eaeded] px-5 py-4 text-[#16191f] font-bold focus:outline-none focus:border-[#ff9900] transition-all rounded-none">
                                        </div>
                                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div class="space-y-3" v-for="field in ['city', 'state', 'zipCode']"
                                                :key="field">
                                                <label
                                                    class="text-[10px] font-black text-[#545b64] uppercase tracking-widest px-1 capitalize">{{
                                                        field.replace('Code', '') }}</label>
                                                <input v-model="cardForm[field]" type="text"
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
                                        <span class="text-lg group-hover:-translate-x-1 transition-transform">←</span>
                                        Back to profile
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
                                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24"
                                                stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                                    d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </span>
                                    </button>
                                </div>
                            </form>

                            <!-- ═══════════════════════════════════════ -->
                            <!-- M-PESA FORM                            -->
                            <!-- ═══════════════════════════════════════ -->
                            <div v-else class="space-y-12">

                                <!-- How it works strip -->
                                <div class="grid grid-cols-3 gap-0 border-2 border-[#eaeded]">
                                    <div v-for="(step, idx) in [
                                        { num: '01', label: 'Enter your Safaricom number' },
                                        { num: '02', label: 'Receive STK push on your phone' },
                                        { num: '03', label: 'Enter PIN to confirm' }
                                    ]" :key="idx" :class="[
                                        'p-5 text-center',
                                        idx < 2 ? 'border-r-2 border-[#eaeded]' : ''
                                    ]">
                                        <div class="text-2xl font-black text-[#eaeded] mb-2">{{ step.num }}</div>
                                        <p class="text-[10px] font-black text-[#879196] uppercase tracking-wider leading-relaxed">
                                            {{ step.label }}
                                        </p>
                                    </div>
                                </div>

                                <!-- Phone input section -->
                                <div class="space-y-8">
                                    <h3 class="text-xs font-black text-[#00a651] uppercase tracking-[0.3em]">
                                        Safaricom Details
                                    </h3>

                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div class="space-y-3">
                                            <label
                                                class="text-[10px] font-black text-[#545b64] uppercase tracking-widest px-1">Account
                                                Name</label>
                                            <input v-model="mpesaForm.name" type="text"
                                                class="w-full bg-white border-2 border-[#eaeded] px-5 py-4 text-[#16191f] font-bold placeholder-[#879196] focus:outline-none focus:border-[#00a651] transition-all rounded-none uppercase"
                                                placeholder="JOHN KAMAU">
                                        </div>

                                        <div class="space-y-3">
                                            <label
                                                class="text-[10px] font-black text-[#545b64] uppercase tracking-widest px-1">Phone
                                                Number</label>
                                            <div class="flex">
                                                <!-- Country prefix badge -->
                                                <div
                                                    class="flex items-center gap-2 px-4 bg-[#fafafa] border-2 border-r-0 border-[#eaeded] text-[#545b64] font-black text-sm whitespace-nowrap">
                                                    <span class="text-base leading-none">🇰🇪</span>
                                                    <span>+254</span>
                                                </div>
                                                <input :value="mpesaForm.phone" @input="formatMpesaPhone" type="tel"
                                                    class="flex-1 bg-white border-2 border-[#eaeded] px-5 py-4 text-[#16191f] font-bold placeholder-[#879196] focus:outline-none focus:border-[#00a651] transition-all rounded-none"
                                                    placeholder="7XX XXX XXX">
                                            </div>
                                            <p class="text-[10px] font-bold text-[#879196] px-1">
                                                Safaricom lines only · 07XX or 01XX
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <!-- Verification amount notice -->
                                <div class="border-2 border-[#00a651]/30 bg-[#00a651]/5 p-6 flex items-start gap-5">
                                    <div
                                        class="w-8 h-8 bg-[#00a651] flex-shrink-0 flex items-center justify-center text-white mt-0.5">
                                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div class="space-y-1">
                                        <p class="text-xs font-black text-[#232f3e] uppercase tracking-widest">KES 1.00
                                            Verification Charge</p>
                                        <p class="text-xs font-bold text-[#545b64] leading-relaxed">
                                            A single shilling is charged to confirm your Safaricom line and is
                                            immediately reversed. Your free tier is not affected.
                                        </p>
                                    </div>
                                </div>

                                <!-- STK Push status panel (appears after send) -->
                                <div v-if="stkSent && !stkConfirmed"
                                    class="border-2 border-[#ff9900] bg-[#ff9900]/5 p-8 space-y-6">
                                    <div class="flex items-center gap-4">
                                        <div class="relative w-10 h-10 flex-shrink-0">
                                            <div
                                                class="absolute inset-0 bg-[#ff9900]/20 rounded-full animate-ping">
                                            </div>
                                            <div
                                                class="relative w-10 h-10 bg-[#ff9900] flex items-center justify-center text-white">
                                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24"
                                                    stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2.5"
                                                        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div>
                                            <p class="text-sm font-black text-[#232f3e] uppercase tracking-widest">
                                                STK Push Sent</p>
                                            <p class="text-xs font-bold text-[#545b64] mt-1">
                                                Check <span class="text-[#ff9900]">{{ normalizedPhone }}</span> for
                                                the M-Pesa prompt
                                            </p>
                                        </div>
                                    </div>
                                    <!-- Phone mockup -->
                                    <div
                                        class="mx-auto w-fit border-2 border-[#232f3e] bg-white px-8 py-6 text-center space-y-2">
                                        <p class="text-[10px] font-black text-[#879196] uppercase tracking-widest">
                                            M-Pesa Prompt</p>
                                        <div class="w-8 h-px bg-[#eaeded] mx-auto"></div>
                                        <p class="font-black text-[#232f3e] text-sm">Pay KES 1.00</p>
                                        <p class="text-xs text-[#545b64] font-bold">To: SERWIN SYSTEMS</p>
                                        <p class="text-[10px] text-[#879196] font-bold">Enter M-Pesa PIN to confirm
                                        </p>
                                    </div>
                                    <p class="text-center text-[10px] font-black text-[#879196] uppercase tracking-widest">
                                        After entering your PIN, click below
                                    </p>
                                    <button @click="confirmMpesa" :disabled="isLoading"
                                        class="w-full py-5 bg-[#00a651] hover:bg-[#007a3d] text-white font-black uppercase tracking-widest transition-all disabled:opacity-50">
                                        <span v-if="isLoading" class="flex items-center justify-center gap-3">
                                            <div
                                                class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin">
                                            </div>
                                            Confirming Payment...
                                        </span>
                                        <span v-else class="flex items-center justify-center gap-3">
                                            I've Entered My PIN — Confirm
                                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24"
                                                stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </span>
                                    </button>
                                </div>

                                <!-- Footer Actions -->
                                <div
                                    class="pt-12 flex flex-col md:flex-row md:items-center justify-between gap-8 border-t-2 border-[#232f3e]">
                                    <button type="button" @click="router.back()"
                                        class="text-xs font-black uppercase tracking-widest text-[#545b64] hover:text-[#232f3e] transition-colors flex items-center gap-2 group">
                                        <span class="text-lg group-hover:-translate-x-1 transition-transform">←</span>
                                        Back to profile
                                    </button>
                                    <button v-if="!stkSent" type="button" @click="sendStkPush"
                                        :disabled="isLoading || !mpesaForm.phone || !mpesaForm.name"
                                        class="w-full md:w-auto px-16 py-6 bg-[#00a651] hover:bg-[#007a3d] text-white font-black uppercase tracking-widest rounded-none shadow-none hover:translate-x-1 active:translate-x-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                        <span v-if="isLoading" class="flex items-center gap-3">
                                            <div
                                                class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin">
                                            </div>
                                            Sending Push...
                                        </span>
                                        <span v-else class="flex items-center gap-4">
                                            Send STK Push
                                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24"
                                                stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                                    d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </span>
                                    </button>
                                    <button v-else type="button" @click="stkSent = false"
                                        class="text-xs font-black uppercase tracking-widest text-[#00a651] hover:text-[#007a3d] transition-colors">
                                        ↺ Resend to different number
                                    </button>
                                </div>
                            </div>
                            <!-- end M-Pesa panel -->

                        </div>
                        <!-- end panel body -->
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