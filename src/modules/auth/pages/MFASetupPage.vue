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
const appSecret = 'JBSW Y3DP EHPK 3PXP' // Mock secret

const handleSkip = () => {
    toastStore.addToast('MFA setup skipped. You can enable it later in settings.', 'success')
    router.push('/dashboard')
}

const startSmsSetup = () => {
    currentStep.value = 'sms-input'
}

const startAppSetup = () => {
    currentStep.value = 'app-verify'
}

const sendOtp = async () => {
    if (!phoneNumber.value) return
    isLoading.value = true
    try {
        await authStore.sendSmsOtp(phoneNumber.value)
        currentStep.value = 'sms-verify'
        toastStore.addToast('OTP sent to your device', 'success')
    } catch (e) {
        toastStore.addToast('Failed to send OTP', 'error')
    } finally {
        isLoading.value = false
    }
}

const verifySms = async () => {
    if (!otpCode.value) return
    isLoading.value = true
    try {
        await authStore.verifySmsOtp(otpCode.value)
        toastStore.addToast('SMS MFA enabled successfully', 'success')
        router.push('/dashboard')
    } catch (e) {
        toastStore.addToast('Invalid OTP code', 'error')
    } finally {
        isLoading.value = false
    }
}

const verifyApp = async () => {
    if (!otpCode.value) return
    isLoading.value = true
    try {
        await authStore.verifyAppOtp(otpCode.value)
        toastStore.addToast('Authenticator App enabled successfully', 'success')
        router.push('/dashboard')
    } catch (e) {
        toastStore.addToast('Invalid verification code', 'error')
    } finally {
        isLoading.value = false
    }
}

const goBack = () => {
    currentStep.value = 'choice'
    otpCode.value = ''
}
</script>

<template>
    <div class="min-h-[calc(100vh-88px)] flex items-center justify-center p-6 bg-gray-50 dark:bg-transparent">
        <div class="w-full max-w-2xl">
            <div class="retro-box p-10 space-y-8 bg-white">

                <!-- Header -->
                <div class="text-center space-y-2">
                    <h1 class="text-5xl font-black">Security</h1>
                    <p class="font-mono text-sm opacity-60">mfa_initialization_sequence</p>
                </div>

                <!-- Choice Step -->
                <div v-if="currentStep === 'choice'" class="space-y-8">
                    <p class="text-center font-medium max-w-md mx-auto">
                        Enhance your account security by enabling Multi-Factor Authentication. Choose your preferred
                        method:
                    </p>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button @click="startAppSetup"
                            class="retro-box p-8 text-left hover:bg-black hover:text-white transition-colors group">
                            <div class="text-2xl mb-2 font-black">Authenticator App</div>
                            <p class="text-xs opacity-60 font-mono">Use Google Authenticator or Authy to generate secure
                                codes.</p>
                            <div class="mt-4 text-sm font-bold border-b-2 border-current inline-block">Select Method →
                            </div>
                        </button>

                        <button @click="startSmsSetup"
                            class="retro-box p-8 text-left hover:bg-black hover:text-white transition-colors group">
                            <div class="text-2xl mb-2 font-black">SMS Mobile</div>
                            <p class="text-xs opacity-60 font-mono">Receive a one-time security code via text message.
                            </p>
                            <div class="mt-4 text-sm font-bold border-b-2 border-current inline-block">Select Method →
                            </div>
                        </button>
                    </div>

                    <div class="pt-6 border-t-2 border-black/10 text-center">
                        <button @click="handleSkip"
                            class="font-mono text-xs uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
                            [ Skip for now ]
                        </button>
                    </div>
                </div>

                <!-- SMS Input Step -->
                <div v-else-if="currentStep === 'sms-input'" class="space-y-6">
                    <div class="space-y-4">
                        <label class="label-retro">Enter Phone Number</label>
                        <div class="flex gap-4">
                            <input v-model="phoneNumber" type="tel" class="input-retro flex-1"
                                placeholder="+1 (555) 000-0000">
                            <button @click="sendOtp" :disabled="isLoading || !phoneNumber"
                                class="btn-retro-primary px-8">
                                {{ isLoading ? '...' : 'Send OTP' }}
                            </button>
                        </div>
                        <p class="text-[10px] uppercase font-bold opacity-40">Standard data rates may apply</p>
                    </div>
                    <button @click="goBack" class="text-sm font-bold hover:underline">← Change Method</button>
                </div>

                <!-- SMS Verify Step -->
                <div v-else-if="currentStep === 'sms-verify'" class="space-y-6 text-center">
                    <div class="retro-box bg-black text-white p-6 font-mono text-xs uppercase tracking-widest mb-6">
                        Verification code dispatched to <br />
                        <span class="underline">{{ phoneNumber }}</span>
                    </div>
                    <div class="max-w-xs mx-auto space-y-4">
                        <label class="label-retro block text-left">Enter 6-Digit Code</label>
                        <input v-model="otpCode" type="text" maxlength="6"
                            class="input-retro text-center text-2xl tracking-[1em]" placeholder="000000">
                        <button @click="verifySms" :disabled="isLoading || otpCode.length < 6"
                            class="btn-retro-primary w-full py-4 text-xl">
                            {{ isLoading ? 'Verifying...' : 'Enable SMS MFA' }}
                        </button>
                    </div>
                    <button @click="goBack" class="text-sm font-bold hover:underline">← Back</button>
                </div>

                <!-- App Verify Step -->
                <div v-else-if="currentStep === 'app-verify'" class="space-y-8">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div class="retro-box p-4 bg-white flex items-center justify-center">
                            <!-- Placeholder QR Code -->
                            <div
                                class="w-48 h-48 bg-gray-100 border-2 border-dashed border-black flex flex-col items-center justify-center p-4 text-center">
                                <span class="font-mono text-[10px] uppercase font-bold text-black/20 mb-2">Authenticator
                                    QR</span>
                                <div class="grid grid-cols-4 gap-1 opacity-20">
                                    <div v-for="i in 16" :key="i" class="w-6 h-6 bg-black"></div>
                                </div>
                            </div>
                        </div>
                        <div class="space-y-4">
                            <p class="text-sm font-bold uppercase tracking-tight">Setup Instructions:</p>
                            <ol class="text-xs space-y-2 list-decimal pl-4 font-mono opacity-70">
                                <li>Install Google Authenticator or Authy.</li>
                                <li>Scan the QR code or enter the secret manually.</li>
                                <li>Enter the 6-digit code below to confirm.</li>
                            </ol>
                            <div class="p-3 bg-gray-50 border-2 border-black font-mono text-[10px]">
                                SECRET: <span class="font-bold">{{ appSecret }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="max-w-xs mx-auto space-y-4">
                        <label class="label-retro block text-left">Verification Code</label>
                        <input v-model="otpCode" type="text" maxlength="6"
                            class="input-retro text-center text-2xl tracking-[1em]" placeholder="000000">
                        <button @click="verifyApp" :disabled="isLoading || otpCode.length < 6"
                            class="btn-retro-primary w-full py-4 text-xl">
                            {{ isLoading ? 'Activating...' : 'Enable App MFA' }}
                        </button>
                    </div>

                    <div class="text-center">
                        <button @click="goBack" class="text-sm font-bold hover:underline">← Change Method</button>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>
