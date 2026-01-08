<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import DeveloperQuickConnect from '../widgets/DeveloperQuickConnect.vue'
import SectionHeader from '../shared/SectionHeader.vue'
import InfoAlert from '../shared/InfoAlert.vue'
import EmptyState from '../shared/EmptyState.vue'

const props = defineProps<{
    bucketName: string
}>()

const router = useRouter()

// State for Static Website Hosting
const isEditWebsiteModalOpen = ref(false)
const websiteConfig = reactive({
    enabled: false,
    hostingType: 'host', // 'host' or 'redirect'
    indexDocument: 'index.html',
    errorDocument: 'error.html'
})

// State for Bucket Policies
const isEditPolicyModalOpen = ref(false)
const currentPolicyJson = ref('')
const selectedPolicyIds = ref<number[]>([])
const policies = ref<{ id: number; content: string; name: string }[]>([
    {
        id: 1,
        name: 'PublicReadPolicy',
        content: JSON.stringify({
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Sid": "PublicReadGetObject",
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": "s3:GetObject",
                    "Resource": `arn:serw:s3:::${props.bucketName}/*`
                }
            ]
        }, null, 4)
    }
])

const handleSavePolicy = () => {
    try {
        // Validate JSON
        JSON.parse(currentPolicyJson.value)

        policies.value.push({
            id: Date.now(),
            name: `Policy-${policies.value.length + 1}`,
            content: currentPolicyJson.value
        })
        isEditPolicyModalOpen.value = false
        currentPolicyJson.value = ''
    } catch (e) {
        alert('Invalid JSON format. Please check your policy.')
    }
}

const deleteSelectedPolicies = () => {
    policies.value = policies.value.filter(p => !selectedPolicyIds.value.includes(p.id))
    selectedPolicyIds.value = []
}

const togglePolicySelection = (id: number) => {
    const idx = selectedPolicyIds.value.indexOf(id)
    if (idx === -1) selectedPolicyIds.value.push(id)
    else selectedPolicyIds.value.splice(idx, 1)
}

const copyPolicy = (content: string) => {
    navigator.clipboard.writeText(content)
}

// State for CORS Configuration
const isEditCorsModalOpen = ref(false)
const currentCorsJson = ref('')
const corsConfigs = ref<{ id: number; content: string }[]>([
    {
        id: 1,
        content: JSON.stringify([
            {
                "AllowedHeaders": ["*"],
                "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
                "AllowedOrigins": ["*"],
                "ExposeHeaders": ["ETag"],
                "MaxAgeSeconds": 3000
            }
        ], null, 4)
    }
])

const handleSaveCors = () => {
    try {
        JSON.parse(currentCorsJson.value)
        corsConfigs.value = [{ id: Date.now(), content: currentCorsJson.value }]
        isEditCorsModalOpen.value = false
    } catch (e) {
        alert('Invalid JSON format for CORS configuration.')
    }
}

const handleDeleteCors = () => {
    corsConfigs.value = []
}

const copyCors = (content: string) => {
    navigator.clipboard.writeText(content)
}

const handleSaveWebsite = () => {
    isEditWebsiteModalOpen.value = false
    // Note: Integration with backend API would happen here
}

// State for Block Public Access
const isEditBlockPublicModalOpen = ref(false)
const blockPublicAccess = reactive({
    blockAll: true,
    blockedAccessPoints: [] as string[]
})
const tempBlockPublicAccess = reactive({
    blockAll: true,
    blockedAccessPoints: [] as string[]
})

const mockAccessPoints = [
    { name: 'finance-access-point' },
    { name: 'marketing-data-ap' },
    { name: 'internal-logs-ap' },
    { name: 'customer-uploads-ap' }
]

const handleSaveBlockPublicAccess = () => {
    blockPublicAccess.blockAll = tempBlockPublicAccess.blockAll
    blockPublicAccess.blockedAccessPoints = [...tempBlockPublicAccess.blockedAccessPoints]
    isEditBlockPublicModalOpen.value = false
}
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
                :showEdit="true"
                @edit="isEditBlockPublicModalOpen = true; tempBlockPublicAccess.blockAll = blockPublicAccess.blockAll; tempBlockPublicAccess.blockedAccessPoints = [...blockPublicAccess.blockedAccessPoints]" />
            <div class="p-4 bg-gray-50">
                <div class="border border-gray-300 rounded-sm bg-white p-4">
                    <h3 class="text-sm font-bold text-gray-900 mb-2">Block all public access</h3>
                    <p class="text-xs text-gray-900 font-bold mb-4"
                        :class="blockPublicAccess.blockAll ? 'text-gray-900' : 'text-blue-600'">
                        {{ blockPublicAccess.blockAll ? 'On' : 'Off' }}
                    </p>

                    <div v-if="!blockPublicAccess.blockAll" class="space-y-4">
                        <div v-if="blockPublicAccess.blockedAccessPoints.length > 0" class="pt-2">
                            <h4 class="text-[10px] font-bold text-gray-500 uppercase mb-2">Blocked Access Points</h4>
                            <div class="flex flex-wrap gap-2">
                                <span v-for="ap in blockPublicAccess.blockedAccessPoints" :key="ap"
                                    class="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-sm text-[10px] font-medium flex items-center gap-1.5">
                                    <span class="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                                    {{ ap }}
                                </span>
                            </div>
                        </div>
                        <div v-else
                            class="text-[11px] text-gray-500 italic bg-gray-50 p-2 rounded-sm border border-dashed border-gray-300">
                            No individual access points are currently blocked.
                        </div>
                    </div>

                    <div class="flex items-center gap-1 mt-4">
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
                <SectionHeader title="Static website hosting" :showEdit="true" @edit="isEditWebsiteModalOpen = true" />
                <div class="p-4">
                    <p class="text-xs text-gray-600 mb-4">Use this bucket to host a website or redirect requests.
                    </p>
                    <div v-if="websiteConfig.enabled">
                        <div class="grid grid-cols-2 gap-y-4 mb-4">
                            <div>
                                <p class="text-[11px] font-bold text-gray-500 uppercase">Bucket hosting</p>
                                <p class="text-xs text-gray-900">Enabled</p>
                            </div>
                            <div>
                                <p class="text-[11px] font-bold text-gray-500 uppercase">Endpoint</p>
                                <a href="#" class="text-xs text-[var(--aws-blue)] hover:underline truncate block">
                                    http://{{ bucketName }}.s3-website.eu-north-1.amazonaws.com
                                </a>
                            </div>
                            <div>
                                <p class="text-[11px] font-bold text-gray-500 uppercase">Index document</p>
                                <p class="text-xs text-gray-900">{{ websiteConfig.indexDocument }}</p>
                            </div>
                            <div>
                                <p class="text-[11px] font-bold text-gray-500 uppercase">Error document</p>
                                <p class="text-xs text-gray-900">{{ websiteConfig.errorDocument || '-' }}</p>
                            </div>
                        </div>
                    </div>
                    <div v-else>
                        <InfoAlert
                            message="<p class='text-xs text-gray-900 font-bold'>AWS Amplify Hosting</p><p class='text-xs text-gray-600'>The easiest way to host a static website.</p>"
                            :showButton="true" buttonLabel="Try it out" />
                        <h3 class="text-sm font-bold text-gray-900 mt-4">S3 static website hosting</h3>
                        <p class="text-xs text-gray-900">Disabled</p>
                    </div>
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
                :showEdit="true" :showDelete="selectedPolicyIds.length > 0"
                @edit="isEditPolicyModalOpen = true; currentPolicyJson = ''" @delete="deleteSelectedPolicies" />
            <div class="p-4">
                <InfoAlert v-if="policies.length > 0"
                    message="You have blocked all public access to this bucket. We recommend that you review your bucket policy to ensure that it contains no public access." />

                <div v-if="policies.length > 0" class="mt-4 space-y-4">
                    <div v-for="policy in policies" :key="policy.id"
                        class="border rounded-sm bg-gray-50 overflow-hidden"
                        :class="selectedPolicyIds.includes(policy.id) ? 'border-[var(--aws-blue)] ring-1 ring-[var(--aws-blue)]' : 'border-gray-200'">
                        <div class="flex items-center justify-between p-2 bg-white border-b border-gray-200">
                            <div class="flex items-center gap-2">
                                <input type="checkbox" :checked="selectedPolicyIds.includes(policy.id)"
                                    @change="togglePolicySelection(policy.id)"
                                    class="w-3.5 h-3.5 rounded border-gray-300">
                                <span class="text-xs font-bold text-gray-700">{{ policy.name }}</span>
                            </div>
                            <button @click="copyPolicy(policy.content)"
                                class="text-[10px] text-[var(--aws-blue)] font-bold hover:underline flex items-center gap-1">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg> Copy JSON
                            </button>
                        </div>
                        <pre
                            class="p-3 text-[10px] font-mono text-gray-600 bg-gray-50 overflow-x-auto max-h-48"><code>{{ policy.content }}</code></pre>
                    </div>
                </div>

                <div v-else class="text-center py-8">
                    <div class="bg-gray-50 border border-gray-300 rounded-sm p-4 text-xs text-gray-500 italic">
                        No policy to display. Click "Edit" to add a bucket policy.
                    </div>
                </div>
            </div>
        </div>

        <!-- CORS -->
        <div class="border border-gray-200 rounded-sm bg-white">
            <SectionHeader title="Cross-origin resource sharing (CORS)"
                description="Define limits on how your bucket interacts with client web applications. <a href='#' class='text-[var(--aws-blue)] underline'>Learn more ↗</a>"
                :showEdit="true" :showDelete="corsConfigs.length > 0"
                @edit="isEditCorsModalOpen = true; currentCorsJson = corsConfigs?.[0]?.content ?? ''"
                @delete="handleDeleteCors" />
            <div class="p-4">
                <div v-if="corsConfigs.length > 0" class="space-y-4">
                    <div v-for="config in corsConfigs" :key="config.id" class="relative group">
                        <pre
                            class="p-3 text-[10px] font-mono text-gray-600 bg-gray-50 border border-gray-200 rounded-sm overflow-x-auto max-h-64"><code>{{ config.content }}</code></pre>
                        <button @click="copyCors(config.content)"
                            class="absolute top-2 right-2 px-2 py-1 border border-gray-300 rounded-sm bg-white text-gray-600 flex items-center gap-1 text-[10px] hover:bg-gray-50 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg> Copy
                        </button>
                    </div>
                </div>
                <div v-else>
                    <div class="bg-gray-50 border border-gray-300 rounded-sm p-4 text-xs text-gray-500 italic">
                        No configurations to display. Click "Edit" to add a CORS configuration.
                    </div>
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

    <!-- Edit Static Website Hosting Modal -->
    <div v-if="isEditWebsiteModalOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
        <div class="bg-white rounded-sm shadow-2xl w-full max-w-4xl flex flex-col my-8">
            <!-- Modal Header -->
            <div class="p-4 border-b border-gray-200">
                <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                    Edit static website hosting
                    <span class="text-[var(--aws-blue)] text-xs font-normal hover:underline cursor-pointer">Info</span>
                </h2>
            </div>

            <!-- Modal Body -->
            <div class="p-6">
                <!-- Main Container Box -->
                <div class="border border-gray-300 rounded-sm p-6 mb-8">
                    <h3 class="text-base font-bold text-gray-900 mb-1">Static website hosting</h3>
                    <p class="text-xs text-gray-600 mb-6">
                        Use this bucket to host a website or redirect requests.
                        <a href="#" class="text-[var(--aws-blue)] hover:underline">Learn more ↗</a>
                    </p>

                    <div class="space-y-4">
                        <label class="block text-xs font-bold text-gray-900">Static website hosting</label>
                        <div class="space-y-2">
                            <label class="flex items-center gap-2 cursor-pointer group">
                                <input type="radio" v-model="websiteConfig.enabled" :value="false"
                                    class="w-4 h-4 text-[var(--aws-blue)] focus:ring-[var(--aws-blue)]">
                                <span class="text-xs text-gray-900 font-medium">Disable</span>
                            </label>
                            <label class="flex items-center gap-2 cursor-pointer group">
                                <input type="radio" v-model="websiteConfig.enabled" :value="true"
                                    class="w-4 h-4 text-[var(--aws-blue)] focus:ring-[var(--aws-blue)]">
                                <span class="text-xs text-gray-900 font-medium">Enable</span>
                            </label>
                        </div>

                        <!-- Expanded Section When Enabled -->
                        <div v-if="websiteConfig.enabled" class="pt-6 space-y-8">
                            <!-- Hosting Type -->
                            <div>
                                <label class="block text-xs font-bold text-gray-900 mb-2">Hosting type</label>
                                <div class="space-y-3">
                                    <label class="flex items-start gap-2 cursor-pointer">
                                        <input type="radio" v-model="websiteConfig.hostingType" value="host"
                                            class="mt-0.5 w-4 h-4 text-[var(--aws-blue)] focus:ring-[var(--aws-blue)]">
                                        <div>
                                            <p class="text-xs text-gray-900 font-bold">Host a static website</p>
                                            <p class="text-[11px] text-gray-500">Use the bucket endpoint as the web
                                                address. <a href="#"
                                                    class="text-[var(--aws-blue)] hover:underline">Learn more ↗</a>
                                            </p>
                                        </div>
                                    </label>
                                    <label class="flex items-start gap-2 cursor-not-allowed opacity-50">
                                        <input type="radio" disabled value="redirect"
                                            class="mt-0.5 w-4 h-4 text-gray-400">
                                        <div>
                                            <p class="text-xs text-gray-400 font-bold">Redirect requests for an
                                                object</p>
                                            <p class="text-[11px] text-gray-400">Redirect requests to another bucket
                                                or domain. <a href="#" class="hover:underline">Learn more ↗</a></p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <!-- Warning Box -->
                            <div class="bg-blue-50 border border-[var(--aws-blue)] p-4 rounded-sm flex gap-3">
                                <svg class="w-5 h-5 text-[var(--aws-blue)] shrink-0" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p class="text-xs text-gray-700 leading-relaxed">
                                    For your customers to access content at the website endpoint, you must make all
                                    your content publicly readable. To do so, you can edit the S3 Block Public
                                    Access settings for the bucket. For more information, see
                                    <a href="#" class="text-[var(--aws-blue)] hover:underline">Using Amazon S3 Block
                                        Public Access ↗</a>
                                </p>
                            </div>

                            <!-- Documents -->
                            <div class="space-y-6">
                                <div>
                                    <label class="block text-xs font-bold text-gray-900 mb-1">Index document</label>
                                    <p class="text-[11px] text-gray-500 mb-2">Specify the home or default page of
                                        the website.</p>
                                    <input type="text" v-model="websiteConfig.indexDocument" placeholder="index.html"
                                        class="w-full max-w-lg px-3 py-1.5 text-sm border border-gray-400 rounded-sm focus:ring-1 focus:ring-[var(--aws-blue)] outline-none">
                                </div>
                                <div>
                                    <div class="flex items-center gap-1 mb-1">
                                        <label class="block text-xs font-bold text-gray-900">Error document -
                                            optional</label>
                                    </div>
                                    <p class="text-[11px] text-gray-500 mb-2">This is returned when an error occurs.
                                    </p>
                                    <input type="text" v-model="websiteConfig.errorDocument" placeholder="error.html"
                                        class="w-full max-w-lg px-3 py-1.5 text-sm border border-gray-400 rounded-sm focus:ring-1 focus:ring-[var(--aws-blue)] outline-none">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal Footer -->
            <div class="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
                <button @click="isEditWebsiteModalOpen = false"
                    class="px-4 py-1.5 font-bold text-[var(--aws-blue)] hover:bg-blue-50/50 rounded-sm transition-colors">
                    Cancel
                </button>
                <button @click="handleSaveWebsite"
                    class="px-6 py-1.5 font-bold bg-[var(--aws-orange)] text-white rounded-sm hover:opacity-90 shadow-sm transition-opacity">
                    Save changes
                </button>
            </div>
        </div>
    </div>

    <!-- Edit Bucket Policy Modal -->
    <div v-if="isEditPolicyModalOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
        <div class="bg-white rounded-sm shadow-2xl w-full max-w-4xl flex flex-col my-8">
            <div class="p-4 border-b border-gray-200">
                <h2 class="text-xl font-bold text-gray-900">Edit bucket policy</h2>
                <p class="text-xs text-gray-500 mt-1">Policies are written in JSON and provide permissions to your
                    bucket.</p>
            </div>

            <div class="p-6">
                <div class="border border-gray-300 rounded-sm overflow-hidden flex flex-col h-[500px]">
                    <div class="bg-gray-100 p-2 border-b border-gray-200 flex justify-between items-center">
                        <span class="text-[11px] font-bold text-gray-600 uppercase">Policy editor</span>
                        <div class="text-[10px] text-gray-500 italic">Valid JSON required</div>
                    </div>
                    <textarea v-model="currentPolicyJson" placeholder='{ "Version": "2012-10-17", ... }'
                        class="flex-1 p-4 font-mono text-[11px] text-gray-800 bg-[#f8f9fa] resize-none focus:outline-none leading-relaxed"></textarea>
                </div>

                <div class="mt-4 bg-gray-50 border border-gray-200 p-3 rounded-sm">
                    <h4 class="text-xs font-bold text-gray-900 mb-1">JSON Policy Examples</h4>
                    <p class="text-[11px] text-gray-600">You can use bucket policies to grant public read access,
                        restrict access to specific IP addresses, or require MFA for certain actions. <a href="#"
                            class="text-[var(--aws-blue)] hover:underline">Learn more ↗</a></p>
                </div>
            </div>

            <div class="p-4 border-t border-gray-200 flex justify-end gap-3 bg-white">
                <button @click="isEditPolicyModalOpen = false"
                    class="px-4 py-1.5 font-bold text-[var(--aws-blue)] hover:underline text-xs">
                    Cancel
                </button>
                <button @click="handleSavePolicy" :disabled="!currentPolicyJson.trim()"
                    class="px-6 py-1.5 font-bold bg-[var(--aws-orange)] text-white rounded-sm hover:opacity-90 shadow-sm text-xs transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                    Save policy
                </button>
            </div>
        </div>
    </div>
    <!-- Edit CORS Modal -->
    <div v-if="isEditCorsModalOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
        <div class="bg-white rounded-sm shadow-2xl w-full max-w-4xl flex flex-col my-8">
            <div class="p-4 border-b border-gray-200">
                <h2 class="text-xl font-bold text-gray-900">Edit cross-origin resource sharing (CORS)</h2>
                <p class="text-xs text-gray-500 mt-1">CORS configuration is written in JSON and defines how your bucket
                    allows cross-origin requests.</p>
            </div>

            <div class="p-6">
                <div class="border border-gray-300 rounded-sm overflow-hidden flex flex-col h-[500px]">
                    <div class="bg-gray-100 p-2 border-b border-gray-200 flex justify-between items-center">
                        <span class="text-[11px] font-bold text-gray-600 uppercase">CORS editor</span>
                        <div class="text-[10px] text-gray-500 italic">Valid JSON array required</div>
                    </div>
                    <textarea v-model="currentCorsJson" placeholder='[ { "AllowedHeaders": ["*"], ... } ]'
                        class="flex-1 p-4 font-mono text-[11px] text-gray-800 bg-[#f8f9fa] resize-none focus:outline-none leading-relaxed"></textarea>
                </div>

                <div class="mt-4 bg-blue-50 border border-[var(--aws-blue)] p-3 rounded-sm flex gap-3">
                    <svg class="w-4 h-4 text-[var(--aws-blue)] shrink-0" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p class="text-[11px] text-gray-700 leading-relaxed">
                        The CORS configuration must be a JSON array of rules. Each rule must specify allowed origins,
                        methods, and headers. <a href="#" class="text-[var(--aws-blue)] hover:underline">Learn more
                            ↗</a>
                    </p>
                </div>
            </div>

            <div class="p-4 border-t border-gray-200 flex justify-end gap-3 bg-white">
                <button @click="isEditCorsModalOpen = false"
                    class="px-4 py-1.5 font-bold text-[var(--aws-blue)] hover:underline text-xs">
                    Cancel
                </button>
                <button @click="handleSaveCors" :disabled="!currentCorsJson.trim()"
                    class="px-6 py-1.5 font-bold bg-[var(--aws-orange)] text-white rounded-sm hover:opacity-90 shadow-sm text-xs transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                    Save changes
                </button>
            </div>
        </div>
    </div>
    <!-- Edit Block Public Access Modal -->
    <div v-if="isEditBlockPublicModalOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
        <div class="bg-white rounded-sm shadow-2xl w-full max-w-2xl flex flex-col my-8">
            <div class="p-4 border-b border-gray-200">
                <h2 class="text-xl font-bold text-gray-900">Edit Block public access (bucket settings)</h2>
            </div>

            <div class="p-6">
                <div class="bg-amber-50 border border-amber-400 p-4 mb-6 flex gap-3">
                    <svg class="w-5 h-5 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p class="text-[11px] text-amber-800 leading-relaxed font-medium">
                        Blocking all public access provides a strong security boundary. Turning this off might expose
                        your bucket's data if permissions are too broad.
                    </p>
                </div>

                <div class="space-y-6">
                    <label
                        class="flex items-start gap-3 p-4 border rounded-sm bg-gray-50 cursor-pointer group hover:border-[var(--aws-blue)] transition-colors">
                        <input type="checkbox" v-model="tempBlockPublicAccess.blockAll"
                            class="mt-1 w-4 h-4 text-[var(--aws-blue)] rounded-sm border-gray-400">
                        <div>
                            <p class="text-sm font-bold text-gray-900">Block all public access</p>
                            <p class="text-[11px] text-gray-500 leading-tight">Recommended. Turning this on will
                                override any other bucket or access point policies that grant public access.</p>
                        </div>
                    </label>

                    <div class="border-t pt-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-xs font-bold text-gray-700 uppercase tracking-wider">Individual Access
                                Points</h3>
                            <span class="text-[10px] text-gray-500 font-medium" v-if="tempBlockPublicAccess.blockAll">
                                Locked by "Block all"
                            </span>
                        </div>

                        <div class="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            <div v-for="ap in mockAccessPoints" :key="ap.name"
                                class="flex items-center justify-between p-3 border rounded-sm transition-all duration-200"
                                :class="tempBlockPublicAccess.blockAll ? 'opacity-40 grayscale cursor-not-allowed bg-gray-100' : 'bg-white hover:border-[var(--aws-blue)] hover:shadow-sm'">
                                <div class="flex items-center gap-3">
                                    <input type="checkbox" :value="ap.name"
                                        v-model="tempBlockPublicAccess.blockedAccessPoints"
                                        :disabled="tempBlockPublicAccess.blockAll"
                                        class="w-4 h-4 text-[var(--aws-blue)] rounded-sm border-gray-400 disabled:bg-gray-200">
                                    <div>
                                        <p class="text-xs font-bold"
                                            :class="tempBlockPublicAccess.blockAll ? 'text-gray-500' : 'text-gray-900'">
                                            {{ ap.name }}</p>
                                        <div class="flex items-center gap-2 mt-0.5">
                                            <span class="text-[9px] font-mono text-gray-400">Access Point</span>
                                            <span v-if="tempBlockPublicAccess.blockedAccessPoints.includes(ap.name)"
                                                class="text-[9px] text-red-600 font-bold uppercase">Blocked</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
                <button @click="isEditBlockPublicModalOpen = false"
                    class="px-4 py-1.5 font-bold text-[var(--aws-blue)] hover:bg-blue-50/50 rounded-sm transition-colors text-xs">
                    Cancel
                </button>
                <button @click="handleSaveBlockPublicAccess"
                    class="px-6 py-1.5 font-bold bg-[var(--aws-orange)] text-white rounded-sm hover:opacity-90 shadow-sm transition-opacity text-xs">
                    Save changes
                </button>
            </div>
        </div>
    </div>
</template>
