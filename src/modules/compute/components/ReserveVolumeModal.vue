<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="bg-white w-full max-w-lg border-2 border-[#232f3e]">
        <!-- Header -->
        <div class="flex items-center justify-between px-8 py-6 border-b-2 border-[#eaeded]">
          <h2 class="text-[13px] font-black uppercase tracking-[0.3em] text-[#232f3e]">Reserve Volume</h2>
          <button @click="close" class="text-[#232f3e] hover:text-rose-600 text-lg leading-none">&times;</button>
        </div>

        <!-- Body -->
        <div class="px-8 py-6 space-y-6">
          <!-- Reserve for -->
          <div>
            <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-[#5f6b7a] mb-2">
              Reserve For (Instance ID / Name)
            </label>
            <input
              v-model="reservedTo"
              list="existing-instances"
              type="text"
              placeholder="e.g. i-0123456789 or a name for a VM you're about to create"
              class="w-full px-4 py-3 border-2 border-[#eaeded] text-sm focus:outline-none focus:border-blue-600"
            />
            <datalist id="existing-instances">
              <option v-for="inst in existingInstances" :key="inst" :value="inst" />
            </datalist>
            <p class="mt-2 text-[11px] text-[#5f6b7a]">
              This doesn't have to exist yet — you can reserve for a VM you're about to create.
            </p>
          </div>

          <!-- Expiry -->
          <div>
            <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-[#5f6b7a] mb-2">
              Reservation Expiry
            </label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="preset in expiryPresets"
                :key="preset.label"
                @click="selectPreset(preset)"
                :class="[
                  'px-4 py-2 border-2 text-[10px] font-black uppercase tracking-[0.15em] transition-all',
                  selectedPreset === preset.label
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-[#eaeded] text-[#232f3e] hover:border-blue-600'
                ]"
              >
                {{ preset.label }}
              </button>
              <button
                @click="selectPreset(customPreset)"
                :class="[
                  'px-4 py-2 border-2 text-[10px] font-black uppercase tracking-[0.15em] transition-all',
                  selectedPreset === 'Custom'
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-[#eaeded] text-[#232f3e] hover:border-blue-600'
                ]"
              >
                Custom
              </button>
            </div>

            <input
              v-if="selectedPreset === 'Custom'"
              v-model="customExpiry"
              type="datetime-local"
              :min="minDateTime"
              class="mt-3 w-full px-4 py-3 border-2 border-[#eaeded] text-sm focus:outline-none focus:border-blue-600"
            />

            <p class="mt-2 text-[11px] text-[#5f6b7a]">
              If nothing attaches to this volume before it expires, the reservation is released automatically.
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
            :disabled="!isValid"
            class="px-8 py-4 bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[#232f3e] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirm Reservation
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
  existingInstances: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const reservedTo = ref('')
const selectedPreset = ref('1 Hour')
const customExpiry = ref('')

const expiryPresets = [
  { label: '15 Minutes', minutes: 15 },
  { label: '1 Hour', minutes: 60 },
  { label: '6 Hours', minutes: 360 },
  { label: '24 Hours', minutes: 1440 }
]
const customPreset = { label: 'Custom', minutes: null }

const minDateTime = computed(() => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
})

function selectPreset(preset) {
  selectedPreset.value = preset.label
}

const isValid = computed(() => {
  if (!reservedTo.value.trim()) return false
  if (selectedPreset.value === 'Custom') return !!customExpiry.value
  return true
})

function computeExpiresAt() {
  if (selectedPreset.value === 'Custom') {
    return new Date(customExpiry.value).toISOString()
  }
  const preset = expiryPresets.find(p => p.label === selectedPreset.value)
  const expires = new Date()
  expires.setMinutes(expires.getMinutes() + preset.minutes)
  return expires.toISOString()
}

function confirm() {
  if (!isValid.value) return
  emit('confirm', {
    reservedTo: reservedTo.value.trim(),
    expiresAt: computeExpiresAt()
  })
  close()
}

function close() {
  emit('update:modelValue', false)
}

// reset fields each time the modal opens
watch(() => props.modelValue, (open) => {
  if (open) {
    reservedTo.value = ''
    selectedPreset.value = '1 Hour'
    customExpiry.value = ''
  }
})
</script>