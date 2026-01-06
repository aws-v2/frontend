<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useToastStore } from '@/shared/store/toastStore'

const router = useRouter()
const toastStore = useToastStore()

const completeFlow = (plan: string) => {
    // Both plans lead to payment verification for identity/billing setup
    router.push('/auth/payment-method')
}
</script>

<template>
    <div class="min-h-screen bg-white flex flex-col items-center p-12 font-sans">
        <div class="max-w-5xl w-full">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Sign up for Serwin</h1>
            <h2 class="text-xl font-bold text-gray-800 mb-12">Choose your account plan</h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
                <!-- Free Plan -->
                <div class="border border-gray-200 rounded-sm flex flex-col items-center p-8 bg-gray-50/30">
                    <img src="https://img.freepik.com/free-vector/hand-drawn-business-planning-concept_52683-77298.jpg"
                        alt="Free plan" class="w-48 h-48 mb-8 object-contain mix-blend-multiply opacity-80">

                    <div class="w-full">
                        <h3 class="text-xl font-bold text-gray-900 mb-1">Free (6 months)</h3>
                        <p class="text-sm text-gray-600 mb-6">Learn, experiment, and build prototypes</p>

                        <ul class="space-y-4 mb-8">
                            <li class="flex items-center gap-3 text-sm font-medium">
                                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Receive up to $200 in credits</span>
                            </li>
                            <li class="flex items-center gap-3 text-sm font-medium">
                                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Includes free usage of select services</span>
                            </li>
                            <li class="flex items-center gap-3 text-sm font-medium opacity-40">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span>Workloads scale beyond credit thresholds</span>
                            </li>
                            <li class="flex items-center gap-3 text-sm font-medium opacity-40">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span>Access to all Serwin services and features</span>
                            </li>
                        </ul>

                        <div class="flex items-start gap-3 p-4 bg-white border border-gray-100 mb-8">
                            <svg class="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p class="text-[11px] text-gray-500 leading-normal">
                                After the 6 month free period or when all credits are used, you can choose to upgrade to
                                a paid plan. Otherwise, your account closes automatically.
                            </p>
                        </div>

                        <button @click="completeFlow('Free')"
                            class="w-full py-2 border-2 border-gray-300 font-bold hover:bg-gray-100 transition-colors">
                            Choose free plan
                        </button>
                    </div>
                </div>

                <!-- Paid Plan -->
                <div class="border border-gray-200 rounded-sm flex flex-col items-center p-8 bg-gray-50/30">
                    <img src="https://img.freepik.com/free-vector/rocket-concept-illustration_114360-128.jpg"
                        alt="Paid plan" class="w-48 h-48 mb-8 object-contain mix-blend-multiply opacity-80">

                    <div class="w-full">
                        <h3 class="text-xl font-bold text-gray-900 mb-1">Paid</h3>
                        <p class="text-sm text-gray-600 mb-6">Develop production-ready workloads</p>

                        <ul class="space-y-4 mb-8">
                            <li class="flex items-center gap-3 text-sm font-medium">
                                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Receive up to $200 in credits</span>
                            </li>
                            <li class="flex items-center gap-3 text-sm font-medium">
                                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Includes free usage of select services</span>
                            </li>
                            <li class="flex items-center gap-3 text-sm font-medium">
                                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Workloads scale beyond credit thresholds</span>
                            </li>
                            <li class="flex items-center gap-3 text-sm font-medium">
                                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Access to all Serwin services and features</span>
                            </li>
                        </ul>

                        <div class="flex items-start gap-3 p-4 bg-white border border-gray-100 mb-8">
                            <svg class="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p class="text-[11px] text-gray-500 leading-normal">
                                After all of your credits are used, you are charged using <span
                                    class="text-[var(--aws-blue)] hover:underline cursor-pointer">pay-as-you-go</span>
                                pricing.
                            </p>
                        </div>

                        <button @click="completeFlow('Paid')"
                            class="w-full py-2 bg-[var(--aws-orange)] text-white font-bold hover:opacity-90 transition-opacity">
                            Choose paid plan
                        </button>
                    </div>
                </div>
            </div>

            <div class="mt-12 text-center">
                <span
                    class="text-[var(--aws-blue)] hover:underline cursor-pointer text-xs font-bold inline-flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    View additional details
                </span>
            </div>
        </div>
    </div>
</template>
