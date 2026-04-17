<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  isOpen: boolean
  instance: {
    id: string
    name: string
    publicIp: string
    ssh_key?: string
  } | null
}>()

const emit = defineEmits(['close'])

const activeTab = ref('connect')

const tabs = [
  { id: 'connect', label: 'EC2 Instance Connect' },
  { id: 'ssh', label: 'SSH Client' }
]

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
  alert('Copied to clipboard!')
}

const downloadPem = () => {
  if (!props.instance?.ssh_key) return

  // Use the instance name for the filename instead of the ssh_key
  const fileName = `${props.instance.name}.pem`
  const downloadUrl = `/api/v1/ec2/ssh-keys/${props.instance.ssh_key}/download`

  // Implementation using a hidden link for the download
  const link = document.createElement('a')
  link.href = downloadUrl
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const openTerminal = () => {
  if (!props.instance) return
  window.open(`/compute/instances/${props.instance.id}/terminal`, '_blank')
  emit('close')
}
</script>

<template>
  <div v-if="isOpen && instance" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-white/80 backdrop-blur-sm" @click="emit('close')"></div>

    <div
      class="relative w-full max-w-2xl bg-white border-2 border-[#232f3e] overflow-hidden shadow-none animate-in fade-in slide-in-from-bottom-4 duration-300 font-urbanist">
      <!-- Header -->
      <div class="p-8 border-b-2 border-[#eaeded] flex items-center justify-between bg-[#fafafa]">
        <h2 class="text-2xl font-black text-[#232f3e] uppercase tracking-tight">Access_Protocol</h2>
        <button @click="emit('close')" class="text-[#879196] hover:text-[#232f3e] transition-colors">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex border-b-2 border-[#eaeded]">
        <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
          class="flex-1 px-4 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative"
          :class="activeTab === tab.id ? 'text-blue-600 bg-white' : 'text-[#879196] hover:text-[#232f3e] bg-[#fafafa]'">
          {{ tab.label }}
          <div v-if="activeTab === tab.id" class="absolute bottom-[-2px] left-0 right-0 h-[4px] bg-blue-600"></div>
        </button>
      </div>

      <!-- Content -->
      <div class="p-10">
        <!-- SSH Client Tab -->
        <div v-if="activeTab === 'ssh'" class="space-y-8">
          <div class="space-y-4">
            <div class="flex items-center gap-4 mb-2">
              <span class="w-1.5 h-6 bg-blue-600"></span>
              <h3 class="text-sm font-black text-[#232f3e] uppercase tracking-tight">SSH_Handshake_Procedure</h3>
            </div>

            <div class="space-y-6">
              <div class="p-6 bg-[#fafafa] border-2 border-[#eaeded] relative overflow-hidden group">
                <div class="absolute right-0 top-0 w-16 h-16 bg-blue-600/5 -rotate-45 translate-x-8 -translate-y-8">
                </div>
                <p class="text-[10px] font-black text-[#879196] uppercase tracking-[0.2em] mb-4 italic">//
                  Identity_Token</p>
                <div class="flex items-center justify-between gap-4">
                  <p class="text-xs font-black text-[#232f3e] uppercase tracking-tight truncate max-w-[300px]">{{
                    instance.ssh_key || 'UNASSIGNED_KEY' }}</p>
                  <button @click="downloadPem"
                    class="px-6 py-2 bg-[#232f3e] text-white text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-colors">
                    Pull_.PEM
                  </button>
                </div>
              </div>

              <div class="space-y-3">
                <p class="text-[10px] font-black text-[#879196] uppercase tracking-[0.2em] italic">//
                  Terminal_Execution_String</p>
                <div class="relative group">
                  <div class="p-6 bg-[#232f3e] text-blue-400 font-mono text-[11px] break-all pr-16 leading-relaxed">
                    ssh -i "{{ instance.ssh_key || 'your-key.pem' }}" ubuntu@{{ instance.publicIp || 'IP_ADDRESS' }}
                  </div>
                  <button
                    @click="copyToClipboard(`ssh -i '${instance.ssh_key || 'your-key.pem'}' ubuntu@${instance.publicIp || 'IP_ADDRESS'}`)"
                    class="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/50 hover:text-white transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="p-6 border-l-4 border-amber-500 bg-amber-500/5">
            <h4 class="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2 italic">
              Infrastructure_Notice</h4>
            <p class="text-xs text-[#545b64] font-medium leading-relaxed uppercase tracking-wide">Standard user identity
              is 'ubuntu' for Debian-based nodes and 'ec2-user' for RPM-based protocols.</p>
          </div>
        </div>

        <!-- EC2 Instance Connect Tab -->
        <div v-if="activeTab === 'connect'" class="space-y-8 text-center py-6">
          <div
            class="w-20 h-20 bg-[#232f3e] flex items-center justify-center text-white mx-auto mb-6 relative overflow-hidden group">
            <div
              class="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            </div>
            <svg class="w-10 h-10 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div class="space-y-4">
            <h3 class="text-2xl font-black text-[#232f3e] uppercase tracking-tight">Web_Terminal_Bridge</h3>
            <p class="text-sm font-black text-[#879196] max-w-sm mx-auto uppercase tracking-widest">
              Establish a persistent hypervisor bridge via encrypted browser session.
            </p>
          </div>

          <div class="pt-8">
            <button @click="openTerminal"
              class="px-16 py-5 bg-blue-600 text-white text-xs font-black uppercase tracking-[0.3em] hover:bg-[#232f3e] transition-all relative overflow-hidden group shadow-none">
              <span class="relative z-10">Mount_Shell</span>
              <div
                class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-8 border-t-2 border-[#eaeded] flex justify-end bg-[#fafafa]">
        <button @click="emit('close')"
          class="text-[10px] font-black uppercase tracking-[0.2em] text-[#879196] hover:text-[#232f3e] transition-colors">
          Abort_Handshake
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800;900&display=swap');

.font-urbanist {
  font-family: 'Urbanist', sans-serif;
}

.animate-in {
  animation-duration: 0.3s;
  animation-fill-mode: both;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slide-in-from-bottom {
  from {
    transform: translateY(20px);
  }

  to {
    transform: translateY(0);
  }
}

.fade-in {
  animation-name: fade-in;
}

.slide-in-from-bottom-4 {
  animation-name: slide-in-from-bottom;
}
</style>
