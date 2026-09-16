<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '@/shared/api/apiClient'
import { useAuthStore } from '@/modules/auth/store/authStore'

const router = useRouter()

// ─── Types ──────────────────────────────────────────────────────────────────
interface PipelineRun {
  id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  startedAt: string
  finishedAt?: string
  stages: { name: string; status: string; duration?: string }[]
}

interface SageMakerProject {
  id: string
  name: string
  description: string
  pipeline: string[]
  tags: string[]
  createdAt: string
  lastRun?: string
  status: 'idle' | 'running' | 'completed' | 'failed'
  runs: PipelineRun[]
  datasources: { name: string; type: string; path: string }[]
}

// ─── Tab ────────────────────────────────────────────────────────────────────
const activeTab = ref<'projects' | 'inventory' | 'training'>('projects')

// ─── Projects ────────────────────────────────────────────────────────────────
const projects = ref<SageMakerProject[]>([])

const seedProjects: SageMakerProject[] = [
  {
    id: 'proj-kalshi-001',
    name: 'Kalshi Prediction Market',
    description: 'End-to-end pipeline: scrape markets, clean data, train ensemble, deploy inference endpoint.',
    pipeline: ['ingest', 'clean', 'train', 'evaluate', 'deploy'],
    tags: ['prediction', 'nlp', 'ensemble'],
    createdAt: '2026-05-20T10:00:00Z',
    lastRun: '2026-05-29T01:00:00Z',
    status: 'completed',
    runs: [
      {
        id: 'run-001',
        status: 'completed',
        startedAt: '2026-05-29T01:00:00Z',
        finishedAt: '2026-05-29T03:42:00Z',
        stages: [
          { name: 'ingest', status: 'completed', duration: '12m' },
          { name: 'clean', status: 'completed', duration: '8m' },
          { name: 'train', status: 'completed', duration: '94m' },
          { name: 'evaluate', status: 'completed', duration: '4m' },
          { name: 'deploy', status: 'completed', duration: '2m' },
        ]
      }
    ],
    datasources: [
      { name: 'kalshi_markets.json', type: 'JSON Feed', path: 's3://kalshi/raw/markets/' },
      { name: 'clean_pipeline.py', type: 'Script', path: 's3://kalshi/scripts/clean.py' },
    ]
  },
  {
    id: 'proj-fraud-002',
    name: 'Fraud Detection v2',
    description: 'Real-time transaction scoring using gradient boosted trees with SHAP explanations.',
    pipeline: ['ingest', 'clean', 'train', 'evaluate'],
    tags: ['fraud', 'xgboost', 'real-time'],
    createdAt: '2026-05-15T09:00:00Z',
    lastRun: '2026-05-28T14:00:00Z',
    status: 'running',
    runs: [],
    datasources: [
      { name: 'transactions_2026.parquet', type: 'Parquet', path: 's3://fraud/raw/tx/' },
    ]
  }
]

const loadProjects = async () => {
  try {
    const res = await apiClient.get('/llm/training/jobs')
    projects.value = res.data.data || []
  } catch (e) {
    console.error('Failed to load projects', e)
    projects.value = []
  }
}

const recentProjects = computed(() =>
  [...projects.value]
    .sort((a, b) => new Date(b.lastRun ?? b.createdAt).getTime() - new Date(a.lastRun ?? a.createdAt).getTime())
    .slice(0, 2)
)

// ─── Create Project Modal State & Methods ────────────────────────────────────
const showCreateModal = ref(false)
const isCreating = ref(false)
const creationStep = ref('')
const creationError = ref<string | null>(null)
const allStages = ['ingest', 'clean', 'train', 'evaluate', 'deploy']

const newProject = ref<any>({
  name: '',
  description: '',
  tags: '',
  pipeline: [...allStages] as string[],
  type: 'llm', // default to 'llm'
  baseModel: '',
  trainingDataSource: 'upload', // 'upload' | 'url' | 's3'
  trainingDataUrl: '',
  trainingDataBucket: '',
  trainingFiles: [] as File[],
  useValidationData: false,
  validationFiles: [] as File[],
  trainingMode: 'serwin', // 'serwin' | 'custom'
  entryPoint: '',
  trainingCode: null as File | null,
  compute: '',
  schedule: 'manual',
  callback:''
})

const toggleStage = (stage: string) => {
  const idx = newProject.value.pipeline.indexOf(stage)
  if (idx === -1) newProject.value.pipeline.push(stage)
  else newProject.value.pipeline.splice(idx, 1)
}

const resetForm = () => {
  newProject.value = {
    name: '',
    description: '',
    tags: '',
    pipeline: [...allStages],
    type: 'llm',
    baseModel: '',
    trainingDataSource: 'upload',
    trainingDataUrl: '',
    trainingDataBucket: '',
    trainingFiles: [],
    useValidationData: false,
    validationFiles: [],
    trainingMode: 'serwin',
    entryPoint: '',
    trainingCode: null,
    compute: '',
    schedule: 'manual'
  }
  creationError.value = null
  creationStep.value = ''
  isCreating.value = false
}

const removeTrainingFile = (idx: number) => {
  newProject.value.trainingFiles.splice(idx, 1)
}

const removeValidationFile = (idx: number) => {
  newProject.value.validationFiles.splice(idx, 1)
}

const createProject = async () => {
  if (!newProject.value.name.trim()) return
  if (!newProject.value.type) return

  isCreating.value = true
  creationError.value = null
  creationStep.value = 'Preparing project payload...'

  // Collect files and metadata
  const filesToUpload: Array<{ file: File; role: string }> = []
  const filesMetadata: Array<{ name: string; size: number; type: string; role: string }> = []

  if (newProject.value.trainingDataSource === 'upload' && newProject.value.trainingFiles?.length) {
    for (const f of newProject.value.trainingFiles) {
      filesToUpload.push({ file: f, role: 'training' })
      filesMetadata.push({
        name: f.name,
        size: f.size,
        type: f.type || 'application/octet-stream',
        role: 'training'
      })
    }
  }

  if (newProject.value.useValidationData && newProject.value.validationFiles?.length) {
    for (const f of newProject.value.validationFiles) {
      filesToUpload.push({ file: f, role: 'validation' })
      filesMetadata.push({
        name: f.name,
        size: f.size,
        type: f.type || 'application/octet-stream',
        role: 'validation'
      })
    }
  }

  if (newProject.value.trainingMode === 'custom' && newProject.value.trainingCode) {
    filesToUpload.push({ file: newProject.value.trainingCode, role: 'code' })
    filesMetadata.push({
      name: newProject.value.trainingCode.name,
      size: newProject.value.trainingCode.size,
      type: newProject.value.trainingCode.type || 'application/octet-stream',
      role: 'code'
    })
  }

  const tagsArray = typeof newProject.value.tags === 'string'
    ? newProject.value.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
    : (newProject.value.tags || [])

  const projPayload = {
    id: `proj-${Date.now()}`,
    name: newProject.value.name.trim(),
    description: newProject.value.description.trim(),
    type: newProject.value.type,
    base_model: newProject.value.baseModel,
    baseModel: newProject.value.baseModel,
    training_data_source: newProject.value.trainingDataSource,
    trainingDataSource: newProject.value.trainingDataSource,
    training_data_url: newProject.value.trainingDataUrl,
    trainingDataUrl: newProject.value.trainingDataUrl,
    training_data_bucket: newProject.value.trainingDataBucket,
    trainingDataBucket: newProject.value.trainingDataBucket,
    use_validation_data: newProject.value.useValidationData,
    useValidationData: newProject.value.useValidationData,
    training_mode: newProject.value.trainingMode,
    trainingMode: newProject.value.trainingMode,
    entry_point: newProject.value.entryPoint,
    entryPoint: newProject.value.entryPoint,
    compute: newProject.value.compute,
    schedule: newProject.value.schedule,
    pipeline: [...newProject.value.pipeline],
    tags: tagsArray,
    createdAt: new Date().toISOString(),
    created_at: new Date().toISOString(),
    status: 'idle',
    runs: [],
    datasources: filesMetadata.map(f => ({
      name: f.name,
      type: f.role === 'training' ? 'Training Dataset' : f.role === 'validation' ? 'Validation Dataset' : 'Custom Code',
      path: `s3://sagemaker/${f.name}`
    })),
    files: filesMetadata,
    callback:newProject.value.callback
  }

  try {
    creationStep.value = 'Creating project on server...'
    const res = await apiClient.post('/llm/training/jobs', projPayload)
    const resData = res.data

    // Extract presigned URLs from backend response object { code, message, data }
    const payloadData = resData?.data || resData

    let presignedItems: any[] = []
    if (Array.isArray(payloadData)) {
      presignedItems = payloadData
    } else if (Array.isArray(payloadData?.presigned_urls)) {
      presignedItems = payloadData.presigned_urls
    } else if (Array.isArray(payloadData?.presignedUrls)) {
      presignedItems = payloadData.presignedUrls
    } else if (Array.isArray(payloadData?.files)) {
      presignedItems = payloadData.files
    } else if (payloadData?.presigned_urls && typeof payloadData.presigned_urls === 'object') {
      presignedItems = Object.entries(payloadData.presigned_urls).map(([k, v]) => ({ name: k, url: v }))
    } else if (payloadData?.presignedUrls && typeof payloadData.presignedUrls === 'object') {
      presignedItems = Object.entries(payloadData.presignedUrls).map(([k, v]) => ({ name: k, url: v }))
    }

    // Upload files directly to presigned URLs if present
    if (filesToUpload.length > 0) {
      for (let i = 0; i < filesToUpload.length; i++) {
        const item = filesToUpload[i]
        creationStep.value = `Uploading ${item.file.name} (${i + 1}/${filesToUpload.length})...`

        let targetUrl = ''
        if (presignedItems.length > 0) {
          const match = presignedItems.find((p: any) =>
            p.name === item.file.name ||
            p.file_name === item.file.name ||
            p.fileName === item.file.name ||
            p.role === item.role ||
            (typeof p.url === 'string' && p.url.includes(encodeURIComponent(item.file.name)))
          ) || presignedItems[i]

          targetUrl = typeof match === 'string' ? match : (match?.url || match?.upload_url || match?.uploadUrl || '')
        }

        if (targetUrl) {
          await apiClient.put(targetUrl, item.file, {
            headers: {
              'Content-Type': item.file.type || 'application/octet-stream'
            },
            transformRequest: [(data) => data]
          })
        }
      }
    }

    creationStep.value = 'Project initialized successfully!'
    await loadProjects()
    setTimeout(() => {
      showCreateModal.value = false
      resetForm()
    }, 800)
  } catch (e: any) {
    console.error('Failed to create project:', e)
    creationError.value = e.response?.data?.message || e.message || 'Failed to create project'
    isCreating.value = false
  }
}

// ─── File handlers used by the modal ───────────────────────────────────
const handleTrainingDataUpload = (e: Event) => {
  const input = e.target as HTMLInputElement
  const files = input?.files ? Array.from(input.files) : []
  newProject.value.trainingFiles = [...(newProject.value.trainingFiles || []), ...files]
}

const handleValidationDataUpload = (e: Event) => {
  const input = e.target as HTMLInputElement
  const files = input?.files ? Array.from(input.files) : []
  newProject.value.validationFiles = [...(newProject.value.validationFiles || []), ...files]
}

const handleTrainingCodeUpload = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input?.files && input.files[0] ? input.files[0] : null
  newProject.value.trainingCode = file
}

const formatFileSize = (size?: number) => {
  if (!size && size !== 0) return ''
  const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024))
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  return `${(size / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${sizes[i]}`
}







// ─── Models & Training Jobs ──────────────────────────────────────────────────
const models = ref<any[]>([])
const trainingJobs = ref<any[]>([])
const loadingJobs = ref(false)

const fetchModels = async () => {
  try {
    const res = await apiClient.get('/llm/models')
    models.value = Array.isArray(res.data?.data)
      ? res.data.data
      : Array.isArray(res.data)
      ? res.data
      : []
  } catch { /* silent */ }
}

const fetchTrainingJobs = async () => {
  loadingJobs.value = true
  try {
    const res = await apiClient.get('/llm/training/jobs')
    trainingJobs.value = res.data || []
  } catch { /* silent */ } finally {
    loadingJobs.value = false
  }
}

// ─── Stats ──────────────────────────────────────────────────────────────────
const stats = computed(() => ({
  totalProjects: projects.value.length,
  activeRuns: projects.value.filter(p => p.status === 'running').length,
  completed: projects.value.filter(p => p.status === 'completed').length,
  failed: projects.value.filter(p => p.status === 'failed').length,
  totalJobs: trainingJobs.value.length,
  activeModels: models.value.length,
}))

// ─── Activity graph data (fake 14-day run timeseries) ───────────────────────
const graphData = computed(() => {
  return Array.from({ length: 14 }, (_, i) => ({
    label: `D-${13 - i}`,
    value: Math.floor(Math.random() * 8 + 1)
  }))
})
const graphMax = computed(() => Math.max(...graphData.value.map(d => d.value), 1))

onMounted(async () => {
  await loadProjects()
  await Promise.all([fetchModels(), fetchTrainingJobs()])
})

// ─── Helpers ────────────────────────────────────────────────────────────────
const stageColor = (status: string) => ({
  'completed': 'bg-emerald-500 text-white',
  'running': 'bg-[#ff9900] text-white',
  'failed': 'bg-red-500 text-white',
  'idle': 'bg-[#f0f0f0] text-[#545b64]',
}[status] || 'bg-[#eaeded] text-[#545b64]')

const statusDot = (status: string) => ({
  'completed': 'bg-emerald-500',
  'running': 'bg-[#ff9900] animate-pulse',
  'failed': 'bg-red-500',
  'idle': 'bg-[#d1d5db]',
}[status] || 'bg-[#d1d5db]')

const formatDate = (iso?: string) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}


const loading = ref(false)
const step = ref<'idle' | 'registering' | 'uploading' | 'done'>('idle')
const name = ref('')
const statusMessage = ref('')
const file = ref<File | null>(null)

const modelId = ref('')
const uploadUrl = ref('')


const registerModel = async () => {
  if (!name.value || !file.value) return

  loading.value = true
  step.value = 'registering'
  statusMessage.value = 'Registering base model...'

  try {
    const authStore = useAuthStore()
    const formData = new FormData()
    formData.append('name', name.value)
    formData.append('is_public', String(isPublicModel.value))
    formData.append('isPublic', String(isPublicModel.value))
    formData.append('file', file.value)

    const res = await apiClient.post('/llm/models/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    const payload = res.data?.data || res.data
    modelId.value = payload?.model_id || payload?.id || ''
    uploadUrl.value = payload?.upload_url || payload?.uploadUrl || ''

    if (uploadUrl.value) {
      await uploadFile()
    } else {
      step.value = 'done'
      statusMessage.value = 'Base model registered successfully.'
    }

    await fetchModels()
    setTimeout(() => {
      uploadModalOpen.value = false
      name.value = ''
      file.value = null
      isPublicModel.value = false
      statusMessage.value = ''
      step.value = 'idle'
    }, 1500)
  } catch (err: any) {
    console.error(err)
    statusMessage.value = err.response?.data?.message || err.message || 'Registration failed'
  } finally {
    loading.value = false
  }
}

const uploadFile = async () => {
  if (!file.value || !uploadUrl.value) return

  step.value = 'uploading'
  statusMessage.value = 'Uploading model file...'
  try {
    const authStore = useAuthStore()
    await apiClient.put(uploadUrl.value, file.value, {
      headers: {
        'Content-Type': file.value.type || 'application/octet-stream',
        'Authorization': `Bearer ${authStore.token}`
      },
      transformRequest: [(data) => data]
    })

    step.value = 'done'
    statusMessage.value = 'Upload complete. Model registered successfully.'
  } catch (err: any) {
    console.error(err)
    statusMessage.value = err.response?.data?.message || err.message || 'Upload to storage failed'
    throw err
  }
}
const uploadModalOpen = ref(false)
const isPublicModel = ref(false)

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement

  const selectedFile = target.files?.[0]

  if (selectedFile) {
    file.value = selectedFile
  }
}
</script>

<template>
  <div
    class="min-h-screen pb-24 relative overflow-hidden bg-white font-urbanist selection:bg-[#ff9900]/30 selection:text-[#232f3e]">
    <!-- Subtle Grid -->
    <div
      class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none [mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)]">
    </div>

    <!-- ───── HEADER ─────────────────────────────────────────────────────── -->
    <header class="relative z-10 px-8 md:px-24 pt-20">
      <div class="max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <div
            class="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-white border border-[#ff9900]/30 text-[#ff9900] text-[10px] font-black tracking-[0.2em] uppercase">
            ML Orchestration Platform
          </div>
          <h1 class="text-5xl font-black text-[#232f3e] uppercase tracking-tighter leading-none mb-3">
            Sage<span class="text-[#ff9900]">Maker</span>
          </h1>
          <p class="text-[#545b64] text-lg font-medium italic">Schedule jobs · Provision workers · Track artifacts ·
            Monitor pipelines</p>
        </div>
        <div class="flex gap-4">
          <button @click="router.push('/docs')"
            class="px-6 py-3 bg-white border-2 border-[#232f3e] text-[#232f3e] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#232f3e] hover:text-white transition-all transform active:scale-95">
            Documentation
          </button>
          <button @click="uploadModalOpen = true"
            class="px-6 py-3 bg-[#232f3e] border-2 border-[#232f3e] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-[#232f3e] transition-all transform active:scale-95">
            Upload Base Model
          </button>
          <button @click="showCreateModal = true"
            class="px-7 py-3 bg-[#ff9900] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#ec7211] transition-all transform active:scale-95 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Project
          </button>
        </div>
      </div>
    </header>

    <!-- ───── MAIN CONTENT ───────────────────────────────────────────────── -->
    <main class="relative z-10 max-w-[1800px] mx-auto px-8 md:px-24 mt-16 space-y-12">

      <!-- Stats Row -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div v-for="stat in [
          { label: 'Total Projects', value: stats.totalProjects, accent: false },
          { label: 'Active Runs', value: stats.activeRuns, accent: true },
          { label: 'Completed', value: stats.completed, accent: false },
          { label: 'Failed', value: stats.failed, accent: false },
        ]" :key="stat.label"
          class="bg-white border-2 border-[#eaeded] p-6 relative overflow-hidden group hover:border-[#ff9900] transition-all">
          <div
            class="absolute top-0 right-0 w-16 h-16 bg-[#ff9900]/5 -rotate-45 translate-x-8 -translate-y-8 transition-transform group-hover:scale-150">
          </div>
          <p class="text-[10px] font-black text-[#879196] uppercase tracking-[0.2em] mb-2">{{ stat.label }}</p>
          <p class="text-4xl font-black" :class="stat.accent ? 'text-[#ff9900]' : 'text-[#232f3e]'">{{ stat.value }}</p>
        </div>
      </div>

      <!-- ── Two Column: Projects + Sidebar ──────────────────────────────── -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-12">

        <!-- Left: Main content tabs -->
        <section class="lg:col-span-3 space-y-10">

          <!-- Tab Navigation -->
          <div class="flex border-b-2 border-[#eaeded]">
            <button v-for="tab in [
              { id: 'projects', label: 'Projects' },
              { id: 'inventory', label: 'Model Inventory' },
              { id: 'training', label: 'Training Jobs' },
            ]" :key="tab.id" @click="activeTab = (tab.id as any)"
              class="px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 -mb-0.5"
              :class="activeTab === tab.id
                ? 'border-[#ff9900] text-[#ff9900]'
                : 'border-transparent text-[#879196] hover:text-[#232f3e]'">
              {{ tab.label }}
            </button>
          </div>

          <!-- ═══ PROJECTS TAB ═══════════════════════════════════════════ -->
          <div v-if="activeTab === 'projects'" class="space-y-8">
            <!-- Section label -->
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-[11px] font-black text-[#232f3e] uppercase tracking-[0.2em]">Recent Projects</h2>
                <p class="text-[10px] text-[#879196] mt-1 font-black uppercase tracking-widest italic">2 most recently
                  active</p>
              </div>
              <button @click="activeTab = 'projects'"
                class="text-[9px] font-black uppercase tracking-[0.2em] text-[#ff9900] hover:underline">
                View All ({{ projects.length }})
              </button>
            </div>

            <!-- Recent project cards (2) -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div v-for="project in recentProjects" :key="project.id"
                @click="router.push(`/sagemaker/projects/${project.id}`)"
                class="bg-white border-2 border-[#eaeded] p-6 group cursor-pointer hover:border-[#ff9900] transition-all relative overflow-hidden shadow-sm hover:shadow-xl">
                <div
                  class="absolute top-0 right-0 w-24 h-24 bg-[#ff9900]/5 -rotate-45 translate-x-12 -translate-y-12 transition-transform group-hover:scale-150">
                </div>

                <div class="relative z-10">
                  <!-- Status + title -->
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center gap-3">
                      <div class="w-2.5 h-2.5 rounded-full" :class="statusDot(project.status)"></div>
                      <h3
                        class="text-base font-black text-[#232f3e] uppercase tracking-tight group-hover:text-[#ff9900] transition-colors">
                        {{ project.name }}</h3>
                    </div>
                    <div
                      class="p-2 border-2 border-[#eaeded] group-hover:bg-[#ff9900] group-hover:border-[#ff9900] group-hover:text-white transition-all">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  <p class="text-sm text-[#545b64] font-medium leading-relaxed mb-5">{{ project.description }}</p>

                  <!-- Pipeline pills -->
                  <div class="flex flex-wrap gap-1.5 mb-5">
                    <span v-for="stage in project.pipeline" :key="stage"
                      class="px-2 py-0.5 text-[8px] font-black uppercase tracking-widest bg-[#fafafa] border border-[#eaeded] text-[#545b64]">
                      {{ stage }}
                    </span>
                  </div>

                  <!-- Last run + tags -->
                  <div class="flex items-center justify-between">
                    <span class="text-[9px] font-black text-[#879196] uppercase tracking-widest">Last run: {{
                      formatDate(project.lastRun) }}</span>
                    <div class="flex gap-1">
                      <!-- <span v-for="tag in project.tags.slice(0,2)" :key="tag"
                        class="px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest bg-[#ff9900]/10 text-[#ff9900]">
                        {{ tag }}
                      </span> -->
                    </div>
                  </div>
                </div>
              </div>

              <!-- Empty state -->
              <div v-if="recentProjects.length === 0"
                class="col-span-full bg-[#fafafa] p-16 border-2 border-dashed border-[#eaeded] text-center">
                <p class="text-[#879196] font-black uppercase tracking-widest text-sm mb-6">No projects yet</p>
                <button @click="showCreateModal = true"
                  class="px-8 py-4 bg-[#ff9900] hover:bg-[#ec7211] text-white text-xs font-black uppercase tracking-[0.2em] transition-all">
                  Create First Project
                </button>
              </div>
            </div>

            <!-- All projects list -->
            <div v-if="projects.length > 2" class="border-t-2 border-[#eaeded] pt-8">
              <h3 class="text-[10px] font-black text-[#232f3e] uppercase tracking-[0.2em] mb-6">All Projects</h3>
              <div class="space-y-3">
                <div v-for="project in projects" :key="project.id"
                  @click="router.push(`/sagemaker/projects/${project.id}`)"
                  class="flex items-center justify-between px-6 py-4 bg-white border-2 border-[#eaeded] hover:border-[#ff9900] cursor-pointer transition-all group">
                  <div class="flex items-center gap-4">
                    <div class="w-2 h-2 rounded-full" :class="statusDot(project.status)"></div>
                    <div>
                      <p
                        class="text-sm font-black text-[#232f3e] uppercase tracking-tight group-hover:text-[#ff9900] transition-colors">
                        {{ project.name }}</p>
                      <p class="text-[10px] text-[#879196] font-bold">{{ project.pipeline?.join(' → ') }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-6">
                    <span class="text-[9px] font-black text-[#879196] uppercase tracking-widest">{{
                      formatDate(project.lastRun) }}</span>
                    <div class="px-2 py-1 text-[8px] font-black uppercase tracking-widest"
                      :class="stageColor(project.status)">
                      {{ project.status }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ═══ MODEL INVENTORY TAB ════════════════════════════════════ -->
          <div v-if="activeTab === 'inventory'">
            <div class="flex items-center justify-between mb-8">
              <div>
                <h2 class="text-[11px] font-black text-[#232f3e] uppercase tracking-[0.2em]">Model Inventory</h2>
                <p class="text-[10px] text-[#879196] mt-1 font-black uppercase tracking-widest italic">Registered GGUF
                  models</p>
              </div>
              <button @click="router.push('/models/register')"
                class="px-6 py-3 bg-[#ff9900] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#ec7211] transition-all flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Upload GGUF
              </button>
            </div>
            <div v-if="models.length" class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div v-for="m in models" :key="m.id || m.ID" @click="router.push(`/models/${m.id || m.ID}`)"
                class="p-6 bg-white border-2 border-[#eaeded] hover:border-[#ff9900] cursor-pointer transition-all group">
                <h3
                  class="font-black text-[#232f3e] uppercase tracking-tight group-hover:text-[#ff9900] transition-colors">
                  {{ m.name || m.Name }}</h3>
                <p class="text-[10px] text-[#879196] font-bold uppercase tracking-widest mt-1">
                  {{ m.is_public ? 'Public GGUF Model' : 'GGUF Model' }}
                </p>
              </div>
            </div>
            <div v-else class="py-20 text-center bg-[#fafafa] border-2 border-dashed border-[#eaeded]">
              <p class="text-[#879196] font-black uppercase tracking-widest text-sm">No models registered</p>
            </div>
          </div>

          <!-- ═══ TRAINING JOBS TAB ══════════════════════════════════════ -->
          <div v-if="activeTab === 'training'">
            <div class="flex items-center justify-between mb-8">
              <div>
                <h2 class="text-[11px] font-black text-[#232f3e] uppercase tracking-[0.2em]">Training Jobs</h2>
                <p class="text-[10px] text-[#879196] mt-1 font-black uppercase tracking-widest italic">{{
                  trainingJobs.length }} jobs total</p>
              </div>
              <button @click="router.push('/training/new')"
                class="px-6 py-3 bg-[#232f3e] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#1a2530] transition-all">
                New Job
              </button>
            </div>
            <div v-if="trainingJobs.length" class="space-y-4">
              <div v-for="job in trainingJobs" :key="job.id" @click="router.push(`/training/jobs/${job.id}`)"
                class="px-6 py-5 bg-white border-2 border-[#eaeded] hover:border-[#ff9900] cursor-pointer transition-all group flex items-center justify-between">
                <div>
                  <h3
                    class="font-black text-[#232f3e] uppercase tracking-tight group-hover:text-[#ff9900] transition-colors">
                    {{ job.name }}</h3>
                  <div class="mt-3 w-48 bg-[#eaeded] h-1.5">
                    <div class="h-1.5 bg-[#ff9900] transition-all" :style="{ width: (job.progress ?? 0) + '%' }"></div>
                  </div>
                  <p class="text-[9px] text-[#879196] font-black uppercase tracking-widest mt-1">{{ job.progress ?? 0
                  }}% complete</p>
                </div>
                <div class="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest" :class="{
                  'bg-amber-50 text-amber-600 ring-1 ring-amber-300': job.status === 'Training',
                  'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-300': job.status === 'Completed',
                  'bg-red-50 text-red-600 ring-1 ring-red-300': job.status === 'Failed',
                  'bg-[#fafafa] text-[#879196] ring-1 ring-[#eaeded]': job.status === 'Initializing',
                }">{{ job.status }}</div>
              </div>
            </div>
            <div v-else class="py-20 text-center bg-[#fafafa] border-2 border-dashed border-[#eaeded]">
              <p class="text-[#879196] font-black uppercase tracking-widest text-sm">No training jobs yet</p>
            </div>
          </div>

          <!-- ═══ ANALYTICS GRAPH ════════════════════════════════════════ -->
          <div class="bg-white border-2 border-[#232f3e] p-10 relative overflow-hidden">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
              <div>
                <h3 class="text-[11px] font-black text-[#232f3e] uppercase tracking-[0.2em]">Pipeline Run Velocity</h3>
                <p class="text-[10px] text-[#879196] mt-2 font-black uppercase tracking-widest italic">Runs per day ·
                  last 14 days</p>
              </div>
              <div class="flex items-center gap-6">
                <div class="flex items-center gap-2">
                  <div class="w-2.5 h-2.5 bg-[#232f3e]"></div>
                  <span class="text-[9px] text-[#232f3e] uppercase font-black tracking-widest">Runs</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-2.5 h-2.5 bg-[#ff9900]"></div>
                  <span class="text-[9px] text-[#232f3e] uppercase font-black tracking-widest">Completed</span>
                </div>
              </div>
            </div>

            <div class="relative h-48">
              <!-- Y axis labels -->
              <div
                class="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[9px] text-[#879196] font-black">
                <span>{{ graphMax }}</span>
                <span>{{ Math.round(graphMax * 0.5) }}</span>
                <span>0</span>
              </div>
              <!-- Grid lines -->
              <div class="absolute left-10 right-0 top-0 bottom-8 flex flex-col justify-between pointer-events-none">
                <div class="border-t-2 border-[#eaeded]"></div>
                <div class="border-t border-[#eaeded]"></div>
                <div class="border-t-2 border-[#eaeded]"></div>
              </div>
              <!-- Bars -->
              <div class="absolute left-10 right-0 top-0 bottom-8 flex items-end gap-1.5">
                <div v-for="d in graphData" :key="d.label" class="flex-1 flex flex-col items-stretch relative group">
                  <div class="bg-[#232f3e] hover:bg-[#ff9900] transition-all cursor-crosshair"
                    :style="{ height: (d.value / graphMax * 100) + '%' }"></div>
                  <!-- Tooltip -->
                  <div
                    class="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-2 bg-[#232f3e] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 min-w-[80px] text-center">
                    <div class="text-[9px] font-black text-[#ff9900] uppercase">{{ d.label }}</div>
                    <div class="text-[9px] font-bold">{{ d.value }} runs</div>
                  </div>
                </div>
              </div>
              <!-- X axis -->
              <div class="absolute left-10 right-0 bottom-0 flex justify-between text-[9px] font-black text-[#879196]">
                <span>14d ago</span>
                <span>7d ago</span>
                <span>Today</span>
              </div>
            </div>
          </div>

        </section>

        <!-- ── Right Sidebar ─────────────────────────────────────────── -->
        <aside class="space-y-10">
          <!-- Platform health-style card -->
          <div class="bg-[#fafafa] border-2 border-[#232f3e] p-8 relative overflow-hidden group">
            <div class="absolute top-0 right-0 w-2 h-full bg-[#ff9900]"></div>
            <div class="flex items-center justify-between mb-8">
              <span class="text-[10px] font-black text-[#232f3e] uppercase tracking-[0.2em]">Pipeline Health</span>
              <span class="text-emerald-600 text-[10px] font-black tracking-widest">Nominal</span>
            </div>
            <div class="flex items-end gap-1.5 mb-6 h-12">
              <div v-for="h in [30, 60, 85, 70, 100, 90, 95, 100]" :key="h"
                class="flex-1 bg-[#232f3e]/10 group-hover:bg-[#ff9900]/20 transition-all border-b-2 border-[#232f3e]"
                :style="{ height: h + '%' }"></div>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 bg-emerald-500 ring-4 ring-emerald-500/20"></div>
              <span class="text-xs font-black text-[#232f3e] uppercase tracking-widest">Orchestrator Ready</span>
            </div>
          </div>

          <!-- Quick status list -->
          <div class="bg-white border-2 border-[#eaeded] p-0 overflow-hidden">
            <div class="px-6 py-4 border-b-2 border-[#eaeded]">
              <p class="text-[10px] font-black text-[#232f3e] uppercase tracking-[0.2em]">Infrastructure</p>
            </div>
            <div v-for="svc in [
              { name: 'Job Scheduler', status: 'Active', ok: true },
              { name: 'Worker Pool', status: 'Standby', ok: true },
              { name: 'Artifact Store (S3)', status: 'Connected', ok: true },
              { name: 'Metadata DB (RDS)', status: 'Connected', ok: true },
              { name: 'Event Bus', status: 'Active', ok: true },
            ]" :key="svc.name"
              class="flex items-center justify-between px-6 py-4 border-b border-[#eaeded] last:border-0 hover:bg-[#fafafa] transition-all">
              <span class="text-[10px] font-black text-[#545b64] uppercase tracking-widest">{{ svc.name }}</span>
              <div class="flex items-center gap-2">
                <div class="w-1.5 h-1.5 rounded-full" :class="svc.ok ? 'bg-emerald-500' : 'bg-red-500'"></div>
                <span class="text-[9px] font-black uppercase tracking-widest"
                  :class="svc.ok ? 'text-emerald-600' : 'text-red-600'">{{ svc.status }}</span>
              </div>
            </div>
            <div class="px-6 py-3 bg-[#fafafa] border-t-2 border-[#eaeded] text-center">
              <span class="text-[9px] font-black text-[#879196] uppercase tracking-widest">Control Plane Status</span>
            </div>
          </div>

          <!-- Recent activity feed -->
          <div class="bg-white border-2 border-[#eaeded] overflow-hidden">
            <div class="px-6 py-4 border-b-2 border-[#eaeded]">
              <p class="text-[10px] font-black text-[#232f3e] uppercase tracking-[0.2em]">Recent Events</p>
            </div>
            <div v-for="proj in projects.slice(0, 3)" :key="proj.id + 'ev'"
              class="px-6 py-4 border-b border-[#eaeded] last:border-0 hover:bg-[#fafafa] transition-all relative group overflow-hidden">
              <div
                class="absolute left-0 top-0 w-1 h-full bg-[#ff9900] -translate-x-full group-hover:translate-x-0 transition-all">
              </div>
              <div class="flex justify-between items-start mb-1">
                <span class="text-[10px] font-black text-[#232f3e] uppercase tracking-tight">{{ proj.name }}</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-1.5 h-1.5 rounded-full" :class="statusDot(proj.status)"></div>
                <span class="text-[9px] font-black text-[#879196] uppercase tracking-widest">{{ proj.status }}</span>
                <span class="text-[9px] text-[#879196]">· {{ formatDate(proj.lastRun) }}</span>
              </div>
            </div>
            <div class="px-6 py-3 bg-[#fafafa] border-t-2 border-[#eaeded] text-center">
              <span class="text-[9px] font-black text-[#879196] uppercase tracking-widest">Pipeline Event Log</span>
            </div>
          </div>
        </aside>

      </div>
    </main>


    <Transition name="fade">
      <div v-if="uploadModalOpen"
        class="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#232f3e]/60 backdrop-blur-md overflow-y-auto"
        @click.self="uploadModalOpen = false">

        <div class="bg-white border-2 border-[#232f3e] w-full max-w-2xl overflow-hidden shadow-2xl relative font-urbanist my-6">

          <!-- Background grid -->
          <div
            class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none opacity-50">
          </div>

          <!-- HEADER -->
          <div class="relative p-8 border-b border-[#eaeded] bg-[#fafafa] flex justify-between items-center">
            <div>
              <div class="flex items-center gap-3 mb-2">
                <div class="w-9 h-9 bg-[#ff9900] flex items-center justify-center text-white font-black">
                  AI
                </div>
                <span class="text-[9px] font-black uppercase tracking-[0.25em] text-[#879196]">
                  Base Models
                </span>
              </div>
              <h3 class="text-3xl font-black text-[#232f3e] uppercase tracking-tighter italic">
                Upload <span class="text-[#ff9900]">Base Model</span>
              </h3>
              <p class="text-[#545b64] text-xs font-bold uppercase tracking-[0.18em] mt-1">
                Register a base model file for inference or training
              </p>
            </div>

            <button @click="uploadModalOpen = false"
              class="p-3 bg-white border border-[#eaeded] hover:border-[#ff9900] text-[#232f3e] hover:text-[#ff9900] transition-all">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- FORM -->
          <div class="relative p-8 space-y-6">

            <!-- MODEL NAME -->
            <div>
              <label class="block text-[9px] font-black uppercase tracking-[0.18em] text-[#545b64] mb-1.5">
                Model Name *
              </label>
              <input v-model="name" type="text" placeholder="e.g. mistral-7b-instruct"
                class="w-full px-4 py-3 border-2 border-[#eaeded] text-sm text-[#232f3e] font-medium focus:outline-none focus:border-[#ff9900] transition-colors" />
            </div>

            <!-- FILE UPLOAD -->
            <div>
              <label class="block text-[9px] font-black uppercase tracking-[0.18em] text-[#545b64] mb-1.5">
                Select Model File *
              </label>
              <div class="p-6 border-2 border-dashed border-[#eaeded] bg-[#fafafa] hover:border-[#ff9900] transition-colors">
                <input type="file" accept=".gguf,.bin,.safetensors" @change="handleFileChange" class="hidden" id="baseModelFileInput" />
                <label for="baseModelFileInput" class="cursor-pointer block text-center">
                  <div class="text-2xl mb-2 text-[#ff9900]">+</div>
                  <div class="text-xs font-black uppercase tracking-wider text-[#232f3e]">
                    {{ file ? file.name : 'Click to select model file' }}
                  </div>
                  <div class="text-[10px] text-[#879196] mt-1">
                    {{ file ? formatFileSize(file.size) : 'Supports GGUF, bin, or safetensors formats' }}
                  </div>
                </label>
              </div>
            </div>

            <!-- IS PUBLIC CHECKBOX -->
            <div class="flex items-center gap-3 p-4 bg-[#fafafa] border border-[#eaeded]">
              <input id="isPublicModel" v-model="isPublicModel" type="checkbox"
                class="w-5 h-5 accent-[#ff9900] cursor-pointer" />
              <label for="isPublicModel" class="text-xs font-bold text-[#232f3e] cursor-pointer select-none">
                Make model public
              </label>
            </div>

            <!-- STATUS & ERRORS -->
            <div v-if="statusMessage" class="p-4 bg-[#fffaf2] border-2 border-[#ff9900] flex items-center gap-3">
              <svg v-if="loading" class="w-4 h-4 animate-spin text-[#ff9900]" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <div class="text-xs font-black uppercase tracking-wider text-[#232f3e]">
                {{ statusMessage }}
              </div>
            </div>

            <!-- ACTIONS -->
            <div class="flex justify-between items-center pt-4 border-t border-[#eaeded]">
              <button @click="uploadModalOpen = false" :disabled="loading"
                class="px-6 py-3 border-2 border-[#eaeded] text-[#545b64] text-[10px] font-black uppercase tracking-[0.2em] hover:border-[#232f3e] hover:text-[#232f3e] transition-all disabled:opacity-50">
                Cancel
              </button>

              <button @click="registerModel" :disabled="!name || !file || loading"
                class="px-8 py-3 bg-[#ff9900] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#232f3e] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
                <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                {{ loading ? (step === 'registering' ? 'Registering...' : 'Uploading...') : 'Upload Base Model →' }}
              </button>
            </div>

          </div>

        </div>
      </div>
    </Transition>
    <!--   ═══ CREATE PROJECT MODAL ═══════════════════════════════════════════
 ═══════════════════════════════════════════════════════════════════════
     CREATE LLM PROJECT MODAL
═══════════════════════════════════════════════════════════════════════ -->
    <Transition name="fade">
      <div v-if="showCreateModal"
        class="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#232f3e]/60 backdrop-blur-md overflow-y-auto"
        @click.self="showCreateModal = false">

        <div
          class="bg-white border-2 border-[#232f3e] w-full max-w-4xl overflow-hidden shadow-2xl relative font-urbanist my-6">

          <!-- Background grid -->
          <div
            class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none opacity-50">
          </div>


          <!-- ═══════════════════════════════════════════════════════════════
           HEADER
      ═══════════════════════════════════════════════════════════════ -->

          <div class="relative p-8 border-b border-[#eaeded] bg-[#fafafa] flex justify-between items-center">

            <div>
              <div class="flex items-center gap-3 mb-2">

                <div class="w-9 h-9 bg-[#ff9900] flex items-center justify-center text-white font-black">
                  AI
                </div>

                <span class="text-[9px] font-black uppercase tracking-[0.25em] text-[#879196]">
                  Machine Learning
                </span>

              </div>

              <h3 class="text-3xl font-black text-[#232f3e] uppercase tracking-tighter italic">
                New <span class="text-[#ff9900]">LLM Project</span>
              </h3>

              <p class="text-[#545b64] text-xs font-bold uppercase tracking-[0.18em] mt-1">
                Configure your language model workflow
              </p>
            </div>


            <button @click="showCreateModal = false"
              class="p-3 bg-white border border-[#eaeded] hover:border-[#ff9900] text-[#232f3e] hover:text-[#ff9900] transition-all">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

          </div>


          <!-- ═══════════════════════════════════════════════════════════════
           FORM
      ═══════════════════════════════════════════════════════════════ -->

          <div class="relative p-8 space-y-8">


            <!-- ═════════════════════════════════════════════════════════════
             01 — PROJECT
        ═════════════════════════════════════════════════════════════ -->

            <section>

              <div class="flex items-center gap-3 mb-5">

                <div class="w-8 h-8 bg-[#232f3e] text-white flex items-center justify-center text-xs font-black">
                  01
                </div>

                <div>
                  <h4 class="text-sm font-black uppercase tracking-[0.15em] text-[#232f3e]">
                    Project
                  </h4>

                  <p class="text-[10px] text-[#879196] font-bold">
                    Basic project information
                  </p>
                </div>

              </div>


              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

                <!-- Name -->
                <div>
                  <label class="block text-[9px] font-black uppercase tracking-[0.18em] text-[#545b64] mb-1.5">
                    Project Name *
                  </label>

                  <input v-model="newProject.name" type="text" placeholder="e.g. Hospital Assistant"
                    class="w-full px-4 py-3 border-2 border-[#eaeded] text-sm text-[#232f3e] font-medium focus:outline-none focus:border-[#ff9900] transition-colors" />
                </div>


                <!-- Description -->
                <div>
                  <label class="block text-[9px] font-black uppercase tracking-[0.18em] text-[#545b64] mb-1.5">
                    Description
                  </label>

                  <input v-model="newProject.description" type="text" placeholder="What is this model for?"
                    class="w-full px-4 py-3 border-2 border-[#eaeded] text-sm text-[#232f3e] font-medium focus:outline-none focus:border-[#ff9900] transition-colors" />
                </div>

              </div>

            </section>



            <!-- ═════════════════════════════════════════════════════════════
             02 — PROJECT TYPE
        ═════════════════════════════════════════════════════════════ -->

            <section>

              <div class="flex items-center gap-3 mb-5">

                <div class="w-8 h-8 bg-[#232f3e] text-white flex items-center justify-center text-xs font-black">
                  02
                </div>

                <div>
                  <h4 class="text-sm font-black uppercase tracking-[0.15em] text-[#232f3e]">
                    Project Type
                  </h4>

                  <p class="text-[10px] text-[#879196] font-bold">
                    Select the type of machine learning project
                  </p>
                </div>

              </div>


              <!-- LLM option -->
              <label class="block cursor-pointer">

                <input type="checkbox" v-model="newProject.type" true-value="llm" false-value="" class="hidden" />

                <div class="border-2 p-5 transition-all" :class="newProject.type === 'llm'
                  ? 'border-[#ff9900] bg-[#fffaf2]'
                  : 'border-[#eaeded] hover:border-[#ff9900]'">

                  <div class="flex items-center justify-between">

                    <div class="flex items-center gap-4">

                      <div class="w-12 h-12 bg-[#232f3e] text-white flex items-center justify-center font-black">
                        AI
                      </div>

                      <div>

                        <div class="text-sm font-black uppercase tracking-[0.15em] text-[#232f3e]">
                          Large Language Model
                        </div>

                        <div class="text-xs text-[#879196] font-medium mt-1">
                          Train or fine-tune a language model
                        </div>

                      </div>

                    </div>


                    <div class="w-6 h-6 border-2 flex items-center justify-center" :class="newProject.type === 'llm'
                      ? 'border-[#ff9900] bg-[#ff9900]'
                      : 'border-[#eaeded]'">

                      <svg v-if="newProject.type === 'llm'" class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                      </svg>

                    </div>

                  </div>

                </div>

              </label>

            </section>



            <!-- ═════════════════════════════════════════════════════════════
             03 — BASE MODEL
        ═════════════════════════════════════════════════════════════ -->

            <section v-if="newProject.type === 'llm'">

              <div class="flex items-center gap-3 mb-5">

                <div class="w-8 h-8 bg-[#232f3e] text-white flex items-center justify-center text-xs font-black">
                  03
                </div>

                <div>
                  <h4 class="text-sm font-black uppercase tracking-[0.15em] text-[#232f3e]">
                    Base Model
                  </h4>

                  <p class="text-[10px] text-[#879196] font-bold">
                    Choose the model you want to train
                  </p>
                </div>

              </div>


              <select v-model="newProject.baseModel"
                class="w-full px-4 py-3 border-2 border-[#eaeded] text-sm font-bold text-[#232f3e] focus:outline-none focus:border-[#ff9900]">

                <option value="">
                  Select a base model
                </option>

                <option v-for="m in models" :key="m.id || m.ID" :value="m.id || m.ID">
                  {{ m.name || m.Name }} {{ m.is_public ? '(Public)' : '' }}
                </option>

              </select>


              <div class="mt-3 p-4 bg-[#fafafa] border border-[#eaeded] text-[10px] text-[#879196] font-medium">
                The base model provides the starting weights for your LLM.
              </div>

            </section>



            <!-- ═════════════════════════════════════════════════════════════
             04 — TRAINING DATA
        ═════════════════════════════════════════════════════════════ -->

            <section v-if="newProject.type === 'llm'">

              <div class="flex items-center gap-3 mb-5">

                <div class="w-8 h-8 bg-[#232f3e] text-white flex items-center justify-center text-xs font-black">
                  04
                </div>

                <div>
                  <h4 class="text-sm font-black uppercase tracking-[0.15em] text-[#232f3e]">
                    Training Data
                  </h4>

                  <p class="text-[10px] text-[#879196] font-bold">
                    Tell Serwin where your training data comes from
                  </p>
                </div>

              </div>


              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">


                <!-- Upload -->
                <label class="border-2 p-5 cursor-pointer transition-all" :class="newProject.trainingDataSource === 'upload'
                  ? 'border-[#ff9900] bg-[#fffaf2]'
                  : 'border-[#eaeded] hover:border-[#ff9900]'">

                  <input type="radio" value="upload" v-model="newProject.trainingDataSource" class="hidden" />

                  <div class="text-2xl mb-3">↑</div>

                  <div class="text-xs font-black uppercase tracking-wider text-[#232f3e]">
                    Upload Files
                  </div>

                  <div class="text-[10px] text-[#879196] mt-1">
                    Upload one or multiple datasets
                  </div>

                </label>


                <!-- URL -->
                <label class="border-2 p-5 cursor-pointer transition-all" :class="newProject.trainingDataSource === 'url'
                  ? 'border-[#ff9900] bg-[#fffaf2]'
                  : 'border-[#eaeded] hover:border-[#ff9900]'">

                  <input type="radio" value="url" v-model="newProject.trainingDataSource" class="hidden" />

                  <div class="text-2xl mb-3">↗</div>

                  <div class="text-xs font-black uppercase tracking-wider text-[#232f3e]">
                    Dataset URL
                  </div>

                  <div class="text-[10px] text-[#879196] mt-1">
                    Download data from a URL
                  </div>

                </label>


                <!-- S3 -->
                <label class="border-2 p-5 cursor-pointer transition-all" :class="newProject.trainingDataSource === 's3'
                  ? 'border-[#ff9900] bg-[#fffaf2]'
                  : 'border-[#eaeded] hover:border-[#ff9900]'">

                  <input type="radio" value="s3" v-model="newProject.trainingDataSource" class="hidden" />

                  <div class="text-2xl mb-3">☁</div>

                  <div class="text-xs font-black uppercase tracking-wider text-[#232f3e]">
                    Serwin S3
                  </div>

                  <div class="text-[10px] text-[#879196] mt-1">
                    Use data already stored in Serwin
                  </div>

                </label>

              </div>


              <!-- Upload configuration -->
              <div v-if="newProject.trainingDataSource === 'upload'"
                class="mt-4 p-5 border-2 border-dashed border-[#eaeded] bg-[#fafafa]">

                <label class="block cursor-pointer text-center">

                  <input type="file" multiple class="hidden" @change="handleTrainingDataUpload" />

                  <div class="text-2xl mb-2">
                    +
                  </div>

                  <div class="text-xs font-black uppercase tracking-wider text-[#232f3e]">
                    Add Training Files
                  </div>

                  <div class="text-[10px] text-[#879196] mt-1">
                    JSONL, JSON, TXT, CSV or ZIP
                  </div>

                </label>

              </div>


              <!-- URL configuration -->
              <div v-if="newProject.trainingDataSource === 'url'" class="mt-4">

                <input v-model="newProject.trainingDataUrl" type="url" placeholder="https://example.com/dataset.zip"
                  class="w-full px-4 py-3 border-2 border-[#eaeded] text-sm font-medium focus:outline-none focus:border-[#ff9900]" />

              </div>


              <!-- S3 configuration -->
              <div v-if="newProject.trainingDataSource === 's3'" class="mt-4">

                <input v-model="newProject.trainingDataBucket" type="text" placeholder="serwin-my-dataset"
                  class="w-full px-4 py-3 border-2 border-[#eaeded] text-sm font-medium focus:outline-none focus:border-[#ff9900]" />

              </div>


              <!-- Selected files -->
              <div v-if="newProject.trainingFiles?.length" class="mt-4 space-y-2">
                <div v-for="(file, index) in newProject.trainingFiles" :key="file.name + index"
                  class="flex items-center justify-between p-3 border border-[#eaeded] bg-white group hover:border-[#ff9900] transition-colors">
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="text-xs font-black text-[#ff9900]">DAT</span>
                    <span class="text-xs font-bold text-[#232f3e] truncate">{{ file.name }}</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-[9px] font-black uppercase text-[#879196]">
                      {{ formatFileSize(file.size) }}
                    </span>
                    <button type="button" @click="removeTrainingFile(index)"
                      class="text-[#879196] hover:text-red-500 font-black text-xs px-1" title="Remove file">
                      ✕
                    </button>
                  </div>
                </div>
              </div>

            </section>



            <!-- ═════════════════════════════════════════════════════════════
             05 — VALIDATION DATA
        ═════════════════════════════════════════════════════════════ -->

            <section v-if="newProject.type === 'llm'">

              <div class="flex items-center gap-3 mb-5">

                <div class="w-8 h-8 bg-[#232f3e] text-white flex items-center justify-center text-xs font-black">
                  05
                </div>

                <div>
                  <h4 class="text-sm font-black uppercase tracking-[0.15em] text-[#232f3e]">
                    Validation Data
                  </h4>

                  <p class="text-[10px] text-[#879196] font-bold">
                    Optional data used to evaluate the model
                  </p>
                </div>

              </div>


              <div class="flex items-center gap-3">

                <input id="useValidationData" type="checkbox" v-model="newProject.useValidationData"
                  class="w-4 h-4 accent-[#ff9900]" />

                <label for="useValidationData" class="text-xs font-bold text-[#232f3e] cursor-pointer">
                  I have separate validation data
                </label>

              </div>


              <div v-if="newProject.useValidationData" class="mt-4 space-y-3">

                <input type="file" multiple @change="handleValidationDataUpload"
                  class="w-full text-xs file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-black file:uppercase file:bg-[#232f3e] file:text-white hover:file:bg-[#ff9900] file:cursor-pointer transition-colors" />

                <!-- Selected validation files -->
                <div v-if="newProject.validationFiles?.length" class="space-y-2 mt-3">
                  <div v-for="(vfile, vidx) in newProject.validationFiles" :key="vfile.name + vidx"
                    class="flex items-center justify-between p-3 border border-[#eaeded] bg-white group hover:border-[#ff9900] transition-colors">
                    <div class="flex items-center gap-2 min-w-0">
                      <span class="text-xs font-black text-emerald-600">VAL</span>
                      <span class="text-xs font-bold text-[#232f3e] truncate">{{ vfile.name }}</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <span class="text-[9px] font-black uppercase text-[#879196]">
                        {{ formatFileSize(vfile.size) }}
                      </span>
                      <button type="button" @click="removeValidationFile(vidx)"
                        class="text-[#879196] hover:text-red-500 font-black text-xs px-1" title="Remove file">
                        ✕
                      </button>
                    </div>
                  </div>
                </div>

              </div>

            </section>



            <!-- ═════════════════════════════════════════════════════════════
             06 — TRAINING CODE
        ═════════════════════════════════════════════════════════════ -->

            <section v-if="newProject.type === 'llm'">

              <div class="flex items-center gap-3 mb-5">

                <div class="w-8 h-8 bg-[#232f3e] text-white flex items-center justify-center text-xs font-black">
                  06
                </div>

                <div>
                  <h4 class="text-sm font-black uppercase tracking-[0.15em] text-[#232f3e]">
                    Training Code
                  </h4>

                  <p class="text-[10px] text-[#879196] font-bold">
                    Choose who controls the training process
                  </p>
                </div>

              </div>


              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">


                <!-- Serwin -->
                <label class="border-2 p-5 cursor-pointer" :class="newProject.trainingMode === 'serwin'
                  ? 'border-[#ff9900] bg-[#fffaf2]'
                  : 'border-[#eaeded]'">

                  <input type="radio" value="serwin" v-model="newProject.trainingMode" class="hidden" />

                  <div class="text-xs font-black uppercase tracking-wider text-[#232f3e]">
                    Serwin Training
                  </div>

                  <p class="text-[10px] text-[#879196] mt-2 leading-relaxed">
                    Serwin manages preprocessing, training and evaluation.
                  </p>

                </label>


                <!-- Custom -->
                <label class="border-2 p-5 cursor-pointer" :class="newProject.trainingMode === 'custom'
                  ? 'border-[#ff9900] bg-[#fffaf2]'
                  : 'border-[#eaeded]'">

                  <input type="radio" value="custom" v-model="newProject.trainingMode" class="hidden" />

                  <div class="text-xs font-black uppercase tracking-wider text-[#232f3e]">
                    My Training Code
                  </div>

                  <p class="text-[10px] text-[#879196] mt-2 leading-relaxed">
                    Upload your own training project and Serwin provides the compute.
                  </p>

                </label>

              </div>


              <!-- Custom code -->
              <div v-if="newProject.trainingMode === 'custom'" class="mt-4 space-y-4">

                <input type="file" accept=".zip" @change="handleTrainingCodeUpload" class="w-full text-xs" />

                <div>

                  <label class="block text-[9px] font-black uppercase tracking-[0.18em] text-[#545b64] mb-1.5">
                    Entry Point
                  </label>

                  <input v-model="newProject.entryPoint" type="text" placeholder="train.py"
                    class="w-full px-4 py-3 border-2 border-[#eaeded] text-sm font-medium focus:outline-none focus:border-[#ff9900]" />

                </div>

              </div>

            </section>
            <section>

              <!-- Custom code -->
               <div>
                  <label class="block text-[9px] font-black uppercase tracking-[0.18em] text-[#545b64] mb-1.5">
                    Callback url
                  </label>

                  <input v-model="newProject.callback" type="text" placeholder="e.g. Hospital Assistant"
                    class="w-full px-4 py-3 border-2 border-[#eaeded] text-sm text-[#232f3e] font-medium focus:outline-none focus:border-[#ff9900] transition-colors" />
                </div>

            </section>



            <!-- ═════════════════════════════════════════════════════════════
             07 — COMPUTE
        ═════════════════════════════════════════════════════════════ -->

            <section v-if="newProject.type === 'llm'">

              <div class="flex items-center gap-3 mb-5">

                <div class="w-8 h-8 bg-[#232f3e] text-white flex items-center justify-center text-xs font-black">
                  07
                </div>

                <div>
                  <h4 class="text-sm font-black uppercase tracking-[0.15em] text-[#232f3e]">
                    Compute
                  </h4>

                  <p class="text-[10px] text-[#879196] font-bold">
                    Choose the machine used for training
                  </p>
                </div>

              </div>


              <select v-model="newProject.compute"
                class="w-full px-4 py-3 border-2 border-[#eaeded] text-sm font-bold text-[#232f3e] focus:outline-none focus:border-[#ff9900]">

                <option value="">
                  Select compute
                </option>

                <option value="gpu-small">
                  GPU Small — 8 GB VRAM
                </option>

                <option value="gpu-medium">
                  GPU Medium — 16 GB VRAM
                </option>

                <option value="gpu-large">
                  GPU Large — 24 GB VRAM
                </option>

              </select>

            </section>



            <!-- ═════════════════════════════════════════════════════════════
             08 — TRAINING SCHEDULE
        ═════════════════════════════════════════════════════════════ -->

            <section v-if="newProject.type === 'llm'">

              <div class="flex items-center gap-3 mb-5">

                <div class="w-8 h-8 bg-[#232f3e] text-white flex items-center justify-center text-xs font-black">
                  08
                </div>

                <div>
                  <h4 class="text-sm font-black uppercase tracking-[0.15em] text-[#232f3e]">
                    Training Schedule
                  </h4>

                  <p class="text-[10px] text-[#879196] font-bold">
                    Decide when the model should be trained
                  </p>
                </div>

              </div>


              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">


                <label class="border-2 p-5 cursor-pointer" :class="newProject.schedule === 'manual'
                  ? 'border-[#ff9900] bg-[#fffaf2]'
                  : 'border-[#eaeded]'">

                  <input type="radio" value="manual" v-model="newProject.schedule" class="hidden" />

                  <div class="text-xs font-black uppercase tracking-wider text-[#232f3e]">
                    Run Manually
                  </div>

                  <p class="text-[10px] text-[#879196] mt-2">
                    Start training whenever you choose.
                  </p>

                </label>


                <label class="border-2 p-5 cursor-pointer" :class="newProject.schedule === 'daily'
                  ? 'border-[#ff9900] bg-[#fffaf2]'
                  : 'border-[#eaeded]'">

                  <input type="radio" value="daily" v-model="newProject.schedule" class="hidden" />

                  <div class="text-xs font-black uppercase tracking-wider text-[#232f3e]">
                    Every 24 Hours
                  </div>

                  <p class="text-[10px] text-[#879196] mt-2">
                    Automatically train when new data is available.
                  </p>

                </label>

              </div>

            </section>



            <!-- ═════════════════════════════════════════════════════════════
             SUMMARY
        ═════════════════════════════════════════════════════════════ -->

            <div class="border-2 border-[#232f3e] bg-[#fafafa] p-6">

              <div class="text-[9px] font-black uppercase tracking-[0.2em] text-[#879196] mb-4">
                Project Summary
              </div>


              <div class="grid grid-cols-2 md:grid-cols-4 gap-5">

                <div>
                  <div class="text-[9px] uppercase font-black text-[#879196]">
                    Type
                  </div>

                  <div class="text-xs font-black text-[#232f3e] mt-1">
                    LLM
                  </div>
                </div>


                <div>
                  <div class="text-[9px] uppercase font-black text-[#879196]">
                    Base Model
                  </div>

                  <div class="text-xs font-black text-[#232f3e] mt-1">
                    {{ newProject.baseModel || 'Not selected' }}
                  </div>
                </div>


                <div>
                  <div class="text-[9px] uppercase font-black text-[#879196]">
                    Training
                  </div>

                  <div class="text-xs font-black text-[#232f3e] mt-1">
                    {{ newProject.trainingMode === 'custom'
                      ? 'Custom Code'
                      : 'Serwin' }}
                  </div>
                </div>


                <div>
                  <div class="text-[9px] uppercase font-black text-[#879196]">
                    Schedule
                  </div>

                  <div class="text-xs font-black text-[#232f3e] mt-1">
                    {{ newProject.schedule === 'daily'
                      ? 'Every 24 Hours'
                      : 'Manual' }}
                  </div>
                </div>

              </div>

            </div>


            <!-- ═════════════════════════════════════════════════════════════
             STATUS & ERRORS
        ═════════════════════════════════════════════════════════════ -->

            <div v-if="creationStep" class="p-4 bg-[#fffaf2] border-2 border-[#ff9900] flex items-center gap-3">
              <svg v-if="isCreating" class="w-4 h-4 animate-spin text-[#ff9900]" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <div class="text-xs font-black uppercase tracking-wider text-[#232f3e]">
                {{ creationStep }}
              </div>
            </div>

            <div v-if="creationError"
              class="p-4 bg-red-50 border-2 border-red-500 text-red-700 flex items-center justify-between text-xs font-bold">
              <div>{{ creationError }}</div>
              <button @click="creationError = null" class="text-red-500 font-black">✕</button>
            </div>

            <!-- ═════════════════════════════════════════════════════════════
             ACTIONS
        ═════════════════════════════════════════════════════════════ -->

            <div class="flex justify-between items-center pt-2">

              <button @click="showCreateModal = false" :disabled="isCreating"
                class="px-6 py-3 border-2 border-[#eaeded] text-[#545b64] text-[10px] font-black uppercase tracking-[0.2em] hover:border-[#232f3e] hover:text-[#232f3e] transition-all disabled:opacity-50">
                Cancel
              </button>


              <button @click="createProject" :disabled="!newProject.name || !newProject.type || isCreating"
                class="px-8 py-3 bg-[#ff9900] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#232f3e] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
                <svg v-if="isCreating" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                {{ isCreating ? 'Creating & Uploading...' : 'Create LLM Project →' }}
              </button>

            </div>

          </div>

        </div>

      </div>
    </Transition>

  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>