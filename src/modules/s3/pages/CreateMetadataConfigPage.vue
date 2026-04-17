<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToastStore } from '@/shared/store/toastStore'

const route = useRoute()
const router = useRouter()
const toastStore = useToastStore()

const bucketName = computed(() => route.params.bucketName as string)

const journalSSE = ref('None')
const journalExpiration = ref('Disabled')
const inventoryStatus = ref('Enabled')
const inventorySSE = ref('None')

const handleCreate = () => {
    // Navigate back to bucket details with query param to trigger active state
    router.push({
        path: `/s3/buckets/${bucketName.value}`,
        query: { tab: 'metadata', created: 'true' }
    })
}
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
            <span @click="router.push(`/s3/buckets/${bucketName}`)"
                class="hover:text-[var(--aws-blue)] hover:underline cursor-pointer">{{ bucketName }}</span>
            <span>></span>
            <span class="text-gray-900 font-bold">Create metadata configuration</span>
        </div>

        <div class="max-w-7xl mx-auto p-8 px-10">
            <div class="mb-6">
                <h1 class="text-2xl font-bold text-gray-900 mb-1">Create metadata configuration <span
                        class="text-[10px] text-[var(--aws-blue)] hover:underline cursor-pointer uppercase font-bold tracking-tight align-middle">Info</span>
                </h1>
            </div>

            <!-- Destination -->
            <section class="border border-gray-200 rounded-sm mb-6 overflow-hidden">
                <div class="bg-white p-6">
                    <h2 class="text-lg font-bold text-gray-900 mb-2">Destination</h2>
                    <p class="text-xs text-gray-600">An AWS managed table bucket and namespace will be created for the
                        metadata tables in this Region. Server-side encryption with Amazon S3 managed keys (SSE-S3) is
                        used for the AWS managed table bucket's default encryption. <a href="#"
                            class="text-[var(--aws-blue)] underline">Learn more ↗</a></p>
                </div>
            </section>

            <!-- Journal Table -->
            <section class="border border-gray-200 rounded-sm mb-6 overflow-hidden">
                <div class="bg-white p-6">
                    <h2 class="text-lg font-bold text-gray-900 mb-1 flex gap-1">Journal table <span
                            class="text-[10px] text-[var(--aws-blue)] hover:underline cursor-pointer uppercase font-bold tracking-tight align-middle">Info</span>
                    </h2>
                    <p class="text-xs text-gray-600 mb-6">The journal table contains metadata about changes to the
                        objects in your bucket. You can use this table for security, auditing, and compliance use cases
                        to track uploaded, deleted, and changed objects in the bucket.</p>

                    <div class="space-y-6">
                        <!-- SSE -->
                        <div>
                            <h4 class="text-sm font-bold text-gray-900 mb-1">Server-side encryption</h4>
                            <p class="text-xs text-gray-600 mb-2">This setting can't be edited after the table is
                                created.</p>

                            <div class="space-y-2">
                                <label class="flex items-start gap-2 cursor-pointer">
                                    <input type="radio" value="None" v-model="journalSSE"
                                        class="w-4 h-4 mt-0.5 text-[var(--aws-blue)] focus:ring-[var(--aws-blue)] border-gray-300">
                                    <div>
                                        <span class="text-sm text-gray-900">Don't specify encryption type</span>
                                        <p class="text-xs text-gray-600">The bucket settings for default encryption are
                                            used to encrypt the table when storing it in Amazon S3.</p>
                                    </div>
                                </label>
                                <label class="flex items-start gap-2 cursor-pointer">
                                    <input type="radio" value="Specify" v-model="journalSSE"
                                        class="w-4 h-4 mt-0.5 text-[var(--aws-blue)] focus:ring-[var(--aws-blue)] border-gray-300">
                                    <div>
                                        <span class="text-sm text-gray-900">Specify encryption type</span>
                                        <p class="text-xs text-gray-600">The specified encryption key is used to encrypt
                                            the table before storing it in Amazon S3.</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <!-- Record Expiration -->
                        <div>
                            <h4 class="text-sm font-bold text-gray-900 mb-2">Record expiration</h4>
                            <div class="space-y-2">
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" value="Disabled" v-model="journalExpiration"
                                        class="w-4 h-4 text-[var(--aws-blue)] focus:ring-[var(--aws-blue)] border-gray-300">
                                    <div>
                                        <span class="text-sm text-gray-900">Disabled</span>
                                        <p class="text-xs text-gray-600">Journal table records don't expire.</p>
                                    </div>
                                </label>
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" value="Enabled" v-model="journalExpiration"
                                        class="w-4 h-4 text-[var(--aws-blue)] focus:ring-[var(--aws-blue)] border-gray-300">
                                    <div>
                                        <span class="text-sm text-gray-900">Enabled</span>
                                        <p class="text-xs text-gray-600">Journal table records expire after the
                                            specified number of days.</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Live Inventory Table -->
            <section class="border border-gray-200 rounded-sm mb-6 overflow-hidden">
                <div class="bg-white p-6">
                    <h2 class="text-lg font-bold text-gray-900 mb-1 flex gap-1">Live inventory table <span
                            class="text-[10px] text-[var(--aws-blue)] hover:underline cursor-pointer uppercase font-bold tracking-tight align-middle">Info</span>
                    </h2>
                    <p class="text-xs text-gray-600 mb-6">The inventory table contains the latest metadata for all
                        objects in your bucket. You can use this table to simplify and speed up business workflows and
                        big data jobs by identifying objects that you want to process for various workloads. Additional
                        fees will apply. <a href="#" class="text-[var(--aws-blue)] underline">View pricing ↗</a></p>

                    <div class="space-y-6">
                        <!-- Config Status -->
                        <div>
                            <h4 class="text-sm font-bold text-gray-900 mb-2">Configuration status</h4>
                            <div class="space-y-2">
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" value="Disabled" v-model="inventoryStatus"
                                        class="w-4 h-4 text-[var(--aws-blue)] focus:ring-[var(--aws-blue)] border-gray-300">
                                    <span class="text-sm text-gray-900">Disabled</span>
                                </label>
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" value="Enabled" v-model="inventoryStatus"
                                        class="w-4 h-4 text-[var(--aws-blue)] focus:ring-[var(--aws-blue)] border-gray-300">
                                    <span class="text-sm text-gray-900">Enabled</span>
                                </label>
                            </div>
                        </div>

                        <!-- SSE -->
                        <div>
                            <h4 class="text-sm font-bold text-gray-900 mb-1">Server-side encryption</h4>
                            <p class="text-xs text-gray-600 mb-2">This setting can't be edited after the table is
                                created.</p>

                            <div class="space-y-2">
                                <label class="flex items-start gap-2 cursor-pointer">
                                    <input type="radio" value="None" v-model="inventorySSE"
                                        class="w-4 h-4 mt-0.5 text-[var(--aws-blue)] focus:ring-[var(--aws-blue)] border-gray-300">
                                    <div>
                                        <span class="text-sm text-gray-900">Don't specify encryption type</span>
                                        <p class="text-xs text-gray-600">The bucket settings for default encryption are
                                            used to encrypt the table when storing it in Amazon S3.</p>
                                    </div>
                                </label>
                                <label class="flex items-start gap-2 cursor-pointer">
                                    <input type="radio" value="Specify" v-model="inventorySSE"
                                        class="w-4 h-4 mt-0.5 text-[var(--aws-blue)] focus:ring-[var(--aws-blue)] border-gray-300">
                                    <div>
                                        <span class="text-sm text-gray-900">Specify encryption type</span>
                                        <p class="text-xs text-gray-600">The specified encryption key is used to encrypt
                                            the table before storing it in Amazon S3.</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Footer -->
            <div
                class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-3 z-[100] px-10 shadow-2xl">
                <button @click="router.back()"
                    class="px-6 py-2 text-xs font-bold border border-gray-300 hover:bg-gray-50 transition-colors text-[var(--aws-blue)]">Cancel</button>
                <button @click="handleCreate"
                    class="px-8 py-2 text-xs font-bold bg-[var(--aws-orange)] text-white hover:opacity-90 transition-opacity rounded-sm">Create
                    metadata configuration</button>
            </div>
        </div>
    </div>
</template>
