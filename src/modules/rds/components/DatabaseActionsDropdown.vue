<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isOpen = ref(false)

const actions = [
    { id: 'stop', label: 'Stop temporarily', divider: false },
    { id: 'delete', label: 'Delete', divider: false },
    { id: 'ec2-conn', label: 'Set up EC2 connection', divider: false },
    { id: 'lambda-conn', label: 'Set up Lambda connection', divider: false },
    { id: 'migrate-ec2', label: 'Migrate data from EC2 database', divider: false },
    { id: 'add-region', label: 'Add AWS Region', divider: false },
    { id: 'add-reader', label: 'Add reader', divider: false },
    { id: 'blue-green', label: 'Create blue/green deployment', divider: false },
    { id: 'create-clone', label: 'Create clone', divider: false },
    { id: 'promote', label: 'Promote', divider: true },
    { id: 'snapshot', label: 'Take snapshot', divider: false },
    { id: 'restore', label: 'Restore to point in time', divider: false },
    { id: 'export-s3', label: 'Export to Amazon S3', divider: false },
    { id: 'auto-scaling', label: 'Add replica auto scaling', divider: true },
    { id: 'zero-etl', label: 'Create zero-ETL integration', divider: false },
    { id: 'rds-proxy', label: 'Create RDS Proxy', divider: false },
    { id: 'elasticache', label: 'Create ElastiCache cluster', divider: false },
    { id: 'data-api', label: 'Enable RDS Data API', divider: false },
]

const emit = defineEmits<{
    action: [actionId: string]
}>()

const handleAction = (actionId: string) => {
    emit('action', actionId)
    isOpen.value = false
}

const closeMenu = () => {
    isOpen.value = false
}

onMounted(() => {
    window.addEventListener('click', closeMenu)
})

onUnmounted(() => {
    window.removeEventListener('click', closeMenu)
})
</script>

<template>
    <div class="relative inline-block" @click.stop>
        <button @click="isOpen = !isOpen" class="btn-aws-secondary flex items-center gap-2">
            Actions
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M19 9l-7 7-7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </button>

        <!-- Dropdown Menu -->
        <Transition name="dropdown">
            <div v-if="isOpen"
                class="absolute right-0 mt-2 w-64 bg-white rounded-sm shadow-lg border border-gray-200 py-1 z-50">
                <template v-for="action in actions" :key="action.id">
                    <div v-if="action.divider" class="border-t border-gray-200 my-1"></div>
                    <button @click="handleAction(action.id)"
                        class="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 transition-colors"
                        :class="action.id === 'delete' ? 'text-red-600 hover:bg-red-50' : ''">
                        {{ action.label }}
                    </button>
                </template>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
    transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}
</style>
