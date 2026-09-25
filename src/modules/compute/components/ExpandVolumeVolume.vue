<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="bg-white w-full max-w-lg border-2 border-[#232f3e]">
        <!-- Header -->
        <div class="flex items-center justify-between px-8 py-6 border-b-2 border-[#eaeded]">
          <h2 class="text-[13px] font-black uppercase tracking-[0.3em] text-[#232f3e]">Expand Volume</h2>
          <button @click="close" class="text-[#232f3e] hover:text-rose-600 text-lg leading-none">&times;</button>
        </div>

        <!-- Body -->
        <div class="px-8 py-6 space-y-6">
          <div>
            <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-[#5f6b7a] mb-2">
              Current Size
            </label>
            <p class="text-sm font-black text-[#232f3e]">{{ currentSize }} GiB</p>
          </div>

          <div>
            <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-[#5f6b7a] mb-2">
              New Size (GiB)
            </label>
            <input
              v-model.number="newSize"
              type="number"
              :min="currentSize + 1"
              max="16384"
              class="w-full px-4 py-3 border-2 border-[#eaeded] text-sm font-black focus:outline-none focus:border-blue-600"
            />
            <p v-if="errorMessage" class="mt-2 text-[11px] text-rose-600 font-bold">
              {{ errorMessage }}
            </p>
            <p v-else class="mt-2 text-[11px] text-[#5f6b7a]">
              Must be larger than the current size. Volumes cannot be shrunk.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-4 px-8 py-6 border-t-2 border-[#eaeded]">
          <button
            @click="close"
            class="px-8 py-4 border-2 border-[#232f3e] text-[#232f3e] text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[#232f3e] hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            @click="confirm"
            :disabled="!isValid || isSubmitting"
            class="px-8 py-4 bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[#232f3e] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? 'Expanding...' : 'Confirm Expansion' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  currentSize: { type: Number, required: true },
  isSubmitting: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const newSize = ref(props.currentSize + 10)
const isSubmitting = ref(false)

const errorMessage = computed(() => {
  if (newSize.value === null || newSize.value === '') return null
  if (newSize.value <= props.currentSize) return 'New size must be larger than the current size.'
  if (newSize.value > 16384) return 'Maximum volume size is 16384 GiB.'
  return null
})

const isValid = computed(() => {
  return newSize.value != null && newSize.value > props.currentSize && newSize.value <= 16384
})

function confirm() {
  if (!isValid.value) return
  emit('confirm', newSize.value)
}

function close() {
  emit('update:modelValue', false)
}



async function onExpandConfirm(newSize) {
  isExpanding.value = true
  try {
    await api.expandVolume(volume.value.id, newSize)
    showExpandModal.value = false
  } finally {
    isExpanding.value = false
  }
}
watch(() => props.modelValue, (open) => {
  if (open) {
    newSize.value = props.currentSize + 10
    isSubmitting.value = false
  }
})
</script>