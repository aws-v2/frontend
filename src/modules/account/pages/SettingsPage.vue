<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/modules/auth/store/authStore'
import BaseWidget from '@/shared/components/BaseWidget.vue'
import { useToastStore } from '@/shared/store/toastStore'

const authStore = useAuthStore()
const toastStore = useToastStore()

const fullName = ref('')
const organization = ref('')

onMounted(async () => {
    if (!authStore.user) {
        await authStore.fetchUserProfile()
    }
    fullName.value = authStore.user?.fullName || ''
    organization.value = authStore.user?.organization || ''
})

const handleSaveProfile = () => {
    toastStore.addToast('Profile updated successfully', 'success')
}

const handleToggleMfa = () => {
    toastStore.addToast('MFA settings updated', 'info')
}
</script>

<template>
    <div class="min-h-screen pb-24 relative overflow-hidden bg-white font-urbanist">
        <!-- Subtle Grid -->
        <div
            class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none">
        </div>

        <header class="relative z-10 px-8 md:px-24 pt-20">
            <div class="max-w-[1400px] mx-auto">
                <div
                    class="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-white border border-[#ff9900]/30 text-[#ff9900] text-[10px] font-black tracking-[0.2em] uppercase">
                    Configuration Protocol
                </div>
                <h1 class="text-5xl font-black text-[#232f3e] uppercase tracking-tighter mb-2 italic">
                    Account <span class="text-[#ff9900]">Settings</span>
                </h1>
                <p class="text-[#545b64] text-sm font-bold uppercase tracking-[0.3em]">System Preferences & Controls</p>
            </div>
        </header>

        <main class="relative z-10 max-w-[1400px] mx-auto px-8 md:px-24 mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
            <!-- Left Column: Settings Sections -->
            <div class="lg:col-span-2 space-y-12">
                <!-- Profile Details -->
                <BaseWidget title="Identity Core">
                    <div class="p-10 space-y-8">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div class="space-y-2">
                                <label class="text-[10px] font-black text-[#879196] uppercase tracking-[0.2em]">Full
                                    Legal Name</label>
                                <input v-model="fullName" type="text"
                                    class="w-full bg-[#fafafa] border-2 border-[#eaeded] px-4 py-3 text-xs font-bold text-[#232f3e] focus:border-[#ff9900] outline-none transition-colors" />
                            </div>
                            <div class="space-y-2">
                                <label class="text-[10px] font-black text-[#879196] uppercase tracking-[0.2em]">Primary
                                    Domain / Organization</label>
                                <input v-model="organization" type="text"
                                    class="w-full bg-[#fafafa] border-2 border-[#eaeded] px-4 py-3 text-xs font-bold text-[#232f3e] focus:border-[#ff9900] outline-none transition-colors" />
                            </div>
                            <div class="space-y-2 md:col-span-2">
                                <label
                                    class="text-[10px] font-black text-[#879196] uppercase tracking-[0.2em]">Registered
                                    Email</label>
                                <input :value="authStore.email" disabled type="email"
                                    class="w-full bg-[#eaeded]/50 border-2 border-[#eaeded] px-4 py-3 text-xs font-bold text-[#879196] cursor-not-allowed outline-none" />
                            </div>
                        </div>
                        <div class="pt-6 border-t border-[#eaeded] flex justify-end">
                            <button @click="handleSaveProfile"
                                class="px-8 py-3 bg-[#232f3e] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#ff9900] transition-all">Synchronize
                                Profiles</button>
                        </div>
                    </div>
                </BaseWidget>

                <!-- Payment Methods -->
                <BaseWidget title="Liquidity & Billing">
                    <div class="p-10 space-y-8">
                        <div class="flex items-center justify-between p-6 border-2 border-[#232f3e] bg-[#fafafa]">
                            <div class="flex items-center gap-6">
                                <div
                                    class="w-14 h-10 bg-white border border-[#eaeded] flex items-center justify-center font-black text-[#232f3e] italic text-xs">
                                    VISA</div>
                                <div>
                                    <p class="text-xs font-black text-[#232f3e] uppercase tracking-tighter">•••• ••••
                                        •••• {{ authStore.user?.paymentMethod?.last4 || '4242' }}</p>
                                    <p class="text-[10px] font-bold text-[#879196] uppercase tracking-widest">Expires {{
                                        authStore.user?.paymentMethod?.expiry || '12/28' }}</p>
                                </div>
                            </div>
                            <button
                                class="text-[10px] font-black text-[#ff9900] uppercase tracking-widest hover:text-[#232f3e] transition-colors">Replace</button>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-[#eaeded]">
                            <div class="space-y-2">
                                <label class="text-[10px] font-black text-[#879196] uppercase tracking-[0.2em]">Tax ID /
                                    VAT Registration</label>
                                <input type="text" placeholder="Optional"
                                    class="w-full bg-[#fafafa] border-2 border-[#eaeded] px-4 py-3 text-xs font-bold text-[#232f3e] outline-none" />
                            </div>
                            <div class="space-y-2">
                                <label class="text-[10px] font-black text-[#879196] uppercase tracking-[0.2em]">Billing
                                    Language</label>
                                <select
                                    class="w-full bg-[#fafafa] border-2 border-[#eaeded] px-4 py-3 text-xs font-bold text-[#232f3e] outline-none">
                                    <option>English (US-EAST)</option>
                                    <option>English (UK)</option>
                                    <option>Deutsch</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </BaseWidget>
            </div>

            <!-- Right Column: Sidebar Settings -->
            <aside class="space-y-12">
                <!-- Data Sovereignty -->
                <div class="bg-[#232f3e] p-8 relative overflow-hidden">
                    <div
                        class="absolute top-0 right-0 w-32 h-32 bg-[#ff9900]/10 -rotate-45 translate-x-16 -translate-y-16">
                    </div>
                    <h3 class="text-[10px] font-black text-[#ff9900] uppercase tracking-[0.2em] mb-6 relative z-10">Data
                        Sovereignty</h3>
                    <p class="text-[10px] text-white/60 font-medium leading-relaxed mb-8 relative z-10">Download your
                        complete system registry and identity logs for auditing purposes.</p>
                    <button
                        class="w-full py-3 bg-[#ff9900] text-[#232f3e] text-[9px] font-black uppercase tracking-[0.2em] hover:bg-white transition-all relative z-10">Request
                        Data Export</button>
                </div>

                <!-- Security Quick Controls -->
                <BaseWidget title="Security Shield">
                    <div class="divide-y divide-[#eaeded]">
                        <div class="px-8 py-6 flex items-center justify-between">
                            <div>
                                <p class="text-[11px] font-black text-[#232f3e] uppercase tracking-tighter mb-1">
                                    Multi-Factor Auth</p>
                                <p class="text-[9px] text-[#879196] font-bold uppercase tracking-widest italic">{{
                                    authStore.mfaEnabled ? 'Operational' : 'Inactive' }}</p>
                            </div>
                            <button @click="handleToggleMfa"
                                class="w-12 h-6 border-2 border-[#232f3e] relative transition-colors"
                                :class="authStore.mfaEnabled ? 'bg-[#ff9900]' : 'bg-[#eaeded]'">
                                <div class="absolute top-1 w-2 h-2 bg-[#232f3e] transition-all"
                                    :class="authStore.mfaEnabled ? 'right-1' : 'left-1'"></div>
                            </button>
                        </div>
                        <div
                            class="px-8 py-6 flex items-center justify-between group cursor-pointer hover:bg-[#fafafa] transition-colors">
                            <p class="text-[11px] font-black text-[#232f3e] uppercase tracking-tighter">Rotational
                                Security Key</p>
                            <span class="text-[#ff9900] group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                        <div
                            class="px-8 py-6 flex items-center justify-between group cursor-pointer hover:bg-red-50 transition-colors">
                            <p class="text-[11px] font-black text-red-600 uppercase tracking-tighter">Decommission
                                Account</p>
                            <span class="text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">TERM</span>
                        </div>
                    </div>
                </BaseWidget>
            </aside>
        </main>
    </div>
</template>

<style scoped>
.font-urbanist {
    font-family: 'Urbanist', sans-serif;
}
</style>
