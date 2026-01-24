<script setup lang="ts">
import { computed } from 'vue'
import BaseWidget from '@/shared/components/BaseWidget.vue'
import { useToastStore } from '@/shared/store/toastStore'
import { useAuthStore } from '@/modules/auth/store/authStore'

const toastStore = useToastStore()
const authStore = useAuthStore()

const recentlyVisitedServices = ['EC2', 'Lambda', 'S3', 'IAM', 'Render', 'RDS', 'Gamelift', 'Gamestream', 'Sagemaker']

const chunkedServices = computed(() => {
    const chunks = []
    for (let i = 0; i < recentlyVisitedServices.length; i += 5) {
        chunks.push(recentlyVisitedServices.slice(i, i + 5))
    }
    return chunks
})

const getServiceLink = (service: string) => {
    // If registration is complete, go to the service dashboard (e.g. S3), else go to setup
    if (authStore.registrationComplete) {
        if (service === 'S3') return '/s3'
        if (service === 'Lambda') return '/lambda'
        if (service === 'Render') return '/render'
        if (service === 'RDS') return '/rds'
        // New services - link to themselves or fallback to dashboard if not yet implemented
        if (['Gamelift', 'Gamestream', 'Sagemaker'].includes(service)) {
            // return `/${service.toLowerCase()}` // Use this once routes exist
            return '/dashboard'
        }
        return '/dashboard'
    }
    return '/auth/complete-setup'
}

const triggerAction = (action: string) => {
    toastStore.addToast(`${action} action triggered.`, 'info')
}
</script>

<template>
    <div class="min-h-screen bg-[var(--bg-console)] font-sans pb-12">
        <!-- Dashboard Header -->
        <div class="px-16 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div class="flex items-baseline gap-2">
                <h1 class="text-xl font-bold text-gray-800 dark:text-gray-100">Console home</h1>
                <span
                    class="text-[10px] text-[var(--aws-blue)] hover:underline cursor-pointer font-bold uppercase tracking-tight">Info</span>
            </div>

            <div class="flex items-center gap-2">
                <button
                    class="px-4 py-1.5 text-xs font-bold border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-[var(--aws-blue)] hover:bg-gray-50 transition-colors">
                    Reset to default layout
                </button>
                <button
                    class="px-4 py-1.5 text-xs font-bold bg-[var(--aws-orange)] text-white hover:opacity-90 transition-opacity flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4" />
                    </svg>
                    Add widgets
                </button>
            </div>
        </div>

        <!-- Widget Grid Area -->
        <div
            class="px-16 max-w-[100%] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">

            <!-- Recently Visited -->
            <BaseWidget title="Recently visited" show-info
                :class="chunkedServices.length > 1 ? 'lg:col-span-2' : 'lg:col-span-1'">
                <div class="p-4 flex gap-8">
                    <div v-for="(chunk, idx) in chunkedServices" :key="idx" class="flex-1 space-y-4">
                        <router-link v-for="service in chunk" :key="service" :to="getServiceLink(service)"
                            class="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                            <div
                                class="w-8 h-8 bg-gray-100 dark:bg-gray-600 flex items-center justify-center font-bold text-[10px] text-gray-500 dark:text-gray-300">
                                {{ service[0] }}</div>
                            <span class="text-xs font-bold text-gray-700 dark:text-gray-200">{{ service }}</span>
                        </router-link>
                    </div>
                </div>
                <template #footer>View all services</template>
            </BaseWidget>

            <!-- AWS Health -->
            <BaseWidget title="Health Summary" show-info>
                <div class="p-6 space-y-6">
                    <div v-for="item in [
                        { label: 'Open issues', val: 0, period: 'Past 7 days' },
                        { label: 'Scheduled changes', val: 0, period: 'Upcoming and past 7 days' }
                    ]" :key="item.label"
                        class="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                        <div>
                            <p class="text-xs font-bold text-gray-500">{{ item.label }}</p>
                            <p class="text-2xl font-black">{{ item.val }}</p>
                        </div>
                        <p class="text-[9px] text-gray-400 self-end font-bold">{{ item.period }}</p>
                    </div>
                </div>
                <template #footer>Go to Serwin Health</template>
            </BaseWidget>

            <!-- Cost and usage -->
            <BaseWidget title="Cost and usage" show-info>
                <div class="p-6 grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter">
                            Current month
                        </p>
                        <p class="text-lg font-black text-gray-400 dark:text-gray-300">Unable to load</p>
                    </div>
                    <div>
                        <p class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter">
                            Cost breakdown
                        </p>
                        <p class="text-lg font-black text-gray-400 dark:text-gray-300">Unable to load</p>
                    </div>
                </div>
                <template #footer>Go to Billing and Cost Management</template>
            </BaseWidget>

            <!-- Solutions -->
            <BaseWidget title="Solutions" class="lg:col-span-2">
                <div class="p-0">
                    <div class="flex border-b border-gray-100 dark:border-gray-700">
                        <button v-for="tab in ['Cloud Architect', 'Platform Engineer', 'AI Ops']" :key="tab"
                            class="px-4 py-3 text-[11px] font-bold text-gray-500 hover:text-gray-900 border-b-2 border-transparent hover:border-[var(--aws-blue)] transition-all">
                            {{ tab }}
                        </button>
                    </div>
                    <div class="p-6 space-y-4">
                        <p class="text-xs font-medium text-gray-700 dark:text-gray-400 leading-relaxed">
                            Automate large-scale server migrations to Serwin Cloud using templates.
                        </p>
                        <div class="text-[10px] font-bold text-[var(--aws-blue)]">Time to complete: 20 mins</div>
                    </div>
                </div>
                <template #footer>Go to Serwin Solutions Library</template>
            </BaseWidget>

            <!-- Explore AWS -->
            <BaseWidget title="Explore Serwin">
                <div class="p-6 space-y-6">
                    <div v-for="prod in ['S3 Storage', 'Lambda Functions', 'S3 Express']" :key="prod"
                        class="group cursor-pointer">
                        <h4
                            class="text-xs font-bold text-gray-800 dark:text-gray-200 group-hover:text-[var(--aws-blue)] flex items-center gap-1 transition-colors">
                            {{ prod }}
                            <svg class="w-2.5 h-2.5 opacity-40" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                            </svg>
                        </h4>
                        <p class="text-[10px] text-gray-500 leading-normal mt-1">Scale storage and request performance
                            for your data
                            lake.</p>
                    </div>
                </div>
            </BaseWidget>

            <!-- Security -->
            <BaseWidget title="Security" show-info>
                <div class="p-6">
                    <div class="border border-red-200 bg-red-50/20 p-4 flex gap-3">
                        <svg class="w-4 h-4 text-red-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clip-rule="evenodd" />
                        </svg>
                        <div>
                            <p class="text-[10px] font-bold">Access denied to:</p>
                            <button
                                class="mt-2 text-[10px] font-black border border-black px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white active:shadow-none hover:bg-gray-50 transition-all">
                                Diagnose with Serwin Q
                            </button>
                        </div>
                    </div>
                </div>
                <template #footer>Go to Security Hub</template>
            </BaseWidget>

        </div>

        <!-- Bottom Banner Overlay -->
        <div
            class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-3 px-8 flex justify-between items-center text-[11px]">
            <div class="flex items-center gap-4">
                <span class="font-bold text-[var(--aws-blue)] hover:underline cursor-pointer">Want to see another
                    widget? Tell
                    us!</span>
            </div>
            <button
                class="flex items-center gap-1 font-bold bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-1.5 hover:bg-gray-50 transition-colors">
                <svg class="w-3.5 h-3.5 text-[var(--aws-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4" />
                </svg>
                Add widgets
            </button>
        </div>
    </div>
</template>
