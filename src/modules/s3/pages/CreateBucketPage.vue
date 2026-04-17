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
const region = ref('Nairobi (Kenya) ke-nbo-a')
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
        const response = await apiClient.post('/s3/buckets/create-bucket', bucketData)
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
    <div
        class="min-h-screen bg-white text-[#232f3e] pb-32 font-urbanist relative overflow-hidden selection:bg-[#ff9900]/30 selection:text-[#232f3e]">
        <!-- Subtle Grid -->
        <div
            class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none [mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)]">
        </div>

        <ChooseBucketModal :is-open="showChooseBucketModal" @close="showChooseBucketModal = false"
            @select="handleBucketSelection" />

        <!-- Top Navigation / Breadcrumbs -->
        <div
            class="relative z-10 border-b-2 border-[#eaeded] bg-white/80 backdrop-blur-md px-8 md:px-24 py-4 flex items-center gap-3 text-[10px] uppercase font-black tracking-widest text-[#545b64]">
            <span class="hover:text-[#ff9900] cursor-pointer transition-colors italic">S3 Storage</span>
            <span class="text-[#eaeded]">/</span>
            <span class="hover:text-[#ff9900] cursor-pointer transition-colors italic">Buckets</span>
            <span class="text-[#eaeded]">/</span>
            <span class="text-[#ff9900] italic">Create bucket</span>
        </div>

        <div class="relative z-10 max-w-[1800px] mx-auto pt-24 px-8 md:px-24">
            <div class="mb-16">
                <div
                    class="inline-flex items-center gap-2 mb-6 px-4 py-1.5 bg-[#ff9900]/5 border border-[#ff9900]/20 text-[#ff9900] text-[10px] font-black tracking-[0.2em] uppercase">
                    <span class="w-1.5 h-1.5 bg-[#ff9900] animate-ping"></span>
                    Provisioning Bucket
                </div>
                <h1 class="text-4xl md:text-6xl font-black text-[#232f3e] tracking-tighter mb-6 uppercase italic">
                    Create <span class="text-[#ff9900]">bucket</span>
                </h1>
                <p class="text-[#545b64] text-sm max-w-xl leading-relaxed font-medium">
                    Buckets are containers for data stored in S3. Configure your storage parameters below to deploy your
                    hyper-scale fleet.
                </p>
            </div>

            <div class="space-y-12">
                <!-- General Configuration -->
                <section class="bg-white p-10 border-2 border-[#eaeded] relative overflow-hidden shadow-sm">
                    <div class="flex items-center gap-4 mb-10">
                        <div
                            class="w-10 h-10 bg-[#fafafa] border border-[#eaeded] flex items-center justify-center text-[#ff9900]">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                        </div>
                        <h2 class="text-lg font-black text-[#232f3e] uppercase tracking-widest italic">General
                            configuration</h2>
                    </div>

                    <div class="grid gap-12">
                        <div class="grid md:grid-cols-2 gap-12">
                            <div>
                                <label class="input-label">AWS Region</label>
                                <div
                                    class="p-4 bg-[#fafafa] border-2 border-[#eaeded] text-[#232f3e] text-sm font-black uppercase tracking-tight italic">
                                    {{ region }}
                                </div>
                            </div>
                            <div>
                                <label class="input-label italic flex justify-between">
                                    Bucket type
                                    <span class="text-[#ff9900] cursor-help hover:underline not-italic">Info</span>
                                </label>
                                <div class="flex gap-6">
                                    <label class="flex-1 p-6 border-2 transition-all cursor-pointer group"
                                        :class="bucketType === 'General purpose' ? 'border-[#ff9900] bg-[#ff9900]/5' : 'border-[#eaeded] bg-white hover:border-[#ff9900]/30'">
                                        <input type="radio" v-model="bucketType" value="General purpose" class="hidden">
                                        <div class="flex flex-col gap-2">
                                            <span class="text-xs font-black uppercase tracking-widest italic"
                                                :class="bucketType === 'General purpose' ? 'text-[#ff9900]' : 'text-[#232f3e]'">General
                                                purpose</span>
                                            <span class="text-[10px] font-medium"
                                                :class="bucketType === 'General purpose' ? 'text-[#ff9900]/70' : 'text-[#545b64]'">High
                                                availability, low-latency</span>
                                        </div>
                                    </label>
                                    <label
                                        class="flex-1 p-6 border-2 border-[#eaeded] bg-[#fafafa] opacity-40 cursor-not-allowed">
                                        <div class="flex flex-col gap-2">
                                            <span
                                                class="text-xs font-black text-[#545b64] uppercase tracking-widest italic">Directory</span>
                                            <span class="text-[10px] text-[#879196] font-medium text-nowrap">Single
                                                Availability Zone</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label class="input-label italic flex justify-between">
                                Bucket name
                                <span class="text-[#ff9900] cursor-help hover:underline not-italic">Info</span>
                            </label>
                            <input v-model="bucketName" type="text" placeholder="amzn-s3-demo-bucket"
                                class="input-field italic">
                            <p class="text-[10px] text-[#879196] mt-3 font-medium px-1">Unique global namespace: a-z,
                                0-9, periods (.), and hyphens (-).</p>
                        </div>

                        <div>
                            <label class="input-label italic">Copy settings from existing bucket</label>
                            <button @click="showChooseBucketModal = true"
                                class="px-6 py-3 bg-white border-2 border-[#eaeded] text-[#232f3e] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#ff9900] hover:text-white hover:border-[#ff9900] transition-all transform active:scale-95">
                                Choose bucket &rarr;
                            </button>
                        </div>
                    </div>
                </section>

                <!-- Object Ownership -->
                <section class="bg-white p-10 border-2 border-[#eaeded] shadow-sm">
                    <div class="flex items-center gap-4 mb-8">
                        <div
                            class="w-10 h-10 bg-[#fafafa] border border-[#eaeded] flex items-center justify-center text-[#ff9900]">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h2 class="text-lg font-black text-[#232f3e] uppercase tracking-widest italic">Object Ownership
                        </h2>
                    </div>
                    <p class="text-sm text-[#545b64] mb-10 leading-relaxed font-medium max-w-2xl">Control ownership of
                        objects written to this bucket and the use of access control lists (ACLs).</p>

                    <div class="grid md:grid-cols-2 gap-6">
                        <label v-for="option in ['ACLs disabled', 'ACLs enabled']" :key="option"
                            class="p-6 border-2 transition-all cursor-pointer group"
                            :class="objectOwnership === option ? 'border-[#ff9900] bg-[#ff9900]/5' : 'border-[#eaeded] bg-white hover:border-[#ff9900]/30'">
                            <input type="radio" v-model="objectOwnership" :value="option" class="hidden">
                            <div class="flex items-start gap-5">
                                <div class="w-5 h-5 border-2 mt-0.5 flex items-center justify-center transition-all"
                                    :class="objectOwnership === option ? 'border-[#ff9900] bg-[#ff9900]' : 'border-[#eaeded] bg-[#fafafa]'">
                                    <div v-if="objectOwnership === option" class="w-1.5 h-1.5 bg-white"></div>
                                </div>
                                <div class="flex flex-col gap-1.5">
                                    <p class="text-sm font-black uppercase tracking-widest italic"
                                        :class="objectOwnership === option ? 'text-[#ff9900]' : 'text-[#232f3e]'">{{
                                            option }}</p>
                                    <p class="text-[11px] font-medium leading-relaxed"
                                        :class="objectOwnership === option ? 'text-[#ff9900]/70' : 'text-[#545b64]'">{{
                                            option === 'ACLs disabled' ? 'Recommended. All objects owned by this account.' :
                                                'Multiple account ownership supported.' }}</p>
                                </div>
                            </div>
                        </label>
                    </div>
                </section>

                <!-- Block Public Access -->
                <section class="bg-white p-10 border-2 border-[#eaeded] shadow-sm">
                    <div class="flex items-center gap-4 mb-8">
                        <div
                            class="w-10 h-10 bg-[#fafafa] border border-[#eaeded] flex items-center justify-center text-[#ff9900]">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 class="text-lg font-black text-[#232f3e] uppercase tracking-widest italic">Security Policy
                        </h2>
                    </div>

                    <div class="p-8 bg-[#ff9900]/5 border-2 border-[#ff9900]/20">
                        <div class="flex gap-6">
                            <div
                                class="w-12 h-12 bg-white border border-[#ff9900]/20 flex items-center justify-center text-[#ff9900] shrink-0 shadow-sm">
                                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div class="flex-1">
                                <label class="flex items-start gap-5 cursor-pointer group">
                                    <div class="relative flex items-center">
                                        <input type="checkbox" v-model="blockPublicAccess"
                                            class="w-6 h-6 border-2 border-[#ff9900]/30 text-[#ff9900] focus:ring-0 rounded-none bg-white">
                                    </div>
                                    <div>
                                        <p
                                            class="text-sm font-black text-[#232f3e] uppercase tracking-widest italic group-hover:text-[#ff9900] transition-colors">
                                            Block all public access</p>
                                        <p class="text-xs text-[#545b64] leading-relaxed mt-2 font-medium">Recommended.
                                            Secure your infrastructure by overriding all legacy bucket policies that
                                            grant public interaction.</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Advanced Parameters -->
                <section class="bg-white border-2 border-[#eaeded] shadow-sm overflow-hidden">
                    <button @click="showAdvanced = !showAdvanced"
                        class="w-full p-10 flex items-center justify-between hover:bg-[#fafafa] transition-colors">
                        <div class="flex items-center gap-4">
                            <div
                                class="w-10 h-10 bg-[#fafafa] border border-[#eaeded] flex items-center justify-center text-[#ff9900]">
                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h2 class="text-lg font-black text-[#232f3e] uppercase tracking-widest italic">Advanced
                                parameters</h2>
                        </div>
                        <svg class="w-6 h-6 text-[#545b64] transition-transform duration-300"
                            :class="showAdvanced ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    <transition name="slide-down">
                        <div v-show="showAdvanced"
                            class="p-10 pt-0 space-y-12 bg-[#fafafa] border-t-2 border-[#eaeded]">
                            <!-- Versioning -->
                            <div class="pt-12">
                                <label class="input-label italic">Bucket Versioning</label>
                                <div class="flex gap-6 max-w-md">
                                    <button v-for="v in ['Disable', 'Enable']" :key="v" @click="bucketVersioning = v"
                                        class="flex-1 py-4 px-6 border-2 transition-all text-xs font-black uppercase tracking-widest italic"
                                        :class="bucketVersioning === v ? 'bg-[#ff9900]/5 border-[#ff9900] text-[#ff9900]' : 'bg-white border-[#eaeded] text-[#545b64] hover:border-[#ff9900]/30'">
                                        {{ v }}
                                    </button>
                                </div>
                            </div>

                            <!-- Encryption -->
                            <div>
                                <label class="input-label italic">Default Encryption</label>
                                <div class="grid md:grid-cols-3 gap-6">
                                    <label v-for="e in ['SSE-S3', 'SSE-KMS', 'DSSE-KMS']" :key="e"
                                        class="flex items-center gap-4 p-6 border-2 transition-all cursor-pointer group"
                                        :class="encryptionType === e ? 'border-[#ff9900] bg-[#ff9900]/5' : 'border-[#eaeded] bg-white hover:border-[#ff9900]/30'">
                                        <input type="radio" v-model="encryptionType" :value="e" class="hidden">
                                        <div class="w-5 h-5 border-2 flex items-center justify-center transition-all"
                                            :class="encryptionType === e ? 'border-[#ff9900] bg-[#ff9900]' : 'border-[#eaeded] bg-[#fafafa]'">
                                            <div v-if="encryptionType === e" class="w-1.5 h-1.5 bg-white"></div>
                                        </div>
                                        <span class="text-xs font-black uppercase tracking-tight italic"
                                            :class="encryptionType === e ? 'text-[#ff9900]' : 'text-[#232f3e]'">{{ e
                                            }}</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </transition>
                </section>
            </div>
        </div>

        <!-- Sticky Bottom Actions -->
        <div
            class="fixed bottom-0 left-0 right-0 z-[100] bg-white/90 backdrop-blur-2xl border-t-2 border-[#eaeded] py-8 px-8 md:px-24 shadow-[0_-20px_50px_-15px_rgba(0,0,0,0.05)]">
            <div class="max-w-[1800px] mx-auto flex justify-between items-center">
                <div class="hidden md:block">
                    <p class="text-[10px] text-[#545b64] uppercase tracking-[0.3em] font-black mb-1">Estimated Costing
                    </p>
                    <p class="text-[#ff9900] text-3xl font-black italic tracking-tighter">Net <span
                            class="not-italic">$0.00</span> <span
                            class="text-[#879196] text-[11px] uppercase tracking-widest not-italic ml-2 italic">/ Free
                            Tier</span></p>
                </div>
                <div class="flex gap-6 w-full md:w-auto">
                    <button @click="router.back()"
                        class="px-10 py-4 bg-white border-2 border-[#eaeded] text-[#545b64] text-[10px] font-black uppercase tracking-widest hover:border-[#ff9900] hover:text-[#ff9900] transition-all transform active:scale-95 shadow-sm">Cancel</button>
                    <button @click="handleCreateBucket"
                        class="px-12 py-4 bg-[#ff9900] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#ec7211] transition-all transform active:scale-95 shadow-lg shadow-[#ff9900]/20">
                        Create bucket
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    max-height: 1000px;
}

.slide-down-enter-from,
.slide-down-leave-to {
    max-height: 0;
    opacity: 0;
}

.input-label {
    @apply block text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em] mb-4;
}

.input-field {
    @apply w-full bg-[#fafafa] border-2 border-[#eaeded] p-4 text-sm text-[#232f3e] placeholder-[#eaeded] focus:outline-none focus:border-[#ff9900] transition-all font-black uppercase tracking-widest;
}
</style>
