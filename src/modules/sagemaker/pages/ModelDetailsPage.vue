<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import apiClient from '@/shared/api/apiClient'

const route = useRoute()

const model = ref<any>(null)
const loading = ref(true)

// Config
const temperature = ref(0.7)
const maxTokens = ref(512)

// Inference
const prompt = ref('')
const response = ref('')
const running = ref(false)

/**
 * LOAD MODEL
 */
onMounted(async () => {
  try {
    const res = await apiClient.get(`${apiClient.defaults.baseURL}llm/models/${route.params.id}`)

    model.value = res.data

    temperature.value = model.value.config?.temperature ?? 0.7
    maxTokens.value = model.value.config?.max_tokens ?? 512

  } catch (err) {
    console.error('Failed to load model', err)
  } finally {
    loading.value = false
  }
})

/**
 * UPDATE CONFIG
 */
const updateConfig = async () => {
  try {
    apiClient.put(`${apiClient.defaults.baseURL}llm/models/${route.params.id}/config`, {
      temperature: temperature.value,
      max_tokens: maxTokens.value
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    )

    alert('Config updated')
  } catch (err) {
    console.error('Failed to update config', err)
  }
}

/**
 * RUN INFERENCE
 */
const runInference = async () => {
  if (!prompt.value) return

  running.value = true
  response.value = ''

  try {
    console.log(model.value.ID)
    const res = await apiClient.post('/llm/models/infer', {
      model_id: model.value.ID,
      prompt: prompt.value,
      params: {
        temperature: temperature.value,
        max_tokens: maxTokens.value
      }
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })

    let data = res.data

    // 🔥 if backend sent base64 string, decode it
    if (typeof data === 'string') {
      try {
        const decoded = atob(data) // base64 → string
        data = JSON.parse(decoded) // string → JSON
      } catch (e) {
        console.warn('Failed to decode base64, using raw data')
      }
    }

    response.value = data.output || JSON.stringify(data, null, 2)

  } catch (err) {
    console.error('Inference failed', err)
    response.value = 'Error running inference'
  } finally {
    running.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#05080F] text-white px-8 py-12">

    <div v-if="loading" class="text-slate-400">
      Loading model...
    </div>

    <div v-else-if="model" class="max-w-5xl mx-auto">

      <!-- HEADER -->
      <div class="mb-10">
        <h1 class="text-4xl font-bold mb-2">
          {{ model.name }}
        </h1>

        <p class="text-slate-400">
          Model ID: {{ model.id }}
        </p>

        <p class="text-sm mt-2 text-slate-500">
          Status:
          <span class="text-pink-400">{{ model.status }}</span>
        </p>
      </div>

      <!-- GRID -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">

        <!-- CONFIG -->
        <div class="bg-white/[0.03] border border-white/10 rounded-xl p-6">
          <h2 class="text-lg font-semibold mb-6">Model Configuration</h2>

          <div class="space-y-5">

            <div>
              <label class="text-sm text-slate-400">Temperature</label>
              <input
                v-model="temperature"
                type="number"
                step="0.1"
                class="w-full mt-1 p-2 rounded bg-black border border-white/10"
              />
            </div>

            <div>
              <label class="text-sm text-slate-400">Max Tokens</label>
              <input
                v-model="maxTokens"
                type="number"
                class="w-full mt-1 p-2 rounded bg-black border border-white/10"
              />
            </div>

            <button
              @click="updateConfig"
              class="w-full mt-4 py-2 bg-pink-600 hover:bg-pink-500 rounded font-semibold"
            >
              Save Configuration
            </button>

          </div>
        </div>

        <!-- INFERENCE -->
        <div class="bg-white/[0.03] border border-white/10 rounded-xl p-6">
          <h2 class="text-lg font-semibold mb-6">Test Inference</h2>

          <div class="space-y-4">

            <textarea
              v-model="prompt"
              rows="4"
              placeholder="Enter your prompt..."
              class="w-full p-3 rounded bg-black border border-white/10"
            />

            <button
              @click="runInference"
              :disabled="running"
              class="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded font-semibold"
            >
              {{ running ? 'Running...' : 'Run Inference' }}
            </button>

            <div
              class="mt-4 p-3 rounded bg-black border border-white/10 min-h-[120px] text-sm text-slate-300 whitespace-pre-wrap"
            >
              {{ response || 'Response will appear here...' }}
            </div>

          </div>
        </div>

      </div>

    </div>

    <div v-else class="text-red-400">
      Failed to load model.
    </div>

  </div>
</template>