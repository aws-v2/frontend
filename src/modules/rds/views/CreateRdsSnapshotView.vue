<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useRdsStore } from '../store/rdsStore'

const router = useRouter()
const route = useRoute()
const rdsStore = useRdsStore()

const dbId = computed(() => route.params.id as string)
const db = computed(() => rdsStore.currentDatabase)

const snapshotName = ref('')
const isCreating = ref(false)

onMounted(async () => {
    if (!db.value || db.value?.id !== dbId.value) {
        await rdsStore.fetchDatabaseById(dbId.value)
    }
    // Default snapshot name
    const now = new Date()
    const isoString = now.toISOString()
    const timeString = now.toTimeString()
    const dateStr = isoString.split('T')[0] || 'date'
    const timeStr = timeString.split(' ')[0]?.replace(/:/g, '-') || 'time'
    const dbName = db.value?.name || 'database'
    snapshotName.value = `${dbName}-snapshot-${dateStr}-${timeStr}`
})

const createSnapshot = async () => {
    if (!snapshotName.value) return
    isCreating.value = true
    try {
        await rdsStore.createSnapshot(dbId.value, snapshotName.value)
        router.push(`/rds/databases/${dbId.value}`)
    } catch (e) {
        console.error('Failed to create snapshot:', e)
    } finally {
        isCreating.value = false
    }
}

const cancel = () => {
    router.push(`/rds/databases/${dbId.value}`)
}
</script>

<template>
    <div class="min-h-screen bg-[var(--bg-console)] pb-20">
        <!-- Breadcrumbs -->
        <nav
            class="bg-white border-b border-gray-200 px-6 py-2 flex items-center gap-2 text-xs font-medium text-gray-500">
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
            <a href="#" @click.prevent="router.push('/rds/databases')"
                class="hover:text-[var(--aws-blue)] hover:underline">Databases</a>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <a href="#" @click.prevent="cancel" class="hover:text-[var(--aws-blue)] hover:underline">{{ db?.name || dbId
                }}</a>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span class="text-gray-900">Take snapshot</span>
        </nav>

        <div class="px-8 py-6 pt-20">
            <div class="flex items-center gap-2 mb-6">
                <h1 class="text-2xl font-bold text-gray-900 leading-tight">Take DB snapshot</h1>
                <span class="text-[var(--aws-blue)] cursor-help">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </span>
            </div>

            <!-- Settings -->
            <div class="aws-card p-6 rounded-sm mb-6 max-w-4xl">
                <h3 class="text-base font-bold text-gray-900 mb-4">Settings</h3>

                <!-- DB instance identifier -->
                <div class="mb-6">
                    <label class="aws-label uppercase tracking-wider text-[10px] text-gray-500">DB instance</label>
                    <div class="text-sm font-bold text-gray-900">{{ db?.name || dbId }}</div>
                </div>

                <!-- Snapshot name -->
                <div class="mb-6 max-w-2xl">
                    <label class="aws-label">Snapshot identifier</label>
                    <p class="text-[11px] text-gray-500 mb-2">The snapshot name must be unique for your account in the
                        current AWS Region.</p>
                    <input v-model="snapshotName" type="text" class="aws-input" placeholder="my-db-snapshot" />
                    <p class="text-[10px] text-gray-500 mt-1 italic">Constraints: 1 to 255 alphanumeric characters,
                        hyphens or periods. First character must be a letter. Can't contain two consecutive hyphens.
                        Can't end with a hyphen.</p>
                </div>
            </div>
        </div>

        <!-- Footer Actions -->
        <div
            class="fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-gray-200 flex items-center justify-end px-8 gap-4 z-50">
            <button @click="cancel" class="text-xs font-bold text-[var(--aws-blue)] hover:underline">Cancel</button>
            <button @click="createSnapshot" :disabled="isCreating || !snapshotName"
                class="px-8 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0px_#232f3e] active:translate-y-0.5 active:shadow-none">
                {{ isCreating ? 'Taking snapshot...' : 'Take snapshot' }}
            </button>
        </div>
    </div>
</template>

<style scoped>
/* Scoped styles if needed */
</style>
