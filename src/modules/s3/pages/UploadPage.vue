<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToastStore } from '@/shared/store/toastStore'

const route = useRoute()
const router = useRouter()
const toastStore = useToastStore()

const bucketName = computed(() => route.params.bucketName as string)

const expandedSections = ref({
    destination: true,
    permissions: true,
    properties: true // Open by default for now to show content
})

const storageClass = ref('Standard')
const encryptionKeyType = ref('None') // 'None' or 'Specify'
const checksumFunction = ref('CRC64NVME (recommended)')

const storageClasses = [
    { id: 'Standard', name: 'Standard', designedFor: 'Frequently accessed data (more than once a month) with milliseconds access', zones: '≥ 3', minDuration: '-', minSize: '-', fees: '-' },
    { id: 'Intelligent-Tiering', name: 'Intelligent-Tiering', designedFor: 'Data with changing or unknown access patterns', zones: '≥ 3', minDuration: '-', minSize: '128 KB', fees: 'Per-object fees apply for objects >= 128 KB' },
    { id: 'Standard-IA', name: 'Standard-IA', designedFor: 'Infrequently accessed data (once a month) with milliseconds access', zones: '≥ 3', minDuration: '30 days', minSize: '128 KB', fees: 'Per-GB fees apply' },
    { id: 'One Zone-IA', name: 'One Zone-IA', designedFor: 'Recreatable, infrequently accessed data (once a month) with milliseconds access', zones: '1', minDuration: '30 days', minSize: '128 KB', fees: 'Per-GB fees apply' },
    { id: 'Glacier Instant Retrieval', name: 'Glacier Instant Retrieval', designedFor: 'Long-lived archive data accessed once a quarter with instant retrieval in milliseconds', zones: '≥ 3', minDuration: '90 days', minSize: '128 KB', fees: 'Per-GB fees apply' },
    { id: 'Glacier Flexible Retrieval', name: 'Glacier Flexible Retrieval', designedFor: 'Long-lived archive data accessed once a year with retrieval of minutes to hours', zones: '≥ 3', minDuration: '90 days', minSize: '-', fees: 'Per-GB fees apply' },
    { id: 'Glacier Deep Archive', name: 'Glacier Deep Archive', designedFor: 'Long-lived archive data accessed less than once a year with retrieval of hours', zones: '≥ 3', minDuration: '180 days', minSize: '-', fees: 'Per-GB fees apply' },
    { id: 'Reduced redundancy', name: 'Reduced redundancy', designedFor: 'Noncritical, frequently accessed data with milliseconds access (not recommended as S3 Standard is more cost effective)', zones: '≥ 3', minDuration: '-', minSize: '-', fees: 'Per-GB fees apply' },
]

const toggleSection = (section: 'destination' | 'permissions' | 'properties') => {
    expandedSections.value[section] = !expandedSections.value[section]
}

const handleUpload = () => {
    toastStore.addToast('Upload started', 'success')
    router.push(`/s3/buckets/${bucketName.value}?tab=objects`)
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
            <span class="text-gray-900 font-bold">Upload</span>
        </div>

        <div class="max-w-7xl mx-auto p-8 px-10">
            <div class="mb-6">
                <h1 class="text-2xl font-bold text-gray-900 mb-1">Upload <span
                        class="text-[10px] text-[var(--aws-blue)] hover:underline cursor-pointer uppercase font-bold tracking-tight align-middle">Info</span>
                </h1>
                <p class="text-xs text-gray-600">Add the files and folders you want to upload to S3. To upload a file
                    larger than 160GB, use the AWS CLI, AWS SDKs or Amazon S3 REST API. <span
                        class="text-[var(--aws-blue)] hover:underline cursor-pointer">Learn more ↗</span></p>
            </div>

            <!-- Drag and Drop Zone -->
            <div
                class="border-2 border-dashed border-gray-300 rounded-sm p-8 flex flex-col items-center justify-center bg-gray-50 mb-6">
                <p class="text-sm text-gray-600 font-bold mb-1">Drag and drop files and folders you want to upload here,
                    or choose Add files or Add folder.</p>
            </div>

            <!-- Files and Folders Section -->
            <section class="border border-gray-200 rounded-sm mb-6 overflow-hidden">
                <div class="bg-white p-4 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h2 class="text-lg font-bold text-gray-900">Files and folders (0)</h2>
                        <p class="text-xs text-gray-600">All files and folders in this table will be uploaded.</p>
                    </div>
                    <div class="flex gap-2">
                        <button
                            class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm hover:bg-gray-50 text-gray-400 cursor-not-allowed">Remove</button>
                        <button
                            class="px-3 py-1 text-xs font-bold border border-[var(--aws-blue)] text-[var(--aws-blue)] hover:bg-blue-50/10 rounded-sm">Add
                            files</button>
                        <button
                            class="px-3 py-1 text-xs font-bold border border-[var(--aws-blue)] text-[var(--aws-blue)] hover:bg-blue-50/10 rounded-sm">Add
                            folder</button>
                    </div>
                </div>
                <div class="p-4 bg-white">
                    <div class="flex justify-between items-center border-b border-gray-200 pb-2 mb-2">
                        <div class="relative w-96">
                            <svg class="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-500" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input type="text" placeholder="Find by name"
                                class="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-400 rounded-sm focus:ring-1 focus:ring-[var(--aws-blue)] outline-none">
                        </div>
                        <div class="flex items-center gap-4 text-xs text-gray-400">
                            <div class="flex items-center gap-1">
                                <span class="hover:text-gray-900 cursor-pointer">⟨</span>
                                <span class="text-gray-900 font-bold">1</span>
                                <span class="hover:text-gray-900 cursor-pointer">⟩</span>
                            </div>
                            <svg class="w-4 h-4 hover:text-gray-900 cursor-pointer" fill="currentColor"
                                viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0L7.43 7.5l-4.73.61c-1.61.21-2.26 2.21-1.09 3.32l3.43 3.25-1.12 4.7c-.38 1.58 1.28 2.78 2.68 2.04L10 19.16l4.4 2.26c1.4.72 3.06-.48 2.68-2.04l-1.12-4.7 3.43-3.25c1.17-1.11.52-3.11-1.09-3.32l-4.73-.61-1.08-4.33z"
                                    clip-rule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    <!-- Table Header -->
                    <div class="grid grid-cols-12 gap-4 text-xs font-bold text-gray-600 border-b border-gray-200 pb-2">
                        <div class="col-span-1"><input type="checkbox" class="w-3.5 h-3.5 rounded border-gray-300">
                        </div>
                        <div class="col-span-5">Name</div>
                        <div class="col-span-2">Folder</div>
                        <div class="col-span-2">Type</div>
                        <div class="col-span-2 text-right">Size</div>
                    </div>
                    <!-- Empty Table Body -->
                    <div class="py-8 text-center text-xs text-gray-600">
                        <p class="font-bold">No files or folders</p>
                        <p class="text-gray-500">You have not chosen any files or folders to upload.</p>
                    </div>
                </div>
            </section>

            <!-- Destination -->
            <section class="border border-gray-200 rounded-sm mb-6 overflow-hidden">
                <div class="bg-gray-50/50 px-6 py-3 border-b border-gray-200">
                    <h2 class="text-lg font-bold text-gray-900">Destination <span
                            class="text-[10px] text-[var(--aws-blue)] hover:underline cursor-pointer uppercase font-bold tracking-tight">Info</span>
                    </h2>
                </div>
                <div class="p-6 bg-white">
                    <p class="text-xs font-bold text-gray-900 mb-1">Destination</p>
                    <p class="text-xs text-[var(--aws-blue)] mb-4">s3://{{ bucketName }} <svg class="w-3 h-3 inline"
                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg></p>

                    <button @click="toggleSection('destination')"
                        class="flex items-center gap-1 text-sm font-bold text-gray-900 focus:outline-none">
                        <svg class="w-3 h-3 text-gray-600 transform transition-transform duration-200"
                            :class="expandedSections.destination ? 'rotate-90' : ''" fill="currentColor"
                            viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clip-rule="evenodd" />
                        </svg>
                        Destination details
                    </button>
                    <div v-show="expandedSections.destination" class="mt-2 ml-4">
                        <p class="text-xs text-gray-500">Bucket settings that impact new objects stored in the specified
                            destination.</p>
                    </div>
                </div>
            </section>

            <!-- Permissions -->
            <section class="border border-gray-200 rounded-sm mb-6 overflow-hidden">
                <button @click="toggleSection('permissions')"
                    class="w-full bg-white px-6 py-3 flex items-center gap-2 hover:bg-gray-50 focus:outline-none border-b border-gray-200">
                    <svg class="w-3 h-3 text-gray-600 transform transition-transform duration-200"
                        :class="expandedSections.permissions ? 'rotate-90' : ''" fill="currentColor"
                        viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clip-rule="evenodd" />
                    </svg>
                    <h2 class="text-lg font-bold text-gray-900">Permissions</h2>
                </button>
                <div v-show="expandedSections.permissions" class="p-6 bg-white">
                    <p class="text-xs text-gray-600 mb-4">Grant public access and access to other AWS accounts.</p>

                    <div class="border border-[var(--aws-blue)] bg-blue-50/10 p-4 rounded-sm flex items-start gap-3">
                        <svg class="w-5 h-5 text-[var(--aws-blue)] shrink-0 mt-0.5" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p class="text-xs text-gray-600 leading-relaxed">
                            This bucket has the <a href="#" class="text-[var(--aws-blue)] underline">bucket owner
                                enforced</a> setting applied for Object Ownership. Use bucket policies to control
                            access. <a href="#" class="text-[var(--aws-blue)] underline">Learn more <svg
                                    class="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg></a>
                        </p>
                    </div>
                </div>
            </section>

            <!-- Properties -->
            <section class="border border-gray-200 rounded-sm mb-6 overflow-hidden">
                <button @click="toggleSection('properties')"
                    class="w-full bg-white px-6 py-3 flex items-center gap-2 hover:bg-gray-50 focus:outline-none border-b border-gray-200">
                    <svg class="w-3 h-3 text-gray-600 transform transition-transform duration-200"
                        :class="expandedSections.properties ? 'rotate-90' : ''" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clip-rule="evenodd" />
                    </svg>
                    <h2 class="text-lg font-bold text-gray-900">Properties</h2>
                </button>
                <div v-show="expandedSections.properties" class="p-6 bg-white space-y-8">
                    <p class="text-xs text-gray-600 -mt-2">Specify storage class, encryption settings, tags, and more.
                    </p>

                    <!-- Storage Class -->
                    <div class="border border-gray-200 rounded-sm p-4">
                        <h3 class="text-sm font-bold text-gray-900 mb-1 flex gap-1">Storage class <span
                                class="text-[10px] text-[var(--aws-blue)] hover:underline cursor-pointer uppercase font-bold tracking-tight align-middle">Info</span>
                        </h3>
                        <p class="text-xs text-gray-600 mb-4">Amazon S3 offers a range of storage classes designed for
                            different use cases. <span
                                class="text-[var(--aws-blue)] hover:underline cursor-pointer">Learn more ↗</span> or see
                            <span class="text-[var(--aws-blue)] hover:underline cursor-pointer">Amazon S3 pricing
                                ↗</span></p>

                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr class="text-[10px] uppercase font-bold text-gray-500 border-b border-gray-200">
                                        <th class="p-2 w-8"></th>
                                        <th class="p-2 border-r border-gray-200">Storage class</th>
                                        <th class="p-2 border-r border-gray-200 w-1/3">Designed for</th>
                                        <th class="p-2 border-r border-gray-200">Bucket type</th>
                                        <th class="p-2 border-r border-gray-200">Availability Zones</th>
                                        <th class="p-2 border-r border-gray-200">Min storage duration</th>
                                        <th class="p-2 border-r border-gray-200">Min billable object size</th>
                                        <th class="p-2 border-r border-gray-200">Monitoring and auto-tiering fees</th>
                                        <th class="p-2">Retrieval fees</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="cls in storageClasses" :key="cls.id"
                                        class="border-b border-gray-100 last:border-0 hover:bg-gray-50 text-xs cursor-pointer group"
                                        :class="storageClass === cls.id ? 'bg-blue-50/20' : ''"
                                        @click="storageClass = cls.id">
                                        <td class="p-3 text-center vertical-top">
                                            <input type="radio" :checked="storageClass === cls.id"
                                                class="w-4 h-4 text-[var(--aws-blue)] focus:ring-[var(--aws-blue)] border-gray-300 shadow-sm mt-0.5">
                                        </td>
                                        <td class="p-3 font-bold text-gray-900 align-top">{{ cls.name }}</td>
                                        <td class="p-3 text-gray-600 align-top">{{ cls.designedFor }}</td>
                                        <td class="p-3 text-gray-600 align-top">General purpose</td>
                                        <td class="p-3 text-gray-600 align-top">{{ cls.zones }}</td>
                                        <td class="p-3 text-gray-600 align-top">{{ cls.minDuration }}</td>
                                        <td class="p-3 text-gray-600 align-top">{{ cls.minSize }}</td>
                                        <td class="p-3 text-gray-600 align-top">{{ cls.fees }}</td>
                                        <td class="p-3 text-gray-600 align-top">-</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Server-side encryption -->
                    <div class="border border-gray-200 rounded-sm p-4">
                        <h3 class="text-sm font-bold text-gray-900 mb-1 flex gap-1">Server-side encryption <span
                                class="text-[10px] text-[var(--aws-blue)] hover:underline cursor-pointer uppercase font-bold tracking-tight align-middle">Info</span>
                        </h3>
                        <p class="text-xs text-gray-600 mb-4">Server-side encryption protects data at rest.</p>

                        <div class="space-y-3">
                            <h4 class="text-xs font-bold text-gray-900">Server-side encryption</h4>

                            <label class="flex items-start gap-2 cursor-pointer">
                                <input type="radio" value="None" v-model="encryptionKeyType"
                                    class="w-4 h-4 mt-0.5 text-[var(--aws-blue)] focus:ring-[var(--aws-blue)] border-gray-300">
                                <div>
                                    <span class="text-sm font-medium text-gray-900">Don't specify an encryption
                                        key</span>
                                    <p class="text-xs text-gray-600">The bucket settings for default encryption are used
                                        to encrypt objects when storing them in Amazon S3.</p>
                                </div>
                            </label>

                            <label class="flex items-start gap-2 cursor-pointer">
                                <input type="radio" value="Specify" v-model="encryptionKeyType"
                                    class="w-4 h-4 mt-0.5 text-[var(--aws-blue)] focus:ring-[var(--aws-blue)] border-gray-300">
                                <div>
                                    <span class="text-sm font-medium text-gray-900">Specify an encryption key</span>
                                    <p class="text-xs text-gray-600">The specified encryption key is used to encrypt
                                        objects before storing them in Amazon S3.</p>
                                </div>
                            </label>

                            <div v-if="encryptionKeyType === 'Specify'"
                                class="mt-4 border border-yellow-400 bg-yellow-50 rounded-sm p-3 flex gap-2">
                                <svg class="w-5 h-5 text-yellow-600 shrink-0" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <p class="text-xs text-gray-900">If your bucket policy requires objects to be encrypted
                                    with a specific encryption key, you must specify the same encryption key when you
                                    upload objects. Otherwise, uploads will fail.</p>
                            </div>
                        </div>
                    </div>

                    <!-- Checksums -->
                    <div class="border border-gray-200 rounded-sm p-4">
                        <h3 class="text-sm font-bold text-gray-900 mb-1">Checksums</h3>
                        <p class="text-xs text-gray-600 mb-3">Checksums are used for data integrity verification of new
                            objects. <span class="text-[var(--aws-blue)] hover:underline cursor-pointer">Learn more
                                ↗</span></p>

                        <label class="block mb-1 text-xs font-bold text-gray-900">Checksum function</label>
                        <p class="text-xs text-gray-600 mb-2">Checksum functions are used to calculate the checksum
                            value. For objects smaller than 16 MB, only the full object checksum type is supported, for
                            all checksum algorithms.</p>
                        <select v-model="checksumFunction"
                            class="w-full max-w-xl border border-gray-400 rounded-sm px-3 py-1.5 text-sm focus:ring-1 focus:ring-[var(--aws-blue)] outline-none bg-white">
                            <option>CRC64NVME (recommended)</option>
                            <option>CRC32</option>
                            <option>CRC32C</option>
                            <option>SHA-1</option>
                            <option>SHA-256</option>
                        </select>

                        <div class="mt-4 border border-[var(--aws-blue)] bg-blue-50/10 rounded-sm p-3 flex gap-2">
                            <svg class="w-5 h-5 text-[var(--aws-blue)] shrink-0" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p class="text-xs text-gray-900">You can provide a precalculated value when uploading a
                                single object and use the full object checksum type. To use precalculated values with
                                multiple objects, use the AWS CLI, AWS SDKs, or Amazon S3 REST API.</p>
                        </div>
                    </div>

                    <!-- Tags -->
                    <div class="border border-gray-200 rounded-sm p-4">
                        <h3 class="text-sm font-bold text-gray-900 mb-1 flex gap-1">Tags - optional</h3>
                        <p class="text-xs text-gray-600 mb-3">You can use object tags to analyze, manage, and specify
                            permissions for objects. <span
                                class="text-[var(--aws-blue)] hover:underline cursor-pointer">Learn more ↗</span></p>
                        <p class="text-xs text-gray-500 italic mb-4">No tags associated with this resource.</p>
                        <button
                            class="px-4 py-1.5 text-xs font-bold border border-gray-300 rounded-sm hover:bg-gray-50">Add
                            tag</button>
                    </div>

                    <!-- Metadata -->
                    <div class="border border-gray-200 rounded-sm p-4">
                        <h3 class="text-sm font-bold text-gray-900 mb-1 flex gap-1">Metadata - optional</h3>
                        <p class="text-xs text-gray-600 mb-3">Metadata is optional information provided as a name-value
                            (key-value) pair. <span class="text-[var(--aws-blue)] hover:underline cursor-pointer">Learn
                                more ↗</span></p>
                        <p class="text-xs text-gray-500 italic mb-4">No metadata associated with this resource.</p>
                        <button
                            class="px-4 py-1.5 text-xs font-bold border border-gray-300 rounded-sm hover:bg-gray-50">Add
                            metadata</button>
                    </div>
                </div>
            </section>

            <!-- Footer -->
            <div
                class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-3 z-[100] px-10 shadow-2xl">
                <button @click="router.back()"
                    class="px-6 py-2 text-xs font-bold border border-gray-300 hover:bg-gray-50 transition-colors text-[var(--aws-blue)]">Cancel</button>
                <button @click="handleUpload"
                    class="px-8 py-2 text-xs font-bold bg-[var(--aws-orange)] text-white hover:opacity-90 transition-opacity rounded-sm">Upload</button>
            </div>
        </div>
    </div>
</template>
