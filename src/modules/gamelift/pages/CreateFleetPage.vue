<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { initUpload, uploadToS3 } from '../services/gameliftApi'
import JSZip from 'jszip'

const router = useRouter()

const form = ref({ game_name: '', vm_id: '' })
const selectedFile = ref<File | null>(null)
const loading = ref(false)
const uploadStatus = ref('')
const uploadProgress = ref(0)
const error = ref('')
const successData = ref<any>(null)

const vmOptions = [
    { value: 'vm-small-cpu', label: 'vm-small-cpu — 2 vCPU, 4GB RAM' },
    { value: 'vm-medium-cpu', label: 'vm-medium-cpu — 4 vCPU, 8GB RAM' },
    { value: 'vm-xlarge-gpu', label: 'vm-xlarge-gpu — 8 vCPU, 32GB RAM + GPU' },
    { value: 'vm-xxlarge-gpu', label: 'vm-xxlarge-gpu — 16 vCPU, 64GB RAM + GPU' },
]

function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.zip')) { error.value = 'Only .zip packages are supported.'; selectedFile.value = null; return }
    selectedFile.value = file; error.value = ''
}

async function handleSubmit() {
    if (!form.value.game_name || !form.value.vm_id || !selectedFile.value) {
        error.value = 'Please fill in all fields and select a package file.'
        return
    }
    loading.value = true; error.value = ''; uploadProgress.value = 10
    try {
        uploadStatus.value = 'Inspecting package manifest...'
        const jszip = new JSZip()
        const zipContent = await jszip.loadAsync(selectedFile.value)
        uploadProgress.value = 25
        const manifestFile = zipContent.file('game.json')
        if (!manifestFile) throw new Error('Invalid package: Missing game.json in the ZIP root')
        const manifestText = await manifestFile.async('text')
        let manifest: object
        try { manifest = JSON.parse(manifestText) } catch { throw new Error('Invalid package: game.json is malformed JSON') }
        uploadProgress.value = 40
        uploadStatus.value = 'Requesting presigned upload URL...'
        const initData = await initUpload({ game_name: form.value.game_name, vm_id: form.value.vm_id, manifest })
        uploadProgress.value = 60
        const finalUrl = initData.upload_url || initData.url
        if (!finalUrl) throw new Error('Server did not return a valid upload URL.')
        uploadStatus.value = 'Uploading package to Hyper Storage...'
        await uploadToS3(finalUrl, selectedFile.value!)
        uploadProgress.value = 100
        successData.value = initData
    } catch (err: any) {
        error.value = err.message || 'An error occurred during upload.'
        uploadProgress.value = 0
    } finally { loading.value = false; uploadStatus.value = '' }
}

function resetForm() {
    successData.value = null; form.value.game_name = ''; form.value.vm_id = ''
    selectedFile.value = null; uploadProgress.value = 0; error.value = ''
    const fileInput = document.getElementById('file') as HTMLInputElement
    if (fileInput) fileInput.value = ''
}
</script>

<template>
    <div class="min-h-screen pb-24 bg-white font-urbanist selection:bg-[#ff9900]/30">
        <div class="fixed inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

        <div class="relative z-10 max-w-3xl mx-auto px-6 pt-28 pb-20">

            <!-- Breadcrumb -->
            <div class="flex items-center gap-2 text-xs text-[#879196] mb-10 font-black uppercase tracking-widest">
                <router-link to="/gaming" class="hover:text-[#ff9900] transition-colors flex items-center gap-1.5">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
                    </svg>
                    GameLift
                </router-link>
                <span>/</span>
                <span class="text-[#232f3e]">Register Game</span>
            </div>

            <!-- Page Header -->
            <div class="mb-12">
                <h1 class="text-5xl font-black text-[#232f3e] uppercase tracking-tighter mb-3">Deploy Game <span class="text-[#ff9900]">Package</span></h1>
                <p class="text-[#545b64] font-medium leading-relaxed max-w-lg">Upload a game bundle to Hyper Storage and register it on a managed GameLift fleet.</p>
            </div>

            <!-- Success State -->
            <div v-if="successData" class="bg-[#fafafa] border-2 border-[#232f3e] p-10 relative overflow-hidden">
                <div class="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
                <div class="pl-4">
                    <div class="flex items-center gap-4 mb-6">
                        <div class="w-12 h-12 bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center text-emerald-600">
                            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <h2 class="text-2xl font-black text-[#232f3e] uppercase tracking-tighter">Game Registered!</h2>
                            <p class="text-[#545b64] text-sm font-medium">Fleet provisioning has started. Ready in a few minutes.</p>
                        </div>
                    </div>
                    <div class="border-2 border-[#eaeded] bg-white p-6 space-y-3 mb-8">
                        <div class="flex justify-between items-center">
                            <span class="text-[10px] font-black text-[#879196] uppercase tracking-widest">Game Name</span>
                            <span class="text-sm font-black text-[#232f3e] font-mono">{{ successData.game_name || form.game_name }}</span>
                        </div>
                        <div class="border-b border-[#eaeded]"></div>
                        <div class="flex justify-between items-center">
                            <span class="text-[10px] font-black text-[#879196] uppercase tracking-widest">VM ID</span>
                            <span class="text-sm font-black text-[#232f3e] font-mono">{{ successData.vm_id || form.vm_id }}</span>
                        </div>
                        <div class="border-b border-[#eaeded]"></div>
                        <div class="flex justify-between items-center">
                            <span class="text-[10px] font-black text-[#879196] uppercase tracking-widest">Game ID</span>
                            <span class="text-sm font-black text-[#ff9900] font-mono">{{ successData.game_id || successData.temporary_game_id }}</span>
                        </div>
                        <template v-if="successData.arn">
                            <div class="border-b border-[#eaeded]"></div>
                            <div class="flex flex-col gap-1">
                                <span class="text-[10px] font-black text-[#879196] uppercase tracking-widest">ARN</span>
                                <span class="text-xs text-[#ff9900] font-mono break-all">{{ successData.arn }}</span>
                            </div>
                        </template>
                    </div>
                    <div class="flex gap-4">
                        <button @click="resetForm" class="px-6 py-3 bg-white border-2 border-[#232f3e] text-[#232f3e] text-xs font-black uppercase tracking-widest hover:bg-[#232f3e] hover:text-white transition-all">
                            Register Another
                        </button>
                        <router-link to="/gaming" class="px-6 py-3 bg-[#ff9900] text-white text-xs font-black uppercase tracking-widest hover:bg-[#ec7211] transition-all">
                            Back to Console
                        </router-link>
                    </div>
                </div>
            </div>

            <!-- Form -->
            <div v-else class="border-2 border-[#232f3e] overflow-hidden">
                <div class="px-10 py-7 border-b-2 border-[#eaeded] bg-[#fafafa] flex items-center justify-between">
                    <div>
                        <h2 class="text-xl font-black text-[#232f3e] uppercase tracking-tighter">Package Configuration</h2>
                        <p class="text-[10px] font-black text-[#879196] uppercase tracking-widest mt-1">Step 1 of 1 — Upload &amp; Register</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-2 h-2 bg-[#ff9900] animate-ping"></div>
                        <span class="text-[9px] text-[#545b64] font-black uppercase tracking-[0.3em]">Protocol Active</span>
                    </div>
                </div>

                <form @submit.prevent="handleSubmit" class="p-10 space-y-10 bg-white">
                    <!-- 01 Game Identity -->
                    <div class="space-y-6">
                        <h3 class="text-[10px] font-black text-[#ff9900] uppercase tracking-[0.3em] border-b-2 border-[#eaeded] pb-3">01 // Game Identity</h3>
                        <div class="space-y-2">
                            <label for="game_name" class="block text-[10px] font-black text-[#232f3e] uppercase tracking-widest">Game Name</label>
                            <input id="game_name" v-model="form.game_name" type="text"
                                class="w-full border-2 border-[#eaeded] bg-[#fafafa] px-4 py-3 text-sm font-bold text-[#232f3e] focus:outline-none focus:border-[#232f3e] transition-colors placeholder:text-[#879196]"
                                placeholder="e.g. Cyberpunk 2077" required />
                        </div>
                    </div>

                    <!-- 02 Compute Fleet -->
                    <div class="space-y-6">
                        <h3 class="text-[10px] font-black text-[#ff9900] uppercase tracking-[0.3em] border-b-2 border-[#eaeded] pb-3">02 // Compute Fleet</h3>
                        <div class="space-y-2">
                            <label for="vm_id" class="block text-[10px] font-black text-[#232f3e] uppercase tracking-widest">VM Instance Type</label>
                            <select id="vm_id" v-model="form.vm_id"
                                class="w-full border-2 border-[#eaeded] bg-[#fafafa] px-4 py-3 text-sm font-bold text-[#232f3e] focus:outline-none focus:border-[#232f3e] transition-colors appearance-none">
                                <option value="" disabled>Select a VM type...</option>
                                <option v-for="vm in vmOptions" :key="vm.value" :value="vm.value">{{ vm.label }}</option>
                            </select>
                            <p class="text-[10px] text-[#879196] font-bold uppercase tracking-widest">Managed instance type for your game server fleet.</p>
                        </div>
                    </div>

                    <!-- 03 Media Payload -->
                    <div class="space-y-6">
                        <h3 class="text-[10px] font-black text-[#ff9900] uppercase tracking-[0.3em] border-b-2 border-[#eaeded] pb-3">03 // Media Payload</h3>
                        <div class="space-y-2">
                            <label for="file" class="block text-[10px] font-black text-[#232f3e] uppercase tracking-widest">Game Package (.zip)</label>
                            <label for="file"
                                class="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-[#eaeded] cursor-pointer hover:border-[#ff9900] hover:bg-[#fffbf3] transition-all group">
                                <div class="flex flex-col items-center gap-3 text-[#879196] group-hover:text-[#ff9900] transition-colors">
                                    <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <span v-if="selectedFile" class="text-sm font-black text-[#232f3e]">{{ selectedFile.name }}</span>
                                    <div v-else class="text-center">
                                        <p class="text-sm font-black uppercase tracking-wide">Click to upload package</p>
                                        <p class="text-xs mt-1 uppercase tracking-widest font-bold">ZIP with root game.json manifest</p>
                                    </div>
                                </div>
                                <input id="file" type="file" accept=".zip" @change="handleFileChange" class="hidden" />
                            </label>
                            <p class="text-[10px] text-[#879196] font-bold uppercase tracking-widest">Your ZIP must include a <span class="text-[#ff9900] font-mono">game.json</span> manifest in the root directory.</p>
                        </div>
                    </div>

                    <!-- Upload Progress -->
                    <div v-if="loading" class="space-y-2">
                        <div class="flex justify-between text-[10px] font-black text-[#545b64] uppercase tracking-widest">
                            <span>{{ uploadStatus }}</span>
                            <span>{{ uploadProgress }}%</span>
                        </div>
                        <div class="w-full h-2 bg-[#eaeded]">
                            <div class="h-full bg-[#ff9900] transition-all duration-500" :style="{ width: uploadProgress + '%' }"></div>
                        </div>
                    </div>

                    <!-- Error -->
                    <div v-if="error" class="border-2 border-red-300 bg-red-50 px-5 py-4 text-sm text-red-700 font-bold flex items-center gap-3">
                        <svg class="w-5 h-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {{ error }}
                    </div>

                    <!-- Actions -->
                    <div class="pt-6 flex items-center justify-end gap-6 border-t-2 border-[#eaeded]">
                        <router-link to="/gaming" class="text-xs font-black text-[#879196] hover:text-[#232f3e] uppercase tracking-widest transition-colors">
                            Cancel
                        </router-link>
                        <button type="submit" :disabled="loading"
                            class="px-8 py-3 bg-[#ff9900] hover:bg-[#ec7211] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 transform active:scale-95">
                            <div v-if="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span v-else>Register Game Fleet</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>
