<template>
    <aside class="doc-sidebar w-72 bg-white border-r border-gray-100 flex flex-col h-full font-urbanist sticky top-20">
        <div class="p-6 border-b border-gray-100">
            <div class="flex items-center gap-3 text-[#ff6b00] mb-1">
                <BookOpen :size="20" />
                <h2 class="text-xs font-bold uppercase tracking-widest italic">Documentation Portal</h2>
            </div>
            <p class="text-[10px] text-gray-400 font-medium">SERWIN SYSTEMS CLOUD</p>
        </div>

        <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div v-if="loading" class="space-y-6 p-4">
                <div v-for="i in 3" :key="i" class="space-y-3">
                    <div class="h-3 bg-gray-50 rounded w-1/3 animate-pulse"></div>
                    <div class="h-8 bg-gray-50 rounded w-full animate-pulse"></div>
                    <div class="h-8 bg-gray-50 rounded w-full animate-pulse"></div>
                </div>
            </div>

            <nav v-else class="space-y-8 pb-10">
                <!-- Iterate through each service manifest -->
                <div v-for="(manifest, serviceId) in manifests" :key="serviceId" class="service-block">
                    <div class="flex items-center justify-between px-4 mb-4">
                        <h3 class="text-[11px] font-black text-[#232f3e] uppercase tracking-[0.2em] italic">
                            {{ manifest.service }}
                        </h3>
                        <span class="text-[9px] text-gray-300 font-bold">{{ manifest.version || 'V1' }}</span>
                    </div>

                    <div v-for="category in manifest.categories" :key="category.title" class="mb-6 last:mb-0">
                        <div
                            class="px-6 text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <div class="w-1 h-1 bg-gray-200 rounded-full"></div>
                            {{ category.title }}
                        </div>
                        <ul class="space-y-0.5">
                            <li v-for="item in category.items" :key="item.slug">
                                <router-link
                                    :to="{ name: 'docs-content', params: { service: serviceId, slug: item.slug } }"
                                    class="flex items-center gap-2 px-6 py-2 text-[13px] font-bold transition-all duration-200 border-l-2"
                                    :class="[
                                        isActive(serviceId, item.slug)
                                            ? 'bg-[#ff6b00]/5 text-[#ff6b00] border-[#ff6b00]'
                                            : 'text-[#545b64] hover:text-[#232f3e] hover:bg-gray-50 border-transparent'
                                    ]">
                                    <span>{{ item.title }}</span>
                                </router-link>
                            </li>
                        </ul>
                    </div>
                    <div v-if="Object.keys(manifests).indexOf(serviceId) < Object.keys(manifests).length - 1"
                        class="mx-4 mt-8 border-b border-gray-50"></div>
                </div>
            </nav>
        </div>

        <div class="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <span class="text-[9px] text-gray-400 font-black uppercase tracking-widest italic">© 2026 SERWIN</span>
            <div class="flex gap-2">
                <div class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span class="text-[8px] text-emerald-600 font-black uppercase">Live Docs</span>
            </div>
        </div>
    </aside>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { BookOpen } from 'lucide-vue-next';
import type { DocManifest } from '../store/docsStore';

defineProps<{
    manifests: Record<string, DocManifest>;
    loading: boolean;
}>();

const route = useRoute();

const isActive = (service: string, slug: string) => {
    return route.params.service === service && route.params.slug === slug;
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #f1f1f1;
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #e5e5e5;
}

/* Service transition polish */
.service-block {
    @apply transition-opacity duration-300;
}
</style>
