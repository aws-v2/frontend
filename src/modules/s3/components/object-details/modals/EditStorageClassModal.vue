<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
    isOpen: boolean
    currentStorageClass?: string
}>()

const emit = defineEmits(['close', 'save'])

const selectedClass = ref(props.currentStorageClass || 'Standard')

const storageClasses = [
    {
        name: 'Standard',
        description: 'General purpose storage of any type of data, typically used for frequently accessed data.',
        availabilityZones: '≥ 3',
        minStorageDuration: 'None',
        retrievalFee: 'None'
    },
    {
        name: 'Intelligent-Tiering',
        description: 'Automatic cost savings for data with unknown or changing access patterns.',
        availabilityZones: '≥ 3',
        minStorageDuration: 'None',
        retrievalFee: 'None'
    },
    {
        name: 'Standard-IA',
        description: 'For data that is accessed less frequently, but requires rapid access when needed.',
        availabilityZones: '≥ 3',
        minStorageDuration: '30 days',
        retrievalFee: 'Per GB'
    },
    {
        name: 'One Zone-IA',
        description: 'For data that is accessed less frequently, but requires rapid access when needed. Stores data in a single AZ.',
        availabilityZones: '1',
        minStorageDuration: '30 days',
        retrievalFee: 'Per GB'
    },
    {
        name: 'Glacier Instant Retrieval',
        description: 'For archive data that is rarely accessed (once a quarter) and requires immediate retrieval in milliseconds.',
        availabilityZones: '≥ 3',
        minStorageDuration: '90 days',
        retrievalFee: 'Per GB'
    },
    {
        name: 'Glacier Flexible Retrieval',
        description: 'For archive data that is rarely accessed (once or twice a year) and doesn\'t require immediate access.',
        availabilityZones: '≥ 3',
        minStorageDuration: '90 days',
        retrievalFee: 'Per GB'
    },
    {
        name: 'Glacier Deep Archive',
        description: 'For long-term archive and digital preservation with retrieval times within 12 hours.',
        availabilityZones: '≥ 3',
        minStorageDuration: '180 days',
        retrievalFee: 'Per GB'
    }
]

const handleSave = () => {
    emit('save', selectedClass.value)
    emit('close')
}
</script>

<template>
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
        <div class="bg-white rounded-sm shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <!-- Header -->
            <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h2 class="text-lg font-bold text-gray-900">Edit storage class</h2>
                <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Body -->
            <div class="p-6 overflow-y-auto flex-1">
                <p class="text-sm text-gray-600 mb-6 font-medium">
                    Amazon S3 offers a range of storage classes designed for different use cases. You can choose a
                    storage class for each object in your bucket.
                </p>

                <div class="space-y-3">
                    <label v-for="storageClass in storageClasses" :key="storageClass.name"
                        class="block border rounded-sm p-4 cursor-pointer transition-colors"
                        :class="selectedClass === storageClass.name ? 'border-[var(--aws-blue)] bg-blue-50/50' : 'border-gray-300 hover:border-gray-400'">
                        <div class="flex items-start gap-4">
                            <input type="radio" v-model="selectedClass" :value="storageClass.name"
                                class="mt-1 w-4 h-4 text-[var(--aws-blue)] border-gray-300 focus:ring-[var(--aws-blue)]">
                            <div class="flex-1">
                                <div class="flex justify-between items-center mb-1">
                                    <span class="text-sm font-bold text-gray-900">{{ storageClass.name }}</span>
                                </div>
                                <p class="text-[11px] text-gray-600 leading-relaxed mb-2">{{ storageClass.description }}
                                </p>
                                <div class="flex gap-6 text-[10px] text-gray-500 font-bold uppercase tracking-tight">
                                    <span>Availability Zones: {{ storageClass.availabilityZones }}</span>
                                    <span>Min storage duration: {{ storageClass.minStorageDuration }}</span>
                                    <span>Retrieval fee: {{ storageClass.retrievalFee }}</span>
                                </div>
                            </div>
                        </div>
                    </label>
                </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
                <button @click="$emit('close')"
                    class="px-4 py-2 text-sm font-bold border border-gray-400 rounded-sm hover:bg-gray-100 transition-colors bg-white">
                    Cancel
                </button>
                <button @click="handleSave"
                    class="px-4 py-2 text-sm font-bold bg-[var(--aws-orange)] text-white rounded-sm hover:opacity-90 transition-colors">
                    Save changes
                </button>
            </div>
        </div>
    </div>
</template>
