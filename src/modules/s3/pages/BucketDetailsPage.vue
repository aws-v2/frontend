<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useS3Store } from '../store/s3Store'
import OverviewTab from '../components/bucket-details/tabs/OverviewTab.vue'
import ConnectivityTab from '../components/bucket-details/tabs/ConnectivityTab.vue'
import SettingsTab from '../components/bucket-details/tabs/SettingsTab.vue'

const route = useRoute()
const router = useRouter()
const s3Store = useS3Store()

const bucketName = computed(() => route.params.bucketName as string)
const region = computed(() => (route.query.region as string) || 'eu-north-1')
const activeTab = computed({
    get: () => (route.query.tab as string) || 'overview',
    set: (tab) => router.push({ query: { ...route.query, tab } })
})

const fetchData = () => {
    if (bucketName.value) {
        s3Store.fetchBucket(bucketName.value)
        s3Store.fetchBucketStats(bucketName.value)
    }
}

onMounted(fetchData)
watch(bucketName, fetchData)

const tabs = ['Overview', 'Connectivity', 'Settings']
</script>

<template>
    <div class="min-h-screen bg-white font-sans pb-24">
        <!-- Breadcrumbs -->
        <div class="h-10 border-b border-gray-200 bg-white flex items-center px-4 text-[11px] gap-2 text-gray-500">
            <span @click="router.push('/s3')" class="hover:text-[var(--aws-blue)] hover:underline cursor-pointer">
                Amazon S3
            </span>
            <span>></span>
            <span @click="router.push('/s3/buckets')"
                class="hover:text-[var(--aws-blue)] hover:underline cursor-pointer">
                Buckets
            </span>
            <span>></span>
            <span class="text-gray-900 font-bold">{{ bucketName }}</span>
        </div>

        <div class="p-8 px-10">
            <!-- Header -->
            <div class="mb-4">
                <h1 class="text-2xl font-bold text-gray-900 flex items-baseline gap-2">
                    {{ bucketName }}
                    <span
                        class="text-[10px] text-[var(--aws-blue)] hover:underline cursor-pointer uppercase font-bold tracking-tight">
                        Info
                    </span>
                </h1>
            </div>

            <!-- Tabs -->
            <div class="border-b border-gray-200 flex gap-8 mb-6">
                <button v-for="tab in tabs" :key="tab" @click="activeTab = tab.toLowerCase()"
                    class="pb-2 text-sm font-bold border-b-2 transition-colors px-1" :class="activeTab === tab.toLowerCase()
                        ? 'border-[var(--aws-blue)] text-[var(--aws-blue)]'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                        ">
                    {{ tab }}
                </button>
            </div>

            <!-- Tab Content -->
            <OverviewTab v-if="activeTab.toLowerCase() === 'overview'" :bucketName="bucketName" :region="region" />
            <ConnectivityTab v-else-if="activeTab.toLowerCase() === 'connectivity'" :bucketName="bucketName" />
            <SettingsTab v-else-if="activeTab.toLowerCase() === 'settings'" />
        </div>
    </div>
</template>
