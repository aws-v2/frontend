<template>
    <aside class="doc-sidebar w-72 bg-white border-r border-gray-100 flex flex-col h-full font-urbanist sticky top-20">
        <!-- Header -->
        <div class="p-6 border-b border-gray-100">
            <div class="flex items-center gap-3 text-[#ff6b00] mb-1">
                <BookOpen :size="20" />
                <h2 class="text-xs font-semibold uppercase tracking-wide">
                    Documentation Portal
                </h2>
            </div>
            <p class="text-[11px] text-gray-400">
                SERWIN SYSTEMS CLOUD
            </p>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <!-- Loading Skeleton -->
            <div v-if="loading" class="space-y-6 p-4">
                <div v-for="i in 3" :key="i" class="space-y-3">
                    <div class="h-3 bg-gray-50 rounded w-1/3 animate-pulse"></div>
                    <div class="h-8 bg-gray-50 rounded w-full animate-pulse"></div>
                    <div class="h-8 bg-gray-50 rounded w-full animate-pulse"></div>
                </div>
            </div>

            <!-- Docs Navigation -->
            <nav v-else class="space-y-10 pb-10">
                <div v-for="(manifest, serviceId) in manifests" :key="serviceId" class="service-block">

                    <!-- Service Header -->
                    <div class="flex items-center justify-between px-4 mb-5">
                        <h3 class="text-[12px] font-semibold text-gray-900 tracking-wide">
                            {{ manifest.service }}
                        </h3>
                        <span class="text-[10px] text-gray-300 font-medium">
                            {{ manifest.version || 'V1' }}
                        </span>
                    </div>

                    <!-- Categories -->
                    <div v-for="category in manifest.categories" :key="category.title" class="mb-7 last:mb-0">
                        <div class="px-6 text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-3">
                            {{ category.title }}
                        </div>

                        <!-- Items -->
                        <ul class="space-y-1">
                            <li v-for="item in category.items" :key="item.slug">
                                <router-link
                                    :to="{ name: 'docs-content', params: { service: serviceId, slug: item.slug } }"
                                    class="relative group flex items-center px-6 py-2.5 text-[13px] font-medium rounded-md transition-all duration-150"
                                    :class="[
                                        isActive(serviceId, item.slug)
                                            ? 'bg-orange-50 text-orange-600 font-semibold'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    ]"
                                >
                                    <!-- Active Indicator -->
                                    <span
                                        v-if="isActive(serviceId, item.slug)"
                                        class="absolute left-0 w-1 h-5 bg-orange-500 rounded-r">
                                    </span>

                                    <span class="truncate">
                                        {{ item.title }}
                                    </span>
                                </router-link>
                            </li>
                        </ul>
                    </div>

                    <!-- Divider -->
                    <div
                        v-if="Object.keys(manifests).indexOf(serviceId) < Object.keys(manifests).length - 1"
                        class="mx-6 mt-8 border-t border-gray-100">
                    </div>
                </div>
            </nav>
        </div>

        <!-- Footer -->
        <div class="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <span class="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
                © 2026 SERWIN
            </span>
            <div class="flex items-center gap-2">
                <div class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span class="text-[10px] text-emerald-600 font-semibold uppercase">
                    Live Docs
                </span>
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

.service-block {
    @apply transition-opacity duration-300;
}
</style>