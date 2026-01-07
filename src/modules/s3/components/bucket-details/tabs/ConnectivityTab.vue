<script setup lang="ts">
import { useRouter } from 'vue-router'
import DeveloperQuickConnect from '../widgets/DeveloperQuickConnect.vue'
import SectionHeader from '../shared/SectionHeader.vue'
import InfoAlert from '../shared/InfoAlert.vue'
import EmptyState from '../shared/EmptyState.vue'

const props = defineProps<{
    bucketName: string
}>()

const router = useRouter()
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="bg-gray-50 border-b border-t border-gray-200 p-4 mb-4">
            <h2 class="text-xl font-bold text-gray-900">Connectivity & Access</h2>
            <p class="text-gray-600 text-sm">Manage how the world connects to your data.</p>
        </div>

        <!-- Developer Quick Connect -->
        <DeveloperQuickConnect />

        <!-- Block Public Access -->
        <div class="border border-gray-200 rounded-sm bg-white">
            <SectionHeader title="Block public access (bucket settings)"
                description="Public access is granted to buckets and objects through access control lists (ACLs), bucket policies, access point policies, or all. In order to ensure that public access to this bucket and its objects is blocked, turn on Block all public access. These settings apply only to this bucket and its access points. <a href='#' class='text-[var(--aws-blue)] underline'>Learn more ↗</a>"
                :showEdit="true" />
            <div class="p-4 bg-gray-50">
                <div class="border border-gray-300 rounded-sm bg-white p-4">
                    <h3 class="text-sm font-bold text-gray-900 mb-2">Block all public access</h3>
                    <p class="text-xs text-gray-900 font-bold mb-4">On</p>
                    <div class="flex items-center gap-1 cursor-pointer">
                        <svg class="w-3 h-3 text-[var(--aws-blue)]" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                        <span class="text-xs text-[var(--aws-blue)]">Individual Block Public Access settings for this
                            bucket</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Integration Points Grid -->
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <!-- Static Website Hosting -->
            <div class="border border-gray-200 rounded-sm bg-white">
                <SectionHeader title="Static website hosting" :showEdit="true" />
                <div class="p-4">
                    <p class="text-xs text-gray-600 mb-4">Use this bucket to host a website or redirect requests.</p>
                    <InfoAlert
                        message="<p class='text-xs text-gray-900 font-bold'>AWS Amplify Hosting</p><p class='text-xs text-gray-600'>The easiest way to host a static website.</p>"
                        :showButton="true" buttonLabel="Try it out" />
                    <h3 class="text-sm font-bold text-gray-900 mt-4">S3 static website hosting</h3>
                    <p class="text-xs text-gray-900">Disabled</p>
                </div>
            </div>

            <!-- Access Points -->
            <div class="border border-gray-200 rounded-sm bg-white">
                <div class="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 class="text-lg font-bold text-gray-900">Access Points</h2>
                    <button @click="router.push(`/s3/buckets/${bucketName}/create-access-point`)"
                        class="px-3 py-1 text-xs font-bold bg-[var(--aws-orange)] text-white rounded-sm hover:opacity-90">
                        Create access point
                    </button>
                </div>
                <EmptyState title="No access points"
                    message="Access points simplify data access for any AWS service or customer application." />
            </div>
        </div>

        <!-- Bucket Policy -->
        <div class="border border-gray-200 rounded-sm bg-white">
            <SectionHeader title="Bucket policy"
                description="The bucket policy, written in JSON, provides access to the objects stored in the bucket. Bucket policies don't apply to objects owned by other accounts. <a href='#' class='text-[var(--aws-blue)] underline'>Learn more ↗</a>"
                :showEdit="true" :showDelete="true" />
            <div class="p-4">
                <InfoAlert
                    message="You have blocked all public access to this bucket. We recommend that you review your bucket policy to ensure that it contains no public access." />
                <div class="relative mt-4">
                    <textarea readonly
                        class="w-full h-32 p-2 text-xs font-mono bg-gray-50 border border-gray-300 rounded-sm text-gray-500 resize-none focus:outline-none">No policy to display.</textarea>
                    <button
                        class="absolute top-2 right-2 px-2 py-1 border border-gray-300 rounded-sm bg-white text-gray-600 flex items-center gap-1 text-xs hover:bg-gray-50 shadow-sm">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg> Copy
                    </button>
                </div>
            </div>
        </div>

        <!-- CORS -->
        <div class="border border-gray-200 rounded-sm bg-white">
            <SectionHeader title="Cross-origin resource sharing (CORS)"
                description="Define limits on how your bucket interacts with client web applications."
                :showEdit="true" />
            <div class="p-4">
                <div class="relative">
                    <textarea readonly
                        class="w-full h-32 p-2 text-xs font-mono bg-gray-50 border border-gray-300 rounded-sm text-gray-500 resize-none focus:outline-none">No configurations to display.</textarea>
                </div>
            </div>
        </div>

        <!-- ACL (Legacy) -->
        <div class="border border-gray-200 rounded-sm bg-white opacity-60">
            <div class="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 class="text-lg font-bold text-gray-900">Access control list (ACL)</h2>
                <span class="text-xs bg-gray-100 px-2 py-1 rounded">Legacy</span>
            </div>
        </div>
    </div>
</template>
