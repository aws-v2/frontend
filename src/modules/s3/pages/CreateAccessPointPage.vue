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

const handleCancel = () => {
    router.push({ name: 's3-bucket-details', params: { bucketName: bucketName.value }, query: { tab: 'access points' } })
}

const handleCreate = () => {
    // Simulate creation
    router.push({ name: 's3-bucket-details', params: { bucketName: bucketName.value }, query: { tab: 'access points' } })
}
</script>

<template>
    <div class="min-h-screen bg-[#fafafa] font-sans pb-32">
        <Navbar />

        <!-- Breadcrumbs -->
        <div
            class="h-14 border-b border-[#eaeded] bg-[#fafafa] flex items-center px-12 text-[11px] gap-4 text-[#545b64] relative z-10 font-black uppercase tracking-[0.2em] italic">
            <span @click="router.push('/s3')" class="hover:text-[#ff9900] cursor-pointer transition-colors">
                Amazon S3
            </span>
            <span class="text-[#eaeded] not-italic text-lg mx-2">/</span>
            <span @click="router.push('/s3/buckets')" class="hover:text-[#ff9900] cursor-pointer transition-colors">
                Buckets
            </span>
            <span class="text-[#eaeded] not-italic text-lg mx-2">/</span>
            <span @click="router.push(`/s3/buckets/${bucketName}`)"
                class="hover:text-[#ff9900] cursor-pointer transition-colors underline decoration-[#ff9900]/20 underline-offset-4">
                {{ bucketName }}
            </span>
            <span class="text-[#eaeded] not-italic text-lg mx-2">/</span>
            <span class="text-[#232f3e] italic font-black">Create Access Point</span>
        </div>

        <!-- Subtle Grid Backdrop -->
        <div
            class="fixed inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none">
        </div>

        <div class="max-w-4xl mx-auto p-12 px-8 relative z-10 pt-20">
            <!-- Header -->
            <div class="mb-20 text-center border-b border-[#eaeded] pb-12">
                <h1 class="text-5xl font-black text-[#232f3e] mb-6 tracking-tighter uppercase italic">
                    New <span class="text-[#ff9900]">Access Point</span>
                </h1>
                <p class="text-[14px] text-[#545b64] font-black uppercase tracking-widest opacity-40 italic">
                    Configure high-speed, secure network endpoints for shared datasets.
                </p>
            </div>

            <div class="space-y-16 italic">
                <!-- Properties Section -->
                <section class="bg-white border-2 border-[#232f3e] overflow-hidden">
                    <div class="bg-[#fafafa] px-10 py-6 border-b border-[#eaeded]">
                        <h2 class="text-xl font-black text-[#232f3e] uppercase tracking-tighter italic">Properties</h2>
                    </div>
                    <div class="p-10 space-y-10">
                        <div class="grid grid-cols-2 gap-10">
                            <div>
                                <label
                                    class="block text-[10px] font-black uppercase tracking-[0.4em] text-[#545b64] mb-4 opacity-40">AWS
                                    Region</label>
                                <p class="text-[15px] font-black text-[#232f3e] uppercase">{{ region }}</p>
                            </div>
                            <div>
                                <label
                                    class="block text-[10px] font-black uppercase tracking-[0.4em] text-[#545b64] mb-4 opacity-40">Target
                                    Bucket</label>
                                <p class="text-[15px] font-black text-[#ff9900] uppercase">{{ bucketName }}</p>
                            </div>
                        </div>

                        <div>
                            <label
                                class="block text-[10px] font-black uppercase tracking-[0.4em] text-[#545b64] mb-4 opacity-40">Access
                                Point Alias</label>
                            <input v-model="accessPointName" type="text" placeholder="e.g. data-lake-endpoint"
                                class="w-full bg-[#fafafa] border border-[#eaeded] px-8 py-4 text-xl font-black italic uppercase tracking-tighter text-[#232f3e] focus:border-[#ff9900] outline-none transition-all placeholder:text-[#eaeded]">
                        </div>
                    </div>
                </section>

                <!-- Network Origin Section -->
                <section class="bg-white border-2 border-[#232f3e] overflow-hidden">
                    <div class="bg-[#fafafa] px-10 py-6 border-b border-[#eaeded]">
                        <h2 class="text-xl font-black text-[#232f3e] uppercase tracking-tighter italic">Network origin
                        </h2>
                    </div>
                    <div class="p-10 space-y-8">
                        <div class="grid grid-cols-2 gap-6">
                            <label class="relative cursor-pointer group">
                                <input type="radio" value="internet" v-model="networkOrigin" class="peer sr-only">
                                <div
                                    class="p-8 border border-[#eaeded] bg-[#fafafa] peer-checked:border-[#ff9900] peer-checked:border-2 transition-all">
                                    <h3 class="text-sm font-black text-[#232f3e] uppercase mb-2">Internet</h3>
                                    <p
                                        class="text-[10px] text-[#545b64] font-black uppercase tracking-widest opacity-40">
                                        Global gateway access</p>
                                </div>
                            </label>
                            <label class="relative cursor-pointer group">
                                <input type="radio" value="vpc" v-model="networkOrigin" class="peer sr-only">
                                <div
                                    class="p-8 border border-[#eaeded] bg-[#fafafa] peer-checked:border-[#ff9900] peer-checked:border-2 transition-all">
                                    <h3 class="text-sm font-black text-[#232f3e] uppercase mb-2">VPC Only</h3>
                                    <p
                                        class="text-[10px] text-[#545b64] font-black uppercase tracking-widest opacity-40">
                                        Closed network isolation</p>
                                </div>
                            </label>
                        </div>

                        <!-- VPC ID Input -->
                        <div v-if="networkOrigin === 'vpc'" class="animate-in fade-in slide-in-from-top-4 duration-300">
                            <label
                                class="block text-[10px] font-black uppercase tracking-[0.4em] text-[#545b64] mb-4 opacity-40">Virtual
                                Private Cloud ID</label>
                            <input v-model="vpcId" type="text" placeholder="vpc-00000000"
                                class="w-full bg-[#fafafa] border border-[#eaeded] px-8 py-4 text-xl font-black italic uppercase tracking-tighter text-[#232f3e] focus:border-[#ff9900] outline-none">
                        </div>
                    </div>
                </section>
            </div>

            <!-- Sticky Footer Action -->
            <div
                class="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-3xl border-t border-[#eaeded] p-8 flex justify-end gap-12 z-[100] px-16 italic">
                <button @click="handleCancel"
                    class="px-12 py-4 text-[11px] font-black uppercase tracking-[0.3em] text-[#545b64] hover:text-[#232f3e] transition-colors">
                    Discard Config
                </button>
                <button @click="handleCreate" :disabled="!accessPointName"
                    class="relative group px-16 py-4 bg-[#232f3e] text-white font-black text-[12px] uppercase tracking-[0.4em] transition-all disabled:opacity-30 disabled:grayscale">
                    <span class="relative flex items-center gap-6">
                        Instantiate Point
                        <svg class="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                    </span>
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.animate-in {
    animation-duration: 300ms;
}
</style>
