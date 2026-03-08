<script setup lang="ts">
import { ref } from 'vue'
import { useToastStore } from '@/shared/store/toastStore'
import { useS3Store } from '@/modules/s3/store/s3Store'

const props = defineProps<{
    isOpen: boolean
    bucketName: string
    currentPrefix?: string
}>()

const emit = defineEmits(['close', 'success'])

const s3Store = useS3Store()
const toastStore = useToastStore()
const folderName = ref('')
const encryptionKeyType = ref('None') // 'None' or 'Specify'

const handleCreateFolder = async () => {
    if (!folderName.value) {
        toastStore.addToast('Folder name is required', 'error')
        return
    }

    if (folderName.value.includes('/')) {
        toastStore.addToast('Folder names cannot contain "/"', 'error')
        return
    }

    const fullFolderName = (props.currentPrefix || '') + folderName.value

    try {
        await s3Store.createFolder(props.bucketName, fullFolderName)
        toastStore.addToast(`Folder "${folderName.value}" created successfully`, 'success')
        emit('success', fullFolderName)
        emit('close')
        folderName.value = ''
    } catch (error) {
        toastStore.addToast('Failed to create folder', 'error')
    }
}
</script>

<template>
    <div v-if="isOpen"
        class="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#232f3e]/60 backdrop-blur-sm transition-all italic">
        <div
            class="bg-white border-4 border-[#232f3e] shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden relative italic">
            <div class="absolute -top-24 -left-24 w-80 h-80 bg-[#ff9900]/5 rounded-full blur-3xl pointer-events-none">
            </div>

            <!-- Header -->
            <div class="px-10 py-8 border-b-2 border-[#eaeded] bg-[#fafafa] flex justify-between items-center relative">
                <h2 class="text-4xl font-black text-[#232f3e] tracking-tighter uppercase italic">Create Folder</h2>
                <button @click="emit('close')"
                    class="text-[#545b64] hover:text-[#ff9900] transition-all p-2 bg-white border-2 border-[#eaeded] hover:border-[#ff9900] active:scale-95 shadow-sm">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Content -->
            <div class="p-10 overflow-y-auto space-y-10 relative custom-scrollbar bg-white">
                <!-- Info Alert -->
                <div class="bg-[#fafafa] border-2 border-[#eaeded] p-8 flex items-start gap-6 italic">
                    <div class="mt-1 shrink-0">
                        <svg class="w-6 h-6 text-[#ff9900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <p class="font-black text-[#232f3e] mb-2 uppercase tracking-widest text-[11px] italic">Security
                            Protocol Active</p>
                        <p class="text-[12px] text-[#545b64] leading-relaxed font-bold uppercase tracking-tight">
                            Folder creation may be restricted if your bucket policy mandates specific tags or metadata
                            for object lifecycle operations.
                        </p>
                    </div>
                </div>

                <!-- Folder Name -->
                <div class="space-y-4">
                    <label class="block text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em] italic">System
                        Path Designation</label>
                    <div class="flex items-center gap-6">
                        <input v-model="folderName" type="text" placeholder="ENTER FOLDER NAME..."
                            class="w-full bg-white border-2 border-[#eaeded] px-6 py-5 text-xl font-black italic uppercase tracking-tight text-[#232f3e] focus:outline-none focus:border-[#ff9900] transition-all placeholder:text-[#eaeded] shadow-inner"
                            autofocus>
                        <span class="text-4xl text-[#eaeded] font-black italic">/</span>
                    </div>
                    <p
                        class="text-[11px] text-[#545b64] font-bold uppercase tracking-widest italic py-1 border-b border-[#eaeded] inline-block">
                        Folder names must exclude restricted characters.
                        <a href="#" class="text-[#ff9900] hover:underline font-black ml-2 italic">Architecture Rules
                            ↗</a>
                    </p>
                </div>

                <!-- Server-side encryption -->
                <div class="bg-[#fafafa] border-2 border-[#eaeded] p-8 space-y-8 italic">
                    <div class="flex justify-between items-center">
                        <h2 class="text-[11px] font-black text-[#545b64] uppercase tracking-[0.2em] italic">Data-at-Rest
                            Encryption</h2>
                        <span
                            class="text-[10px] text-[#ff9900] hover:underline cursor-pointer font-black uppercase tracking-widest italic">Doc
                            Layer ↗</span>
                    </div>

                    <div class="space-y-4">
                        <label
                            class="flex items-start gap-6 p-8 bg-white border-2 transition-all cursor-pointer group active:scale-[0.98] italic shadow-sm"
                            :class="encryptionKeyType === 'None' ? 'border-[#ff9900] bg-[#ff9900]/[0.02]' : 'border-[#eaeded] hover:border-[#ff9900]/30'">
                            <div class="w-7 h-7 border-2 border-[#eaeded] flex items-center justify-center mt-1 transition-all bg-white shrink-0"
                                :class="encryptionKeyType === 'None' ? 'border-[#ff9900] bg-[#ff9900]/10' : 'group-hover:border-[#ff9900]/50'">
                                <div v-if="encryptionKeyType === 'None'"
                                    class="w-4 h-4 bg-[#ff9900] rotate-45 animate-pulse"></div>
                            </div>
                            <input type="radio" value="None" v-model="encryptionKeyType" class="hidden">
                            <div>
                                <span class="text-xl font-black uppercase italic tracking-tight transition-colors"
                                    :class="encryptionKeyType === 'None' ? 'text-[#ff9900]' : 'text-[#232f3e]'">Inherit
                                    Bucket Settings</span>
                                <p
                                    class="text-[11px] text-[#545b64] mt-2 font-bold uppercase tracking-widest leading-relaxed">
                                    Default encryption schema will be applied to this asset.</p>
                            </div>
                        </label>

                        <label
                            class="flex items-start gap-6 p-8 bg-white border-2 transition-all cursor-pointer group active:scale-[0.98] italic shadow-sm"
                            :class="encryptionKeyType === 'Specify' ? 'border-[#ff9900] bg-[#ff9900]/[0.02]' : 'border-[#eaeded] hover:border-[#ff9900]/30'">
                            <div class="w-7 h-7 border-2 border-[#eaeded] flex items-center justify-center mt-1 transition-all bg-white shrink-0"
                                :class="encryptionKeyType === 'Specify' ? 'border-[#ff9900] bg-[#ff9900]/10' : 'group-hover:border-[#ff9900]/50'">
                                <div v-if="encryptionKeyType === 'Specify'"
                                    class="w-4 h-4 bg-[#ff9900] rotate-45 animate-pulse"></div>
                            </div>
                            <input type="radio" value="Specify" v-model="encryptionKeyType" class="hidden">
                            <div>
                                <span class="text-xl font-black uppercase italic tracking-tight transition-colors"
                                    :class="encryptionKeyType === 'Specify' ? 'text-[#ff9900]' : 'text-[#232f3e]'">Specify
                                    Dedicated Key</span>
                                <p
                                    class="text-[11px] text-[#545b64] mt-2 font-bold uppercase tracking-widest leading-relaxed">
                                    Apply a specific vault key before storage commitment.</p>
                            </div>
                        </label>

                        <div v-if="encryptionKeyType === 'Specify'"
                            class="bg-amber-500/5 border-2 border-amber-500/20 p-6 flex gap-6 animate-in fade-in slide-in-from-top-4 duration-500 italic">
                            <div
                                class="w-10 h-10 bg-white border-2 border-amber-500 flex items-center justify-center shrink-0 rotate-3 shadow-sm">
                                <svg class="w-6 h-6 text-amber-500" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <p class="text-[11px] text-amber-700 leading-relaxed font-black uppercase tracking-tight">
                                Mandatory: Ensure the specified key aligns with your organization's IAM policies to
                                prevent access denial.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="px-10 py-8 border-t-2 border-[#eaeded] flex justify-end gap-6 bg-[#fafafa] relative">
                <button @click="emit('close')"
                    class="px-8 py-3 text-[11px] font-black text-[#545b64] hover:text-[#ff9900] uppercase tracking-[0.2em] transition-all italic active:scale-95">Cancel</button>
                <button @click="handleCreateFolder"
                    class="px-12 py-3 text-[11px] font-black bg-[#232f3e] text-white hover:bg-black transition-all shadow-2xl uppercase tracking-[0.2em] italic active:scale-95">
                    Deploy Folder
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: #fafafa;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #eaeded;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #ff9900;
}
</style>
