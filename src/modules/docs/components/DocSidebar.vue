<template>
    <aside class="doc-sidebar w-76 bg-white border-r border-gray-100 flex flex-col h-full font-urbanist sticky top-20">
        <!-- Header -->
        <div class="p-6 border-b border-gray-100">
            <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-3 text-[#ff6b00]">
                    <BookOpen :size="20" />
                    <h2 class="text-xs font-semibold uppercase tracking-wide">
                        Documentation Portal
                    </h2>
                </div>
                <div v-if="isPrivileged"
                    class="flex items-center gap-1.5 px-2 py-0.5 bg-orange-50 border border-orange-100 rounded text-[9px] font-bold text-orange-600 uppercase">
                    <ShieldCheck :size="10" />
                    {{ userRole }}
                </div>
            </div>
            <p class="text-[11px] text-gray-400">SERWIN SYSTEMS CLOUD</p>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div v-if="loading" class="space-y-6 p-4">
                <div v-for="i in 3" :key="i" class="space-y-3">
                    <div class="h-3 bg-gray-50 rounded w-1/3 animate-pulse"></div>
                    <div class="h-8 bg-gray-50 rounded w-full animate-pulse"></div>
                </div>
            </div>

            <nav v-else class="space-y-8 pb-10">
                <template v-for="(manifest, serviceId) in manifests" :key="serviceId">
                    <div class="service-block">
                        <!-- Service Header -->
                        <div class="flex items-center justify-between px-4 mb-4 bg-[#ff9900]">
                            <h3 class="text-[20px] font-bold text-white tracking-wide flex items-center gap-2">
                                <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
                                {{ `${manifest.service.toUpperCase()}` }}
                            </h3>
                        </div>

                        <!-- 1. Internal Documentation dropdown (only present when scope === 'internal') -->
                        <div v-if="scoped(serviceId as string).internalCategories.length" class="mb-5">
                            <button @click="toggleSection(serviceId as string, 'internal')"
                                class="w-full px-6 flex items-center justify-between mb-2 group">
                                <span
                                    class="text-[16px] font-semibold uppercase tracking-widest  group-hover:text-orange-600 flex items-center gap-1.5">
                                    <ShieldCheck :size="10" />
                                    Internal Documentation
                                </span>
                                <ChevronDown :size="32" class="transition-transform duration-200"
                                    :class="{ 'rotate-180': !isSectionCollapsed(serviceId as string, 'internal') }" />
                            </button>

                            <div v-show="!isSectionCollapsed(serviceId as string, 'internal')">
                                <div v-for="category in scoped(serviceId as string).internalCategories"
                                    :key="category.title" class="mb-5 last:mb-0 pl-4">
                                    <div class="px-6 mb-2">
                                        <span class="text-[15px] font-bold text-orange-500 uppercase tracking-tighter " >
                                            {{ category.title }}
                                        </span>
                                    </div>
                                    <ul class="space-y-0.5 pl-8">
                                        <li v-for="item in category.items" :key="item.slug">
                                            <button
                                                class="relative w-full text-left flex items-center px-6 py-2.5 text-[13px] font-medium rounded-lg transition-all duration-150 border-l-2 border-transparent"
                                                :class="isActive(serviceId as string, item.slug)
                                                    ? 'bg-orange-50 text-orange-600 font-bold !border-orange-500'
                                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'"
                                                @click="onNavigate(serviceId as string, item.slug)">
                                                <span class="truncate">{{ item.title }}</span>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <!-- 2. Public Documentation dropdown -->
                        <div v-if="scoped(serviceId as string).publicCategories.length" class="mb-5">
                            <button v-if="scoped(serviceId as string).publicCategories.length"
                                @click="toggleSection(serviceId as string, 'public')"
                                class="w-full px-6 flex items-center justify-between mb-2 group">
                                <span
                                    class="text-[16px] font-semibold uppercase tracking-widest  group-hover:text-orange-600 flex items-center gap-1.5">

                                    Public Documentation
                                </span>
                                <ChevronDown :size="32" class=" transition-transform duration-200"
                                    :class="{ 'rotate-180': !isSectionCollapsed(serviceId as string, 'public') }" />
                            </button>
                            <div v-else class="px-6 mb-2">
                                <span class="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                                    Guides & General
                                </span>
                            </div>

                            <div v-show="!isSectionCollapsed(serviceId as string, 'public')">
                                <div v-for="category in scoped(serviceId as string).publicCategories"
                                    :key="category.title" class="mb-5 last:mb-0  pl-4" >
                                    <div class="px-6 mb-2">
                                        <span class="text-[15px] font-bold text-orange-500 uppercase tracking-tighter">
                                            {{ category.title }}
                                        </span>
                                    </div>
                                    <ul class="space-y-0.5 pl-8">
                                        <li v-for="item in category.items" :key="item.slug">
                                            <button
                                                class="relative w-full text-left flex items-center px-6 py-2.5 text-[13px] font-medium rounded-lg transition-all duration-150"
                                                :class="isActive(serviceId as string, item.slug)
                                                    ? 'bg-blue-50 text-blue-600 font-bold'
                                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'"
                                                @click="onNavigate(serviceId as string, item.slug)">
                                                <span v-if="isActive(serviceId as string, item.slug)"
                                                    class="absolute left-0 w-1 h-5 bg-blue-500 rounded-r">
                                                </span>
                                                <span class="truncate">{{ item.title }}</span>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div class="mx-6 mt-8 border-t border-gray-50"></div>
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

// Splits a service's categories_mapped into { scope, publicCategories, internalCategories }.
const scoped = (serviceId: string) => docsStore.scopedCategories(serviceId) as docsStore.ScopedCategories;
// const scoped = docsStore.manifests
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