<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useRdsStore } from '../store/rdsStore'

const router = useRouter()
const route = useRoute()
const rdsStore = useRdsStore()

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
    <div class="min-h-screen bg-[var(--bg-console)] pb-20 font-urbanist">
        <!-- Breadcrumbs -->
        <nav
            class="bg-white border-b border-gray-200 px-6 py-2 flex items-center gap-2 text-xs font-medium text-gray-500 mb-12">
            <a href="#" @click.prevent="router.push('/dashboard')"
                class="hover:text-[var(--aws-blue)] hover:underline uppercase tracking-wider text-[10px]">AWS</a>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <a href="#" @click.prevent="router.push('/rds/databases')"
                class="hover:text-[var(--aws-blue)] hover:underline">Amazon RDS</a>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span class="text-gray-900">Restore from Snapshot</span>
        </nav>

        <div class="px-8 max-w-4xl mx-auto">
            <div class="flex items-center gap-2 mb-8">
                <h1 class="text-3xl font-black text-[#232f3e] uppercase tracking-tighter italic">Restore DB Instance
                </h1>
            </div>

            <!-- Source Info -->
            <div class="aws-card p-8 rounded-sm mb-8 border-4 border-[#232f3e] bg-white">
                <h3 class="text-sm font-black text-[#879196] uppercase tracking-[0.2em] mb-6">Source_Snapshot</h3>
                <div class="flex items-center gap-4 p-4 bg-[#fafafa] border-2 border-[#eaeded]">
                    <span class="text-2xl">📸</span>
                    <div>
                        <div class="text-[10px] font-black text-[#879196] uppercase tracking-widest">Snapshot Identifier
                        </div>
                        <div class="text-sm font-mono text-[#232f3e] break-all">{{ snapshotId }}</div>
                    </div>
                </div>
            </div>

            <!-- New Instance Settings -->
            <div class="aws-card p-8 rounded-sm mb-8 border-4 border-[#232f3e] bg-white">
                <h3 class="text-sm font-black text-[#879196] uppercase tracking-[0.2em] mb-6">Instance_Registry_Settings
                </h3>

                <div class="mb-8">
                    <label class="aws-label flex items-center gap-2">
                        DB instance identifier
                        <span
                            class="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-2 py-0.5 border border-amber-200">Required</span>
                    </label>
                    <p class="text-[11px] text-[#545b64] mb-3">The unique name for the restored database node in your
                        VPC cluster.</p>
                    <input v-model="newDbId" type="text" class="aws-input font-mono"
                        placeholder="restored-db-instance" />
                    <p class="text-[9px] text-[#879196] mt-2 italic flex items-center gap-1">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        Restore uses standard Postgres/MySQL engine configurations by default.
                    </p>
                </div>
            </div>

            <!-- Tip -->
            <div class="p-6 border-l-4 border-amber-500 bg-amber-50 mb-12">
                <div class="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">Architecture Note
                </div>
                <p class="text-xs text-amber-900/70 leading-relaxed font-medium">Restoring from a snapshot creates a
                    completely new DB instance. Your original database remains untouched.</p>
            </div>
        </div>

        <!-- Footer Actions -->
        <div
            class="fixed bottom-0 left-0 right-0 h-16 bg-white border-t-4 border-[#232f3e] flex items-center justify-end px-12 gap-6 z-50">
            <button @click="cancel"
                class="text-[10px] font-black text-[#879196] hover:text-[#232f3e] uppercase tracking-widest transition-colors">Cancel</button>
            <button @click="handleRestore" :disabled="isRestoring || !newDbId"
                class="px-10 py-4 bg-amber-500 text-white font-black uppercase tracking-widest text-xs hover:bg-amber-600 transition-all shadow-[6px_6px_0px_#232f3e] active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed">
                {{ isRestoring ? 'Restoring Node...' : 'Restore DB Instance' }}
            </button>
        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800;900&display=swap');

.font-urbanist {
    font-family: 'Urbanist', sans-serif;
}
</style>
