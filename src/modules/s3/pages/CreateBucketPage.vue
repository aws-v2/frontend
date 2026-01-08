<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useS3Store } from '../store/s3Store'
import { useToastStore } from '@/shared/store/toastStore'
import ChooseBucketModal from '../components/ChooseBucketModal.vue'
import apiClient from '@/shared/api/apiClient'

const router = useRouter()
const s3Store = useS3Store()
const toastStore = useToastStore()

const bucketName = ref('')
const region = ref('Nairobi (Kenya) ke-nbo-1')
const bucketType = ref('General purpose')
const objectOwnership = ref('ACLs disabled')
const blockPublicAccess = ref(true)
const bucketVersioning = ref('Disable')
const tags = ref([])
const encryptionType = ref('SSE-S3')
const bucketKey = ref('Enable')
const showAdvanced = ref(true) // Open by default based on screenshot context usually, or keep false if user prefers. User just showed content. Let's keep it togglable but maybe open for now or just implement the content. The screenshot has it open.
const objectLock = ref('Disable')

const showChooseBucketModal = ref(false)

watch(objectLock, (newValue) => {
    if (newValue === 'Enable') {
        bucketVersioning.value = 'Enable'
    }
})

const validateBucketName = (name: string): { valid: boolean; error?: string } => {
    // Bucket name validation rules
    if (!name) {
        return { valid: false, error: 'Bucket name is required' }
    }
    if (name.length < 3 || name.length > 63) {
        return { valid: false, error: 'Bucket name must be between 3 and 63 characters' }
    }
    if (!/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/.test(name)) {
        return { valid: false, error: 'Bucket name must start and end with a letter or number, and contain only lowercase letters, numbers, periods, and hyphens' }
    }
    if (/\.\./.test(name)) {
        return { valid: false, error: 'Bucket name cannot contain consecutive periods' }
    }
    if (/^\d+\.\d+\.\d+\.\d+$/.test(name)) {
        return { valid: false, error: 'Bucket name cannot be formatted as an IP address' }
    }
    return { valid: true }
}

const handleCreateBucket = async () => {
    // Validate bucket name
    const validation = validateBucketName(bucketName.value)
    if (!validation.valid) {
        toastStore.addToast(validation.error || 'Invalid bucket name', 'error')
        return
    }

    // Collect all form data
    const bucketData = {
        name: bucketName.value,
        region: region.value,
        bucketType: bucketType.value,
        objectOwnership: objectOwnership.value,
        blockPublicAccess: {
            blockPublicAcls: blockPublicAccess.value,
            ignorePublicAcls: blockPublicAccess.value,
            blockPublicPolicy: blockPublicAccess.value,
            restrictPublicBuckets: blockPublicAccess.value
        },
        versioning: bucketVersioning.value === 'Enable',
        tags: tags.value,
        encryption: {
            type: encryptionType.value,
            bucketKeyEnabled: bucketKey.value === 'Enable'
        },
        objectLock: objectLock.value === 'Enable'
    }

    try {
        // TODO: Uncomment when backend is ready
        const response = await apiClient.post('/api/v1/buckets/create-bucket', bucketData)
        if (response.data.success) {
            toastStore.addToast(`Successfully created bucket "${bucketName.value}"`, 'success')
            router.push('/s3/buckets')
        }

        // Temporary: Add to local store for demo purposes
        // s3Store.addBucket({
        //     name: bucketName.value,
        //     region: region.value,
        //     creationDate: new Date().toLocaleString(),
        //     access: blockPublicAccess.value ? 'Bucket and objects not public' : 'Objects can be public'
        // })

        // console.log('Bucket data prepared for API:', bucketData)
        toastStore.addToast(`Successfully created bucket "${bucketName.value}"`, 'success')
        router.push('/s3/buckets')
    } catch (error: any) {
        console.error('Error creating bucket:', error)
        toastStore.addToast(error.response?.data?.message || 'Failed to create bucket', 'error')
    }
}

const handleBucketSelection = (selectedBucketName: string) => {
    toastStore.addToast(`Settings copied from ${selectedBucketName}`, 'success')
}
</script>

<template>
    <div class="min-h-screen bg-white pb-24 font-sans">
        <ChooseBucketModal :is-open="showChooseBucketModal" @close="showChooseBucketModal = false"
            @select="handleBucketSelection" />

        <!-- Breadcrumbs bar -->
        <div class="h-10 border-b border-gray-200 bg-white flex items-center px-4 text-[11px] gap-2 text-gray-400">
            <span class="hover:underline cursor-pointer">Amazon S3</span>
            <span>></span>
            <span class="hover:underline cursor-pointer">Buckets</span>
            <span>></span>
            <span class="text-gray-900 font-medium">Create bucket</span>
        </div>

        <div class="max-w-5xl mx-auto pt-8 px-4">
            <div class="mb-8">
                <h1 class="text-2xl font-bold text-gray-900 mb-1">Create bucket <span
                        class="text-[10px] text-[var(--aws-blue)] hover:underline cursor-pointer uppercase font-bold tracking-tight">Info</span>
                </h1>
                <p class="text-xs text-gray-600">Buckets are containers for data stored in S3.</p>
            </div>

            <!-- General Configuration -->
            <section class="border border-gray-200 rounded-sm mb-8 overflow-hidden">
                <div class="bg-gray-50/50 px-6 py-3 border-b border-gray-200">
                    <h2 class="text-lg font-bold text-gray-900">General configuration</h2>
                </div>
                <div class="p-8 space-y-8">
                    <div>
                        <label class="block text-xs font-bold text-gray-900 mb-2">AWS Region</label>
                        <p class="text-xs text-gray-600 mb-2">{{ region }}</p>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-gray-900 mb-4">Bucket type <span
                                class="text-[var(--aws-blue)] hover:underline cursor-pointer ml-1">Info</span></label>
                        <div class="grid grid-cols-2 gap-4">
                            <label class="border-2 p-4 cursor-pointer transition-all"
                                :class="bucketType === 'General purpose' ? 'border-[var(--aws-blue)] bg-blue-50/10' : 'border-gray-200 hover:border-gray-300'">
                                <input type="radio" v-model="bucketType" value="General purpose" class="hidden">
                                <div class="flex gap-3">
                                    <div class="w-4 h-4 rounded-full border-2 mt-1 flex items-center justify-center"
                                        :class="bucketType === 'General purpose' ? 'border-[var(--aws-blue)]' : 'border-gray-300'">
                                        <div v-if="bucketType === 'General purpose'"
                                            class="w-2 h-2 bg-[var(--aws-blue)] rounded-full"></div>
                                    </div>
                                    <div>
                                        <p class="text-xs font-bold text-gray-900">General purpose</p>
                                        <p class="text-[10px] text-gray-500 mt-1 leading-relaxed">Recommended for most
                                            use cases and access patterns.</p>
                                    </div>
                                </div>
                            </label>
                            <label class="border-2 p-4 cursor-pointer transition-all opacity-50 grayscale"
                                :class="bucketType === 'Directory' ? 'border-[var(--aws-blue)] bg-blue-50/10' : 'border-gray-200'">
                                <input type="radio" v-model="bucketType" value="Directory" disabled class="hidden">
                                <div class="flex gap-3">
                                    <div
                                        class="w-4 h-4 rounded-full border-2 mt-1 flex items-center justify-center border-gray-300">
                                    </div>
                                    <div>
                                        <p class="text-xs font-bold text-gray-900">Directory</p>
                                        <p class="text-[10px] text-gray-500 mt-1 leading-relaxed">Recommended for
                                            low-latency use cases.</p>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-gray-900 mb-1">Bucket name <span
                                class="text-[var(--aws-blue)] hover:underline cursor-pointer ml-1">Info</span></label>
                        <p class="text-[10px] text-gray-500 mb-3">Bucket names must be unique within the global
                            namespace. Bucket names must also begin and end with a letter or number. Valid characters
                            are a-z, 0-9, periods (.), and hyphens (-).</p>
                        <input v-model="bucketName" type="text" placeholder="amzn-s3-demo-bucket"
                            class="w-full max-w-2xl border border-gray-400 p-2 text-xs focus:ring-1 focus:ring-[var(--aws-blue)] outline-none rounded-sm">
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-gray-900 mb-1">Copy settings from existing bucket -
                            optional</label>
                        <p class="text-[10px] text-gray-500 mb-2">Only the bucket settings in the following
                            configuration are copied.</p>
                        <button @click="showChooseBucketModal = true"
                            class="px-3 py-1 text-xs font-bold border border-[var(--aws-blue)] text-[var(--aws-blue)] hover:bg-blue-50/10 transition-colors rounded-sm bg-white">
                            Choose bucket
                        </button>
                        <!-- <p class="text-[10px] text-gray-500 mt-1">Format: s3://bucket/prefix</p> -->
                    </div>
                </div>
            </section>

            <!-- Object Ownership -->
            <section class="border border-gray-200 rounded-sm mb-8 overflow-hidden">
                <div class="bg-gray-50/50 px-6 py-3 border-b border-gray-200">
                    <h2 class="text-lg font-bold text-gray-900">Object Ownership <span
                            class="text-[10px] text-[var(--aws-blue)] hover:underline cursor-pointer uppercase font-bold tracking-tight ml-2">Info</span>
                    </h2>
                </div>
                <div class="p-8">
                    <p class="text-xs text-gray-600 mb-6 leading-relaxed">Control ownership of objects written to this
                        bucket from other AWS accounts and the use of access control lists (ACLs).</p>
                    <div class="grid grid-cols-2 gap-4">
                        <label class="border-2 p-4 cursor-pointer transition-all"
                            :class="objectOwnership === 'ACLs disabled' ? 'border-[var(--aws-blue)] bg-blue-50/10' : 'border-gray-200 hover:border-gray-300'">
                            <input type="radio" v-model="objectOwnership" value="ACLs disabled" class="hidden">
                            <div class="flex gap-3">
                                <div class="w-4 h-4 rounded-full border-2 mt-1 flex items-center justify-center"
                                    :class="objectOwnership === 'ACLs disabled' ? 'border-[var(--aws-blue)]' : 'border-gray-300'">
                                    <div v-if="objectOwnership === 'ACLs disabled'"
                                        class="w-2 h-2 bg-[var(--aws-blue)] rounded-full"></div>
                                </div>
                                <div>
                                    <p class="text-xs font-bold text-gray-900">ACLs disabled (recommended)</p>
                                    <p class="text-[10px] text-gray-500 mt-1 leading-relaxed">All objects in this bucket
                                        are owned by this account.</p>
                                </div>
                            </div>
                        </label>
                        <label class="border-2 p-4 cursor-pointer transition-all"
                            :class="objectOwnership === 'ACLs enabled' ? 'border-[var(--aws-blue)] bg-blue-50/10' : 'border-gray-200 hover:border-gray-300'">
                            <input type="radio" v-model="objectOwnership" value="ACLs enabled" class="hidden">
                            <div class="flex gap-3">
                                <div class="w-4 h-4 rounded-full border-2 mt-1 flex items-center justify-center"
                                    :class="objectOwnership === 'ACLs enabled' ? 'border-[var(--aws-blue)]' : 'border-gray-300'">
                                    <div v-if="objectOwnership === 'ACLs enabled'"
                                        class="w-2 h-2 bg-[var(--aws-blue)] rounded-full"></div>
                                </div>
                                <div>
                                    <p class="text-xs font-bold text-gray-900">ACLs enabled</p>
                                    <p class="text-[10px] text-gray-500 mt-1 leading-relaxed">Objects in this bucket can
                                        be owned by other AWS accounts.</p>
                                </div>
                            </div>
                        </label>
                    </div>
                </div>
            </section>

            <!-- Block Public Access -->
            <section class="border border-gray-200 rounded-sm mb-8 overflow-hidden">
                <div class="bg-gray-50/50 px-6 py-3 border-b border-gray-200">
                    <h2 class="text-lg font-bold text-gray-900">Block Public Access settings for this bucket</h2>
                </div>
                <div class="p-8">
                    <p class="text-xs text-gray-600 mb-6 leading-relaxed">Public access is granted to buckets and
                        objects through access control lists (ACLs), bucket policies, or all. AWS recommends that you
                        turn on Block all public access.</p>

                    <div class="border border-gray-200 p-6 bg-white space-y-6">
                        <!-- Block All Section -->
                        <label
                            class="flex items-start gap-4 p-4 border rounded-sm bg-gray-50 cursor-pointer group hover:border-[var(--aws-blue)] transition-colors"
                            :class="blockPublicAccess ? 'bg-blue-50/10 border-[var(--aws-blue)]' : 'bg-gray-50 border-gray-200'">
                            <input type="checkbox" v-model="blockPublicAccess"
                                class="mt-1 w-4 h-4 text-[var(--aws-blue)] rounded-sm border-gray-400 focus:ring-0">
                            <div>
                                <p class="text-sm font-bold text-gray-900">Block all public access</p>
                                <p class="text-[11px] text-gray-500 leading-tight">Recommended. Turning this on will
                                    override any other bucket or access point policies that grant public access.</p>
                            </div>
                        </label>

                        <!-- Individual Bucket/AP Settings -->
                        <div class="border-t pt-6">
                            <div class="flex items-center justify-between mb-4">
                                <div class="flex items-center gap-2">
                                    <h3 class="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Individual
                                        settings</h3>
                                    <span
                                        class="text-[10px] text-[var(--aws-blue)] hover:underline cursor-pointer uppercase font-bold tracking-tight">Info</span>
                                </div>
                                <span v-if="blockPublicAccess"
                                    class="text-[10px] text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-sm">
                                    Locked by "Block all"
                                </span>
                            </div>

                            <div class="space-y-4">
                                <!-- Individual Access Points Placeholder -->
                                <div class="p-4 border border-dashed border-gray-300 rounded-sm"
                                    :class="blockPublicAccess ? 'bg-gray-100 opacity-60' : 'bg-white'">
                                    <h4 class="text-[10px] font-bold text-gray-500 uppercase mb-2">Access Points</h4>
                                    <p class="text-[11px] text-gray-500 italic">
                                        No access points are available during bucket creation. You can create access
                                        points and configure individual block settings after the bucket is created.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Bucket Versioning -->
            <section class="border border-gray-200 rounded-sm mb-8 overflow-hidden">
                <div class="bg-gray-50/50 px-6 py-3 border-b border-gray-200">
                    <h2 class="text-lg font-bold text-gray-900">Bucket Versioning</h2>
                </div>
                <div class="p-8">
                    <p class="text-xs text-gray-600 mb-6 leading-relaxed">Versioning is a means of keeping multiple
                        variants of an object in the same bucket. You can use versioning to preserve, retrieve, and
                        restore every version of every object stored in your Amazon S3 bucket. With versioning, you can
                        easily recover from both unintended user actions and application failures. <span
                            class="text-[var(--aws-blue)] hover:underline cursor-pointer">Learn more</span></p>

                    <div class="space-y-4">
                        <label class="block text-xs font-bold text-gray-900 mb-2">Bucket Versioning</label>
                        <div class="flex items-center gap-3">
                            <input type="radio" v-model="bucketVersioning" value="Disable" id="versioning-disable"
                                class="w-4 h-4 text-[var(--aws-blue)] focus:ring-[var(--aws-blue)] border-gray-300">
                            <label for="versioning-disable" class="text-xs text-gray-900">Disable</label>
                        </div>
                        <div class="flex items-center gap-3">
                            <input type="radio" v-model="bucketVersioning" value="Enable" id="versioning-enable"
                                class="w-4 h-4 text-[var(--aws-blue)] focus:ring-[var(--aws-blue)] border-gray-300">
                            <label for="versioning-enable" class="text-xs text-gray-900">Enable</label>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Tags -->
            <section class="border border-gray-200 rounded-sm mb-8 overflow-hidden">
                <div class="bg-gray-50/50 px-6 py-3 border-b border-gray-200">
                    <h2 class="text-lg font-bold text-gray-900">Tags - optional</h2>
                </div>
                <div class="p-8">
                    <p class="text-xs text-gray-600 mb-4">You can use bucket tags to analyze, manage and specify
                        permissions for a bucket. <span
                            class="text-[var(--aws-blue)] hover:underline cursor-pointer">Learn more</span></p>

                    <div
                        class="border border-[var(--aws-blue)] bg-blue-50/10 p-4 rounded-sm mb-6 flex items-start gap-3">
                        <svg class="w-5 h-5 text-[var(--aws-blue)] shrink-0 mt-0.5" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p class="text-xs text-gray-600 leading-relaxed">
                            You can use s3:ListTagsForResource, s3:TagResource, and s3:UntagResource APIs to manage tags
                            on S3 general purpose buckets for access control in addition to cost allocation and resource
                            organization. To ensure a seamless transition, please provide permissions to
                            s3:ListTagsForResource, s3:TagResource, and s3:UntagResource actions. <span
                                class="text-[var(--aws-blue)] hover:underline cursor-pointer">Learn more</span>
                        </p>
                    </div>

                    <p class="text-xs text-gray-600 mb-4">No tags associated with this bucket.</p>

                    <button
                        class="px-3 py-1 text-xs font-bold border border-gray-300 hover:bg-gray-50 transition-colors rounded-sm bg-white">
                        Add new tag
                    </button>
                    <p class="text-[10px] text-gray-500 mt-2">You can add up to 50 tags.</p>
                </div>
            </section>

            <!-- Default Encryption -->
            <section class="border border-gray-200 rounded-sm mb-8 overflow-hidden">
                <div class="bg-gray-50/50 px-6 py-3 border-b border-gray-200">
                    <h2 class="text-lg font-bold text-gray-900">Default encryption <span
                            class="text-[10px] text-[var(--aws-blue)] hover:underline cursor-pointer uppercase font-bold tracking-tight ml-2">Info</span>
                    </h2>
                </div>
                <div class="p-8">
                    <p class="text-xs text-gray-600 mb-6">Server-side encryption is automatically applied to new objects
                        stored in this bucket.</p>

                    <label class="block text-xs font-bold text-gray-900 mb-2">Encryption type <span
                            class="text-[var(--aws-blue)] hover:underline cursor-pointer ml-1 font-normal">Info</span></label>
                    <p class="text-[10px] text-gray-500 mb-4">Secure your objects with two separate layers of
                        encryption. For details on pricing, see DSSE-KMS pricing on the Storage tab of the <span
                            class="text-[var(--aws-blue)] hover:underline cursor-pointer">Amazon S3 pricing page</span>.
                    </p>

                    <div class="space-y-4 mb-8">
                        <div class="flex items-center gap-3">
                            <input type="radio" v-model="encryptionType" value="SSE-S3" id="enc-s3"
                                class="w-4 h-4 text-[var(--aws-blue)] focus:ring-[var(--aws-blue)] border-gray-300">
                            <label for="enc-s3" class="text-xs text-gray-900">Server-side encryption with Amazon S3
                                managed keys (SSE-S3)</label>
                        </div>
                        <div class="flex items-center gap-3">
                            <input type="radio" v-model="encryptionType" value="SSE-KMS" id="enc-kms"
                                class="w-4 h-4 text-[var(--aws-blue)] focus:ring-[var(--aws-blue)] border-gray-300">
                            <label for="enc-kms" class="text-xs text-gray-900">Server-side encryption with AWS Key
                                Management Service keys (SSE-KMS)</label>
                        </div>
                        <div class="flex items-center gap-3">
                            <input type="radio" v-model="encryptionType" value="DSSE-KMS" id="enc-dsse"
                                class="w-4 h-4 text-[var(--aws-blue)] focus:ring-[var(--aws-blue)] border-gray-300">
                            <label for="enc-dsse" class="text-xs text-gray-900">Dual-layer server-side encryption with
                                AWS Key Management Service keys (DSSE-KMS)</label>
                        </div>
                    </div>

                    <label class="block text-xs font-bold text-gray-900 mb-2">Bucket Key</label>
                    <p class="text-[10px] text-gray-500 mb-4">Using an S3 Bucket Key for SSE-KMS reduces encryption
                        costs by lowering calls to AWS KMS. S3 Bucket Keys aren't supported for DSSE-KMS. <span
                            class="text-[var(--aws-blue)] hover:underline cursor-pointer">Learn more</span></p>

                    <div class="space-y-4">
                        <div class="flex items-center gap-3">
                            <input type="radio" v-model="bucketKey" value="Disable" id="key-disable"
                                class="w-4 h-4 text-[var(--aws-blue)] focus:ring-[var(--aws-blue)] border-gray-300">
                            <label for="key-disable" class="text-xs text-gray-900">Disable</label>
                        </div>
                        <div class="flex items-center gap-3">
                            <input type="radio" v-model="bucketKey" value="Enable" id="key-enable"
                                class="w-4 h-4 text-[var(--aws-blue)] focus:ring-[var(--aws-blue)] border-gray-300">
                            <label for="key-enable" class="text-xs text-gray-900">Enable</label>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Advanced Settings -->
            <section class="border border-gray-200 rounded-sm mb-8 overflow-hidden">
                <button @click="showAdvanced = !showAdvanced"
                    class="w-full bg-white px-6 py-3 flex items-center gap-2 hover:bg-gray-50 focus:outline-none focus:bg-gray-50">
                    <svg class="w-4 h-4 text-gray-600 transform transition-transform duration-200"
                        :class="showAdvanced ? 'rotate-90' : ''" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clip-rule="evenodd" />
                    </svg>
                    <h2 class="text-lg font-bold text-gray-900">Advanced settings</h2>
                </button>
                <div v-show="showAdvanced" class="p-8 border-t border-gray-200">
                    <h3 class="text-sm font-bold text-gray-900 mb-2">Object Lock</h3>
                    <p class="text-xs text-gray-600 mb-4 leading-relaxed">
                        Store objects using a write-once-read-many (WORM) model to help you prevent objects from being
                        deleted or overwritten for a fixed amount of time or indefinitely. Object Lock works only in
                        versioned buckets. <span class="text-[var(--aws-blue)] hover:underline cursor-pointer">Learn
                            more</span>
                    </p>

                    <div class="space-y-4 mb-6">
                        <div class="flex items-start gap-3">
                            <input type="radio" v-model="objectLock" value="Disable" id="lock-disable"
                                class="mt-0.5 w-4 h-4 text-[var(--aws-blue)] focus:ring-[var(--aws-blue)] border-gray-300">
                            <label for="lock-disable" class="text-xs text-gray-900 font-bold">Disable</label>
                        </div>
                        <div class="flex items-start gap-3">
                            <input type="radio" v-model="objectLock" value="Enable" id="lock-enable"
                                class="mt-0.5 w-4 h-4 text-[var(--aws-blue)] focus:ring-[var(--aws-blue)] border-gray-300">
                            <div>
                                <label for="lock-enable" class="text-xs text-gray-900 font-bold">Enable</label>
                                <p class="text-[10px] text-gray-500 mt-1 leading-relaxed">
                                    Permanently allows objects in this bucket to be locked. Additional Object Lock
                                    configuration is required in bucket details after bucket creation to protect objects
                                    in this bucket from being deleted or overwritten.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="border border-[var(--aws-blue)] bg-blue-50/10 p-4 rounded-sm flex items-start gap-3">
                        <svg class="w-5 h-5 text-[var(--aws-blue)] shrink-0 mt-0.5" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p class="text-xs text-gray-600 leading-relaxed">
                            Object Lock works only in versioned buckets. Enabling Object Lock automatically enables
                            Versioning.
                        </p>
                    </div>
                </div>
            </section>

            <!-- Footer Info Note -->
            <div class="border border-[var(--aws-blue)] bg-blue-50/10 p-4 rounded-sm flex items-start gap-3 mb-24">
                <svg class="w-5 h-5 text-[var(--aws-blue)] shrink-0 mt-0.5" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-xs text-gray-600 leading-relaxed">
                    After creating the bucket, you can upload files and folders to the bucket, and configure additional
                    bucket settings.
                </p>
            </div>

            <!-- Footer actions -->
            <div
                class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-3 z-[100] px-16 shadow-2xl">
                <button @click="router.back()"
                    class="px-6 py-2 text-xs font-bold border border-gray-300 hover:bg-gray-50 transition-colors">Cancel</button>
                <button @click="handleCreateBucket"
                    class="px-8 py-2 text-xs font-bold bg-[var(--aws-orange)] text-white hover:opacity-90 transition-opacity rounded-sm">Create
                    bucket</button>
            </div>
        </div>
    </div>
</template>
