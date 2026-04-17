<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useComputeStore } from '../store/computeStore'
import { useToastStore } from '@/shared/store/toastStore'

const router = useRouter()
const computeStore = useComputeStore()
const toastStore = useToastStore()

onMounted(async () => {
    await computeStore.fetchSSHKeys()
})

const handleDownload = (name: string) => {
    try {
        computeStore.downloadSSHKey(name)
        toastStore.addToast(`Initiating download for ${name}.pem`, 'info')
    } catch (error) {
        toastStore.addToast('Failed to trigger download', 'error')
    }
}

const handleInvalidate = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to invalidate "${name}"? This will permanently remove the key from the vault.`))
        return

    try {
        await computeStore.deleteSSHKey(id)
        toastStore.addToast(`Key ${name} successfully invalidated`, 'success')
    } catch (error) {
        toastStore.addToast(`Failed to invalidate key: ${name}`, 'error')
    }
}
</script>

<template>
    <div class="min-h-screen bg-white text-[#16191f] font-urbanist p-8 md:p-16 pt-24 relative overflow-hidden">
        <div
            class="absolute inset-0 bg-[linear-gradient(rgba(0,102,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,102,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none">
        </div>

        <div class="relative z-10 max-w-7xl mx-auto space-y-12">
            <nav class="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-[#879196]">
                <span>AWS_GLOBAL</span>
                <div class="w-1 h-1 bg-[#eaeded] rounded-full"></div>
                <span>EC2_ENGINE</span>
                <div class="w-1 h-1 bg-[#eaeded] rounded-full"></div>
                <span class="text-[#232f3e]">SSH_AUTHENTICATION_VAULT</span>
            </nav>

            <div class="flex justify-between items-end border-b-4 border-[#232f3e] pb-10">
                <h1 class="text-6xl font-black text-[#232f3e] tracking-tighter uppercase leading-none">Security_Keys
                </h1>
                <button @click="router.push({ name: 'create-ssh-key' })"
                    class="px-12 py-5 bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[#232f3e] transition-all">Import_Key</button>
            </div>

            <div class="border-2 border-[#232f3e] overflow-hidden">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-[#fafafa] border-b-2 border-[#232f3e]">
                            <th class="px-8 py-6 text-[10px] font-black text-[#232f3e] uppercase tracking-widest">Name
                            </th>
                            <th class="px-8 py-6 text-[10px] font-black text-[#232f3e] uppercase tracking-widest">
                                Fingerprint</th>
                            <th
                                class="px-8 py-6 text-[10px] font-black text-[#232f3e] uppercase tracking-widest text-right">
                                Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y-2 divide-[#eaeded]">
                        <tr v-for="key in computeStore.sshKeys" :key="key.id"
                            class="hover:bg-[#fafafa] transition-colors group">
                            <td class="px-8 py-6 text-sm font-black text-[#232f3e] uppercase">{{ key.name }}</td>
                            <td
                                class="px-8 py-6 text-[10px] font-black text-[#879196] uppercase tracking-[0.2em] font-mono">
                                {{ key.fingerprint }}</td>
                            <td class="px-8 py-6 text-right space-x-6">
                                <button @click="handleDownload(key.name)"
                                    class="text-[10px] font-black text-blue-600 hover:text-[#232f3e] transition-colors uppercase tracking-widest underline underline-offset-4">Download
                                    .PEM</button>
                                <button @click="handleInvalidate(key.id, key.name)"
                                    class="text-[10px] font-black text-[#545b64] hover:text-red-600 transition-colors uppercase tracking-widest">Invalidate</button>
                            </td>
                        </tr>
                        <tr v-if="computeStore.sshKeys.length === 0">
                            <td colspan="3" class="px-8 py-20 text-center opacity-40">
                                <p class="text-[11px] font-black uppercase tracking-[0.4em] text-[#879196]">
                                    Authentication_Vault_Empty</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>
