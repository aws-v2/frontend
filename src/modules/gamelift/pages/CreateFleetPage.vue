<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { initUpload, uploadToS3 } from '../services/gameliftApi'
import JSZip from 'jszip'

const router = useRouter()

const form = ref({
    game_name: '',
    vm_id: ''
})

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
    if (!file.name.endsWith('.zip')) {
        error.value = 'Only .zip packages are supported.'
        selectedFile.value = null
        return
    }
    selectedFile.value = file
    error.value = ''
}

async function handleSubmit() {
    if (!form.value.game_name || !form.value.vm_id || !selectedFile.value) {
        error.value = 'Please fill in all fields and select a package file.'
        return
    }

    loading.value = true
    error.value = ''
    uploadProgress.value = 10

    try {
        // Step 0: Extract manifest from ZIP
        uploadStatus.value = 'Inspecting package manifest...'
        const jszip = new JSZip()
        const zipContent = await jszip.loadAsync(selectedFile.value)
        uploadProgress.value = 25

        const manifestFile = zipContent.file('game.json')
        if (!manifestFile) {
            throw new Error('Invalid package: Missing game.json in the ZIP root')
        }

        const manifestText = await manifestFile.async('text')
        let manifest: object
        try {
            manifest = JSON.parse(manifestText)
        } catch {
            throw new Error('Invalid package: game.json is malformed JSON')
        }
        uploadProgress.value = 40

        // Step 1: Init upload — get presigned S3 URL
        uploadStatus.value = 'Requesting presigned upload URL...'
        const initData = await initUpload({
            game_name: form.value.game_name,
            vm_id: form.value.vm_id,
            manifest,
        })
        uploadProgress.value = 60

        const finalUrl = initData.upload_url || initData.url
        if (!finalUrl) {
            throw new Error('Server did not return a valid upload URL.')
        }

        // Step 2: Upload binary to S3
        uploadStatus.value = 'Uploading package to Hyper Storage...'
        await uploadToS3(finalUrl, selectedFile.value!)
        uploadProgress.value = 100

        successData.value = initData
    } catch (err: any) {
        error.value = err.message || 'An error occurred during upload. Please try again.'
        uploadProgress.value = 0
    } finally {
        loading.value = false
        uploadStatus.value = ''
    }
}

function resetForm() {
    successData.value = null
    form.value.game_name = ''
    form.value.vm_id = ''
    selectedFile.value = null
    uploadProgress.value = 0
    error.value = ''
    const fileInput = document.getElementById('file') as HTMLInputElement
    if (fileInput) fileInput.value = ''
}
</script>

<template>
    <div class="min-h-screen bg-[#05080F] text-white font-sans selection:bg-purple-500/30">
        <div class="max-w-3xl mx-auto px-6 pt-24 pb-20">

            <!-- Breadcrumb -->
            <div class="flex items-center gap-2 text-sm text-slate-500 mb-10 font-mono">
                <router-link to="/gaming" class="hover:text-purple-400 transition-colors flex items-center gap-1.5">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    GameLift
                </router-link>
                <span>/</span>
                <router-link to="/gaming/fleets" class="hover:text-purple-400 transition-colors">Fleets</router-link>
                <span>/</span>
                <span class="text-white">Register Game</span>
            </div>

            <!-- Page Header -->
            <div class="mb-12">
                <div class="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold tracking-widest uppercase">
                    <span class="w-2 h-2 rounded-full bg-purple-500"></span>
                    Fleet Registration
                </div>
                <h1 class="text-4xl font-bold tracking-tight mb-3">Deploy Game Package</h1>
                <p class="text-slate-400 text-lg font-light leading-relaxed">Upload a game bundle to Hyper Storage and register it on a managed GameLift fleet.</p>
            </div>

            <!-- Success State -->
            <div v-if="successData" class="bg-white/[0.02] border border-emerald-500/30 rounded-2xl p-10 text-center shadow-2xl">
                <div class="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/30">
                    <svg class="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 class="text-2xl font-bold text-emerald-400 mb-2">Game Registered Successfully!</h2>
                <p class="text-slate-400 mb-10 font-light">Your fleet is being provisioned. It should be ready within a few minutes.</p>

                <div class="bg-black/40 border border-white/10 rounded-xl p-6 text-left space-y-4 mb-10 font-mono text-sm">
                    <div class="flex justify-between items-center">
                        <span class="text-slate-500 uppercase tracking-widest text-xs">Game Name</span>
                        <span class="text-white font-bold">{{ successData.game_name || form.game_name }}</span>
                    </div>
                    <div class="h-px bg-white/5"></div>
                    <div class="flex justify-between items-center">
                        <span class="text-slate-500 uppercase tracking-widest text-xs">VM ID</span>
                        <span class="text-white font-bold">{{ successData.vm_id || form.vm_id }}</span>
                    </div>
                    <div class="h-px bg-white/5"></div>
                    <div class="flex justify-between items-center">
                        <span class="text-slate-500 uppercase tracking-widest text-xs">Game ID</span>
                        <span class="text-purple-400 font-bold">{{ successData.game_id || successData.temporary_game_id }}</span>
                    </div>
                    <template v-if="successData.arn">
                        <div class="h-px bg-white/5"></div>
                        <div class="flex flex-col gap-1">
                            <span class="text-slate-500 uppercase tracking-widest text-xs">ARN</span>
                            <span class="text-purple-300 text-xs break-all">{{ successData.arn }}</span>
                        </div>
                    </template>
                </div>

                <div class="flex gap-4 justify-center">
                    <button @click="resetForm" class="px-6 py-3 border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 rounded-lg text-sm font-bold transition-colors">
                        Register Another
                    </button>
                    <router-link to="/gaming" class="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-bold transition-colors">
                        Back to Console
                    </router-link>
                </div>
            </div>

            <!-- Form -->
            <div v-else class="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden shadow-2xl border-t-4 border-t-purple-500">
                <div class="px-10 py-8 border-b border-white/5 bg-black/20">
                    <h2 class="text-lg font-bold text-white">Package Configuration</h2>
                    <p class="text-xs text-slate-500 mt-1 font-mono uppercase tracking-wider">Step 1 of 1 – Upload & Register</p>
                </div>

                <form @submit.prevent="handleSubmit" class="p-10 space-y-8">

                    <!-- Section 01: Game Identity -->
                    <div class="space-y-6">
                        <h3 class="text-xs font-bold text-purple-400 uppercase tracking-widest font-mono border-b border-white/5 pb-2">01 // Game Identity</h3>

                        <div class="space-y-2">
                            <label for="game_name" class="block text-xs font-bold text-slate-400 uppercase tracking-widest">Game Name</label>
                            <input id="game_name" v-model="form.game_name" type="text"
                                class="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                                placeholder="e.g. Cyberpunk 2077" required />
                        </div>
                    </div>

                    <!-- Section 02: Compute Fleet -->
                    <div class="space-y-6">
                        <h3 class="text-xs font-bold text-purple-400 uppercase tracking-widest font-mono border-b border-white/5 pb-2">02 // Compute Fleet</h3>

                        <div class="space-y-2">
                            <label for="vm_id" class="block text-xs font-bold text-slate-400 uppercase tracking-widest">VM Instance</label>
                            <select id="vm_id" v-model="form.vm_id"
                                class="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-colors appearance-none">
                                <option value="" disabled class="bg-[#05080F]">Select a VM type...</option>
                                <option v-for="vm in vmOptions" :key="vm.value" :value="vm.value" class="bg-[#05080F]">
                                    {{ vm.label }}
                                </option>
                            </select>
                            <p class="text-[10px] text-slate-500 uppercase tracking-wider">The managed instance type your game server will run on.</p>
                        </div>
                    </div>

                    <!-- Section 03: Media Payload -->
                    <div class="space-y-6">
                        <h3 class="text-xs font-bold text-purple-400 uppercase tracking-widest font-mono border-b border-white/5 pb-2">03 // Media Payload</h3>

                        <div class="space-y-2">
                            <label for="file" class="block text-xs font-bold text-slate-400 uppercase tracking-widest">Game Package (.zip)</label>
                            <label for="file"
                                class="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group">
                                <div class="flex flex-col items-center gap-3 text-slate-500 group-hover:text-purple-400 transition-colors">
                                    <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <span v-if="selectedFile" class="text-sm font-bold text-purple-400">{{ selectedFile.name }}</span>
                                    <div v-else class="text-center">
                                        <p class="text-sm font-bold">Click to upload package</p>
                                        <p class="text-xs mt-1 uppercase tracking-widest">Must contain root game.json manifest</p>
                                    </div>
                                </div>
                                <input id="file" type="file" accept=".zip" @change="handleFileChange" class="hidden" />
                            </label>
                            <p class="text-[10px] text-slate-500 uppercase tracking-wider">Your ZIP must include a <span class="text-purple-400 font-mono">game.json</span> in the root directory.</p>
                        </div>
                    </div>

                    <!-- Upload Progress -->
                    <div v-if="loading" class="pt-2">
                        <div class="flex justify-between text-xs font-mono text-slate-400 mb-2">
                            <span>{{ uploadStatus }}</span>
                            <span>{{ uploadProgress }}%</span>
                        </div>
                        <div class="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div class="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full transition-all duration-500"
                                :style="{ width: uploadProgress + '%' }"></div>
                        </div>
                    </div>

                    <!-- Error -->
                    <div v-if="error" class="bg-red-500/10 border border-red-500/20 rounded-lg px-5 py-4 text-sm text-red-400 flex items-start gap-3">
                        <svg class="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {{ error }}
                    </div>

                    <!-- Actions -->
                    <div class="pt-6 flex items-center justify-end gap-6 border-t border-white/10">
                        <router-link to="/gaming" class="text-sm font-bold text-slate-500 hover:text-white transition-colors">
                            Cancel
                        </router-link>
                        <button type="submit" :disabled="loading"
                            class="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg px-8 py-3 flex items-center gap-3 transition-colors">
                            <div v-if="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span v-else>Register Game Fleet</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>
