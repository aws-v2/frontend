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
  <div class="min-h-screen bg-[var(--bg-console)] pb-20">
    <!-- Breadcrumbs -->
    <nav class="bg-white border-b border-gray-200 px-6 py-2 flex items-center gap-2 text-xs font-medium text-gray-500">
        <a href="#" @click.prevent="router.push('/dashboard')" class="hover:text-[var(--aws-blue)] hover:underline uppercase tracking-wider text-[10px]">AWS</a>
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <a href="#" @click.prevent="cancel" class="hover:text-[var(--aws-blue)] hover:underline">Lambda</a>
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <a href="#" @click.prevent="cancel" class="hover:text-[var(--aws-blue)] hover:underline">Functions</a>
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span class="text-gray-900">Create function</span>
    </nav>

    <div class="px-8 py-6">
      <div class="flex items-center gap-2 mb-2">
        <h1 class="text-2xl font-bold text-gray-900 leading-tight">Create function</h1>
        <span class="text-[var(--aws-blue)] cursor-help">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
      </div>
      <p class="text-xs text-gray-600 mb-8">Choose one of the following options to create your function.</p>

      <!-- Tabs Selector -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          class="aws-card p-4 rounded-sm cursor-pointer transition-all border-2 flex gap-4"
          :class="activeTab === tab.id ? 'border-[var(--aws-blue)] bg-blue-50/20' : 'border-gray-200 hover:border-gray-400'"
        >
          <div class="flex-shrink-0 mt-0.5">
            <div 
              class="w-4 h-4 rounded-full border flex items-center justify-center"
              :class="activeTab === tab.id ? 'border-[var(--aws-blue)]' : 'border-gray-400'"
            >
              <div v-if="activeTab === tab.id" class="w-2 h-2 rounded-full bg-[var(--aws-blue)]"></div>
            </div>
          </div>
          <div>
            <h4 class="text-xs font-bold text-gray-800">{{ tab.label }}</h4>
            <p class="text-[10px] text-gray-500 leading-tight mt-1">{{ tab.sub }}</p>
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
    <div class="fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-gray-200 flex items-center justify-end px-8 gap-4 z-50">
        <button @click="cancel" class="text-xs font-bold text-[var(--aws-blue)] hover:underline">Cancel</button>
        <button @click="createFunction" class="btn-aws-primary px-8">Create function</button>
    </div>
  </div>
</template>

<style scoped>
/* Ensure the radio button look matches AWS Console */
</style>
