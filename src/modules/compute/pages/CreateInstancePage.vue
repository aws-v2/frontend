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
    { id: 'ubuntu', name: 'Ubuntu', versions: ['ubuntu-24.04', 'ubuntu-22.04', 'ubuntu-20.04'], available: true },
    { id: 'debian', name: 'Debian', versions: ['debian-12', 'debian-11'], available: true },
    { id: 'rocky', name: 'Rocky Linux', versions: ['rocky-9', 'rocky-8'], available: true },
    { id: 'almalinux', name: 'AlmaLinux', versions: ['almalinux-9', 'almalinux-8'], available: false },
    { id: 'fedora', name: 'Fedora', versions: ['fedora-40', 'fedora-39'], available: false },
    { id: 'centos', name: 'CentOS Stream', versions: ['centos-stream-9'], available: false }
]

const selectDistro = (distroId: string) => {
    const distro = distroList.find(d => d.id === distroId)
    if (!distro || !distro.available) return
    selectedDistro.value = distroId
    selectedVersion.value = distro.versions[0] || ''
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
    <div
        class="min-h-screen bg-white text-[#16191f] font-urbanist selection:bg-blue-500/20 selection:text-blue-900 overflow-x-hidden">
        <!-- Structural Grid Background -->
        <div
            class="absolute inset-0 bg-[linear-gradient(rgba(0,102,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,102,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none">
        </div>

        <!-- Loading Overlay -->
        <div v-if="computeStore.isLoading"
            class="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div class="flex flex-col items-center gap-6">
                <div class="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-none animate-spin"></div>
                <p class="text-[10px] font-black uppercase tracking-[0.3em] text-[#232f3e]">Protocol_Initialization...
                </p>
            </div>
        </div>

        <div class="relative z-10 p-8 px-8 md:px-16 pt-24 pb-40 space-y-12">
            <!-- Breadcrumbs -->
            <nav class="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                <a href="#" @click.prevent="router.push('/dashboard')"
                    class="text-[#879196] hover:text-blue-600 transition-colors">Infrastructure</a>
                <div class="w-1 h-1 bg-[#eaeded] rounded-full"></div>
                <a href="#" @click.prevent="goBack"
                    class="text-[#879196] hover:text-blue-600 transition-colors">Compute</a>
                <div class="w-1 h-1 bg-[#eaeded] rounded-full"></div>
                <span class="text-[#232f3e]">Provision_Node</span>
            </nav>

            <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
                <!-- Main Form Area -->
                <div class="lg:col-span-8 space-y-12">
                    <div class="border-l-4 border-blue-600 pl-8 py-2 bg-[#fafafa] relative overflow-hidden group">
                        <div
                            class="absolute right-0 top-0 w-32 h-32 bg-blue-600/5 -rotate-45 translate-x-16 -translate-y-16">
                        </div>
                        <h1 class="text-6xl font-black text-[#232f3e] tracking-tight uppercase leading-none">
                            Deploy <span class="text-blue-600 italic">Instance</span>
                        </h1>
                    </div>

                    <!-- Name and tags -->
                    <section class="bg-white border-2 border-[#232f3e] p-10 space-y-8 relative overflow-hidden">
                        <div
                            class="absolute top-0 right-0 w-24 h-24 bg-[#fafafa] -rotate-45 translate-x-12 -translate-y-12 border-l-2 border-[#232f3e]">
                        </div>
                        <h3 class="text-2xl font-black text-[#232f3e] uppercase tracking-tight">Configuration_ID</h3>
                        <div>
                            <label
                                class="text-[10px] font-black text-[#879196] uppercase tracking-widest block mb-3 italic">//
                                Instance_Alias</label>
                            <input v-model="instanceName" type="text" placeholder="e.g. prod-core-01"
                                class="w-full bg-[#fafafa] border-2 border-[#eaeded] focus:border-blue-600 px-6 py-4 text-sm text-[#232f3e] outline-none transition-all font-bold placeholder:text-slate-300">
                        </div>
                        <button
                            class="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:text-[#232f3e] transition-colors border-b-2 border-blue-600/20 pb-1">
                            + Meta_Tag_Mapping
                        </button>
                    </section>

                    <!-- Application and OS Images -->
                    <section class="bg-white border-2 border-[#232f3e] p-10 space-y-10">
                        <h3 class="text-2xl font-black text-[#232f3e] uppercase tracking-tight">Operating_Environment
                        </h3>

                        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            <div v-for="distro in distroList" :key="distro.id" @click="selectDistro(distro.id)" :class="[
                                'p-5 border-2 transition-all flex flex-col items-center gap-4 group relative overflow-hidden',
                                distro.available ? 'cursor-pointer' : 'cursor-not-allowed opacity-40 grayscale',
                                (distro.available && selectedDistro === distro.id) ? 'bg-[#fafafa] border-blue-600 translate-y-[-4px]' : 'bg-white border-[#eaeded]',
                                (distro.available && selectedDistro !== distro.id) ? 'hover:border-[#232f3e]' : ''
                            ]">
                                <!-- Distro Logos -->
                                <div
                                    :class="['w-12 h-12 flex items-center justify-center transition-transform', distro.available ? 'group-hover:scale-110' : '']">
                                    <svg v-if="distro.id === 'ubuntu'" class="w-10 h-10" viewBox="0 0 24 24"
                                        fill="none">
                                        <path
                                            d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
                                            fill="#E95420" />
                                        <path
                                            d="M12 16.5C14.4853 16.5 16.5 14.4853 16.5 12C16.5 9.51472 14.4853 7.5 12 7.5C9.51472 7.5 7.5 9.51472 7.5 12C7.5 14.4853 9.51472 16.5 12 16.5Z"
                                            fill="white" />
                                    </svg>
                                    <svg v-if="distro.id === 'debian'" class="w-10 h-10" viewBox="0 0 24 24"
                                        fill="none">
                                        <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0z"
                                            fill="#D70A53" />
                                        <path
                                            d="M12 4.5c-4.14 0-7.5 3.36-7.5 7.5s3.36 7.5 7.5 7.5 7.5-3.36 7.5-7.5-3.36-7.5-7.5-7.5z"
                                            fill="white" />
                                    </svg>
                                    <svg v-if="distro.id === 'rocky'" class="w-10 h-10" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0z"
                                            fill="#10B981" />
                                        <path d="M7 7h10v10H7z" fill="white" />
                                    </svg>
                                    <svg v-if="distro.id === 'almalinux'" class="w-10 h-10" viewBox="0 0 24 24"
                                        fill="none">
                                        <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0z"
                                            fill="#3B82F6" />
                                        <path d="M12 6L6 18h12L12 6z" fill="white" />
                                    </svg>
                                    <svg v-if="distro.id === 'fedora'" class="w-10 h-10" viewBox="0 0 24 24"
                                        fill="none">
                                        <path
                                            d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
                                            fill="#294172" />
                                        <path d="M16 8h-4v4h4v4h-4v-4h-4v-4h4v-4H8v12h12V8h-4z" fill="white" />
                                    </svg>
                                    <svg v-if="distro.id === 'centos'" class="w-10 h-10" viewBox="0 0 24 24"
                                        fill="none">
                                        <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0z"
                                            fill="#9333EA" />
                                        <circle cx="12" cy="12" r="6" fill="white" />
                                    </svg>
                                </div>
                                <p class="text-[10px] font-black uppercase tracking-widest text-center"
                                    :class="selectedDistro === distro.id ? 'text-blue-600' : 'text-[#879196]'">{{
                                    distro.name }}</p>
                            </div>
                        </div>

                        <div class="space-y-6 pt-10 border-t-2 border-[#eaeded]">
                            <div>
                                <label
                                    class="text-[10px] font-black text-[#879196] uppercase tracking-widest block mb-3 italic">//
                                    Bundle_Version</label>
                                <div class="relative max-w-md">
                                    <select v-model="selectedVersion"
                                        class="w-full bg-[#fafafa] border-2 border-[#eaeded] px-6 py-4 text-sm text-[#232f3e] font-bold outline-none appearance-none focus:border-blue-600 transition-all">
                                        <option v-for="ver in distroList.find(d => d.id === selectedDistro)?.versions"
                                            :key="ver" :value="ver">
                                            {{ ver.toUpperCase() }}
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div
                                class="p-8 bg-[#fafafa] border-2 border-[#eaeded] relative overflow-hidden group/details">
                                <div
                                    class="absolute right-0 top-0 w-24 h-24 bg-blue-600/5 -rotate-45 translate-x-12 -translate-y-12">
                                </div>

                                <div class="flex items-center justify-between mb-6">
                                    <h4 class="text-sm font-black text-[#232f3e] uppercase tracking-tight">{{
                                        selectedVersion }} Protocol Details</h4>
                                    <span
                                        class="text-[10px] font-black text-emerald-600 uppercase tracking-widest px-3 py-1 bg-emerald-500/10 border-2 border-emerald-500/20">Verified_Image</span>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <p
                                            class="text-[10px] font-black text-[#879196] uppercase tracking-widest mb-2 italic">
                                            Hypervisor_Path</p>
                                        <code
                                            class="text-[11px] text-blue-600 font-mono font-bold block truncate">{{ imageMap[selectedVersion as keyof typeof imageMap] }}</code>
                                    </div>
                                    <div>
                                        <p
                                            class="text-[10px] font-black text-[#879196] uppercase tracking-widest mb-2 italic">
                                            Architecture</p>
                                        <p class="text-[11px] text-[#232f3e] font-black uppercase tracking-widest">
                                            64-bit // ARM_64X</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Instance Type -->
                    <section class="bg-white border-2 border-[#232f3e] p-10 space-y-8">
                        <h3 class="text-2xl font-black text-[#232f3e] uppercase tracking-tight">Computational_Tier</h3>
                        <div
                            class="p-8 border-2 border-blue-600 bg-blue-600/5 flex items-center justify-between relative overflow-hidden">
                            <div
                                class="absolute right-0 top-0 w-16 h-16 bg-blue-600/10 -rotate-45 translate-x-8 -translate-y-8">
                            </div>
                            <div>
                                <p class="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 italic">
                                    Resource_Tier</p>
                                <p class="text-2xl font-black text-[#232f3e] tracking-tighter uppercase">{{
                                    selectedInstanceType }}</p>
                            </div>
                            <div class="text-right">
                                <p
                                    class="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 italic">
                                    Grid_Rate</p>
                                <p class="text-2xl font-black text-[#232f3e] tracking-tighter">$0.0116 <span
                                        class="text-xs text-[#879196]">USD/HR</span></p>
                            </div>
                        </div>
                        <p class="text-[11px] text-[#545b64] leading-relaxed font-medium uppercase tracking-wide">
                            Infrastructure tiers provide optimized combinations of vCPU, NVMe storage, and
                            high-frequency memory to align with varied workload requirements.</p>
                    </section>

                    <!-- Key pair -->
                    <section class="bg-white border-2 border-[#232f3e] p-10 space-y-8">
                        <h3 class="text-2xl font-black text-[#232f3e] uppercase tracking-tight">Access_Security</h3>
                        <div>
                            <label
                                class="text-[10px] font-black text-[#879196] uppercase tracking-widest block mb-4 italic">//
                                Cryptographic_Key_Handle</label>
                            <div class="flex flex-col md:flex-row gap-6">
                                <select v-model="selectedKeyPair"
                                    class="flex-1 bg-[#fafafa] border-2 border-[#eaeded] px-6 py-4 text-sm text-[#232f3e] font-bold outline-none appearance-none focus:border-blue-600 transition-all">
                                    <option>None</option>
                                    <option>PROD-SERWIN-01</option>
                                    <option>DEV-SANDBOX-B</option>
                                </select>
                                <button
                                    class="px-10 py-4 bg-[#232f3e] text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all">
                                    New_Handshake_Key
                                </button>
                            </div>
                        </div>
                    </section>
                </div>

                <!-- Sidebar Summary -->
                <div class="lg:col-span-4">
                    <div class="sticky top-32 space-y-8">
                        <div class="bg-white border-2 border-[#232f3e] p-10 relative overflow-hidden shadow-none">
                            <div
                                class="absolute top-0 right-0 w-24 h-24 bg-[#fafafa] -rotate-45 translate-x-12 -translate-y-12 border-l-2 border-[#232f3e]">
                            </div>
                            <h3 class="text-3xl font-black text-[#232f3e] uppercase tracking-tight mb-10">
                                Provision_Brief</h3>

                            <div class="space-y-6">
                                <div class="flex justify-between items-center py-4 border-b-2 border-[#eaeded]">
                                    <span
                                        class="text-[10px] font-black text-[#879196] uppercase tracking-widest">Nodes</span>
                                    <input type="number" value="1"
                                        class="w-16 bg-[#fafafa] border-2 border-[#eaeded] py-2 text-center text-xs font-black text-[#232f3e] focus:border-blue-600 outline-none">
                                </div>
                                <div class="space-y-4 pt-4">
                                    <div v-for="item in [
                                        { label: 'AMI_PROTOCOL', value: selectedVersion.toUpperCase() },
                                        { label: 'TIER_SELECTED', value: selectedInstanceType.toUpperCase() },
                                        { label: 'SECURITY_MESH', value: 'NEW_MESH_PROTOCOL' },
                                        { label: 'BLOCK_STORAGE', value: '8 GiB NVMe' }
                                    ]" :key="item.label" class="flex flex-col">
                                        <span
                                            class="text-[10px] font-black text-[#879196] uppercase tracking-widest mb-1 italic">{{
                                            item.label }}</span>
                                        <span class="text-xs font-black text-[#232f3e] tracking-tight">{{ item.value
                                            }}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="pt-10 mt-10 border-t-2 border-[#232f3e] space-y-6">
                                <div
                                    class="flex justify-between items-center bg-[#fafafa] p-6 border-b-4 border-blue-600">
                                    <span
                                        class="text-[10px] font-black text-[#879196] uppercase tracking-widest">Monthly_Est</span>
                                    <span class="text-4xl font-black text-[#232f3e] tracking-tighter">$8.35</span>
                                </div>
                                <button @click="launchInstance"
                                    class="w-full py-6 bg-blue-600 text-white text-sm font-black uppercase tracking-[0.3em] hover:bg-[#232f3e] transition-all relative overflow-hidden group">
                                    <span class="relative z-10">Initialize_Deploy</span>
                                    <div
                                        class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                    </div>
                                </button>
                                <button @click="goBack"
                                    class="w-full py-5 border-2 border-[#232f3e] text-[#232f3e] text-[10px] font-black uppercase tracking-widest hover:bg-[#fafafa] transition-all">
                                    Abort_Protocol
                                </button>
                            </div>
                        </div>

                        <!-- Help box -->
                        <div class="p-8 border-2 border-[#eaeded] bg-[#fafafa] relative overflow-hidden group">
                            <div class="w-8 h-1 bg-blue-600 mb-6 group-hover:w-full transition-all duration-500"></div>
                            <h4 class="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">
                                Protocol_Subsidy_Eligible</h4>
                            <p class="text-[11px] text-[#545b64] leading-relaxed font-medium uppercase tracking-wide">
                                Account active for &lt; 12 months. Grid credits applicable for micro-tier provisioning.
                                750 compute hours/month allocated.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <footer class="py-20 bg-white border-t-2 border-[#232f3e]">
            <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-[#232f3e] flex items-center justify-center text-white font-black italic">S
                    </div>
                    <span class="font-black text-xl text-[#232f3e] tracking-tighter uppercase">SerwinProvision</span>
                </div>
                <div class="flex gap-10 text-[10px] font-black text-[#879196] uppercase tracking-[0.2em]">
                    <a href="#" class="hover:text-blue-600">Kernel_Log</a>
                    <a href="#" class="hover:text-blue-600">Access_Matrix</a>
                    <a href="#" class="hover:text-blue-600">Edge_Status</a>
                </div>
            </div>
        </footer>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800;900&display=swap');

.font-urbanist {
    font-family: 'Urbanist', sans-serif;
}

select {
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23232f3e'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='4' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E") no-repeat;
    background-position: right 1.5rem center;
    background-size: 1rem;
}

input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
</style>
