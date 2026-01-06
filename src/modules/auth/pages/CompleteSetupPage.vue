<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const proceedToSupportPlan = () => {
    router.push('/auth/support-plan')
}
</script>

<template>
    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
        <div class="max-w-3xl w-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div class="p-8">
                <h1 class="text-2xl font-bold text-gray-900 mb-2">Complete your account setup</h1>
                <p class="text-sm text-gray-600 mb-8">
                    Thanks for signing up for Serwin Web Services. If we have directed you to this page, then you have
                    <span class="font-bold text-gray-900">either not finished registering, or your account is currently
                        on free plan.</span>
                </p>

                <div class="mb-10">
                    <h2 class="text-lg font-bold text-gray-900 mb-4">Account setup checklist</h2>
                    <ol class="space-y-4 text-sm text-gray-700">
                        <li class="flex gap-3">
                            <span class="font-bold text-gray-900 shrink-0">1.</span>
                            <span>Provided all required information during sign-up. This includes adding a payment
                                method, completing identity verification, and selecting a support plan.</span>
                        </li>
                        <li class="flex gap-3">
                            <span class="font-bold text-gray-900 shrink-0">2.</span>
                            <span>Responded to any additional information we have requested by email. Check your spam
                                and junk email folders to make sure you have not missed any such requests.</span>
                        </li>
                        <li class="flex gap-3">
                            <span class="font-bold text-gray-900 shrink-0">3.</span>
                            <span>Verified your <span
                                    class="text-[var(--aws-blue)] hover:underline cursor-pointer">credit card
                                    information</span>. We might temporarily hold up to $1 USD (or an equivalent amount
                                in local currency) as a pending transaction for 3-5 days to verify your identity. This
                                is an authorization, and you might need to contact your card issuer to approve
                                it.</span>
                        </li>
                    </ol>
                </div>

                <p class="text-sm text-gray-600 mb-6 italic">
                    It might take up to 24 hours to fully activate your Serwin services. If you can't access your
                    services after that time,
                    <span class="text-[var(--aws-blue)] hover:underline cursor-pointer">contact support</span>.
                </p>

                <button @click="proceedToSupportPlan"
                    class="px-8 py-2 border-2 border-[var(--aws-blue)] text-[var(--aws-blue)] font-bold rounded-full hover:bg-[var(--aws-blue)]/5 transition-colors mb-12">
                    Complete your Serwin registration
                </button>

                <div class="border-t border-gray-100 pt-8">
                    <h2 class="text-lg font-bold text-gray-900 mb-2">Free account plan access limitations</h2>
                    <p class="text-sm text-gray-600 mb-6">Free account plans have limited access to certain services and
                        features. Upgrade your account plan to remove limitations. <span
                            class="text-[var(--aws-blue)] hover:underline cursor-pointer inline-flex items-center gap-1">Learn
                            more <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg></span></p>

                    <button
                        class="px-8 py-2 border-2 border-[var(--aws-blue)] text-[var(--aws-blue)] font-bold rounded-full hover:bg-[var(--aws-blue)]/5 transition-colors">
                        Upgrade plan
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
