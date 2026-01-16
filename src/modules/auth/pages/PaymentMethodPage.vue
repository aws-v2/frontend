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
        // Attempting to send request to the server, expecting failure
        await authStore.verifyPayment(form)
    } finally {
        // Counter with dummy data / always allow proceed for now
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
    <div class="min-h-screen bg-white flex flex-col items-center p-12 font-sans">
        <div class="max-w-4xl w-full">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Sign up for Serwin</h1>
            <h2 class="text-xl font-bold text-gray-800 mb-8">Billing information</h2>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div class="lg:col-span-2 space-y-8">
                    <section>
                        <h3 class="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">Credit / Debit
                            Card</h3>

                        <div class="space-y-4">
                            <div>
                                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Cardholder
                                    name</label>
                                <input v-model="form.cardholderName" type="text"
                                    class="w-full border border-gray-300 px-3 py-2 focus:border-[var(--aws-blue)] outline-none text-sm"
                                    placeholder="Name as it appears on card">
                            </div>

                            <div>
                                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Card number</label>
                                <div class="relative">
                                    <input :value="form.cardNumber" @input="formatCardNumber" type="text"
                                        class="w-full border border-gray-300 px-3 py-2 focus:border-[var(--aws-blue)] outline-none text-sm pr-12"
                                        placeholder="0000 0000 0000 0000">
                                    <div class="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                                        <div class="w-6 h-4 bg-gray-200 rounded-sm"></div>
                                        <div class="w-6 h-4 bg-gray-300 rounded-sm"></div>
                                    </div>
                                </div>
                            </div>

                            <div class="grid grid-cols-3 gap-4">
                                <div class="col-span-2">
                                    <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Expiration
                                        date</label>
                                    <div class="flex gap-2">
                                        <select v-model="form.expirationMonth"
                                            class="w-1/2 border border-gray-300 px-3 py-2 focus:border-[var(--aws-blue)] outline-none text-sm">
                                            <option value="" disabled>Month</option>
                                            <option v-for="m in months" :key="m" :value="m">{{ m }}</option>
                                        </select>
                                        <select v-model="form.expirationYear"
                                            class="w-1/2 border border-gray-300 px-3 py-2 focus:border-[var(--aws-blue)] outline-none text-sm">
                                            <option value="" disabled>Year</option>
                                            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-gray-700 uppercase mb-1">CVV</label>
                                    <input v-model="form.cvv" type="text" maxlength="4"
                                        class="w-full border border-gray-300 px-3 py-2 focus:border-[var(--aws-blue)] outline-none text-sm"
                                        placeholder="123">
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 class="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">Billing Address
                        </h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Address</label>
                                <input v-model="form.address" type="text"
                                    class="w-full border border-gray-300 px-3 py-2 focus:border-[var(--aws-blue)] outline-none text-sm">
                            </div>
                            <div class="grid grid-cols-3 gap-4">
                                <div class="col-span-1">
                                    <label class="block text-xs font-bold text-gray-700 uppercase mb-1">City</label>
                                    <input v-model="form.city" type="text"
                                        class="w-full border border-gray-300 px-3 py-2 focus:border-[var(--aws-blue)] outline-none text-sm">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-gray-700 uppercase mb-1">State</label>
                                    <input v-model="form.state" type="text"
                                        class="w-full border border-gray-300 px-3 py-2 focus:border-[var(--aws-blue)] outline-none text-sm">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-gray-700 uppercase mb-1">ZIP</label>
                                    <input v-model="form.zipCode" type="text"
                                        class="w-full border border-gray-300 px-3 py-2 focus:border-[var(--aws-blue)] outline-none text-sm">
                                </div>
                            </div>
                        </div>
                    </section>

                    <div class="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200">
                        <svg class="w-5 h-5 text-gray-400 mt-0.5 shrink-0" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <p class="text-[11px] text-gray-500 leading-normal">
                            We will not charge you for usage below the Serwin Free Tier limits. We might temporarily
                            hold up to $1 USD (or an equivalent amount in local currency) as a pending transaction for
                            3-5 days to verify your identity.
                        </p>
                    </div>

                    <div class="flex justify-between items-center pt-4">
                        <button @click="router.back()"
                            class="text-sm font-bold text-[var(--aws-blue)] hover:underline">← Back</button>
                        <button @click="handleSubmit" :disabled="isLoading"
                            class="px-8 py-2 bg-[var(--aws-orange)] text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50">
                            {{ isLoading ? 'Verifying...' : 'Verify and continue' }}
                        </button>
                    </div>
                </div>

                <div class="hidden lg:block">
                    <div class="p-6 bg-gray-50 border border-gray-200 sticky top-8">
                        <h4 class="font-bold text-gray-900 mb-4">Why do I need to provide a payment method?</h4>
                        <p class="text-xs text-gray-600 leading-relaxed mb-4">
                            We use this information to verify your identity and to minimize abuse of our free tier
                            services.
                        </p>
                        <ul class="text-[11px] text-gray-500 space-y-2 list-disc pl-4">
                            <li>Identity verification</li>
                            <li>Fraud prevention</li>
                            <li>Payment for usage beyond free tier</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
