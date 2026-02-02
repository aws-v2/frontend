<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DatabaseActionsDropdown from '../components/DatabaseActionsDropdown.vue'
import type { Database } from '../types/database'

const router = useRouter()

// Mock database data - showing different states
const databases = ref<Database[]>([
    {
        id: '1',
        identifier: 'database-1',
        status: 'available',
        role: 'Regional cluster',
        engine: 'Aurora PostgreSQL',
        regionAz: 'eu-north-1',
        size: '1 instance',
        createdAt: 'Serverless v2 (0.5-...',
        vpc: 'none',
        multiAz: false,
        recommendations: 2
    },
    {
        id: '2',
        identifier: 'database-1-instance-1',
        status: 'creating',
        role: 'Writer instance',
        engine: 'Aurora PostgreSQL',
        regionAz: 'eu-north-1a',
        size: 'Serverless v2 (0.5-...',
        createdAt: 'Serverless v2 (0.5-...',
        vpc: 'none',
        multiAz: false
    }
])

const isSuccessBannerVisible = ref(true)

// Simulate status update
onMounted(() => {
    setTimeout(() => {
        const instance = databases.value.find(db => db.status === 'creating')
        if (instance) {
            instance.status = 'available'
            console.log('Database instance is now available')
        }
    }, 10000) // Change status after 10 seconds
})

const selectedDatabases = ref<string[]>([])
const showList = ref(true) // Toggle between empty state and list

const toggleSelectAll = () => {
    if (selectedDatabases.value.length === databases.value.length) {
        selectedDatabases.value = []
    } else {
        selectedDatabases.value = databases.value.map(db => db.id)
    }
}

const toggleSelect = (id: string) => {
    const index = selectedDatabases.value.indexOf(id)
    if (index > -1) {
        selectedDatabases.value.splice(index, 1)
    } else {
        selectedDatabases.value.push(id)
    }
}

const getStatusColor = (status: Database['status']) => {
    const colors = {
        creating: 'text-orange-600 bg-orange-50',
        available: 'text-green-600 bg-green-50',
        'backing-up': 'text-blue-600 bg-blue-50',
        modifying: 'text-yellow-600 bg-yellow-50',
        deleting: 'text-red-600 bg-red-50',
        stopped: 'text-gray-600 bg-gray-50'
    }
    return colors[status] || 'text-gray-600 bg-gray-50'
}

const handleAction = (actionId: string) => {
    console.log('Action:', actionId, 'on databases:', selectedDatabases.value)
    if (actionId === 'modify' && selectedDatabases.value.length === 1) {
        const dbId = databases.value.find(db => db.id === selectedDatabases.value[0])?.identifier || selectedDatabases.value[0]
        router.push(`/rds/modify/${dbId}`)
    }
}

const createDatabase = () => {
    router.push('/rds/create')
}

const refreshDatabases = () => {
    console.log('Refreshing databases...')
}
</script>

<template>
    <div class="min-h-screen bg-[var(--bg-console)]">
        <!-- Breadcrumbs -->
        <nav
            class="bg-white border-b border-gray-200 px-6 py-2 flex items-center gap-2 text-xs font-medium text-gray-500">
            <a href="#" @click.prevent="router.push('/dashboard')"
                class="hover:text-[var(--aws-blue)] hover:underline uppercase tracking-wider text-[10px]">AWS</a>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span class="text-gray-900">RDS</span>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span class="text-gray-900">Databases</span>
        </nav>

        <div class="px-8 py-6">
            <!-- Success Banner (shown after database creation) -->
            <div v-if="databases.length > 0 && isSuccessBannerVisible"
                class="bg-[#ebf5fb] border border-[#0073bb] rounded-sm p-4 mb-6 flex items-start gap-3">
                <svg class="w-5 h-5 text-[#0073bb] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd" />
                </svg>
                <div class="flex-grow">
                    <p class="text-sm font-bold text-gray-900">Successfully created database database-1</p>
                    <p class="text-xs text-gray-700 mt-1">You can use settings from database-1 to simplify configuration
                        of suggested database add-ons while we finish creating your DB for you.</p>
                </div>
                <div class="flex items-center gap-3">
                    <button
                        class="bg-white border border-gray-300 px-4 py-1.5 rounded-sm text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                        View connection details
                    </button>
                    <button @click="isSuccessBannerVisible = false" class="text-gray-500 hover:text-gray-700 p-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900 mb-1">Databases ({{ databases.length }})</h1>
                    <p class="text-xs text-gray-600">Amazon RDS makes it easy to set up, operate, and scale a relational
                        database in the cloud.</p>
                </div>
                <div class="flex gap-3">
                    <button @click="refreshDatabases" class="btn-aws-secondary flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        Refresh
                    </button>
                    <button v-if="selectedDatabases.length === 1" @click="handleAction('modify')"
                        class="btn-aws-secondary">
                        Modify
                    </button>
                    <DatabaseActionsDropdown v-if="selectedDatabases.length > 0" @action="handleAction" />
                    <button class="btn-aws-secondary">Restore from S3</button>
                    <button @click="createDatabase" class="btn-aws-primary">Create database</button>
                </div>
            </div>

            <!-- Database List (when databases exist) -->
            <div v-if="databases.length > 0" class="aws-card rounded-sm overflow-hidden">
                <!-- Filter bar -->
                <div class="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center gap-4">
                    <div class="flex-grow">
                        <div class="relative">
                            <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2"
                                    stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            <input type="text" placeholder="Filter databases"
                                class="pl-10 pr-4 py-1.5 text-xs border border-gray-300 rounded-sm w-64 focus:outline-none focus:ring-2 focus:ring-[var(--aws-blue)] focus:border-transparent" />
                        </div>
                    </div>
                </div>

                <!-- Table -->
                <div class="overflow-x-auto">
                    <table class="w-full text-xs">
                        <thead class="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th class="py-2 px-4 text-left">
                                    <input type="checkbox" :checked="selectedDatabases.length === databases.length"
                                        @change="toggleSelectAll"
                                        class="w-4 h-4 rounded border-gray-300 text-[var(--aws-blue)] focus:ring-[var(--aws-blue)]" />
                                </th>
                                <th class="py-2 px-4 text-left font-bold text-gray-700">DB identifier</th>
                                <th class="py-2 px-4 text-left font-bold text-gray-700">Status</th>
                                <th class="py-2 px-4 text-left font-bold text-gray-700">Role</th>
                                <th class="py-2 px-4 text-left font-bold text-gray-700">Engine</th>
                                <th class="py-2 px-4 text-left font-bold text-gray-700">Region-az</th>
                                <th class="py-2 px-4 text-left font-bold text-gray-700">Size</th>
                                <th class="py-2 px-4 text-left font-bold text-gray-700">Recommendations</th>
                                <th class="py-2 px-4 text-left font-bold text-gray-700">CPU</th>
                                <th class="py-2 px-4 text-left font-bold text-gray-700">Created</th>
                                <th class="py-2 px-4 text-left font-bold text-gray-700">VPC</th>
                                <th class="py-2 px-4 text-left font-bold text-gray-700">Multi-AZ</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="db in databases" :key="db.id"
                                class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td class="py-3 px-4">
                                    <input type="checkbox" :checked="selectedDatabases.includes(db.id)"
                                        @change="toggleSelect(db.id)"
                                        class="w-4 h-4 rounded border-gray-300 text-[var(--aws-blue)] focus:ring-[var(--aws-blue)]" />
                                </td>
                                <td class="py-3 px-4">
                                    <a href="#" class="text-[var(--aws-blue)] hover:underline font-medium">{{
                                        db.identifier }}</a>
                                </td>
                                <td class="py-3 px-4">
                                    <span
                                        class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium"
                                        :class="getStatusColor(db.status)">
                                        <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                                        {{ db.status.charAt(0).toUpperCase() + db.status.slice(1) }}
                                    </span>
                                </td>
                                <td class="py-3 px-4 text-gray-700">{{ db.role }}</td>
                                <td class="py-3 px-4 text-gray-700">{{ db.engine }}</td>
                                <td class="py-3 px-4 text-gray-700">{{ db.regionAz }}</td>
                                <td class="py-3 px-4 text-gray-700">{{ db.size }}</td>
                                <td class="py-3 px-4">
                                    <span v-if="db.recommendations"
                                        class="inline-flex items-center gap-1 text-[var(--aws-blue)]">
                                        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                        </svg>
                                        {{ db.recommendations }} recommendation
                                    </span>
                                    <span v-else class="text-gray-400">-</span>
                                </td>
                                <td class="py-3 px-4 text-gray-700">{{ db.cpu || '-' }}</td>
                                <td class="py-3 px-4 text-gray-700">{{ db.createdAt }}</td>
                                <td class="py-3 px-4 text-gray-700">{{ db.vpc }}</td>
                                <td class="py-3 px-4 text-gray-700">{{ db.multiAz ? 'Yes' : 'No' }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Empty State (when no databases) -->
            <div v-else class="aws-card p-12 rounded-sm text-center">
                <div class="max-w-2xl mx-auto">
                    <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    </svg>
                    <h2 class="text-xl font-bold text-gray-900 mb-2">No databases</h2>
                    <p class="text-sm text-gray-600 mb-6">You don't have any RDS database instances yet. Create your
                        first
                        database to get started.</p>
                    <button @click="createDatabase" class="btn-aws-primary">Create database</button>
                </div>
            </div>

            <!-- Info Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div class="aws-card p-5 rounded-sm">
                    <h3 class="text-sm font-bold text-gray-900 mb-2">Getting started</h3>
                    <p class="text-xs text-gray-600 mb-3">Learn how to create and manage your first database instance.
                    </p>
                    <a href="#" class="text-xs font-bold text-[var(--aws-blue)] hover:underline">View tutorial →</a>
                </div>
                <div class="aws-card p-5 rounded-sm">
                    <h3 class="text-sm font-bold text-gray-900 mb-2">Database engines</h3>
                    <p class="text-xs text-gray-600 mb-3">Choose from Aurora, MySQL, PostgreSQL, MariaDB, Oracle, and
                        SQL Server.</p>
                    <a href="#" class="text-xs font-bold text-[var(--aws-blue)] hover:underline">Learn more →</a>
                </div>
                <div class="aws-card p-5 rounded-sm">
                    <h3 class="text-sm font-bold text-gray-900 mb-2">Best practices</h3>
                    <p class="text-xs text-gray-600 mb-3">Optimize performance, security, and cost for your databases.
                    </p>
                    <a href="#" class="text-xs font-bold text-[var(--aws-blue)] hover:underline">View guide →</a>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* AWS Console specific styles */
</style>
