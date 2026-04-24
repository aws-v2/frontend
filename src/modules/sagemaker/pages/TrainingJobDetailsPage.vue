<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import apiClient from '@/shared/api/apiClient'

const route = useRoute()
const jobId = route.params.id as string

const job = ref<any>(null)
const deployedModel = ref<any>(null)

const loading = ref(false)
const deploying = ref(false)

/**
 * FETCH JOB DETAILS
 */
const fetchJob = async () => {
  loading.value = true

  try {
    const res = await apiClient.get(`/llm/training/jobs/${jobId}`)
    job.value = res.data
  } catch (err) {
    console.error('Failed to load job', err)
  } finally {
    loading.value = false
  }
}

/**
 * DEPLOY MODEL
 */
const deployModel = async () => {
  deploying.value = true

  try {
    const res = await apiClient.post(
      `/llm/training/jobs/${jobId}/deploy`
    )

    // backend returns created model
    deployedModel.value = res.data

    // refresh job state
    await fetchJob()

  } catch (err) {
    console.error('Deploy failed', err)
  } finally {
    deploying.value = false
  }
}

onMounted(fetchJob)

/**
 * STATUS HELPERS
 */
const isCompleted = computed(() => job.value?.status === 'Completed')

const isDeployed = computed(() =>
  job.value?.status === 'Deployed' || deployedModel.value
)

const isActive = computed(() =>
  job.value?.status === 'Training' ||
  job.value?.status === 'Initializing'
)
</script>

<template>
  <div class="min-h-screen bg-[#05080F] text-white px-10 py-20">

    <div class="max-w-5xl mx-auto">

      <!-- HEADER -->
      <div class="mb-10">
        <h1 class="text-3xl font-bold">
          Training Job
        </h1>
        <p class="text-slate-400 mt-1">
          Job ID: {{ jobId }}
        </p>
      </div>

      <!-- LOADING -->
      <div v-if="loading" class="text-slate-400">
        Loading job details...
      </div>

      <div v-else-if="job" class="space-y-8">

        <!-- JOB INFO -->
        <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <h2 class="text-xl font-semibold mb-4">Overview</h2>

          <div class="grid grid-cols-2 gap-6 text-sm">

            <div>
              <p class="text-slate-400">Name</p>
              <p class="font-semibold">{{ job.name }}</p>
            </div>

            <div>
              <p class="text-slate-400">Status</p>
              <p class="font-semibold text-blue-400">{{ job.status }}</p>
            </div>

            <div>
              <p class="text-slate-400">Instance</p>
              <p class="font-semibold">{{ job.instance }}</p>
            </div>

            <div>
              <p class="text-slate-400">Progress</p>
              <p class="font-semibold">{{ job.progress ?? 0 }}%</p>
            </div>

          </div>
        </div>

        <!-- RESOURCE USAGE (SIMULATED FOR NOW) -->
        <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <h2 class="text-xl font-semibold mb-4">Resource Usage</h2>

          <div class="grid grid-cols-3 gap-4">

            <div class="p-4 bg-slate-800/40 rounded-lg">
              <p class="text-slate-400 text-xs">CPU Usage</p>
              <p class="text-lg font-bold">72%</p>
            </div>

            <div class="p-4 bg-slate-800/40 rounded-lg">
              <p class="text-slate-400 text-xs">GPU Usage</p>
              <p class="text-lg font-bold">58%</p>
            </div>

            <div class="p-4 bg-slate-800/40 rounded-lg">
              <p class="text-slate-400 text-xs">Memory</p>
              <p class="text-lg font-bold">11.2 GB</p>
            </div>

          </div>
        </div>

        <!-- DATASETS -->
        <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <h2 class="text-xl font-semibold mb-4">Dataset</h2>

          <p class="text-slate-400 text-sm">Input</p>
          <p class="mb-4 text-white">{{ job.input_path }}</p>

          <p class="text-slate-400 text-sm">Output</p>
          <p class="text-white">{{ job.output_path }}</p>
        </div>

       <!-- DEPLOYMENT SECTION -->
<div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">

  <h2 class="text-xl font-semibold mb-4">Deployment</h2>

  <!-- STATUS INFO -->
  <div class="mb-4">
    <p v-if="isCompleted" class="text-green-400 text-sm">
      ✓ Model is ready for deployment
    </p>

    <p v-else-if="isDeployed" class="text-emerald-400 text-sm">
      ✓ Model is deployed and active
    </p>

    <p v-else class="text-slate-500 text-sm">
      Model must complete training before deployment
    </p>
  </div>

  <!-- DEPLOY BUTTON (ALWAYS PRESENT WHEN ALLOWED) -->
  <button
    v-if="isCompleted && !isDeployed"
    @click="deployModel"
    :disabled="deploying"
    class="px-6 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition"
  >
    {{ deploying ? 'Deploying...' : 'Deploy Model' }}
  </button>

  <!-- DEPLOYED ACTIONS -->
  <div v-if="isDeployed" class="space-y-3">

    <div class="p-4 bg-slate-800 rounded-lg">
      <p class="text-xs text-slate-400">Model ID</p>
      <p class="text-white font-mono text-sm">
        {{ deployedModel?.id || job?.model_id }}
      </p>
    </div>

    <div class="flex gap-3">

      <button
        class="px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold"
        @click="$router.push(`/models/${deployedModel?.id || job?.model_id}`)"
      >
        View Model
      </button>

      <button
        class="px-5 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold"
      >
        Test Inference
      </button>

    </div>

  </div>

</div>

        <!-- TEST DEPLOYMENT -->
        <div v-if="job?.status === 'Deployed'" class="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">

          <h2 class="text-xl font-semibold mb-4">Test Model</h2>

          <textarea
            class="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white"
            placeholder="Enter prompt..."
          ></textarea>

          <button class="mt-4 px-5 py-2 bg-blue-600 rounded-lg">
            Run Inference
          </button>

        </div>

      </div>

    </div>
  </div>
</template>