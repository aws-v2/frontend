<script setup lang="ts">
import { computed, watch } from 'vue'
import { useVMEvents, type VMEventType } from '@/modules/sagemaker/composables/useVMEvents'

const props = defineProps<{ sessionId: string }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const { status, instanceId, isProvisioned, isError, errorPayload, isConnected } =
  useVMEvents(props.sessionId)

// Auto-close after a brief success pause
watch(isProvisioned, (val) => {
  if (val) setTimeout(() => emit('close'), 3500)
})

// ─── Timeline steps ───────────────────────────────────────────────────────────
type Step = { id: VMEventType; label: string; desc: string }
const STEPS: Step[] = [
  { id: 'INSTANCE_STARTED',       label: 'Instance started',       desc: 'VM is booting up' },
  { id: 'PROVISIONING_PROGRESS',  label: 'Provisioning in progress', desc: 'Installing dependencies' },
  { id: 'INSTANCE_PROVISIONED',   label: 'Provisioned',            desc: 'VM ready for workload' },
]

const STEP_ORDER: VMEventType[] = [
  'INSTANCE_STARTED',
  'PROVISIONING_PROGRESS',
  'INSTANCE_PROVISIONED',
]

// Compute index of the current status in the ordered steps
const currentIdx = computed(() => STEP_ORDER.indexOf(status.value as VMEventType))

const stepState = (step: Step): 'done' | 'active' | 'pending' | 'error' => {
  if (isError.value) return 'error' // overridden below per-step
  const stepIdx = STEP_ORDER.indexOf(step.id)
  if (stepIdx < currentIdx.value) return 'done'
  if (stepIdx === currentIdx.value) return isProvisioned.value ? 'done' : 'active'
  return 'pending'
}
</script>

<template>
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-[300] flex items-end justify-end p-6 pointer-events-none"
  >
    <!-- Card -->
    <div
      class="pointer-events-auto w-80 bg-[#0f172a] border border-[#1e293b] rounded-xl shadow-2xl overflow-hidden"
      style="backdrop-filter: blur(12px)"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-[#1e293b]">
        <div class="flex items-center gap-2">
          <!-- Connection dot -->
          <span
            class="w-2 h-2 rounded-full flex-shrink-0"
            :class="isConnected ? 'bg-amber-400 animate-pulse' : isProvisioned ? 'bg-emerald-400' : isError ? 'bg-red-400' : 'bg-gray-600'"
          />
          <span class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            VM Provisioning
          </span>
        </div>
        <button
          class="text-slate-600 hover:text-slate-300 transition-colors text-base leading-none"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>

      <!-- Session id -->
      <div class="px-4 py-2 border-b border-[#1e293b]">
        <p class="text-[9px] text-slate-600 font-mono uppercase tracking-widest">
          Session
        </p>
        <p class="text-[10px] font-mono text-slate-400 truncate">{{ sessionId }}</p>
        <p v-if="instanceId" class="text-[10px] font-mono text-amber-400 truncate mt-0.5">
          Instance: {{ instanceId }}
        </p>
      </div>

      <!-- Error State -->
      <div v-if="isError" class="px-4 py-4">
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div class="min-w-0">
            <p class="text-[11px] font-bold text-red-400 uppercase tracking-wide">Provisioning Failed</p>
            <p v-if="errorPayload" class="text-[9px] font-mono text-slate-500 mt-1 break-words">
              {{ typeof errorPayload === 'object' ? JSON.stringify(errorPayload, null, 2) : String(errorPayload) }}
            </p>
          </div>
        </div>
        <button
          class="mt-3 w-full py-1.5 border border-red-800 text-red-400 text-[9px] font-black uppercase tracking-[0.15em] hover:bg-red-950 transition-all rounded"
          @click="emit('close')"
        >
          Dismiss
        </button>
      </div>

      <!-- Timeline Steps -->
      <div v-else class="px-4 py-4 space-y-3">
        <div
          v-for="(step, i) in STEPS"
          :key="step.id"
          class="flex items-start gap-3"
        >
          <!-- Step indicator -->
          <div class="flex flex-col items-center flex-shrink-0">
            <div
              class="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500"
              :class="{
                'bg-emerald-500/20 border border-emerald-500': stepState(step) === 'done',
                'bg-amber-500/20 border border-amber-400': stepState(step) === 'active',
                'bg-slate-800 border border-slate-700': stepState(step) === 'pending',
              }"
            >
              <!-- Done checkmark -->
              <svg
                v-if="stepState(step) === 'done'"
                class="w-3.5 h-3.5 text-emerald-400"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
              >
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <!-- Active spinner -->
              <svg
                v-else-if="stepState(step) === 'active'"
                class="w-3.5 h-3.5 text-amber-400 animate-spin"
                fill="none" viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              <!-- Pending dot -->
              <span v-else class="w-1.5 h-1.5 rounded-full bg-slate-600" />
            </div>
            <!-- Connector line -->
            <div
              v-if="i < STEPS.length - 1"
              class="w-px h-5 mt-1 transition-colors duration-500"
              :class="stepState(step) === 'done' ? 'bg-emerald-500/40' : 'bg-slate-800'"
            />
          </div>

          <!-- Step text -->
          <div class="pb-1">
            <p
              class="text-[10px] font-bold uppercase tracking-wide transition-colors duration-300"
              :class="{
                'text-emerald-400': stepState(step) === 'done',
                'text-amber-400': stepState(step) === 'active',
                'text-slate-600': stepState(step) === 'pending',
              }"
            >
              {{ step.label }}
            </p>
            <p class="text-[9px] text-slate-600 mt-0.5">{{ step.desc }}</p>
          </div>
        </div>
      </div>

      <!-- Success footer -->
      <div
        v-if="isProvisioned"
        class="px-4 pb-4"
      >
        <div class="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">
          <svg class="w-4 h-4 text-emerald-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span class="text-[10px] font-black text-emerald-400 uppercase tracking-wide">Instance ready · closing…</span>
        </div>
      </div>

      <!-- Connecting footer -->
      <div v-else-if="!isConnected && !isError" class="px-4 pb-3">
        <p class="text-[9px] font-mono text-slate-600 uppercase tracking-wider">Connecting to event stream…</p>
      </div>
    </div>
  </div>
</template>
