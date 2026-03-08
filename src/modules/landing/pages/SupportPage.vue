<script setup lang="ts">
import { ref } from 'vue'
import PublicNavbar from '@/shared/components/PublicNavbar.vue'
import { useToastStore } from '@/shared/store/toastStore'

const toastStore = useToastStore()
const name = ref('')
const email = ref('')
const message = ref('')
const isSubmitting = ref(false)

const handleSubmit = () => {
    isSubmitting.value = true
    setTimeout(() => {
        toastStore.addToast('Message sent! Our support team will contact you soon.', 'success')
        name.value = ''
        email.value = ''
        message.value = ''
        isSubmitting.value = false
    }, 1000)
}
</script>

<template>
    <div class="min-h-screen bg-white text-[#16191f] font-urbanist selection:bg-[#ff9900]/30 selection:text-[#16191f]">
        <PublicNavbar />

        <!-- Spacer for fixed navbar -->
        <div class="h-20"></div>

        <main class="max-w-6xl mx-auto px-6 py-20">
            <div class="grid lg:grid-cols-2 gap-16 items-start">

                <!-- Left Column: Contact Info -->
                <div class="space-y-12">
                    <div class="space-y-6">
                        <div class="w-12 h-2 bg-[#ff9900]"></div>
                        <h1 class="text-5xl font-black text-[#232f3e] uppercase tracking-tighter leading-[0.9]">
                            Customer<br />Support
                        </h1>
                        <p class="text-[#545b64] font-bold text-sm leading-relaxed max-w-md">
                            Our team of cloud experts is standing by to help you scale your infrastructure and solve
                            technical challenges.
                        </p>
                    </div>

                    <div class="space-y-8">
                        <div class="flex items-start gap-6">
                            <div
                                class="w-12 h-12 bg-[#fafafa] border-2 border-[#232f3e] flex items-center justify-center text-[#232f3e]">
                                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <div>
                                <h3 class="text-xs font-black text-[#ff9900] uppercase tracking-widest mb-1">Phone</h3>
                                <p
                                    class="text-2xl font-black text-[#232f3e] tracking-tight text-white mix-blend-difference">
                                    +254 704 847 676</p>
                            </div>
                        </div>

                        <div class="flex items-start gap-6">
                            <div
                                class="w-12 h-12 bg-[#fafafa] border-2 border-[#232f3e] flex items-center justify-center text-[#232f3e]">
                                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 class="text-xs font-black text-[#ff9900] uppercase tracking-widest mb-1">Email</h3>
                                <p class="text-2xl font-black text-[#232f3e] tracking-tight">emqarani@gmail.com</p>
                            </div>
                        </div>

                        <div class="flex items-start gap-6">
                            <div
                                class="w-12 h-12 bg-[#fafafa] border-2 border-[#232f3e] flex items-center justify-center text-[#232f3e]">
                                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 class="text-xs font-black text-[#ff9900] uppercase tracking-widest mb-1">HQ</h3>
                                <p class="text-2xl font-black text-[#232f3e] tracking-tight uppercase">Silicon Valley,
                                    CA</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right Column: Form -->
                <div class="bg-white border-2 border-[#232f3e] p-10 shadow-none">
                    <h2
                        class="text-2xl font-black text-[#232f3e] uppercase tracking-tighter mb-8 border-b-2 border-[#eaeded] pb-6">
                        Send Message</h2>
                    <form @submit.prevent="handleSubmit" class="space-y-8">
                        <div class="space-y-3">
                            <label class="text-[10px] font-black text-[#545b64] uppercase tracking-widest px-1">Full
                                Name</label>
                            <input v-model="name" type="text"
                                class="w-full bg-white border-2 border-[#eaeded] px-5 py-4 text-[#16191f] font-bold placeholder-[#879196] focus:outline-none focus:border-[#ff9900] transition-all rounded-none"
                                placeholder="ALEXANDER PIERCE" required>
                        </div>

                        <div class="space-y-3">
                            <label class="text-[10px] font-black text-[#545b64] uppercase tracking-widest px-1">Enquiry
                                Email</label>
                            <input v-model="email" type="email"
                                class="w-full bg-white border-2 border-[#eaeded] px-5 py-4 text-[#16191f] font-bold placeholder-[#879196] focus:outline-none focus:border-[#ff9900] transition-all rounded-none"
                                placeholder="name@company.com" required>
                        </div>

                        <div class="space-y-3">
                            <label class="text-[10px] font-black text-[#545b64] uppercase tracking-widest px-1">Message
                                Detail</label>
                            <textarea v-model="message" rows="5"
                                class="w-full bg-white border-2 border-[#eaeded] px-5 py-4 text-[#16191f] font-bold placeholder-[#879196] focus:outline-none focus:border-[#ff9900] transition-all rounded-none resize-none"
                                placeholder="HOW CAN WE HELP YOU?" required></textarea>
                        </div>

                        <button type="submit" :disabled="isSubmitting"
                            class="w-full px-16 py-6 bg-[#ff9900] hover:bg-[#ec7211] text-white font-black uppercase tracking-widest rounded-none transition-all disabled:opacity-50">
                            {{ isSubmitting ? 'Sending...' : 'Transmit Enquiry' }}
                        </button>
                    </form>
                </div>
            </div>
        </main>

        <footer class="py-12 border-t border-[#eaeded] text-center bg-[#fafafa]">
            <p class="text-[10px] text-[#879196] font-black uppercase tracking-[0.2em]">© 2026 SERWIN SYSTEMS INC.</p>
        </footer>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800;900&display=swap');

.font-urbanist {
    font-family: 'Urbanist', sans-serif;
}
</style>
