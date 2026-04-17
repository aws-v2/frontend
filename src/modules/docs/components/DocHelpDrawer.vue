<template>
    <Transition name="slide">
        <div v-if="isOpen" class="doc-drawer-overlay" @click.self="close">
            <div class="doc-drawer h-full w-[500px] bg-white shadow-2xl flex flex-col font-urbanist">
                <!-- Header -->
                <div class="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
                    <div class="flex items-center gap-3">
                        <div class="p-2 bg-orange-50 rounded-sm text-serwin-orange">
                            <HelpCircle :size="20" />
                        </div>
                        <div>
                            <h2 class="text-sm font-bold uppercase tracking-widest text-gray-900">Resource Help</h2>
                            <p class="text-[10px] text-gray-400 font-medium tracking-tight">CONTEXTUAL DOCUMENTATION</p>
                        </div>
                    </div>
                    <button @click="close" class="p-2 hover:bg-gray-50 rounded-full text-gray-400 transition-colors">
                        <X :size="20" />
                    </button>
                </div>

                <!-- Content -->
                <div class="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#fafafa]">
                    <div class="bg-white p-8 border border-gray-100 min-h-full">
                        <div v-if="docsStore.loading"
                            class="flex flex-col items-center justify-center py-20 animate-pulse">
                            <div class="w-10 h-10 bg-gray-50 rounded-full mb-4"></div>
                            <div class="h-3 bg-gray-50 rounded w-32"></div>
                        </div>

                        <div v-else-if="docsStore.error" class="text-center py-10">
                            <AlertCircle class="mx-auto text-red-500 mb-4" :size="32" />
                            <p class="text-sm text-red-600 font-medium">{{ docsStore.error }}</p>
                        </div>

                        <div v-else-if="docsStore.currentDoc" class="fade-in">
                            <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ docsStore.currentDoc.metadata.title }}
                            </h1>
                            <p class="text-sm text-gray-500 mb-8 border-l-2 border-orange-200 pl-4">{{
                                docsStore.currentDoc.metadata.description }}</p>

                            <MarkdownRenderer :content="docsStore.currentDoc.content" :service="service" />
                        </div>

                        <div v-else class="text-center py-20 text-gray-400">
                            <BookOpen :size="48" class="mx-auto mb-4 opacity-10" />
                            <p class="text-xs uppercase font-bold tracking-widest">No documentation found</p>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="p-4 border-t border-gray-100 bg-white flex justify-between items-center">
                    <button v-if="docsStore.currentDoc" @click="goToFullDoc"
                        class="text-[10px] font-bold text-serwin-orange uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform">
                        Open in Full Portal
                        <ArrowRight :size="12" />
                    </button>
                    <p class="text-[9px] text-gray-300 uppercase tracking-tighter">Powered by Serwin Systems Cloud</p>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useRouter } from 'vue-router';
import { X, HelpCircle, BookOpen, AlertCircle, ArrowRight } from 'lucide-vue-next';
import { useDocsStore } from '../store/docsStore';
import MarkdownRenderer from './MarkdownRenderer.vue';

const props = defineProps<{
    service?: string;
    slug?: string;
    isOpen: boolean;
}>();

const emit = defineEmits(['close']);
const docsStore = useDocsStore();
const router = useRouter();

const close = () => {
    emit('close');
};

const goToFullDoc = () => {
    if (props.service && props.slug) {
        router.push({ name: 'docs-content', params: { service: props.service, slug: props.slug } });
        close();
    }
};

watch(() => props.isOpen, (newVal) => {
    if (newVal && props.service && props.slug) {
        docsStore.fetchDocContent(props.service, props.slug);
    }
});

watch(() => props.slug, (newSlug) => {
    if (props.isOpen && props.service && newSlug) {
        docsStore.fetchDocContent(props.service, newSlug);
    }
});
</script>

<style scoped>
.doc-drawer-overlay {
    @apply fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex justify-end;
}

.doc-drawer {
    transition: transform 0.3s ease-out;
}

.slide-enter-from .doc-drawer,
.slide-leave-to .doc-drawer {
    transform: translateX(100%);
}

.slide-enter-to .doc-drawer,
.slide-leave-from .doc-drawer {
    transform: translateX(0);
}

.slide-enter-active,
.slide-leave-active {
    transition: opacity 0.3s ease-out;
}

.slide-enter-from,
.slide-leave-to {
    opacity: 0;
}

.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    @apply bg-transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    @apply bg-gray-100 rounded-full;
}

.fade-in {
    animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.text-serwin-orange {
    color: #ff6b00;
}

.bg-orange-50 {
    background-color: #fff9f5;
}
</style>
