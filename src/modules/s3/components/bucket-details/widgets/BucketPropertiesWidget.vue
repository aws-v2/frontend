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
  <div class="bg-white border-2 border-[#eaeded] p-8 shadow-sm h-full w-full group">
    <!-- Title -->
    <h2 class="text-xs font-black text-[#232f3e] uppercase tracking-widest mb-8 flex items-center gap-3 italic">
      <div class="w-2 h-2 bg-[#ff9900]"></div>
      Bucket Properties
    </h2>

    <!-- Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <!-- LEFT COLUMN -->
      <div class="space-y-8">
        <!-- Region -->
        <div>
          <p class="text-[10px] text-[#879196] font-black uppercase tracking-widest mb-3 italic">
            AWS Region
          </p>
          <p class="text-sm text-[#232f3e] font-black inline-flex items-center gap-2 uppercase italic tracking-tight">
            <span class="w-2 h-2 bg-[#ff9900]"></span>
            {{ region || 'Europe (Stockholm) eu-north-1' }}
          </p>
        </div>

        <!-- Creation Date -->
        <div>
          <p class="text-[10px] text-[#879196] font-black uppercase tracking-widest mb-3 italic">
            Creation Date
          </p>
          <p class="text-sm text-[#232f3e] font-black uppercase tracking-tight italic">
            {{ formattedDate }}
          </p>
        </div>
      </div>

      <!-- RIGHT COLUMN -->
      <div>
        <p class="text-[10px] text-[#879196] font-black uppercase tracking-widest mb-4 italic">
          Amazon Resource Name (ARN)
        </p>

        <div @click="copyArn"
          class="relative bg-[#fafafa] border-2 border-[#eaeded] px-5 py-4 cursor-pointer hover:border-[#ff9900] transition-all group/arn shadow-sm">
          <!-- ARN Text -->
          <p
            class="text-xs text-[#545b64] font-black whitespace-nowrap overflow-x-auto hover:text-[#ff9900] transition-colors uppercase tracking-tight italic pr-8">
            {{ bucketArn }}
          </p>

          <!-- Copy Icon -->
          <div class="absolute top-4 right-4 text-[#879196] group-hover/arn:text-[#ff9900] transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
          </div>
        </div>
        <p class="mt-4 text-[10px] text-[#879196] font-black uppercase tracking-widest italic">Click to copy ARN</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Removed glass-panel styles */
</style>
