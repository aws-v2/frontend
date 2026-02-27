<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useComputeStore } from '../store/computeStore'

const router = useRouter()
const computeStore = useComputeStore()

onMounted(async () => {
    await computeStore.fetchTemplates()
})
</script>

<template>
    <div class="min-h-screen bg-white text-[#16191f] font-urbanist p-8 md:p-16 pt-24 relative overflow-hidden">
        <div
            class="absolute inset-0 bg-[linear-gradient(rgba(0,102,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,102,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none">
        </div>

        <div class="relative z-10 max-w-7xl mx-auto space-y-12">
            <nav class="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-[#879196]">
                <span>AWS_GLOBAL</span>
                <div class="w-1 h-1 bg-[#eaeded] rounded-full"></div>
                <span>EC2_ENGINE</span>
                <div class="w-1 h-1 bg-[#eaeded] rounded-full"></div>
                <span class="text-[#232f3e]">IMAGE_TEMPLATES</span>
            </nav>

            <div class="flex justify-between items-end border-b-4 border-[#232f3e] pb-10">
                <h1 class="text-6xl font-black text-[#232f3e] tracking-tighter uppercase leading-none">Compute_Templates
                </h1>
                <button @click="router.push({ name: 'create-template' })"
                    class="px-12 py-5 bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[#232f3e] transition-all">Create_Template</button>
            </div>

            <div class="border-2 border-[#232f3e] overflow-hidden">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-[#fafafa] border-b-2 border-[#232f3e]">
                            <th class="px-8 py-6 text-[10px] font-black text-[#232f3e] uppercase tracking-widest">Name
                            </th>
                            <th class="px-8 py-6 text-[10px] font-black text-[#232f3e] uppercase tracking-widest">
                                Image_ID</th>
                            <th class="px-8 py-6 text-[10px] font-black text-[#232f3e] uppercase tracking-widest">Specs
                            </th>
                            <th
                                class="px-8 py-6 text-[10px] font-black text-[#232f3e] uppercase tracking-widest text-right">
                                Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y-2 divide-[#eaeded]">
                        <tr v-for="tpl in computeStore.templates" :key="tpl.id"
                            class="hover:bg-[#fafafa] transition-colors group cursor-pointer"
                            @click="router.push({ name: 'template-details', params: { id: tpl.id } })">
                            <td class="px-8 py-6 text-sm font-black text-[#232f3e] uppercase">{{ tpl.name }}</td>
                            <td class="px-8 py-6 text-sm font-black text-blue-600 uppercase">{{ tpl.image }}</td>
                            <td class="px-8 py-6 text-sm font-black text-[#879196] uppercase tracking-widest">{{ tpl.cpu
                                }} vCPU // {{ tpl.ram }} MB</td>
                            <td class="px-8 py-6 text-right">
                                <button
                                    class="text-[10px] font-black text-[#879196] hover:text-red-600 transition-colors uppercase tracking-widest">Delete</button>
                            </td>
                        </tr>
                        <tr v-if="computeStore.templates.length === 0">
                            <td colspan="4" class="px-8 py-20 text-center opacity-40">
                                <p class="text-[11px] font-black uppercase tracking-[0.4em] text-[#879196]">
                                    No_Templates_Created</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>
