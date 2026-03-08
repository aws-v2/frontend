<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, onMounted, computed } from 'vue'
import { useS3Store, type Bucket } from '@/modules/s3/store/s3Store'
import { useToastStore } from '@/shared/store/toastStore'
import EmptyBucketModal from '../components/EmptyBucketModal.vue'
import DeleteBucketModal from '../components/DeleteBucketModal.vue'
import DocHelpDrawer from '@/modules/docs/components/DocHelpDrawer.vue'
import { useDocsStore } from '@/modules/docs/store/docsStore'
import { HelpCircle } from 'lucide-vue-next'

const router = useRouter()
const s3Store = useS3Store()
const toastStore = useToastStore()
const docsStore = useDocsStore()

const selectedBucketName = ref<string | null>(null)
const selectedBucketId = ref<string | null>(null)
const activeTab = ref('general')
const showEmptyModal = ref(false)
const showDeleteModal = ref(false)

const searchQuery = ref('')
const showSuccessBanner = ref(false)

const generalBuckets = computed(() => {
    const buckets = s3Store.buckets.filter((b: Bucket) => b.bucket_type !== 'DIRECTORY')
    if (!searchQuery.value) return buckets
    return buckets.filter((b: Bucket) => b.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

const directoryBuckets = computed(() => {
    const buckets = s3Store.buckets.filter((b: Bucket) => b.bucket_type === 'DIRECTORY')
    if (!searchQuery.value) return buckets
    return buckets.filter((b: Bucket) => b.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

const createBucket = () => {
    router.push('/s3/create-bucket')
}

const copyArn = () => {
    if (!selectedBucketName.value) return
    const bucket = s3Store.buckets.find(b => b.name === selectedBucketName.value)
    const arn = bucket?.arn || `arn:serw:s3:::${selectedBucketName.value}`
    navigator.clipboard.writeText(arn)
    toastStore.addToast(`ARN for ${selectedBucketName.value} copied to clipboard`, 'success')
}

const refreshBuckets = async () => {
    selectedBucketName.value = null
    selectedBucketId.value = null
    await s3Store.fetchBuckets()
    toastStore.addToast('Buckets refreshed', 'success')
}

const emptyBucket = () => {
    if (selectedBucketName.value) {
        const bucket = s3Store.buckets.find(b => b.name === selectedBucketName.value)
        if (bucket) selectedBucketId.value = bucket.bucket_id
        showEmptyModal.value = true
    }
}

const deleteBucket = () => {
    if (selectedBucketName.value) {
        const bucket = s3Store.buckets.find(b => b.name === selectedBucketName.value)
        if (bucket) selectedBucketId.value = bucket.bucket_id
        showDeleteModal.value = true
    }
}

const handleCleanupSuccess = () => {
    selectedBucketName.value = null
    selectedBucketId.value = null
    s3Store.fetchBuckets()
}

const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString()
}

const getAccessString = (bucket: any) => {
    const bpa = bucket.block_public_access
    if (!bpa) return 'Bucket and objects not public'
    if (bpa.block_all || (bpa.blockPublicAcls && bpa.ignorePublicAcls && bpa.blockPublicPolicy && bpa.restrictPublicBuckets)) {
        return 'Bucket and objects not public'
    }
    return 'Objects can be public'
}

onMounted(() => {
    s3Store.fetchBuckets()

    // Show success banner if a bucket was just created (mock logic)
    if (s3Store.buckets.length > 0) {
        showSuccessBanner.value = true
        setTimeout(() => {
            showSuccessBanner.value = false
        }, 8000)
    }
})

const handleTabChange = (tab: string) => {
    if (tab === 'directory') {
        toastStore.addToast('Directory buckets are coming soon to this region.', 'info')
        return
    }
    activeTab.value = tab
    selectedBucketName.value = null
}

const viewBucket = (bucket: any) => {
    let regionCode = 'eu-north-1'
    if (bucket.region) {
        const parts = bucket.region.split(' ')
        regionCode = parts[parts.length - 1]
    }

    router.push({
        path: `/s3/buckets/${bucket.name}`,
        query: {
            region: regionCode,
            tab: 'overview'
        }
    })
}
</script>

<template>
    <div
        class="min-h-screen bg-white text-[#232f3e] pb-32 font-urbanist relative overflow-hidden selection:bg-[#ff9900]/30 selection:text-[#232f3e]">
        <!-- Subtle Grid -->
        <div
            class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none [mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)]">
        </div>

        <div class="relative z-10 pt-32 pb-8 px-8 md:px-24 max-w-[1800px] mx-auto">
            <!-- Success Banner -->
            <transition name="slide-up">
                <div v-if="showSuccessBanner"
                    class="mb-10 p-5 bg-white border-2 border-[#eaeded] flex justify-between items-center shadow-lg">
                    <div class="flex items-center gap-4">
                        <div
                            class="w-10 h-10 bg-[#fafafa] border border-[#eaeded] text-[#ff9900] flex items-center justify-center">
                            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <p class="text-sm font-bold text-[#232f3e] tracking-tight uppercase italic">Successfully
                                created bucket "{{ s3Store.buckets[s3Store.buckets.length - 1]?.name }}"</p>
                            <p class="text-[11px] text-[#545b64] mt-0.5 leading-relaxed font-medium">To upload files and
                                folders, or to configure additional bucket settings, choose View details.</p>
                        </div>
                    </div>
                    <div class="flex gap-3">
                        <button
                            class="px-4 py-2 text-[10px] font-black text-[#ff9900] uppercase tracking-widest border border-[#eaeded] hover:border-[#ff9900] transition-all">View
                            details</button>
                        <button class="p-2 text-[#545b64] hover:text-[#232f3e] transition-colors"
                            @click="showSuccessBanner = false">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </transition>

            <div class="flex justify-between items-end mb-10 border-b-2 border-[#eaeded] pb-0">
                <div class="flex gap-10">
                    <button @click="handleTabChange('general')"
                        class="relative pb-4 text-xs font-black uppercase tracking-widest transition-all"
                        :class="activeTab === 'general' ? 'text-[#ff9900]' : 'text-[#545b64] hover:text-[#232f3e]'">
                        General purpose buckets
                        <div v-if="activeTab === 'general'"
                            class="absolute bottom-[-2px] left-0 right-0 h-0.5 bg-[#ff9900]"></div>
                    </button>
                    <button @click="handleTabChange('directory')"
                        class="relative pb-4 text-xs font-black uppercase tracking-widest transition-all group/tab"
                        :class="activeTab === 'directory' ? 'text-[#ff9900]' : 'text-[#545b64] hover:text-[#232f3e]'">
                        Directory buckets
                        <span
                            class="absolute -top-1 -right-8 px-1.5 py-0.5 bg-[#ff9900]/10 text-[#ff9900] text-[8px] border border-[#ff9900]/20 opacity-0 group-hover/tab:opacity-100 transition-opacity whitespace-nowrap font-black uppercase tracking-widest">Coming
                            Soon</span>
                        <div v-if="activeTab === 'directory'"
                            class="absolute bottom-[-2px] left-0 right-0 h-0.5 bg-[#ff9900]"></div>
                    </button>
                </div>
            </div>

            <div class="flex flex-col lg:flex-row gap-8 items-start">
                <!-- Main Content (Table) -->
                <div class="flex-grow min-w-0 w-full">
                    <div class="bg-white border-2 border-[#eaeded] overflow-hidden shadow-sm">
                        <!-- Table Header Controls -->
                        <div
                            class="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#fafafa] border-b border-[#eaeded] px-8">
                            <div class="flex items-center gap-3">
                                <h2 class="text-2xl font-black text-[#232f3e] uppercase tracking-tighter italic">
                                    {{ activeTab === 'general' ? 'General purpose' : 'Directory' }}
                                    <span class="text-[#ff9900] ml-1">({{ activeTab === 'general' ?
                                        generalBuckets.length : directoryBuckets.length }})</span>
                                </h2>
                            </div>
                            <div class="flex flex-wrap gap-3">
                                <button @click="refreshBuckets"
                                    class="p-2.5 bg-white border border-[#eaeded] hover:border-[#ff9900] transition-all text-[#545b64] hover:text-[#ff9900] shadow-sm"
                                    title="Refresh buckets">
                                    <svg class="w-4 h-4" :class="{ 'animate-spin': s3Store.isLoading }" fill="none"
                                        stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>
                                <button @click="copyArn" :disabled="!selectedBucketName"
                                    class="px-4 py-2 bg-white border border-[#eaeded] text-[10px] font-black text-[#232f3e] hover:border-[#ff9900] hover:text-[#ff9900] transition-all disabled:opacity-30 uppercase tracking-widest shadow-sm">Copy
                                    ARN</button>
                                <button @click="emptyBucket" :disabled="!selectedBucketName"
                                    class="px-4 py-2 bg-white border border-[#eaeded] text-[10px] font-black text-[#232f3e] hover:border-[#ff9900] hover:text-[#ff9900] transition-all disabled:opacity-30 uppercase tracking-widest shadow-sm">Empty</button>
                                <button @click="deleteBucket" :disabled="!selectedBucketName"
                                    class="px-4 py-2 bg-white border border-[#eaeded] text-[10px] font-black text-red-600/70 hover:border-red-600 hover:text-red-600 transition-all disabled:opacity-30 uppercase tracking-widest shadow-sm">Delete</button>
                                <button @click="createBucket"
                                    class="px-6 py-2 bg-[#ff9900] border-2 border-[#ff9900] text-white text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white hover:text-[#ff9900] shadow-md active:scale-95">Create
                                    bucket</button>
                            </div>
                        </div>

                        <!-- Search and Pagination -->
                        <div
                            class="p-6 px-8 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-[#eaeded]">
                            <div class="relative w-full md:w-96">
                                <svg class="absolute left-4 top-3.5 w-4 h-4 text-[#545b64]" fill="none"
                                    stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input v-model="searchQuery" type="text" placeholder="Find buckets by name..."
                                    class="input-field pl-11 text-xs px-4 py-2 uppercase font-bold tracking-widest">
                            </div>
                            <div class="flex items-center gap-6 text-xs font-black">
                                <div class="flex items-center gap-4 text-[#545b64]">
                                    <button disabled
                                        class="opacity-20 hover:text-[#232f3e] transition-colors">⟨</button>
                                    <span
                                        class="text-[#ff9900] bg-[#ff9900]/10 px-2 py-0.5 border border-[#ff9900]/20">1</span>
                                    <button disabled
                                        class="opacity-20 hover:text-[#232f3e] transition-colors">⟩</button>
                                </div>
                            </div>
                        </div>

                        <!-- Table -->
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead
                                    class="bg-[#fafafa] border-b border-[#eaeded] uppercase tracking-widest text-[10px] font-black text-[#545b64]">
                                    <tr>
                                        <th class="w-16 p-6"></th>
                                        <th class="p-6 border-r border-[#eaeded]">Name</th>
                                        <th class="p-6 border-r border-[#eaeded]">AWS Region</th>
                                        <th class="p-6">Creation date</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-[#eaeded]">
                                    <tr v-for="bucket in (activeTab === 'general' ? generalBuckets : directoryBuckets)"
                                        :key="bucket.name"
                                        class="group hover:bg-[#fafafa] transition-colors cursor-pointer"
                                        :class="selectedBucketName === bucket.name ? 'bg-[#ff9900]/5' : ''"
                                        @click="viewBucket(bucket)">
                                        <td class="p-6" @click.stop="selectedBucketName = bucket.name">
                                            <div class="flex justify-center">
                                                <div class="w-4 h-4 border-2 border-[#eaeded] flex items-center justify-center transition-all"
                                                    :class="selectedBucketName === bucket.name ? 'border-[#ff9900] bg-white' : 'group-hover:border-[#ff9900]/50'">
                                                    <div v-if="selectedBucketName === bucket.name"
                                                        class="w-2 h-2 bg-[#ff9900]"></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="p-6 border-r border-[#eaeded]">
                                            <span
                                                class="text-sm font-black text-[#232f3e] group-hover:text-[#ff9900] transition-colors uppercase tracking-tight italic">
                                                {{ bucket.name }}
                                            </span>
                                        </td>
                                        <td class="p-6 border-r border-[#eaeded] text-sm text-[#545b64] font-medium">
                                            {{ bucket.region }}
                                        </td>
                                        <td class="p-6 text-sm text-[#545b64] font-medium tabular-nums">
                                            {{ formatDate(bucket.created_at) }}
                                        </td>
                                    </tr>
                                    <tr
                                        v-if="(activeTab === 'general' ? generalBuckets.length : directoryBuckets.length) === 0">
                                        <td colspan="4"
                                            class="p-20 text-center text-[#545b64] text-sm italic py-32 bg-[#fafafa]">
                                            <div class="flex flex-col items-center gap-4">
                                                <svg class="w-12 h-12 text-[#eaeded]" fill="none" viewBox="0 0 24 24"
                                                    stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="1.5"
                                                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                                <p class="font-black uppercase tracking-widest">No {{ activeTab ===
                                                    'general' ? 'general purpose' : 'directory' }} buckets found in this
                                                    region.</p>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Right Side Panels -->
                <div class="w-full lg:w-96 flex-shrink-0 space-y-8">
                    <!-- Account Snapshot -->
                    <div class="bg-white border-2 border-[#eaeded] p-8 shadow-sm relative overflow-hidden group">
                        <h3
                            class="text-sm font-black text-[#232f3e] mb-6 flex items-center gap-3 uppercase tracking-widest italic">
                            <div class="w-2 h-2 bg-[#ff9900]"></div>
                            Account snapshot
                            <span
                                class="text-[#ff9900] hover:underline cursor-pointer font-black text-[10px] uppercase tracking-widest ml-auto">Info</span>
                        </h3>
                        <div
                            class="bg-[#ff9900]/10 text-[#ff9900] border border-[#ff9900]/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest inline-block mb-4">
                            Updated daily
                        </div>
                        <p class="text-[12px] text-[#545b64] mb-8 leading-relaxed font-medium">
                            Storage Lens provides deep visibility into storage usage and activity trends across your
                            entire account.
                        </p>
                        <button @click="router.push('/s3/storage-lens')"
                            class="bg-white border-2 border-[#eaeded] hover:border-[#ff9900] text-[#232f3e] hover:text-[#ff9900] p-3 text-xs font-black uppercase tracking-widest transition-all w-full shadow-sm">
                            View dashboard
                        </button>
                    </div>

                    <!-- External Access Summary -->
                    <div @click="router.push('/s3/access-summary')"
                        class="bg-white border-2 border-[#eaeded] p-8 shadow-sm relative overflow-hidden group cursor-pointer hover:border-[#ff9900] transition-colors">
                        <h3
                            class="text-sm font-black text-[#232f3e] mb-6 flex items-center gap-3 uppercase tracking-widest italic">
                            <div class="w-2 h-2 bg-[#ff9900]"></div>
                            External access summary
                            <span
                                class="text-[#ff9900] hover:underline cursor-pointer font-black text-[10px] uppercase tracking-widest ml-auto">Info</span>
                        </h3>
                        <div
                            class="bg-[#ff9900]/10 text-[#ff9900] border border-[#ff9900]/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest inline-block mb-4">
                            Updated daily
                        </div>
                        <p class="text-[12px] text-[#545b64] mb-4 leading-relaxed font-medium">
                            Identify bucket permissions that allow public access or access from other Serwin accounts.
                        </p>
                        <div
                            class="p-4 bg-[#fafafa] border border-[#eaeded] text-[11px] text-[#545b64] italic font-medium leading-relaxed">
                            Findings help you audit security policies at scale.
                        </div>
                    </div>

                    <!-- Help Trigger -->
                    <div @click="docsStore.openHelp('s3', 's3-buckets-overview')"
                        class="bg-[#ff9900] p-8 shadow-sm flex items-center justify-between cursor-pointer hover:bg-[#e68a00] transition-colors group">
                        <div class="flex items-center gap-4 text-white">
                            <HelpCircle :size="24" />
                            <div>
                                <h3 class="text-sm font-black uppercase tracking-widest italic">Bucket Help</h3>
                                <p class="text-[10px] font-bold opacity-80 uppercase tracking-tight">Understanding S3
                                    Buckets</p>
                            </div>
                        </div>
                        <div class="text-white opacity-40 group-hover:opacity-100 transition-opacity">&rarr;</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Help Drawer -->
        <DocHelpDrawer :isOpen="docsStore.drawer.isOpen" :service="docsStore.drawer.service || 's3'"
            :slug="docsStore.drawer.slug || ''" @close="docsStore.closeHelp" />

        <!-- Modals -->
        <EmptyBucketModal :isOpen="showEmptyModal" :bucketName="selectedBucketName || ''"
            :bucketId="selectedBucketId || ''" @close="showEmptyModal = false" @success="handleCleanupSuccess" />
        <DeleteBucketModal :isOpen="showDeleteModal" :bucketName="selectedBucketName || ''"
            :bucketId="selectedBucketId || ''" @close="showDeleteModal = false" @success="handleCleanupSuccess" />
    </div>
</template>

<style scoped>
.input-field {
    @apply w-full bg-[#fafafa] border-2 border-[#eaeded] text-[#232f3e] placeholder-[#545b64] focus:outline-none focus:border-[#ff9900] transition-all;
}

/* Tab underline animation helper could go here if needed, but Tailwind classes suffice */

.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
    transform: translateY(20px);
    opacity: 0;
}
</style>
