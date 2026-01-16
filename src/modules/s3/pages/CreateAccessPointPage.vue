<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from '@/shared/components/Navbar.vue'

const route = useRoute()
const router = useRouter()

const bucketName = computed(() => route.params.bucketName as string)
const region = 'Europe (Stockholm) eu-north-1'

const accessPointName = ref('')
const networkOrigin = ref('internet') // 'vpc' or 'internet'
const vpcId = ref('')
const blockAllPublicAccess = ref(true)

// Sub-settings for Block Public Access (disabled when block all is true)
const blockPublicAcls = ref(true)
const ignorePublicAcls = ref(true)
const blockPublicPolicy = ref(true)
const blockPublicCrossAccount = ref(true)

const tags = ref<{ key: string, value: string }[]>([])

const handleCancel = () => {
    router.push({ name: 's3-bucket-details', params: { bucketName: bucketName.value }, query: { tab: 'access points' } })
}

const handleCreate = () => {
    // Simulate creation
    router.push({ name: 's3-bucket-details', params: { bucketName: bucketName.value }, query: { tab: 'access points' } })
}

const addTag = () => {
    tags.value.push({ key: '', value: '' })
}

const removeTag = (index: number) => {
    tags.value.splice(index, 1)
}

</script>

<template>
    <div class="min-h-screen bg-gray-100 font-sans pb-24">
        <Navbar />

        <!-- Breadcrumbs -->
        <div class="h-10 px-4 flex items-center gap-2 text-[11px] text-gray-500 bg-white border-b border-gray-200">
            <span @click="router.push('/s3')" class="hover:text-[var(--aws-blue)] hover:underline cursor-pointer">Amazon
                S3</span>
            <span>></span>
            <span class="hover:text-[var(--aws-blue)] hover:underline cursor-pointer">Access Points</span>
            <span>></span>
            <span class="text-gray-900 font-bold">Create access point</span>
        </div>

        <div class="max-w-4xl mx-auto p-4 space-y-4">
            <!-- Header -->
            <div>
                <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    Create access point for general purpose bucket
                    <span
                        class="text-[10px] text-[var(--aws-blue)] hover:underline cursor-pointer uppercase font-bold tracking-tight">Info</span>
                </h1>
                <p class="text-xs text-gray-600 mt-1">
                    Amazon S3 Access Points simplify managing data access at scale for shared datasets in S3. Access
                    points are named network endpoints that are attached to buckets that you can use to perform S3
                    object
                    operations. <a href="#" class="text-[var(--aws-blue)] underline">Learn more ↗</a>
                </p>
            </div>

            <!-- Properties Card -->
            <div class="border border-gray-200 rounded-sm bg-white p-6">
                <h2 class="text-lg font-bold text-gray-900 mb-4">Properties</h2>

                <div class="space-y-6">
                    <div>
                        <label class="block text-sm font-bold text-gray-900 mb-1">AWS Region</label>
                        <p class="text-xs text-gray-600">{{ region }}</p>
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-gray-900 mb-1">Access point name</label>
                        <p class="text-xs text-gray-600 mb-1">Access point names must be unique within the account for
                            this Region and comply with the <span
                                class="text-[var(--aws-blue)] underline cursor-pointer">rules for access point naming
                                ↗</span>.</p>
                        <input v-model="accessPointName" type="text" placeholder="accesspoint"
                            class="w-full max-w-xl px-3 py-1.5 text-sm border border-gray-400 rounded-sm focus:ring-1 focus:ring-[var(--aws-blue)] focus:border-[var(--aws-blue)] outline-none shadow-sm">
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-gray-900 mb-1">Bucket name</label>
                        <p class="text-xs text-gray-900">{{ bucketName }}</p>
                    </div>
                </div>
            </div>

            <!-- Network Origin Card -->
            <div class="border border-gray-200 rounded-sm bg-white p-6">
                <h2 class="text-lg font-bold text-gray-900 mb-4">Network origin</h2>

                <div class="space-y-3">
                    <div class="flex items-start gap-2">
                        <input type="radio" id="vpc" value="vpc" v-model="networkOrigin"
                            class="mt-0.5 border-gray-300 text-[var(--aws-blue)] focus:ring-[var(--aws-blue)]">
                        <div>
                            <label for="vpc" class="text-sm font-bold text-gray-900 block">Virtual private cloud
                                (VPC)</label>
                            <p class="text-xs text-gray-600">No internet access. Requests are made over a specified VPC
                                only.</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-2">
                        <input type="radio" id="internet" value="internet" v-model="networkOrigin"
                            class="mt-0.5 border-gray-300 text-[var(--aws-blue)] focus:ring-[var(--aws-blue)]">
                        <div>
                            <label for="internet" class="text-sm font-bold text-gray-900 block">Internet</label>
                        </div>
                    </div>
                </div>

                <!-- VPC Info Alert -->
                <div v-if="networkOrigin === 'vpc'" class="mt-6">
                    <div class="border border-[var(--aws-blue)] bg-blue-50/10 p-3 flex gap-3 rounded-sm mb-4">
                        <svg class="w-5 h-5 text-[var(--aws-blue)] shrink-0 mt-0.5" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p class="text-xs text-gray-900">The S3 console doesn't support accessing bucket resources using
                            a virtual private cloud (VPC) access point. To access bucket resources from a VPC access
                            point, use the AWS CLI, AWS SDK, or Amazon S3 REST API. <a href="#"
                                class="text-[var(--aws-blue)] underline">Learn more ↗</a></p>
                    </div>

                    <label class="block text-sm font-bold text-gray-900 mb-1">VPC ID</label>
                    <input v-model="vpcId" type="text" placeholder="vpc-"
                        class="w-full max-w-xl px-3 py-1.5 text-sm border border-gray-400 rounded-sm focus:ring-1 focus:ring-[var(--aws-blue)] focus:border-[var(--aws-blue)] outline-none shadow-sm">
                    <p class="text-xs text-gray-500 mt-1">VPC ID must start with vpc-</p>
                </div>
            </div>

            <!-- Block Public Access Card -->
            <div class="border border-gray-200 rounded-sm bg-white p-6">
                <h2 class="text-lg font-bold text-gray-900 mb-2">Block Public Access settings for this Access Point</h2>
                <p class="text-xs text-gray-600 mb-4">Public access is granted to buckets and objects through access
                    control lists (ACLs), bucket policies, access point policies, or all. These settings apply only to
                    this Access Point. Before applying these settings, ensure that your applications will work correctly
                    without public access. These settings can't be edited after the Access Point is created. <a href="#"
                        class="text-[var(--aws-blue)] underline">Learn more ↗</a></p>

                <div class="bg-gray-50 border border-gray-200 p-4 rounded-sm space-y-4">
                    <div class="flex items-start gap-2">
                        <input v-model="blockAllPublicAccess" type="checkbox"
                            class="mt-0.5 border-gray-300 rounded text-[var(--aws-blue)] focus:ring-[var(--aws-blue)]">
                        <div>
                            <span class="text-sm font-bold text-gray-900 block">Block all public access</span>
                            <span class="text-xs text-gray-600">Turning this setting on is the same as turning on all
                                four settings below. Each of the following settings are independent of one
                                another.</span>
                        </div>
                    </div>

                    <div class="pl-6 space-y-3 opacity-50 pointer-events-none">
                        <div class="flex items-start gap-2">
                            <input checked disabled type="checkbox"
                                class="mt-0.5 border-gray-300 rounded text-[var(--aws-blue)] focus:ring-[var(--aws-blue)]">
                            <div>
                                <span class="text-sm font-bold text-gray-900 block">Block public access to buckets and
                                    objects granted through <i>new</i> access control lists (ACLs)</span>
                                <span class="text-xs text-gray-600">S3 will block public access permissions applied to
                                    newly added buckets or objects, and prevent the creation of new public access ACLs
                                    for existing buckets and objects. This setting doesn't change any existing
                                    permissions that allow public access to S3 resources using ACLs.</span>
                            </div>
                        </div>
                        <div class="flex items-start gap-2">
                            <input checked disabled type="checkbox"
                                class="mt-0.5 border-gray-300 rounded text-[var(--aws-blue)] focus:ring-[var(--aws-blue)]">
                            <div>
                                <span class="text-sm font-bold text-gray-900 block">Block public access to buckets and
                                    objects granted through <i>any</i> access control lists (ACLs)</span>
                                <span class="text-xs text-gray-600">S3 will ignore all ACLs that grant public access to
                                    buckets and objects.</span>
                            </div>
                        </div>
                        <div class="flex items-start gap-2">
                            <input checked disabled type="checkbox"
                                class="mt-0.5 border-gray-300 rounded text-[var(--aws-blue)] focus:ring-[var(--aws-blue)]">
                            <div>
                                <span class="text-sm font-bold text-gray-900 block">Block public access to buckets and
                                    objects granted through <i>new</i> public bucket or access point policies</span>
                                <span class="text-xs text-gray-600">S3 will block new bucket and access point policies
                                    that grant public access to buckets and objects. This setting doesn't change any
                                    existing policies that allow public access to S3 resources.</span>
                            </div>
                        </div>
                        <div class="flex items-start gap-2">
                            <input checked disabled type="checkbox"
                                class="mt-0.5 border-gray-300 rounded text-[var(--aws-blue)] focus:ring-[var(--aws-blue)]">
                            <div>
                                <span class="text-sm font-bold text-gray-900 block">Block public and cross-account
                                    access to buckets and objects through <i>any</i> public bucket or access point
                                    policies</span>
                                <span class="text-xs text-gray-600">S3 will ignore public and cross-account access for
                                    buckets or access points with policies that grant public access to buckets and
                                    objects.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Access Point Policy Card -->
            <div class="border border-gray-200 rounded-sm bg-white p-6">
                <div class="flex justify-between items-center mb-2">
                    <h2 class="text-lg font-bold text-gray-900">Access Point policy - <span
                            class="italic font-normal">optional</span></h2>
                    <button
                        class="px-2 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-900 hover:bg-gray-50 flex items-center gap-1">
                        Policy examples <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </button>
                </div>
                <p class="text-xs text-gray-600 mb-2">The Access Point policy, written in JSON, provides access to the
                    objects stored in the bucket from this Access Point. Access Point policies don't apply to objects
                    owned by other accounts. <a href="#" class="text-[var(--aws-blue)] underline">Learn more ↗</a></p>

                <div class="mb-4">
                    <label class="text-sm font-bold text-gray-900">Access Point ARN</label>
                    <p class="text-xs text-gray-900">-</p>
                </div>

                <div class="mb-4">
                    <label class="text-sm font-bold text-gray-900 mb-2 block">Policy</label>
                    <div class="border border-gray-300 rounded-sm flex">
                        <div
                            class="w-10 bg-gray-100 border-r border-gray-300 text-right p-2 text-xs text-gray-500 select-none">
                            1</div>
                        <div class="flex-1">
                            <textarea class="w-full h-48 p-2 text-sm font-mono focus:outline-none resize-y"
                                spellcheck="false"></textarea>
                        </div>
                        <!-- Policy Editor sidebar -->
                        <div class="w-64 border-l border-gray-300 bg-white p-4">
                            <h3 class="text-xs font-bold text-gray-900 mb-4">Edit statement</h3>
                            <div class="text-center">
                                <h4 class="text-xs font-bold text-gray-900 mb-2">Select a statement</h4>
                                <p class="text-xs text-gray-600 mb-4">Select an existing statement in the policy or add
                                    a new statement.</p>
                                <button
                                    class="px-3 py-1 text-xs font-bold border border-[var(--aws-blue)] text-[var(--aws-blue)] bg-white rounded-sm hover:bg-blue-50">+
                                    Add new statement</button>
                            </div>
                        </div>
                    </div>
                    <div
                        class="border-t border-x border-b border-gray-300 bg-white p-1 px-2 flex gap-4 text-xs text-gray-500">
                        <span>JSON</span>
                        <span>Ln 1, Col 0</span>
                    </div>
                    <div
                        class="border border-gray-300 p-2 mt-2 bg-gray-50 text-xs text-gray-500 grid grid-cols-4 gap-4">
                        <span class="flex items-center gap-1"><svg class="w-4 h-4" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg> Security: 0</span>
                        <span class="flex items-center gap-1"><svg class="w-4 h-4" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg> Errors: 0</span>
                        <span class="flex items-center gap-1"><svg class="w-4 h-4" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg> Warnings: 0</span>
                        <span class="flex items-center gap-1"><svg class="w-4 h-4" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg> Suggestions: 0</span>
                    </div>
                </div>
            </div>

            <!-- Tags Card -->
            <div class="border border-gray-200 rounded-sm bg-white p-6">
                <h2 class="text-lg font-bold text-gray-900 mb-2">Tags - <span class="italic font-normal">optional</span>
                </h2>
                <p class="text-xs text-gray-600 mb-4">You can use access point tags to analyze, manage, and specify
                    permissions for an access point. <a href="#" class="text-[var(--aws-blue)] underline">Learn more
                        ↗</a></p>

                <div v-if="tags.length === 0" class="mb-4">
                    <p class="text-xs text-gray-600">No tags associated with this access point.</p>
                </div>
                <div v-else class="space-y-2 mb-4">
                    <div class="grid grid-cols-[1fr_1fr_40px] gap-2 text-xs font-bold text-gray-600">
                        <div>Key</div>
                        <div>Value - optional</div>
                        <div></div>
                    </div>
                    <div v-for="(tag, index) in tags" :key="index" class="grid grid-cols-[1fr_1fr_40px] gap-2">
                        <input v-model="tag.key" type="text" placeholder="Key"
                            class="px-2 py-1 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-[var(--aws-blue)] outline-none">
                        <input v-model="tag.value" type="text" placeholder="Value - optional"
                            class="px-2 py-1 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-[var(--aws-blue)] outline-none">
                        <button @click="removeTag(index)"
                            class="text-[var(--aws-blue)] text-xs underline">Remove</button>
                    </div>
                </div>

                <div class="pt-2">
                    <button @click="addTag"
                        class="px-3 py-1 text-xs font-bold border border-[var(--aws-blue)] text-[var(--aws-blue)] bg-white rounded-sm hover:bg-blue-50">Add
                        new tag</button>
                    <p class="text-xs text-gray-500 mt-2">You can add up to 50 tags.</p>
                </div>
            </div>

            <!-- Footer -->
            <div class="flex justify-end gap-2 pt-4">
                <button @click="handleCancel"
                    class="px-3 py-1.5 text-xs font-bold border border-gray-300 rounded-sm hover:bg-gray-50 bg-white">Cancel</button>
                <button @click="handleCreate"
                    class="px-3 py-1.5 text-xs font-bold bg-[var(--aws-orange)] text-white rounded-sm hover:opacity-90">Create
                    access point</button>
            </div>

        </div>
    </div>
</template>
