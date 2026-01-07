<script setup lang="ts">
defineProps<{
    bucketName: string
    region?: string
    arn?: string
}>()
</script>

<template>
    <div class="col-span-2 border border-gray-200 rounded-sm bg-white p-4">
        <h2 class="text-lg font-bold text-gray-900 mb-4">Bucket Properties</h2>
        <div class="grid grid-cols-2 gap-8">
            <div>
                <p class="text-xs text-gray-600 font-bold mb-1">AWS Region</p>
                <p class="text-xs text-gray-900">{{ region || 'Europe (Stockholm) eu-north-1' }}</p>
            </div>
            <div>
                <p class="text-xs text-gray-600 font-bold mb-1">Amazon Resource Name (ARN)</p>
                <p class="text-xs text-gray-900 break-all">{{ arn || `arn:aws:s3:::${bucketName}` }}</p>
            </div>
        </div>
    </div>
</template>
