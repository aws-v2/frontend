<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import SectionHeader from '../shared/SectionHeader.vue'
import EmptyState from '../shared/EmptyState.vue'
import InfoAlert from '../shared/InfoAlert.vue'
import { useS3Store } from '@/modules/s3/store/s3Store'
import { useToastStore } from '@/shared/store/toastStore'

const s3Store = useS3Store()
const toastStore = useToastStore()

// State for active modal
const activeModal = ref<string | null>(null)
const isSaving = ref(false)

// Versioning State
const versioning = ref('Suspended')
const tempVersioning = ref('Suspended')

// Encryption State
const encryption = reactive({
    type: 'SSE-S3',
    bucketKey: 'Enable'
})
const tempEncryption = reactive({ ...encryption })

const encryptionTypeLabel = computed(() => {
    return 'Server-side encryption with Amazon S3 managed keys (SSE-S3)'
})

// Object Lock State
const objectLock = ref('Disabled')
const tempObjectLock = ref('Disabled')

// Tags State
const tags = ref<{ key: string; value: string }[]>([])
const tempTags = ref<{ key: string; value: string }[]>([])

// Initial sync with store
const syncState = async () => {
    const bucket = s3Store.currentBucket
    if (bucket?.settings) {
        versioning.value = bucket.settings.versioning_status || 'Suspended'
        tempVersioning.value = versioning.value

        encryption.type = bucket.settings.encryption?.type || 'SSE-S3'
        encryption.bucketKey = bucket.settings.encryption?.bucketKeyEnabled ? 'Enable' : 'Disable'
        Object.assign(tempEncryption, encryption)

        objectLock.value = bucket.settings.object_lock ? 'Enabled' : 'Disabled'
        tempObjectLock.value = objectLock.value

        tags.value = JSON.parse(JSON.stringify(bucket.settings.tags || []))
        tempTags.value = JSON.parse(JSON.stringify(tags.value))

        // Access Logging
        if (bucket.settings.logging) {
            accessLogging.status = bucket.settings.logging.enabled ? 'Enabled' : 'Disabled'
            accessLogging.targetBucket = bucket.settings.logging.targetBucket || ''
            accessLogging.prefix = bucket.settings.logging.targetPrefix || ''
        } else {
            accessLogging.status = 'Disabled'
            accessLogging.targetBucket = ''
            accessLogging.prefix = ''
        }
        Object.assign(tempAccessLogging, accessLogging)
    }


    // Fetch event notifications
    if (bucket?.bucket_id) {
        const notifications = await s3Store.fetchEventNotifications(bucket.bucket_id)
        eventNotifications.value = notifications.map((n: any, idx: number) => ({
            id: n.id || idx,
            name: n.name,
            types: n.event_types || n.eventTypes || [],
            destination: n.destination
        }))

        // Fetch resource tags
        const fetchedTags = await s3Store.fetchBucketTags(bucket.bucket_id)
        tags.value = fetchedTags.map((t: any) => ({
            key: t.key || t.Key,
            value: t.value || t.Value
        }))
        tempTags.value = JSON.parse(JSON.stringify(tags.value))

        // Fetch replication rules
        const rules = await s3Store.fetchReplicationRules(bucket.bucket_id)
        replicationRules.value = rules.map((r: any, idx: number) => ({
            id: r.id || idx,
            name: r.name,
            priority: r.priority,
            status: r.status
        }))

        // Fetch encryption settings
        const encData = await s3Store.fetchBucketEncryption(bucket.bucket_id)
        if (encData) {
            encryption.type = encData.type || 'SSE-S3'
            encryption.bucketKey = encData.bucketKeyEnabled ? 'Enable' : 'Disable'
            Object.assign(tempEncryption, encryption)
        }

        // Fetch object lock status
        const lockData = await s3Store.fetchBucketObjectLock(bucket.bucket_id)
        if (lockData) {
            objectLock.value = lockData.enabled ? 'Enabled' : 'Disabled'
            tempObjectLock.value = objectLock.value
        }

        // Fetch access logging settings
        const logData = await s3Store.fetchBucketAccessLogging(bucket.bucket_id)
        if (logData) {
            accessLogging.status = logData.status || 'Disabled'
            accessLogging.targetBucket = logData.targetBucket || ''
            accessLogging.prefix = logData.targetPrefix || ''
            Object.assign(tempAccessLogging, accessLogging)
        }
    }
}


onMounted(syncState)
watch(() => s3Store.currentBucket?.bucket_id, syncState)

const handleSaveVersioning = async () => {
    if (!s3Store.currentBucket?.bucket_id) return

    isSaving.value = true
    try {
        await s3Store.updateBucketVersioning(s3Store.currentBucket.bucket_id, tempVersioning.value)
        versioning.value = tempVersioning.value
        activeModal.value = null
        toastStore.addToast(`Bucket versioning is now ${tempVersioning.value.toLowerCase()}.`, 'success')
    } catch (error) {
        toastStore.addToast('Could not update versioning status.', 'error')
    } finally {
        isSaving.value = false
    }
}

const handleSaveEncryption = async () => {
    if (!s3Store.currentBucket?.bucket_id) return

    isSaving.value = true
    try {
        await s3Store.updateBucketEncryption(s3Store.currentBucket.bucket_id, {
            type: tempEncryption.type,
            bucketKeyEnabled: tempEncryption.bucketKey === 'Enable'
        })
        Object.assign(encryption, tempEncryption)
        activeModal.value = null
        toastStore.addToast('Encryption settings updated successfully.', 'success')
    } catch (error) {
        toastStore.addToast('Could not update encryption settings.', 'error')
    } finally {
        isSaving.value = false
    }
}

const handleSaveObjectLock = async () => {
    if (!s3Store.currentBucket?.bucket_id) return

    isSaving.value = true
    try {
        if (tempObjectLock.value === 'Enabled') {
            await s3Store.enableObjectLock(s3Store.currentBucket.bucket_id)
            objectLock.value = 'Enabled'
            toastStore.addToast('Object lock has been enabled.', 'success')
        }
        activeModal.value = null
    } catch (error) {
        toastStore.addToast('Could not enable object lock.', 'error')
    } finally {
        isSaving.value = false
    }
}

// Replication State
const replicationRules = ref<{ id: number; name: string; priority: number; status: string }[]>([])
const newReplicationRule = reactive({
    name: '',
    priority: 1,
    status: 'Enabled'
})

const handleAddReplicationRule = async () => {
    if (!s3Store.currentBucket?.bucket_id) return

    isSaving.value = true
    try {
        await s3Store.createReplicationRule(
            s3Store.currentBucket.bucket_id,
            newReplicationRule.name,
            newReplicationRule.priority,
            newReplicationRule.status
        )
        replicationRules.value.push({
            id: Date.now(),
            ...newReplicationRule
        })
        Object.assign(newReplicationRule, { name: '', priority: 1, status: 'Enabled' })
        activeModal.value = null
        toastStore.addToast('Replication rule created successfully.', 'success')
    } catch (error) {
        toastStore.addToast('Could not create replication rule.', 'error')
    } finally {
        isSaving.value = false
    }
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

const handleSaveAccessLogging = async () => {
    if (!s3Store.currentBucket?.bucket_id) return

    isSaving.value = true
    try {
        await s3Store.updateBucketAccessLogging(
            s3Store.currentBucket.bucket_id,
            tempAccessLogging.status,
            tempAccessLogging.targetBucket,
            tempAccessLogging.prefix
        )
        Object.assign(accessLogging, tempAccessLogging)
        activeModal.value = null
        toastStore.addToast('Bucket access logs updated.', 'success')
    } catch (error) {
        toastStore.addToast('Could not update bucket access logs.', 'error')
    } finally {
        isSaving.value = false
    }
}

// Event Notifications
const eventNotifications = ref<{ id: number; name: string; types: string[]; destination: string }[]>([])
const newEventNotification = reactive({
    name: '',
    types: ['s3:ObjectCreated:*'],
    destination: ''
})

const handleAddEventNotification = async () => {
    if (!s3Store.currentBucket?.bucket_id) return

    isSaving.value = true
    try {
        await s3Store.createEventNotification(
            s3Store.currentBucket.bucket_id,
            newEventNotification.name,
            newEventNotification.types,
            newEventNotification.destination
        )
        eventNotifications.value.push({
            id: Date.now(),
            ...newEventNotification
        })
        Object.assign(newEventNotification, { name: '', types: ['s3:ObjectCreated:*'], destination: '' })
        activeModal.value = null
        toastStore.addToast('Event notification created successfully.', 'success')
    } catch (error) {
        toastStore.addToast('Could not create event notification.', 'error')
    } finally {
        isSaving.value = false
    }
}

// Tags State
const handleAddTag = () => {
    tempTags.value.push({ key: '', value: '' })
}

const handleRemoveTag = (index: number) => {
    tempTags.value.splice(index, 1)
}

const handleSaveTags = async () => {
    if (!s3Store.currentBucket?.bucket_id) return

    isSaving.value = true
    try {
        await s3Store.updateBucketTags(s3Store.currentBucket.bucket_id, tempTags.value)
        tags.value = JSON.parse(JSON.stringify(tempTags.value))
        activeModal.value = null
        toastStore.addToast('Resource tags updated successfully.', 'success')
    } catch (error) {
        toastStore.addToast('Could not update resource tags.', 'error')
    } finally {
        isSaving.value = false
    }
}

const openAccessLoggingModal = () => {
    activeModal.value = 'accessLogging'
    Object.assign(tempAccessLogging, accessLogging)
    // Auto-populate target bucket if empty
    if (!tempAccessLogging.targetBucket && s3Store.currentBucket?.name) {
        tempAccessLogging.targetBucket = s3Store.currentBucket.name
    }
}
</script>

<template>
    <div class="space-y-12 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500 italic">

        <!-- Data Protection Section -->
        <div class="space-y-8">

            <!-- Bucket Versioning -->
            <div
                class="bg-white border-2 border-[#eaeded] overflow-hidden shadow-sm transition-all hover:border-[#ff9900]/30 italic">
                <SectionHeader title="Bucket Versioning" :showEdit="true"
                    @edit="activeModal = 'versioning'; tempVersioning = versioning" />
                <div class="p-10">
                    <p class="text-[13px] text-[#545b64] mb-8 leading-relaxed font-bold uppercase tracking-tight">
                        Versioning is a means of keeping multiple variants of an
                        object in the same bucket. <a href="#"
                            class="text-[#ff9900] underline font-black ml-1 italic transition-all hover:text-[#232f3e]">Learn
                            more
                            ↗</a></p>
                    <div class="bg-[#fafafa] p-6 border-2 border-[#eaeded] inline-block min-w-[240px]">
                        <h4 class="text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em] mb-2">Current Status
                        </h4>
                        <p class="text-2xl font-black tracking-tight transition-all uppercase italic"
                            :class="versioning === 'Enabled' ? 'text-[#ff9900]' : 'text-[#eaeded]'">
                            {{ versioning }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Default Encryption -->
            <div
                class="bg-white border-2 border-[#eaeded] overflow-hidden shadow-sm transition-all hover:border-[#ff9900]/30 italic">
                <SectionHeader title="Default encryption" :showEdit="true"
                    @edit="activeModal = 'encryption'; Object.assign(tempEncryption, encryption)" />
                <div class="p-10">
                    <p class="text-[13px] text-[#545b64] mb-8 leading-relaxed font-bold uppercase tracking-tight">
                        Server-side encryption is automatically applied to new objects
                        stored in this bucket.</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="bg-[#fafafa] p-6 border-2 border-[#eaeded]">
                            <h4 class="text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em] mb-2">Encryption
                                type</h4>
                            <p class="text-[13px] text-[#232f3e] font-black uppercase tracking-tight leading-tight">{{
                                encryptionTypeLabel }}</p>
                        </div>
                        <div class="bg-[#fafafa] p-6 border-2 border-[#eaeded]">
                            <h4 class="text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em] mb-2">Bucket Key
                            </h4>
                            <p class="text-[13px] text-[#ff9900] font-black uppercase tracking-widest">{{
                                encryption.bucketKey }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Object Lock -->
            <div
                class="bg-white border-2 border-[#eaeded] overflow-hidden shadow-sm transition-all hover:border-[#ff9900]/30 italic">
                <SectionHeader title="Object Lock" :showEdit="true"
                    @edit="activeModal = 'objectLock'; tempObjectLock = objectLock" />
                <div class="p-10">
                    <p class="text-[13px] text-[#545b64] mb-8 leading-relaxed font-bold uppercase tracking-tight">Store
                        objects using a write-once-read-many (WORM) model. <a href="#"
                            class="text-[#ff9900] underline font-black ml-1 italic transition-all hover:text-[#232f3e]">Learn
                            more ↗</a></p>
                    <div class="bg-[#fafafa] p-6 border-2 border-[#eaeded] inline-block min-w-[240px]">
                        <h4 class="text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em] mb-2">Object Lock
                            Security</h4>
                        <p class="text-2xl font-black tracking-tight transition-all uppercase italic"
                            :class="objectLock === 'Enabled' ? 'text-[#ff9900]' : 'text-[#eaeded]'">
                            {{ objectLock }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Replication Rules -->
            <div
                class="bg-white border-2 border-[#eaeded] overflow-hidden shadow-sm transition-all hover:border-[#ff9900]/30 italic">
                <SectionHeader title="Replication rules" :showCreate="true" createLabel="Create replication rule"
                    @create="activeModal = 'replication'" />
                <div v-if="replicationRules.length > 0" class="p-0 border-t-2 border-[#eaeded]">
                    <div class="overflow-x-auto">
                        <table class="w-full text-[13px] text-left">
                            <thead class="bg-[#fafafa] border-b-2 border-[#eaeded]">
                                <tr>
                                    <th
                                        class="px-10 py-5 font-black text-[#545b64] uppercase tracking-[0.2em] text-[10px] border-r-2 border-[#eaeded]">
                                        Rule name</th>
                                    <th
                                        class="px-10 py-5 font-black text-[#545b64] uppercase tracking-[0.2em] text-[10px] border-r-2 border-[#eaeded]">
                                        Priority</th>
                                    <th
                                        class="px-10 py-5 font-black text-[#545b64] uppercase tracking-[0.2em] text-[10px]">
                                        Status</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y-2 divide-[#eaeded] bg-white italic">
                                <tr v-for="rule in replicationRules" :key="rule.id"
                                    class="group hover:bg-[#fafafa] transition-all">
                                    <td
                                        class="px-10 py-6 font-black text-[#ff9900] tracking-tight uppercase border-r-2 border-[#eaeded]">
                                        {{ rule.name }}</td>
                                    <td class="px-10 py-6 text-[#545b64] font-black border-r-2 border-[#eaeded]">{{
                                        rule.priority }}</td>
                                    <td class="px-10 py-6">
                                        <span
                                            class="px-4 py-1.5 border-2 text-[10px] font-black uppercase tracking-widest italic"
                                            :class="rule.status === 'Enabled' ? 'bg-[#ff9900]/5 border-[#ff9900] text-[#ff9900]' : 'bg-[#fafafa] border-[#eaeded] text-[#eaeded]'">
                                            {{ rule.status }}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div v-else class="p-10">
                    <EmptyState title="No replication rules"
                        message="Use replication rules to define options you want Amazon S3 to apply during replication." />
                </div>
            </div>
        </div>


        <!-- Events & Integration Section -->
        <div class="space-y-8">
            <h3
                class="text-[10px] font-black text-[#545b64] uppercase tracking-[0.3em] px-2 border-b-2 border-[#eaeded] pb-4 italic">
                Events & Integration</h3>

            <!-- Server Access Logging -->
            <div
                class="bg-white border-2 border-[#eaeded] overflow-hidden shadow-sm transition-all hover:border-[#ff9900]/30 italic">
                <SectionHeader title="Bucket access logs" :showEdit="true" @edit="openAccessLoggingModal" />
                <div class="p-10">
                    <p class="text-[13px] text-[#545b64] mb-8 leading-relaxed font-bold uppercase tracking-tight">Log
                        requests for access to your bucket.</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="bg-[#fafafa] p-6 border-2 border-[#eaeded]">
                            <h4 class="text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em] mb-2">Logging
                                Status</h4>
                            <p class="text-lg font-black uppercase transition-all italic"
                                :class="accessLogging.status === 'Enabled' ? 'text-[#ff9900]' : 'text-[#eaeded]'">
                                {{ accessLogging.status }}
                            </p>
                        </div>
                        <div v-if="accessLogging.status === 'Enabled'"
                            class="bg-[#fafafa] p-6 border-2 border-[#eaeded]">
                            <h4 class="text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em] mb-2">Target
                                bucket</h4>
                            <p class="text-[13px] text-[#232f3e] font-black uppercase tracking-tight italic">{{
                                accessLogging.targetBucket }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Event Notifications -->
            <div
                class="bg-white border-2 border-[#eaeded] overflow-hidden shadow-sm transition-all hover:border-[#ff9900]/30 italic">
                <SectionHeader title="Event notifications" :showCreate="true" createLabel="Create event notification"
                    @create="activeModal = 'eventNotification'" />
                <div v-if="eventNotifications.length > 0" class="p-0 border-t-2 border-[#eaeded]">
                    <div class="overflow-x-auto">
                        <table class="w-full text-[13px] text-left">
                            <thead class="bg-[#fafafa] border-b-2 border-[#eaeded]">
                                <tr>
                                    <th
                                        class="px-10 py-5 font-black text-[#545b64] uppercase tracking-[0.2em] text-[10px] border-r-2 border-[#eaeded]">
                                        Name</th>
                                    <th
                                        class="px-10 py-5 font-black text-[#545b64] uppercase tracking-[0.2em] text-[10px] border-r-2 border-[#eaeded]">
                                        Event types</th>
                                    <th
                                        class="px-10 py-5 font-black text-[#545b64] uppercase tracking-[0.2em] text-[10px]">
                                        Destination</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y-2 divide-[#eaeded] bg-white italic">
                                <tr v-for="event in eventNotifications" :key="event.id"
                                    class="group hover:bg-[#fafafa] transition-all">
                                    <td
                                        class="px-10 py-6 font-black text-[#ff9900] tracking-tight uppercase border-r-2 border-[#eaeded] italic">
                                        {{ event.name }}</td>
                                    <td class="px-10 py-6 text-[#545b64] border-r-2 border-[#eaeded]">
                                        <div class="flex flex-wrap gap-3">
                                            <span v-for="type in event.types" :key="type"
                                                class="px-3 py-1 bg-white border-2 border-[#eaeded] text-[9px] font-black uppercase tracking-widest text-[#545b64] group-hover:border-[#ff9900]/30 group-hover:text-[#232f3e] transition-all">{{
                                                    type }}</span>
                                        </div>
                                    </td>
                                    <td
                                        class="px-10 py-6 text-[#545b64] font-mono text-[11px] uppercase tracking-tight break-all">
                                        {{ event.destination }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div v-else class="p-10">
                    <EmptyState title="No event notifications" message="Set up notifications for bucket events." />
                </div>
            </div>

            <!-- Tags -->
            <div class="bg-white border-2 border-[#eaeded] overflow-hidden shadow-sm transition-all italic">
                <div class="p-8 border-b-2 border-[#eaeded] flex justify-between items-center bg-[#fafafa]">
                    <h2 class="text-3xl font-black text-[#232f3e] tracking-tighter uppercase italic">Resource Tags</h2>
                    <button @click="activeModal = 'tags'; tempTags = JSON.parse(JSON.stringify(tags))"
                        class="px-8 py-2.5 text-[11px] font-black bg-[#232f3e] text-white uppercase tracking-widest shadow-xl shadow-black/10 hover:bg-black transition-all active:scale-95 italic">
                        Edit
                    </button>
                </div>
                <div v-if="tags.length > 0" class="p-10">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div v-for="(tag, index) in tags" :key="index"
                            class="flex gap-10 border-2 border-[#eaeded] bg-[#fafafa] p-8 relative overflow-hidden group hover:border-[#ff9900]/50 transition-all italic">
                            <div
                                class="absolute -top-10 -right-10 w-24 h-24 bg-[#ff9900]/5 rounded-full blur-2xl group-hover:bg-[#ff9900]/10 transition-all">
                            </div>
                            <div class="relative">
                                <p class="text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em] mb-2 italic">
                                    Key</p>
                                <p class="text-base text-[#232f3e] font-black uppercase tracking-tight">{{ tag.key }}
                                </p>
                            </div>
                            <div class="relative">
                                <p class="text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em] mb-2 italic">
                                    Value</p>
                                <p class="text-base text-[#ff9900] font-black uppercase tracking-tight">{{ tag.value }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else class="p-10">
                    <EmptyState title="No tags"
                        message="Tags are key-value pairs that help you track costs or search for resources." />
                </div>
            </div>
        </div>
    </div>

    <!-- Modals (Modernized for Light Theme) -->

    <!-- Bucket Versioning Modal -->
    <div v-if="activeModal === 'versioning'"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#232f3e]/60 backdrop-blur-sm transition-all italic">
        <div class="bg-white border-4 border-[#232f3e] shadow-2xl w-full max-w-2xl overflow-hidden relative">
            <div class="absolute -top-24 -left-24 w-80 h-80 bg-[#ff9900]/5 rounded-full blur-3xl pointer-events-none">
            </div>

            <div class="p-10 border-b-2 border-[#eaeded] bg-[#fafafa] relative">
                <h2
                    class="text-4xl font-black text-[#232f3e] tracking-tighter uppercase italic flex items-center gap-4">
                    Versioning
                    <span
                        class="px-4 py-1.5 bg-white border-2 border-[#eaeded] text-[#ff9900] text-[10px] font-black tracking-widest uppercase italic shadow-sm">Config
                        Layer</span>
                </h2>
            </div>

            <div class="p-10 relative">
                <div class="space-y-6">
                    <label
                        class="flex items-center gap-6 p-8 border-2 cursor-pointer transition-all active:scale-[0.98] group italic"
                        :class="tempVersioning === 'Enabled' ? 'bg-[#ff9900]/[0.02] border-[#ff9900] shadow-xl shadow-[#ff9900]/5' : 'bg-white border-[#eaeded] hover:border-[#ff9900]/30 shadow-none'">
                        <div class="w-7 h-7 border-2 border-[#eaeded] flex items-center justify-center transition-all bg-white shrink-0"
                            :class="tempVersioning === 'Enabled' ? 'border-[#ff9900] bg-[#ff9900]/10' : 'group-hover:border-[#ff9900]/50'">
                            <div v-if="tempVersioning === 'Enabled'"
                                class="w-4 h-4 bg-[#ff9900] rotate-45 animate-pulse"></div>
                        </div>
                        <input type="radio" v-model="tempVersioning" value="Enabled" class="hidden">
                        <div>
                            <p class="text-xl font-black uppercase italic tracking-tight"
                                :class="tempVersioning === 'Enabled' ? 'text-[#ff9900]' : 'text-[#232f3e]'">Enable
                                Versioning</p>
                            <p
                                class="text-[11px] text-[#545b64] leading-relaxed font-bold uppercase tracking-widest mt-1">
                                Archive multiple variants of objects systematically.</p>
                        </div>
                    </label>

                    <label
                        class="flex items-center gap-6 p-8 border-2 cursor-pointer transition-all active:scale-[0.98] group italic"
                        :class="tempVersioning === 'Suspended' ? 'bg-[#232f3e] border-[#232f3e] text-white shadow-2xl italic' : 'bg-white border-[#eaeded] hover:border-[#ff9900]/30 shadow-none'">
                        <div class="w-7 h-7 border-2 border-[#eaeded] flex items-center justify-center transition-all bg-white shrink-0"
                            :class="tempVersioning === 'Suspended' ? 'border-white bg-white' : 'group-hover:border-[#ff9900]/50'">
                            <div v-if="tempVersioning === 'Suspended'" class="w-4 h-4 bg-[#232f3e] rotate-45"></div>
                        </div>
                        <input type="radio" v-model="tempVersioning" value="Suspended" class="hidden">
                        <div>
                            <p class="text-xl font-black uppercase italic tracking-tight"
                                :class="tempVersioning === 'Suspended' ? 'text-white' : 'text-[#232f3e]'">Suspend
                                Versioning</p>
                            <p class="text-[11px] leading-relaxed font-bold uppercase tracking-widest mt-1"
                                :class="tempVersioning === 'Suspended' ? 'text-white/50' : 'text-[#545b64]'">Halt the
                                generation of new object versions immediately.</p>
                        </div>
                    </label>
                </div>
            </div>

            <div class="p-10 border-t-2 border-[#eaeded] flex justify-end gap-6 bg-[#fafafa]">
                <button @click="activeModal = null"
                    class="px-10 py-3 font-black text-[#545b64] hover:text-[#ff9900] transition-colors text-xs uppercase tracking-widest italic active:scale-95"
                    :disabled="isSaving">Cancel</button>
                <button @click="handleSaveVersioning" :disabled="isSaving"
                    class="px-12 py-3 font-black bg-[#232f3e] text-white hover:bg-black transition-all shadow-2xl text-xs uppercase tracking-widest italic active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3">
                    <svg v-if="isSaving" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg"
                        fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                    {{ isSaving ? 'Saving...' : 'Save Changes' }}
                </button>
            </div>
        </div>
    </div>

    <!-- Default Encryption Modal -->
    <div v-if="activeModal === 'encryption'"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#232f3e]/60 backdrop-blur-sm transition-all overflow-y-auto italic">
        <div class="bg-white border-4 border-[#232f3e] shadow-2xl w-full max-w-4xl overflow-hidden relative my-8">
            <div class="absolute -top-24 -left-24 w-80 h-80 bg-[#ff9900]/5 rounded-full blur-3xl pointer-events-none">
            </div>

            <div class="p-10 border-b-2 border-[#eaeded] bg-[#fafafa] relative">
                <h2 class="text-4xl font-black text-[#232f3e] tracking-tighter uppercase italic">Encryption Engine</h2>
                <p class="text-[11px] text-[#ff9900] mt-3 font-black uppercase tracking-[0.2em] italic">Data-at-Rest
                    Security Configuration</p>
            </div>

            <div class="p-10 space-y-12 relative">
                <div>
                    <label
                        class="block text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em] mb-8 italic">Encryption
                        Architecture</label>
                    <div class="space-y-6">
                        <label
                            class="flex items-start gap-8 p-10 border-2 cursor-pointer transition-all active:scale-[0.98] group italic"
                            :class="tempEncryption.type === 'SSE-S3' ? 'border-[#ff9900] bg-[#ff9900]/[0.02] shadow-xl shadow-[#ff9900]/5' : 'bg-white border-[#eaeded] hover:border-[#ff9900]/30 shadow-none'">
                            <input type="radio" v-model="tempEncryption.type" value="SSE-S3" class="hidden">
                            <div class="w-8 h-8 border-2 border-[#eaeded] flex items-center justify-center transition-all bg-white shrink-0 mt-1"
                                :class="tempEncryption.type === 'SSE-S3' ? 'border-[#ff9900] bg-[#ff9900]/10' : 'group-hover:border-[#ff9900]/50'">
                                <div v-if="tempEncryption.type === 'SSE-S3'"
                                    class="w-5 h-5 bg-[#ff9900] rotate-45 animate-pulse"></div>
                            </div>
                            <div>
                                <p class="text-2xl font-black uppercase italic tracking-tight"
                                    :class="tempEncryption.type === 'SSE-S3' ? 'text-[#ff9900]' : 'text-[#232f3e]'">
                                    Amazon S3 Managed Keys (SSE-S3)</p>
                                <p
                                    class="text-[12px] text-[#545b64] leading-relaxed font-bold uppercase tracking-tight mt-1">
                                    Simplify key management with automatedSerwin Infrastructure. <a href="#"
                                        class="text-[#ff9900] hover:underline font-black ml-2 transition-all italic">Architecture
                                        Guide ↗</a></p>
                            </div>
                        </label>
                    </div>
                </div>

                <div class="pt-12 border-t-2 border-[#eaeded]">
                    <label
                        class="block text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em] mb-8 italic">Bucket
                        Key State</label>
                    <div class="flex gap-8">
                        <label
                            class="flex-1 flex items-center justify-center gap-4 p-8 border-2 cursor-pointer transition-all active:scale-95 group italic"
                            :class="tempEncryption.bucketKey === 'Enable' ? 'bg-[#ff9900] border-[#ff9900] text-[#232f3e] shadow-xl italic' : 'bg-white border-[#eaeded] text-[#545b64] hover:border-[#ff9900]/30 shadow-none'">
                            <input type="radio" v-model="tempEncryption.bucketKey" value="Enable" class="hidden">
                            <span class="text-xs font-black uppercase tracking-widest">{{ tempEncryption.bucketKey ===
                                'Enable' ? '● ENABLED' : 'ENABLE' }}</span>
                        </label>
                        <label
                            class="flex-1 flex items-center justify-center gap-4 p-8 border-2 cursor-pointer transition-all active:scale-95 group italic"
                            :class="tempEncryption.bucketKey === 'Disable' ? 'bg-[#232f3e] border-[#232f3e] text-white shadow-2xl italic' : 'bg-white border-[#eaeded] text-[#545b64] hover:border-[#ff9900]/30 shadow-none'">
                            <input type="radio" v-model="tempEncryption.bucketKey" value="Disable" class="hidden">
                            <span class="text-xs font-black uppercase tracking-widest">{{ tempEncryption.bucketKey ===
                                'Disable' ? '● DISABLED' : 'DISABLE' }}</span>
                        </label>
                    </div>
                </div>
            </div>

            <div class="p-10 border-t-2 border-[#eaeded] flex justify-end gap-6 bg-[#fafafa] relative">
                <button @click="activeModal = null"
                    class="px-10 py-3 font-black text-[#545b64] hover:text-[#ff9900] transition-colors text-xs uppercase tracking-widest italic active:scale-95">Cancel</button>
                <button @click="handleSaveEncryption"
                    class="px-12 py-3 font-black bg-[#232f3e] text-white hover:bg-black transition-all shadow-2xl text-xs uppercase tracking-widest italic active:scale-95">Deploy
                    Config</button>
            </div>
        </div>
    </div>

    <!-- Replication Rule Modal -->
    <div v-if="activeModal === 'replication'"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#232f3e]/60 backdrop-blur-sm transition-all italic">
        <div class="bg-white border-4 border-[#232f3e] shadow-2xl w-full max-w-2xl overflow-hidden relative italic">
            <div class="p-10 border-b-2 border-[#eaeded] bg-[#fafafa]">
                <h2 class="text-4xl font-black text-[#232f3e] tracking-tighter uppercase italic">Replication Rule</h2>
                <p class="text-[11px] text-[#ff9900] mt-3 font-black uppercase tracking-[0.2em] italic">Cross-Region
                    Data Sync</p>
            </div>

            <div class="p-10 space-y-6 relative">
                <div class="space-y-3">
                    <label class="text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em] italic">Rule
                        Name</label>
                    <input type="text" v-model="newReplicationRule.name" placeholder="e.g. backup-to-us-east"
                        class="w-full px-6 py-4 bg-white border-2 border-[#eaeded] text-[14px] font-black uppercase italic tracking-tight text-[#232f3e] focus:border-[#ff9900] outline-none transition-all placeholder:text-[#eaeded] shadow-inner">
                </div>

                <div class="space-y-3">
                    <label
                        class="text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em] italic">Priority</label>
                    <input type="number" v-model.number="newReplicationRule.priority" placeholder="1" min="1" max="1000"
                        class="w-full px-6 py-4 bg-white border-2 border-[#eaeded] text-[14px] font-black uppercase italic tracking-tight text-[#232f3e] focus:border-[#ff9900] outline-none transition-all placeholder:text-[#eaeded] shadow-inner">
                    <p class="text-[10px] text-[#545b64] italic">Lower number = higher priority (1-1000)</p>
                </div>

                <div class="space-y-3">
                    <label
                        class="text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em] italic">Status</label>
                    <div class="flex gap-6">
                        <label
                            class="flex-1 flex items-center justify-center gap-4 p-6 border-2 cursor-pointer transition-all active:scale-95 group italic"
                            :class="newReplicationRule.status === 'Enabled' ? 'bg-[#ff9900] border-[#ff9900] text-[#232f3e] shadow-xl italic' : 'bg-white border-[#eaeded] text-[#545b64] hover:border-[#ff9900]/30 shadow-none'">
                            <input type="radio" v-model="newReplicationRule.status" value="Enabled" class="hidden">
                            <span class="text-xs font-black uppercase tracking-widest">{{ newReplicationRule.status ===
                                'Enabled' ? '● ENABLED' : 'ENABLE' }}</span>
                        </label>
                        <label
                            class="flex-1 flex items-center justify-center gap-4 p-6 border-2 cursor-pointer transition-all active:scale-95 group italic"
                            :class="newReplicationRule.status === 'Disabled' ? 'bg-[#232f3e] border-[#232f3e] text-white shadow-2xl italic' : 'bg-white border-[#eaeded] text-[#545b64] hover:border-[#ff9900]/30 shadow-none'">
                            <input type="radio" v-model="newReplicationRule.status" value="Disabled" class="hidden">
                            <span class="text-xs font-black uppercase tracking-widest">{{ newReplicationRule.status ===
                                'Disabled' ? '● DISABLED' : 'DISABLE' }}</span>
                        </label>
                    </div>
                </div>
            </div>

            <div class="p-10 border-t-2 border-[#eaeded] flex justify-end gap-6 bg-[#fafafa]">
                <button @click="activeModal = null"
                    class="px-10 py-3 font-black text-[#545b64] hover:text-[#ff9900] transition-colors text-xs uppercase tracking-widest italic active:scale-95"
                    :disabled="isSaving">Cancel</button>
                <button @click="handleAddReplicationRule" :disabled="isSaving"
                    class="px-12 py-3 font-black bg-[#232f3e] text-white hover:bg-black transition-all shadow-2xl text-xs uppercase tracking-widest italic active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3">
                    <svg v-if="isSaving" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg"
                        fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                    {{ isSaving ? 'Creating...' : 'Create Rule' }}
                </button>
            </div>
        </div>
    </div>

    <!-- Lifecycle Modal -->
    <div v-if="activeModal === 'lifecycle'"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#232f3e]/60 backdrop-blur-sm transition-all overflow-y-auto italic">
        <div
            class="bg-white border-4 border-[#232f3e] shadow-2xl w-full max-w-4xl flex flex-col my-8 overflow-hidden relative italic">
            <div class="p-10 border-b-2 border-[#eaeded] bg-[#fafafa]">
                <h2 class="text-4xl font-black text-[#232f3e] tracking-tighter uppercase italic">Lifecycle Rule
                    Architect</h2>
                <p class="text-[11px] text-[#545b64] mt-3 font-bold uppercase tracking-tight italic">Define JSON
                    Retention Protocols systematically.</p>
            </div>

            <div class="p-10 flex-1 relative">
                <div
                    class="border-4 border-[#232f3e] overflow-hidden flex flex-col h-[500px] bg-[#fafafa] shadow-inner font-mono">
                    <div class="bg-white p-6 border-b-2 border-[#eaeded] flex justify-between items-center italic">
                        <span class="text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em]">Rule Structure
                            Highlighter</span>
                        <div
                            class="text-[10px] text-[#ff9900] font-black bg-[#ff9900]/5 border-2 border-[#ff9900]/20 px-4 py-1.5 uppercase tracking-widest italic animate-pulse">
                            JSON Schema Active</div>
                    </div>
                    <textarea v-model="currentLifecycleJson" placeholder='{ "Rules": [...] }'
                        class="flex-1 p-10 text-[14px] text-[#232f3e] bg-transparent resize-none focus:outline-none leading-relaxed transition-colors placeholder:text-[#eaeded] custom-scrollbar selection:bg-[#ff9900]/30 italic"></textarea>
                </div>
            </div>

            <div class="p-10 border-t-2 border-[#eaeded] flex justify-end gap-6 bg-[#fafafa] relative">
                <button @click="activeModal = null"
                    class="px-10 py-3 font-black text-[#545b64] hover:text-[#ff9900] transition-colors text-xs uppercase tracking-widest italic active:scale-95">Cancel</button>
                <button @click="handleSaveLifecycle" :disabled="!currentLifecycleJson.trim()"
                    class="px-12 py-3 font-black bg-[#232f3e] text-white hover:bg-black transition-all shadow-2xl disabled:opacity-20 disabled:grayscale uppercase tracking-widest text-xs italic active:scale-95">Deploy
                    Rule</button>
            </div>
        </div>
    </div>

    <!-- Requester Pays Modal -->
    <div v-if="activeModal === 'requesterPays'"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#232f3e]/60 backdrop-blur-sm transition-all italic">
        <div class="bg-white border-4 border-[#232f3e] shadow-2xl w-full max-w-2xl overflow-hidden relative italic">
            <div class="p-10 border-b-2 border-[#eaeded] bg-[#fafafa]">
                <h2 class="text-4xl font-black text-[#232f3e] tracking-tighter uppercase italic">Billing Controller</h2>
                <p class="text-[11px] text-[#ff9900] mt-3 font-black uppercase tracking-[0.2em] italic">Cost
                    Transmission Governance</p>
            </div>

            <div class="p-10 space-y-6 relative">
                <label
                    class="flex items-center gap-8 p-10 border-2 cursor-pointer transition-all active:scale-[0.98] group italic"
                    :class="tempRequesterPays === 'Enabled' ? 'bg-[#ff9900] border-[#ff9900] text-[#232f3e] shadow-xl italic' : 'bg-white border-[#eaeded] text-[#545b64] hover:border-[#ff9900]/30 shadow-none'">
                    <div class="w-8 h-8 border-2 border-[#eaeded] flex items-center justify-center transition-all bg-white shrink-0"
                        :class="tempRequesterPays === 'Enabled' ? 'border-[#232f3e] bg-[#232f3e] shadow-xl' : 'group-hover:border-[#ff9900]/50'">
                        <div v-if="tempRequesterPays === 'Enabled'" class="w-4 h-4 bg-white rotate-45 animate-pulse">
                        </div>
                    </div>
                    <input type="radio" v-model="tempRequesterPays" value="Enabled" class="hidden">
                    <span class="text-2xl font-black uppercase italic tracking-tight">{{ tempRequesterPays === 'Enabled'
                        ? '● ENABLED' : 'ENABLE' }}</span>
                </label>

                <label
                    class="flex items-center gap-8 p-10 border-2 cursor-pointer transition-all active:scale-[0.98] group italic"
                    :class="tempRequesterPays === 'Disabled' ? 'bg-[#232f3e] border-[#232f3e] text-white shadow-2xl italic' : 'bg-white border-[#eaeded] text-[#545b64] hover:border-[#ff9900]/30 shadow-none'">
                    <div class="w-8 h-8 border-2 border-[#eaeded] flex items-center justify-center transition-all bg-white shrink-0"
                        :class="tempRequesterPays === 'Disabled' ? 'border-white bg-white' : 'group-hover:border-[#ff9900]/50'">
                        <div v-if="tempRequesterPays === 'Disabled'" class="w-4 h-4 bg-[#232f3e] rotate-45"></div>
                    </div>
                    <input type="radio" v-model="tempRequesterPays" value="Disabled" class="hidden">
                    <span class="text-2xl font-black uppercase italic tracking-tight">{{ tempRequesterPays ===
                        'Disabled' ? '● DISABLED' : 'DISABLE' }}</span>
                </label>
            </div>

            <div class="p-10 border-t-2 border-[#eaeded] flex justify-end gap-6 bg-[#fafafa]">
                <button @click="activeModal = null"
                    class="px-10 py-3 font-black text-[#545b64] hover:text-[#ff9900] transition-colors text-xs uppercase tracking-widest italic active:scale-95">Cancel</button>
                <button @click="handleSaveRequesterPays"
                    class="px-12 py-3 font-black bg-[#232f3e] text-white hover:bg-black transition-all shadow-2xl text-xs uppercase tracking-widest italic active:scale-95">Save
                    Changes</button>
            </div>
        </div>
    </div>

    <!-- Access Logging Modal -->
    <div v-if="activeModal === 'accessLogging'"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#232f3e]/60 backdrop-blur-sm transition-all italic">
        <div class="bg-white border-4 border-[#232f3e] shadow-2xl w-full max-w-2xl overflow-hidden relative italic">
            <div class="p-10 border-b-2 border-[#eaeded] bg-[#fafafa]">
                <h2 class="text-4xl font-black text-[#232f3e] tracking-tighter uppercase italic">Access Logs</h2>
                <p class="text-[11px] text-[#ff9900] mt-3 font-black uppercase tracking-[0.2em] italic">Audit Trail
                    Configuration</p>
            </div>

            <div class="p-10 space-y-6 relative">
                <div class="flex gap-8 mb-8">
                    <label
                        class="flex-1 flex items-center justify-center gap-4 p-8 border-2 cursor-pointer transition-all active:scale-95 group italic"
                        :class="tempAccessLogging.status === 'Enabled' ? 'bg-[#ff9900] border-[#ff9900] text-[#232f3e] shadow-xl italic' : 'bg-white border-[#eaeded] text-[#545b64] hover:border-[#ff9900]/30 shadow-none'">
                        <input type="radio" v-model="tempAccessLogging.status" value="Enabled" class="hidden">
                        <span class="text-xs font-black uppercase tracking-widest">{{ tempAccessLogging.status ===
                            'Enabled' ? '● ENABLED' : 'ENABLE' }}</span>
                    </label>
                    <label
                        class="flex-1 flex items-center justify-center gap-4 p-8 border-2 cursor-pointer transition-all active:scale-95 group italic"
                        :class="tempAccessLogging.status === 'Disabled' ? 'bg-[#232f3e] border-[#232f3e] text-white shadow-2xl italic' : 'bg-white border-[#eaeded] text-[#545b64] hover:border-[#ff9900]/30 shadow-none'">
                        <input type="radio" v-model="tempAccessLogging.status" value="Disabled" class="hidden">
                        <span class="text-xs font-black uppercase tracking-widest">{{ tempAccessLogging.status ===
                            'Disabled' ? '● DISABLED' : 'DISABLE' }}</span>
                    </label>
                </div>

                <div v-if="tempAccessLogging.status === 'Enabled'"
                    class="space-y-6 animate-in fade-in slide-in-from-top-2">
                    <div class="space-y-3">
                        <label class="text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em] italic">Target
                            Bucket</label>
                        <input type="text" v-model="tempAccessLogging.targetBucket" placeholder="e.g. my-logs-bucket"
                            class="w-full px-6 py-4 bg-white border-2 border-[#eaeded] text-[14px] font-black uppercase italic tracking-tight text-[#232f3e] focus:border-[#ff9900] outline-none transition-all placeholder:text-[#eaeded] shadow-inner">
                    </div>
                </div>
            </div>

            <div class="p-10 border-t-2 border-[#eaeded] flex justify-end gap-6 bg-[#fafafa]">
                <button @click="activeModal = null"
                    class="px-10 py-3 font-black text-[#545b64] hover:text-[#ff9900] transition-colors text-xs uppercase tracking-widest italic active:scale-95">Cancel</button>
                <button @click="handleSaveAccessLogging"
                    class="px-12 py-3 font-black bg-[#232f3e] text-white hover:bg-black transition-all shadow-2xl text-xs uppercase tracking-widest italic active:scale-95">Save
                    Changes</button>
            </div>
        </div>
    </div>

    <!-- Object Lock Modal (Updated) -->
    <div v-if="activeModal === 'objectLock'"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#232f3e]/60 backdrop-blur-sm transition-all italic">
        <div class="bg-white border-4 border-[#232f3e] shadow-2xl w-full max-w-2xl overflow-hidden relative italic">
            <div class="p-10 border-b-2 border-[#eaeded] bg-[#fafafa]">
                <h2 class="text-4xl font-black text-[#232f3e] tracking-tighter uppercase italic">WORM Protocol Shield
                </h2>
                <p class="text-[11px] text-rose-500 mt-3 font-black uppercase tracking-[0.2em] italic">Critical
                    Integrity Control</p>
            </div>

            <div class="p-10 relative">
                <!-- AWS Style Warning -->
                <div class="bg-rose-500/5 border-2 border-rose-500/20 p-8 mb-10 flex gap-8 italic">
                    <div
                        class="w-14 h-14 bg-white border-2 border-rose-500 flex items-center justify-center shrink-0 rotate-3 shadow-lg shadow-rose-500/10">
                        <svg class="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div class="text-[12px] text-rose-500 leading-relaxed font-black uppercase tracking-tight">
                        Object Lock cannot be disabled after activation. Enabling Object Lock also mandates the
                        activation of Bucket Versioning.
                        <a href="#"
                            class="text-[#ff9900] hover:underline transition-all font-black ml-2 italic transition-all">Doc
                            Layer ↗</a>
                    </div>
                </div>

                <div class="space-y-6">
                    <label
                        class="flex items-center gap-8 p-10 border-2 cursor-pointer transition-all active:scale-[0.98] group italic shadow-sm"
                        :class="tempObjectLock === 'Enabled' ? 'bg-[#ff9900] border-[#ff9900] text-[#232f3e] shadow-xl italic' : 'bg-white border-[#eaeded] text-[#545b64] hover:border-[#ff9900]/30 shadow-none'">
                        <div class="w-8 h-8 border-2 border-[#eaeded] flex items-center justify-center transition-all bg-white shrink-0"
                            :class="tempObjectLock === 'Enabled' ? 'border-[#232f3e] bg-[#232f3e]' : 'group-hover:border-[#ff9900]/50'">
                            <div v-if="tempObjectLock === 'Enabled'" class="w-4 h-4 bg-white rotate-45 animate-pulse">
                            </div>
                        </div>
                        <input type="radio" v-model="tempObjectLock" value="Enabled" class="hidden">
                        <span class="text-2xl font-black uppercase italic tracking-tight">{{ tempObjectLock ===
                            'Enabled' ? '● ACTIVATED' : 'ACTIVATE' }}</span>
                    </label>

                    <label
                        class="flex items-center gap-8 p-10 border-2 cursor-pointer transition-all active:scale-[0.98] group italic shadow-xl"
                        :class="tempObjectLock === 'Disabled' ? 'bg-[#232f3e] border-[#232f3e] text-white shadow-2xl italic' : 'bg-white border-[#eaeded] text-[#545b64] hover:border-[#ff9900]/30 shadow-none'">
                        <div class="w-8 h-8 border-2 border-[#eaeded] flex items-center justify-center transition-all bg-white shrink-0"
                            :class="tempObjectLock === 'Disabled' ? 'border-white bg-white' : 'group-hover:border-[#ff9900]/50'">
                            <div v-if="tempObjectLock === 'Disabled'" class="w-4 h-4 bg-[#232f3e] rotate-45"></div>
                        </div>
                        <input type="radio" v-model="tempObjectLock" value="Disabled" class="hidden">
                        <span class="text-2xl font-black uppercase italic tracking-tight">{{ tempObjectLock ===
                            'Disabled' ? '● DISABLED' : 'REMAIN DISABLED' }}</span>
                    </label>
                </div>
            </div>

            <div class="p-10 border-t-2 border-[#eaeded] flex justify-end gap-6 bg-[#fafafa]">
                <button @click="activeModal = null"
                    class="px-10 py-3 font-black text-[#545b64] hover:text-[#ff9900] transition-colors text-xs uppercase tracking-widest italic active:scale-95">Cancel</button>
                <button @click="handleSaveObjectLock"
                    class="px-12 py-3 font-black bg-[#232f3e] text-white hover:bg-black transition-all shadow-2xl text-xs uppercase tracking-widest italic active:scale-95">Commit
                    Shield</button>
            </div>
        </div>
    </div>


    <!-- Event Notification Modal -->
    <div v-if="activeModal === 'eventNotification'"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#232f3e]/60 backdrop-blur-sm transition-all italic">
        <div class="bg-white border-4 border-[#232f3e] shadow-2xl w-full max-w-2xl overflow-hidden relative italic">
            <div class="p-10 border-b-2 border-[#eaeded] bg-[#fafafa]">
                <h2 class="text-4xl font-black text-[#232f3e] tracking-tighter uppercase italic">Event Notification</h2>
                <p class="text-[11px] text-[#ff9900] mt-3 font-black uppercase tracking-[0.2em] italic">Real-Time Event
                    Streaming</p>
            </div>

            <div class="p-10 space-y-6 relative">
                <div class="space-y-3">
                    <label class="text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em] italic">Notification
                        Name</label>
                    <input type="text" v-model="newEventNotification.name"
                        placeholder="e.g. object-created-notification"
                        class="w-full px-6 py-4 bg-white border-2 border-[#eaeded] text-[14px] font-black uppercase italic tracking-tight text-[#232f3e] focus:border-[#ff9900] outline-none transition-all placeholder:text-[#eaeded] shadow-inner">
                </div>

                <div class="space-y-3">
                    <label class="text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em] italic">Event
                        Types</label>
                    <select v-model="newEventNotification.types[0]"
                        class="w-full px-6 py-4 bg-white border-2 border-[#eaeded] text-[14px] font-black uppercase italic tracking-tight text-[#232f3e] focus:border-[#ff9900] outline-none transition-all shadow-inner">
                        <option value="s3:ObjectCreated:*">s3:ObjectCreated:* (All create events)</option>
                        <option value="s3:ObjectCreated:Put">s3:ObjectCreated:Put</option>
                        <option value="s3:ObjectCreated:Post">s3:ObjectCreated:Post</option>
                        <option value="s3:ObjectCreated:Copy">s3:ObjectCreated:Copy</option>
                        <option value="s3:ObjectRemoved:*">s3:ObjectRemoved:* (All delete events)</option>
                        <option value="s3:ObjectRemoved:Delete">s3:ObjectRemoved:Delete</option>
                        <option value="s3:ObjectRestore:*">s3:ObjectRestore:* (All restore events)</option>
                        <option value="s3:ObjectRestore:Post">s3:ObjectRestore:Post</option>
                        <option value="s3:ObjectRestore:Completed">s3:ObjectRestore:Completed</option>
                    </select>
                </div>

                <div class="space-y-3">
                    <label class="text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em] italic">Destination
                        (ARN)</label>
                    <input type="text" v-model="newEventNotification.destination"
                        placeholder="e.g. arn:serw:sns:region:account:topic"
                        class="w-full px-6 py-4 bg-white border-2 border-[#eaeded] text-[14px] font-mono italic tracking-tight text-[#232f3e] focus:border-[#ff9900] outline-none transition-all placeholder:text-[#eaeded] shadow-inner">
                </div>
            </div>

            <div class="p-10 border-t-2 border-[#eaeded] flex justify-end gap-6 bg-[#fafafa]">
                <button @click="activeModal = null"
                    class="px-10 py-3 font-black text-[#545b64] hover:text-[#ff9900] transition-colors text-xs uppercase tracking-widest italic active:scale-95"
                    :disabled="isSaving">Cancel</button>
                <button @click="handleAddEventNotification" :disabled="isSaving"
                    class="px-12 py-3 font-black bg-[#232f3e] text-white hover:bg-black transition-all shadow-2xl text-xs uppercase tracking-widest italic active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3">
                    <svg v-if="isSaving" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg"
                        fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                    {{ isSaving ? 'Creating...' : 'Create Notification' }}
                </button>
            </div>
        </div>
    </div>

    <!-- Tags Modal (Updated) -->
    <div v-if="activeModal === 'tags'"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#232f3e]/60 backdrop-blur-sm transition-all overflow-y-auto italic">
        <div
            class="bg-white border-4 border-[#232f3e] shadow-2xl w-full max-w-4xl flex flex-col my-8 overflow-hidden relative italic">
            <div class="p-10 border-b-2 border-[#eaeded] bg-[#fafafa]">
                <h2 class="text-4xl font-black text-[#232f3e] tracking-tighter uppercase italic">Resource Tag Manager
                </h2>
                <p class="text-[11px] text-[#ff9900] mt-3 font-black uppercase tracking-[0.2em] italic">Metadata & Cost
                    Allocation Stratum</p>
            </div>

            <div class="p-10 space-y-8 relative max-h-[600px] overflow-y-auto custom-scrollbar italic">
                <div v-if="tempTags.length > 0" class="space-y-6">
                    <div v-for="(tag, index) in tempTags" :key="index"
                        class="flex gap-6 items-center p-8 bg-[#fafafa] border-2 border-[#eaeded] relative group italic">
                        <div class="absolute top-0 left-0 w-1 bg-[#ff9900] h-full"></div>
                        <div class="flex-1 space-y-3">
                            <label class="text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em] italic">Key
                                Node</label>
                            <input type="text" v-model="tag.key" placeholder="Enter Key..."
                                class="w-full px-6 py-4 bg-white border-2 border-[#eaeded] text-[14px] font-black uppercase italic tracking-tight text-[#232f3e] focus:border-[#ff9900] outline-none transition-all placeholder:text-[#eaeded] shadow-inner">
                        </div>
                        <div class="flex-1 space-y-3">
                            <label class="text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em] italic">Value
                                Association</label>
                            <input type="text" v-model="tag.value" placeholder="Enter Value..."
                                class="w-full px-6 py-4 bg-white border-2 border-[#eaeded] text-[14px] font-black uppercase italic tracking-tight text-[#232f3e] focus:border-[#ff9900] outline-none transition-all placeholder:text-[#eaeded] shadow-inner">
                        </div>
                        <button @click="handleRemoveTag(index)"
                            class="mt-8 w-14 h-14 flex items-center justify-center bg-white border-2 border-[#eaeded] text-[#eaeded] hover:text-rose-500 hover:border-rose-500 transition-all active:scale-95 italic">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M20 12H4" />
                            </svg>
                        </button>
                    </div>
                </div>

                <button @click="handleAddTag"
                    class="w-full py-6 border-4 border-dashed border-[#eaeded] text-[#545b64] hover:text-[#ff9900] hover:border-[#ff9900]/50 transition-all font-black uppercase tracking-widest text-[11px] italic bg-[#fafafa]/50">
                    + ADD NEW METADATA TAG
                </button>
            </div>

            <div class="p-10 border-t-2 border-[#eaeded] flex justify-end gap-6 bg-[#fafafa]">
                <button @click="activeModal = null"
                    class="px-10 py-3 font-black text-[#545b64] hover:text-[#ff9900] transition-colors text-xs uppercase tracking-widest italic active:scale-95"
                    :disabled="isSaving">Cancel</button>
                <button @click="handleSaveTags" :disabled="isSaving"
                    class="px-12 py-3 font-black bg-[#232f3e] text-white hover:bg-black transition-all shadow-2xl text-xs uppercase tracking-widest italic active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3">
                    <svg v-if="isSaving" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg"
                        fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                    {{ isSaving ? 'Saving...' : 'Sync Tags' }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #eaeded;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #ff9900;
}
</style>
