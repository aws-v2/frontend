<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
const goBack = () => router.back()
</script>
<template>
    <div class="min-h-screen bg-white text-[#16191f] font-urbanist p-8 md:p-16 pt-24">
        <div class="max-w-4xl mx-auto space-y-12">
            <h1 class="text-4xl font-black uppercase tracking-tighter text-[#232f3e]">Snapshot_Details_Placeholder</h1>
            <div class="p-12 border-2 border-[#232f3e] border-dashed text-center opacity-40">
                <p class="text-[10px] font-black uppercase tracking-[0.3em]">Inspection_Interface_Status_Pending</p>
            </div>
            <button @click="goBack"
                class="px-12 py-5 bg-[#232f3e] text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all">Return_To_Inventory</button>
        </div>
    </div>
</template>
