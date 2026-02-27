<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useComputeStore } from '../store/computeStore'

const router = useRouter()
const computeStore = useComputeStore()

const form = ref({
    name: '',
    publicKey: ''
})

const isSubmitting = ref(false)

const handleCreate = async () => {
    if (!form.value.name || !form.value.publicKey) return

    isSubmitting.value = true
    try {
        await computeStore.createSSHKey(form.value)
        router.push({ name: 'ssh-keys-list' })
    } catch (error) {
        console.error('Failed to import SSH key:', error)
    } finally {
        isSubmitting.value = false
    }
}

const goBack = () => router.push({ name: 'ssh-keys-list' })
</script>

<template>
    <div class="min-h-screen bg-white text-[#16191f] font-urbanist p-8 md:p-16 pt-24 relative overflow-hidden">
        <div
            class="absolute inset-0 bg-[linear-gradient(rgba(0,102,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,102,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none">
        </div>

        <div class="relative z-10 max-w-4xl mx-auto space-y-12">
            <!-- Navigation -->
            <nav class="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-[#879196]">
                <span>EC2_ENGINE</span>
                <div class="w-1 h-1 bg-[#eaeded] rounded-full"></div>
                <button @click="goBack" class="hover:text-blue-600 transition-colors">AUTHENTICATION_VAULT</button>
                <div class="w-1 h-1 bg-[#eaeded] rounded-full"></div>
                <span class="text-[#232f3e]">IMPORT_IDENTITY_KEY</span>
            </nav>

            <!-- Header -->
            <div class="border-l-8 border-emerald-500 pl-10 py-4 mb-20">
                <h1 class="text-7xl font-black text-[#232f3e] tracking-tight uppercase leading-none mb-4">
                    Import <span class="text-emerald-500 italic">SSH Key</span>
                </h1>
                <p class="text-[11px] font-black text-[#879196] uppercase tracking-[0.4em]">Register Public
                    Authentication Protocols</p>
            </div>

            <!-- Form -->
            <div class="bg-[#fafafa] border-4 border-[#232f3e] p-12 space-y-12 relative">
                <div
                    class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 -rotate-45 translate-x-16 -translate-y-16">
                </div>

                <div class="space-y-10">
                    <!-- Name -->
                    <div class="space-y-4">
                        <label
                            class="text-[10px] font-black text-[#232f3e] uppercase tracking-widest block italic">KEY_PAIR_IDENTIFIER</label>
                        <input v-model="form.name" type="text" placeholder="e.g. ALPHA_ADMIN_KEY"
                            class="w-full bg-white border-4 border-[#232f3e] p-5 text-sm font-black uppercase tracking-tight focus:ring-0 focus:border-emerald-500 transition-colors outline-none">
                        <p class="text-[9px] text-[#879196] font-bold uppercase tracking-widest leading-relaxed">
                            System-wide unique identifier for this credential set.</p>
                    </div>

                    <!-- Public Key -->
                    <div class="space-y-4">
                        <label
                            class="text-[10px] font-black text-[#232f3e] uppercase tracking-widest block italic">PUBLIC_KEY_MATERIAL</label>
                        <textarea v-model="form.publicKey" rows="6"
                            placeholder="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQ..."
                            class="w-full bg-white border-4 border-[#232f3e] p-5 text-sm font-mono focus:ring-0 focus:border-emerald-500 transition-colors outline-none resize-none"></textarea>
                        <p class="text-[9px] text-[#879196] font-bold uppercase tracking-widest leading-relaxed">Paste
                            your OpenSSH formatted public key. Supported types: RSA, ED25519, ECDSA.</p>
                    </div>
                </div>

                <!-- Footer Action -->
                <div
                    class="pt-12 border-t-4 border-[#232f3e] flex flex-col md:flex-row justify-between items-center gap-8">
                    <div class="flex items-center gap-4">
                        <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <p class="text-[10px] font-black text-[#232f3e] uppercase tracking-widest">
                            VALID_SIGNATURE_REQUIRED</p>
                    </div>
                    <div class="flex gap-6 w-full md:w-auto">
                        <button @click="goBack"
                            class="flex-1 md:flex-initial px-12 py-5 border-4 border-[#232f3e] text-[#232f3e] text-[10px] font-black uppercase tracking-widest hover:bg-[#232f3e] hover:text-white transition-all">
                            ABORT
                        </button>
                        <button @click="handleCreate" :disabled="isSubmitting || !form.name || !form.publicKey"
                            class="flex-1 md:flex-initial px-16 py-5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#232f3e] transition-all disabled:opacity-50 disabled:cursor-not-allowed group">
                            <span v-if="!isSubmitting">IMPORT_KEY_VAULT &rarr;</span>
                            <span v-else class="animate-pulse">ENCRYPTING_VAULT...</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Security Notice -->
            <div class="p-8 border-4 border-amber-500/20 bg-amber-500/5">
                <div class="flex gap-6">
                    <div class="shrink-0 text-amber-600 font-black text-2xl uppercase">!</div>
                    <div class="space-y-2">
                        <h5 class="text-[10px] font-black text-amber-600 uppercase tracking-widest">Protocol Warning:
                            Private Key Integrity</h5>
                        <p class="text-[11px] font-black text-[#879196] uppercase tracking-widest leading-relaxed">
                            Serwin Infrastructure NEVER requests your private keys. Only upload the public material.
                            Unauthorized access to private files compromises your entire fleet lattice.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
