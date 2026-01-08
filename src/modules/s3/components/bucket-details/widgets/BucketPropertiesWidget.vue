<script setup lang="ts">
import { computed } from 'vue'
import { useToastStore } from '@/shared/store/toastStore'

const props = defineProps<{
    bucketName: string
    region?: string
    createdAt?: string
    arn?: string
}>()

const toastStore = useToastStore()

const bucketArn = computed(() => props.arn || `arn:serw:s3:::${props.bucketName}`)

const formattedDate = computed(() => {
    if (!props.createdAt) return '-'
    return new Date(props.createdAt).toLocaleString()
})

const copyArn = () => {
    navigator.clipboard.writeText(bucketArn.value)
    toastStore.addToast(`ARN copied to clipboard: ${bucketArn.value}`, 'success')
}
</script>

<template>
    <div class="col-span-2 border border-gray-200 rounded-sm bg-white p-4 h-full">
        <h2 class="text-sm font-bold text-gray-900 mb-4">Bucket Properties</h2>
        <div class="grid grid-cols-2 gap-8">
            <div class="space-y-4">
                <div>
                    <p class="text-[10px] text-gray-500 font-bold uppercase tracking-tight mb-1">AWS Region</p>
                    <p class="text-xs text-gray-900 font-medium">{{ region || 'Europe (Stockholm) eu-north-1' }}</p>
                </div>
                <div>
                    <p class="text-[10px] text-gray-500 font-bold uppercase tracking-tight mb-1">Creation date</p>
                    <p class="text-xs text-gray-900 font-medium">{{ formattedDate }}</p>
                </div>
            </div>
            <div>
                <p class="text-[10px] text-gray-500 font-bold uppercase tracking-tight mb-1">Amazon Resource Name (ARN)
                </p>
                <p @click="copyArn"
                    class="text-xs text-[var(--aws-blue)] font-bold break-all hover:underline cursor-pointer">
                    {{ bucketArn }}
                </p>
            </div>
        </div>
    </div>
</template>
