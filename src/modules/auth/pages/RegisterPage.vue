<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/authStore'
import { useToastStore } from '@/shared/store/toastStore'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)

const handleRegister = async (e: Event) => {
    e.preventDefault()

    if (password.value !== confirmPassword.value) {
        toastStore.addToast('Passwords do not match', 'error')
        return
    }

    isLoading.value = true
    try {
        await authStore.register({
            email: email.value,
            password: password.value,
            confirmPassword: confirmPassword.value
        })
        toastStore.addToast('Account created successfully!', 'success')
        router.push('/auth/mfa-setup')
    } catch (error: any) {
        toastStore.addToast(error.response?.data?.message || 'Registration failed', 'error')
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <div class="min-h-[calc(100vh-88px)] flex items-center justify-center p-6 bg-gray-50 dark:bg-transparent">
        <div class="w-full max-w-md">
            <div class="retro-box p-10 space-y-8 bg-white">
                <div class="text-center space-y-2">
                    <h1 class="text-5xl font-black leading-tight">Join <br /> Serwin</h1>
                    <p class="font-mono text-sm opacity-60">initialize_new_user</p>
                </div>

                <form @submit="handleRegister" class="space-y-6">
                    <div>
                        <label class="label-retro">Email Address</label>
                        <input v-model="email" type="email" class="input-retro" placeholder="john@doe.com" required>
                    </div>

                    <div>
                        <label class="label-retro">Password</label>
                        <input v-model="password" type="password" class="input-retro" placeholder="••••••••" required>
                    </div>

                    <div>
                        <label class="label-retro">Confirm Password</label>
                        <input v-model="confirmPassword" type="password" class="input-retro" placeholder="••••••••"
                            required>
                    </div>

                    <div class="flex items-start gap-3 py-2">
                        <input type="checkbox" id="terms"
                            class="w-5 h-5 border-2 border-black rounded-none appearance-none checked:bg-black cursor-pointer"
                            required>
                        <label for="terms" class="text-xs font-medium leading-tight select-none cursor-pointer">
                            I agree to the Serwin Terms & Conditions and Retro Computing Manifesto.
                        </label>
                    </div>

                    <button type="submit" :disabled="isLoading"
                        class="btn-retro-primary w-full py-5 text-xl flex items-center justify-center gap-2">
                        <span v-if="isLoading" class="animate-spin">⟳</span>
                        {{ isLoading ? 'Processing...' : 'Create Account' }}
                    </button>

                    <div class="relative flex items-center py-2">
                        <div class="flex-grow border-t border-black/10 dark:border-white/10"></div>
                        <span
                            class="flex-shrink mx-4 text-[10px] font-mono opacity-40 uppercase tracking-widest">or</span>
                        <div class="flex-grow border-t border-black/10 dark:border-white/10"></div>
                    </div>

                    <button type="button" @click="authStore.loginWithGoogle" class="btn-google">
                        <svg class="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.27.81-.57z" />
                            <path fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Sign up with Google
                    </button>
                </form>

                <div class="pt-6 border-t-2 border-black/10 text-center">
                    <p class="text-sm font-medium">
                        Already have an account?
                        <router-link to="/login" class="font-black hover:underline ml-1">Sign In</router-link>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
input[type="checkbox"]:checked {
    background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
}
</style>
