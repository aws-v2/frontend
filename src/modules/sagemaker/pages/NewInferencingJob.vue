<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'

const name = ref('')
const file = ref<File | null>(null)

const loading = ref(false)
const step = ref<'idle' | 'registering' | 'uploading' | 'done'>('idle')

const modelId = ref('')
const uploadUrl = ref('')
const statusMessage = ref('')

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement

  const selectedFile = target.files?.[0]

  if (selectedFile) {
    file.value = selectedFile
  }
}
/**
 * STEP 1: Register model → get presigned URL
 */
const registerModel = async () => {
  if (!name.value || !file.value) return

  loading.value = true
  step.value = 'registering'
  statusMessage.value = 'Registering model...'

  try {
    const token = localStorage.getItem('auth_token')

    const res = await axios.post(
      '/api/v1/llm/models/register',
      {
        name: name.value
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    modelId.value = res.data.model_id
    uploadUrl.value = res.data.upload_url

    await uploadFile()
  } catch (err) {
    console.error(err)
    statusMessage.value = 'Registration failed'
  } finally {
    loading.value = false
  }
}

/**
 * STEP 2: Upload directly to S3 via presigned URL
 */
const uploadFile = async () => {
  if (!file.value || !uploadUrl.value) return

  step.value = 'uploading'
  statusMessage.value = 'Uploading GGUF model...'
    const token = localStorage.getItem('auth_token')

  try {
    await axios.put(uploadUrl.value, file.value, {
      headers: {
        'Content-Type': file.value.type || 'application/octet-stream',
        'Authorization': `Bearer ${token}` // 👈 add this
      }
    })

    step.value = 'done'
    statusMessage.value = 'Upload complete. Model is being processed.'
  } catch (err) {
    console.error(err)
    statusMessage.value = 'Upload failed'
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#05080F] text-white px-8 pt-24 pb-20">

    <div class="max-w-3xl mx-auto">

      <!-- HEADER -->
      <div class="mb-10">
        <h1 class="text-4xl font-bold">
          Register <span class="text-pink-500">GGUF Model</span>
        </h1>
        <p class="text-slate-400 mt-2">
          Upload a model file and we’ll provision inference workers automatically.
        </p>
      </div>

      <!-- CARD -->
      <div class="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-6">

        <!-- MODEL NAME -->
        <div>
          <label class="text-xs uppercase tracking-widest text-slate-500">Model Name</label>
          <input
            v-model="name"
            type="text"
            placeholder="e.g. mistral-7b-instruct"
            class="w-full mt-2 px-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-pink-500"
          />
        </div>

        <!-- FILE UPLOAD -->
        <div>
          <label class="text-xs uppercase tracking-widest text-slate-500">
            GGUF File
          </label>

          <div class="mt-2 border border-dashed border-white/15 rounded-xl p-6 text-center hover:border-pink-500/50 transition">
            
            <input
              type="file"
              accept=".gguf"
              @change="handleFileChange"
              class="hidden"
              id="fileInput"
            />

            <label for="fileInput" class="cursor-pointer block">
              <p class="text-sm text-slate-400">
                Click to select GGUF file
              </p>
              <p v-if="file" class="mt-2 text-pink-400 font-mono text-xs">
                {{ file.name }}
              </p>
            </label>

          </div>
        </div>

        <!-- ACTION BUTTON -->
        <button
          @click="registerModel"
          :disabled="loading"
          class="w-full py-3 rounded-lg font-bold text-sm transition"
          :class="loading
            ? 'bg-white/10 text-slate-400'
            : 'bg-pink-600 hover:bg-pink-500'"
        >
          {{ step === 'registering'
              ? 'Registering...'
              : step === 'uploading'
              ? 'Uploading...'
              : 'Register Model'
          }}
        </button>

        <!-- STATUS -->
        <div v-if="statusMessage" class="text-sm text-slate-400">
          {{ statusMessage }}
        </div>

        <!-- PROGRESS STATE -->
        <div v-if="modelId" class="pt-4 border-t border-white/10 text-xs text-slate-500 space-y-1">
          <div>Model ID: <span class="text-white font-mono">{{ modelId }}</span></div>
          <div>Status: <span class="text-emerald-400">{{ step }}</span></div>
        </div>

      </div>

    </div>
  </div>
</template>