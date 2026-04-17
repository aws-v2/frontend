<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useComputeStore } from '../store/computeStore'

const router = useRouter()
const computeStore = useComputeStore()

const form = ref({
    name: '',
    description: '',
    image: 'serwin-linux-2024-v1',
    cpu: 2,
    ram: 4096
})

const isSubmitting = ref(false)

const handleCreate = async () => {
    isSubmitting.value = true
    try {
        await computeStore.createTemplate(form.value)
        router.push({ name: 'templates-list' })
    } catch (error) {
        console.error('Failed to create template:', error)
    } finally {
        isSubmitting.value = false
    }
}

const goBack = () => router.push({ name: 'templates-list' })
</script>

<template>
    <div class="min-h-screen bg-white text-[#16191f] font-urbanist p-8 md:p-16 pt-24 relative overflow-hidden">
        <div
            class="absolute inset-0 bg-[linear-gradient(rgba(0,102,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,102,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none">
        </div>

        <div class="relative z-10 max-w-4xl mx-auto space-y-12">
            <!-- Navigation -->
            <nav class="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-[#879196]">
                <span>EC2_ENGINE</span>
                <div class="w-1 h-1 bg-[#eaeded] rounded-full"></div>
                <button @click="goBack" class="hover:text-amber-600 transition-colors">BLUEPRINT_CATALOG</button>
                <div class="w-1 h-1 bg-[#eaeded] rounded-full"></div>
                <span class="text-[#232f3e]">DEFINE_ARCHETYPE</span>
            </nav>

            <!-- Header -->
            <div class="border-l-8 border-amber-500 pl-10 py-4 mb-20">
                <h1 class="text-7xl font-black text-[#232f3e] tracking-tight uppercase leading-none mb-4">
                    New <span class="text-amber-500 italic">Template</span>
                </h1>
                <p class="text-[11px] font-black text-[#879196] uppercase tracking-[0.4em]">Draft Custom Image Blueprint
                    For Fleet Scaling</p>
            </div>

            <!-- Form -->
            <div class="bg-[#fafafa] border-4 border-[#232f3e] p-12 space-y-12 relative">
                <div class="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 -rotate-45 translate-x-16 -translate-y-16">
                </div>

                <div class="space-y-10">
                    <!-- Basic Info -->
                    <div class="grid md:grid-cols-2 gap-10">
                        <div class="space-y-4">
                            <label
                                class="text-[10px] font-black text-[#232f3e] uppercase tracking-widest block italic">TEMPLATE_NAME</label>
                            <input v-model="form.name" type="text" placeholder="e.g. WEB_NODE_OPTIMIZED"
                                class="w-full bg-white border-4 border-[#232f3e] p-5 text-sm font-black uppercase tracking-tight focus:ring-0 focus:border-amber-500 transition-colors outline-none">
                        </div>
                        <div class="space-y-4">
                            <label
                                class="text-[10px] font-black text-[#232f3e] uppercase tracking-widest block italic">BASE_IMAGE_ID</label>
                            <select v-model="form.image"
                                class="w-full bg-white border-4 border-[#232f3e] p-5 text-sm font-black uppercase tracking-tight focus:ring-0 focus:border-amber-500 transition-colors outline-none appearance-none cursor-pointer">
                                <option value="serwin-linux-2024-v1">SERWIN_LINUX_2024_V1 (RECOMMENDED)</option>
                                <option value="ubuntu-22-04-lts">UBUNTU_22_04_LTS</option>
                                <option value="debian-12-headless">DEBIAN_12_HEADLESS</option>
                            </select>
                        </div>
                    </div>

                    <!-- Description -->
                    <div class="space-y-4">
                        <label
                            class="text-[10px] font-black text-[#232f3e] uppercase tracking-widest block italic">RESOURCE_GOVERNANCE_DESC</label>
                        <textarea v-model="form.description" rows="3"
                            placeholder="Define usage scope and performance constraints..."
                            class="w-full bg-white border-4 border-[#232f3e] p-5 text-sm font-medium focus:ring-0 focus:border-amber-500 transition-colors outline-none resize-none"></textarea>
                    </div>

                    <!-- Hardware Specs -->
                    <div class="grid md:grid-cols-2 gap-10">
                        <div class="space-y-4">
                            <label
                                class="text-[10px] font-black text-[#232f3e] uppercase tracking-widest block italic">VCPU_ALLOCATION</label>
                            <div class="flex items-center gap-4">
                                <input v-model.number="form.cpu" type="range" min="1" max="64" step="1"
                                    class="flex-1 accent-[#232f3e]">
                                <span
                                    class="w-16 text-center font-black text-amber-600 border-2 border-[#232f3e] py-2">{{
                                    form.cpu }} vCPU</span>
                            </div>
                        </div>
                        <div class="space-y-4">
                            <label
                                class="text-[10px] font-black text-[#232f3e] uppercase tracking-widest block italic">RAM_ALLOCATION_MB</label>
                            <div class="relative">
                                <input v-model.number="form.ram" type="number" step="1024"
                                    class="w-full bg-white border-4 border-[#232f3e] p-5 text-sm font-black focus:ring-0 focus:border-amber-500 transition-colors outline-none">
                                <span
                                    class="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-amber-600 uppercase tracking-widest">MB</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer Action -->
                <div
                    class="pt-12 border-t-4 border-[#232f3e] flex flex-col md:flex-row justify-between items-center gap-8">
                    <div class="flex items-center gap-4">
                        <div class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                        <p class="text-[10px] font-black text-[#232f3e] uppercase tracking-widest">
                            BLUEPRINT_VALIDATION_PASSED</p>
                    </div>
                    <div class="flex gap-6 w-full md:w-auto">
                        <button @click="goBack"
                            class="flex-1 md:flex-initial px-12 py-5 border-4 border-[#232f3e] text-[#232f3e] text-[10px] font-black uppercase tracking-widest hover:bg-[#232f3e] hover:text-white transition-all">
                            CANCEL
                        </button>
                        <button @click="handleCreate" :disabled="isSubmitting || !form.name"
                            class="flex-1 md:flex-initial px-16 py-5 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#232f3e] transition-all disabled:opacity-50 disabled:cursor-not-allowed group">
                            <span v-if="!isSubmitting">COMMIT_ARCHETYPE &rarr;</span>
                            <span v-else class="animate-pulse">DOCKING_TEMPLATE...</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
