<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/modules/auth/store/authStore'
import { useApiKeyStore, type ApiKeyResponse } from '@/modules/account/store/apiKeyStore'
import BaseWidget from '@/shared/components/BaseWidget.vue'

const authStore = useAuthStore()
const apiKeyStore = useApiKeyStore()

// State for Modals
const showCreateModal = ref(false)
const showRevealModal = ref(false)
const showRevokeModal = ref(false)
const newKeyName = ref('')
const createdKey = ref<ApiKeyResponse | null>(null)
const keyTargetForRevocation = ref<ApiKeyResponse | null>(null)

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
    await apiKeyStore.listApiKeys()
})

// Actions
const handleCreateKey = async () => {
    if (!newKeyName.value) return
    try {
        const result = await apiKeyStore.createApiKey(newKeyName.value)
        createdKey.value = result
        newKeyName.value = ''
        showCreateModal.value = false
        showRevealModal.value = true
    } catch (err) {
        // Error is handled in store
    }
}

const confirmRevokeKey = (key: ApiKeyResponse) => {
    keyTargetForRevocation.value = key
    showRevokeModal.value = true
}

const handleRevokeKey = async () => {
    if (!keyTargetForRevocation.value) return
    try {
        await apiKeyStore.revokeApiKey(keyTargetForRevocation.value.id)
        showRevokeModal.value = false
        keyTargetForRevocation.value = null
    } catch (err) {
        // Error is handled in store
    }
}

const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Could add a toast notification here
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

                <!-- API KEYS SECTION -->
                <BaseWidget title="API Access Keys" show-info @info-click="() => { }">
                    <template #actions>
                        <button @click="showCreateModal = true"
                            class="px-4 py-2 bg-[#ff9900] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#232f3e] transition-all">
                            Create New Key
                        </button>
                    </template>

                    <div v-if="apiKeyStore.loading && apiKeyStore.apiKeys.length === 0" class="py-12 text-center">
                        <div class="animate-spin w-8 h-8 border-4 border-[#ff9900] border-t-transparent mx-auto mb-4">
                        </div>
                        <p class="text-[10px] font-black uppercase tracking-widest text-[#879196]">Retrieving Keys...
                        </p>
                    </div>

                    <div v-else-if="apiKeyStore.apiKeys.length === 0"
                        class="py-12 text-center border-2 border-dashed border-[#eaeded]">
                        <p class="text-[10px] font-black uppercase tracking-widest text-[#879196] mb-4">No active API
                            keys found</p>
                        <button @click="showCreateModal = true"
                            class="text-[10px] font-black uppercase tracking-widest text-[#ff9900] hover:underline">
                            Generate your first key
                        </button>
                    </div>

                    <div v-else class="overflow-x-auto">
                        <table class="w-full text-left">
                            <thead>
                                <tr class="border-b-2 border-[#eaeded]">
                                    <th
                                        class="px-8 py-5 text-[10px] font-black text-[#879196] uppercase tracking-widest">
                                        Name</th>
                                    <th
                                        class="px-8 py-5 text-[10px] font-black text-[#879196] uppercase tracking-widest">
                                        Access Key ID</th>
                                    <th
                                        class="px-8 py-5 text-[10px] font-black text-[#879196] uppercase tracking-widest">
                                        Created Date</th>
                                    <th
                                        class="px-8 py-5 text-[10px] font-black text-[#879196] uppercase tracking-widest text-right">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="key in apiKeyStore.apiKeys" :key="key.id"
                                    class="border-b border-[#eaeded] hover:bg-[#fafafa] transition-colors group">
                                    <td class="px-8 py-5 text-xs font-black text-[#232f3e]">{{ key.name }}</td>
                                    <td class="px-8 py-5 text-xs font-mono text-[#545b64]">{{ key.accessKeyId }}</td>
                                    <td class="px-8 py-5 text-xs font-bold text-[#545b64] italic">
                                        {{ new Date(key.createdAt).toLocaleDateString() }}
                                    </td>
                                    <td class="px-8 py-5 text-right">
                                        <button @click="confirmRevokeKey(key)"
                                            class="text-[9px] font-black uppercase tracking-widest text-red-600 hover:text-red-800 transition-all">
                                            Revoke
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <template #footer>Active Identity Credentials for S3 SDK Access</template>
                </BaseWidget>

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

        <!-- MODALS -->

        <!-- Create API Key Modal -->
        <div v-if="showCreateModal"
            class="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#232f3e]/90 backdrop-blur-sm">
            <div class="bg-white border-2 border-[#232f3e] w-full max-w-md p-10 relative">
                <div class="absolute top-0 right-0 w-2 h-full bg-[#ff9900]"></div>
                <h3 class="text-2xl font-black text-[#232f3e] uppercase tracking-tighter mb-8 italic">Create <span
                        class="text-[#ff9900]">API Key</span></h3>

                <div class="space-y-6">
                    <div>
                        <label class="block text-[10px] font-black text-[#879196] uppercase tracking-widest mb-2">Key
                            Description Name</label>
                        <input v-model="newKeyName" type="text" placeholder="e.g. Production-Backup-Service"
                            class="w-full bg-[#fafafa] border-2 border-[#eaeded] px-4 py-3 text-xs font-bold text-[#232f3e] focus:border-[#ff9900] outline-none transition-all" />
                    </div>

                    <div class="flex gap-4 pt-4">
                        <button @click="showCreateModal = false"
                            class="flex-1 py-4 border-2 border-[#232f3e] text-[10px] font-black uppercase tracking-widest hover:bg-[#eaeded] transition-all">Cancel</button>
                        <button @click="handleCreateKey" :disabled="!newKeyName || apiKeyStore.loading"
                            class="flex-1 py-4 bg-[#232f3e] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#ff9900] disabled:opacity-50 transition-all">
                            {{ apiKeyStore.loading ? 'Generating...' : 'Generate' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Reveal Secret Key Modal -->
        <div v-if="showRevealModal && createdKey"
            class="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#232f3e]/95 backdrop-blur-md">
            <div class="bg-white border-2 border-[#232f3e] w-full max-w-lg p-10 relative">
                <div class="absolute top-0 left-0 w-full h-2 bg-[#ff9900]"></div>
                <h3 class="text-2xl font-black text-[#232f3e] uppercase tracking-tighter mb-4 italic">Security <span
                        class="text-[#ff9900]">Credentials</span></h3>

                <div class="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8">
                    <p class="text-[10px] font-black text-amber-800 uppercase tracking-widest leading-relaxed">
                        Warning: This is the ONLY time you will see your Secret Access Key. Save it securely now.
                    </p>
                </div>

                <div class="space-y-8">
                    <div>
                        <label class="block text-[10px] font-black text-[#879196] uppercase tracking-widest mb-2">Access
                            Key
                            ID</label>
                        <div class="flex gap-2">
                            <code
                                class="flex-1 bg-[#fafafa] border border-[#eaeded] px-4 py-3 text-sm font-mono text-[#232f3e]">{{
                        createdKey.accessKeyId }}</code>
                            <button @click="copyToClipboard(createdKey.accessKeyId)"
                                class="px-4 border border-[#232f3e] hover:bg-[#232f3e] hover:text-white transition-all">
                                <span class="text-[9px] font-black">COPY</span>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label class="block text-[10px] font-black text-[#879196] uppercase tracking-widest mb-2">Secret
                            Access
                            Key</label>
                        <div class="flex gap-2">
                            <code
                                class="flex-1 bg-[#fafafa] border border-[#eaeded] px-4 py-3 text-sm font-mono text-[#ff9900]">{{
                        createdKey.secretAccessKey }}</code>
                            <button @click="copyToClipboard(createdKey.secretAccessKey || '')"
                                class="px-4 border border-[#232f3e] hover:bg-[#232f3e] hover:text-white transition-all">
                                <span class="text-[9px] font-black">COPY</span>
                            </button>
                        </div>
                    </div>

                    <button @click="showRevealModal = false"
                        class="w-full py-5 bg-[#232f3e] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#ff9900] transition-all">
                        I have saved my credentials
                    </button>
                </div>
            </div>
        </div>

        <!-- Revoke Confirmation Modal -->
        <div v-if="showRevokeModal && keyTargetForRevocation"
            class="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-red-900/40 backdrop-blur-sm">
            <div class="bg-white border-2 border-red-600 w-full max-w-md p-10 relative">
                <h3 class="text-2xl font-black text-red-600 uppercase tracking-tighter mb-4 italic">Revoke <span
                        class="text-[#232f3e]">Credential</span></h3>
                <p class="text-sm font-bold text-[#545b64] mb-8 uppercase tracking-widest">
                    Are you sure you want to revoke <span class="text-red-600">"{{ keyTargetForRevocation.name
                        }}"</span>? This
                    action cannot be undone and will immediately disable all access using this key.
                </p>

                <div class="flex gap-4">
                    <button @click="showRevokeModal = false"
                        class="flex-1 py-4 border-2 border-[#232f3e] text-[10px] font-black uppercase tracking-widest hover:bg-[#eaeded] transition-all">Cancel</button>
                    <button @click="handleRevokeKey" :disabled="apiKeyStore.loading"
                        class="flex-1 py-4 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-800 disabled:opacity-50 transition-all">
                        {{ apiKeyStore.loading ? 'Revoking...' : 'Revoke Key' }}
                    </button>
                </div>
            </div>
        </div>

    </div>
</template>

<style scoped>
.font-urbanist {
    font-family: 'Urbanist', sans-serif;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.animate-spin {
    animation: spin 1s linear infinite;
}
</style>
