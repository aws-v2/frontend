<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/authStore'
import { useToastStore } from '@/shared/store/toastStore'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

type SetupStep = 'choice' | 'sms-input' | 'sms-verify' | 'app-verify'
const currentStep = ref<SetupStep>('choice')
const isLoading = ref(false)

// Form states
const otpCode = ref('')
const qrCode = ref('')
const appSecret = ref('')

const handleSkip = () => {
    toastStore.addToast('MFA setup skipped. You can enable it later in settings.', 'info')
    router.push('/auth/payment-method')
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
        router.push('/auth/payment-method')
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
    <div class="min-h-screen bg-[#05080F] relative overflow-hidden font-sans flex items-center justify-center p-6">
        <!-- Ambient Background -->
        <div class="absolute inset-0 pointer-events-none">
            <div
                class="absolute top-[20%] left-[20%] w-[60vw] h-[60vw] bg-indigo-600/10 rounded-full blur-[120px] opacity-20">
            </div>
            <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]">
            </div>
        </div>

        <div class="relative z-10 w-full max-w-lg">
            <!-- Header Logo -->
            <div class="flex justify-center mb-8">
                <div class="flex items-center gap-3">
                    <div
                        class="w-10 h-10 relative flex items-center justify-center bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-indigo-500/10">
                        <div class="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20"></div>
                        <span class="font-bold font-display text-white text-lg">S</span>
                    </div>
                </div>
            </div>

            <div class="glass-panel p-10 rounded-3xl border-t border-t-white/10 relative overflow-hidden">
                <!-- Top Highlight -->
                <div
                    class="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent">
                </div>

                <div class="text-center mb-10">
                    <h1 class="text-3xl font-bold text-white mb-3 font-display">Secure Access</h1>
                    <p class="text-slate-400 text-sm leading-relaxed">Enhance your account security with multi-factor
                        authentication.</p>
                </div>

                <!-- Step 1: Choice -->
                <div v-if="currentStep === 'choice'" class="space-y-6">
                    <button @click="startAppSetup"
                        class="w-full group relative overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/50 rounded-2xl p-6 transition-all duration-300 text-left">
                        <div class="flex items-center gap-5 relative z-10">
                            <div
                                class="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div class="flex-1">
                                <h3 class="font-bold text-white text-base">Authenticator App</h3>
                                <p class="text-xs text-slate-400 mt-1">Google Authenticator, Authy, or similar.</p>
                            </div>
                            <div
                                class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </button>

                    <button @click="handleSkip"
                        class="w-full text-center text-xs text-slate-500 hover:text-white transition-colors mt-8">
                        Skip for now (Not Recommended)
                    </button>
                </div>

                <!-- Step 2: Verification -->
                <div v-else-if="currentStep === 'app-verify'" class="space-y-8">

                    <!-- QR Display -->
                    <div class="bg-white p-4 rounded-xl mx-auto w-max shadow-2xl shadow-white/5">
                        <div v-if="qrCode" class="w-48 h-48">
                            <img :src="qrCode" alt="MFA QR Code" class="w-full h-full object-contain" />
                        </div>
                        <div v-else class="w-48 h-48 flex items-center justify-center text-black">
                            <svg class="w-8 h-8 animate-spin text-slate-300" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                </path>
                            </svg>
                        </div>
                    </div>

                    <div class="text-center space-y-4">
                        <div class="space-y-2">
                            <p class="text-sm text-slate-300">Scan this code with your authenticator app</p>
                            <div class="flex items-center justify-center gap-2">
                                <span class="text-xs text-slate-500 uppercase tracking-wider">Secret:</span>
                                <code
                                    class="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">{{ appSecret || 'Loading...' }}</code>
                            </div>
                        </div>

                        <div class="pt-4">
                            <input v-model="otpCode" type="text" maxlength="6"
                                class="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-center text-3xl font-mono font-bold tracking-[0.5em] text-white focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-white/10"
                                placeholder="000000" autofocus>
                        </div>
                    </div>

                    <div class="flex flex-col gap-4">
                        <button @click="verifyApp" :disabled="isLoading || otpCode.length < 6"
                            class="btn-primary w-full py-4 text-sm font-bold bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
                            {{ isLoading ? 'Verifying...' : 'Verify Code' }}
                        </button>
                        <button @click="goBack" class="text-xs text-slate-500 hover:text-white transition-colors">
                            ← Choose different method
                        </button>
                    </div>
                </div>

            </div>

            <div class="text-center mt-8 text-[10px] text-slate-600 uppercase tracking-widest font-mono">
                Encrypted Session ID: <span class="text-indigo-900/50">84F1-A92B</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.glass-panel {
    @apply bg-[#0B0F19]/80 backdrop-blur-2xl border border-white/5 shadow-2xl;
}

.btn-primary {
    @apply rounded-xl transition-all duration-200 transform active:scale-95;
}
</style>
