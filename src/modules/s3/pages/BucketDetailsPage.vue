<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const bucketName = computed(() => route.params.bucketName as string)
const region = computed(() => (route.query.region as string) || 'eu-north-1')
const activeTab = computed({
    get: () => (route.query.tab as string) || 'objects',
    set: (tab) => router.push({ query: { ...route.query, tab } })
})

const tabs = ['Objects', 'Metadata', 'Properties', 'Permissions', 'Metrics', 'Management', 'Access Points']

const searchQuery = ref('')
const showActionsDropdown = ref(false)
const hasMetadataConfig = ref(false)
const showGettingStarted = ref(true)
const isLoading = ref(false)

onMounted(() => {
    if (route.query.created === 'true') {
        hasMetadataConfig.value = true
        activeTab.value = 'metadata'
    }
})

watch(activeTab, (newTab) => {
    if (newTab.toLowerCase() === 'management') {
        isLoading.value = true
        setTimeout(() => {
            isLoading.value = false
        }, 1500)
    }
})
</script>

<template>
    <div class="min-h-screen bg-white font-sans pb-24">
        <!-- Breadcrumbs -->
        <div class="h-10 border-b border-gray-200 bg-white flex items-center px-4 text-[11px] gap-2 text-gray-500">
            <span @click="router.push('/s3')" class="hover:text-[var(--aws-blue)] hover:underline cursor-pointer">Amazon
                S3</span>
            <span>></span>
            <span @click="router.push('/s3/buckets')"
                class="hover:text-[var(--aws-blue)] hover:underline cursor-pointer">Buckets</span>
            <span>></span>
            <span class="text-gray-900 font-bold">{{ bucketName }}</span>
        </div>

        <div class="p-8 px-10">
            <!-- Header -->
            <div class="mb-4">
                <h1 class="text-2xl font-bold text-gray-900 flex items-baseline gap-2">
                    {{ bucketName }}
                    <span
                        class="text-[10px] text-[var(--aws-blue)] hover:underline cursor-pointer uppercase font-bold tracking-tight">Info</span>
                </h1>
            </div>

            <!-- Tabs -->
            <div class="border-b border-gray-200 flex gap-8 mb-6">
                <button v-for="tab in tabs" :key="tab" @click="activeTab = tab.toLowerCase()"
                    class="pb-2 text-sm font-bold border-b-2 transition-colors px-1"
                    :class="activeTab === tab.toLowerCase() ? 'border-[var(--aws-blue)] text-[var(--aws-blue)]' : 'border-transparent text-gray-600 hover:text-gray-900'">
                    {{ tab }}
                </button>
            </div>

            <!-- Metadata Tab -->
            <div v-if="activeTab.toLowerCase() === 'metadata'" class="space-y-6">

                <!-- Success Alert -->
                <div v-if="hasMetadataConfig && $route.query.created === 'true'"
                    class="border border-[var(--aws-blue)] bg-blue-50/10 p-4 rounded-sm flex items-start gap-3">
                    <svg class="w-5 h-5 text-[var(--aws-blue)] shrink-0 mt-0.5" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div class="flex-1">
                        <div class="flex justify-between items-start">
                            <h3 class="text-sm font-bold text-gray-900">Your request to create a metadata configuration
                                for this bucket is in progress</h3>
                            <button class="text-gray-400 hover:text-gray-600"><svg class="w-4 h-4" fill="none"
                                    stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12" />
                                </svg></button>
                        </div>
                        <p class="text-xs text-xs text-gray-600 mt-1">To see an updated status, refresh the page. When
                            the status is Active, if your destination table bucket is integrated with AWS Glue Data
                            Catalog, you can choose <span class="font-bold">Query table with Athena</span> to view your
                            metadata table data. <a href="#" class="text-[var(--aws-blue)] underline">Learn more ↗</a>
                        </p>
                    </div>
                </div>

                <!-- Getting started with metadata -->
                <div class="border border-gray-200 rounded-sm overflow-hidden bg-white">
                    <button @click="showGettingStarted = !showGettingStarted"
                        class="w-full px-4 py-3 bg-white border-b border-gray-200 flex items-center gap-2 hover:bg-gray-50">
                        <svg class="w-3 h-3 text-gray-600 transition-transform duration-200"
                            :class="showGettingStarted ? 'rotate-180' : '-rotate-90'" fill="currentColor"
                            viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clip-rule="evenodd" />
                        </svg>
                        <span class="text-lg font-bold text-gray-900">Getting started with metadata</span>
                    </button>

                    <div v-show="showGettingStarted" class="p-6 grid grid-cols-2 gap-8">
                        <div class="space-y-4">
                            <div
                                class="h-32 flex items-center justify-center bg-gray-50 rounded-sm border border-gray-100">
                                <svg class="w-20 h-20 text-gray-300" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h4 class="font-bold text-sm text-gray-900">Step 1 - Create a metadata configuration for
                                your bucket</h4>
                            <p class="text-xs text-gray-600">Create a configuration to generate and store object
                                metadata in S3 managed metadata tables. As long as the configuration is active on the
                                bucket, S3 continuously updates the tables to reflect the latest changes to your
                                bucket.</p>
                        </div>
                        <div class="space-y-4">
                            <div
                                class="h-32 flex items-center justify-center bg-gray-50 rounded-sm border border-gray-100">
                                <svg class="w-20 h-20 text-gray-300" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                                        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                                </svg>
                            </div>
                            <h4 class="font-bold text-sm text-gray-900">Step 2 - Analyze and build with your metadata
                                tables</h4>
                            <p class="text-xs text-gray-600">Your metadata tables are instantly queryable by any AWS
                                query engine that supports Apache Iceberg, such as Amazon Athena, Amazon QuickSight,
                                and Apache Spark. Use the wide range of AWS services to analyze and build with your
                                metadata. <a href="#" class="text-[var(--aws-blue)] underline">Learn more ↗</a></p>
                        </div>
                    </div>
                </div>

                <!-- Integration Info -->
                <div v-if="hasMetadataConfig"
                    class="border border-[var(--aws-blue)] bg-white p-4 rounded-sm flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <svg class="w-5 h-5 text-[var(--aws-blue)] shrink-0" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p class="text-xs text-gray-600">To analyze metadata tables in this Region with AWS query
                            engines, you must first enable table bucket integration with AWS analytics services.</p>
                    </div>
                    <button
                        class="px-4 py-1 text-xs font-bold border border-gray-300 rounded-sm hover:bg-gray-50 bg-white">Enable
                        integration</button>
                </div>

                <!-- Metadata configuration -->
                <div class="border border-gray-200 rounded-sm bg-white">
                    <div class="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
                        <div>
                            <h2 class="text-lg font-bold text-gray-900 flex gap-1 items-center">Metadata configuration
                                <span
                                    class="text-[10px] text-[var(--aws-blue)] hover:underline cursor-pointer uppercase font-bold tracking-tight">Info</span>
                            </h2>
                            <p class="text-xs text-gray-600 mt-1">You can interact with your metadata tables by using
                                Amazon Athena or any AWS query engine that supports Apache Iceberg. <a href="#"
                                    class="text-[var(--aws-blue)] underline">View query examples ↗</a></p>
                        </div>

                        <!-- Actions Toolbar (Active) -->
                        <div v-if="hasMetadataConfig" class="flex gap-2">
                            <button class="p-1 border border-gray-300 rounded-sm text-gray-500 hover:bg-gray-50"><svg
                                    class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg></button>
                            <button
                                class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-600 hover:bg-gray-50">Delete</button>
                            <button
                                class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-600 hover:bg-gray-50 flex items-center gap-1">Edit
                                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd"
                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                        clip-rule="evenodd" />
                                </svg></button>
                            <button
                                class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-600 hover:bg-gray-50 flex items-center gap-1">Preview
                                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd"
                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                        clip-rule="evenodd" />
                                </svg></button>
                            <button
                                class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-600 hover:bg-gray-50 flex items-center gap-1">Query
                                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd"
                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                        clip-rule="evenodd" />
                                </svg></button>
                        </div>
                    </div>

                    <!-- Empty State -->
                    <div v-if="!hasMetadataConfig" class="p-8 text-center bg-white">
                        <p class="text-xs font-bold text-gray-900 mb-4">No metadata configuration for this bucket</p>
                        <button @click="router.push(`/s3/buckets/${bucketName}/create-metadata-config`)"
                            class="px-4 py-1.5 text-xs font-bold bg-[var(--aws-orange)] text-white hover:opacity-90 rounded-sm">Create
                            metadata configuration</button>
                    </div>

                    <!-- Active State -->
                    <div v-else class="grid grid-cols-3 gap-8 p-6 bg-white text-xs">
                        <!-- Destination -->
                        <div>
                            <h4 class="font-bold text-gray-900 mb-2">Destination</h4>
                            <div class="space-y-3">
                                <div>
                                    <p class="text-gray-500">Table bucket type</p>
                                    <p class="text-gray-900">AWS</p>
                                </div>
                                <div>
                                    <p class="text-gray-500">Table bucket</p>
                                    <p class="text-[var(--aws-blue)] hover:underline cursor-pointer">aws-s3</p>
                                </div>
                                <div>
                                    <p class="text-gray-500">Namespace</p>
                                    <div
                                        class="flex items-center gap-1 text-[var(--aws-blue)] hover:underline cursor-pointer">
                                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                        </svg> b_{{ bucketName }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Journal Table -->
                        <div>
                            <h4 class="font-bold text-gray-900 mb-2 flex items-center gap-1">Journal table <span
                                    class="text-[10px] text-[var(--aws-blue)] uppercase font-bold tracking-tight">Info</span>
                            </h4>
                            <div class="space-y-3">
                                <div>
                                    <p class="text-gray-500">Table status</p>
                                    <p class="flex items-center gap-1 text-gray-900"><svg
                                            class="w-4 h-4 text-gray-400 animate-spin" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg> Creating</p>
                                </div>
                                <div>
                                    <p class="text-gray-500">Table name</p>
                                    <div
                                        class="flex items-center gap-1 text-[var(--aws-blue)] hover:underline cursor-pointer">
                                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M3 10h18M3 14h18m-9-4v8m-7-6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2z" />
                                        </svg> journal
                                    </div>
                                </div>
                                <div>
                                    <p class="text-gray-500">Fully qualified table name</p>
                                    <div
                                        class="flex items-center gap-1 text-[var(--aws-blue)] hover:underline cursor-pointer">
                                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                        </svg> aws-s3.b_{{ bucketName }}.journal
                                    </div>
                                </div>
                                <div>
                                    <p class="text-gray-500">Table ARN</p>
                                    <p class="text-gray-900">-</p>
                                </div>
                                <div>
                                    <p class="text-gray-500">Record expiration</p>
                                    <p class="text-gray-900">Disabled</p>
                                </div>
                            </div>
                        </div>

                        <!-- Live Inventory Table -->
                        <div>
                            <h4 class="font-bold text-gray-900 mb-2 flex items-center gap-1">Live inventory table <span
                                    class="text-[10px] text-[var(--aws-blue)] uppercase font-bold tracking-tight">Info</span>
                            </h4>
                            <div class="space-y-3">
                                <div>
                                    <p class="text-gray-500">Configuration status</p>
                                    <p class="text-gray-900">Enabled</p>
                                </div>
                                <div>
                                    <p class="text-gray-500">Table status</p>
                                    <p class="flex items-center gap-1 text-gray-900"><svg
                                            class="w-4 h-4 text-gray-400 animate-spin" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg> Creating</p>
                                </div>
                                <div>
                                    <p class="text-gray-500">Table name</p>
                                    <div
                                        class="flex items-center gap-1 text-[var(--aws-blue)] hover:underline cursor-pointer">
                                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M3 10h18M3 14h18m-9-4v8m-7-6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2z" />
                                        </svg> inventory
                                    </div>
                                </div>
                                <div>
                                    <p class="text-gray-500">Fully qualified table name</p>
                                    <div
                                        class="flex items-center gap-1 text-[var(--aws-blue)] hover:underline cursor-pointer">
                                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                        </svg> aws-s3.b_{{ bucketName }}.inventory
                                    </div>
                                </div>
                                <div>
                                    <p class="text-gray-500">Table ARN</p>
                                    <p class="text-gray-900">-</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <!-- Management Tab -->
            <div v-if="activeTab.toLowerCase() === 'management'" class="space-y-6">

                <!-- Lifecycle configuration -->
                <div class="border border-gray-200 rounded-sm bg-white">
                    <div class="p-4 border-b border-gray-200">
                        <h2 class="text-lg font-bold text-gray-900">Lifecycle configuration</h2>
                        <p class="text-xs text-gray-600 mt-1">To manage your objects so that they are stored cost
                            effectively throughout their lifecycle, configure their lifecycle. A lifecycle
                            configuration is a set of rules that define actions that Amazon S3 applies to a group of
                            objects. Lifecycle rules run once per day.</p>
                    </div>
                    <div class="p-4">
                        <div class="border border-gray-300 rounded-sm overflow-hidden bg-white">
                            <!-- Toolbar -->
                            <div class="bg-gray-50 border-b border-gray-200 p-2 flex justify-between items-center">
                                <h3 class="text-sm font-bold text-gray-900">Lifecycle rules</h3>
                                <div class="flex gap-2">
                                    <button
                                        class="p-1 border border-gray-300 rounded-sm text-gray-400 cursor-not-allowed bg-white"><svg
                                            class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg></button>
                                    <button
                                        class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-400 cursor-not-allowed bg-white">View
                                        details</button>
                                    <button
                                        class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-400 cursor-not-allowed bg-white">Edit</button>
                                    <button
                                        class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-400 cursor-not-allowed bg-white">Delete</button>
                                    <button
                                        class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-400 cursor-not-allowed bg-white flex items-center gap-1">Actions
                                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M19 9l-7 7-7-7" />
                                        </svg></button>
                                    <button
                                        class="px-3 py-1 text-xs font-bold border border-[var(--aws-blue)] text-[var(--aws-blue)] bg-white rounded-sm hover:bg-blue-50">Create
                                        lifecycle rule</button>
                                </div>
                            </div>
                            <!-- Description -->
                            <div class="p-4 border-b border-gray-200 bg-white">
                                <p class="text-xs text-gray-600">Use lifecycle rules to define actions you want
                                    Amazon S3 to take during an object's lifetime such as transitioning objects to
                                    another storage class, archiving them, or deleting them after a specified period
                                    of time. <a href="#" class="text-[var(--aws-blue)] underline">Learn more ↗</a>
                                </p>
                            </div>
                            <!-- Table Header -->
                            <div class="bg-gray-50 border-b border-gray-200 overflow-x-auto">
                                <div
                                    class="grid grid-cols-[150px_100px_100px_150px_150px_150px_150px] gap-4 px-4 py-2 text-xs font-bold text-gray-600 min-w-[900px]">
                                    <div class="border-r border-gray-300">Lifecycle rule name</div>
                                    <div class="border-r border-gray-300">Status</div>
                                    <div class="border-r border-gray-300">Scope</div>
                                    <div class="border-r border-gray-300">Current version actions</div>
                                    <div class="border-r border-gray-300">Noncurrent versions actions</div>
                                    <div class="border-r border-gray-300">Expired object delete markers</div>
                                    <div>Incomplete multipart upload</div>
                                </div>
                            </div>
                            <!-- Loading State -->
                            <div v-if="isLoading"
                                class="p-8 text-center text-gray-600 flex justify-center items-center gap-2">
                                <svg class="w-4 h-4 animate-spin text-gray-500" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span class="text-xs">Loading</span>
                            </div>
                            <!-- Empty State -->
                            <div v-else class="p-8 text-center text-gray-600">
                                <p class="text-sm font-bold mb-1">No lifecycle rules</p>
                                <p class="text-xs mb-4">There are no lifecycle rules for this bucket.</p>
                                <button
                                    class="px-3 py-1 text-xs font-bold border border-[var(--aws-blue)] text-[var(--aws-blue)] bg-white rounded-sm hover:bg-blue-50">Create
                                    lifecycle rule</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Replication rules -->
                <div class="border border-gray-200 rounded-sm bg-white">
                    <div class="p-4 border-b border-gray-200">
                        <h2 class="text-lg font-bold text-gray-900">Replication rules</h2>
                    </div>
                    <div class="p-4">
                        <div class="border border-gray-300 rounded-sm overflow-hidden bg-white">
                            <!-- Toolbar -->
                            <div class="bg-gray-50 border-b border-gray-200 p-2 flex justify-end items-center gap-2">
                                <button
                                    class="p-1 border border-gray-300 rounded-sm text-gray-400 cursor-not-allowed bg-white"><svg
                                        class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg></button>
                                <button
                                    class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-400 cursor-not-allowed bg-white">View
                                    details</button>
                                <button
                                    class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-400 cursor-not-allowed bg-white">Edit
                                    rule</button>
                                <button
                                    class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-400 cursor-not-allowed bg-white">Delete</button>
                                <button
                                    class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-400 cursor-not-allowed bg-white flex items-center gap-1">Actions
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M19 9l-7 7-7-7" />
                                    </svg></button>
                                <button
                                    class="px-3 py-1 text-xs font-bold border border-[var(--aws-blue)] text-[var(--aws-blue)] bg-white rounded-sm hover:bg-blue-50">Create
                                    replication rule</button>
                            </div>
                            <!-- Description -->
                            <div class="p-4 border-b border-gray-200 bg-white">
                                <p class="text-xs text-gray-600">Use replication rules to define options you want
                                    Amazon S3 to apply during replication such as server-side encryption, replica
                                    ownership, transitioning replicas to another storage class, and more. <a href="#"
                                        class="text-[var(--aws-blue)] underline">Learn more ↗</a></p>
                            </div>
                            <!-- Table Header -->
                            <div class="bg-gray-50 border-b border-gray-200 overflow-x-auto">
                                <div
                                    class="grid grid-cols-[120px_80px_120px_120px_80px_80px_100px_100px_150px_150px_150px] gap-4 px-4 py-2 text-xs font-bold text-gray-600 min-w-[1200px]">
                                    <div class="border-r border-gray-300">Replication rule name</div>
                                    <div class="border-r border-gray-300">Status</div>
                                    <div class="border-r border-gray-300">Destination bucket</div>
                                    <div class="border-r border-gray-300">Destination Region</div>
                                    <div class="border-r border-gray-300">Priority</div>
                                    <div class="border-r border-gray-300">Scope</div>
                                    <div class="border-r border-gray-300">Storage class</div>
                                    <div class="border-r border-gray-300">Replica owner</div>
                                    <div class="border-r border-gray-300">Replication Time Control</div>
                                    <div class="border-r border-gray-300">KMS-encrypted objects</div>
                                    <div>Replica modification sync</div>
                                </div>
                            </div>
                            <!-- Loading State -->
                            <div v-if="isLoading"
                                class="p-8 text-center text-gray-600 flex justify-center items-center gap-2">
                                <svg class="w-4 h-4 animate-spin text-gray-500" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span class="text-xs">Loading</span>
                            </div>
                            <!-- Empty State -->
                            <div v-else class="p-8 text-center text-gray-600">
                                <p class="text-sm font-bold mb-1">No replication rules</p>
                                <p class="text-xs mb-4">You don't have any rules in the replication configuration.
                                </p>
                                <button
                                    class="px-3 py-1 text-xs font-bold border border-[var(--aws-blue)] text-[var(--aws-blue)] bg-white rounded-sm hover:bg-blue-50">Create
                                    replication rule</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Inventory configurations -->
                <div class="border border-gray-200 rounded-sm bg-white">
                    <div class="p-4 border-b border-gray-200">
                        <h2 class="text-lg font-bold text-gray-900">Inventory configurations</h2>
                    </div>
                    <div class="p-4">
                        <div class="border border-gray-300 rounded-sm overflow-hidden bg-white">
                            <!-- Toolbar -->
                            <div class="bg-gray-50 border-b border-gray-200 p-2 flex justify-end items-center gap-2">
                                <button
                                    class="p-1 border border-gray-300 rounded-sm text-gray-400 cursor-not-allowed bg-white"><svg
                                        class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg></button>
                                <button
                                    class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-400 cursor-not-allowed bg-white">Edit</button>
                                <button
                                    class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-400 cursor-not-allowed bg-white">Delete</button>
                                <button
                                    class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-600 bg-white hover:bg-gray-50">Create
                                    job from manifest</button>
                                <button
                                    class="px-3 py-1 text-xs font-bold border border-[var(--aws-blue)] text-[var(--aws-blue)] bg-white rounded-sm hover:bg-blue-50">Create
                                    inventory configuration</button>
                            </div>
                            <!-- Description -->
                            <div class="p-4 border-b border-gray-200 bg-white">
                                <p class="text-xs text-gray-600">You can create inventory configurations on a bucket
                                    to generate a flat file list of your objects and metadata. These scheduled
                                    reports can include all objects in the bucket or be limited to a shared prefix.
                                    <a href="#" class="text-[var(--aws-blue)] underline">Learn more ↗</a>
                                </p>
                            </div>
                            <!-- Table Header -->
                            <div class="bg-gray-50 border-b border-gray-200 overflow-x-auto">
                                <div
                                    class="grid grid-cols-[150px_100px_100px_150px_100px_150px_100px] gap-4 px-4 py-2 text-xs font-bold text-gray-600 min-w-[800px]">
                                    <div class="border-r border-gray-300">Name</div>
                                    <div class="border-r border-gray-300">Status</div>
                                    <div class="border-r border-gray-300">Scope</div>
                                    <div class="border-r border-gray-300">Destination</div>
                                    <div class="border-r border-gray-300">Frequency</div>
                                    <div class="border-r border-gray-300">Last export</div>
                                    <div>Format</div>
                                </div>
                            </div>
                            <!-- Loading State -->
                            <div v-if="isLoading"
                                class="p-8 text-center text-gray-600 flex justify-center items-center gap-2">
                                <svg class="w-4 h-4 animate-spin text-gray-500" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span class="text-xs">Loading</span>
                            </div>
                            <!-- Empty State -->
                            <div v-else class="p-8 text-center text-gray-600">
                                <p class="text-sm font-bold mb-1">No configurations</p>
                                <p class="text-xs mb-4">No configurations to display</p>
                                <button
                                    class="px-3 py-1 text-xs font-bold border border-[var(--aws-blue)] text-[var(--aws-blue)] bg-white rounded-sm hover:bg-blue-50">Create
                                    inventory configuration</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Metrics Tab -->
            <div v-if="activeTab.toLowerCase() === 'metrics'" class="space-y-6">

                <!-- Bucket metrics -->
                <div class="border border-gray-200 rounded-sm bg-white">
                    <div class="p-4 border-b border-gray-200">
                        <h2 class="text-lg font-bold text-gray-900">Bucket metrics</h2>
                        <p class="text-xs text-gray-600 mt-1">Explore metrics for usage, request, and data transfer
                            activity within your bucket. Metrics are also available in Amazon CloudWatch. <a href="#"
                                class="text-[var(--aws-blue)] underline">Learn more ↗</a></p>
                    </div>
                    <div class="p-4 bg-white">
                        <div class="flex justify-end mb-4 gap-2 text-xs">
                            <div class="border border-gray-300 rounded-sm flex overflow-hidden">
                                <button class="px-3 py-1 bg-white hover:bg-gray-50 border-r border-gray-300">1d</button>
                                <button class="px-3 py-1 bg-white hover:bg-gray-50 border-r border-gray-300">1w</button>
                                <button class="px-3 py-1 bg-[var(--aws-blue)] text-white font-bold">2w</button>
                            </div>
                            <button class="p-1 border border-gray-300 rounded-sm hover:bg-gray-50"><svg
                                    class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg></button>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <!-- Chart 1 -->
                            <div class="border border-gray-300 rounded-sm p-4 h-64 flex flex-col">
                                <h3 class="font-bold text-sm text-gray-900">Total bucket size</h3>
                                <p class="text-xs text-gray-500 mb-4">Amount of data in bytes stored in this bucket.</p>
                                <div class="flex-1 bg-gray-100 flex items-center justify-center flex-col gap-1">
                                    <p class="text-sm font-bold text-gray-900">No data</p>
                                    <p class="text-xs text-gray-500">No data to display.</p>
                                </div>
                            </div>
                            <!-- Chart 2 -->
                            <div class="border border-gray-300 rounded-sm p-4 h-64 flex flex-col">
                                <h3 class="font-bold text-sm text-gray-900">Total number of objects</h3>
                                <p class="text-xs text-gray-500 mb-4">Total number of objects stored in this bucket for
                                    all storage classes.</p>
                                <div class="flex-1 bg-gray-100 flex items-center justify-center flex-col gap-1">
                                    <p class="text-sm font-bold text-gray-900">No data</p>
                                    <p class="text-xs text-gray-500">No data to display.</p>
                                </div>
                            </div>
                        </div>

                        <div class="mt-4 text-center border-t border-gray-200 pt-2">
                            <a href="#" class="text-xs text-[var(--aws-blue)] hover:underline">View additional
                                charts</a>
                        </div>
                    </div>
                </div>

                <!-- Storage Class Analysis -->
                <div class="border border-gray-200 rounded-sm bg-white">
                    <div class="p-4 border-b border-gray-200">
                        <h2 class="text-lg font-bold text-gray-900">Storage Class Analysis (0)</h2>
                        <p class="text-xs text-gray-600 mt-1">Analyze storage access patterns to help you decide when to
                            transition objects to the appropriate storage class. <a href="#"
                                class="text-[var(--aws-blue)] underline">Learn more ↗</a></p>
                    </div>
                    <div class="p-4">
                        <div class="border border-gray-300 rounded-sm overflow-hidden bg-white">
                            <!-- Toolbar -->
                            <div class="bg-gray-50 border-b border-gray-200 p-2 flex justify-end items-center gap-2">
                                <button
                                    class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-400 cursor-not-allowed bg-white">Edit</button>
                                <button
                                    class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-400 cursor-not-allowed bg-white">Delete</button>
                                <button
                                    class="px-3 py-1 text-xs font-bold border border-[var(--aws-blue)] text-[var(--aws-blue)] bg-white rounded-sm hover:bg-blue-50">Create
                                    analytics configuration</button>
                            </div>
                            <!-- Table Header -->
                            <div
                                class="bg-gray-50 border-b border-gray-200 grid grid-cols-2 gap-4 px-4 py-2 text-xs font-bold text-gray-600">
                                <div class="border-r border-gray-300">Name</div>
                                <div>Filters</div>
                            </div>
                            <!-- Empty State -->
                            <div class="bg-white p-8 text-center text-gray-600">
                                <p class="text-xs mb-2">There are no analytics configurations.</p>
                                <button
                                    class="px-3 py-1 text-xs font-bold border border-[var(--aws-blue)] text-[var(--aws-blue)] bg-white rounded-sm hover:bg-blue-50">Create
                                    configuration</button>
                            </div>
                            <!-- Pagination (Mock) -->
                            <div
                                class="bg-gray-50 border-t border-gray-200 p-2 flex justify-end items-center gap-2 text-xs text-gray-600">
                                <button class="disabled:text-gray-400" disabled>&lt;</button>
                                <span class="font-bold text-gray-900">1</span>
                                <button class="disabled:text-gray-400" disabled>&gt;</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Replication metrics -->
                <div class="border border-gray-200 rounded-sm bg-white">
                    <div class="p-4 border-b border-gray-200">
                        <h2 class="text-lg font-bold text-gray-900">Replication metrics</h2>
                        <p class="text-xs text-gray-600 mt-1">You can monitor the total number and size of objects
                            pending replication, the maximum replication time to the destination Region, and replication
                            failures. <a href="#" class="text-[var(--aws-blue)] underline">Learn more ↗</a></p>
                    </div>
                    <div class="p-4">
                        <div
                            class="border border-[var(--aws-blue)] rounded-sm bg-blue-50/10 p-3 flex justify-between items-center">
                            <div class="flex items-start gap-2">
                                <svg class="w-5 h-5 text-[var(--aws-blue)] shrink-0 mt-0.5" fill="none"
                                    stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <h4 class="text-xs font-bold text-gray-900">Replication metrics are not available
                                        for this bucket</h4>
                                    <p class="text-xs text-gray-600">To receive replication metrics, choose <span
                                            class="font-bold">View replication rules</span> and enable replication
                                        metrics for at least 1 rule in your replication configuration. <a href="#"
                                            class="text-[var(--aws-blue)] underline">Learn more ↗</a></p>
                                </div>
                            </div>
                            <button
                                class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-900 bg-white hover:bg-gray-50">View
                                replication rules</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Permissions Tab -->
            <div v-if="activeTab.toLowerCase() === 'permissions'" class="space-y-6">

                <!-- Permissions overview -->
                <div class="border border-gray-200 rounded-sm bg-white p-4">
                    <h2 class="text-lg font-bold text-gray-900">Permissions overview</h2>
                    <div class="mt-2">
                        <h3 class="text-sm font-bold text-gray-900">Access finding</h3>
                        <p class="text-xs text-gray-600">Access findings are provided by IAM external access analyzers.
                            Learn more about <a href="#" class="text-[var(--aws-blue)] underline">How IAM analyzer
                                findings work ↗</a></p>
                        <a href="#" class="text-xs text-[var(--aws-blue)] underline mt-1 block">View analyzer for
                            eu-north-1</a>
                    </div>
                </div>

                <!-- Block public access -->
                <div class="border border-gray-200 rounded-sm bg-white">
                    <div class="p-4 border-b border-gray-200 flex justify-between items-start">
                        <div>
                            <h2 class="text-lg font-bold text-gray-900">Block public access (bucket settings)</h2>
                        </div>
                        <button
                            class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-900 bg-white hover:bg-gray-50">Edit</button>
                    </div>
                    <div class="p-4">
                        <p class="text-xs text-gray-600 mb-4">Public access is granted to buckets and objects through
                            access control lists (ACLs), bucket policies, access point policies, or all. In order to
                            ensure that public access to all your S3 buckets and objects is blocked, turn on Block all
                            public access. These settings apply only to this bucket and its access points. AWS
                            recommends that you turn on Block all public access, but before applying any of these
                            settings, ensure that your applications will work correctly without public access. If you
                            require some level of public access to your buckets or objects within, you can customize the
                            individual settings below to suit your specific storage use cases. <a href="#"
                                class="text-[var(--aws-blue)] underline">Learn more ↗</a></p>

                        <div class="mb-2">
                            <h3 class="text-xs font-bold text-gray-900">Block all public access</h3>
                            <p class="text-xs text-green-600 font-bold flex items-center gap-1"><svg class="w-4 h-4"
                                    fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clip-rule="evenodd" />
                                </svg> On</p>
                        </div>

                        <div class="flex items-center gap-1 text-gray-800 cursor-pointer">
                            <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                    clip-rule="evenodd" />
                            </svg>
                            <span class="text-xs font-bold">Individual Block Public Access settings for this
                                bucket</span>
                        </div>
                    </div>
                </div>

                <!-- Bucket policy -->
                <div class="border border-gray-200 rounded-sm bg-white">
                    <div class="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 class="text-lg font-bold text-gray-900">Bucket policy</h2>
                        <div class="flex gap-2">
                            <button
                                class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-900 bg-white hover:bg-gray-50">Edit</button>
                            <button
                                class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-900 bg-white hover:bg-gray-50">Delete</button>
                        </div>
                    </div>
                    <div class="p-4 space-y-4">
                        <p class="text-xs text-gray-600">The bucket policy, written in JSON, provides access to the
                            objects stored in the bucket. Bucket policies don't apply to objects owned by other
                            accounts. <a href="#" class="text-[var(--aws-blue)] underline">Learn more ↗</a></p>

                        <div class="border border-[var(--aws-blue)] rounded-sm bg-blue-50/10 p-3 flex gap-2">
                            <svg class="w-5 h-5 text-[var(--aws-blue)] shrink-0 mt-0.5" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <h4 class="text-xs font-bold text-gray-900">Public access is blocked because Block
                                    Public Access settings are turned on for this bucket</h4>
                                <p class="text-xs text-gray-600">To determine which settings are turned on, check your
                                    Block Public Access settings for this bucket. Learn more about <a href="#"
                                        class="text-[var(--aws-blue)] underline">using Amazon S3 Block Public Access
                                        ↗</a></p>
                            </div>
                        </div>

                        <div class="relative">
                            <textarea readonly
                                class="w-full h-32 border border-gray-300 rounded-sm p-2 text-xs text-gray-500 italic bg-gray-50 resize-y focus:outline-none"
                                value="No policy to display."></textarea>
                            <button
                                class="absolute top-2 right-2 px-2 py-1 border border-gray-300 rounded-sm bg-white text-gray-600 flex items-center gap-1 text-xs hover:bg-gray-50 shadow-sm"><svg
                                    class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg> Copy</button>
                        </div>
                    </div>
                </div>

                <!-- Object Ownership -->
                <div class="border border-gray-200 rounded-sm bg-white">
                    <div class="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 class="text-lg font-bold text-gray-900">Object Ownership</h2>
                        <button
                            class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-900 bg-white hover:bg-gray-50">Edit</button>
                    </div>
                    <div class="p-4">
                        <p class="text-xs text-gray-600 mb-2">Control ownership of objects written to this bucket from
                            other AWS accounts and the use of access control lists (ACLs). Object ownership determines
                            who can specify access to objects.</p>
                        <h3 class="text-sm font-bold text-gray-900">Object Ownership</h3>
                        <p class="text-xs text-gray-900">Bucket owner enforced</p>
                        <p class="text-xs text-gray-600 mt-1">ACLs are disabled. All objects in this bucket are owned by
                            this account. Access to this bucket and its objects is specified using only policies.</p>
                    </div>
                </div>

                <!-- Access control list (ACL) -->
                <div class="border border-gray-200 rounded-sm bg-white">
                    <div class="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 class="text-lg font-bold text-gray-900">Access control list (ACL)</h2>
                        <button
                            class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-900 bg-white hover:bg-gray-50">Edit</button>
                    </div>
                    <div class="p-4 space-y-4">
                        <p class="text-xs text-gray-600">Grant basic read/write permissions to other AWS accounts. <a
                                href="#" class="text-[var(--aws-blue)] underline">Learn more ↗</a></p>

                        <div class="border border-[var(--aws-blue)] rounded-sm bg-blue-50/10 p-3 flex gap-2">
                            <svg class="w-5 h-5 text-[var(--aws-blue)] shrink-0 mt-0.5" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <h4 class="text-xs font-bold text-gray-900">This bucket has the bucket owner enforced
                                    setting applied for Object Ownership</h4>
                                <p class="text-xs text-gray-600">When <a href="#"
                                        class="text-[var(--aws-blue)] underline">bucket owner enforced</a> is applied,
                                    use bucket policies to control access. <a href="#"
                                        class="text-[var(--aws-blue)] underline">Learn more ↗</a></p>
                            </div>
                        </div>

                        <!-- ACL Table -->
                        <div class="border border-gray-300 rounded-sm overflow-hidden text-xs">
                            <div
                                class="bg-gray-50 border-b border-gray-200 grid grid-cols-[1fr_200px_200px] gap-4 px-4 py-2 font-bold text-gray-600">
                                <div class="border-r border-gray-300">Grantee</div>
                                <div class="border-r border-gray-300">Objects</div>
                                <div>Bucket ACL</div>
                            </div>

                            <!-- Row 1: Owner -->
                            <div
                                class="border-b border-gray-200 grid grid-cols-[1fr_200px_200px] gap-4 px-4 py-2 bg-white">
                                <div>
                                    <p class="font-bold text-gray-900">Bucket owner (your AWS account)</p>
                                    <p class="text-[10px] text-gray-500 flex items-center gap-1">Canonical ID: <svg
                                            class="w-3 h-3 text-[var(--aws-blue)]" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg> a80eb1031764ce392d55...</p>
                                </div>
                                <div class="text-gray-900">List, Write</div>
                                <div class="text-gray-900">Read, Write</div>
                            </div>
                            <!-- Row 2: Everyone -->
                            <div
                                class="border-b border-gray-200 grid grid-cols-[1fr_200px_200px] gap-4 px-4 py-2 bg-white">
                                <div>
                                    <p class="font-bold text-gray-900">Everyone (public access)</p>
                                    <p class="text-[10px] text-gray-500 flex items-center gap-1">Group: <svg
                                            class="w-3 h-3 text-[var(--aws-blue)]" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg> http://acs.amazonaws.com/groups/global/AllUsers</p>
                                </div>
                                <div class="text-gray-900">-</div>
                                <div class="text-gray-900">-</div>
                            </div>
                            <!-- Row 3: Authenticated -->
                            <div
                                class="border-b border-gray-200 grid grid-cols-[1fr_200px_200px] gap-4 px-4 py-2 bg-white">
                                <div>
                                    <p class="font-bold text-gray-900">Authenticated users group (anyone with an AWS
                                        account)</p>
                                    <p class="text-[10px] text-gray-500 flex items-center gap-1">Group: <svg
                                            class="w-3 h-3 text-[var(--aws-blue)]" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg> http://acs.amazonaws.com/groups/global/AuthenticatedUsers</p>
                                </div>
                                <div class="text-gray-900">-</div>
                                <div class="text-gray-900">-</div>
                            </div>
                            <!-- Row 4: Log Delivery -->
                            <div class="grid grid-cols-[1fr_200px_200px] gap-4 px-4 py-2 bg-white">
                                <div>
                                    <p class="font-bold text-gray-900">S3 log delivery group</p>
                                    <p class="text-[10px] text-gray-500 flex items-center gap-1">Group: <svg
                                            class="w-3 h-3 text-[var(--aws-blue)]" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg> http://acs.amazonaws.com/groups/s3/LogDelivery</p>
                                </div>
                                <div class="text-gray-900">-</div>
                                <div class="text-gray-900">-</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- CORS -->
                <div class="border border-gray-200 rounded-sm bg-white">
                    <div class="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 class="text-lg font-bold text-gray-900">Cross-origin resource sharing (CORS)</h2>
                        <button
                            class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-900 bg-white hover:bg-gray-50">Edit</button>
                    </div>
                    <div class="p-4 space-y-4">
                        <p class="text-xs text-gray-600">The CORS configuration, written in JSON, defines a way for
                            client web applications that are loaded in one domain to interact with resources in a
                            different domain. <a href="#" class="text-[var(--aws-blue)] underline">Learn more ↗</a></p>

                        <div class="relative">
                            <textarea readonly
                                class="w-full h-32 border border-gray-300 rounded-sm p-2 text-xs text-gray-500 italic bg-white resize-y focus:outline-none"
                                value="No configurations to display."></textarea>
                            <button
                                class="absolute top-2 right-2 px-2 py-1 border border-gray-300 rounded-sm bg-white text-gray-600 flex items-center gap-1 text-xs hover:bg-gray-50 shadow-sm"><svg
                                    class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg> Copy</button>
                        </div>
                    </div>
                </div>

            </div>


            <!-- Properties Tab -->
            <div v-if="activeTab.toLowerCase() === 'properties'" class="space-y-6">

                <!-- Bucket overview -->
                <div class="border border-gray-200 rounded-sm bg-white p-4">
                    <h2 class="text-lg font-bold text-gray-900 mb-4">Bucket overview</h2>

                    <div class="grid grid-cols-3 gap-8">
                        <div>
                            <p class="text-xs text-gray-600 font-bold mb-1">AWS Region</p>
                            <p class="text-xs text-gray-900">Europe (Stockholm) eu-north-1</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-600 font-bold mb-1">Amazon Resource Name (ARN)</p>
                            <div class="flex items-center gap-1">
                                <svg class="w-3 h-3 text-gray-500" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <p class="text-xs text-gray-900">arn:aws:s3:::{{ bucketName }}</p>
                            </div>
                        </div>
                        <div>
                            <p class="text-xs text-gray-600 font-bold mb-1">Creation date</p>
                            <p class="text-xs text-gray-900">January 6, 2026, 11:51:04 (UTC+03:00)</p>
                        </div>
                    </div>
                </div>

                <!-- Bucket Versioning -->
                <div class="border border-gray-200 rounded-sm bg-white">
                    <div class="p-4 border-b border-gray-200 flex justify-between items-start">
                        <h2 class="text-lg font-bold text-gray-900">Bucket Versioning</h2>
                        <button
                            class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-900 bg-white hover:bg-gray-50">Edit</button>
                    </div>
                    <div class="p-4">
                        <p class="text-xs text-gray-600 mb-4">Versioning is a means of keeping multiple variants of an
                            object in the same bucket. You can use versioning to preserve, retrieve, and restore every
                            version of every object stored in your Amazon S3 bucket. With versioning, you can easily
                            recover
                            from both unintended user actions and application failures. <a href="#"
                                class="text-[var(--aws-blue)] underline">Learn more ↗</a></p>

                        <div class="mb-4">
                            <h3 class="text-sm font-bold text-gray-900">Bucket Versioning</h3>
                            <p class="text-xs text-gray-900">Disabled</p>
                        </div>

                        <div>
                            <h3 class="text-sm font-bold text-gray-900">Multi-factor authentication (MFA) delete</h3>
                            <p class="text-xs text-gray-600 mb-1">An additional layer of security that requires
                                multi-factor
                                authentication for changing Bucket Versioning settings and permanently deleting object
                                versions. To modify MFA delete settings, use the AWS CLI, AWS SDK, or the Amazon S3 REST
                                API. <a href="#" class="text-[var(--aws-blue)] underline">Learn more ↗</a></p>
                            <p class="text-xs text-gray-900">Disabled</p>
                        </div>
                    </div>
                </div>

                <!-- Bucket ABAC -->
                <div class="border border-gray-200 rounded-sm bg-white">
                    <div class="p-4 border-b border-gray-200 flex justify-between items-start">
                        <h2 class="text-lg font-bold text-gray-900">Bucket ABAC</h2>
                        <button
                            class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-900 bg-white hover:bg-gray-50">Edit</button>
                    </div>
                    <div class="p-4">
                        <p class="text-xs text-gray-600 mb-4">Attribute-based access control (ABAC) is an authorization
                            strategy that defines permissions based on attributes. With ABAC, you can attach tags to
                            your
                            general purpose buckets and AWS Identity and Access Management (IAM) entities (users or
                            roles),
                            then scale access to objects in your S3 general purpose buckets using tag-based policies. <a
                                href="#" class="text-[var(--aws-blue)] underline">Learn more ↗</a></p>

                        <div>
                            <h3 class="text-sm font-bold text-gray-900">ABAC status</h3>
                            <p class="text-xs text-gray-900">Disabled</p>
                        </div>
                    </div>
                </div>

                <!-- Tags -->
                <div class="border border-gray-200 rounded-sm bg-white">
                    <div class="p-4 border-b border-gray-200">
                        <h2 class="text-lg font-bold text-gray-900">Tags</h2>
                        <p class="text-xs text-gray-600 mt-1">You can use tags to track storage costs, organize general
                            purpose buckets, and specify permissions for a general purpose bucket. AWS-generated tags
                            are
                            created by AWS and are read-only. <a href="#" class="text-[var(--aws-blue)] underline">Learn
                                more ↗</a></p>
                    </div>

                    <div class="p-4">
                        <div class="border border-[var(--aws-blue)] rounded-sm bg-blue-50/10 p-3 flex gap-2 mb-4">
                            <svg class="w-5 h-5 text-[var(--aws-blue)] shrink-0 mt-0.5" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p class="text-xs text-gray-600">S3 Console now uses s3:ListTagsForResource,
                                    s3:TagResource,
                                    and s3:UntagResource APIs to manage tags on S3 general purpose buckets by default.
                                    To
                                    use these APIs for tagging, please provide permissions to s3:ListTagsForResource,
                                    s3:TagResource, and s3:UntagResource actions. <a href="#"
                                        class="text-[var(--aws-blue)] underline">Learn more ↗</a></p>
                            </div>
                        </div>

                        <!-- Inner Tabs -->
                        <div class="border-b border-gray-200 flex gap-8 mb-4">
                            <button
                                class="pb-2 text-sm font-bold border-b-2 border-[var(--aws-blue)] text-[var(--aws-blue)] px-1">User-defined
                                tags</button>
                            <button
                                class="pb-2 text-sm font-bold border-b-2 border-transparent text-gray-600 hover:text-gray-900 px-1">AWS-generated
                                tags</button>
                        </div>

                        <div class="flex justify-between items-center mb-2">
                            <h3 class="text-lg font-bold text-gray-900 flex items-center gap-1">User-defined tags (0)
                                <span
                                    class="text-[var(--aws-blue)] text-[10px] uppercase font-bold cursor-pointer">Info</span>
                            </h3>
                            <div class="flex gap-2">
                                <button class="p-1 border border-gray-300 rounded-sm hover:bg-gray-50"><svg
                                        class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg></button>
                                <button
                                    class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-400 cursor-not-allowed bg-white">Delete</button>
                                <button
                                    class="px-3 py-1 text-xs font-bold border border-[var(--aws-blue)] text-[var(--aws-blue)] bg-white rounded-sm hover:bg-blue-50">Add
                                    new tag</button>
                            </div>
                        </div>

                        <!-- Tags Table -->
                        <div class="border border-gray-300 rounded-sm overflow-hidden text-xs">
                            <div
                                class="bg-gray-50 border-b border-gray-200 grid grid-cols-2 gap-4 px-4 py-2 font-bold text-gray-600">
                                <div class="border-r border-gray-300">Key</div>
                                <div class="flex items-center gap-1">Value - <span
                                        class="italic font-normal">optional</span> <svg class="w-3 h-3" fill="none"
                                        stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg></div>
                            </div>
                            <div class="p-8 text-center text-gray-600 bg-white">
                                <p class="mb-4">There are no user-defined tags associated with this bucket.</p>
                                <button
                                    class="px-3 py-1 text-xs font-bold border border-[var(--aws-blue)] text-[var(--aws-blue)] bg-white rounded-sm hover:bg-blue-50">Add
                                    new tag</button>
                            </div>
                            <!-- Pagination -->
                            <div
                                class="bg-gray-50 border-t border-gray-200 p-2 flex justify-end items-center gap-2 text-xs text-gray-600">
                                <button class="disabled:text-gray-400" disabled>&lt;</button>
                                <span class="font-bold text-gray-900">1</span>
                                <button class="disabled:text-gray-400" disabled>&gt;</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Default encryption -->
                <div class="border border-gray-200 rounded-sm bg-white">
                    <div class="p-4 border-b border-gray-200 flex justify-between items-start">
                        <h2 class="text-lg font-bold text-gray-900">Default encryption</h2>
                        <button
                            class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-900 bg-white hover:bg-gray-50">Edit</button>
                    </div>
                    <div class="p-4">
                        <p class="text-xs text-gray-600 mb-4">Server-side encryption is automatically applied to new
                            objects
                            stored in this bucket.</p>

                        <div class="space-y-4">
                            <div>
                                <h3 class="text-sm font-bold text-gray-900 flex items-center gap-1">Encryption type
                                    <span
                                        class="text-[var(--aws-blue)] text-[10px] uppercase font-bold cursor-pointer">Info</span>
                                </h3>
                                <p class="text-xs text-gray-900">Server-side encryption with Amazon S3 managed keys
                                    (SSE-S3)
                                </p>
                            </div>
                            <div>
                                <h3 class="text-sm font-bold text-gray-900">Bucket Key</h3>
                                <p class="text-xs text-gray-600 mb-1">When KMS encryption is used to encrypt new objects
                                    in
                                    this bucket, the bucket key reduces encryption costs by lowering calls to AWS KMS.
                                    <a href="#" class="text-[var(--aws-blue)] underline">Learn more ↗</a>
                                </p>
                                <p class="text-xs text-gray-900">Enabled</p>
                            </div>
                            <div>
                                <h3 class="text-sm font-bold text-gray-900 flex items-center gap-1">Blocked encryption
                                    types
                                    <span
                                        class="text-[var(--aws-blue)] text-[10px] uppercase font-bold cursor-pointer">Info</span>
                                </h3>
                                <p class="text-xs text-gray-900">-</p>
                            </div>
                        </div>

                        <div class="border border-[var(--aws-blue)] rounded-sm bg-blue-50/10 p-3 flex gap-2 mt-4">
                            <svg class="w-5 h-5 text-[var(--aws-blue)] shrink-0 mt-0.5" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <h4 class="text-xs font-bold text-gray-900">Upcoming change to default encryption</h4>
                                <p class="text-xs text-gray-600">In April 2026, server-side encryption with
                                    customer-provided keys (SSE-C) will be blocked by default for all new buckets. If
                                    you
                                    need to use SSE-C encryption, make sure that SSE-C is not selected under Blocked
                                    encryption types. <a href="#" class="text-[var(--aws-blue)] underline">Learn more
                                        ↗</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Intelligent-Tiering Archive configurations -->
                <div class="border border-gray-200 rounded-sm bg-white">
                    <div class="p-4 border-b border-gray-200">
                        <h2 class="text-lg font-bold text-gray-900">Intelligent-Tiering Archive configurations (0)</h2>
                        <p class="text-xs text-gray-600 mt-1">Enable objects stored in the Intelligent-Tiering storage
                            class
                            to tier-down to the Archive Access tier or the Deep Archive Access tier which are optimized
                            for
                            objects that will be rarely accessed for long periods of time. <a href="#"
                                class="text-[var(--aws-blue)] underline">Learn more ↗</a></p>
                    </div>
                    <div class="p-4">
                        <div class="border border-gray-300 rounded-sm overflow-hidden bg-white">
                            <!-- Toolbar -->
                            <div class="bg-gray-50 border-b border-gray-200 p-2 flex justify-between items-center">
                                <div class="relative w-64">
                                    <svg class="absolute left-2 top-2 w-3 h-3 text-gray-500" fill="none"
                                        stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input type="text" placeholder="Find Intelligent-Tiering Archive configurations"
                                        class="w-full pl-7 pr-4 py-1 text-xs border border-gray-300 rounded-sm focus:outline-none focus:border-[var(--aws-blue)]">
                                </div>
                                <div class="flex gap-2">
                                    <button
                                        class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-400 cursor-not-allowed bg-white">View
                                        details</button>
                                    <button
                                        class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-400 cursor-not-allowed bg-white">Edit</button>
                                    <button
                                        class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-400 cursor-not-allowed bg-white">Delete</button>
                                    <button
                                        class="px-3 py-1 text-xs font-bold border border-[var(--aws-blue)] text-[var(--aws-blue)] bg-white rounded-sm hover:bg-blue-50">Create
                                        configuration</button>
                                </div>
                            </div>
                            <!-- Table Header -->
                            <div class="bg-gray-50 border-b border-gray-200 overflow-x-auto">
                                <div
                                    class="grid grid-cols-[150px_100px_100px_200px_200px] gap-4 px-4 py-2 text-xs font-bold text-gray-600 min-w-[800px]">
                                    <div class="border-r border-gray-300">Name</div>
                                    <div class="border-r border-gray-300">Status</div>
                                    <div class="border-r border-gray-300">Scope</div>
                                    <div class="border-r border-gray-300">Days until transition to Archive Access tier
                                    </div>
                                    <div>Days until transition to Deep Archive Access tier</div>
                                </div>
                            </div>
                            <!-- Empty State -->
                            <div class="p-8 text-center text-gray-600 bg-white">
                                <p class="text-sm font-bold mb-1">No archive configurations</p>
                                <p class="text-xs mb-4">No configurations to display.</p>
                                <button
                                    class="px-3 py-1 text-xs font-bold border border-[var(--aws-blue)] text-[var(--aws-blue)] bg-white rounded-sm hover:bg-blue-50">Create
                                    configuration</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Server access logging -->
                <div class="border border-gray-200 rounded-sm bg-white">
                    <div class="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 class="text-lg font-bold text-gray-900">Server access logging</h2>
                        <button
                            class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-900 bg-white hover:bg-gray-50">Edit</button>
                    </div>
                    <div class="p-4">
                        <p class="text-xs text-gray-600 mb-4">Log requests for access to your bucket. Use <a href="#"
                                class="text-[var(--aws-blue)] underline">CloudWatch ↗</a> to check the health of your
                            server
                            access logging. <a href="#" class="text-[var(--aws-blue)] underline">Learn more ↗</a></p>
                        <h3 class="text-sm font-bold text-gray-900">Server access logging</h3>
                        <p class="text-xs text-gray-900">Disabled</p>
                    </div>
                </div>

                <!-- AWS CloudTrail data events -->
                <div class="border border-gray-200 rounded-sm bg-white">
                    <div class="p-4 border-b border-gray-200">
                        <h2 class="text-lg font-bold text-gray-900">AWS CloudTrail data events</h2>
                    </div>
                    <div class="p-4">
                        <div
                            class="border border-[var(--aws-blue)] rounded-sm bg-blue-50/10 p-3 flex justify-between items-center">
                            <div class="flex items-center gap-2">
                                <svg class="w-5 h-5 text-[var(--aws-blue)]" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span class="text-xs text-gray-900 font-bold">You can view and configure CloudTrail data
                                    events for Amazon S3 bucket object-level operations in the AWS CloudTrail
                                    console.</span>
                            </div>
                            <button
                                class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-900 bg-white hover:bg-gray-50 flex items-center gap-1">AWS
                                CloudTrail <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg></button>
                        </div>
                    </div>
                </div>

                <!-- Event notifications -->
                <div class="border border-gray-200 rounded-sm bg-white">
                    <div class="p-4 border-b border-gray-200">
                        <h2 class="text-lg font-bold text-gray-900">Event notifications (0)</h2>
                        <p class="text-xs text-gray-600 mt-1">Send a notification when specific events occur in your
                            bucket.
                            <a href="#" class="text-[var(--aws-blue)] underline">Learn more ↗</a>
                        </p>
                    </div>
                    <div class="p-4">
                        <div class="border border-gray-300 rounded-sm overflow-hidden bg-white">
                            <!-- Toolbar -->
                            <div class="bg-gray-50 border-b border-gray-200 p-2 flex justify-between items-center">
                                <div class="flex gap-2 text-xs text-gray-500 items-center pl-2">
                                    <input type="checkbox" class="rounded border-gray-300">
                                </div>
                                <div class="flex gap-2">
                                    <button
                                        class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-400 cursor-not-allowed bg-white">Edit</button>
                                    <button
                                        class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-400 cursor-not-allowed bg-white">Delete</button>
                                    <button
                                        class="px-3 py-1 text-xs font-bold border border-[var(--aws-blue)] text-[var(--aws-blue)] bg-white rounded-sm hover:bg-blue-50">Create
                                        event notification</button>
                                </div>
                            </div>
                            <!-- Table Header -->
                            <div
                                class="bg-gray-50 border-b border-gray-200 grid grid-cols-[200px_150px_100px_150px_150px] gap-4 px-4 py-2 text-xs font-bold text-gray-600">
                                <div class="border-r border-gray-300">Name</div>
                                <div class="border-r border-gray-300">Event types</div>
                                <div class="border-r border-gray-300">Filters</div>
                                <div class="border-r border-gray-300">Destination type</div>
                                <div>Destination</div>
                            </div>
                            <!-- Empty State -->
                            <div class="p-8 text-center text-gray-600 bg-white">
                                <p class="text-sm font-bold mb-1">No event notifications</p>
                                <p class="text-xs mb-4">Choose <span class="font-bold">Create event notification</span>
                                    to
                                    be notified when a specific event occurs.</p>
                                <button
                                    class="px-3 py-1 text-xs font-bold border border-[var(--aws-blue)] text-[var(--aws-blue)] bg-white rounded-sm hover:bg-blue-50">Create
                                    event notification</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Amazon EventBridge -->
                <div class="border border-gray-200 rounded-sm bg-white">
                    <div class="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 class="text-lg font-bold text-gray-900">Amazon EventBridge</h2>
                        <button
                            class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-900 bg-white hover:bg-gray-50">Edit</button>
                    </div>
                    <div class="p-4">
                        <p class="text-xs text-gray-600 mb-4">For additional capabilities, use Amazon EventBridge to
                            build
                            event-driven applications at scale using S3 event notifications. <a href="#"
                                class="text-[var(--aws-blue)] underline">Learn more ↗</a> or <a href="#"
                                class="text-[var(--aws-blue)] underline">see EventBridge pricing ↗</a></p>
                        <h3 class="text-sm font-bold text-gray-900">Send notifications to Amazon EventBridge for all
                            events
                            in this bucket</h3>
                        <p class="text-xs text-gray-900">Off</p>
                    </div>
                </div>

                <!-- Transfer acceleration -->
                <div class="border border-gray-200 rounded-sm bg-white">
                    <div class="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 class="text-lg font-bold text-gray-900">Transfer acceleration</h2>
                        <button
                            class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-900 bg-white hover:bg-gray-50">Edit</button>
                    </div>
                    <div class="p-4">
                        <p class="text-xs text-gray-600 mb-4">Use an accelerated endpoint for faster data transfers. <a
                                href="#" class="text-[var(--aws-blue)] underline">Learn more ↗</a></p>
                        <div class="border border-[var(--aws-blue)] rounded-sm bg-blue-50/10 p-3 flex gap-2">
                            <svg class="w-5 h-5 text-[var(--aws-blue)] shrink-0 mt-0.5" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <h4 class="text-xs font-bold text-gray-900">Transfer acceleration is not available for
                                    this
                                    bucket</h4>
                                <p class="text-xs text-gray-600">Amazon S3 Transfer acceleration is not available for
                                    your
                                    bucket because it is located in an unsupported Region. <a href="#"
                                        class="text-[var(--aws-blue)] underline">Learn more ↗</a></p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Object Lock -->
                <div class="border border-gray-200 rounded-sm bg-white">
                    <div class="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 class="text-lg font-bold text-gray-900">Object Lock</h2>
                        <button
                            class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-900 bg-white hover:bg-gray-50">Edit</button>
                    </div>
                    <div class="p-4">
                        <p class="text-xs text-gray-600 mb-4">Store objects using a write-once-read-many (WORM) model to
                            help you prevent objects from being deleted or overwritten for a fixed amount of time or
                            indefinitely. Object Lock works only in versioned buckets. <a href="#"
                                class="text-[var(--aws-blue)] underline">Learn more ↗</a></p>
                        <h3 class="text-sm font-bold text-gray-900">Object Lock</h3>
                        <p class="text-xs text-gray-900">Disabled</p>
                    </div>
                </div>

                <!-- Requester pays -->
                <div class="border border-gray-200 rounded-sm bg-white">
                    <div class="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 class="text-lg font-bold text-gray-900">Requester pays</h2>
                        <button
                            class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-900 bg-white hover:bg-gray-50">Edit</button>
                    </div>
                    <div class="p-4">
                        <p class="text-xs text-gray-600 mb-4">When enabled, the requester pays for requests and data
                            transfer costs, and anonymous access to this bucket is disabled. <a href="#"
                                class="text-[var(--aws-blue)] underline">Learn more ↗</a></p>
                        <h3 class="text-sm font-bold text-gray-900">Requester pays</h3>
                        <p class="text-xs text-gray-900">Disabled</p>
                    </div>
                </div>

                <!-- Static website hosting -->
                <div class="border border-gray-200 rounded-sm bg-white">
                    <div class="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 class="text-lg font-bold text-gray-900">Static website hosting</h2>
                        <button
                            class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-900 bg-white hover:bg-gray-50">Edit</button>
                    </div>
                    <div class="p-4">
                        <p class="text-xs text-gray-600 mb-4">Use this bucket to host a website or redirect requests. <a
                                href="#" class="text-[var(--aws-blue)] underline">Learn more ↗</a></p>

                        <div
                            class="border border-[var(--aws-blue)] rounded-sm bg-blue-50/10 p-3 flex justify-between items-center mb-4">
                            <div class="flex items-start gap-2">
                                <svg class="w-5 h-5 text-[var(--aws-blue)] shrink-0 mt-0.5" fill="none"
                                    stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <h4 class="text-xs font-bold text-gray-900">We recommend using AWS Amplify Hosting
                                        for
                                        static website hosting</h4>
                                    <p class="text-xs text-gray-600">Deploy a fast, secure, and reliable website quickly
                                        with AWS Amplify Hosting. Learn more about <a href="#"
                                            class="text-[var(--aws-blue)] underline">Amplify Hosting ↗</a> or <a
                                            href="#" class="text-[var(--aws-blue)] underline">View your existing Amplify
                                            apps ↗</a>
                                    </p>
                                </div>
                            </div>
                            <button
                                class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-900 bg-white hover:bg-gray-50 flex items-center gap-1">Create
                                Amplify app <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg></button>
                        </div>

                        <h3 class="text-sm font-bold text-gray-900">S3 static website hosting</h3>
                        <p class="text-xs text-gray-900">Disabled</p>
                    </div>
                </div>

            </div>

            <!-- Access Points Tab -->
            <div v-if="activeTab.toLowerCase() === 'access points'" class="space-y-6">
                <!-- Header -->
                <div class="border border-gray-200 rounded-sm bg-white">
                    <div class="p-4 border-b border-gray-200">
                        <h2 class="text-lg font-bold text-gray-900">Access Points for general purpose buckets (0)</h2>
                    </div>
                    <div class="p-4">
                        <div class="border border-gray-300 rounded-sm overflow-hidden bg-white">
                            <!-- Toolbar -->
                            <div class="bg-gray-50 border-b border-gray-200 p-2 flex justify-between items-center">
                                <div class="relative w-80">
                                    <svg class="absolute left-2 top-2 w-3 h-3 text-gray-500" fill="none"
                                        stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input type="text" placeholder="Search for access points by name"
                                        class="w-full pl-7 pr-4 py-1 text-xs border border-gray-300 rounded-sm focus:outline-none focus:border-[var(--aws-blue)]">
                                </div>
                                <div class="flex gap-2">
                                    <button
                                        class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-400 cursor-not-allowed bg-white flex items-center gap-1">
                                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg> Copy ARN
                                    </button>
                                    <button
                                        class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-400 cursor-not-allowed bg-white">Edit
                                        policy</button>
                                    <button
                                        class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-400 cursor-not-allowed bg-white">Delete</button>
                                    <button @click="router.push(`/s3/buckets/${bucketName}/create-access-point`)"
                                        class="px-3 py-1 text-xs font-bold bg-[var(--aws-orange)] text-white rounded-sm hover:opacity-90">Create
                                        access point</button>
                                </div>
                            </div>
                            <!-- Table Header -->
                            <div class="bg-gray-50 border-b border-gray-200 overflow-x-auto">
                                <div
                                    class="grid grid-cols-[200px_150px_200px_150px_150px_200px] gap-4 px-4 py-2 text-xs font-bold text-gray-600 min-w-[1050px]">
                                    <div
                                        class="border-r border-gray-300 flex items-center justify-between cursor-pointer hover:bg-gray-100">
                                        Name <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd"
                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                clip-rule="evenodd" />
                                        </svg></div>
                                    <div
                                        class="border-r border-gray-300 flex items-center justify-between cursor-pointer hover:bg-gray-100">
                                        Data source type <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd"
                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                clip-rule="evenodd" />
                                        </svg></div>
                                    <div
                                        class="border-r border-gray-300 flex items-center justify-between cursor-pointer hover:bg-gray-100">
                                        Access Point alias <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd"
                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                clip-rule="evenodd" />
                                        </svg></div>
                                    <div
                                        class="border-r border-gray-300 flex items-center justify-between cursor-pointer hover:bg-gray-100">
                                        Network origin <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd"
                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                clip-rule="evenodd" />
                                        </svg></div>
                                    <div
                                        class="border-r border-gray-300 flex items-center justify-between cursor-pointer hover:bg-gray-100">
                                        VPC ID <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd"
                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                clip-rule="evenodd" />
                                        </svg></div>
                                    <div class="flex items-center justify-between cursor-pointer hover:bg-gray-100">
                                        Bucket owner account ID <svg class="w-3 h-3" fill="currentColor"
                                            viewBox="0 0 20 20">
                                            <path fill-rule="evenodd"
                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                clip-rule="evenodd" />
                                        </svg></div>
                                </div>
                            </div>
                            <!-- Empty State -->
                            <div class="p-12 text-center bg-white flex flex-col items-center">
                                <p class="text-xs text-gray-900 mb-4">You don't have any access points in the Europe
                                    (Stockholm) eu-north-1 Region</p>
                                <button @click="router.push(`/s3/buckets/${bucketName}/create-access-point`)"
                                    class="px-3 py-1 text-xs font-bold border border-[var(--aws-blue)] text-[var(--aws-blue)] bg-white rounded-sm hover:bg-blue-50">Create
                                    access point</button>
                            </div>
                            <!-- Pagination (Mock) -->
                            <div
                                class="bg-gray-50 border-t border-gray-200 p-2 flex justify-end items-center gap-2 text-xs text-gray-600">
                                <button class="disabled:text-gray-400" disabled>&lt;</button>
                                <span class="font-bold text-gray-900">1</span>
                                <button class="disabled:text-gray-400" disabled>&gt;</button>
                                <button class="p-1 hover:bg-gray-200 rounded"><svg class="w-4 h-4" fill="none"
                                        stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Objects Tab Content -->
            <div v-if="activeTab === 'objects'" class="border border-gray-200 rounded-sm bg-white">
                <!-- Toolbar -->
                <div class="p-4 border-b border-gray-200 space-y-4">
                    <div class="flex justify-between items-center">
                        <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                            Objects (0)
                            <button class="text-gray-400 hover:text-gray-900"><svg class="w-4 h-4" fill="none"
                                    stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg></button>
                        </h2>
                        <div class="flex gap-2">
                            <button
                                class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-400 cursor-not-allowed">Copy
                                S3 URI</button>
                            <button
                                class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-400 cursor-not-allowed">Copy
                                URL</button>
                            <button
                                class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-400 cursor-not-allowed">Download</button>
                            <button
                                class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-400 cursor-not-allowed">Open
                                ↗</button>
                            <button
                                class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-400 cursor-not-allowed">Delete</button>

                            <div class="relative">
                                <button @click="showActionsDropdown = !showActionsDropdown"
                                    :class="showActionsDropdown ? 'border-[var(--aws-blue)] bg-[var(--aws-blue)] text-white' : 'border-[var(--aws-blue)] text-[var(--aws-blue)] bg-blue-50/10'"
                                    class="px-3 py-1 text-xs font-bold border rounded-sm flex items-center gap-1 transition-colors">
                                    Actions
                                    <svg class="w-3 h-3 transition-transform duration-200"
                                        :class="showActionsDropdown ? 'rotate-180' : ''" fill="none"
                                        stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                <!-- Dropdown Menu -->
                                <div v-show="showActionsDropdown"
                                    class="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded-sm shadow-lg z-50 py-1">
                                    <a href="#"
                                        class="block px-4 py-1.5 text-xs text-gray-400 cursor-not-allowed hover:bg-gray-100">Download
                                        as</a>
                                    <a href="#"
                                        class="block px-4 py-1.5 text-xs text-gray-400 cursor-not-allowed hover:bg-gray-100">Share
                                        with a presigned URL</a>
                                    <a href="#"
                                        class="block px-4 py-1.5 text-xs text-gray-400 cursor-not-allowed hover:bg-gray-100">Calculate
                                        total size</a>
                                    <a href="#"
                                        class="block px-4 py-1.5 text-xs text-gray-400 cursor-not-allowed hover:bg-gray-100">Copy</a>
                                    <a href="#"
                                        class="block px-4 py-1.5 text-xs text-gray-400 cursor-not-allowed hover:bg-gray-100">Move</a>
                                    <a href="#"
                                        class="block px-4 py-1.5 text-xs text-gray-400 cursor-not-allowed hover:bg-gray-100">Initiate
                                        restore</a>
                                    <a href="#"
                                        class="block px-4 py-1.5 text-xs text-gray-400 cursor-not-allowed hover:bg-gray-100">Query
                                        with S3 Select</a>

                                    <div class="border-t border-gray-200 my-1 mx-4"></div>
                                    <h3 class="px-4 py-1 text-xs font-bold text-gray-900">Edit actions</h3>

                                    <a href="#"
                                        class="block px-4 py-1.5 text-xs text-gray-400 cursor-not-allowed hover:bg-gray-100">Rename
                                        object</a>
                                    <a href="#"
                                        class="block px-4 py-1.5 text-xs text-gray-400 cursor-not-allowed hover:bg-gray-100">Edit
                                        storage class</a>
                                    <a href="#"
                                        class="block px-4 py-1.5 text-xs text-gray-400 cursor-not-allowed hover:bg-gray-100">Edit
                                        server-side encryption</a>
                                    <a href="#"
                                        class="block px-4 py-1.5 text-xs text-gray-400 cursor-not-allowed hover:bg-gray-100">Edit
                                        tags</a>

                                    <div class="border-t border-gray-200 my-1 mx-4"></div>

                                    <a href="#"
                                        class="block px-4 py-1.5 text-xs text-gray-400 cursor-not-allowed hover:bg-gray-100 border border-transparent focus:border-black">Make
                                        public using ACL</a>
                                </div>
                            </div>

                            <button @click="router.push(`/s3/buckets/${bucketName}/create-folder`)"
                                class="px-3 py-1 text-xs font-bold border border-[var(--aws-blue)] text-[var(--aws-blue)] bg-blue-50/10 rounded-sm">Create
                                folder</button>
                            <button @click="router.push(`/s3/buckets/${bucketName}/upload`)"
                                class="px-3 py-1 text-xs font-bold bg-[var(--aws-orange)] text-white rounded-sm hover:opacity-90 flex items-center gap-1">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                Upload
                            </button>
                        </div>
                    </div>

                    <p class="text-xs text-gray-600">Objects are the fundamental entities stored in Amazon S3. You
                        can
                        use <span class="text-[var(--aws-blue)] hover:underline cursor-pointer">Amazon S3 Inventory
                            ↗</span> to get a list of all objects in your bucket. For others to access your objects,
                        you'll need to explicitly grant them permissions. <span
                            class="text-[var(--aws-blue)] hover:underline cursor-pointer">Learn more ↗</span></p>

                    <!-- Search -->
                    <div class="relative w-full max-w-lg">
                        <svg class="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input v-model="searchQuery" type="text" placeholder="Find objects by prefix"
                            class="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-400 rounded-sm focus:ring-1 focus:ring-[var(--aws-blue)] outline-none">
                    </div>
                </div>

                <!-- Table Header (Visible even when empty) -->
                <div class="bg-gray-50 border-b border-gray-200 flex text-[11px] font-bold text-gray-600">
                    <div class="w-10 p-2 border-r border-gray-200 flex justify-center"><input type="checkbox"
                            class="w-3.5 h-3.5 rounded border-gray-300"></div>
                    <div
                        class="flex-1 p-2 border-r border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-100">
                        Name <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clip-rule="evenodd" />
                        </svg></div>
                    <div
                        class="w-32 p-2 border-r border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-100">
                        Type <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clip-rule="evenodd" />
                        </svg></div>
                    <div
                        class="w-48 p-2 border-r border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-100">
                        Last modified <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clip-rule="evenodd" />
                        </svg></div>
                    <div
                        class="w-32 p-2 border-r border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-100">
                        Size <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clip-rule="evenodd" />
                        </svg></div>
                    <div class="w-40 p-2 flex items-center justify-between cursor-pointer hover:bg-gray-100">Storage
                        class <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clip-rule="evenodd" />
                        </svg></div>
                </div>

                <!-- Empty State -->
                <div class="p-12 text-center">
                    <h3 class="text-sm font-bold text-gray-900 mb-1">No objects</h3>
                    <p class="text-xs text-gray-500 mb-6">You don't have any objects in this bucket.</p>
                    <button @click="router.push(`/s3/buckets/${bucketName}/upload`)"
                        class="px-4 py-1.5 text-xs font-bold border border-[var(--aws-blue)] text-[var(--aws-blue)] hover:bg-blue-50/10 transition-colors rounded-sm bg-white flex items-center gap-1 mx-auto">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Upload
                    </button>
                </div>
            </div>

        </div>
    </div>
</template>
