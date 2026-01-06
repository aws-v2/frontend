<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const proceedToAccountPlan = () => {
    router.push('/auth/account-plan')
}
</script>

<template>
    <div class="min-h-screen bg-white flex flex-col items-center p-12 font-sans">
        <div class="max-w-5xl w-full">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Sign up for Serwin</h1>
            <h2 class="text-xl font-bold text-gray-800 mb-8">Select a support plan</h2>

            <p class="text-sm text-gray-600 mb-8">
                Choose a support plan for your business or personal account.
                <span
                    class="text-[var(--aws-blue)] hover:underline cursor-pointer inline-flex items-center gap-1">Compare
                    plans and pricing examples <svg class="w-3 h-3" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg></span>.
                You can change your plan anytime in the Serwin Management Console.
            </p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <!-- Basic Support -->
                <label @click="proceedToAccountPlan"
                    class="relative border-2 border-[var(--aws-blue)] p-8 cursor-pointer hover:bg-blue-50/10 transition-colors group">
                    <div class="absolute top-4 left-4">
                        <div
                            class="w-5 h-5 rounded-full border-2 border-[var(--aws-blue)] flex items-center justify-center">
                            <div class="w-2.5 h-2.5 bg-[var(--aws-blue)] rounded-full"></div>
                        </div>
                    </div>
                    <div class="ml-8">
                        <h3 class="text-lg font-bold text-gray-900 mb-4">Basic support - Free</h3>
                        <ul class="space-y-3 text-[13px] text-gray-600">
                            <li class="flex gap-2">
                                <span class="text-gray-400">•</span>
                                <span>Recommended for new users just getting started with Serwin</span>
                            </li>
                            <li class="flex gap-2">
                                <span class="text-gray-400">•</span>
                                <span>24x7 self-service access to Serwin resources</span>
                            </li>
                            <li class="flex gap-2">
                                <span class="text-gray-400">•</span>
                                <span>For account and billing issues only</span>
                            </li>
                            <li class="flex gap-2">
                                <span class="text-gray-400">•</span>
                                <span>Access to Personal Health Dashboard & Trusted Advisor</span>
                            </li>
                        </ul>
                    </div>
                </label>

                <!-- Business Support -->
                <label class="relative border-2 border-gray-200 p-8 cursor-not-allowed opacity-60">
                    <div class="absolute top-4 left-4">
                        <div class="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                    </div>
                    <div class="ml-8">
                        <h3 class="text-lg font-bold text-gray-900 mb-1">Serwin Business Support+</h3>
                        <p class="text-sm font-bold text-gray-900 mb-6">Starts at $29/month</p>

                        <div class="bg-blue-50/30 p-4 mb-6">
                            <p class="text-sm font-bold text-gray-800">Limited time offer: Get full refund for first 60
                                days</p>
                        </div>

                        <ul class="space-y-3 text-[13px] text-gray-600">
                            <li class="flex gap-2 items-center italic">
                                <span class="text-gray-400">•</span>
                                <span>Unlimited troubleshooting (genAI)</span>
                            </li>
                            <li class="flex gap-2 items-center">
                                <span class="text-gray-400">•</span>
                                <span>24x7 access to Serwin experts</span>
                            </li>
                            <li class="flex gap-2 items-center">
                                <span class="text-gray-400">•</span>
                                <span>&lt;30 mins response for business critical issues</span>
                            </li>
                            <li class="flex gap-2 items-center">
                                <span class="text-gray-400">•</span>
                                <span>Full set of Trusted Advisor checks</span>
                            </li>
                        </ul>
                    </div>
                </label>
            </div>

            <p class="text-[11px] text-gray-500 max-w-2xl text-center mx-auto">
                By selecting this offer you agree to the offer's <span
                    class="text-[var(--aws-blue)] hover:underline cursor-pointer">terms and conditions</span>.
            </p>
        </div>
    </div>
</template>
