<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRdsStore } from '../store/rdsStore'
import { useDocsStore } from '../../docs/store/docsStore'

const router = useRouter()
const rdsStore = useRdsStore()
const docsStore = useDocsStore()

const volumeName = ref('')
const volumeSize = ref(20)
const isCreating = ref(false)

const handleCreate = async () => {
    if (!volumeName.value || !volumeSize.value) return
    isCreating.value = true
    try {
        await rdsStore.createRdsVolume({
            name: volumeName.value,
            sizeGb: volumeSize.value
        })
        router.push('/rds/volumes')
    } catch (e) {
        console.error('Failed to create volume:', e)
    } finally {
        isCreating.value = false
    }
}

const cancel = () => {
    router.back()
}
</script>

<template>
    <div class="min-h-screen bg-white text-[#16191f] font-urbanist selection:bg-amber-500/20 selection:text-amber-900">
        <div class="relative pt-24 pb-40">
            <!-- Grid Background -->
            <div
                class="absolute inset-0 bg-[linear-gradient(rgba(251,191,36,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(251,191,36,0.06)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none">
            </div>

            <div class="relative z-10 max-w-7xl mx-auto px-6">
                <!-- Breadcrumbs -->
                <nav class="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] mb-12">
                    <button @click="router.push('/dashboard')"
                        class="text-[#879196] hover:text-amber-600 transition-colors">Dashboard</button>
                    <span class="text-[#eaeded] font-light">/</span>
                    <button @click="router.push('/rds/databases')"
                        class="text-[#879196] hover:text-amber-600 transition-colors">Managed_Database</button>
                    <span class="text-[#eaeded] font-light">/</span>
                    <button @click="router.push('/rds/volumes')"
                        class="text-[#879196] hover:text-amber-600 transition-colors">Storage_Volumes</button>
                    <span class="text-[#eaeded] font-light">/</span>
                    <span class="text-amber-600 italic">Create_Volume</span>
                </nav>

                <div class="flex items-center gap-4 mb-12">
                    <h1 class="text-6xl font-black text-[#232f3e] tracking-tighter uppercase leading-none">
                        Create_Volume</h1>
                    <button @click="docsStore.openHelp('rds', 'rds-volumes')"
                        class="flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#232f3e] text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all shadow-[4px_4px_0px_#232f3e] active:translate-y-0.5 active:shadow-none">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Help_Center
                    </button>
                </div>

                <div class="max-w-3xl">
                    <div class="p-10 border-4 border-[#232f3e] bg-white shadow-[12px_12px_0px_#232f3e]">
                        <h3 class="text-[10px] font-black text-[#879196] uppercase tracking-[0.2em] mb-8">
                            Volume_Configuration</h3>

                        <div class="space-y-10">
                            <div>
                                <label
                                    class="block text-[10px] font-black text-[#232f3e] uppercase tracking-widest mb-3">Volume_Identifier</label>
                                <p class="text-xs text-[#545b64] mb-4">A descriptive name for your block storage unit.
                                </p>
                                <input v-model="volumeName" type="text"
                                    class="w-full px-4 py-4 border-2 border-[#eaeded] focus:border-[#232f3e] outline-none font-mono text-sm transition-all"
                                    placeholder="my-data-volume" />
                            </div>

                            <div>
                                <label
                                    class="block text-[10px] font-black text-[#232f3e] uppercase tracking-widest mb-3">Allocated_Storage
                                    (GiB)</label>
                                <p class="text-xs text-[#545b64] mb-4">Specify the size for redundant block storage.</p>
                                <div class="flex items-center gap-6">
                                    <input v-model.number="volumeSize" type="range" min="10" max="1024"
                                        class="flex-1 accent-amber-500 h-2 bg-[#eaeded] rounded-none appearance-none cursor-pointer" />
                                    <div
                                        class="w-24 px-4 py-3 border-2 border-[#232f3e] text-center font-black text-[#232f3e]">
                                        {{ volumeSize }}G
                                    </div>
                                </div>
                            </div>

                            <div class="pt-6 border-t-2 border-[#eaeded] flex justify-end gap-6 items-center">
                                <button @click="cancel"
                                    class="text-[10px] font-black text-[#879196] uppercase tracking-[0.2em] hover:text-[#232f3e] transition-colors">Cancel_Action</button>
                                <button @click="handleCreate" :disabled="isCreating || !volumeName"
                                    class="px-10 py-4 bg-[#232f3e] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-amber-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                                    {{ isCreating ? 'Initializing_Volume...' : 'Provision_Volume' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800;900&display=swap');

.font-urbanist {
    font-family: 'Urbanist', sans-serif;
}
</style>
