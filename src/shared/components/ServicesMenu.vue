<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
    isOpen: boolean
}>()

const emit = defineEmits(['close'])

const selectedCategory = ref('Recently visited')

const categories = [
    { id: 'recently', label: 'Recently visited', items: ['Console Home', 'Support'] },
    { id: 'favorites', label: 'Favorites', items: [] },
    { id: 'all', label: 'All applications', items: [] },
    { id: 'all-serv', label: 'All services', items: [] },
    { id: 'compute', label: 'Compute', items: ['EC2', 'Lambda', 'Lightsail'] },
    { id: 'storage', label: 'Storage', items: ['S3', 'EFS', 'Glacier'] },
    { id: 'databases', label: 'Data Base', items: ['RDS', 'DynamoDB', 'ElastiCache'] },
]

const currentItems = (label: string) => {
    return categories.find(c => c.label === label)?.items || []
}
</script>

<template>
    <Transition name="fade">
        <div v-if="isOpen" class="fixed inset-0 z-[150] bg-black/40" @click="emit('close')"></div>
    </Transition>

    <Transition name="slide">
        <div v-if="isOpen"
            class="fixed top-0 left-0 bottom-0 w-[550px] z-[160] bg-[#16191f] text-white flex shadow-2xl border-r border-gray-800">
            <!-- Sidebar (Category List) -->
            <div class="w-[200px] border-r border-gray-800 flex flex-col pt-4 overflow-y-auto custom-scrollbar">
                <div v-for="(cat, idx) in categories" :key="cat.id" @mouseenter="selectedCategory = cat.label"
                    class="px-5 py-2 cursor-pointer text-[12px] font-bold transition-colors" :class="[
                        selectedCategory === cat.label ? 'text-[var(--aws-blue)] bg-gray-800/50' : 'text-gray-400 hover:text-white hover:bg-gray-800/30',
                        idx === 3 ? 'border-b border-gray-800 mb-4 pb-4' : ''
                    ]">
                    {{ cat.label }}
                </div>
            </div>

            <!-- Content Area (Selected Category Details) -->
            <div class="flex-1 p-6 relative">
                <div class="flex justify-between items-center mb-10">
                    <h2 class="text-xl font-bold">{{ selectedCategory }}</h2>
                    <button @click="emit('close')" class="p-2 hover:bg-gray-800 rounded transition-colors group">
                        <svg class="w-5 h-5 opacity-40 group-hover:opacity-100" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>

                <div class="space-y-6">
                    <div v-if="selectedCategory === 'Recently visited'">
                        <div class="mb-8 group cursor-pointer">
                            <h3
                                class="text-sm font-bold flex items-center gap-2 group-hover:text-[var(--aws-blue)] transition-colors">
                                Console Home
                                <svg class="w-3 h-3 opacity-0 group-hover:opacity-100" fill="currentColor"
                                    viewBox="0 0 20 20">
                                    <path
                                        d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                </svg>
                            </h3>
                            <p class="text-[11px] text-gray-500 mt-1">View resource insights, service shortcuts, and
                                feature updates</p>
                        </div>
                        <div class="group cursor-pointer">
                            <h3
                                class="text-sm font-bold flex items-center gap-2 group-hover:text-[var(--aws-blue)] transition-colors">
                                Support
                                <svg class="w-3 h-3 opacity-0 group-hover:opacity-100" fill="currentColor"
                                    viewBox="0 0 20 20">
                                    <path
                                        d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                </svg>
                            </h3>
                            <p class="text-[11px] text-gray-500 mt-1">Contact AWS for technical and account support.</p>
                        </div>
                    </div>

                    <div v-else class="grid grid-cols-1 gap-4">
                        <router-link v-for="item in currentItems(selectedCategory)" :key="item"
                            to="/auth/complete-setup" @click="emit('close')"
                            class="text-xs font-medium text-gray-400 hover:text-[var(--aws-blue)] cursor-pointer transition-colors flex items-center gap-2 group">
                            <div
                                class="w-1.5 h-1.5 bg-gray-700 rounded-full group-hover:bg-[var(--aws-blue)] transition-colors">
                            </div>
                            {{ item }}
                        </router-link>
                        <p v-if="currentItems(selectedCategory).length === 0" class="text-xs text-gray-600 italic">No
                            items found in this category.</p>
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-enter-from,
.slide-leave-to {
    transform: translateX(-100%);
}

.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #3c444d;
    border-radius: 10px;
}
</style>
