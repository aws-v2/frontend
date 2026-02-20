<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/modules/auth/store/authStore'
import BaseWidget from '@/shared/components/BaseWidget.vue'

const authStore = useAuthStore()

const billingHistory = [
    { id: 'INV-2026-001', date: 'Feb 15, 2026', description: 'Monthly Infrastructure - Enterprise', amount: '$1,420.00', status: 'Paid' },
    { id: 'INV-2026-002', date: 'Jan 15, 2026', description: 'Monthly Infrastructure - Enterprise', amount: '$1,280.50', status: 'Paid' },
    { id: 'INV-2025-012', date: 'Dec 15, 2025', description: 'Monthly Infrastructure - Enterprise', amount: '$980.00', status: 'Paid' },
]

const recentActivity = [
    { id: 1, action: 'Password Changed', date: '2 days ago', location: 'London, UK' },
    { id: 2, action: 'New Login Detected', date: '3 days ago', location: 'London, UK' },
    { id: 3, action: 'Payment Method Added', date: '1 week ago', location: 'London, UK' },
]

onMounted(async () => {
    if (!authStore.user) {
        await authStore.fetchUserProfile()
    }
})
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
                    Account Protocol
                </div>
                <h1 class="text-5xl font-black text-[#232f3e] uppercase tracking-tighter mb-2 italic">
                    My <span class="text-[#ff9900]">Account</span>
                </h1>
                <p class="text-[#545b64] text-sm font-bold uppercase tracking-[0.3em]">Identity & Billing Registry</p>
            </div>
        </header>

        <main class="relative z-10 max-w-[1400px] mx-auto px-8 md:px-24 mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
            <!-- Left Column: Profile & Summary -->
            <div class="lg:col-span-2 space-y-12">
                <!-- User Profile Card -->
                <div class="bg-white border-2 border-[#232f3e] p-10 relative overflow-hidden group">
                    <div
                        class="absolute top-0 right-0 w-32 h-32 bg-[#ff9900]/5 -rotate-45 translate-x-16 -translate-y-16 transition-transform group-hover:scale-150">
                    </div>

                    <div class="flex flex-col md:flex-row gap-10 items-start md:items-center relative z-10">
                        <div
                            class="w-24 h-24 bg-white border-2 border-[#232f3e] flex items-center justify-center text-4xl font-black text-[#ff9900] shadow-xl">
                            {{ authStore.user?.fullName?.charAt(0) || authStore.email?.charAt(0).toUpperCase() }}
                        </div>
                        <div class="flex-1">
                            <h2 class="text-3xl font-black text-[#232f3e] uppercase tracking-tighter mb-2">{{
                                authStore.user?.fullName }}</h2>
                            <p class="text-[#545b64] font-bold tracking-widest uppercase text-xs mb-4">{{
                                authStore.email }}</p>
                            <div class="flex flex-wrap gap-4">
                                <div
                                    class="px-3 py-1 bg-[#232f3e] text-white text-[9px] font-black uppercase tracking-widest">
                                    Enterprise Tier</div>
                                <div
                                    class="px-3 py-1 border-2 border-[#eaeded] text-[#879196] text-[9px] font-black uppercase tracking-widest">
                                    Joined {{ authStore.user?.joinedAt || '2026' }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Billing History -->
                <BaseWidget title="Payment Registry" show-info>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left">
                            <thead>
                                <tr class="border-b-2 border-[#eaeded]">
                                    <th
                                        class="px-8 py-5 text-[10px] font-black text-[#879196] uppercase tracking-widest">
                                        Invoice</th>
                                    <th
                                        class="px-8 py-5 text-[10px] font-black text-[#879196] uppercase tracking-widest">
                                        Date</th>
                                    <th
                                        class="px-8 py-5 text-[10px] font-black text-[#879196] uppercase tracking-widest">
                                        Amount</th>
                                    <th
                                        class="px-8 py-5 text-[10px] font-black text-[#879196] uppercase tracking-widest">
                                        Status</th>
                                    <th
                                        class="px-8 py-5 text-[10px] font-black text-[#879196] uppercase tracking-widest">
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="inv in billingHistory" :key="inv.id"
                                    class="border-b border-[#eaeded] hover:bg-[#fafafa] transition-colors group">
                                    <td class="px-8 py-5 text-xs font-black text-[#232f3e]">{{ inv.id }}</td>
                                    <td class="px-8 py-5 text-xs font-bold text-[#545b64]">{{ inv.date }}</td>
                                    <td class="px-8 py-5 text-xs font-black text-[#232f3e]">{{ inv.amount }}</td>
                                    <td
                                        class="px-8 py-5 text-xs font-black uppercase tracking-tighter text-emerald-600">
                                        {{ inv.status }}</td>
                                    <td class="px-8 py-5 text-right">
                                        <button
                                            class="text-[9px] font-black uppercase tracking-widest text-[#ff9900] hover:text-[#232f3e] opacity-0 group-hover:opacity-100 transition-all">Download
                                            PDF</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <template #footer>Official Billing Records</template>
                </BaseWidget>
            </div>

            <!-- Right Column: Sidebar -->
            <aside class="space-y-12">
                <!-- Usage Summary -->
                <div class="bg-[#fafafa] border-2 border-[#232f3e] p-8 relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-2 h-full bg-[#ff9900]"></div>
                    <h3 class="text-[10px] font-black text-[#232f3e] uppercase tracking-[0.2em] mb-8">Resource Usage
                    </h3>
                    <div class="space-y-6">
                        <div>
                            <div class="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                                <span class="text-[#545b64]">Compute Time</span>
                                <span class="text-[#232f3e]">742h / 1000h</span>
                            </div>
                            <div class="w-full h-1.5 bg-white border border-[#eaeded]">
                                <div class="h-full bg-[#ff9900]" style="width: 74%"></div>
                            </div>
                        </div>
                        <div>
                            <div class="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                                <span class="text-[#545b64]">Data Storage</span>
                                <span class="text-[#232f3e]">4.2TB / 10TB</span>
                            </div>
                            <div class="w-full h-1.5 bg-white border border-[#eaeded]">
                                <div class="h-full bg-[#232f3e]" style="width: 42%"></div>
                            </div>
                        </div>
                    </div>
                    <button
                        class="w-full mt-10 py-3 border-2 border-[#232f3e] text-[9px] font-black uppercase tracking-[0.2em] hover:bg-[#232f3e] hover:text-white transition-all">Manage
                        Quotas</button>
                </div>

                <!-- Recent Activity -->
                <BaseWidget title="Security Log">
                    <div class="space-y-0">
                        <div v-for="act in recentActivity" :key="act.id"
                            class="px-8 py-6 border-b border-[#eaeded] last:border-0 hover:bg-[#fafafa] transition-colors">
                            <div class="flex justify-between items-start mb-2">
                                <span class="text-[11px] font-black text-[#232f3e] uppercase tracking-tighter">{{
                                    act.action
                                    }}</span>
                                <span class="text-[9px] font-black text-[#879196] uppercase tracking-widest">{{ act.date
                                    }}</span>
                            </div>
                            <p class="text-[10px] text-[#545b64] font-bold">{{ act.location }}</p>
                        </div>
                    </div>
                    <template #footer>Global Security Registry</template>
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
