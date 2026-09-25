<template>
    <aside class="doc-sidebar w-76 bg-white border-r border-gray-100 flex flex-col h-full font-urbanist sticky top-20">
        <!-- Header -->
        <div class="p-6 border-b border-gray-100">
            <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-2.5 text-[#232f3e]">
                    <div class="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center">
                        <BookOpen :size="15" class="text-[#ff9900]" />
                    </div>
                    <h2 class="text-xs font-bold uppercase tracking-wide">
                        Documentation Portal
                    </h2>
                </div>
                <div v-if="isPrivileged"
                    class="flex items-center gap-1 px-2 py-0.5 bg-orange-50 rounded-full text-[9px] font-bold text-orange-600 uppercase">
                    <ShieldCheck :size="10" />
                    {{ userRole }}
                </div>
            </div>
            <p class="text-[10.5px] text-gray-400 tracking-wide pl-9">Serwin Systems Cloud</p>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div v-if="loading" class="space-y-6 p-4">
                <div v-for="i in 3" :key="i" class="space-y-3">
                    <div class="h-3 bg-gray-50 rounded w-1/3 animate-pulse"></div>
                    <div class="h-8 bg-gray-50 rounded w-full animate-pulse"></div>
                </div>
            </div>

            <nav v-else class="space-y-1 pb-10">
                <template v-for="(manifest, serviceId) in manifests" :key="serviceId">
                    <div class="service-block pt-5 first:pt-1">
                        <!-- Service Header -->
                        <div class="flex items-center gap-2 px-2 mb-4">
                            <span class="w-1.5 h-1.5 rounded-full bg-[#ff9900] shrink-0"></span>
                            <h3 class="text-[11px] font-black text-[#232f3e] tracking-[0.12em] uppercase">
                                {{ manifest.service }}
                            </h3>
                            <div class="flex-1 h-px bg-gray-100"></div>
                        </div>

                        <!-- 1. Internal Documentation dropdown (only present when the caller can see it) -->
                        <div v-if="scoped(serviceId as string).internalCategories.length" class="mb-4">
                            <button @click="toggleSection(serviceId as string, 'internal')"
                                class="w-full px-3 py-1.5 flex items-center justify-between mb-1.5 rounded-md group hover:bg-orange-50/60 transition-colors">
                                <span
                                    class="text-[10.5px] font-bold uppercase tracking-widest text-orange-500 group-hover:text-orange-600 flex items-center gap-1.5">
                                    <ShieldCheck :size="11" />
                                    Internal Documentation
                                </span>
                                <ChevronDown :size="13" class="text-gray-400 transition-transform duration-200 group-hover:text-orange-500"
                                    :class="{ '-rotate-90': isSectionCollapsed(serviceId as string, 'internal') }" />
                            </button>

                            <div v-show="!isSectionCollapsed(serviceId as string, 'internal')" class="space-y-4">
                                <div v-for="category in scoped(serviceId as string).internalCategories"
                                    :key="category.title" class="pl-3">
                                    <div class="px-3 mb-1">
                                        <span class="text-[10px] font-bold text-blue uppercase tracking-wider">
                                            {{ category.title }}
                                        </span>
                                    </div>
                                    <ul class="space-y-0.5">
                                        <li v-for="item in category.items" :key="item.slug">
                                            <button
                                                class="relative w-full text-left flex items-center gap-2 px-3 py-2 text-[13px] font-medium rounded-md transition-all duration-150"
                                                :class="isActive(serviceId as string, item.slug)
                                                    ? 'bg-orange-50 text-orange-600 font-semibold'
                                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'"
                                                @click="onNavigate(serviceId as string, item.slug)">
                                                <span class="w-1 h-1 rounded-full shrink-0"
                                                    :class="isActive(serviceId as string, item.slug) ? 'bg-orange-500' : 'bg-gray-300'"></span>
                                                <span class="truncate">{{ item.title }}</span>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <!-- 2. Public Documentation dropdown -->
                        <div v-if="scoped(serviceId as string).publicCategories.length" class="mb-1">
                            <button @click="toggleSection(serviceId as string, 'public')"
                                class="w-full px-3 py-1.5 flex items-center justify-between mb-1.5 rounded-md group hover:bg-gray-50 transition-colors">
                                <span
                                    class="text-[10.5px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-700">
                                    Public Documentation
                                </span>
                                <ChevronDown :size="13" class="text-gray-400 transition-transform duration-200 group-hover:text-gray-600"
                                    :class="{ '-rotate-90': isSectionCollapsed(serviceId as string, 'public') }" />
                            </button>

                            <div v-show="!isSectionCollapsed(serviceId as string, 'public')" class="space-y-4">
                                <div v-for="category in scoped(serviceId as string).publicCategories"
                                    :key="category.title" class="pl-3">
                                    <div class="px-3 mb-1">
                                        <span class="text-[10px] font-bold text-blue uppercase tracking-wider">
                                            {{ category.title }}
                                        </span>
                                    </div>
                                    <ul class="space-y-0.5">
                                        <li v-for="item in category.items" :key="item.slug">
                                            <button
                                                class="relative w-full text-left flex items-center gap-2 px-3 py-2 text-[13px] font-medium rounded-md transition-all duration-150"
                                                :class="isActive(serviceId as string, item.slug)
                                                    ? 'bg-blue-50 text-blue-600 font-semibold'
                                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'"
                                                @click="onNavigate(serviceId as string, item.slug)">
                                                <span class="w-1 h-1 rounded-full shrink-0"
                                                    :class="isActive(serviceId as string, item.slug) ? 'bg-blue-500' : 'bg-gray-300'"></span>
                                                <span class="truncate">{{ item.title }}</span>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </nav>
        </div>
    </aside>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { BookOpen, ShieldCheck, ChevronDown } from 'lucide-vue-next';
import { useDocsStore, type DocManifest } from '../store/docsStore';

defineProps<{
    manifests: Record<string, DocManifest>;
    loading: boolean;
}>();

const docsStore = useDocsStore();
const route = useRoute();
const router = useRouter();

const { userRole } = storeToRefs(docsStore);
const isPrivileged = computed(() => docsStore.isPrivilegedUser);

// Splits a service's manifest into { scope, publicCategories, internalCategories }.
const scoped = (serviceId: string) => docsStore.scopedCategories(serviceId);

// Per-service, per-section (public/internal) manual collapse overrides.
// Key format: "<serviceId>:<section>"
const collapseOverrides = ref<Map<string, boolean>>(new Map());

const isActiveInSection = (serviceId: string, section: 'public' | 'internal') => {
    if (route.params.service !== serviceId) return false;
    const categories = section === 'public' ? scoped(serviceId).publicCategories : scoped(serviceId).internalCategories;
    return categories.some(c => c.items.some(i => i.slug === route.params.slug));
};

const isSectionCollapsed = (serviceId: string, section: 'public' | 'internal') => {
    // Never collapse the section the user is currently reading from.
    if (isActiveInSection(serviceId, section)) return false;

    const key = `${serviceId}:${section}`;
    if (collapseOverrides.value.has(key)) {
        return collapseOverrides.value.get(key) as boolean;
    }

    // Default: when a service has both groups (scope === 'internal'), internal docs
    // are prioritized (expanded) and public docs start collapsed. Otherwise expanded.
    if (section === 'public') {
        return scoped(serviceId).scope === 'internal';
    }
    return false;
};

const toggleSection = (serviceId: string, section: 'public' | 'internal') => {
    const key = `${serviceId}:${section}`;
    collapseOverrides.value.set(key, !isSectionCollapsed(serviceId, section));
};

const isActive = (service: string, slug: string): boolean => {
    return route.params.service === service && route.params.slug === slug;
};

const onNavigate = (serviceId: string, slug: string) => {
    router.push({
        name: 'docs-content',
        params: { service: serviceId, slug }
    });
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 5px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e5e7eb;
    border-radius: 999px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #d1d5db;
}
</style>