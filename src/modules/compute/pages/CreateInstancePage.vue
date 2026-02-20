<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useComputeStore } from '../store/computeStore'

const router = useRouter()
const computeStore = useComputeStore()

const instanceName = ref('')
const selectedInstanceType = ref('t2.micro')
const selectedKeyPair = ref('None')
const selectedDistro = ref('ubuntu')
const selectedVersion = ref('ubuntu-22.04')

const sshKey = 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCL2nT/HmmOKj7OAVfTVAP8eLBtm1uZ9jGUBqst/qIPwx5mhPUTeKyG1hgUbOukmu7bvEy0hoS7MDNUI8oc4KNdUGEA+NwcjZ07UKAnl0hrggMjxebwp8HvZJVt6meJ9oRNLRmi+smfVG2y3zWlJCUf89sT1+gfM3XsWsUhOvOElwUpQfx2k7jO43WI3/xqStP4Tc47cBUJV9ih8Xc3VBtqyUFj7K13Zm4l1VUnZOFz+RrO/M3bXp3GOUZcdUvmBgHBIF32DyDmcmoTbaIDZT/fptzx0efy5x/ckJRcat+7C4eEQdXxRCbLbR+hxqHmrag7GrD1V3Mm8rZa0ajo4O/jDXgL/Ir22XBtVImULbtvZ0tzE940BCWTQVAObU4gGeMry4A9BqD5cgnpzdmqDdoruh8bZeKwSDzqB/IrFPeCK4++4q+ZKIVbLp/J5i6Nei8/dO27ENsD/oQ60qwp/Y73cHsT18dMgqvDfhROnsKmusmltEQx8B4Dir7JDQktG+ig7bw0kg5Oh99YI2KYP0DXwTdxrYynH0mwGNboYb/hO2wdlJajUUycyZ11zb3hPENTE7zy6KZUyz2zkF+xUBYRx3yNa8CRGTRICd+ecxO0/JrRRJXnDK7HJph5N1xThl3QKDmoKVimBZE6BDMI3FsoqRA1NCR4UAOZYrvVgXDspQ== emqarani@gmail.com'

const imageMap = {
  "ubuntu-20.04": "/var/lib/libvirt/images/ubuntu-20.04.qcow2",
  "ubuntu-22.04": "/var/lib/libvirt/images/ubuntu-22.04.qcow2",
  "ubuntu-24.04": "/var/lib/libvirt/images/ubuntu-24.04.qcow2",
  "debian-11": "/var/lib/libvirt/images/debian-11.qcow2",
  "debian-12": "/var/lib/libvirt/images/debian-12.qcow2",
  "rocky-8": "/var/lib/libvirt/images/rocky-8.qcow2",
  "rocky-9": "/var/lib/libvirt/images/rocky-9.qcow2",
  "almalinux-8": "/var/lib/libvirt/images/almalinux-8.qcow2",
  "almalinux-9": "/var/lib/libvirt/images/almalinux-9.qcow2",
  "fedora-39": "/var/lib/libvirt/images/fedora-39.qcow2",
  "fedora-40": "/var/lib/libvirt/images/fedora-40.qcow2",
  "centos-stream-9": "/var/lib/libvirt/images/centos-stream-9.qcow2",
}

const distroList = [
  { id: 'ubuntu', name: 'Ubuntu', versions: ['ubuntu-24.04', 'ubuntu-22.04', 'ubuntu-20.04'] },
  { id: 'debian', name: 'Debian', versions: ['debian-12', 'debian-11'] },
  { id: 'rocky', name: 'Rocky Linux', versions: ['rocky-9', 'rocky-8'] },
  { id: 'almalinux', name: 'AlmaLinux', versions: ['almalinux-9', 'almalinux-8'] },
  { id: 'fedora', name: 'Fedora', versions: ['fedora-40', 'fedora-39'] },
  { id: 'centos', name: 'CentOS Stream', versions: ['centos-stream-9'] }
]

const selectDistro = (distroId: string) => {
    selectedDistro.value = distroId
    selectedVersion.value = distroList.find(d => d.id === distroId)?.versions[0] || ''
}

const goBack = () => {
    router.push({ name: 'instances-list' })
}

const launchInstance = async () => {
    try {
        await computeStore.launchInstance({
            image: selectedVersion.value,
            cpu: 2,
            ram: 2048,
            ssh_key: sshKey
        })
        router.push({ name: 'instances-list' })
    } catch (error) {
        alert('Failed to launch instance. Please check console.')
    }
}
</script>

<template>
  <div class="min-h-screen bg-[#05080F] text-slate-200 pb-32 font-sans relative overflow-hidden">
    <!-- Ambient background effects -->
    <div class="absolute inset-0 pointer-events-none opacity-20">
      <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]"></div>
      <div class="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px]"></div>
    </div>

    <div v-if="computeStore.isLoading" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div class="flex flex-col items-center gap-4">
            <div class="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <p class="text-xs font-black uppercase tracking-widest text-white">Launching Instance...</p>
        </div>
    </div>

    <div class="relative z-10 p-8 px-8 md:px-16 space-y-8">
      <!-- Header -->
      <nav class="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
        <a href="#" @click.prevent="router.push('/dashboard')" class="text-slate-500 hover:text-blue-400 transition-colors">AWS</a>
        <span class="text-slate-700">/</span>
        <a href="#" @click.prevent="goBack" class="text-slate-500 hover:text-blue-400 transition-colors">EC2</a>
        <span class="text-slate-700">/</span>
        <span class="text-slate-400">Launch an instance</span>
      </nav>

      <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Form Area -->
        <div class="lg:col-span-2 space-y-8">
          <div class="flex items-center gap-4 mb-4">
            <h1 class="text-3xl font-bold text-white tracking-tight">Launch an instance</h1>
          </div>

          <!-- Name and tags -->
          <section class="glass-panel p-8 rounded-3xl border border-white/10 space-y-6">
            <h3 class="text-lg font-bold text-white">Name and tags</h3>
            <div>
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Name</label>
              <input v-model="instanceName" type="text" placeholder="e.g. my-web-server"
                class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all">
            </div>
            <button class="text-blue-400 text-xs font-bold hover:text-blue-300 transition-colors flex items-center gap-1">
                Add additional tags
            </button>
          </section>

          <!-- Application and OS Images -->
          <section class="glass-panel p-8 rounded-3xl border border-white/10 space-y-6">
            <div class="flex justify-between items-center">
                <h3 class="text-lg font-bold text-white">Application and OS Images (Amazon Machine Image)</h3>
            </div>
            <p class="text-xs text-slate-500 font-medium leading-relaxed">Quick Start Distributions</p>
            
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <div v-for="distro in distroList" :key="distro.id" 
                    @click="selectDistro(distro.id)"
                    :class="[
                        'p-4 rounded-2xl border cursor-pointer transition-all flex flex-col items-center gap-2 group relative overflow-hidden',
                        selectedDistro === distro.id ? 'bg-blue-500/10 border-blue-500/40' : 'bg-white/5 border-white/10 hover:bg-white/10'
                    ]">
                    <!-- Distro Logos (SVG) -->
                    <div class="w-10 h-10 flex items-center justify-center transition-transform group-hover:scale-110">
                        <!-- Ubuntu -->
                        <svg v-if="distro.id === 'ubuntu'" class="w-8 h-8" viewBox="0 0 24 24" fill="none">
                            <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="#E95420"/>
                            <path d="M12 16.5C14.4853 16.5 16.5 14.4853 16.5 12C16.5 9.51472 14.4853 7.5 12 7.5C9.51472 7.5 7.5 9.51472 7.5 12C7.5 14.4853 9.51472 16.5 12 16.5Z" fill="white"/>
                        </svg>
                        <!-- Debian -->
                        <svg v-if="distro.id === 'debian'" class="w-8 h-8" viewBox="0 0 24 24" fill="none">
                            <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0z" fill="#D70A53"/>
                            <path d="M12 4.5c-4.14 0-7.5 3.36-7.5 7.5s3.36 7.5 7.5 7.5 7.5-3.36 7.5-7.5-3.36-7.5-7.5-7.5z" fill="white"/>
                        </svg>
                        <!-- Rocky -->
                        <svg v-if="distro.id === 'rocky'" class="w-8 h-8" viewBox="0 0 24 24" fill="none">
                            <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0z" fill="#10B981"/>
                            <path d="M7 7h10v10H7z" fill="white"/>
                        </svg>
                        <!-- Alma -->
                        <svg v-if="distro.id === 'almalinux'" class="w-8 h-8" viewBox="0 0 24 24" fill="none">
                            <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0z" fill="#3B82F6"/>
                            <path d="M12 6L6 18h12L12 6z" fill="white"/>
                        </svg>
                        <!-- Fedora -->
                        <svg v-if="distro.id === 'fedora'" class="w-8 h-8" viewBox="0 0 24 24" fill="none">
                            <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="#294172"/>
                            <path d="M16 8h-4v4h4v4h-4v-4h-4v-4h4v-4H8v12h12V8h-4z" fill="white"/>
                        </svg>
                        <!-- CentOS -->
                        <svg v-if="distro.id === 'centos'" class="w-8 h-8" viewBox="0 0 24 24" fill="none">
                            <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0z" fill="#9333EA"/>
                            <circle cx="12" cy="12" r="6" fill="white"/>
                        </svg>
                    </div>
                    <p class="text-[9px] font-black uppercase tracking-wider text-center" :class="selectedDistro === distro.id ? 'text-white' : 'text-slate-500 font-bold'">{{ distro.name }}</p>
                </div>
            </div>

            <div class="space-y-4 pt-4 mt-4 border-t border-white/5">
                <div>
                    <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Version</label>
                    <div class="relative max-w-md">
                        <select v-model="selectedVersion" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 appearance-none">
                            <option v-for="ver in distroList.find(d => d.id === selectedDistro)?.versions" :key="ver" :value="ver">
                                {{ ver }}
                            </option>
                        </select>
                    </div>
                </div>

                <div class="p-6 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden group/details">
                    <div class="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover/details:bg-blue-500/10 transition-all duration-700"></div>
                    
                    <div class="flex items-center justify-between mb-3">
                        <h4 class="text-sm font-bold text-white">{{ selectedVersion }} Image Details</h4>
                        <span class="text-[10px] font-black text-emerald-400 uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">Verified</span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p class="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] mb-1">Source Path</p>
                            <code class="text-[11px] text-blue-400 font-mono block truncate">{{ imageMap[selectedVersion as keyof typeof imageMap] }}</code>
                        </div>
                        <div>
                            <p class="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] mb-1">Architecture</p>
                            <p class="text-[11px] text-slate-300 font-bold">64-bit (x86)</p>
                        </div>
                    </div>
                </div>
            </div>
          </section>

          <!-- Instance Type -->
          <section class="glass-panel p-8 rounded-3xl border border-white/10 space-y-6">
            <h3 class="text-lg font-bold text-white">Instance type</h3>
            <div class="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                    <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Instance type</p>
                    <p class="text-sm font-bold text-white">{{ selectedInstanceType }}</p>
                </div>
                <div class="text-right">
                    <p class="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">On-Demand hourly rate</p>
                    <p class="text-sm font-bold text-white">$0.0116 USD</p>
                </div>
            </div>
            <p class="text-[11px] text-slate-500">Instance types comprise varying combinations of CPU, memory, storage, and networking capacity and give you the flexibility to choose the appropriate mix of resources for your applications.</p>
          </section>

          <!-- Key pair -->
          <section class="glass-panel p-8 rounded-3xl border border-white/10 space-y-6">
            <h3 class="text-lg font-bold text-white">Key pair (login)</h3>
            <div>
                 <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Key pair name - required</label>
                 <div class="flex gap-4">
                     <select v-model="selectedKeyPair" class="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-400 focus:outline-none focus:border-blue-500/50 appearance-none">
                         <option>None</option>
                         <option>PROD-SSH-KEY</option>
                         <option>DEV-SSH-KEY</option>
                     </select>
                     <button class="px-6 py-3 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all">
                         Create new key pair
                     </button>
                 </div>
            </div>
          </section>
        </div>

        <!-- Sidebar Summary -->
        <div class="lg:col-span-1">
          <div class="sticky top-8 space-y-6">
            <div class="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
                <h3 class="text-lg font-bold text-white">Summary</h3>
                
                <div class="space-y-4">
                    <div class="flex justify-between py-2 border-b border-white/5">
                        <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Number of instances</span>
                        <input type="number" value="1" class="w-12 bg-white/5 border border-white/10 rounded text-center text-xs text-white">
                    </div>
                    <div class="space-y-2 pt-2">
                        <div class="flex flex-col">
                            <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Software Image (AMI)</span>
                            <span class="text-xs font-bold text-white">{{ selectedVersion }}</span>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Instance type</span>
                            <span class="text-xs font-bold text-white">{{ selectedInstanceType }}</span>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Firewall (security groups)</span>
                            <span class="text-xs font-bold text-white">New security group</span>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Storage (volumes)</span>
                            <span class="text-xs font-bold text-white">1 volume(s) - 8 GiB</span>
                        </div>
                    </div>
                </div>

                <div class="pt-4 border-t border-white/10 space-y-4">
                    <div class="flex justify-between items-center bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20">
                        <span class="text-xs font-bold text-blue-400">Total Monthly Cost</span>
                        <span class="text-lg font-black text-white">$8.35</span>
                    </div>
                    <button @click="launchInstance" class="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-500 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all active:scale-95 shadow-xl">
                        Launch instance
                    </button>
                    <button @click="goBack" class="w-full py-4 bg-white/5 border border-white/10 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-white/10 transition-all">
                        Cancel
                    </button>
                </div>
            </div>

            <!-- Help box -->
            <div class="p-6 rounded-2xl border border-blue-500/10 bg-blue-500/5">
                <h4 class="text-xs font-bold text-blue-400 mb-2">Free tier eligible</h4>
                <p class="text-[11px] text-slate-500 leading-relaxed">In your first year, you get 750 hours of micro instances each month as part of the AWS Free Tier.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.glass-panel {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

select {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E") no-repeat;
  background-position: right 1rem center;
  background-size: 1rem;
}
</style>
