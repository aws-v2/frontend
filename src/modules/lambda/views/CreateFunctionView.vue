<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthorFromScratch from '../components/AuthorFromScratch.vue'
import UseBlueprint from '../components/UseBlueprint.vue'
import ContainerImage from '../components/ContainerImage.vue'
import { useLambdaStore } from '../store/lambdaStore'

const router = useRouter()
const lambdaStore = useLambdaStore()
const activeTab = ref('scratch')
const scratchRef = ref<any>(null)

const tabs = [
  { id: 'scratch', label: 'Author from scratch', sub: 'Start with a simple Hello World example.' },
  { id: 'blueprint', label: 'Use a blueprint', sub: 'Build a Lambda application from sample code and configuration presets for common use cases.' },
  { id: 'container', label: 'Container image', sub: 'Select a container image to deploy for your function.' }
]

const cancel = () => {
  router.push({ name: 'lambda-landing' })
}

const createFunction = async () => {
  if (activeTab.value === 'scratch' && scratchRef.value) {
    const data = scratchRef.value.getFormData()

    if (!data.name) {
      alert('Function name is required.')
      return
    }

    if (data['execution.kind'] !== 'image' && !data.file) {
      alert('Source artifact is required for this execution protocol.')
      return
    }

    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null) {
        formData.append(key, value as any)
      }
    })

    try {
      await lambdaStore.registerFunction(formData)
      router.push({ name: 'lambda-landing' })
    } catch (error) {
      alert('Failed to initialize forge. Check console for details.')
    }
  } else {
    console.log('Blueprint and Container image modes are not implemented yet.')
  }
}
</script>

<template>
  <div
    class="min-h-screen bg-white text-[#16191f] font-urbanist selection:bg-amber-500/20 selection:text-amber-900 overflow-x-hidden">
    <!-- Structural Grid Background -->
    <div
      class="absolute inset-0 bg-[linear-gradient(rgba(251,191,36,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(251,191,36,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none">
    </div>

    <div class="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-16 pt-24 pb-40 space-y-12">
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
        <a href="#" @click.prevent="router.push('/dashboard')"
          class="text-[#879196] hover:text-amber-600 transition-colors">Infrastructure</a>
        <div class="w-1 h-1 bg-[#eaeded] rounded-full"></div>
        <a href="#" @click.prevent="cancel" class="text-[#879196] hover:text-amber-600 transition-colors">Lambda</a>
        <div class="w-1 h-1 bg-[#eaeded] rounded-full"></div>
        <span class="text-[#232f3e]">Create_Function</span>
      </nav>

      <!-- Header -->
      <div class="border-l-4 border-amber-500 pl-8 py-2 bg-[#fafafa] relative overflow-hidden group">
        <div class="absolute right-0 top-0 w-32 h-32 bg-amber-500/5 -rotate-45 translate-x-16 -translate-y-16"></div>
        <h1 class="text-6xl font-black text-[#232f3e] tracking-tight uppercase leading-none">
          Forge <span class="text-amber-600 italic">Function</span>
        </h1>
      </div>

      <!-- Tabs Selector -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
          class="bg-white border-2 p-8 transition-all duration-300 flex gap-6 relative overflow-hidden group cursor-pointer"
          :class="activeTab === tab.id ? 'border-amber-500 bg-[#fafafa] translate-y-[-4px]' : 'border-[#eaeded] hover:border-[#232f3e]'">
          <div
            class="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 -rotate-45 translate-x-8 -translate-y-8 border-l-2 border-amber-500/20"
            v-if="activeTab === tab.id"></div>

          <div class="flex-shrink-0 mt-1 relative z-10">
            <div class="w-6 h-6 border-2 flex items-center justify-center transition-all"
              :class="activeTab === tab.id ? 'border-amber-500 bg-amber-500/10' : 'border-[#eaeded] group-hover:border-[#232f3e]'">
              <div v-if="activeTab === tab.id" class="w-3 h-3 bg-amber-500"></div>
            </div>
          </div>
          <div class="relative z-10">
            <h4 class="text-lg font-black uppercase tracking-tight mb-2 transition-colors"
              :class="activeTab === tab.id ? 'text-[#232f3e]' : 'text-[#879196] group-hover:text-[#232f3e]'">
              {{ tab.label }}
            </h4>
            <p class="text-[11px] font-medium leading-relaxed uppercase tracking-wide transition-colors"
              :class="activeTab === tab.id ? 'text-[#545b64]' : 'text-[#879196] group-hover:text-[#545b64]'">
              {{ tab.sub }}
            </p>
          </div>
        </div>
      </div>

      <!-- Active Tab Content -->
      <div class="transition-all duration-300">
        <AuthorFromScratch v-if="activeTab === 'scratch'" ref="scratchRef" />
        <UseBlueprint v-else-if="activeTab === 'blueprint'" />
        <ContainerImage v-else-if="activeTab === 'container'" />
      </div>
    </div>

    <!-- Footer Actions (Sticky) -->
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#232f3e] z-50">
      <div class="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-6 flex items-center justify-end gap-6">
        <button @click="cancel"
          class="px-10 py-4 border-2 border-[#232f3e] text-[#232f3e] text-[10px] font-black uppercase tracking-widest hover:bg-[#fafafa] transition-all">
          Abort_Protocol
        </button>
        <button @click="createFunction"
          class="px-12 py-4 bg-amber-500 text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[#232f3e] transition-all relative overflow-hidden group">
          <span class="relative z-10">Initialize_Forge</span>
          <div
            class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          </div>
        </button>
      </div>
    </div>

    <!-- Footer -->
    <footer class="py-20 bg-white border-t-2 border-[#232f3e] mt-20">
      <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-[#232f3e] flex items-center justify-center text-white font-black italic">S</div>
          <span class="font-black text-xl text-[#232f3e] tracking-tighter uppercase">SerwinForge</span>
        </div>
        <div class="flex gap-10 text-[10px] font-black text-[#879196] uppercase tracking-[0.2em]">
          <a href="#" class="hover:text-amber-600">Forge_Manual</a>
          <a href="#" class="hover:text-amber-600">Policy_Core</a>
          <a href="#" class="hover:text-amber-600">Edge_Status</a>
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
</style>
