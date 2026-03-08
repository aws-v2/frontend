<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const functionName = ref('')
const executionKind = ref('node')
const executionCommand = ref('node app.js')
const cpu = ref(1)
const memory = ref(128)
const envVars = ref<{ key: string; value: string }[]>([])
const selectedFile = ref<File | null>(null)
const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const executionKinds = [
  { id: 'binary', label: 'Binary', sub: 'Native_Assembly', image: 'golang:1.22-alpine', defaultCmd: './handler' },
  { id: 'node', label: 'Node.js', sub: 'V8_Runtime', image: 'node:18-alpine', defaultCmd: 'node app.js' },
  { id: 'python', label: 'Python', sub: 'CPython_Runtime', image: 'python:3.10-slim', defaultCmd: 'python main.py' },
  { id: 'java', label: 'Java', sub: 'JVM_Artifact', image: 'amazoncorretto:17', defaultCmd: 'java -jar handler.jar' },
  { id: 'image', label: 'Image', sub: 'OCI_Container', image: 'hello-world:latest', defaultCmd: '' }
]

const image = ref(executionKinds.find(k => k.id === executionKind.value)?.image || '')

watch(executionKind, (newKind) => {
  const kind = executionKinds.find(k => k.id === newKind)
  if (kind) {
    image.value = kind.image
    executionCommand.value = kind.defaultCmd
  }
})

const addEnvVar = () => {
  envVars.value.push({ key: '', value: '' })
}

const removeEnvVar = (index: number) => {
  envVars.value.splice(index, 1)
}

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    selectedFile.value = files[0]
  }
}

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    selectedFile.value = files[0]
  }
}

const getFormData = () => {
  const env: Record<string, string> = {}
  envVars.value.forEach(v => {
    if (v.key) env[v.key] = v.value
  })

  // Command is an array of strings
  const commandArray = executionCommand.value.split(' ').filter(c => c.trim() !== '')

  return {
    name: functionName.value,
    type: 'lambda',
    image: image.value,
    'execution.kind': executionKind.value,
    'execution.command': JSON.stringify(commandArray),
    'resources.cpu': cpu.value.toString(),
    'resources.memory': memory.value.toString(),
    env: JSON.stringify(env),
    file: selectedFile.value
  }
}

defineExpose({ getFormData })
</script>

<template>
  <div class="space-y-10">
    <!-- Basic Information -->
    <div class="bg-white p-10 border-2 border-[#232f3e] relative overflow-hidden">
      <div
        class="absolute right-0 top-0 w-32 h-32 bg-[#fafafa] -rotate-45 translate-x-16 -translate-y-16 border-l-2 border-[#232f3e]">
      </div>

      <div class="flex items-center gap-4 mb-10">
        <span class="w-1.5 h-8 bg-amber-500"></span>
        <h3 class="text-2xl font-black text-[#232f3e] uppercase tracking-tight">Node_Manifest</h3>
      </div>

      <div class="space-y-10 max-w-3xl">
        <!-- Function Name -->
        <div class="space-y-4">
          <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-[#879196] italic">//
            Function_Identifier</label>
          <input v-model="functionName" type="text" placeholder="SERWIN_DAEMON_V1"
            class="w-full bg-white border-2 border-[#eaeded] px-6 py-4 text-sm font-black text-[#232f3e] focus:border-amber-500 outline-none transition-all placeholder:text-[#eaeded] uppercase tracking-widest" />
          <p class="text-[9px] font-black text-[#879196] uppercase tracking-[0.2em]">64_CHAR_MAX // NO_SPACES //
            REGION_UNIQUE</p>
        </div>

        <!-- Execution Kind -->
        <div class="space-y-6">
          <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-[#879196] italic">//
            Execution_Protocol</label>
          <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
            <label v-for="kind in executionKinds" :key="kind.id"
              class="flex flex-col p-4 border-2 transition-all cursor-pointer group"
              :class="executionKind === kind.id ? 'bg-[#fafafa] border-amber-500 translate-y-[-2px]' : 'bg-white border-[#eaeded] hover:border-[#232f3e]'">
              <div class="flex items-center justify-between mb-2">
                <span class="text-[11px] font-black uppercase tracking-[0.1em] transition-colors"
                  :class="executionKind === kind.id ? 'text-[#232f3e]' : 'text-[#879196] group-hover:text-[#232f3e]'">{{
                    kind.label }}</span>
                <input type="radio" :value="kind.id" v-model="executionKind" class="sr-only">
                <div class="w-4 h-4 border-2 transition-all flex items-center justify-center"
                  :class="executionKind === kind.id ? 'border-amber-500 bg-amber-500' : 'border-[#eaeded] group-hover:border-[#232f3e]'">
                  <div v-if="executionKind === kind.id" class="w-2 h-2 bg-white"></div>
                </div>
              </div>
              <span class="text-[8px] font-black text-[#879196] uppercase tracking-widest">{{ kind.sub }}</span>
            </label>
          </div>
        </div>

        <!-- Image Configuration -->
        <div class="space-y-4">
          <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-[#879196] italic">//
            Execution_Image</label>
          <input v-model="image" type="text" placeholder="golang:1.22-alpine"
            class="w-full bg-[#fafafa] border-2 border-[#eaeded] px-6 py-4 text-sm font-black text-[#232f3e] focus:border-amber-500 outline-none transition-all placeholder:text-[#eaeded] tracking-widest" />
          <p class="text-[9px] font-black text-[#879196] uppercase tracking-[0.2em]">OCI_IMAGE_IDENTIFIER //
            RUNTIME_VERSION</p>
        </div>

        <!-- Execution Command -->
        <div class="space-y-4">
          <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-[#879196] italic">//
            Execution_Command</label>
          <input v-model="executionCommand" type="text" placeholder="node index.js"
            class="w-full bg-white border-2 border-[#eaeded] px-6 py-4 text-sm font-black text-[#232f3e] focus:border-amber-500 outline-none transition-all placeholder:text-[#eaeded] uppercase tracking-widest" />
          <p class="text-[9px] font-black text-[#879196] uppercase tracking-[0.2em]">SPACE_SEPARATED_COMMAND_SEQUENCE
          </p>
        </div>

        <!-- File Upload -->
        <div class="space-y-4">
          <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-[#879196] italic">//
            Source_Artifact_Upload</label>
          <div @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop"
            class="relative border-2 border-dashed p-12 transition-all flex flex-col items-center justify-center gap-4 group cursor-pointer"
            :class="[
              isDragging ? 'border-amber-500 bg-amber-500/5' : 'border-[#eaeded] hover:border-[#232f3e]',
              selectedFile ? 'border-solid border-amber-500 bg-[#fafafa]' : ''
            ]" @click="fileInput?.click()">
            <input type="file" ref="fileInput" class="hidden" @change="handleFileChange" />

            <div class="w-16 h-16 border-2 border-[#232f3e] flex items-center justify-center text-[#232f3e] relative">
              <div v-if="selectedFile"
                class="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 text-white flex items-center justify-center text-[10px] font-black">
                OK
              </div>
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>

            <div class="text-center">
              <p class="text-xs font-black uppercase tracking-widest text-[#232f3e]">
                <span v-if="selectedFile">{{ selectedFile.name }}</span>
                <span v-else>Target_Drop_Zone</span>
              </p>
              <p class="text-[10px] font-black text-[#879196] uppercase tracking-[0.2em] mt-2 italic">
                <span v-if="selectedFile">Size: {{ (selectedFile.size / 1024).toFixed(2) }} KB</span>
                <span v-else>Drag and drop or click to upload source artifact</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Resources -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div class="space-y-4">
            <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-[#879196] italic">//
              Compute_Cores</label>
            <div class="flex items-center gap-4">
              <input v-model.number="cpu" type="number" min="1" max="16"
                class="w-full bg-white border-2 border-[#eaeded] px-6 py-4 text-sm font-black text-[#232f3e] focus:border-amber-500 outline-none transition-all" />
              <span class="text-[10px] font-black text-[#879196] uppercase tracking-widest shrink-0">VCPU_UNITS</span>
            </div>
          </div>
          <div class="space-y-4">
            <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-[#879196] italic">//
              Memory_Buffer</label>
            <div class="flex items-center gap-4">
              <input v-model.number="memory" type="number" step="128" min="128" max="10240"
                class="w-full bg-white border-2 border-[#eaeded] px-6 py-4 text-sm font-black text-[#232f3e] focus:border-amber-500 outline-none transition-all" />
              <span class="text-[10px] font-black text-[#879196] uppercase tracking-widest shrink-0">MEGABYTES</span>
            </div>
          </div>
        </div>

        <!-- Environment Variables -->
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-[#879196] italic">//
              Environment_Vectors</label>
            <button @click="addEnvVar"
              class="text-[10px] font-black text-amber-600 uppercase tracking-widest hover:text-[#232f3e] transition-colors">
              + Add_Vector
            </button>
          </div>

          <div class="space-y-4">
            <div v-for="(env, index) in envVars" :key="index"
              class="flex gap-4 items-center animate-in fade-in slide-in-from-left-4 duration-300">
              <input v-model="env.key" type="text" placeholder="KEY_ID"
                class="flex-1 bg-white border-2 border-[#eaeded] px-6 py-3 text-xs font-black text-[#232f3e] focus:border-amber-500 outline-none transition-all placeholder:text-[#eaeded] uppercase" />
              <input v-model="env.value" type="text" placeholder="VALUE_DATA"
                class="flex-1 bg-white border-2 border-[#eaeded] px-6 py-3 text-xs font-black text-[#232f3e] focus:border-amber-500 outline-none transition-all placeholder:text-[#eaeded]" />
              <button @click="removeEnvVar(index)"
                class="p-3 border-2 border-[#eaeded] text-[#879196] hover:border-red-500 hover:text-red-500 transition-all">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>
            <div v-if="envVars.length === 0" class="p-8 border-2 border-[#eaeded] border-dashed text-center">
              <p class="text-[10px] font-black text-[#879196] uppercase tracking-widest">No_Active_Vectors_Defined</p>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* Scoped styles removed as utility classes are used for the new theme */
</style>
