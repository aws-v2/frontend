<script setup lang="ts">
import { ref } from 'vue'
import { useToastStore } from '@/shared/store/toastStore'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/authStore'

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
    <div class="auth-container">
        <div class="w-full max-w-md">
            <div class="auth-card space-y-6">
                <div class="text-center">
                    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Verify identity</h1>
                    <p class="text-sm text-gray-500 mt-2">Enter the code from your authenticator app</p>
                </div>

                <form @submit="handleComplete" class="space-y-6">
                    <div class="flex justify-between gap-2">
                        <input v-for="(digit, i) in 6" :key="i" ref="inputs" v-model="code[i]" type="text" maxlength="1"
                            class="w-12 h-14 border border-gray-300 dark:border-gray-600 rounded-sm text-center text-xl font-bold focus:outline-none focus:ring-1 focus:ring-[var(--aws-blue)] focus:border-[var(--aws-blue)] dark:bg-gray-800 dark:text-white transition-all"
                            @input="onInput(i, $event)" @keydown="onKeyDown(i, $event)">
                    </div>

                    <button type="submit" class="btn-aws-primary w-full py-2.5">
                        Verify
                    </button>

                    <button type="button" @click="handleSkip"
                        class="w-full text-xs text-gray-500 dark:text-gray-400 hover:underline">
                        Skip for now
                    </button>
                </form>

                <div class="pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                        Lost access to your device?
                        <a href="#" class="text-[var(--aws-blue)] font-bold hover:underline ml-1">Use recovery code</a>
                    </p>
                </div>
            </div>

            <div class="mt-8 text-center text-[10px] text-gray-400 uppercase tracking-widest font-medium">
                &copy; 2026 Serwin Technologies or its affiliates.
            </div>
        </div>
    </div>
</template>
