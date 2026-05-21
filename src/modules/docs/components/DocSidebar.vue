<template>
    <aside class="doc-sidebar w-72 bg-white border-r border-gray-100 flex flex-col h-full font-urbanist sticky top-20">
        <!-- Header -->
        <div class="p-6 border-b border-gray-100">
            <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-3 text-[#ff6b00]">
                    <BookOpen :size="20" />
                    <h2 class="text-xs font-semibold uppercase tracking-wide">
                        Documentation Portal
                    </h2>
                </div>
                <div v-if="isPrivileged" class="flex items-center gap-1.5 px-2 py-0.5 bg-orange-50 border border-orange-100 rounded text-[9px] font-bold text-orange-600 uppercase">
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
                <template v-for="(unified, serviceId) in manifests" :key="serviceId">
                    <div class="service-block">
                        <!-- Service Header -->
                        <div class="flex items-center justify-between px-4 mb-4">
                            <h3 class="text-[12px] font-bold text-gray-900 tracking-wide flex items-center gap-2">
                                <div class="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                                {{ unified.public?.service || unified.internal?.service || serviceId }}
                            </h3>
                        </div>

                        <!-- 1. Internal Documentation (Prioritized for Admins) -->
                        <div v-if="unified.internal" class="mb-6">
                            <div v-for="category in unified.internal.categories" :key="category.title" class="mb-5 last:mb-0">
                                <div class="px-6 flex items-center gap-2 mb-2">
                                    <span class="text-[10px] font-semibold uppercase tracking-widest text-orange-500">
                                        {{ category.title }}
                                    </span>
                                    <ShieldCheck :size="10" class="text-orange-300" />
                                </div>

                                <ul class="space-y-0.5">
                                    <li v-for="item in category.items" :key="item.slug">
                                        <button
                                            class="relative w-full text-left flex items-center px-6 py-2.5 text-[13px] font-medium rounded-lg transition-all duration-150 bg-orange-50/30 border-l-2 border-transparent hover:border-orange-100"
                                            :class="isActive(serviceId as string, item.slug) ? 'bg-orange-50 text-orange-600 font-bold !border-orange-500' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'"
                                            @click="onNavigate(serviceId as string, item.slug)"
                                        >
                                            <span class="truncate">{{ item.title }}</span>
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <!-- 2. Public Documentation (Collapsible for Admins) -->
                        <div v-if="unified.public" class="mb-5">
                            <button 
                                v-if="isPrivileged"
                                @click="togglePublic(serviceId as string)"
                                class="w-full px-6 flex items-center justify-between mb-2 group"
                            >
                                <span class="text-[10px] font-semibold uppercase tracking-widest text-gray-400 group-hover:text-gray-600">
                                    Public Documentation
                                </span>
                                <ChevronDown 
                                    :size="12" 
                                    class="text-gray-400 transition-transform duration-200" 
                                    :class="{ 'rotate-180': !isPublicCollapsed(serviceId as string) }"
                                />
                            </button>
                            <div v-else class="px-6 mb-2">
                                <span class="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                                    Guides & General
                                </span>
                            </div>

                            <div v-show="!isPrivileged || !isPublicCollapsed(serviceId as string)">
                                <div v-for="category in unified.public.categories" :key="category.title" class="mb-5 last:mb-0">
                                    <div class="px-6 mb-2">
                                        <span class="text-[9px] font-bold text-gray-300 uppercase tracking-tighter">
                                            {{ category.title }}
                                        </span>
                                    </div>
                                    <ul class="space-y-0.5">
                                        <li v-for="item in category.items" :key="item.slug">
                                            <button
                                                class="relative w-full text-left flex items-center px-6 py-2.5 text-[13px] font-medium rounded-lg transition-all duration-150"
                                                :class="isActive(serviceId as string, item.slug)
                                                    ? 'bg-blue-50 text-blue-600 font-bold'
                                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'"
                                                @click="onNavigate(serviceId as string, item.slug)"
                                            >
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
import { useDocsStore } from '../store/docsStore';

const docsStore = useDocsStore();
const route = useRoute();
const router = useRouter();

const { manifests, loading, userRole } = storeToRefs(docsStore);
const isPrivileged = computed(() => docsStore.isPrivilegedUser);

// Collapse state for public docs per service (only for admins)
const collapsedPublicServices = ref<Set<string>>(new Set());

const isPublicCollapsed = (serviceId: string) => {
    // If we're currently viewing a public doc in this service, don't collapse it
    const activeManifest = manifests.value[serviceId];
    const isViewingPublic = activeManifest?.public?.categories.some(c => 
        c.items.some(i => i.slug === route.params.slug)
    );
    
    if (isViewingPublic) return false;
    
    // Default to collapsed for admins if not explicitly opened
    if (isPrivileged.value && !collapsedPublicServices.value.has(serviceId)) {
        // This is a bit tricky: we want it collapsed by default, but ref is reactive.
        // Let's initialize the set with all services if it's empty and user is admin.
        return true;
    }
    
    return collapsedPublicServices.value.has(serviceId);
};

const togglePublic = (serviceId: string) => {
    if (collapsedPublicServices.value.has(serviceId)) {
        collapsedPublicServices.value.delete(serviceId);
    } else {
        collapsedPublicServices.value.add(serviceId);
    }
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
