<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useRdsStore } from '../store/rdsStore'
import { useDocsStore } from '../../docs/store/docsStore'

const router = useRouter()
const route = useRoute()
const rdsStore = useRdsStore()
const docsStore = useDocsStore()

const snapshotId = computed(() => route.params.snapshotId as string)
const newDbId = ref('')
const isRestoring = ref(false)

const handleRestore = async () => {
    if (!newDbId.value) return
    isRestoring.value = true
    try {
        await rdsStore.restoreDatabase(snapshotId.value, newDbId.value)
        router.push('/rds/databases')
    } catch (e) {
        console.error('Failed to restore database:', e)
    } finally {
        isRestoring.value = false
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
                    <span class="text-amber-600 italic">Restore_Database</span>
                </nav>

                <div class="flex items-center gap-4 mb-12">
                    <h1 class="text-6xl font-black text-[#232f3e] tracking-tighter uppercase leading-none">
                        Restore_Instance</h1>
                    <button @click="docsStore.openHelp('rds', 'rds-restore')"
                        class="flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#232f3e] text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all shadow-[4px_4px_0px_#232f3e] active:translate-y-0.5 active:shadow-none">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Help_Center
                    </button>
                </div>

                <div class="max-w-3xl">
                    <!-- Source Snapshot -->
                    <div class="p-8 border-4 border-[#232f3e] bg-[#fafafa] mb-10 relative overflow-hidden group">
                        <div
                            class="absolute right-0 top-0 w-32 h-32 bg-amber-500/5 rotate-45 translate-x-16 -translate-y-16">
                        </div>
                        <h3 class="text-[10px] font-black text-[#879196] uppercase tracking-[0.2em] mb-4">
                            Source_Snapshot</h3>
                        <div class="flex items-center gap-4">
                            <div
                                class="w-12 h-12 border-2 border-[#232f3e] flex items-center justify-center text-[#232f3e] bg-white group-hover:bg-amber-500 group-hover:text-white transition-all">
                                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div>
                                <p class="text-[10px] font-black text-[#879196] uppercase tracking-widest mb-1">
                                    Snapshot_Identifier</p>
                                <p class="text-xl font-black text-[#232f3e] leading-none">{{ snapshotId }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Input Card -->
                    <div class="p-10 border-4 border-[#232f3e] bg-white shadow-[12px_12px_0px_#232f3e]">
                        <h3 class="text-[10px] font-black text-[#879196] uppercase tracking-[0.2em] mb-8">
                            Target_Configuration</h3>

                        <div class="space-y-8">
                            <div>
                                <label
                                    class="block text-[10px] font-black text-[#232f3e] uppercase tracking-widest mb-3">New_Database_Identifier</label>
                                <p class="text-xs text-[#545b64] mb-4">Enter a unique name for the restored instance.
                                </p>
                                <input v-model="newDbId" type="text"
                                    class="w-full px-4 py-4 border-2 border-[#eaeded] focus:border-[#232f3e] outline-none font-mono text-sm transition-all"
                                    placeholder="restored-database-1" />
                            </div>

                            <div class="pt-6 border-t-2 border-[#eaeded] flex justify-end gap-6 items-center">
                                <button @click="cancel"
                                    class="text-[10px] font-black text-[#879196] uppercase tracking-[0.2em] hover:text-[#232f3e] transition-colors">Cancel_Action</button>
                                <button @click="handleRestore" :disabled="isRestoring || !newDbId"
                                    class="px-10 py-4 bg-[#232f3e] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-amber-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                                    {{ isRestoring ? 'Restoring_Cluster...' : 'Restore_Database_Instance' }}
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
