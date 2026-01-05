<script setup lang="ts">
import { ref } from 'vue'
import { useToastStore } from '@/shared/store/toastStore'
import { useRouter } from 'vue-router'

const toastStore = useToastStore()
const router = useRouter()
const code = ref(['', '', '', '', '', ''])
const inputs = ref<HTMLInputElement[]>([])

const handleComplete = (e: Event) => {
    e.preventDefault()
    toastStore.addToast('MFA verification successful!', 'success')
    router.push('/dashboard')
}

const handleSkip = () => {
    toastStore.addToast('MFA skipped for now.', 'error')
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
    <div class="min-h-[calc(100vh-88px)] flex items-center justify-center p-6 bg-gray-50 dark:bg-transparent">
        <div class="w-full max-w-md">
            <div class="retro-box p-10 space-y-8 bg-white">
                <div class="text-center space-y-2">
                    <h1 class="text-5xl font-black">Security</h1>
                    <p class="font-mono text-sm opacity-60">mfa_challenge_required</p>
                </div>

                <div class="space-y-6">
                    <p class="text-sm font-medium leading-relaxed opacity-70 text-center">
                        Enter the 6-digit code from your authenticator app to authorize this session.
                    </p>

                    <form @submit="handleComplete" class="space-y-8">
                        <div class="flex justify-between gap-2">
                            <input v-for="(digit, i) in 6" :key="i" ref="inputs" v-model="code[i]" type="text"
                                maxlength="1"
                                class="w-12 h-16 border-2 border-black text-center text-2xl font-black selection:bg-transparent focus:outline-none focus:bg-gray-50"
                                @input="onInput(i, $event)" @keydown="onKeyDown(i, $event)">
                        </div>

                        <button type="submit" class="btn-retro-primary w-full py-5 text-xl">
                            Verify Code
                        </button>

                        <button type="button" @click="handleSkip"
                            class="w-full text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 hover:underline">
                            Skip for now
                        </button>
                    </form>
                </div>

                <div class="pt-6 border-t-2 border-black/10 text-center">
                    <p class="text-sm font-medium">
                        Lost your device?
                        <a href="#" class="font-black hover:underline ml-1">Use Recovery Code</a>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>
