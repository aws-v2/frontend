<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/authStore'
import { useToastStore } from '@/shared/store/toastStore'
import PublicNavbar from '@/shared/components/PublicNavbar.vue'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

type SetupStep = 'choice' | 'app-verify'
const currentStep = ref<SetupStep>('choice')
const isLoading = ref(false)

// Form states
const otpCode = ref('')
const qrCode = ref('')
const appSecret = ref('')

const handleSkip = () => {
    toastStore.addToast('MFA setup skipped. You can enable it later in settings.', 'info')

    // Redirect based on whether they've already completed the full registration/payment flow
    if (authStore.registrationComplete) {
        router.push('/dashboard')
    } else {
        // First-time registration flow
        router.push('/auth/payment-method')
    }
}

const startAppSetup = async () => {
    isLoading.value = true
    try {
        const data = await authStore.enableMfa()
        qrCode.value = data.qrCode
        appSecret.value = data.secret
        currentStep.value = 'app-verify'
    } catch (e) {
        toastStore.addToast('Failed to initialize MFA setup', 'error')
    } finally {
        isLoading.value = false
    }
}

const verifyApp = async () => {
    if (!otpCode.value) return
    isLoading.value = true
    try {
        await authStore.verifyMfa(otpCode.value)
        toastStore.addToast('Authenticator App enabled successfully', 'success')

        // Sync registration status after MFA verification as well
        if (authStore.registrationComplete) {
            router.push('/dashboard')
        } else {
            router.push('/auth/payment-method')
        }
    } catch (e) {
        toastStore.addToast('Invalid verification code', 'error')
    } finally {
        isLoading.value = false
    }
}

const goBack = () => {
    currentStep.value = 'choice'
    otpCode.value = ''
    qrCode.value = ''
    appSecret.value = ''
}
</script>

<template>
    <div class="min-h-screen bg-white text-[#16191f] font-urbanist flex flex-col">
        <PublicNavbar />

        <!-- Spacer for fixed navbar -->
        <div class="h-20"></div>

        <main class="flex-1 flex items-center justify-center p-6 bg-[#fafafa]">
            <div class="w-full max-w-md">
                <!-- Main Card -->
                <div class="bg-white border-2 border-[#232f3e] p-10 relative">
                    <!-- Accent Bar -->
                    <div class="absolute top-0 left-0 w-full h-1 bg-[#ff9900]"></div>

                    <div class="mb-10 text-center">
                        <div
                            class="inline-block px-3 py-1 bg-[#232f3e] text-[#ff9900] text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                            Security Layer
                        </div>
                        <h1 class="text-4xl font-black text-[#232f3e] tracking-tighter mb-4">Secure Access</h1>
                        <p class="text-[#545b64] font-medium leading-relaxed">
                            Protect your account with multi-factor authentication.
                        </p>
                    </div>

                    <!-- Step 1: Choice -->
                    <div v-if="currentStep === 'choice'" class="space-y-6">
                        <button @click="startAppSetup" :disabled="isLoading"
                            class="w-full text-left p-6 border-2 border-[#eaeded] hover:border-[#232f3e] transition-all group relative overflow-hidden">
                            <div class="flex items-center gap-6 relative z-10">
                                <div
                                    class="w-14 h-14 bg-[#232f3e] flex items-center justify-center text-[#ff9900] flex-shrink-0 group-hover:scale-110 transition-transform">
                                    <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div class="flex-1">
                                    <h3 class="font-black text-[#232f3e] text-lg uppercase tracking-tight">Authenticator
                                        App</h3>
                                    <p class="text-sm text-[#545b64] font-medium mt-1">Google Authenticator, Authy, or
                                        Microsoft.</p>
                                </div>
                                <svg class="w-6 h-6 text-[#eaeded] group-hover:text-[#ff9900] transition-colors"
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                        d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </button>

                        <button @click="handleSkip"
                            class="w-full py-4 text-xs font-black text-[#879196] hover:text-[#232f3e] uppercase tracking-widest border-t-2 border-dashed border-[#eaeded] mt-8 transition-colors">
                            Skip for now (Not Recommended)
                        </button>
                    </div>

                    <!-- Step 2: Verification -->
                    <div v-else-if="currentStep === 'app-verify'" class="space-y-8">
                        <!-- QR Display -->
                        <div class="border-2 border-[#232f3e] p-4 bg-white mx-auto w-max relative">
                            <div v-if="qrCode" class="w-48 h-48">
                                <img :src="qrCode" alt="MFA QR Code" class="w-full h-full object-contain" />
                            </div>
                            <div v-else class="w-48 h-48 flex items-center justify-center">
                                <div class="w-10 h-10 border-4 border-[#ff9900] border-t-transparent animate-spin">
                                </div>
                            </div>
                        </div>

                        <div class="text-center space-y-6">
                            <div class="space-y-4">
                                <p class="text-[#232f3e] font-black uppercase text-xs tracking-widest">1. Scan with your
                                    app</p>
                                <div class="bg-[#fafafa] p-4 border-2 border-[#eaeded]">
                                    <span
                                        class="text-[9px] text-[#879196] uppercase tracking-widest font-black block mb-2">Manual
                                        Entry Key</span>
                                    <code class="text-sm font-mono font-bold text-[#232f3e] break-all">
                                        {{ appSecret || '•••• •••• •••• ••••' }}
                                    </code>
                                </div>
                            </div>

                            <div class="space-y-4">
                                <p class="text-[#232f3e] font-black uppercase text-xs tracking-widest">2. Enter 6-digit
                                    code</p>
                                <input v-model="otpCode" type="text" maxlength="6"
                                    class="w-full bg-white border-2 border-[#232f3e] px-4 py-5 text-center text-4xl font-mono font-black tracking-[0.4em] text-[#232f3e] focus:ring-0 focus:border-[#ff9900] transition-all placeholder-[#eaeded]"
                                    placeholder="000000" autofocus>
                            </div>
                        </div>

                        <div class="flex flex-col gap-4">
                            <button @click="verifyApp" :disabled="isLoading || otpCode.length < 6"
                                class="w-full py-5 bg-[#232f3e] text-white font-black uppercase tracking-widest hover:bg-[#ff9900] transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:grayscale disabled:transform-none">
                                {{ isLoading ? 'Verifying...' : 'Enable MFA' }}
                            </button>
                            <button @click="goBack"
                                class="text-[10px] font-black text-[#545b64] hover:text-[#232f3e] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                        d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to choice
                            </button>
                        </div>
                    </div>
                </div>

                <div class="text-center mt-8 text-[10px] text-[#879196] font-black uppercase tracking-widest">
                    Secure Session ID: <span class="text-[#232f3e]">84F1-A92B</span>
                </div>
            </div>
        </main>
    </div>
</template>

<style scoped>
/* No extra styles needed, using Tailwind */
</style>
