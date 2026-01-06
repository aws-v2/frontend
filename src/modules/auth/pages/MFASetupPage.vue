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
const phoneNumber = ref('')
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
    <div class="auth-container">
        <div class="w-full max-w-2xl">
            <div class="auth-card space-y-8">
                <!-- Header -->
                <div class="text-center">
                    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Secure your account</h1>
                    <p class="text-sm text-gray-500 mt-2">Add an extra layer of security with MFA</p>
                </div>

                <!-- Choice Step -->
                <div v-if="currentStep === 'choice'" class="space-y-6">
                    <p class="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md mx-auto leading-relaxed">
                        To help keep your account secure, we require Multi-Factor Authentication. Please choose a method
                        to get started.
                    </p>

                    <div class="grid grid-cols-1 gap-4">
                        <button @click="startAppSetup"
                            class="flex items-center gap-4 p-6 border border-gray-200 dark:border-gray-700 hover:border-[var(--aws-blue)] dark:hover:border-[var(--aws-blue)] transition-all group text-left rounded-sm">
                            <div
                                class="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center rounded-full text-[var(--aws-blue)] group-hover:bg-[var(--aws-blue)] group-hover:text-white transition-colors text-2xl font-bold">
                                📱
                            </div>
                            <div>
                                <h3 class="text-sm font-bold text-gray-900 dark:text-white">Authenticator app</h3>
                                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Use an app like Google
                                    Authenticator or Authy to generate codes.</p>
                            </div>
                            <div
                                class="ml-auto text-[var(--aws-blue)] opacity-0 group-hover:opacity-100 transition-opacity">
                                →</div>
                        </button>
                    </div>

                    <div class="pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
                        <button @click="handleSkip"
                            class="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:underline">
                            Skip for now (not recommended)
                        </button>
                    </div>
                </div>

                <!-- App Verify Step -->
                <div v-else-if="currentStep === 'app-verify'" class="space-y-8">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <div
                            class="border border-gray-200 dark:border-gray-700 p-4 bg-white flex items-center justify-center rounded-sm shadow-sm self-start">
                            <!-- Real QR Code -->
                            <div v-if="qrCode" class="w-48 h-48 flex items-center justify-center">
                                <img :src="qrCode" alt="MFA QR Code" class="w-full h-full object-contain" />
                            </div>
                            <!-- Loading Placeholder -->
                            <div v-else
                                class="w-48 h-48 bg-gray-50 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 p-4 text-center">
                                <span class="text-[10px] text-gray-300 font-bold uppercase mb-2">Generating QR...</span>
                                <div class="grid grid-cols-4 gap-1 opacity-10">
                                    <div v-for="i in 16" :key="i" class="w-6 h-6 bg-black"></div>
                                </div>
                            </div>
                        </div>
                        <div class="space-y-4">
                            <h3 class="text-sm font-bold text-gray-900 dark:text-white">Setup Instructions:</h3>
                            <ol class="text-xs space-y-3 text-gray-400 leading-relaxed list-decimal pl-4">
                                <li>Open your authenticator app.</li>
                                <li>Scan the QR code or enter the secret manually.</li>
                                <li>Enter the 6-digit code to confirm activation.</li>
                            </ol>
                            <div
                                class="p-3 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-sm">
                                <p class="text-[10px] text-gray-400 uppercase font-bold mb-1">Manual Secret</p>
                                <code
                                    class="text-xs font-mono font-bold text-gray-900 dark:text-gray-100 break-all block">{{ appSecret || '•••• •••• •••• ••••' }}</code>
                            </div>
                        </div>
                    </div>

                    <div class="max-w-xs mx-auto space-y-4 pt-4">
                        <div class="text-center">
                            <label class="aws-label">Verification code</label>
                            <input v-model="otpCode" type="text" maxlength="6"
                                class="w-full bg-[#16191f] text-white border-none rounded-sm px-4 py-4 text-center text-4xl font-bold tracking-[0.4em] focus:ring-2 focus:ring-[var(--aws-blue)] transition-all"
                                placeholder="000000">
                        </div>
                        <button @click="verifyApp" :disabled="isLoading || otpCode.length < 6"
                            class="btn-aws-primary w-full py-3.5 text-base shadow-lg shadow-orange-500/10">
                            {{ isLoading ? 'Activating...' : 'Activate MFA' }}
                        </button>
                    </div>

                    <div class="text-center">
                        <button @click="goBack" class="text-xs text-[var(--aws-blue)] hover:underline">← Change
                            method</button>
                    </div>
                </div>
            </div>

            <div class="mt-8 text-center text-[10px] text-gray-400 uppercase tracking-widest font-medium">
                &copy; 2026 Serwin Technologies or its affiliates.
            </div>
        </div>
    </div>
</template>
