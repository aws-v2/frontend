<script setup lang="ts">
import { ref } from 'vue'
import { useToastStore } from '@/shared/store/toastStore'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/authStore'
import PublicNavbar from '@/shared/components/PublicNavbar.vue'

const toastStore = useToastStore()
const authStore = useAuthStore()
const router = useRouter()
const code = ref(['', '', '', '', '', ''])
const inputs = ref<HTMLInputElement[]>([])
const isLoading = ref(false)

const handleComplete = async (e: Event) => {
    e.preventDefault()
    const fullCode = code.value.join('')
    if (fullCode.length < 6) return

    isLoading.value = true
    try {
        await authStore.verifyMfa(fullCode)
        toastStore.addToast('MFA verification successful!', 'success')
        router.push('/dashboard')
    } catch (error) {
        toastStore.addToast('Invalid verification code', 'error')
    } finally {
        isLoading.value = false
    }
}

const handleSkip = () => {
    // Use the store method to clear MFA required flag and persist state
    authStore.skipMfa()
    toastStore.addToast('MFA skipped for now.', 'info')
    router.push('/dashboard')
}

const onInput = (index: number, e: Event) => {
    const val = (e.target as HTMLInputElement).value
    if (val && index < 5) {
        const next = inputs.value[index + 1]
        if (next) next.focus()
    }
}

const onKeyDown = (index: number, e: KeyboardEvent) => {
    if (e.key === 'Backspace' && !code.value[index] && index > 0) {
        const prev = inputs.value[index - 1]
        if (prev) prev.focus()
    }
}
</script>

<template>
    <div
        class="min-h-screen flex flex-col bg-white text-[#16191f] font-urbanist selection:bg-[#ff9900]/30 selection:text-[#16191f]">

        <PublicNavbar buttonText="Log in" buttonLink="/login" />

        <!-- Spacer for fixed navbar -->
        <div class="h-20"></div>

        <main class="flex-1 flex items-center justify-center p-6 bg-[#fafafa]">
            <div class="w-full max-w-md">
                <!-- MFA Card - Flat & Sharp -->
                <div class="bg-white border-2 border-[#232f3e] p-10 shadow-none">
                    <div class="mb-10 text-left">
                        <h2 class="text-3xl font-black text-[#232f3e] mb-4 tracking-tighter uppercase">Verify identity
                        </h2>
                        <div class="w-12 h-2 bg-[#ff9900]"></div>
                        <p class="text-sm font-bold text-[#545b64] mt-6">Enter the code from your authenticator app</p>
                    </div>

                    <form @submit="handleComplete" class="space-y-8">
                        <div class="flex justify-between gap-2">
                            <input v-for="(digit, i) in 6" :key="i" ref="inputs" v-model="code[i]" type="text"
                                maxlength="1"
                                class="w-12 h-14 bg-white border-2 border-[#eaeded] text-[#16191f] text-center text-xl font-bold focus:outline-none focus:border-[#ff9900] transition-all rounded-none"
                                @input="onInput(i, $event)" @keydown="onKeyDown(i, $event)">
                        </div>

                        <button type="submit" :disabled="isLoading"
                            class="w-full bg-[#ff9900] hover:bg-[#ec7211] text-white font-black py-4 transition-all rounded-none uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed">
                            <span v-if="isLoading">Verifying...</span>
                            <span v-else>Verify & Continue</span>
                        </button>

                        <button type="button" @click="handleSkip"
                            class="w-full text-xs font-bold text-[#0073bb] hover:text-[#ff9900] transition-colors uppercase tracking-widest">
                            Skip for now
                        </button>
                    </form>

                    <div class="mt-8 pt-8 border-t border-[#eaeded] text-center">
                        <p class="text-sm font-bold text-[#545b64]">
                            Lost access to your device?
                            <a href="#"
                                class="text-[#0073bb] hover:text-[#ff9900] transition-colors underline decoration-2 underline-offset-4 ml-1">
                                Use recovery code
                            </a>
                        </p>
                    </div>
                </div>

                <div class="mt-8 text-center text-[10px] text-[#879196] font-black uppercase tracking-[0.2em]">
                    &copy; 2026 SERWIN SYSTEMS INC.
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
</style>
