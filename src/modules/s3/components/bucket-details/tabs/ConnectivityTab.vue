<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import DeveloperQuickConnect from '../widgets/DeveloperQuickConnect.vue'
import SectionHeader from '../shared/SectionHeader.vue'
import InfoAlert from '../shared/InfoAlert.vue'
import EmptyState from '../shared/EmptyState.vue'
import { useS3Store } from '@/modules/s3/store/s3Store'
import { useToastStore } from '@/shared/store/toastStore'

const props = defineProps<{
    bucketName: string
}>()

const router = useRouter()
const s3Store = useS3Store()
const toastStore = useToastStore()

// State for Bucket Policies
const isEditPolicyModalOpen = ref(false)
const policyEditorMode = ref<'visual' | 'json'>('visual')
const isComplexPolicy = ref(false)
const currentPolicy = ref<any>(null)

// Visual Editor Fields
const policyForm = reactive({
    effect: 'Allow',
    principals: '*',
    actions: [] as string[],
    resources: `arn:serw:s3:::${props.bucketName}/*`
})

const availableActions = [
    's3:*',
    's3:GetObject',
    's3:PutObject',
    's3:DeleteObject',
    's3:ListBucket',
    's3:GetBucketLocation'
]

// Fetch policy on mount
const loadPolicy = async () => {
    const policy = await s3Store.fetchBucketPolicy(props.bucketName)
    if (policy) {
        currentPolicy.value = policy
        // Check complexity
        const statements = policy.Statement || []
        isComplexPolicy.value = statements.length > 1

        // If simple, map to form
        if (!isComplexPolicy.value && statements.length === 1) {
            const stmt = statements[0]
            policyForm.effect = stmt.Effect || 'Allow'
            policyForm.principals = stmt.Principal === '*' ? '*' : JSON.stringify(stmt.Principal)
            policyForm.actions = Array.isArray(stmt.Action) ? stmt.Action : [stmt.Action]
            policyForm.resources = Array.isArray(stmt.Resource) ? stmt.Resource[0] : stmt.Resource
        }
    }
}

const openPolicyEditor = () => {
    if (isComplexPolicy.value) {
        policyEditorMode.value = 'json'
    } else {
        policyEditorMode.value = 'visual'
    }
    isEditPolicyModalOpen.value = true
}

const resetToVisualEditor = () => {
    policyForm.effect = 'Allow'
    policyForm.principals = '*'
    policyForm.actions = []
    policyForm.resources = `arn:serw:s3:::${props.bucketName}/*`
    policyEditorMode.value = 'visual'
    isComplexPolicy.value = false
}

const handleSavePolicy = async () => {
    try {
        const flatPolicy = {
            version: '2012-10-17',
            effect: policyForm.effect,
            principals: policyForm.principals === '*' ? ['*'] : [policyForm.principals],
            actions: policyForm.actions,
            resources: [policyForm.resources],
            conditions: {}
        }

        await s3Store.updateBucketPolicy(props.bucketName, flatPolicy)
        await loadPolicy()
        isEditPolicyModalOpen.value = false
        toastStore.addToast('Bucket policy updated successfully.', 'success')
    } catch (e) {
        console.error(e)
        toastStore.addToast('Failed to update bucket policy.', 'error')
    }
}

const copyPolicy = (content: string) => {
    navigator.clipboard.writeText(content)
}

// State for Access Points
const isCreateAccessPointModalOpen = ref(false)
const accessPointForm = reactive({
    name: '',
    networkOrigin: 'internet' as 'internet' | 'vpc',
    vpcId: ''
})

const openCreateAccessPointModal = () => {
    accessPointForm.name = ''
    accessPointForm.networkOrigin = 'internet'
    accessPointForm.vpcId = ''
    isCreateAccessPointModalOpen.value = true
}

const handleCreateAccessPoint = async () => {
    try {
        const payload: any = {
            name: accessPointForm.name,
            networkOrigin: accessPointForm.networkOrigin
        }

        if (accessPointForm.networkOrigin === 'vpc' && accessPointForm.vpcId) {
            payload.vpcId = accessPointForm.vpcId
        }

        await s3Store.createAccessPoint(props.bucketName, payload)
        await loadAccessPoints() // Refresh the list
        isCreateAccessPointModalOpen.value = false
        toastStore.addToast('Access point created successfully.', 'success')
    } catch (e) {
        console.error(e)
        toastStore.addToast('Failed to create access point.', 'error')
    }
}

// Access Points List
const accessPoints = ref<any[]>([])
const isLoadingAccessPoints = ref(false)

const loadAccessPoints = async () => {
    isLoadingAccessPoints.value = true
    try {
        const points = await s3Store.fetchAccessPoints(props.bucketName)
        accessPoints.value = points || []

        // Sync blocked access point names based on their status from backend
        const blockedNames = accessPoints.value
            .filter(p => p.status?.toLowerCase() === 'blocked' || p.status?.toLowerCase() === 'denied')
            .map(p => p.name)

        blockPublicAccess.blockedAccessPointNames = blockedNames
        tempBlockPublicAccess.blockedAccessPointNames = [...blockedNames]
    } catch (e) {
        console.error('Failed to load access points:', e)
        accessPoints.value = []
    } finally {
        isLoadingAccessPoints.value = false
    }
}

// State for CORS Configuration
const isEditCorsModalOpen = ref(false)
const currentCorsJson = ref('')
const corsConfigs = ref<{ id: number; content: string }[]>([])

const handleSaveCors = async () => {
    try {
        const parsed = JSON.parse(currentCorsJson.value)
        // Ensure it's an array as expected by the backend prompt/store
        const rules = Array.isArray(parsed) ? parsed : [parsed]

        await s3Store.updateBucketCors(props.bucketName, rules)

        corsConfigs.value = [{ id: Date.now(), content: currentCorsJson.value }]
        isEditCorsModalOpen.value = false
        toastStore.addToast('CORS configuration updated successfully.', 'success')
    } catch (e) {
        console.error(e)
        if (e instanceof SyntaxError) {
            alert('Invalid JSON format for CORS configuration.')
        } else {
            toastStore.addToast('Failed to update CORS configuration.', 'error')
        }
    }
}

// Initial Fetch
onMounted(async () => {
    syncState()
    await loadPolicy()
    await loadAccessPoints()
    const cors = await s3Store.fetchBucketCors(props.bucketName)
    if (cors && cors.length > 0) {
        corsConfigs.value = [{ id: 1, content: JSON.stringify(cors, null, 4) }]
    } else {
        corsConfigs.value = []
    }
})

const copyCors = (content: string) => {
    navigator.clipboard.writeText(content)
}

// State for Block Public Access
const isEditBlockPublicModalOpen = ref(false)
const isSaving = ref(false)
const blockPublicAccess = reactive({
    blockAll: true,
    blockedAccessPointNames: [] as string[]
})
const tempBlockPublicAccess = reactive({
    blockAll: true,
    blockedAccessPointNames: [] as string[]
})

// Initial sync with store
const syncState = () => {
    const bucket = s3Store.currentBucket
    if (bucket?.settings?.block_public_access) {
        const bpa = bucket.settings.block_public_access
        // Mapping boolean flags to a main toggle (as simplified in UI)
        blockPublicAccess.blockAll = bpa.blockPublicPolicy && bpa.blockPublicAcls
        tempBlockPublicAccess.blockAll = blockPublicAccess.blockAll

        // We don't overwrite blockedAccessPointNames here because they are synced in loadAccessPoints
        // which has the granular status data.
        tempBlockPublicAccess.blockedAccessPointNames = [...blockPublicAccess.blockedAccessPointNames]
    }
}

watch(() => s3Store.currentBucket?.settings?.block_public_access, syncState, { deep: true })

const handleSaveBlockPublicAccess = async () => {
    isSaving.value = true
    try {
        // 1. Handle Master Block Status
        if (tempBlockPublicAccess.blockAll !== blockPublicAccess.blockAll) {
            await s3Store.updateBlockPublicAccess(props.bucketName, tempBlockPublicAccess.blockAll)
            blockPublicAccess.blockAll = tempBlockPublicAccess.blockAll
        }

        // 2. Handle Individual Access Point Changes
        // Only process individual changes if Master Block is OFF
        if (!tempBlockPublicAccess.blockAll) {
            // Find which ones were ADDED to blocked list (became blocked)
            const newlyBlocked = tempBlockPublicAccess.blockedAccessPointNames.filter(
                name => !blockPublicAccess.blockedAccessPointNames.includes(name)
            )

            // Find which ones were REMOVED from blocked list (became active)
            const newlyActive = blockPublicAccess.blockedAccessPointNames.filter(
                name => !tempBlockPublicAccess.blockedAccessPointNames.includes(name)
            )

            // Execute granular updates
            for (const name of newlyBlocked) {
                await s3Store.updateAccessPointStatus(props.bucketName, name, 'blocked')
            }
            for (const name of newlyActive) {
                await s3Store.updateAccessPointStatus(props.bucketName, name, 'active')
            }

            // Sync final state
            blockPublicAccess.blockedAccessPointNames = [...tempBlockPublicAccess.blockedAccessPointNames]
        }

        isEditBlockPublicModalOpen.value = false
        toastStore.addToast('Public access settings updated successfully.', 'success')

        // Final refresh to ensure everything is in sync
        await loadAccessPoints()
    } catch (e) {
        console.error(e)
        const errMsg = (e as any)?.response?.data?.message || 'Failed to update public access settings.'
        toastStore.addToast(errMsg, 'error')
    } finally {
        isSaving.value = false
    }
}
</script>

<template>
    <div class="space-y-12 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">

        <!-- Developer Quick Connect -->
        <DeveloperQuickConnect />

        <!-- Block Public Access -->
        <div class="bg-white border-2 border-[#eaeded] overflow-hidden shadow-sm">
            <SectionHeader title="Block public access (bucket settings)"
                description="Public access is granted to buckets and objects through access control lists (ACLs), bucket policies, access point policies, or all. <a href='#' class='text-[#ff9900] underline'>Learn more ↗</a>"
                :showEdit="true"
                @edit="isEditBlockPublicModalOpen = true; tempBlockPublicAccess.blockAll = blockPublicAccess.blockAll; tempBlockPublicAccess.blockedAccessPointNames = [...blockPublicAccess.blockedAccessPointNames]" />
            <div class="p-10 bg-[#fafafa]">
                <div class="border-2 border-[#eaeded] bg-white p-10 relative overflow-hidden group italic">
                    <div
                        class="absolute -bottom-10 -right-10 w-32 h-32 bg-[#ff9900]/5 rounded-full blur-3xl group-hover:bg-[#ff9900]/10 transition-all">
                    </div>

                    <h3
                        class="text-[12px] font-black text-[#545b64] mb-4 flex items-center gap-3 uppercase tracking-widest">
                        <div class="w-3 h-3 rotate-45 border-2"
                            :class="blockPublicAccess.blockAll ? 'bg-[#ff9900] border-[#ff9900] animate-pulse' : 'bg-rose-500 border-rose-500'">
                        </div>
                        Block all public access
                    </h3>

                    <p class="text-6xl font-black tracking-tighter transition-all uppercase italic"
                        :class="(blockPublicAccess.blockAll || blockPublicAccess.blockedAccessPointNames.length > 0) ? 'text-[#ff9900]' : 'text-rose-500'">
                        {{ (blockPublicAccess.blockAll || blockPublicAccess.blockedAccessPointNames.length > 0) ?
                            'Active' : 'Disabled' }}
                    </p>
                    <!-- Individual Access Points -->
                    <div>
                        <h4 class="text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em] mb-6 italic">
                            Individual Access Points</h4>

                        <!-- Loading State -->
                        <div v-if="isLoadingAccessPoints" class="text-center py-8">
                            <div
                                class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#eaeded] border-t-[#ff9900]">
                            </div>
                            <p class="mt-3 text-[10px] text-[#545b64] font-black uppercase tracking-widest">Loading...
                            </p>
                        </div>

                        <!-- Access Points List -->
                        <div v-else-if="accessPoints.length > 0" class="space-y-3">
                            <div v-for="point in accessPoints" :key="point.id || point.accessPointId"
                                class="flex items-center gap-4 p-4 bg-white border-2 border-[#eaeded] transition-all italic group"
                                :class="[
                                    (blockPublicAccess.blockAll || blockPublicAccess.blockedAccessPointNames.includes(point.name))
                                        ? 'border-rose-500/50 bg-rose-50/20'
                                        : 'hover:border-[#ff9900]/30'
                                ]">
                                <!-- Status indicator -->
                                <div class="w-5 h-5 border-2 border-[#eaeded] flex items-center justify-center transition-all bg-white"
                                    :class="[
                                        (blockPublicAccess.blockAll || blockPublicAccess.blockedAccessPointNames.includes(point.name))
                                            ? 'border-rose-500 bg-rose-500'
                                            : ''
                                    ]">
                                    <div v-if="(blockPublicAccess.blockAll || blockPublicAccess.blockedAccessPointNames.includes(point.name))"
                                        class="w-2.5 h-2.5 bg-white rotate-45"></div>
                                </div>

                                <div class="flex-1">
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <div class="text-sm font-black text-[#232f3e] uppercase">{{ point.name }}
                                            </div>
                                            <div
                                                class="text-[10px] text-[#545b64] font-bold uppercase tracking-wide mt-1">
                                                {{ point.networkOrigin }} endpoint
                                                <span v-if="point.vpcId" class="ml-2">• {{ point.vpcId }}</span>
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-3">
                                            <span class="text-[9px] font-black uppercase tracking-[0.2em] italic"
                                                :class="(blockPublicAccess.blockAll || blockPublicAccess.blockedAccessPointNames.includes(point.name)) ? 'text-rose-500' : 'text-green-600'">
                                                {{ (blockPublicAccess.blockAll ||
                                                    blockPublicAccess.blockedAccessPointNames.includes(point.name)) ?
                                                    'Access Denied' : 'Active' }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Empty State -->
                        <div v-else
                            class="text-[11px] text-[#545b64] bg-[#fafafa] p-6 border-2 border-dashed border-[#eaeded] uppercase font-bold tracking-widest">
                            No individual access points are currently blocked.
                        </div>
                    </div>

                    <div
                        class="flex items-center gap-3 mt-10 cursor-pointer group/link border-t-2 border-[#eaeded] pt-8">
                        <svg class="w-5 h-5 text-[#ff9900] group-hover/link:translate-x-1 transition-transform"
                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" />
                        </svg>
                        <span
                            class="text-[11px] text-[#ff9900] font-black uppercase tracking-[0.1em] group-hover:underline">Individual
                            Block Public Access settings for this bucket</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Access Points -->
        <div
            class="bg-white border-2 border-[#eaeded] overflow-hidden shadow-sm transition-all hover:border-[#ff9900]/30 italic">
            <div class="p-8 border-b-2 border-[#eaeded] flex justify-between items-center bg-[#fafafa]">
                <h2 class="text-3xl font-black text-[#232f3e] tracking-tighter uppercase italic">Access Points</h2>
                <button @click="openCreateAccessPointModal"
                    class="px-8 py-2.5 text-[11px] font-black bg-[#ff9900] text-[#232f3e] uppercase tracking-widest shadow-xl shadow-[#ff9900]/10 hover:bg-[#ff9900]/90 transition-all active:scale-95">
                    Create
                </button>
            </div>
            <div class="p-10">
                <!-- Loading State -->
                <div v-if="isLoadingAccessPoints" class="text-center py-16">
                    <div
                        class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#eaeded] border-t-[#ff9900]">
                    </div>
                    <p class="mt-4 text-[11px] text-[#545b64] font-black uppercase tracking-widest">Loading access
                        points...</p>
                </div>

                <!-- Empty State -->
                <EmptyState v-else-if="accessPoints.length === 0" title="No access points"
                    message="Access points simplify data access for any AWS service or customer application." />

                <!-- Access Points List -->
                <div v-else class="space-y-4">
                    <div v-for="point in accessPoints" :key="point.id || point.accessPointId"
                        class="border-2 border-[#eaeded] bg-[#fafafa] p-6 hover:border-[#ff9900]/30 transition-all">
                        <div class="flex items-center justify-between">
                            <div class="flex-1">
                                <h4 class="text-lg font-black text-[#232f3e] uppercase mb-2">{{ point.name }}</h4>
                                <div class="grid grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <span
                                            class="text-[#545b64] font-black uppercase tracking-widest opacity-40">Network:</span>
                                        <span class="ml-2 text-[#232f3e] font-bold">{{ point.networkOrigin }}</span>
                                    </div>
                                    <div v-if="point.vpcId">
                                        <span
                                            class="text-[#545b64] font-black uppercase tracking-widest opacity-40">VPC:</span>
                                        <span class="ml-2 text-[#232f3e] font-mono font-bold">{{ point.vpcId
                                        }}</span>
                                    </div>
                                    <div v-if="point.arn" class="col-span-2">
                                        <span
                                            class="text-[#545b64] font-black uppercase tracking-widest opacity-40">ARN:</span>
                                        <span class="ml-2 text-[#ff9900] font-mono text-[10px]">{{ point.arn
                                        }}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="ml-6">
                                <span
                                    v-if="blockPublicAccess.blockAll || point.status?.toLowerCase() === 'blocked' || point.status?.toLowerCase() === 'denied'"
                                    class="px-4 py-1.5 bg-rose-50 border-2 border-rose-200 text-rose-600 text-[10px] font-black uppercase tracking-widest">
                                    Blocked
                                </span>
                                <span v-else
                                    class="px-4 py-1.5 bg-green-50 border-2 border-green-200 text-green-600 text-[10px] font-black uppercase tracking-widest">
                                    Active
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Bucket Policy -->
        <div class="bg-white border-2 border-[#eaeded] overflow-hidden shadow-sm italic">
            <SectionHeader title="Bucket policy"
                description="The bucket policy, written in JSON, provides access to the objects stored in the bucket. <a href='#' class='text-[#ff9900] underline'>Learn more ↗</a>"
                :showEdit="true" @edit="openPolicyEditor" />
            <div class="p-10">
                <InfoAlert v-if="currentPolicy"
                    message="Review your bucket policy to ensure that it contains no public access." />

                <div v-if="currentPolicy" class="mt-10 space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    <div
                        class="border-2 bg-[#fafafa] overflow-hidden transition-all border-[#eaeded] hover:border-[#ff9900]/30">
                        <div class="flex items-center justify-between p-6 bg-white border-b-2 border-[#eaeded]">
                            <span class="text-[14px] font-black text-[#232f3e] tracking-tight uppercase">Current
                                Policy</span>
                            <button @click="copyPolicy(JSON.stringify(currentPolicy, null, 2))"
                                class="px-5 py-2 text-[10px] font-black bg-white border-2 border-[#eaeded] text-[#232f3e] hover:border-[#ff9900] transition-all uppercase tracking-widest flex items-center gap-3">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg> COPY JSON
                            </button>
                        </div>
                        <pre
                            class="p-10 text-[12px] font-mono text-[#232f3e] bg-[#fafafa] overflow-x-auto max-h-[400px] custom-scrollbar selection:bg-[#ff9900]/20"><code>{{ JSON.stringify(currentPolicy, null, 2) }}</code></pre>
                    </div>
                </div>

                <div v-else class="text-center py-16">
                    <div class="bg-[#fafafa] border-2 border-dashed border-[#eaeded] p-12 italic">
                        <p class="text-[11px] text-[#545b64] font-black uppercase tracking-widest italic">No policy to
                            display. Click "Edit" to add a bucket policy.</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- CORS -->
        <div class="bg-white border-2 border-[#eaeded] overflow-hidden shadow-sm transition-all italic">
            <SectionHeader title="Cross-origin resource sharing (CORS)"
                description="Define limits on how your bucket interacts with client web applications. <a href='#' class='text-[#ff9900] underline'>Learn more ↗</a>"
                :showEdit="true"
                @edit="isEditCorsModalOpen = true; currentCorsJson = corsConfigs?.[0]?.content ?? ''" />
            <div class="p-10">
                <div v-if="corsConfigs.length > 0" class="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    <div v-for="config in corsConfigs" :key="config.id" class="relative group">
                        <pre
                            class="p-10 text-[12px] font-mono text-[#232f3e] bg-[#fafafa] border-2 border-[#eaeded] overflow-x-auto max-h-[400px] custom-scrollbar transition-all group-hover:border-[#ff9900]/30 selection:bg-[#ff9900]/20"><code>{{ config.content }}</code></pre>
                        <button @click="copyCors(config.content)"
                            class="absolute top-8 right-8 px-8 py-3 bg-[#232f3e] text-white border-2 border-[#232f3e] text-[11px] font-black hover:bg-black transition-all flex items-center gap-3 shadow-2xl opacity-0 group-hover:opacity-100 uppercase tracking-widest">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg> COPY CORS
                        </button>
                    </div>
                </div>
                <div v-else>
                    <div class="bg-[#fafafa] border-2 border-dashed border-[#eaeded] p-12 text-center">
                        <p class="text-[11px] text-[#545b64] font-black uppercase tracking-widest italic">No
                            configurations to display. Click "Edit" to add a CORS configuration.</p>
                    </div>
                </div>
            </div>
        </div>


    </div>

    <!-- Modals (Modernized for Light Theme) -->


    <!-- Edit Bucket Policy Modal -->
    <div v-if="isEditPolicyModalOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#232f3e]/60 backdrop-blur-sm transition-all overflow-y-auto italic">
        <div
            class="bg-white border-4 border-[#232f3e] shadow-2xl w-full max-w-5xl flex flex-col my-8 overflow-hidden relative">
            <div class="p-10 border-b-2 border-[#eaeded] bg-[#fafafa] flex justify-between items-center">
                <div>
                    <h2 class="text-4xl font-black text-[#232f3e] tracking-tighter uppercase italic">Bucket Policy
                        Editor
                    </h2>
                    <p class="text-[11px] text-[#ff9900] mt-3 font-black uppercase tracking-[0.2em] italic">Access
                        Control
                        Configuration</p>
                </div>
                <div v-if="!isComplexPolicy" class="flex gap-2">
                    <button @click="policyEditorMode = 'visual'"
                        :class="policyEditorMode === 'visual' ? 'bg-[#ff9900] text-[#232f3e]' : 'bg-white text-[#545b64] border-2 border-[#eaeded]'"
                        class="px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all">
                        Visual Editor
                    </button>
                    <button @click="policyEditorMode = 'json'"
                        :class="policyEditorMode === 'json' ? 'bg-[#ff9900] text-[#232f3e]' : 'bg-white text-[#545b64] border-2 border-[#eaeded]'"
                        class="px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all">
                        JSON View
                    </button>
                </div>
            </div>

            <!-- Complex Policy Warning -->
            <div v-if="isComplexPolicy" class="p-6 bg-rose-50 border-b-2 border-rose-200">
                <div class="flex items-start gap-4">
                    <svg class="w-6 h-6 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div class="flex-1">
                        <h4 class="text-sm font-black text-rose-600 uppercase">Complex Policy Detected</h4>
                        <p class="text-xs text-rose-600 mt-1">This policy contains multiple statements. Visual Editor is
                            disabled. You can view the JSON or reset to create a new simple policy.</p>
                        <button @click="resetToVisualEditor"
                            class="mt-3 px-6 py-2 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all">
                            Reset & Use Visual Editor
                        </button>
                    </div>
                </div>
            </div>

            <div class="p-10">
                <!-- Visual Editor Mode -->
                <div v-if="policyEditorMode === 'visual' && !isComplexPolicy" class="space-y-6">
                    <!-- Effect -->
                    <div>
                        <label
                            class="block text-[11px] font-black text-[#545b64] uppercase tracking-widest mb-3">Effect</label>
                        <div class="flex gap-4">
                            <label class="flex items-center gap-3 cursor-pointer">
                                <input type="radio" v-model="policyForm.effect" value="Allow"
                                    class="w-5 h-5 text-[#ff9900]">
                                <span class="text-sm font-bold">Allow</span>
                            </label>
                            <label class="flex items-center gap-3 cursor-pointer">
                                <input type="radio" v-model="policyForm.effect" value="Deny"
                                    class="w-5 h-5 text-[#ff9900]">
                                <span class="text-sm font-bold">Deny</span>
                            </label>
                        </div>
                    </div>

                    <!-- Principal -->
                    <div>
                        <label
                            class="block text-[11px] font-black text-[#545b64] uppercase tracking-widest mb-3">Principal</label>
                        <input v-model="policyForm.principals" type="text" placeholder="* (everyone) or specific ARN"
                            class="w-full px-4 py-3 border-2 border-[#eaeded] focus:border-[#ff9900] focus:outline-none font-mono text-sm">
                    </div>

                    <!-- Actions -->
                    <div>
                        <label
                            class="block text-[11px] font-black text-[#545b64] uppercase tracking-widest mb-3">Actions</label>
                        <div class="grid grid-cols-2 gap-3">
                            <label v-for="action in availableActions" :key="action"
                                class="flex items-center gap-3 cursor-pointer p-3 border-2 border-[#eaeded] hover:border-[#ff9900]/30 transition-all"
                                :class="policyForm.actions.includes(action) ? 'border-[#ff9900] bg-[#ff9900]/5' : ''">
                                <input type="checkbox" :value="action" v-model="policyForm.actions" class="w-4 h-4">
                                <span class="text-xs font-mono">{{ action }}</span>
                            </label>
                        </div>
                    </div>

                    <!-- Resource -->
                    <div>
                        <label
                            class="block text-[11px] font-black text-[#545b64] uppercase tracking-widest mb-3">Resource
                            ARN</label>
                        <input v-model="policyForm.resources" type="text" placeholder="arn:serw:s3:::bucket-name/*"
                            class="w-full px-4 py-3 border-2 border-[#eaeded] focus:border-[#ff9900] focus:outline-none font-mono text-sm">
                    </div>
                </div>

                <!-- JSON View Mode -->
                <div v-else
                    class="border-4 border-[#232f3e] overflow-hidden flex flex-col h-[500px] bg-[#fafafa] shadow-inner">
                    <div class="bg-white p-6 border-b-2 border-[#eaeded] flex justify-between items-center italic">
                        <span class="text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em]">Read-Only JSON
                            View</span>
                        <div
                            class="text-[10px] text-rose-500 font-black bg-rose-50 border-2 border-rose-200 px-4 py-1.5 uppercase tracking-widest italic">
                            {{ isComplexPolicy ? 'Complex Policy' : 'JSON Mode' }}
                        </div>
                    </div>
                    <pre
                        class="flex-1 p-10 font-mono text-[14px] text-[#232f3e] bg-transparent overflow-auto custom-scrollbar selection:bg-[#ff9900]/30">{{ JSON.stringify(currentPolicy, null, 2) }}</pre>
                </div>
            </div>

            <div class="p-10 border-t-2 border-[#eaeded] flex justify-end gap-6 bg-[#fafafa]">
                <button @click="isEditPolicyModalOpen = false"
                    class="px-10 py-3 font-black text-[#545b64] hover:text-[#ff9900] transition-colors text-xs uppercase tracking-widest italic active:scale-95">
                    Cancel
                </button>
                <button v-if="policyEditorMode === 'visual' && !isComplexPolicy" @click="handleSavePolicy"
                    :disabled="policyForm.actions.length === 0"
                    class="px-12 py-3 font-black bg-[#232f3e] text-white hover:bg-black transition-all shadow-2xl disabled:opacity-20 disabled:grayscale uppercase tracking-widest text-xs italic active:scale-95">
                    Deploy Policy
                </button>
            </div>
        </div>
    </div>

    <!-- Edit Block Public Access Modal -->
    <div v-if="isEditBlockPublicModalOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#232f3e]/40 backdrop-blur-md transition-all duration-500 overflow-y-auto italic">
        <div
            class="bg-white shadow-[0_32px_128px_-16px_rgba(35,47,62,0.25)] w-full max-w-2xl flex flex-col my-8 overflow-hidden relative border border-[#eaeded] transform animate-in fade-in zoom-in-95 duration-500">

            <!-- Header -->
            <div class="p-12 border-b border-[#eaeded] bg-white relative overflow-hidden">
                <div class="absolute top-0 right-0 w-64 h-64 bg-[#ff9900]/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <h2
                    class="text-[42px] font-black text-[#232f3e] tracking-[-0.04em] leading-none uppercase italic relative z-10">
                    Public Access Guard
                </h2>
                <div class="flex items-center gap-4 mt-4 relative z-10">
                    <div class="h-[2px] w-12 bg-[#ff9900]"></div>
                    <p class="text-[10px] text-[#ff9900] font-black uppercase tracking-[0.4em] italic">System Security
                        Backbone</p>
                </div>
            </div>

            <div class="p-12 space-y-12">
                <!-- Warning Alert -->
                <div
                    class="bg-rose-50/50 border-l-4 border-rose-500 p-8 flex gap-8 group transition-all duration-300 hover:bg-rose-50">
                    <div
                        class="w-12 h-12 bg-white border border-rose-200 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-500">
                        <svg class="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <p class="text-[13px] text-rose-600 leading-relaxed font-bold uppercase tracking-tight italic">
                        Blocking all public access provides a strong security boundary. Turning this off might expose
                        your data to the wider web.
                    </p>
                </div>

                <div class="space-y-10">
                    <!-- Main Toggle -->
                    <label
                        class="flex items-start gap-8 p-10 border border-[#eaeded] bg-[#fafafa] cursor-pointer group transition-all duration-500 hover:border-[#ff9900]/40 hover:bg-white active:scale-[0.98] italic"
                        :class="{ 'border-[#ff9900] bg-white shadow-xl shadow-[#ff9900]/5': tempBlockPublicAccess.blockAll }">
                        <div class="mt-1">
                            <div class="w-8 h-8 border-2 border-[#eaeded] flex items-center justify-center transition-all bg-white relative group-hover:border-[#ff9900]/30"
                                :class="tempBlockPublicAccess.blockAll ? 'border-[#ff9900] !bg-[#ff9900]' : ''">
                                <div v-if="tempBlockPublicAccess.blockAll" class="w-3 h-3 bg-white rotate-45 scale-110">
                                </div>
                            </div>
                            <input type="checkbox" v-model="tempBlockPublicAccess.blockAll" class="hidden">
                        </div>
                        <div>
                            <p class="text-2xl font-black text-[#232f3e] mb-2 uppercase tracking-tighter italic transition-colors"
                                :class="tempBlockPublicAccess.blockAll ? 'text-[#ff9900]' : ''">
                                Block all public access
                            </p>
                            <p
                                class="text-[11px] text-[#545b64] leading-relaxed font-bold uppercase tracking-widest italic opacity-60">
                                Recommended. Turning this on will override any other policies that grant public access.
                            </p>
                        </div>
                    </label>

                    <div class="pt-10 border-t border-[#eaeded]">
                        <div class="flex items-center justify-between mb-8">
                            <h4 class="text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em] italic">
                                Individual Access Points</h4>
                            <div v-if="tempBlockPublicAccess.blockAll"
                                class="px-3 py-1 bg-[#ff9900]/10 border border-[#ff9900]/20 text-[#ff9900] text-[9px] font-black uppercase tracking-widest animate-pulse">
                                Master Override Active
                            </div>
                        </div>

                        <div class="grid grid-cols-1 gap-4 max-h-[350px] overflow-y-auto pr-6 custom-scrollbar">
                            <label v-for="ap in accessPoints" :key="ap.id || ap.accessPointId"
                                class="flex items-center justify-between p-6 border-2 bg-white cursor-pointer transition-all duration-300 group relative overflow-hidden"
                                :class="[
                                    tempBlockPublicAccess.blockAll
                                        ? 'bg-gray-100/50 opacity-60 cursor-not-allowed border-[#eaeded]'
                                        : (tempBlockPublicAccess.blockedAccessPointNames.includes(ap.name)
                                            ? 'border-rose-500 bg-rose-50/20 shadow-sm'
                                            : 'border-[#eaeded] hover:border-[#ff9900]/40 hover:bg-[#ff9900]/5')
                                ]">
                                <div class="flex items-center gap-6 z-10 w-full">

                                    <!-- Custom Checkbox Container -->
                                    <div class="relative w-8 h-8 flex items-center justify-center border-2 transition-all duration-300 rounded-sm"
                                        :class="[
                                            tempBlockPublicAccess.blockAll
                                                ? 'border-gray-300 bg-gray-200'
                                                : (tempBlockPublicAccess.blockedAccessPointNames.includes(ap.name)
                                                    ? 'border-rose-500 bg-rose-500'
                                                    : 'border-[#eaeded] bg-white group-hover:border-[#ff9900]/60')
                                        ]">
                                        <!-- White Checkmark / Diamond -->
                                        <div v-if="(tempBlockPublicAccess.blockAll || tempBlockPublicAccess.blockedAccessPointNames.includes(ap.name))"
                                            class="w-3.5 h-3.5 bg-white rotate-45 shadow-sm transition-all duration-300">
                                        </div>

                                        <!-- Native Checkbox (Completely Hidden but functionally active) -->
                                        <input type="checkbox" :value="ap.name"
                                            v-model="tempBlockPublicAccess.blockedAccessPointNames"
                                            :disabled="tempBlockPublicAccess.blockAll"
                                            class="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                                    </div>

                                    <!-- Text Content -->
                                    <div class="flex-1">
                                        <div class="flex items-center justify-between">
                                            <div>
                                                <p class="text-sm font-black uppercase tracking-tight transition-colors"
                                                    :class="tempBlockPublicAccess.blockAll
                                                        ? 'text-gray-400'
                                                        : 'text-[#232f3e]'">
                                                    {{ ap.name }}
                                                </p>
                                                <div class="flex items-center gap-3 mt-1">
                                                    <span
                                                        class="text-[9px] font-black uppercase tracking-widest transition-colors"
                                                        :class="tempBlockPublicAccess.blockAll
                                                            ? 'text-gray-400'
                                                            : 'text-[#545b64]'">
                                                        {{ ap.networkOrigin }} endpoint
                                                    </span>
                                                </div>
                                            </div>

                                            <div class="flex items-center gap-3">
                                                <span
                                                    v-if="(tempBlockPublicAccess.blockAll || tempBlockPublicAccess.blockedAccessPointNames.includes(ap.name))"
                                                    class="text-[9px] text-rose-500 font-black uppercase tracking-[0.2em] bg-rose-500/10 px-3 py-1 border border-rose-500/20 italic">
                                                    Blocked
                                                </span>
                                                <span v-else
                                                    class="text-[9px] text-green-600 font-black uppercase tracking-[0.2em] bg-green-500/10 px-3 py-1 border border-green-500/20 italic">
                                                    Active
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </label>
                        </div>

                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="p-10 bg-[#fafafa] border-t border-[#eaeded] flex justify-end gap-8">
                <button @click="isEditBlockPublicModalOpen = false"
                    class="px-8 py-3 font-black text-[#545b64] hover:text-[#ff9900] transition-all text-[11px] uppercase tracking-widest italic group">
                    <span
                        class="inline-block group-hover:-translate-x-1 transition-transform duration-300">Cancel</span>
                </button>
                <button @click="handleSaveBlockPublicAccess"
                    class="px-14 py-4 font-black bg-[#232f3e] text-white hover:bg-black transition-all shadow-xl hover:shadow-black/20 text-[11px] uppercase tracking-[0.2em] italic transform active:scale-95">
                    Update Security
                </button>
            </div>
        </div>
    </div>

    <!-- Edit CORS Modal -->
    <div v-if="isEditCorsModalOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#232f3e]/60 backdrop-blur-sm transition-all overflow-y-auto italic">
        <div
            class="bg-white border-4 border-[#232f3e] shadow-2xl w-full max-w-4xl flex flex-col my-8 overflow-hidden relative">
            <div class="p-10 border-b-2 border-[#eaeded] bg-[#fafafa]">
                <h2 class="text-4xl font-black text-[#232f3e] tracking-tighter uppercase italic">CORS Configuration
                </h2>
                <p class="text-[11px] text-[#ff9900] mt-3 font-black uppercase tracking-[0.2em] italic">Cross-Origin
                    Resource Sharing Definition</p>
            </div>

            <div class="p-10">
                <div
                    class="border-4 border-[#232f3e] overflow-hidden flex flex-col h-[500px] bg-[#fafafa] shadow-inner">
                    <div class="bg-white p-6 border-b-2 border-[#eaeded] flex justify-between items-center italic">
                        <span class="text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em]">Live Syntax
                            Highlighter</span>
                        <div
                            class="text-[10px] text-[#ff9900] font-black bg-[#ff9900]/5 border-2 border-[#ff9900]/20 px-4 py-1.5 uppercase tracking-widest italic animate-pulse">
                            JSON Mode</div>
                    </div>
                    <textarea v-model="currentCorsJson"
                        placeholder='[ { "AllowedHeaders": ["*"], "AllowedMethods": ["GET"], "AllowedOrigins": ["*"], "ExposeHeaders": [] } ]'
                        class="flex-1 p-10 font-mono text-[14px] text-[#232f3e] bg-transparent resize-none focus:outline-none leading-relaxed transition-colors placeholder:text-[#eaeded] custom-scrollbar selection:bg-[#ff9900]/30"></textarea>
                </div>

                <div class="mt-10 bg-[#fafafa] border-2 border-[#eaeded] p-8 flex gap-8 items-start italic">
                    <div
                        class="w-14 h-14 bg-white border-2 border-[#eaeded] flex items-center justify-center shrink-0 rotate-3 shadow-lg shadow-black/5">
                        <svg class="w-8 h-8 text-[#ff9900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                    </div>
                    <div>
                        <h4 class="text-xl font-black text-[#232f3e] mb-2 uppercase tracking-tight italic">Web Access
                            Architecture</h4>
                        <p class="text-[12px] text-[#545b64] leading-relaxed font-bold uppercase tracking-tight">
                            Configure how web applications in other domains interact with your bucket. <a href="#"
                                class="text-[#ff9900] hover:underline font-black transition-colors ml-2 italic">CORS
                                Guide ↗</a>
                        </p>
                    </div>
                </div>
            </div>

            <div class="p-10 border-t-2 border-[#eaeded] flex justify-end gap-6 bg-[#fafafa]">
                <button @click="isEditCorsModalOpen = false"
                    class="px-10 py-3 font-black text-[#545b64] hover:text-[#ff9900] transition-colors text-xs uppercase tracking-widest italic active:scale-95">
                    Cancel
                </button>
                <button @click="handleSaveCors" :disabled="!currentCorsJson.trim()"
                    class="px-12 py-3 font-black bg-[#232f3e] text-white hover:bg-black transition-all shadow-2xl disabled:opacity-20 disabled:grayscale uppercase tracking-widest text-xs italic active:scale-95">
                    Deploy CORS
                </button>
            </div>
        </div>
    </div>

    <!-- Create Access Point Modal -->
    <div v-if="isCreateAccessPointModalOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#232f3e]/60 backdrop-blur-sm transition-all overflow-y-auto italic">
        <div
            class="bg-white border-4 border-[#232f3e] shadow-2xl w-full max-w-3xl flex flex-col my-8 overflow-hidden relative">
            <div class="p-10 border-b-2 border-[#eaeded] bg-[#fafafa]">
                <h2 class="text-4xl font-black text-[#232f3e] tracking-tighter uppercase italic">New <span
                        class="text-[#ff9900]">Access Point</span></h2>
                <p class="text-[11px] text-[#ff9900] mt-3 font-black uppercase tracking-[0.2em] italic">Secure Network
                    Endpoint Configuration</p>
            </div>

            <div class="p-10 space-y-8">
                <!-- Properties Section -->
                <div>
                    <h3 class="text-xl font-black text-[#232f3e] uppercase tracking-tighter mb-6 italic">Properties</h3>
                    <div class="grid grid-cols-2 gap-6 mb-6">
                        <div>
                            <label
                                class="block text-[10px] font-black uppercase tracking-[0.4em] text-[#545b64] mb-2 opacity-40">AWS
                                Region</label>
                            <p class="text-[15px] font-black text-[#232f3e] uppercase">Europe (Stockholm) eu-north-1</p>
                        </div>
                        <div>
                            <label
                                class="block text-[10px] font-black uppercase tracking-[0.4em] text-[#545b64] mb-2 opacity-40">Target
                                Bucket</label>
                            <p class="text-[15px] font-black text-[#ff9900] uppercase">{{ bucketName }}</p>
                        </div>
                    </div>

                    <div>
                        <label
                            class="block text-[10px] font-black uppercase tracking-[0.4em] text-[#545b64] mb-3 opacity-40">Access
                            Point Alias</label>
                        <input v-model="accessPointForm.name" type="text" placeholder="e.g. data-lake-endpoint"
                            class="w-full bg-[#fafafa] border-2 border-[#eaeded] px-6 py-3 text-lg font-black italic uppercase tracking-tighter text-[#232f3e] focus:border-[#ff9900] outline-none transition-all placeholder:text-[#eaeded]">
                    </div>
                </div>

                <!-- Network Origin Section -->
                <div>
                    <h3 class="text-xl font-black text-[#232f3e] uppercase tracking-tighter mb-6 italic">Network Origin
                    </h3>
                    <div class="grid grid-cols-2 gap-4">
                        <label class="relative cursor-pointer group">
                            <input type="radio" value="internet" v-model="accessPointForm.networkOrigin"
                                class="peer sr-only">
                            <div
                                class="p-6 border-2 border-[#eaeded] bg-[#fafafa] peer-checked:border-[#ff9900] peer-checked:bg-[#ff9900]/5 transition-all">
                                <h4 class="text-sm font-black text-[#232f3e] uppercase mb-1">Internet</h4>
                                <p class="text-[10px] text-[#545b64] font-black uppercase tracking-widest opacity-40">
                                    Global gateway access</p>
                            </div>
                        </label>
                        <label class="relative cursor-pointer group">
                            <input type="radio" value="vpc" v-model="accessPointForm.networkOrigin"
                                class="peer sr-only">
                            <div
                                class="p-6 border-2 border-[#eaeded] bg-[#fafafa] peer-checked:border-[#ff9900] peer-checked:bg-[#ff9900]/5 transition-all">
                                <h4 class="text-sm font-black text-[#232f3e] uppercase mb-1">VPC Only</h4>
                                <p class="text-[10px] text-[#545b64] font-black uppercase tracking-widest opacity-40">
                                    Closed network isolation</p>
                            </div>
                        </label>
                    </div>

                    <!-- VPC ID Input -->
                    <div v-if="accessPointForm.networkOrigin === 'vpc'"
                        class="mt-6 animate-in fade-in slide-in-from-top-4">
                        <label
                            class="block text-[10px] font-black uppercase tracking-[0.4em] text-[#545b64] mb-3 opacity-40">Virtual
                            Private Cloud ID</label>
                        <input v-model="accessPointForm.vpcId" type="text" placeholder="vpc-00000000"
                            class="w-full bg-[#fafafa] border-2 border-[#eaeded] px-6 py-3 text-lg font-black italic uppercase tracking-tighter text-[#232f3e] focus:border-[#ff9900] outline-none">
                    </div>
                </div>
            </div>

            <div class="p-10 border-t-2 border-[#eaeded] flex justify-end gap-6 bg-[#fafafa]">
                <button @click="isCreateAccessPointModalOpen = false"
                    class="px-10 py-3 font-black text-[#545b64] hover:text-[#ff9900] transition-colors text-xs uppercase tracking-widest italic active:scale-95">
                    Discard Config
                </button>
                <button @click="handleCreateAccessPoint" :disabled="!accessPointForm.name"
                    class="px-12 py-3 font-black bg-[#232f3e] text-white hover:bg-black transition-all shadow-2xl disabled:opacity-20 disabled:grayscale uppercase tracking-widest text-xs italic active:scale-95 flex items-center gap-3">
                    <span>Instantiate Point</span>
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
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
