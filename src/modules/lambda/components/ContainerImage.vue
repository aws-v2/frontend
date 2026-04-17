<script setup lang="ts">
import { ref } from 'vue'

const functionName = ref('')
const containerUri = ref('')
const architecture = ref('x86_64')

// Additional configurations state
const additionalConfigExpanded = ref(false)
const computeType = ref('standard')
const vpcEnabled = ref(false)
</script>

<template>
  <div class="space-y-10">
    <div class="bg-white p-10 border-2 border-[#232f3e] relative overflow-hidden">
      <div
        class="absolute right-0 top-0 w-32 h-32 bg-[#fafafa] -rotate-45 translate-x-16 -translate-y-16 border-l-2 border-[#232f3e]">
      </div>

      <div class="flex items-center gap-4 mb-10">
        <span class="w-1.5 h-8 bg-amber-500"></span>
        <h3 class="text-2xl font-black text-[#232f3e] uppercase tracking-tight">Image_Registry_Manifest</h3>
      </div>

      <div class="space-y-10 max-w-3xl">
        <!-- Function Name -->
        <div class="space-y-4">
          <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-[#879196] italic">//
            Destination_Identifier</label>
          <input v-model="functionName" type="text" placeholder="IMAGE_NODE_V1"
            class="w-full bg-white border-2 border-[#eaeded] px-6 py-4 text-sm font-black text-[#232f3e] focus:border-amber-500 outline-none transition-all placeholder:text-[#eaeded] uppercase tracking-widest" />
        </div>

        <!-- Container Image URI -->
        <div class="space-y-4">
          <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-[#879196] italic">//
            Registry_Uri_Handshake</label>
          <div class="flex flex-col md:flex-row gap-4">
            <input v-model="containerUri" type="text" placeholder="ECR_REGISTRY_PROTOCOL_01..."
              class="flex-grow bg-white border-2 border-[#eaeded] px-6 py-4 text-sm font-black text-[#232f3e] focus:border-amber-500 outline-none transition-all placeholder:text-[#eaeded] uppercase tracking-widest" />
            <button
              class="px-8 py-4 bg-[#232f3e] text-white text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 transition-all whitespace-nowrap">Scan_Registry</button>
          </div>
        </div>

        <!-- Architecture -->
        <div class="space-y-6">
          <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-[#879196] italic">//
            Computational_Architecture</label>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label v-for="arch in ['arm64', 'x86_64']" :key="arch"
              class="flex flex-col p-6 border-2 transition-all cursor-pointer group"
              :class="architecture === arch ? 'bg-[#fafafa] border-amber-500 translate-y-[-2px]' : 'bg-white border-[#eaeded] hover:border-[#232f3e]'">
              <div class="flex items-center justify-between">
                <span class="text-sm font-black uppercase tracking-tight transition-colors"
                  :class="architecture === arch ? 'text-[#232f3e]' : 'text-[#879196] group-hover:text-[#232f3e]'">{{
                  arch }}</span>
                <input type="radio" :value="arch" v-model="architecture" class="sr-only">
                <div class="w-6 h-6 border-2 transition-all flex items-center justify-center"
                  :class="architecture === arch ? 'border-amber-500 bg-amber-500' : 'border-[#eaeded] group-hover:border-[#232f3e]'">
                  <div v-if="architecture === arch" class="w-3 h-3 bg-white"></div>
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Additional Configurations Expandable -->
    <div class="bg-white border-2 border-[#eaeded] overflow-hidden group hover:border-[#232f3e] transition-colors">
      <div @click="additionalConfigExpanded = !additionalConfigExpanded"
        class="p-8 cursor-pointer flex items-center gap-6 relative">
        <div v-if="additionalConfigExpanded" class="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500"></div>
        <div
          class="w-10 h-10 border-2 border-[#232f3e] flex items-center justify-center text-[#232f3e] transition-transform"
          :class="additionalConfigExpanded ? 'rotate-90 bg-[#232f3e] text-white' : ''">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M9 5l7 7-7 7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <div class="flex-grow">
          <h3 class="font-black text-[#232f3e] text-lg uppercase tracking-tight">Advanced_Cluster_Policy</h3>
          <p class="text-[10px] text-[#879196] font-black uppercase tracking-[0.2em] mt-1 italic">// Networking //
            Security // Governance</p>
        </div>
      </div>

      <div v-if="additionalConfigExpanded" class="px-10 pb-10 space-y-10 max-w-3xl border-t-2 border-[#eaeded] pt-10">
        <!-- Compute type -->
        <div class="space-y-6">
          <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-[#879196] italic">//
            Resource_Provisioning_Strategy</label>
          <div class="space-y-4">
            <label
              v-for="type in [{ id: 'standard', label: 'Forge Standard', sub: 'Balanced_Default' }, { id: 'snapstart', label: 'Forge SnapStart', sub: 'Low_Latency_Optimization' }]"
              :key="type.id" class="flex items-start gap-6 p-6 border-2 transition-all cursor-pointer group"
              :class="computeType === type.id ? 'bg-[#fafafa] border-amber-500' : 'bg-white border-[#eaeded] hover:border-[#232f3e]'">
              <div class="mt-1">
                <input type="radio" :value="type.id" v-model="computeType" class="sr-only">
                <div class="w-6 h-6 border-2 transition-all flex items-center justify-center"
                  :class="computeType === type.id ? 'border-amber-500 bg-amber-500' : 'border-[#eaeded] group-hover:border-[#232f3e]'">
                  <div v-if="computeType === type.id" class="w-3 h-3 bg-white"></div>
                </div>
              </div>
              <div class="flex-grow">
                <span class="text-sm font-black uppercase tracking-tight block transition-colors"
                  :class="computeType === type.id ? 'text-[#232f3e]' : 'text-[#879196] group-hover:text-[#232f3e]'">{{
                  type.label }}</span>
                <span class="text-[9px] font-black text-[#879196] uppercase tracking-widest block mt-2">{{ type.sub
                  }}</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Networking Toggle -->
        <div class="p-8 bg-[#fafafa] border-2 border-[#eaeded]">
          <div class="flex items-center justify-between">
            <div>
              <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-[#879196] italic mb-2">//
                Private_Mesh_Access</label>
              <p class="text-[11px] font-medium text-[#545b64] uppercase tracking-wide">Establish direct connection to
                protected VPC network segments.</p>
            </div>
            <label class="flex items-center cursor-pointer group shrink-0">
              <div class="relative">
                <input type="checkbox" v-model="vpcEnabled" class="sr-only">
                <div class="w-14 h-8 border-2 border-[#232f3e] bg-white transition-colors group-hover:bg-[#fafafa]"
                  :class="vpcEnabled ? 'bg-amber-500 border-amber-500' : ''"></div>
                <div class="absolute left-1 top-1 w-6 h-6 bg-[#232f3e] transition-transform"
                  :class="vpcEnabled ? 'translate-x-6 bg-white' : ''"></div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scoped styles removed as utility classes are used for the new theme */
</style>
