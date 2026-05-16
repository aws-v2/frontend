<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/modules/auth/store/authStore'
import { useApiKeyStore, type ApiKeyResponse } from '@/modules/account/store/apiKeyStore'
import BaseWidget from '@/shared/components/BaseWidget.vue'
import { useToastStore } from '@/shared/store/toastStore'
 
const authStore  = useAuthStore()
const apiKeyStore = useApiKeyStore()
const toastStore = useToastStore()

const handleRequestVerification = async () => {
    try {
        await authStore.verifyEmail(authStore.user.verificationToken)
        toastStore.addToast('Verification email has been sent to your inbox.', 'success')
    } catch (err: any) {
        console.log(`this is the error ${err.response}`)
        toastStore.addToast(err.response?.data?.message || 'Failed to send verification email.', 'error')
    }
}
 
const showCreateModal        = ref(false)
const showRevealModal        = ref(false)
const showRevokeModal        = ref(false)
const showDotsMenu           = ref(false)
const newKeyName             = ref('')
const newKeyValidity         = ref('90')
const createdKey             = ref<ApiKeyResponse | null>(null)
const keyTargetForRevocation = ref<ApiKeyResponse | null>(null)
const menuStyle              = ref<Record<string, string>>({})
 
const validityOptions = [
    { label: '30 Days',   value: '30'  },
    { label: '90 Days',   value: '90'  },
    { label: '180 Days',  value: '180' },
    { label: '1 Year',    value: '365' },
    { label: 'No Expiry', value: '0'   },
]
 
const billingHistory = [
    { id: 'INV-2026-001', date: 'Feb 15, 2026', description: 'Monthly Infrastructure - Enterprise', amount: '$1,420.00', status: 'Paid' },
    { id: 'INV-2026-002', date: 'Jan 15, 2026', description: 'Monthly Infrastructure - Enterprise', amount: '$1,280.50', status: 'Paid' },
    { id: 'INV-2025-012', date: 'Dec 15, 2025', description: 'Monthly Infrastructure - Enterprise', amount: '$980.00',   status: 'Paid' },
]
 
const recentActivity = [
    { id: 1, action: 'Password Changed',     date: '2 days ago', location: 'London, UK' },
    { id: 2, action: 'New Login Detected',   date: '3 days ago', location: 'London, UK' },
    { id: 3, action: 'Payment Method Added', date: '1 week ago', location: 'London, UK' },
]
 
onMounted(async () => {
    if (!authStore.user) await authStore.fetchUserProfile()
    await apiKeyStore.listApiKeys()
})
 
// Position the dropdown relative to the button, teleported to body
const toggleMenu = (e: MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    menuStyle.value = {
        top:  `${rect.bottom + 8}px`,
        left: `${rect.right - 192}px`, // 192px = w-48
    }
    showDotsMenu.value = !showDotsMenu.value
}
 
const openCreateModal = () => {
    showDotsMenu.value    = false
    showCreateModal.value = true
}
 
const handleCreateKey = async () => {
    if (!newKeyName.value.trim()) return
    try {
        const result = await apiKeyStore.createApiKey(newKeyName.value, Number(newKeyValidity.value))
        createdKey.value      = result
        newKeyName.value      = ''
        newKeyValidity.value  = '90'
        showCreateModal.value = false
        showRevealModal.value = true
    } catch (err) { /* handled in store */ }
}
 
const confirmRevokeKey = (key: ApiKeyResponse) => {
    keyTargetForRevocation.value = key
    showRevokeModal.value        = true
}
 
const handleRevokeKey = async () => {
    if (!keyTargetForRevocation.value) return
    try {
        await apiKeyStore.revokeApiKey(keyTargetForRevocation.value.id)
        showRevokeModal.value        = false
        keyTargetForRevocation.value = null
    } catch (err) { /* handled in store */ }
}
const closeDotsMenu = () => {
    setTimeout(() => showDotsMenu.value = false, 150)
}
 
const copyToClipboard = (text: string) => navigator.clipboard.writeText(text)
</script>
 
<template>
    <div class="min-h-screen pb-24 relative overflow-hidden bg-white font-urbanist">
        <!-- Subtle Grid -->
        <div class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
 
        <header class="relative z-10 px-8 md:px-24 pt-20">
            <div class="max-w-[1400px] mx-auto">
                <div class="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-white border border-[#ff9900]/30 text-[#ff9900] text-[10px] font-black tracking-[0.2em] uppercase">
                    Account Protocol
                </div>
                <h1 class="text-5xl font-black text-[#232f3e] uppercase tracking-tighter mb-2 italic">
                    My <span class="text-[#ff9900]">Account</span>
                </h1>
                <p class="text-[#545b64] text-sm font-bold uppercase tracking-[0.3em]">Identity & Billing Registry</p>
            </div>
        </header>
 
        <main class="relative z-10 max-w-[1400px] mx-auto px-8 md:px-24 mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
            <!-- Left Column -->
            <div class="lg:col-span-2 space-y-12">
 
                <!-- User Profile Card -->
                <div class="bg-white border-2 border-[#232f3e] p-10 relative overflow-hidden group">
                    <div class="absolute top-0 right-0 w-32 h-32 bg-[#ff9900]/5 -rotate-45 translate-x-16 -translate-y-16 transition-transform group-hover:scale-150" />
                    <div class="flex flex-col md:flex-row gap-10 items-start md:items-center relative z-10">
                        <div class="w-24 h-24 bg-white border-2 border-[#232f3e] flex items-center justify-center text-4xl font-black text-[#ff9900] shadow-xl">
                            {{ authStore.user?.fullName?.charAt(0) || authStore.email?.charAt(0).toUpperCase() }}
                        </div>
                        <div class="flex-1">
                            <h2 class="text-3xl font-black text-[#232f3e] uppercase tracking-tighter mb-2">{{ authStore.user?.fullName }}</h2>
                            <p class="text-[#545b64] font-bold tracking-widest uppercase text-xs mb-4">{{ authStore.email }}</p>
                            <div class="flex flex-wrap gap-4">
                                <div class="px-3 py-1 bg-[#232f3e] text-white text-[9px] font-black uppercase tracking-widest">Enterprise Tier</div>
                                <div v-if="authStore.emailVerified" class="px-3 py-1 border-2 border-emerald-100 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                    <span class="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                    Identity Verified
                                </div>
                                <button 
                                    v-else 
                                    @click="handleRequestVerification"
                                    :disabled="apiKeyStore.loading"
                                    class="px-3 py-1 border-2 border-red-200 bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-widest hover:bg-red-100 transition-all flex items-center gap-1.5 shadow-[2px_2px_0px_#dc2626] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                    Verify Emailq
                                    {{ authStore.emailVerified }}
                                </button>
                                <div class="px-3 py-1 border-2 border-[#eaeded] text-[#879196] text-[9px] font-black uppercase tracking-widest">
                                    Joined {{ authStore.user?.createdAt || '2026' }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
 
                <!-- API Keys Widget -->
                <BaseWidget title="API Access Keys" show-info @info-click="() => {}">

                    <template #actions>
                        <div class="flex items-center gap-3">
                            <button
                                @click="openCreateModal"
                                :disabled="!authStore.emailVerified"
                                :title="!authStore.emailVerified ? 'Verification required' : ''"
                                class="px-4 py-1.5 bg-[#232f3e] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#ff9900] transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#232f3e]"
                            >
                                <span class="text-sm font-black leading-none">+</span>
                                Create Key
                            </button>
                            
                            <div class="relative">
                                <!-- Trigger -->
                                <button
                                    @click="toggleMenu"
                                    @blur="closeDotsMenu"
                                    class="w-8 h-8 flex items-center justify-center border-2 border-[#eaeded] hover:border-[#232f3e] hover:bg-[#232f3e] text-[#879196] hover:text-white transition-all"
                                    title="Key options"
                                >
                                    <span class="flex flex-col gap-[3px] items-center justify-center">
                                        <span class="w-[3px] h-[3px] rounded-full bg-current" />
                                        <span class="w-[3px] h-[3px] rounded-full bg-current" />
                                        <span class="w-[3px] h-[3px] rounded-full bg-current" />
                                    </span>
                                </button>
    
                                <!-- Dropdown — teleported to body to escape any overflow:hidden parent -->
                                <Teleport to="body">
                                    <Transition
                                        enter-active-class="transition-all duration-150 ease-out"
                                        enter-from-class="opacity-0 translate-y-1"
                                        enter-to-class="opacity-100 translate-y-0"
                                        leave-active-class="transition-all duration-100 ease-in"
                                        leave-from-class="opacity-100 translate-y-0"
                                        leave-to-class="opacity-0 translate-y-1"
                                    >
                                        <div
                                            v-if="showDotsMenu"
                                            class="fixed z-[9999] w-48 bg-white border-2 border-[#232f3e] shadow-[4px_4px_0px_#232f3e]"
                                            :style="menuStyle"
                                        >
                                            <button
                                                @mousedown.prevent="apiKeyStore.listApiKeys(); showDotsMenu = false"
                                                class="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#232f3e] hover:bg-[#ff9900] hover:text-white transition-colors text-left"
                                            >
                                                <span class="w-4 h-4 flex items-center justify-center border-2 border-current text-[10px] font-black leading-none">↻</span>
                                                Refresh Registry
                                            </button>
                                        </div>
                                    </Transition>
                                </Teleport>
                            </div>
                        </div>
                    </template>
 
                    <!-- Loading -->
                    <div v-if="apiKeyStore.loading && apiKeyStore.apiKeys.length === 0" class="py-12 text-center">
                        <div class="animate-spin w-8 h-8 border-4 border-[#ff9900] border-t-transparent mx-auto mb-4" />
                        <p class="text-[10px] font-black uppercase tracking-widest text-[#879196]">Retrieving Keys...</p>
                    </div>
 
                    <!-- Empty state -->
                    <div v-else-if="apiKeyStore.apiKeys.length === 0" class="py-12 text-center border-2 border-dashed border-[#eaeded]">
                        <p class="text-[10px] font-black uppercase tracking-widest text-[#879196] mb-4">No active API keys found</p>
                        <button @click="openCreateModal" class="text-[10px] font-black uppercase tracking-widest text-[#ff9900] hover:underline">
                            Generate your first key
                        </button>
                    </div>
 
                    <!-- Keys table -->
                    <div v-else class="overflow-x-auto">
                        <table class="w-full text-left">
                            <thead>
                                <tr class="border-b-2 border-[#eaeded]">
                                    <th class="px-8 py-5 text-[10px] font-black text-[#879196] uppercase tracking-widest">Name</th>
                                    <th class="px-8 py-5 text-[10px] font-black text-[#879196] uppercase tracking-widest">Access Key ID</th>
                                    <th class="px-8 py-5 text-[10px] font-black text-[#879196] uppercase tracking-widest">Created</th>
                                    <th class="px-8 py-5 text-[10px] font-black text-[#879196] uppercase tracking-widest">Expires</th>
                                    <th class="px-8 py-5 text-[10px] font-black text-[#879196] uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="key in apiKeyStore.apiKeys"
                                    :key="key.id"
                                    class="border-b border-[#eaeded] hover:bg-[#fafafa] transition-colors"
                                >
                                    <td class="px-8 py-5 text-xs font-black text-[#232f3e]">{{ key.name }}</td>
                                  <td class="px-8 py-5 text-xs font-mono text-[#545b64]">
    <div class="flex items-center gap-2">
        <span class="block max-w-[160px] truncate" :title="key.apiKey">
            {{ key.apiKey }}
        </span>
        <button
            @click="copyToClipboard(key.apiKey)"
            class="shrink-0 text-[#879196] hover:text-[#232f3e] transition-colors"
            title="Copy"
        >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
        </button>
    </div>
</td>
                                    <td class="px-8 py-5 text-xs font-bold text-[#545b64] italic">
                                        {{ new Date(key.createdAt).toLocaleDateString() }}
                                    </td>
                                    <td class="px-8 py-5 text-xs font-bold">
                                        <span v-if="key.expiresAt" class="text-[#545b64] italic">
                                            {{ new Date(key.expiresAt).toLocaleDateString() }}
                                        </span>
                                        <span v-else class="px-2 py-0.5 bg-[#232f3e] text-white text-[9px] font-black uppercase tracking-widest">
                                            Never
                                        </span>
                                    </td>
                                    <td class="px-8 py-5 text-right">
                                        <button
                                            @click="confirmRevokeKey(key)"
                                            class="text-[9px] font-black uppercase tracking-widest text-red-600 hover:text-red-800 transition-all"
                                        >
                                            Revoke
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
 
                    <template #footer>Active Identity Credentials for SDK Access</template>
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

       
<!-- ═══════════════════════════════════════════════════════════════════════════
     MODALS — paste these just before the closing tag of your root <div>
     ═══════════════════════════════════════════════════════════════════════════ -->
 
 
<!-- ── CREATE KEY MODAL ──────────────────────────────────────────────────── -->
<Transition
    enter-active-class="transition-all duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-all duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
>
    <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
        <div class="bg-white border-2 border-[#232f3e] shadow-[8px_8px_0px_#232f3e] w-full max-w-lg relative">
 
            <!-- Header -->
            <div class="flex items-center justify-between px-8 py-6 border-b-2 border-[#232f3e] bg-[#232f3e]">
                <div>
                    <p class="text-[9px] font-black uppercase tracking-[0.3em] text-[#ff9900] mb-0.5">IAM Console</p>
                    <h2 class="text-lg font-black text-white uppercase tracking-tighter">Create API Key</h2>
                </div>
                <button @click="showCreateModal = false"
                    class="w-8 h-8 flex items-center justify-center border-2 border-white/20 text-white hover:border-[#ff9900] hover:text-[#ff9900] transition-all text-sm font-black">
                    ✕
                </button>
            </div>
 
            <!-- Body -->
            <div class="px-8 py-8 space-y-6">
 
                <!-- Warning -->
                <div class="flex items-start gap-3 px-4 py-3 border-l-4 border-[#ff9900] bg-[#ff9900]/5">
                    <span class="text-[#ff9900] text-xs font-black mt-0.5">⚠</span>
                    <p class="text-[10px] font-bold text-[#545b64] uppercase tracking-wide leading-relaxed">
                        The full secret key is shown only once. Store it securely immediately after creation.
                    </p>
                </div>
 
                <!-- Key Name -->
                <div>
                    <label class="block text-[10px] font-black uppercase tracking-widest text-[#232f3e] mb-2">
                        Key Name <span class="text-red-500">*</span>
                    </label>
                    <input
                        v-model="newKeyName"
                        type="text"
                        placeholder="e.g. production-sdk, ci-deploy"
                        class="w-full border-2 border-[#232f3e] px-4 py-3 text-sm font-bold text-[#232f3e] placeholder-[#879196] focus:outline-none focus:border-[#ff9900] transition-colors bg-white"
                        @keyup.enter="handleCreateKey"
                    />
                    <p class="mt-1.5 text-[9px] font-bold text-[#879196] uppercase tracking-widest">
                        A label to identify where this key is used
                    </p>
                </div>
 
                <!-- Validity Period -->
                <div>
                    <label class="block text-[10px] font-black uppercase tracking-widest text-[#232f3e] mb-2">
                        Validity Period
                    </label>
                    <div class="grid grid-cols-5 gap-2">
                        <button
                            v-for="opt in validityOptions"
                            :key="opt.value"
                            @click="newKeyValidity = opt.value"
                            :class="[
                                'py-2.5 text-[9px] font-black uppercase tracking-widest border-2 transition-all',
                                newKeyValidity === opt.value
                                    ? 'bg-[#232f3e] border-[#232f3e] text-white'
                                    : 'bg-white border-[#eaeded] text-[#545b64] hover:border-[#232f3e] hover:text-[#232f3e]'
                            ]"
                        >
                            {{ opt.label }}
                        </button>
                    </div>
                    <p class="mt-1.5 text-[9px] font-bold text-[#879196] uppercase tracking-widest">
                        Key will auto-expire after the selected period
                    </p>
                </div>
            </div>
 
            <!-- Footer -->
            <div class="px-8 py-6 border-t-2 border-[#eaeded] flex items-center justify-between gap-4">
                <button
                    @click="showCreateModal = false"
                    class="px-6 py-2.5 border-2 border-[#232f3e] text-[#232f3e] text-[10px] font-black uppercase tracking-widest hover:bg-[#eaeded] transition-all"
                >
                    Cancel
                </button>
                <button
                    @click="handleCreateKey"
                    :disabled="!newKeyName.trim() || apiKeyStore.loading"
                    class="flex-1 px-6 py-2.5 bg-[#ff9900] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#232f3e] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <span v-if="apiKeyStore.loading" class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    {{ apiKeyStore.loading ? 'Generating...' : 'Generate Key' }}
                </button>
            </div>
        </div>
    </div>
</Transition>
 
 
<!-- ── REVEAL KEY MODAL ───────────────────────────────────────────────────── -->
<Transition
    enter-active-class="transition-all duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
>
    <div v-if="showRevealModal && createdKey" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
        <div class="bg-white border-2 border-[#232f3e] shadow-[8px_8px_0px_#232f3e] w-full max-w-lg">
 
            <div class="flex items-center justify-between px-8 py-6 border-b-2 border-[#232f3e] bg-[#232f3e]">
                <div>
                    <p class="text-[9px] font-black uppercase tracking-[0.3em] text-[#ff9900] mb-0.5">Key Created</p>
                    <h2 class="text-lg font-black text-white uppercase tracking-tighter">Save Your Secret Key</h2>
                </div>
            </div>
 
            <div class="px-8 py-8 space-y-6">
                <div class="flex items-start gap-3 px-4 py-3 border-l-4 border-red-500 bg-red-50">
                    <span class="text-red-500 text-xs font-black mt-0.5">!</span>
                    <p class="text-[10px] font-bold text-red-700 uppercase tracking-wide leading-relaxed">
                        This is the only time you can view the secret key. Copy it now — it cannot be retrieved later.
                    </p>
                </div>
 
                <div>
                    <p class="text-[10px] font-black uppercase tracking-widest text-[#879196] mb-2">Access Key ID</p>
                    <div class="flex items-center gap-2 border-2 border-[#eaeded] px-4 py-3">
                        <span class="flex-1 font-mono text-xs text-[#232f3e] truncate">{{ createdKey.datat }}</span>
                        <button @click="copyToClipboard(createdKey!.data)"
                            class="text-[9px] font-black uppercase tracking-widest text-[#ff9900] hover:text-[#232f3e] transition-colors shrink-0">
                            Copy
                        </button>
                    </div>
                </div>
 
                <div>
                    <p class="text-[10px] font-black uppercase tracking-widest text-[#879196] mb-2">Secret Key</p>
                    <div class="flex items-center gap-2 border-2 border-[#ff9900] bg-[#ff9900]/5 px-4 py-3">
                        <span class="flex-1 font-mono text-xs text-[#232f3e] break-all">{{ createdKey.data }}</span>
                        <button @click="copyToClipboard(createdKey.data)"
                            class="text-[9px] font-black uppercase tracking-widest text-[#ff9900] hover:text-[#232f3e] transition-colors shrink-0">
                            Copy
                        </button>
                    </div>
                </div>
            </div>
 
            <div class="px-8 py-6 border-t-2 border-[#eaeded]">
                <button @click="showRevealModal = false; createdKey = null"
                    class="w-full py-3 bg-[#232f3e] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#ff9900] transition-all">
                    I've Saved My Key — Close
                </button>
            </div>
        </div>
    </div>
</Transition>
 
 
<!-- ── REVOKE CONFIRMATION MODAL ──────────────────────────────────────────── -->
<Transition
    enter-active-class="transition-all duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
>
    <div v-if="showRevokeModal && keyTargetForRevocation" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
        <div class="bg-white border-2 border-[#232f3e] shadow-[8px_8px_0px_#232f3e] w-full max-w-md">
 
            <div class="px-8 py-6 border-b-2 border-[#232f3e] bg-[#232f3e]">
                <p class="text-[9px] font-black uppercase tracking-[0.3em] text-red-400 mb-0.5">Destructive Action</p>
                <h2 class="text-lg font-black text-white uppercase tracking-tighter">Revoke API Key</h2>
            </div>
 
            <div class="px-8 py-8 space-y-4">
                <p class="text-sm font-bold text-[#232f3e]">You are about to permanently revoke:</p>
                <div class="border-2 border-[#eaeded] px-4 py-3">
                    <p class="text-[10px] font-black uppercase tracking-widest text-[#879196] mb-1">Key Name</p>
                    <p class="text-sm font-black text-[#232f3e]">{{ keyTargetForRevocation.name }}</p>
                </div>
                <p class="text-[10px] font-bold text-[#879196] uppercase tracking-wide leading-relaxed">
                    Any application using this key will immediately lose access. This action cannot be undone.
                </p>
            </div>
 
            <div class="px-8 py-6 border-t-2 border-[#eaeded] flex gap-4">
                <button @click="showRevokeModal = false; keyTargetForRevocation = null"
                    class="flex-1 py-2.5 border-2 border-[#232f3e] text-[#232f3e] text-[10px] font-black uppercase tracking-widest hover:bg-[#eaeded] transition-all">
                    Cancel
                </button>
                <button @click="handleRevokeKey" :disabled="apiKeyStore.loading"
                    class="flex-1 py-2.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                    {{ apiKeyStore.loading ? 'Revoking...' : 'Revoke Key' }}
                </button>
            </div>
        </div>
    </div>
</Transition>
<!-- ── END MODALS ─────────────────────────────────────────────────────────── -->
 


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
