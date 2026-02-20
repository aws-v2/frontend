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
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="emit('close')"></div>
    
    <div class="relative w-full max-w-2xl bg-[#0D1117] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
      <!-- Header -->
      <div class="p-6 border-b border-white/10 flex items-center justify-between">
        <h2 class="text-xl font-bold text-white">Connect to instance</h2>
        <button @click="emit('close')" class="text-slate-500 hover:text-white transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-white/10">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          class="flex-1 px-4 py-4 text-[11px] font-black uppercase tracking-widest transition-all relative"
          :class="activeTab === tab.id ? 'text-blue-400 bg-blue-400/5' : 'text-slate-500 hover:text-slate-300'"
        >
          {{ tab.label }}
          <div v-if="activeTab === tab.id" class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]"></div>
        </button>
      </div>

      <!-- Content -->
      <div class="p-8">
        <!-- SSH Client Tab -->
        <div v-if="activeTab === 'ssh'" class="space-y-6">
          <div class="space-y-4">
            <h3 class="text-sm font-bold text-white">1. Open an SSH client.</h3>
            <h3 class="text-sm font-bold text-white">2. Locate your private key file.</h3>
            <div class="space-y-3">
              <p class="text-xs text-slate-400 italic">The key used to launch this instance is <strong>{{ instance.ssh_key || 'your-key.pem' }}</strong></p>
              <button 
                @click="downloadPem"
                class="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest text-blue-400 hover:bg-blue-500/20 transition-all w-fit"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Private Key (.pem)
              </button>
            </div>
            
            <h3 class="text-sm font-bold text-white">3. Connect to your instance using its Public IP:</h3>
            <div class="relative group">
              <div class="p-4 bg-black/50 border border-white/10 rounded-xl font-mono text-xs text-blue-400 break-all pr-12">
                ssh -i "{{ instance.ssh_key || 'your-key.pem' }}" ubuntu@{{ instance.publicIp || 'IP_ADDRESS' }}
              </div>
              <button 
                @click="copyToClipboard(`ssh -i '${instance.ssh_key || 'your-key.pem'}' ubuntu@${instance.publicIp || 'IP_ADDRESS'}`)"
                class="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-blue-400 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
          
          <div class="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
            <p class="text-[10px] text-amber-200/70 leading-relaxed uppercase font-black tracking-widest mb-2">Note</p>
            <p class="text-xs text-slate-400 font-medium">In most cases, the guest user name is <span class="text-white">ubuntu</span> for Ubuntu images and <span class="text-white">ec2-user</span> for Amazon Linux.</p>
          </div>
        </div>

        <!-- EC2 Instance Connect Tab -->
        <div v-if="activeTab === 'connect'" class="space-y-6 text-center py-4">
          <div class="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 mx-auto mb-4">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-white">Connect using EC2 Instance Connect</h3>
          <p class="text-sm text-slate-400 max-w-sm mx-auto">
            Connect directly from your browser to your instance's shell using a web-based terminal.
          </p>
          
          <div class="pt-4">
            <button 
              @click="openTerminal"
              class="px-12 py-4 bg-gradient-to-r from-blue-600 to-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all active:scale-95 shadow-xl"
            >
              Connect
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t border-white/10 flex justify-end">
        <button @click="emit('close')" class="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-in {
  animation-duration: 0.3s;
  animation-fill-mode: both;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-in-from-bottom {
  from { transform: translateY(20px); }
  to { transform: translateY(0); }
}

.fade-in {
  animation-name: fade-in;
}

.slide-in-from-bottom-4 {
  animation-name: slide-in-from-bottom;
}
</style>
