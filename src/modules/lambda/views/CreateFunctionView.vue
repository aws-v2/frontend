<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthorFromScratch from '../components/AuthorFromScratch.vue'
import UseBlueprint from '../components/UseBlueprint.vue'
import ContainerImage from '../components/ContainerImage.vue'

const router = useRouter()
const activeTab = ref('scratch')

const tabs = [
  { id: 'scratch', label: 'Author from scratch', sub: 'Start with a simple Hello World example.' },
  { id: 'blueprint', label: 'Use a blueprint', sub: 'Build a Lambda application from sample code and configuration presets for common use cases.' },
  { id: 'container', label: 'Container image', sub: 'Select a container image to deploy for your function.' }
]

const cancel = () => {
    router.push({ name: 'lambda-landing' })
}

const createFunction = () => {
    console.log('Create function clicked for tab:', activeTab.value)
    // Functional logic would go here
}
</script>

<template>
  <div class="min-h-screen bg-[#05080F] text-slate-200 pb-32 font-sans relative overflow-hidden">
    <!-- Ambient background effects -->
    <div class="absolute inset-0 pointer-events-none opacity-20">
      <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-600/20 rounded-full blur-[120px]"></div>
      <div class="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-orange-600/10 rounded-full blur-[100px]"></div>
      <div class="absolute bottom-0 right-10 w-[600px] h-[600px] bg-yellow-600/10 rounded-full blur-[150px]"></div>
    </div>

    <div class="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-8 space-y-8">
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
        <a href="#" @click.prevent="router.push('/dashboard')" class="text-slate-500 hover:text-amber-400 transition-colors">AWS</a>
        <span class="text-slate-700">/</span>
        <a href="#" @click.prevent="cancel" class="text-slate-500 hover:text-amber-400 transition-colors">Lambda</a>
        <span class="text-slate-700">/</span>
        <a href="#" @click.prevent="cancel" class="text-slate-500 hover:text-amber-400 transition-colors">Functions</a>
        <span class="text-slate-700">/</span>
        <span class="text-slate-400">Create function</span>
      </nav>

      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h1 class="text-3xl font-bold text-white tracking-tight">Create Function</h1>
          <p class="text-xs text-slate-500 font-medium mt-1">Choose one of the following options to create your function.</p>
        </div>
      </div>

      <!-- Tabs Selector -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          class="glass-panel rounded-2xl border cursor-pointer transition-all duration-300 p-6 flex gap-4 relative overflow-hidden group hover:border-amber-500/30"
          :class="activeTab === tab.id ? 'border-amber-500/40 bg-amber-500/5' : 'border-white/10 hover:bg-white/[0.02]'"
        >
          <div class="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl transition-all duration-700"
            :class="activeTab === tab.id ? 'bg-amber-500/10' : 'bg-amber-500/0 group-hover:bg-amber-500/5'"></div>
          
          <div class="flex-shrink-0 mt-0.5 relative z-10">
            <div 
              class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
              :class="activeTab === tab.id ? 'border-amber-500 bg-amber-500/10' : 'border-slate-600 group-hover:border-slate-500'"
            >
              <div v-if="activeTab === tab.id" class="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
            </div>
          </div>
          <div class="relative z-10">
            <h4 class="text-sm font-bold mb-1 transition-colors"
              :class="activeTab === tab.id ? 'text-white' : 'text-slate-300 group-hover:text-white'">
              {{ tab.label }}
            </h4>
            <p class="text-[11px] leading-relaxed transition-colors"
              :class="activeTab === tab.id ? 'text-slate-400' : 'text-slate-500 group-hover:text-slate-400'">
              {{ tab.sub }}
            </p>
          </div>
        </div>
      </div>

      <!-- Active Tab Content -->
      <div class="transition-all duration-300">
        <AuthorFromScratch v-if="activeTab === 'scratch'" />
        <UseBlueprint v-else-if="activeTab === 'blueprint'" />
        <ContainerImage v-else-if="activeTab === 'container'" />
      </div>
    </div>

    <!-- Footer Actions (Sticky) -->
    <div class="fixed bottom-0 left-0 right-0 glass-panel border-t border-white/10 z-50 backdrop-blur-xl">
      <div class="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-4 flex items-center justify-end gap-4">
        <button @click="cancel" 
          class="px-8 py-3 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all active:scale-95 shadow-lg">
          Cancel
        </button>
        <button @click="createFunction" 
          class="px-10 py-3 bg-gradient-to-r from-amber-600 to-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-all active:scale-95 shadow-xl">
          Create Function
        </button>
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
</style>
