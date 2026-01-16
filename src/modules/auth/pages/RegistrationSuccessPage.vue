<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/authStore'

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
    authStore.completeRegistration()
})

const goToConsole = () => {
    router.push('/dashboard')
}
</script>

<template>
    <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
        <div class="max-w-2xl w-full bg-white rounded-sm shadow-sm border border-gray-200 p-12 text-center">
            <div class="w-20 h-20 bg-green-100 flex items-center justify-center rounded-full mx-auto mb-8">
                <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
            </div>

            <h1 class="text-3xl font-black text-gray-900 mb-4">Congratulations!</h1>
            <p class="text-lg text-gray-600 mb-8">
                Your Serwin Web Services account has been successfully created. You now have access to the full suite of
                Serwin services.
            </p>

            <div class="bg-blue-50 border-l-4 border-[var(--aws-blue)] p-6 mb-12 text-left">
                <h3 class="font-bold text-[var(--aws-blue)] mb-2">What's next?</h3>
                <ul class="text-sm text-gray-600 space-y-2">
                    <li>• Explore the Management Console</li>
                    <li>• Check your email for a welcome message and getting started guide</li>
                    <li>• Visit the Documentation for tutorials and resources</li>
                </ul>
            </div>

            <button @click="goToConsole"
                class="px-10 py-3 bg-[var(--aws-orange)] text-white font-bold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-orange-500/20">
                Go to the Management Console
            </button>

            <p class="mt-8 text-xs text-gray-400 uppercase tracking-widest font-medium">
                &copy; 2026 Serwin Technologies or its affiliates.
            </p>
        </div>
    </div>
</template>
