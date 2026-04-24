<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '@/shared/api/apiClient'

const router = useRouter()

const activeTab = ref<'analytics' | 'inference' | 'training'>('analytics')

const models = ref<any[]>([])
const trainingJobs = ref<any[]>([])
const loadingJobs = ref(false)

/**
 * FETCH MODELS
 */
const fetchModels = async () => {
  try {
    const res = await apiClient.get('/llm/models')
    models.value = res.data || []
  } catch (err) {
    console.error('Failed to load models', err)
  }
}

/**
 * FETCH TRAINING JOBS
 */
const fetchTrainingJobs = async () => {
  loadingJobs.value = true

  try {
    const res = await apiClient.get('/llm/training/jobs')
    trainingJobs.value = res.data || []
  } catch (err) {
    console.error('Failed to load training jobs', err)
  } finally {
    loadingJobs.value = false
  }
}

/**
 * INIT
 */
onMounted(async () => {
  await Promise.all([
    fetchModels(),
    fetchTrainingJobs()
  ])
})

/**
 * ANALYTICS STATS
 */
const stats = computed(() => {
  const totalTraining = trainingJobs.value.length

  const activeTraining = trainingJobs.value.filter(j =>
    j.status === 'Training' || j.status === 'Initializing'
  ).length

  const completed = trainingJobs.value.filter(j =>
    j.status === 'Completed'
  ).length

  const failed = trainingJobs.value.filter(j =>
    j.status === 'Failed'
  ).length

  return {
    totalTraining,
    activeTraining,
    completed,
    failed,
    inferenceRequests: 12458,
    inferenceLatency: 182,
    activeModels: models.value.length
  }
})
</script>
<template>
  <div class="relative min-h-screen bg-[#05080F] text-white overflow-hidden">

    <!-- Background Glow -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-pink-500/10 blur-[120px] rounded-full pointer-events-none"></div>

    <div class="relative max-w-[1600px] mx-auto px-8 pt-24 pb-20 z-10">

      <!-- HEADER -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-slate-800/60 pb-8">
        <div>
          <h1 class="text-4xl font-extrabold tracking-tight">
            Model
            <span class="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent font-black">Dashboard</span>
          </h1>
          <p class="text-slate-400 mt-3 text-lg font-medium">
            Manage GGUF models, training jobs and inference workloads
          </p>
        </div>

        <button
          class="px-6 py-3 font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg"
          @click="router.push('/models/register')"
        >
          Upload GGUF
        </button>
      </div>

      <!-- TABS -->
      <div class="flex gap-2 mb-10 p-1 bg-slate-900/50 backdrop-blur rounded-xl border border-slate-800 w-fit">

        <button
          @click="activeTab = 'analytics'"
          class="px-6 py-2.5 rounded-lg text-sm"
          :class="activeTab === 'analytics'
            ? 'bg-slate-800 text-white'
            : 'text-slate-400'"
        >
          Overview & Analytics
        </button>

        <button
          @click="activeTab = 'inference'"
          class="px-6 py-2.5 rounded-lg text-sm"
          :class="activeTab === 'inference'
            ? 'bg-slate-800 text-white'
            : 'text-slate-400'"
        >
          Model Inventory
        </button>

        <!-- ✅ NEW TAB -->
        <button
          @click="activeTab = 'training'"
          class="px-6 py-2.5 rounded-lg text-sm"
          :class="activeTab === 'training'
            ? 'bg-slate-800 text-white'
            : 'text-slate-400'"
        >
          Training Jobs
        </button>

      </div>

      <!-- ===================== -->
      <!-- ANALYTICS -->
      <!-- ===================== -->
      <div v-if="activeTab === 'analytics'">

        <div class="grid grid-cols-4 gap-6 mb-10">

          <div class="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl">
            <p class="text-sm text-slate-400">Requests</p>
            <p class="text-3xl font-bold">{{ stats.inferenceRequests }}</p>
          </div>

          <div class="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl">
            <p class="text-sm text-slate-400">Latency</p>
            <p class="text-3xl font-bold">{{ stats.inferenceLatency }}ms</p>
          </div>

          <div class="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl">
            <p class="text-sm text-slate-400">Active Models</p>
            <p class="text-3xl font-bold">{{ stats.activeModels }}</p>
          </div>

          <div class="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl">
            <p class="text-sm text-slate-400">Failures</p>
            <p class="text-3xl font-bold">{{ stats.failed }}</p>
          </div>

        </div>

      </div>

      <!-- ===================== -->
      <!-- MODEL INVENTORY -->
      <!-- ===================== -->
      <div v-if="activeTab === 'inference'">

        <div class="grid grid-cols-3 gap-6">

          <div
            v-for="m in models"
            :key="m.ID"
            class="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl"
            @click="router.push(`/models/${m.ID}`)"
          >
            <h3 class="font-bold text-lg">{{ m.Name }}</h3>
            <p class="text-sm text-slate-400">GGUF Model</p>
          </div>

        </div>

      </div>

      <!-- ===================== -->
      <!-- TRAINING JOBS -->
      <!-- ===================== -->
      <div v-if="activeTab === 'training'">

        <div class="flex justify-between items-center mb-6">
          <div>
            <h2 class="text-2xl font-bold">Training Jobs</h2>
            <p class="text-slate-400 text-sm">{{ trainingJobs.length }} jobs</p>
          </div>

          <button
            class="px-5 py-2 bg-blue-600 rounded-lg"
            @click="router.push('/training/new')"
          >
            New Job
          </button>
        </div>

        <div class="grid grid-cols-2 gap-6">

         <div
  v-for="job in trainingJobs"
  :key="job.id"
  class="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl cursor-pointer hover:border-slate-600 transition"
  @click="router.push(`/training/jobs/${job.id}`)"
>

  <div class="flex justify-between">
    <h3 class="font-bold">{{ job.name }}</h3>

    <span
      class="text-xs px-2 py-1 rounded"
      :class="{
        'bg-yellow-500/10 text-yellow-400': job.status === 'Training',
        'bg-emerald-500/10 text-emerald-400': job.status === 'Completed',
        'bg-red-500/10 text-red-400': job.status === 'Failed',
        'bg-slate-500/10 text-slate-300': job.status === 'Initializing'
      }"
    >
      {{ job.status }}
    </span>
  </div>

  <!-- PROGRESS BAR (FIXED) -->
  <div class="mt-4 w-full bg-slate-800 h-2 rounded overflow-hidden">
    <div
      class="h-2 bg-blue-500 transition-all duration-300"
      :style="{ width: (job.progress ?? 0) + '%' }"
    />
  </div>

  <p class="text-xs text-slate-400 mt-2">
    {{ job.progress ?? 0 }}%
  </p>

</div>

          </div>

        </div>

        <!-- EMPTY -->
        <div v-if="!trainingJobs.length" class="text-center text-slate-400 mt-10">
          No training jobs yet
        </div>

      </div>

    </div>
  
</template>