<script setup lang="ts">
import { useRouter } from 'vue-router'

const emit = defineEmits(['select'])
</script>

<template>
    <section>
        <p class="text-xl text-[#545b64] leading-relaxed mb-8 font-medium">
            Welcome to Serwin Systems Documentation. Our platform provides high-performance,
            AWS-compatible cloud infrastructure designed for modern web applications and gaming
            workloads.
        </p>
        <div class="grid grid-cols-2 gap-6 my-12">
            <div @click="emit('select', 'architecture')"
                class="p-8 border-2 border-[#eaeded] hover:border-[#232f3e] transition-all group cursor-pointer">
                <h3 class="text-xl font-black text-[#232f3e] mb-2">Architecture</h3>
                <p class="text-sm text-[#545b64] font-medium">Learn how our distributed systems
                    handle messaging and state.</p>
            </div>
            <div
                class="p-8 border-2 border-[#eaeded]/50 opacity-60 cursor-not-allowed group grayscale relative overflow-hidden">
                <div
                    class="absolute top-4 right-4 bg-[#232f3e] text-white text-[9px] font-black px-2 py-0.5 uppercase tracking-tighter">
                    Coming Soon</div>
                <h3 class="text-xl font-black text-[#879196] mb-2">API Reference</h3>
                <p class="text-sm text-[#879196] font-medium italic">Explore our RESTful API
                    endpoints and integration patterns.</p>
            </div>
            <div
                class="p-8 border-2 border-[#eaeded]/50 opacity-60 cursor-not-allowed group grayscale relative overflow-hidden">
                <div
                    class="absolute top-4 right-4 bg-[#232f3e] text-white text-[9px] font-black px-2 py-0.5 uppercase tracking-tighter">
                    Coming Soon</div>
                <h3 class="text-xl font-black text-[#879196] mb-2">API Explorer</h3>
                <p class="text-sm text-[#879196] font-medium italic">Interactive playground to test
                    API calls in real-time.</p>
            </div>
        </div>
    </section>
</template>
