<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useS3Store } from '../store/s3Store'
import OverviewTab from '../components/bucket-details/tabs/OverviewTab.vue'
import ConnectivityTab from '../components/bucket-details/tabs/ConnectivityTab.vue'
import SettingsTab from '../components/bucket-details/tabs/SettingsTab.vue'
import UploadResultModal from '../components/bucket-details/modals/UploadResultModal.vue'

const route = useRoute()
const router = useRouter()
const s3Store = useS3Store()

const bucketName = computed(() => route.params.bucketName as string)
const region = computed(() => (route.query.region as string) || 'eu-north-1')
const activeTab = computed({
    get: () => (route.query.tab as string) || 'overview',
    set: (tab) => router.push({ query: { ...route.query, tab } })
})

const currentPrefix = computed(() => (route.query.prefix as string) || '')

const fetchData = () => {
    if (bucketName.value) {
        s3Store.fetchBucket(bucketName.value)
        s3Store.fetchBucketStats(bucketName.value)
    }
}

onMounted(() => {
    if (route.query.tab === 'objects') {
        router.replace({ query: { ...route.query, tab: 'overview' } })
    }
    fetchData()
})

watch(() => route.query.tab, (newTab) => {
    if (newTab === 'objects') {
        router.replace({ query: { ...route.query, tab: 'overview' } })
    }
})

watch(bucketName, fetchData)
watch(currentPrefix, () => {
    if (bucketName.value && activeTab.value === 'overview') {
        s3Store.fetchFiles(bucketName.value, currentPrefix.value)
    }
})

const showUploadSuccess = computed(() => route.query.showUploadSuccess === 'true')

const closeResultModal = () => {
    // Clear query param and reset store state
    const query = { ...route.query }
    delete query.showUploadSuccess
    router.replace({ query })
    s3Store.lastUploadResult = null
}

const tabs = ['Overview', 'Connectivity', 'Settings']
</script>

<template>
    <div
        class="min-h-screen bg-white text-[#232f3e] pb-32 font-urbanist relative overflow-hidden selection:bg-[#ff9900]/30 selection:text-[#232f3e]">
        <!-- Subtle Grid -->
        <div
            class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none [mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)]">
        </div>

        <!-- Breadcrumbs -->
        <div
            class="h-14 border-b border-[#eaeded] bg-[#fafafa] flex items-center px-12 text-[11px] gap-4 text-[#545b64] relative z-10 font-black uppercase tracking-[0.2em] italic">
            <span @click="router.push('/s3')" class="hover:text-[#ff9900] cursor-pointer transition-colors">
                Amazon S3
            </span>
            <span class="text-[#eaeded] not-italic text-lg mx-2">/</span>
            <span @click="router.push('/s3/buckets')" class="hover:text-[#ff9900] cursor-pointer transition-colors">
                Buckets
            </span>
            <span class="text-[#eaeded] not-italic text-lg mx-2">/</span>
            <span
                class="text-[#232f3e] italic font-black transition-all hover:text-[#ff9900] cursor-pointer underline decoration-[#ff9900]/20 underline-offset-4">{{
                bucketName }}</span>
        </div>

        <div class="relative z-10 p-8 px-8 md:px-24 pt-16 max-w-[1800px] mx-auto">
            <!-- Header -->
            <div class="mb-12 flex items-end justify-between border-b-2 border-[#eaeded] pb-8">
                <div>
                    <h1
                        class="text-6xl font-black text-[#232f3e] flex items-baseline gap-6 tracking-tighter uppercase italic">
                        {{ bucketName }}
                        <span
                            class="text-[12px] text-[#ff9900] bg-[#fafafa] px-4 py-1.5 border-2 border-[#eaeded] hover:border-[#ff9900] cursor-pointer uppercase font-black tracking-[0.2em] transition-all not-italic">
                            Bucket Details
                        </span>
                    </h1>
                </div>
            </div>

            <!-- Tabs -->
            <div class="flex gap-12 mb-12 border-b-2 border-[#eaeded] pb-0">
                <button v-for="tab in tabs" :key="tab" @click="activeTab = tab.toLowerCase()"
                    class="relative pb-6 text-xs font-black uppercase tracking-[0.2em] transition-all" :class="activeTab === tab.toLowerCase()
                        ? 'text-[#ff9900]'
                        : 'text-[#545b64] hover:text-[#232f3e]'
                        ">
                    {{ tab }}
                    <div v-if="activeTab === tab.toLowerCase()"
                        class="absolute bottom-[-2px] left-0 right-0 h-1 bg-[#ff9900]"></div>
                </button>
            </div>

            <!-- Tab Content -->
            <div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <OverviewTab v-if="activeTab.toLowerCase() === 'overview'"
                    :key="`overview-${bucketName}-${currentPrefix}`" :bucketName="bucketName" :region="region"
                    :prefix="currentPrefix" />
                <ConnectivityTab v-else-if="activeTab.toLowerCase() === 'connectivity'"
                    :key="`connectivity-${bucketName}`" :bucketName="bucketName" />
                <SettingsTab v-else-if="activeTab.toLowerCase() === 'settings'" :key="`settings-${bucketName}`" />
            </div>

            <!-- Upload Result Modal -->
            <UploadResultModal :isOpen="showUploadSuccess" :result="s3Store.lastUploadResult"
                @close="closeResultModal" />
        </div>
    </div>
</template>

<style scoped>
.glass-panel {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
}
</style>
