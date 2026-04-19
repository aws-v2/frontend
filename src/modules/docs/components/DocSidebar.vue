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
            <p class="text-[11px] text-gray-400">SERWIN SYSTEMS CLOUD</p>
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

            <nav v-else class="space-y-2 pb-10">

                <!-- ── Internal Docs (ADMIN / ENGINEER only) ──────────────── -->
                <section v-if="isPrivileged" class="mb-4">
                    <div class="flex items-center gap-2 px-4 py-3 mb-2 rounded-lg bg-orange-50 border border-orange-100">
                        <ShieldCheck :size="14" class="text-orange-500 shrink-0" />
                        <span class="text-[11px] font-semibold text-orange-600 uppercase tracking-wide">
                            Internal Docs
                        </span>
                        <span class="ml-auto text-[9px] bg-orange-500 text-white rounded px-1.5 py-0.5 font-bold uppercase">
                            {{ userRole }}
                        </span>
                    </div>

                    <template v-for="(manifest, serviceId) in internalManifests" :key="`internal-${serviceId}`">
                        <div class="service-block mb-6">
                            <!-- Service Header -->
                            <div class="flex items-center justify-between px-4 mb-3">
                                <h3 class="text-[12px] font-semibold text-gray-900 tracking-wide">
                                    {{ manifest.service }}
                                </h3>
                                <span class="text-[10px] text-gray-300 font-medium">
                                    {{ manifest.version || 'V1' }}
                                </span>
                            </div>

                            <!-- Categories -->
                            <div v-for="category in manifest.categories" :key="category.title" class="mb-5 last:mb-0">
                                <div class="px-6 text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-2">
                                    {{ category.title }}
                                </div>
                                <ul class="space-y-1">
                                    <li v-for="item in category.items" :key="item.slug">
                                        <button
                                            class="relative w-full text-left flex items-center px-6 py-2.5 text-[13px] font-medium rounded-md transition-all duration-150"
                                            :class="isActive(serviceId as string, item.slug, true)
                                                ? 'bg-orange-50 text-orange-600 font-semibold'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'"
                                            @click="onNavigate({ serviceId: serviceId as string, slug: item.slug, isInternal: true })"
                                        >
                                            <span v-if="isActive(serviceId as string, item.slug, true)"
                                                class="absolute left-0 w-1 h-5 bg-orange-500 rounded-r">
                                            </span>
                                            <span class="truncate">{{ item.title }}</span>
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <!-- Divider -->
                        <div
                            v-if="Object.keys(internalManifests).indexOf(serviceId as string) < Object.keys(internalManifests).length - 1"
                            class="mx-6 mt-6 border-t border-gray-100">
                        </div>
                    </template>
                </section>

                <!-- ── Public Docs ─────────────────────────────────────────── -->
                <section>
                    <!-- Collapsible header — privileged users -->
                    <button
                        v-if="isPrivileged"
                        class="w-full flex items-center gap-2 px-4 py-2.5 mb-2 rounded-lg hover:bg-gray-50 transition-colors bg-orange-50 border border-orange-100"
                        @click="docsStore.togglePublicCollapsed()"
                    >
                        <BookOpen :size="14" class="text-gray-400 shrink-0" />
                        <span class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                            Public Docs
                        </span>
                        <ChevronDown
                            :size="13"
                            class="ml-auto text-gray-400 transition-transform duration-200"
                            :class="{ 'rotate-180': !publicCollapsed }"
                        />
                    </button>

                    <!-- Static header — regular users -->
                    <div v-else class="flex items-center gap-2 px-4 py-2 mb-2">
                        <BookOpen :size="14" class="text-gray-400" />
                        <span class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                            Documentation
                        </span>
                    </div>

                    <!-- Public manifest list -->
                    <div v-show="!publicCollapsed">
                        <template v-for="(manifest, serviceId) in manifests" :key="`public-${serviceId}`">
                            <div class="service-block mb-6">
                                <!-- Service Header -->
                                <div class="flex items-center justify-between px-4 mb-3">
                                    <h3 class="text-[12px] font-semibold text-gray-900 tracking-wide">
                                        {{ manifest.service }}
                                    </h3>
                                    <span class="text-[10px] text-gray-300 font-medium">
                                        {{ manifest.version || 'V1' }}
                                    </span>
                                </div>

                                <!-- Categories -->
                                <div v-for="category in manifest.categories" :key="category.title" class="mb-5 last:mb-0">
                                    <div class="px-6 text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-2">
                                        {{ category.title }}
                                    </div>
                                    <ul class="space-y-1">
                                        <li v-for="item in category.items" :key="item.slug">
                                            <button
                                                class="relative w-full text-left flex items-center px-6 py-2.5 text-[13px] font-medium rounded-md transition-all duration-150"
                                                :class="isActive(serviceId as string, item.slug, false)
                                                    ? 'bg-orange-50 text-orange-600 font-semibold'
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'"
                                                @click="onNavigate({ serviceId: serviceId as string, slug: item.slug, isInternal: false })"
                                            >
                                                <span v-if="isActive(serviceId as string, item.slug, false)"
                                                    class="absolute left-0 w-1 h-5 bg-orange-500 rounded-r">
                                                </span>
                                                <span class="truncate">{{ item.title }}</span>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <!-- Divider -->
                            <div
                                v-if="Object.keys(manifests).indexOf(serviceId as string) < Object.keys(manifests).length - 1"
                                class="mx-6 mt-6 border-t border-gray-100">
                            </div>
                        </template>
                    </div>
                </section>

            </nav>
        </div>

        <!-- Footer -->
        <div class="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <span class="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
                © 2026 SERWIN
            </span>
            <div class="flex items-center gap-2">
                <div class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span class="text-[10px] text-emerald-600 font-semibold uppercase">Live Docs</span>
            </div>
        </div>
    </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { BookOpen, ShieldCheck, ChevronDown } from 'lucide-vue-next';
import { useDocsStore } from '../store/docsStore';

const docsStore = useDocsStore();
const route = useRoute();
const router = useRouter();

const { manifests, internalManifests, loading, publicCollapsed, userRole } = storeToRefs(docsStore);

const isPrivileged = computed(() => docsStore.isPrivilegedUser);

const isActive = (service: string, slug: string, internal: boolean): boolean => {
    return (
        route.params.service === service &&
        route.params.slug === slug &&
        route.query.internal === (internal ? 'true' : undefined)
    );
};

const onNavigate = ({ serviceId, slug, isInternal }: { serviceId: string; slug: string; isInternal: boolean }) => {
    router.push({
        name: 'docs-content',
        params: { service: serviceId, slug },
        query: isInternal ? { internal: 'true' } : {},
    });
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #f1f1f1; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #e5e5e5; }
.service-block { @apply transition-opacity duration-300; }
</style>