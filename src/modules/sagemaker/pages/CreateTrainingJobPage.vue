<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSageMakerStore } from '@/modules/sagemaker/store/sagemakerStore'

const router = useRouter()
const store = useSageMakerStore()

const loading = ref(false)

const form = ref({
  name: '',
  instanceType: 'ml.m5.xlarge',
  inputData: '',
  outputData: '',
  baseModel: ''
})

const submit = async () => {
  if (!form.value.name || !form.value.inputData) {
    alert('Name and dataset path are required')
    return
  }

  loading.value = true

  try {
    await store.createTrainingJob({
      name: form.value.name,
      instanceType: form.value.instanceType,
      inputData: form.value.inputData,
      outputData: form.value.outputData,
      baseModel: form.value.baseModel
    })

    router.push('/dashboard?tab=training')
  } catch (err) {
    console.error('Failed to create training job', err)
    alert('Failed to create training job')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#05080F] text-white px-8 py-20">

    <div class="max-w-2xl mx-auto">

      <!-- HEADER -->
      <div class="mb-10">
        <h1 class="text-3xl font-bold">
          Create Training Job
        </h1>
        <p class="text-slate-400 mt-2">
          Configure dataset, compute, and model parameters
        </p>
      </div>

      <!-- FORM -->
      <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 space-y-6">

        <!-- Job Name -->
        <div>
          <label class="text-sm text-slate-400">Job Name</label>
          <input
            v-model="form.name"
            type="text"
            class="w-full mt-2 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white"
            placeholder="e.g. gpt-finetune-v1"
          />
        </div>

        <!-- Base Model -->
        <div>
          <label class="text-sm text-slate-400">Base Model (optional)</label>
          <input
            v-model="form.baseModel"
            type="text"
            class="w-full mt-2 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white"
            placeholder="e.g. llama-3-base"
          />
        </div>

        <!-- Dataset -->
        <div>
          <label class="text-sm text-slate-400">Training Dataset Path</label>
          <input
            v-model="form.inputData"
            type="text"
            class="w-full mt-2 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white"
            placeholder="s3://your-bucket/dataset/"
          />
        </div>

        <!-- Output -->
        <div>
          <label class="text-sm text-slate-400">Output Path</label>
          <input
            v-model="form.outputData"
            type="text"
            class="w-full mt-2 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white"
            placeholder="s3://your-bucket/models/"
          />
        </div>

        <!-- Instance Type -->
        <div>
          <label class="text-sm text-slate-400">Compute Instance</label>
          <select
            v-model="form.instanceType"
            class="w-full mt-2 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white"
          >
            <option value="ml.m5.xlarge">CPU (ml.m5.xlarge)</option>
            <option value="ml.c5.2xlarge">CPU Large</option>
            <option value="ml.g4dn.xlarge">GPU Light</option>
            <option value="ml.p4d.24xlarge">GPU Heavy</option>
          </select>
        </div>

        <!-- ACTIONS -->
        <div class="flex justify-between pt-4">

          <button
            class="px-5 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg"
            @click="router.back()"
          >
            Cancel
          </button>

          <button
            :disabled="loading"
            class="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold disabled:opacity-50"
            @click="submit"
          >
            {{ loading ? 'Creating...' : 'Start Training' }}
          </button>

        </div>

      </div>

    </div>
  </div>
</template>