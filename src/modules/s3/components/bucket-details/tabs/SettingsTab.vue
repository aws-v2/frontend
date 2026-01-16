<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import SectionHeader from '../shared/SectionHeader.vue'
import EmptyState from '../shared/EmptyState.vue'

// State for active modal
const activeModal = ref<string | null>(null)

// Versioning State
const versioning = ref('Suspended')
const tempVersioning = ref('Suspended')

const handleSaveVersioning = () => {
    versioning.value = tempVersioning.value
    activeModal.value = null
}

// Encryption State
const encryption = reactive({
    type: 'SSE-S3',
    bucketKey: 'Enable'
})
const tempEncryption = reactive({ ...encryption })

const encryptionTypeLabel = computed(() => {
    return encryption.type === 'SSE-S3'
        ? 'Server-side encryption with Amazon S3 managed keys (SSE-S3)'
        : 'Server-side encryption with AWS Key Management Service keys (SSE-KMS)'
})

const handleSaveEncryption = () => {
    Object.assign(encryption, tempEncryption)
    activeModal.value = null
}

// Object Lock State
const objectLock = ref('Disabled')
const tempObjectLock = ref('Disabled')

const handleSaveObjectLock = () => {
    objectLock.value = tempObjectLock.value
    activeModal.value = null
}

// Replication State
const replicationRules = ref<{ id: number; name: string; priority: number; status: string }[]>([])
const newReplicationRule = reactive({
    name: '',
    priority: 1,
    status: 'Enabled'
})

const handleAddReplicationRule = () => {
    replicationRules.value.push({
        id: Date.now(),
        ...newReplicationRule
    })
    Object.assign(newReplicationRule, { name: '', priority: 1, status: 'Enabled' })
    activeModal.value = null
}

// Lifecycle State
const lifecycleRules = ref<{ id: number; content: string }[]>([])
const currentLifecycleJson = ref('')

const handleSaveLifecycle = () => {
    try {
        JSON.parse(currentLifecycleJson.value)
        lifecycleRules.value.push({ id: Date.now(), content: currentLifecycleJson.value })
        activeModal.value = null
    } catch (e) {
        alert('Invalid JSON format for Lifecycle configuration.')
    }
}

// Intelligent-Tiering State
const tieringConfigs = ref<{ id: number; content: string }[]>([])
const currentTieringJson = ref('')

const handleSaveTiering = () => {
    try {
        JSON.parse(currentTieringJson.value)
        tieringConfigs.value.push({ id: Date.now(), content: currentTieringJson.value })
        activeModal.value = null
    } catch (e) {
        alert('Invalid JSON format for Intelligent-Tiering configuration.')
    }
}

// Requester Pays
const requesterPays = ref('Disabled')
const tempRequesterPays = ref('Disabled')

const handleSaveRequesterPays = () => {
    requesterPays.value = tempRequesterPays.value
    activeModal.value = null
}

// Server Access Logging
const accessLogging = reactive({
    status: 'Disabled',
    targetBucket: '',
    prefix: ''
})
const tempAccessLogging = reactive({ ...accessLogging })

const handleSaveAccessLogging = () => {
    Object.assign(accessLogging, tempAccessLogging)
    activeModal.value = null
}

// Event Notifications
const eventNotifications = ref<{ id: number; name: string; types: string[]; destination: string }[]>([])
const newEventNotification = reactive({
    name: '',
    types: ['All object create events'],
    destination: ''
})

const handleAddEventNotification = () => {
    eventNotifications.value.push({
        id: Date.now(),
        ...newEventNotification
    })
    Object.assign(newEventNotification, { name: '', types: ['All object create events'], destination: '' })
    activeModal.value = null
}

// Tags State
const tags = ref<{ key: string; value: string }[]>([])
const tempTags = ref<{ key: string; value: string }[]>([])

const handleAddTag = () => {
    tempTags.value.push({ key: '', value: '' })
}

const handleRemoveTag = (index: number) => {
    tempTags.value.splice(index, 1)
}

const handleSaveTags = () => {
    tags.value = JSON.parse(JSON.stringify(tempTags.value))
    activeModal.value = null
}
</script>

<template>
    <div class="space-y-12">
        <!-- Header -->
        <div class="bg-gray-50 border-b border-t border-gray-200 p-4 mb-4 flex justify-between items-center">
            <div>
                <h2 class="text-xl font-bold text-gray-900">Settings & Compliance</h2>
                <p class="text-gray-600 text-sm">Configure lifecycle, protection, and billing.</p>
            </div>
            <button
                class="bg-green-600 text-white px-4 py-2 rounded-sm font-bold shadow-sm hover:bg-green-700 flex items-center gap-2 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pay Bill (M-PESA)
            </button>
        </div>

        <!-- Data Protection Section -->
        <div class="space-y-6">
            <h3 class="text-lg font-bold text-gray-800 px-1 border-b border-gray-200 pb-2">Data Protection</h3>

            <!-- Bucket Versioning -->
            <div class="border border-gray-200 rounded-sm bg-white">
                <SectionHeader title="Bucket Versioning" :showEdit="true"
                    @edit="activeModal = 'versioning'; tempVersioning = versioning" />
                <div class="p-4">
                    <p class="text-xs text-gray-600 mb-4">Versioning is a means of keeping multiple variants of an
                        object in the same bucket. <a href="#" class="text-[var(--aws-blue)] underline">Learn more
                            ↗</a></p>
                    <h3 class="text-sm font-bold text-gray-900">Bucket Versioning</h3>
                    <p class="text-xs text-gray-900">{{ versioning }}</p>
                </div>
            </div>

            <!-- Default Encryption -->
            <div class="border border-gray-200 rounded-sm bg-white">
                <SectionHeader title="Default encryption" :showEdit="true"
                    @edit="activeModal = 'encryption'; Object.assign(tempEncryption, encryption)" />
                <div class="p-4">
                    <p class="text-xs text-gray-600 mb-4">Server-side encryption is automatically applied to new objects
                        stored in this bucket.</p>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <h3 class="text-sm font-bold text-gray-900">Encryption type</h3>
                            <p class="text-xs text-gray-900">{{ encryptionTypeLabel }}</p>
                        </div>
                        <div>
                            <h3 class="text-sm font-bold text-gray-900">Bucket Key</h3>
                            <p class="text-xs text-gray-900">{{ encryption.bucketKey }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Object Lock -->
            <div class="border border-gray-200 rounded-sm bg-white">
                <SectionHeader title="Object Lock" :showEdit="true"
                    @edit="activeModal = 'objectLock'; tempObjectLock = objectLock" />
                <div class="p-4">
                    <p class="text-xs text-gray-600 mb-4">Store objects using a write-once-read-many (WORM) model. <a
                            href="#" class="text-[var(--aws-blue)] underline">Learn more ↗</a></p>
                    <h3 class="text-sm font-bold text-gray-900">Object Lock</h3>
                    <p class="text-xs text-gray-900">{{ objectLock }}</p>
                </div>
            </div>

            <!-- Replication Rules -->
            <div class="border border-gray-200 rounded-sm bg-white">
                <SectionHeader title="Replication rules" :showCreate="true" createLabel="Create replication rule"
                    @create="activeModal = 'replication'" />
                <div v-if="replicationRules.length > 0" class="p-4">
                    <div class="overflow-x-auto">
                        <table class="w-full text-xs text-left text-gray-700">
                            <thead class="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th class="px-4 py-2 font-bold">Rule name</th>
                                    <th class="px-4 py-2 font-bold">Priority</th>
                                    <th class="px-4 py-2 font-bold">Status</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200">
                                <tr v-for="rule in replicationRules" :key="rule.id">
                                    <td
                                        class="px-4 py-2 text-[var(--aws-blue)] hover:underline cursor-pointer font-medium">
                                        {{ rule.name }}</td>
                                    <td class="px-4 py-2">{{ rule.priority }}</td>
                                    <td class="px-4 py-2">{{ rule.status }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <EmptyState v-else title="No replication rules"
                    message="Use replication rules to define options you want Amazon S3 to apply during replication." />
            </div>
        </div>

        <!-- Cost Optimization Section -->
        <div class="space-y-6">
            <h3 class="text-lg font-bold text-gray-800 px-1 border-b border-gray-200 pb-2">Cost Optimization</h3>

            <!-- Lifecycle Configuration -->
            <div class="border border-gray-200 rounded-sm bg-white">
                <SectionHeader title="Lifecycle configuration" :showCreate="true" createLabel="Create lifecycle rule"
                    @create="activeModal = 'lifecycle'; currentLifecycleJson = ''" />
                <div class="p-4">
                    <p class="text-xs text-gray-600 mb-4">Manage your objects so that they are stored cost effectively
                        throughout their lifecycle.</p>
                    <div v-if="lifecycleRules.length > 0" class="space-y-4">
                        <div v-for="rule in lifecycleRules" :key="rule.id"
                            class="border rounded-sm bg-gray-50 overflow-hidden">
                            <pre
                                class="p-3 text-[10px] font-mono text-gray-600 bg-gray-50 overflow-x-auto max-h-48"><code>{{ rule.content }}</code></pre>
                        </div>
                    </div>
                    <div v-else class="p-8 text-center text-gray-600 border border-gray-300 rounded-sm bg-gray-50">
                        <p class="text-sm font-bold mb-1">No lifecycle rules</p>
                        <p class="text-xs">There are no lifecycle rules for this bucket.</p>
                    </div>
                </div>
            </div>

            <!-- Intelligent-Tiering -->
            <div class="border border-gray-200 rounded-sm bg-white">
                <SectionHeader title="Intelligent-Tiering Archive configurations" :showCreate="true"
                    createLabel="Create configuration" @create="activeModal = 'tiering'; currentTieringJson = ''" />
                <div v-if="tieringConfigs.length > 0" class="p-4 space-y-4">
                    <div v-for="config in tieringConfigs" :key="config.id"
                        class="border rounded-sm bg-gray-50 overflow-hidden">
                        <pre
                            class="p-3 text-[10px] font-mono text-gray-600 bg-gray-50 overflow-x-auto max-h-48"><code>{{ config.content }}</code></pre>
                    </div>
                </div>
                <EmptyState v-else title="No configurations"
                    message="There are no Intelligent-Tiering configurations." />
            </div>

            <!-- Requester Pays -->
            <div class="border border-gray-200 rounded-sm bg-white">
                <SectionHeader title="Requester pays" :showEdit="true"
                    @edit="activeModal = 'requesterPays'; tempRequesterPays = requesterPays" />
                <div class="p-4">
                    <p class="text-xs text-gray-600 mb-4">When enabled, the requester pays for requests and data
                        transfer
                        costs.</p>
                    <h3 class="text-sm font-bold text-gray-900">Requester pays</h3>
                    <p class="text-xs text-gray-900">{{ requesterPays }}</p>
                </div>
            </div>
        </div>

        <!-- Events & Integration Section -->
        <div class="space-y-6">
            <h3 class="text-lg font-bold text-gray-800 px-1 border-b border-gray-200 pb-2">Events & Integration</h3>

            <!-- Server Access Logging -->
            <div class="border border-gray-200 rounded-sm bg-white">
                <SectionHeader title="Server access logging" :showEdit="true"
                    @edit="activeModal = 'accessLogging'; Object.assign(tempAccessLogging, accessLogging)" />
                <div class="p-4">
                    <p class="text-xs text-gray-600 mb-4">Log requests for access to your bucket.</p>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <h3 class="text-sm font-bold text-gray-900">Server access logging</h3>
                            <p class="text-xs text-gray-900">{{ accessLogging.status }}</p>
                        </div>
                        <div v-if="accessLogging.status === 'Enabled'">
                            <h3 class="text-sm font-bold text-gray-900">Target bucket</h3>
                            <p class="text-xs text-gray-900">{{ accessLogging.targetBucket }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Event Notifications -->
            <div class="border border-gray-200 rounded-sm bg-white">
                <SectionHeader title="Event notifications" :showCreate="true" createLabel="Create event notification"
                    @create="activeModal = 'eventNotification'" />
                <div v-if="eventNotifications.length > 0" class="p-4">
                    <div class="overflow-x-auto">
                        <table class="w-full text-xs text-left text-gray-700">
                            <thead class="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th class="px-4 py-2 font-bold">Name</th>
                                    <th class="px-4 py-2 font-bold">Event types</th>
                                    <th class="px-4 py-2 font-bold">Destination</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200">
                                <tr v-for="event in eventNotifications" :key="event.id">
                                    <td
                                        class="px-4 py-2 text-[var(--aws-blue)] hover:underline cursor-pointer font-medium">
                                        {{ event.name }}</td>
                                    <td class="px-4 py-2">{{ event.types.join(', ') }}</td>
                                    <td class="px-4 py-2">{{ event.destination }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <EmptyState v-else title="No event notifications" message="" />
            </div>

            <!-- Tags -->
            <div class="border border-gray-200 rounded-sm bg-white">
                <div class="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 class="text-lg font-bold text-gray-900">Tags</h2>
                    <div class="flex gap-2">
                        <button @click="activeModal = 'tags'; tempTags = JSON.parse(JSON.stringify(tags))"
                            class="px-3 py-1 text-xs font-bold border border-[var(--aws-blue)] text-[var(--aws-blue)] bg-white rounded-sm hover:bg-blue-50">Edit</button>
                    </div>
                </div>
                <div v-if="tags.length > 0" class="p-4">
                    <div class="grid grid-cols-2 gap-x-8 gap-y-4">
                        <div v-for="(tag, index) in tags" :key="index" class="flex gap-8 border-b border-gray-100 pb-2">
                            <div>
                                <p class="text-[10px] font-bold text-gray-500 uppercase">Key</p>
                                <p class="text-xs text-gray-900">{{ tag.key }}</p>
                            </div>
                            <div>
                                <p class="text-[10px] font-bold text-gray-500 uppercase">Value</p>
                                <p class="text-xs text-gray-900">{{ tag.value }}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <EmptyState v-else title="No tags"
                    message="Tags are key-value pairs that you can add to your bucket to track costs or search for resources." />
            </div>
        </div>
    </div>

    <!-- Modals -->

    <!-- Bucket Versioning Modal -->
    <div v-if="activeModal === 'versioning'"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-white rounded-sm shadow-2xl w-full max-w-2xl">
            <div class="p-4 border-b border-gray-200">
                <h2 class="text-xl font-bold text-gray-900">Edit Bucket Versioning</h2>
            </div>
            <div class="p-6">
                <div class="space-y-4">
                    <label class="flex items-center gap-3 cursor-pointer group">
                        <input type="radio" v-model="tempVersioning" value="Enabled"
                            class="w-4 h-4 text-[var(--aws-blue)]">
                        <div>
                            <p class="text-xs font-bold text-gray-900">Enable</p>
                            <p class="text-[11px] text-gray-500">Keep multiple variants of an object in the same bucket.
                            </p>
                        </div>
                    </label>
                    <label class="flex items-center gap-3 cursor-pointer group">
                        <input type="radio" v-model="tempVersioning" value="Suspended"
                            class="w-4 h-4 text-[var(--aws-blue)]">
                        <div>
                            <p class="text-xs font-bold text-gray-900">Suspend</p>
                            <p class="text-[11px] text-gray-500">Stop keeping new variants of objects.</p>
                        </div>
                    </label>
                </div>
            </div>
            <div class="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 px-6">
                <button @click="activeModal = null"
                    class="px-4 py-1.5 font-bold text-[var(--aws-blue)] hover:underline text-xs">Cancel</button>
                <button @click="handleSaveVersioning"
                    class="px-6 py-1.5 font-bold bg-[var(--aws-orange)] text-white rounded-sm text-xs">Save
                    changes</button>
            </div>
        </div>
    </div>

    <!-- Default Encryption Modal -->
    <div v-if="activeModal === 'encryption'"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-white rounded-sm shadow-2xl w-full max-w-2xl">
            <div class="p-4 border-b border-gray-200">
                <h2 class="text-xl font-bold text-gray-900">Edit default encryption</h2>
            </div>
            <div class="p-6 space-y-6">
                <div>
                    <label class="block text-xs font-bold text-gray-900 mb-2">Encryption type</label>
                    <div class="space-y-3">
                        <label class="flex items-start gap-2 cursor-pointer">
                            <input type="radio" v-model="tempEncryption.type" value="SSE-S3"
                                class="mt-0.5 w-4 h-4 text-[var(--aws-blue)]">
                            <div>
                                <p class="text-xs text-gray-900 font-bold">Amazon S3 managed keys (SSE-S3)</p>
                                <p class="text-[11px] text-gray-500">Simplify your key management. <a href="#"
                                        class="text-[var(--aws-blue)] hover:underline">Learn more ↗</a></p>
                            </div>
                        </label>
                        <label class="flex items-start gap-2 cursor-pointer">
                            <input type="radio" v-model="tempEncryption.type" value="SSE-KMS"
                                class="mt-0.5 w-4 h-4 text-[var(--aws-blue)]">
                            <div>
                                <p class="text-xs text-gray-900 font-bold">AWS Key Management Service keys (SSE-KMS)</p>
                                <p class="text-[11px] text-gray-500">Use AWS KMS to secure your data. <a href="#"
                                        class="text-[var(--aws-blue)] hover:underline">Learn more ↗</a></p>
                            </div>
                        </label>
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-900 mb-2">Bucket Key</label>
                    <div class="flex gap-4">
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" v-model="tempEncryption.bucketKey" value="Enable" class="w-4 h-4">
                            <span class="text-xs">Enable</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" v-model="tempEncryption.bucketKey" value="Disable" class="w-4 h-4">
                            <span class="text-xs">Disable</span>
                        </label>
                    </div>
                </div>
            </div>
            <div class="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 px-6">
                <button @click="activeModal = null"
                    class="px-4 py-1.5 font-bold text-[var(--aws-blue)] hover:underline text-xs">Cancel</button>
                <button @click="handleSaveEncryption"
                    class="px-6 py-1.5 font-bold bg-[var(--aws-orange)] text-white rounded-sm text-xs">Save
                    changes</button>
            </div>
        </div>
    </div>

    <!-- Lifecycle Modal -->
    <div v-if="activeModal === 'lifecycle'"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-white rounded-sm shadow-2xl w-full max-w-4xl flex flex-col my-8">
            <div class="p-4 border-b border-gray-200 text-left">
                <h2 class="text-xl font-bold text-gray-900">Create lifecycle rule</h2>
                <p class="text-xs text-gray-500 mt-1">Lifecycle configuration is written in JSON.</p>
            </div>
            <div class="p-6">
                <div class="border border-gray-300 rounded-sm overflow-hidden flex flex-col h-[400px]">
                    <textarea v-model="currentLifecycleJson" placeholder='{ "Rules": [...] }'
                        class="flex-1 p-4 font-mono text-[11px] text-gray-800 bg-[#f8f9fa] resize-none focus:outline-none"></textarea>
                </div>
            </div>
            <div class="p-4 border-t border-gray-200 flex justify-end gap-3 bg-white">
                <button @click="activeModal = null"
                    class="px-4 py-1.5 font-bold text-[var(--aws-blue)] hover:underline text-xs">Cancel</button>
                <button @click="handleSaveLifecycle" :disabled="!currentLifecycleJson.trim()"
                    class="px-6 py-1.5 font-bold bg-[var(--aws-orange)] text-white rounded-sm text-xs">Create
                    rule</button>
            </div>
        </div>
    </div>

    <!-- Intelligent-Tiering Modal -->
    <div v-if="activeModal === 'tiering'"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-white rounded-sm shadow-2xl w-full max-w-4xl flex flex-col my-8">
            <div class="p-4 border-b border-gray-200 text-left">
                <h2 class="text-xl font-bold text-gray-900">Create Intelligent-Tiering configuration</h2>
            </div>
            <div class="p-6">
                <div class="border border-gray-300 rounded-sm overflow-hidden flex flex-col h-[400px]">
                    <textarea v-model="currentTieringJson" placeholder='{ "Id": "...", "Status": "Enabled", ... }'
                        class="flex-1 p-4 font-mono text-[11px] text-gray-800 bg-[#f8f9fa] resize-none focus:outline-none"></textarea>
                </div>
            </div>
            <div class="p-4 border-t border-gray-200 flex justify-end gap-3 bg-white">
                <button @click="activeModal = null"
                    class="px-4 py-1.5 font-bold text-[var(--aws-blue)] hover:underline text-xs">Cancel</button>
                <button @click="handleSaveTiering" :disabled="!currentTieringJson.trim()"
                    class="px-6 py-1.5 font-bold bg-[var(--aws-orange)] text-white rounded-sm text-xs">Create
                    configuration</button>
            </div>
        </div>
    </div>

    <!-- Requester Pays Modal -->
    <div v-if="activeModal === 'requesterPays'"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-white rounded-sm shadow-2xl w-full max-w-2xl px-6 py-4">
            <div class="p-4 border-b border-gray-200 text-left">
                <h2 class="text-xl font-bold text-gray-900">Edit Requester pays</h2>
            </div>
            <div class="p-6 space-y-4">
                <label class="flex items-center gap-3 cursor-pointer">
                    <input type="radio" v-model="tempRequesterPays" value="Enabled"
                        class="w-4 h-4 text-[var(--aws-blue)]">
                    <span class="text-xs font-bold">Enabled</span>
                </label>
                <label class="flex items-center gap-3 cursor-pointer">
                    <input type="radio" v-model="tempRequesterPays" value="Disabled"
                        class="w-4 h-4 text-[var(--aws-blue)]">
                    <span class="text-xs font-bold">Disabled</span>
                </label>
            </div>
            <div class="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
                <button @click="activeModal = null"
                    class="px-4 py-1.5 font-bold text-[var(--aws-blue)] hover:underline text-xs">Cancel</button>
                <button @click="handleSaveRequesterPays"
                    class="px-6 py-1.5 font-bold bg-[var(--aws-orange)] text-white rounded-sm text-xs shadow-sm">Save
                    changes</button>
            </div>
        </div>
    </div>

    <!-- Server Access Logging Modal -->
    <div v-if="activeModal === 'accessLogging'"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-white rounded-sm shadow-2xl w-full max-w-2xl px-6 py-4">
            <div class="p-4 border-b border-gray-200 text-left">
                <h2 class="text-xl font-bold text-gray-900">Edit server access logging</h2>
            </div>
            <div class="p-6 space-y-6">
                <div class="space-y-4">
                    <label class="flex items-center gap-3 cursor-pointer">
                        <input type="radio" v-model="tempAccessLogging.status" value="Enabled"
                            class="w-4 h-4 text-[var(--aws-blue)]">
                        <span class="text-xs font-bold">Enabled</span>
                    </label>
                    <label class="flex items-center gap-3 cursor-pointer">
                        <input type="radio" v-model="tempAccessLogging.status" value="Disabled"
                            class="w-4 h-4 text-[var(--aws-blue)]">
                        <span class="text-xs font-bold">Disabled</span>
                    </label>
                </div>
                <div v-if="tempAccessLogging.status === 'Enabled'" class="space-y-4 border-t pt-4">
                    <div>
                        <label class="block text-xs font-bold text-gray-900 mb-2">Target bucket</label>
                        <input type="text" v-model="tempAccessLogging.targetBucket" placeholder="s3://logging-bucket"
                            class="w-full px-3 py-1.5 text-sm border border-gray-400 rounded-sm outline-none">
                    </div>
                </div>
            </div>
            <div class="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
                <button @click="activeModal = null"
                    class="px-4 py-1.5 font-bold text-[var(--aws-blue)] hover:underline text-xs">Cancel</button>
                <button @click="handleSaveAccessLogging"
                    class="px-6 py-1.5 font-bold bg-[var(--aws-orange)] text-white rounded-sm text-xs shadow-sm">Save
                    changes</button>
            </div>
        </div>
    </div>

    <!-- Event Notification Modal -->
    <div v-if="activeModal === 'eventNotification'"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-white rounded-sm shadow-2xl w-full max-w-2xl px-6 py-4">
            <div class="p-4 border-b border-gray-200 text-left">
                <h2 class="text-xl font-bold text-gray-900">Create event notification</h2>
            </div>
            <div class="p-6 space-y-6">
                <div>
                    <label class="block text-xs font-bold text-gray-900 mb-2">Event name</label>
                    <input type="text" v-model="newEventNotification.name" placeholder="Enter rule name"
                        class="w-full px-3 py-1.5 text-sm border border-gray-400 rounded-sm outline-none">
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-900 mb-2">Destination</label>
                    <input type="text" v-model="newEventNotification.destination" placeholder="arn:serw:lambda:..."
                        class="w-full px-3 py-1.5 text-sm border border-gray-400 rounded-sm outline-none">
                </div>
            </div>
            <div class="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
                <button @click="activeModal = null"
                    class="px-4 py-1.5 font-bold text-[var(--aws-blue)] hover:underline text-xs">Cancel</button>
                <button @click="handleAddEventNotification" :disabled="!newEventNotification.name"
                    class="px-6 py-1.5 font-bold bg-[var(--aws-orange)] text-white rounded-sm text-xs shadow-sm disabled:opacity-50">Create</button>
            </div>
        </div>
    </div>

    <!-- Object Lock Modal -->
    <div v-if="activeModal === 'objectLock'"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-white rounded-sm shadow-2xl w-full max-w-2xl px-6 py-4">
            <div class="p-4 border-b border-gray-200 text-left">
                <h2 class="text-xl font-bold text-gray-900">Edit Object Lock</h2>
            </div>
            <div class="p-6">
                <!-- AWS Style Warning -->
                <div class="bg-amber-50 border border-amber-400 p-4 mb-6 flex gap-3">
                    <svg class="w-5 h-5 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div class="text-[11px] text-amber-800 leading-relaxed font-medium">
                        Object Lock cannot be disabled after it has been enabled. Enabling Object Lock also enables
                        Bucket Versioning.
                        <a href="#" class="text-[var(--aws-blue)] hover:underline">Learn more ↗</a>
                    </div>
                </div>

                <div class="space-y-4">
                    <label class="flex items-center gap-3 cursor-pointer">
                        <input type="radio" v-model="tempObjectLock" value="Enabled"
                            class="w-4 h-4 text-[var(--aws-blue)]">
                        <span class="text-xs font-bold">Enabled</span>
                    </label>
                    <label class="flex items-center gap-3 cursor-pointer">
                        <input type="radio" v-model="tempObjectLock" value="Disabled"
                            class="w-4 h-4 text-[var(--aws-blue)]">
                        <span class="text-xs font-bold">Disabled</span>
                    </label>
                </div>
            </div>
            <div class="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
                <button @click="activeModal = null"
                    class="px-4 py-1.5 font-bold text-[var(--aws-blue)] hover:underline text-xs">Cancel</button>
                <button @click="handleSaveObjectLock"
                    class="px-6 py-1.5 font-bold bg-[var(--aws-orange)] text-white rounded-sm text-xs shadow-sm">Save
                    changes</button>
            </div>
        </div>
    </div>

    <!-- Replication Rule Modal -->
    <div v-if="activeModal === 'replication'"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-white rounded-sm shadow-2xl w-full max-w-2xl px-6 py-4">
            <div class="p-4 border-b border-gray-200 text-left">
                <h2 class="text-xl font-bold text-gray-900">Create replication rule</h2>
            </div>
            <div class="p-6 space-y-6">
                <div>
                    <label class="block text-xs font-bold text-gray-900 mb-2">Replication rule name</label>
                    <input type="text" v-model="newReplicationRule.name" placeholder="Enter rule name"
                        class="w-full px-3 py-1.5 text-sm border border-gray-400 rounded-sm outline-none">
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-gray-900 mb-2">Priority</label>
                        <input type="number" v-model="newReplicationRule.priority"
                            class="w-full px-3 py-1.5 text-sm border border-gray-400 rounded-sm outline-none">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-900 mb-2">Status</label>
                        <select v-model="newReplicationRule.status"
                            class="w-full px-3 py-1.5 text-sm border border-gray-400 rounded-sm outline-none">
                            <option value="Enabled">Enabled</option>
                            <option value="Disabled">Disabled</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
                <button @click="activeModal = null"
                    class="px-4 py-1.5 font-bold text-[var(--aws-blue)] hover:underline text-xs">Cancel</button>
                <button @click="handleAddReplicationRule" :disabled="!newReplicationRule.name"
                    class="px-6 py-1.5 font-bold bg-[var(--aws-orange)] text-white rounded-sm text-xs shadow-sm disabled:opacity-50">Create
                    rule</button>
            </div>
        </div>
    </div>

    <!-- Tags Modal -->
    <div v-if="activeModal === 'tags'"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-white rounded-sm shadow-2xl w-full max-w-2xl px-6 py-4">
            <div class="p-4 border-b border-gray-200 text-left">
                <h2 class="text-xl font-bold text-gray-900">Edit tags</h2>
            </div>
            <div class="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <div v-for="(tag, index) in tempTags" :key="index"
                    class="flex items-end gap-4 p-3 bg-gray-50 border border-gray-200 rounded-sm">
                    <div class="flex-1 space-y-1">
                        <label class="block text-[10px] font-bold text-gray-500 uppercase">Key</label>
                        <input type="text" v-model="tag.key"
                            class="w-full px-3 py-1 text-xs border border-gray-300 rounded-sm outline-none focus:ring-1 focus:ring-[var(--aws-blue)]">
                    </div>
                    <div class="flex-1 space-y-1">
                        <label class="block text-[10px] font-bold text-gray-500 uppercase">Value</label>
                        <input type="text" v-model="tag.value"
                            class="w-full px-3 py-1 text-xs border border-gray-300 rounded-sm outline-none focus:ring-1 focus:ring-[var(--aws-blue)]">
                    </div>
                    <button @click="handleRemoveTag(index)"
                        class="p-1 px-3 text-[var(--aws-blue)] hover:bg-gray-200 rounded-sm font-bold text-xs">Remove</button>
                </div>
                <button @click="handleAddTag"
                    class="text-xs font-bold text-[var(--aws-blue)] hover:underline flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add tag
                </button>
            </div>
            <div class="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
                <button @click="activeModal = null"
                    class="px-4 py-1.5 font-bold text-[var(--aws-blue)] hover:underline text-xs">Cancel</button>
                <button @click="handleSaveTags"
                    class="px-6 py-1.5 font-bold bg-[var(--aws-orange)] text-white rounded-sm text-xs shadow-sm">Save
                    changes</button>
            </div>
        </div>
    </div>
</template>
