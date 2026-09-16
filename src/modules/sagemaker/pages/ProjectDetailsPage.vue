<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '@/shared/api/apiClient'
import VMProvisioningStatus from '@/components/VMProvisioningStatus.vue'
import { useAuthStore } from '@/modules/auth/store/authStore'
import { useToastStore } from '@/shared/store/toastStore'


const authStore = useAuthStore()
const toastStore = useToastStore()

  const token = authStore.token
const route = useRoute()
const router = useRouter()
const projectId = route.params.id as string

// ─── Interfaces ─────────────────────────────────────────────────────────────
interface PipelineScript {
  id: string
  name: string
  path: string
  routeTo?: string
}

interface PipelineNode {
  id: string
  type: 'ingest' | 'clean' | 'train' | 'evaluate' | 'deploy' | 'custom' | 'gate'
  label?: string
  x: number
  y: number
  scripts: PipelineScript[]
  schedule?: string
  cascade?: boolean
  destBucket?: string
  status?: 'pending' | 'running' | 'completed' | 'failed'
  started_at?: string
  finished_at?: string
  vm?: string
  vmMode?: string
}

interface PipelineEdge {
  id: string
  fromNodeId: string
  toNodeId: string
}

interface StageRun {
  name: string
  status: 'completed' | 'running' | 'failed' | 'pending'
  duration?: string
}

interface PipelineRun {
  id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  startedAt: string
  finishedAt?: string
  stages?: StageRun[]
  metrics?: { loss?: number; accuracy?: number; epoch?: number }
}

interface ProjectFile {
  id: string
  name: string
  type: string
  role: 'training' | 'validation' | 'code' | 'artifact'
  size: number
  path: string
  uploadedAt: string
}

interface DeployedEndpoint {
  id: string
  name: string
  modelName: string
  status: 'InService' | 'Creating' | 'Failed' | 'Updating'
  endpointUrl: string
  latencyMs: number
  invocations: number
  createdAt: string
}

interface SageMakerProject {
  id: string
  name: string
  description: string
  api_key: string
  entry_point: string
  callback: string
  type?: string
  bucket_name?:string
  bucket_id?:string
  baseModel?: string
  trainingDataSource?: string
  trainingDataUrl?: string
  trainingDataBucket?: string
  useValidationData?: boolean
  trainingMode?: string
  entryPoint?: string
  compute?: string
  schedule?: string
  pipeline: string[]
  tags: string[]
  createdAt: string
  lastRun?: string
  status: 'idle' | 'running' | 'completed' | 'failed'
  runs: PipelineRun[]
  nodes?: PipelineNode[]
  edges?: PipelineEdge[]
  datasources: { name: string; type: string; path: string }[]
  files?: ProjectFile[]
  endpoints?: DeployedEndpoint[]
}

interface LogEntry {
  ts: string
  level: 'info' | 'warn' | 'error' | 'debug'
  msg: string
}

// ─── State ───────────────────────────────────────────────────────────────────
const loading = ref(true)
const error = ref<string | null>(null)
const project = ref<SageMakerProject | null>(null)
const activeTab = ref<'overview' | 'canvas' | 'files' | 'runs' | 'endpoints' | 'settings'>('overview')

// Live simulation & websocket state
const isRunningPipeline = ref(false)
const pipelineRunning = ref(false)
const pipelineProgress = ref(0)
const currentRunningStage = ref<string | null>(null)
const logEntries = ref<LogEntry[]>([])
const activeSessionId = ref<string | null>(null)
const showProvisioningStatus = ref(false)

// WebSocket / live-run state
const currentRunId = ref<string | null>(null)
const websocketUrl = ref<string | null>(null)
const pipelineSocket = ref<WebSocket | null>(null)
const stopReconnecting = ref(false)
let reconnectTimer: number | null = null

// Modals
const showUploadModal = ref(false)
const showDeployModal = ref(false)
const showDeleteConfirm = ref(false)

// Inference Playground State
const testPrompt = ref('Explain the main advantages of fine-tuning a small LLM for specialized domain tasks.')
const inferencing = ref(false)
const inferenceResult = ref('')
const modelTemperature = ref(0.7)
const modelMaxTokens = ref(256)

// Default nodes fallback
const buildDefaultNodes = (p: SageMakerProject): PipelineNode[] => {
  const legacy: string[] = p.pipeline ?? ['ingest', 'clean', 'train', 'evaluate', 'deploy']
  return legacy.map((type, i) => ({
    id: `node-${i}`,
    type: type as PipelineNode['type'],
    x: 60 + i * 210,
    y: 120,
    scripts: [
      { id: `script-${i}-1`, name: `${type}_step.py`, path: `s3://${p.name.toLowerCase()}/scripts/${type}.py` }
    ],
    vm: 'gpu-worker-01',
    vmMode: 'dedicated',
    destBucket: `s3://sagemaker-${p.id}/${type}/`,
    status: i === 0 ? 'completed' : i === 1 ? 'completed' : i === 2 ? 'running' : 'pending'
  }))
}

const buildDefaultEdges = (ns: PipelineNode[]): PipelineEdge[] => {
  if (!ns || ns.length < 2) return []
  return ns.slice(0, -1).map((n, i) => ({ id: `edge-${i}`, fromNodeId: n.id, toNodeId: ns[i + 1].id }))
}

const buildSeedFiles = (): ProjectFile[] => [
  {
    id: 'f-1',
    name: 'domain_train_dataset.jsonl',
    type: 'JSONL',
    role: 'training',
    size: 48500000,
    path: `s3://sagemaker-${projectId}/datasets/train.jsonl`,
    uploadedAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'f-2',
    name: 'domain_val_dataset.jsonl',
    type: 'JSONL',
    role: 'validation',
    size: 5200000,
    path: `s3://sagemaker-${projectId}/datasets/val.jsonl`,
    uploadedAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'f-3',
    name: 'train_entrypoint.py',
    type: 'Python',
    role: 'code',
    size: 14200,
    path: `s3://sagemaker-${projectId}/code/train_entrypoint.py`,
    uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'f-4',
    name: 'checkpoint-epoch-05.bin',
    type: 'Model Weights',
    role: 'artifact',
    size: 2150000000,
    path: `s3://sagemaker-${projectId}/artifacts/checkpoint-epoch-05.bin`,
    uploadedAt: new Date(Date.now() - 3600000 * 5).toISOString()
  }
]

const buildSeedEndpoints = (): DeployedEndpoint[] => [
  {
    id: 'ep-001',
    name: `${project.value?.name.toLowerCase().replace(/\s+/g, '-') || 'llm'}-live-endpoint`,
    modelName: project.value?.baseModel || 'Serwin Small 1B',
    status: 'InService',
    endpointUrl: `https://inference.serwin.ai/v1/projects/${projectId}/predict`,
    latencyMs: 38,
    invocations: 1420,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
]

// ─── Load Project Data ───────────────────────────────────────────────────────
const loadProject = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await apiClient.get(`/llm/training/jobs/${projectId}`)
    const data = res.data?.data || res.data

    if (data) {
      if (!data.nodes || data.nodes.length === 0) data.nodes = buildDefaultNodes(data)
      if (!data.edges || data.edges.length === 0) data.edges = buildDefaultEdges(data.nodes)
      if (!data.files || data.files.length === 0) data.files = buildSeedFiles()
      if (!data.endpoints || data.endpoints.length === 0) data.endpoints = buildSeedEndpoints()
      if (!data.runs) data.runs = []
      project.value = data
    } else {
      createFallbackProject()
    }
  } catch (e: any) {
    console.warn('API load failed, using local model fallback', e)
    createFallbackProject()
  } finally {
    loading.value = false
    initLogs()
  }
}

const createFallbackProject = () => {
  project.value = {
    id: projectId,
    name: 'Serwin Financial LLM Assistant',
    description: 'Fine-tuned 1B parameters model for automated contract parsing and financial compliance auditing.',
    type: 'llm',
    baseModel: 'Serwin Small 1B',
    trainingDataSource: 'upload',
    trainingMode: 'serwin',
    compute: 'gpu-medium',
    schedule: 'manual',
    pipeline: ['ingest', 'clean', 'train', 'evaluate', 'deploy'],
    tags: ['llm', 'fine-tuning', 'finance', 'compliance'],
    createdAt: '2026-08-28T14:30:00Z',
    lastRun: '2026-08-30T05:15:00Z',
    status: 'running',
    runs: [
      {
        id: 'run-9042',
        status: 'completed',
        startedAt: '2026-08-29T10:00:00Z',
        finishedAt: '2026-08-29T11:45:00Z',
        metrics: { loss: 0.142, accuracy: 96.4, epoch: 10 },
        stages: [
          { name: 'ingest', status: 'completed', duration: '11m' },
          { name: 'clean', status: 'completed', duration: '7m' },
          { name: 'train', status: 'completed', duration: '82m' },
          { name: 'evaluate', status: 'completed', duration: '4m' },
          { name: 'deploy', status: 'completed', duration: '1m' }
        ]
      },
      {
        id: 'run-9043',
        status: 'running',
        startedAt: '2026-08-30T05:15:00Z',
        metrics: { loss: 0.285, accuracy: 91.2, epoch: 4 },
        stages: [
          { name: 'ingest', status: 'completed', duration: '9m' },
          { name: 'clean', status: 'completed', duration: '6m' },
          { name: 'train', status: 'running', duration: '45m' },
          { name: 'evaluate', status: 'pending' },
          { name: 'deploy', status: 'pending' }
        ]
      }
    ],
    datasources: [
      { name: 'financial_corpus_2026.jsonl', type: 'JSONL', path: `s3://sagemaker-${projectId}/raw/corpus/` }
    ],
    files: buildSeedFiles(),
    endpoints: buildSeedEndpoints()
  }
  project.value.nodes = buildDefaultNodes(project.value)
  project.value.edges = buildDefaultEdges(project.value.nodes)
}

const updateProject = async () => {
  if (!project.value) return
  try {
    await apiClient.put(`/llm/training/jobs/${project.value.id}`, project.value)
  } catch (e) {
      toastStore.addToast("Failed to save project state", "error")

    console.error('Failed to save project state', e)
  }
}


const runProject = async () => {
  if (!project.value) return null
  try {
    const res = await apiClient.get(`/llm/training/jobs/${project.value.id}/run`, project.value)
    const data = res.data?.data || res.data

    const runId = data?.run_id || data?.id
    const wsUrl =  data?.ws_url 

    if (runId) currentRunId.value = runId
    if (wsUrl) websocketUrl.value = wsUrl

    if (wsUrl && runId) {
      // establish websocket
      connectPipelineWebSocket(wsUrl, runId)
    }

    return data
  } catch (e) {
    console.error('Failed to start pipeline run', e)
    return null
  } finally {
    updateProject()
  }
}

// --- WebSocket helpers ---
const logContainer = ref<HTMLElement | null>(null)

const formatEventMessage = (evt: any) => {
  

  const lines: string[] = []
  if (evt.step) lines.push(evt.step.toUpperCase())
  if (evt.message) lines.push(evt.message)
  if (evt.metadata && typeof evt.metadata === 'object') {
    for (const k of Object.keys(evt.metadata)) {
      lines.push(`${capitalize(k)}: ${evt.metadata[k]}`)
    }
  }
  return lines.join('\n')
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const handleSocketMessage = (ev: MessageEvent) => {


  try {

    const payload = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data
    if (!payload) return



    // Ignore events for other runs
    if (payload.run_id && currentRunId.value && payload.run_id !== currentRunId.value) return

    const msg = formatEventMessage(payload)
     
    addLog('info**', msg || JSON.stringify(payload))
  } catch (e) {
    console.warn('Failed to parse socket message', e)
    addLog('debug', String(ev.data))
  }
}

const connectPipelineWebSocket = (url: string, runId: string) => {
  // prevent multiple sockets
  if (pipelineSocket.value) {
    try { pipelineSocket.value.close() } catch (e) {}
    pipelineSocket.value = null
  }

  stopReconnecting.value = false

  const createSocket = () => {
    try {
      const socket = new WebSocket(`${url}?token=${token}`)
      pipelineSocket.value = socket

      socket.onopen = () => {

        addLog('info', 'Connected to live pipeline stream')
        // reset reconnect attempts
        if (reconnectTimer) { window.clearTimeout(reconnectTimer); reconnectTimer = null }
      }

      socket.onmessage = handleSocketMessage

      socket.onclose = (ev) => {
        addLog('warn', 'Live pipeline stream disconnected')
        pipelineSocket.value = null

        // if the pipeline is still running, attempt a reconnect with small delay
        if (!stopReconnecting.value && pipelineRunning.value) {
          reconnectTimer = window.setTimeout(() => {
            // avoid tight loop
            createSocket()
          }, 3000)
        }
      }

      socket.onerror = (err) => {
        console.warn('WebSocket error', err)
      }
    } catch (e) {
      console.warn('Failed to create websocket', e)
      if (!stopReconnecting.value && pipelineRunning.value) {
        reconnectTimer = window.setTimeout(() => createSocket(), 3000)
      }
    }
  }

  createSocket()
}

onUnmounted(() => {
  stopReconnecting.value = true
  if (reconnectTimer) { window.clearTimeout(reconnectTimer); reconnectTimer = null }
  if (pipelineSocket.value) {
    try { pipelineSocket.value.close() } catch (e) {}
    pipelineSocket.value = null
  }
})

// Auto-scroll behavior: only scroll if user is near bottom
watch(logEntries, async () => {
  await nextTick()
  const el = logContainer.value
  if (!el) return
  const tolerance = 120
  const distanceFromBottom = el.scrollHeight - (el.scrollTop + el.clientHeight)
  if (distanceFromBottom <= tolerance) {
    el.scrollTop = el.scrollHeight
  }
})





// ─── Logs & Execution ────────────────────────────────────────────────────────
const addLog = (level: LogEntry['level'], msg: string) => {
  logEntries.value.push({
    ts: new Date().toLocaleTimeString('en-US', { hour12: false }),
    level,
    msg
  })
}
const removeFile = async(file_id:string)=>{
  addLog('info', `Removing file [${file_id}] from project...`)
  const removeFileResponse = await apiClient.get(`/llm/training/jobs/${file_id}/remove-file/${projectId}`, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    const results = removeFileResponse .data?.data 
    if (removeFileResponse.status !=200) {
      toastStore.addToast("Failed to revomove file from project ", "error")

      throw new Error('Missing file upload results from /add-file response.')
    }
      toastStore.addToast("File revomoved from project ", "success")

}

const initLogs = () => {
  addLog('info', `SageMaker project [${project.value?.name || projectId}] workspace initialized.`)
  addLog('info', `Compute cluster target: ${project.value?.compute || 'gpu-medium'} (16 GB VRAM)`)
  addLog('info', `Artifact S3 path: s3://sagemaker-${projectId}/`)
  addLog('debug', 'Control plane heartbeats connected successfully.')
}

const triggerPipelineRun = async () => {
  if (!project.value || isRunningPipeline.value) return

  // Start the backend run and establish websocket if provided
  const runResp = await runProject()

  isRunningPipeline.value = true
  pipelineRunning.value = true
  project.value.status = 'running'
  project.value.lastRun = new Date().toISOString()
  pipelineProgress.value = 5

  addLog('warn', '🚀 Pipeline execution initiated manually by user.')

  const newRun: PipelineRun = {
    id: `run-${Date.now()}`,
    status: 'running',
    startedAt: new Date().toISOString(),
    stages: project.value.pipeline.map(name => ({ name, status: 'pending' }))
  }
  project.value.runs.unshift(newRun)

  const stages = project.value.pipeline
  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i]
    currentRunningStage.value = stage
    if (newRun.stages && newRun.stages[i]) {
      newRun.stages[i].status = 'running'
    }

    // Update node status
    const node = project.value.nodes?.find(n => n.type === stage)
    if (node) node.status = 'running'

    await new Promise(r => setTimeout(r, 1400))

    pipelineProgress.value = Math.round(((i + 1) / stages.length) * 100)

    if (newRun.stages && newRun.stages[i]) {
      newRun.stages[i].status = 'completed'
      newRun.stages[i].duration = `${Math.floor(Math.random() * 15 + 2)}m`
    }
    if (node) {
      node.status = 'completed'
      node.finished_at = new Date().toISOString()
    }
  }

  newRun.status = 'completed'
  newRun.finishedAt = new Date().toISOString()
  newRun.metrics = { loss: 0.108, accuracy: 97.8, epoch: 12 }
  project.value.status = 'completed'
  isRunningPipeline.value = false
  pipelineRunning.value = false
  currentRunningStage.value = null

  addLog('info', '✓ All pipeline stages completed. Model artifact ready for deployment.')
}

// ─── Inference Playground ───────────────────────────────────────────────────
const runTestInference = async () => {
  if (!testPrompt.value || inferencing.value) return
  inferencing.value = true
  inferenceResult.value = ''

  addLog('info', `Sending test inference request to endpoint [${project.value?.endpoints?.[0]?.name}]...`)

  const mockResponseText = `Based on financial regulatory analysis, fine-tuning a small domain-specific language model (like Serwin Small 1B) provides three major advantages:

1. **Precision & Compliance**: Ensures strict adherence to audit standard terminologies with zero domain hallucination.
2. **Low Latency & Cost Efficiency**: Inferencing takes ~38ms on 16GB VRAM GPUs, reducing runtime operational costs by over 75% compared to general 70B parameter models.
3. **Data Security & Privacy**: All model weights and training datasets remain completely inside isolated S3 boundaries without exposing sensitive data.`

  for (let i = 0; i < mockResponseText.length; i += 4) {
    inferenceResult.value += mockResponseText.slice(i, i + 4)
    await new Promise(r => setTimeout(r, 20))
  }
  inferencing.value = false
  addLog('info', 'Inference stream completed in 420ms (38ms TTL).')
}

// ─── File Upload Modal State ─────────────────────────────────────────────────
const newUploadRole = ref<'training' | 'validation' | 'code'>('training')
const uploadFiles = ref<File[]>([])
const uploadingFiles = ref(false)

const projectConfigOptions = {
  baseModels: [
    'Serwin Small 1B',
    'Serwin Medium 3B',
    'Serwin Large 7B',
    'Llama 3.1 8B',
    'Mistral 7B Instruct'
  ],
  computeInstances: ['gpu-medium', 'gpu-large', 'cpu-medium', 'gpu-xlarge']
}

const editingProjectConfig = ref({
  baseModel: false,
  compute: false,
  schedule: false
})

const configDraft = ref({
  baseModel: project.value?.baseModel || 'Serwin Small 1B',
  compute: project.value?.compute || 'gpu-medium',
  schedule: project.value?.schedule || 'manual'
})

const formatScheduleLabel = (value?: string) => {
  if (!value) return 'Manual Trigger'
  const normalized = String(value).trim()
  if (!normalized || normalized.toLowerCase() === 'manual') return 'Manual Trigger'
  if (/^\d+$/.test(normalized)) return `Every ${normalized} Hours`
  return normalized
}

const openProjectConfigEditor = (field: 'baseModel' | 'compute' | 'schedule') => {
  if (!project.value) return

  configDraft.value.baseModel = project.value.baseModel || 'Serwin Small 1B'
  configDraft.value.compute = project.value.compute || 'gpu-medium'
  configDraft.value.schedule = project.value.schedule || 'manual'

  editingProjectConfig.value = {
    baseModel: field === 'baseModel',
    compute: field === 'compute',
    schedule: field === 'schedule'
  }
}

const saveProjectConfig = async (field: 'baseModel' | 'compute' | 'schedule') => {
  if (!project.value) return

  if (field === 'baseModel') {
    project.value.baseModel = configDraft.value.baseModel
  }

  if (field === 'compute') {
    project.value.compute = configDraft.value.compute
  }

  if (field === 'schedule') {
    const raw = String(configDraft.value.schedule ?? '').trim()
    const numericValue = Number(raw)
    if (raw && Number.isFinite(numericValue) && numericValue >= 0) {
      project.value.schedule = String(numericValue)
    } else if (!raw) {
      project.value.schedule = 'manual'
    } else {
      project.value.schedule = 'manual'
    }
  }

  editingProjectConfig.value[field] = false
  await updateProject()
}

const handleModalFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files) {
    uploadFiles.value = Array.from(input.files)
  }
}

const uploadNewFilesToProject = async () => {
  if (!uploadFiles.value.length || !project.value) return
  uploadingFiles.value = true

  try {
    const formData = new FormData()
    for (const f of uploadFiles.value) {
      formData.append('file', f)
    }
    formData.append('project_id', project.value.id)
    formData.append('project', JSON.stringify({
      id: project.value.id,
      name: project.value.name,
      description: project.value.description,
      type: project.value.type || 'llm'
    }))
    formData.append('role', newUploadRole.value)

    addLog('info', `Uploading ${uploadFiles.value.length} file(s) to S3 repository...`)

    const uploadResponse = await apiClient.post(`/llm/training/jobs/${projectId}/add-file`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    const results = uploadResponse.data?.data?.files || uploadResponse.data?.files
    if (!results || !results.length) {
      toastStore.addToast("Failed to add file to project ", "error")

      throw new Error('Missing file upload results from /add-file response.')
    }

    // Map filename -> presigned URL so we can match each result back to its File object
    const urlByName = new Map(results.map(r => [r.file_name, r.upload_url]))

    for (const f of uploadFiles.value) {
      const presignedUrl = urlByName.get(f.name)
      if (!presignedUrl) {
        throw new Error(`Missing presigned upload URL for file [${f.name}].`)
      }

      addLog('info', `Uploading file [${f.name}] to S3...`)

      const uploadResult = await fetch(presignedUrl, {
        method: 'PUT',
        body: f,
        headers: {
          'Content-Type': f.type || 'application/octet-stream',
          'Authorization': `Bearer ${authStore.token}`
        }
      })

      if (!uploadResult.ok) {
        throw new Error(`File upload failed for [${f.name}] with status ${uploadResult.status}`)
      }

      const newFileObj: ProjectFile = {
        id: `f-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: f.name,
        type: f.name.endsWith('.jsonl') ? 'JSONL' : f.name.endsWith('.py') ? 'Python' : 'Data',
        role: newUploadRole.value,
        size: f.size,
        path: `s3://sagemaker-${projectId}/${newUploadRole.value}/${f.name}`,
        uploadedAt: new Date().toISOString()
      }
      project.value.files = project.value.files || []
      project.value.files.unshift(newFileObj)
    }

    addLog('info', `Successfully added ${uploadFiles.value.length} files to project dataset repository.`)
    uploadFiles.value = []
    showUploadModal.value = false
    await updateProject()
  } catch (e) {
    console.error('File upload failed', e)
    addLog('error', `Failed to upload files: ${e}`)
  } finally {
    uploadingFiles.value = false
  }
}

// ─── Helper Functions ────────────────────────────────────────────────────────
const formatBytes = (bytes?: number) => {
  if (!bytes && bytes !== 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

const formatDate = (iso?: string) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const statusBadgeColor = (s?: string) => {
  switch (s) {
    case 'completed': return 'bg-emerald-500 text-white'
    case 'running': return 'bg-[#ff9900] text-white animate-pulse'
    case 'failed': return 'bg-red-500 text-white'
    case 'InService': return 'bg-emerald-500 text-white'
    default: return 'bg-[#545b64] text-white'
  }
}

const statusDotColor = (s?: string) => {
  switch (s) {
    case 'completed': return 'bg-emerald-500'
    case 'running': return 'bg-[#ff9900] animate-ping'
    case 'failed': return 'bg-red-500'
    case 'InService': return 'bg-emerald-500'
    default: return 'bg-gray-400'
  }
}

// Node canvas selection & positioning
const selectedNodeId = ref<string | null>(null)
const selectedNode = computed(() => project.value?.nodes?.find(n => n.id === selectedNodeId.value) || null)

onMounted(loadProject)
</script>

<template>
  <div class="min-h-screen bg-white font-urbanist selection:bg-[#ff9900]/30 selection:text-[#232f3e] pb-20">
    
    <!-- Background Grid -->
    <div class="fixed inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

    <!-- ── Loading State ───────────────────────────────────────────────────── -->
    <div v-if="loading" class="min-h-[80vh] flex flex-col items-center justify-center relative z-10">
      <svg class="w-12 h-12 animate-spin text-[#ff9900] mb-4" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      <p class="text-xs font-black uppercase tracking-[0.25em] text-[#232f3e]">Loading Project Headquarters...</p>
    </div>

    <template v-else-if="project">
      <!-- ═══════════════════════════════════════════════════════════════════
           HEADER CONTROL BAR
      ═══════════════════════════════════════════════════════════════════ -->
      <header class="relative z-10 border-b-2 border-[#eaeded] bg-white px-8 md:px-16 pt-8 pb-6">
        <div class="max-w-[1800px] mx-auto">
          
          <!-- Breadcrumb & Status Row -->
          <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
            <nav class="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#879196]">
              <button @click="router.push('/sagemaker')" class="hover:text-[#ff9900] transition-colors">SageMaker</button>
              <span>/</span>
              <button @click="router.push('/sagemaker')" class="hover:text-[#ff9900] transition-colors">Projects</button>
              <span>/</span>
              <span class="text-[#232f3e] font-black">{{ project.name }}</span>
            </nav>

            <div class="flex items-center gap-3">
              <span class="inline-flex items-center gap-2 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] border-2 border-[#eaeded]">
                <span class="w-2 h-2 rounded-full" :class="statusDotColor(project.status)"></span>
                STATUS: {{ project.status }}
              </span>

              <span class="px-3 py-1 bg-[#232f3e] text-white text-[9px] font-black uppercase tracking-[0.2em]">
                {{ project.type || 'LLM' }}
              </span>
            </div>
          </div>

          <!-- Main Title & Action Buttons -->
          <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 class="text-3xl md:text-4xl font-black text-[#232f3e] uppercase tracking-tighter italic">
                {{ project.name }}
              </h1>
              <p class="text-sm text-[#545b64] font-medium mt-1 max-w-3xl">
                {{ project.description }}
              </p>
            </div>

            <!-- Header Action Controls -->
            <div class="flex flex-wrap items-center gap-3">
              <button
                @click="showUploadModal = true"
                class="px-5 py-3 bg-white border-2 border-[#232f3e] text-[#232f3e] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#232f3e] hover:text-white transition-all transform active:scale-95 flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4" />
                </svg>
                Upload File
              </button>

              <button
                @click="triggerPipelineRun"
                :disabled="isRunningPipeline"
                class="px-6 py-3 bg-[#ff9900] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#ec7211] transition-all transform active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                <svg v-if="isRunningPipeline" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span v-else>▶</span>
                {{ isRunningPipeline ? 'Running Pipeline...' : 'Run Pipeline' }}
              </button>
            </div>
          </div>

          <!-- Project Specs Row -->
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8 pt-6 border-t border-[#eaeded]">
            <div
              class="p-3 bg-[#fafafa] border border-[#eaeded] cursor-pointer transition-all hover:border-[#ff9900]"
              :class="editingProjectConfig.baseModel ? 'border-[#ff9900] bg-[#fffaf2]' : ''"
              @click="openProjectConfigEditor('baseModel')"
            >
              <span class="text-[9px] font-black text-[#879196] uppercase tracking-widest block">Base Model</span>

              <div v-if="editingProjectConfig.baseModel" class="mt-2">
                <select
                  v-model="configDraft.baseModel"
                  @change="saveProjectConfig('baseModel')"
                  class="w-full border-2 border-[#232f3e] bg-white px-2 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-[#232f3e] outline-none"
                >
                  <option v-for="option in projectConfigOptions.baseModels" :key="option" :value="option">
                    {{ option }}
                  </option>
                </select>
              </div>

              <span v-else class="text-xs font-black text-[#232f3e] uppercase mt-0.5 block">{{ project.baseModel || 'Serwin Small 1B' }}</span>
            </div>

            <div
              class="p-3 bg-[#fafafa] border border-[#eaeded] cursor-pointer transition-all hover:border-[#ff9900]"
              :class="editingProjectConfig.compute ? 'border-[#ff9900] bg-[#fffaf2]' : ''"
              @click="openProjectConfigEditor('compute')"
            >
              <span class="text-[9px] font-black text-[#879196] uppercase tracking-widest block">Compute Instance</span>

              <div v-if="editingProjectConfig.compute" class="mt-2">
                <select
                  v-model="configDraft.compute"
                  @change="saveProjectConfig('compute')"
                  class="w-full border-2 border-[#232f3e] bg-white px-2 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-[#232f3e] outline-none"
                >
                  <option v-for="option in projectConfigOptions.computeInstances" :key="option" :value="option">
                    {{ option }}
                  </option>
                </select>
              </div>

              <span v-else class="text-xs font-black text-[#232f3e] uppercase mt-0.5 block">{{ project.compute || 'gpu-medium' }}</span>
            </div>

            <div
              class="p-3 bg-[#fafafa] border border-[#eaeded] cursor-pointer transition-all hover:border-[#ff9900]"
              :class="editingProjectConfig.schedule ? 'border-[#ff9900] bg-[#fffaf2]' : ''"
              @click="openProjectConfigEditor('schedule')"
            >
              <span class="text-[9px] font-black text-[#879196] uppercase tracking-widest block">Schedule</span>

              <div v-if="editingProjectConfig.schedule" class="mt-2">
                <input
                  v-model="configDraft.schedule"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Hours"
                  @keydown.enter.prevent="saveProjectConfig('schedule')"
                  @blur="saveProjectConfig('schedule')"
                  class="w-full border-2 border-[#232f3e] bg-white px-2 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-[#232f3e] outline-none"
                />
              </div>

              <span v-else class="text-xs font-black text-[#232f3e] uppercase mt-0.5 block">{{ formatScheduleLabel(project.schedule) }}</span>
            </div>

            <div class="p-3 bg-[#fafafa] border border-[#eaeded]">
              <span class="text-[9px] font-black text-[#879196] uppercase tracking-widest block">Total Runs</span>
              <span class="text-xs font-black text-[#ff9900] uppercase mt-0.5 block">{{ project.runs.length }} Runs</span>
            </div>

            <div class="p-3 bg-[#fafafa] border border-[#eaeded]">
              <span class="text-[9px] font-black text-[#879196] uppercase tracking-widest block">Created</span>
              <span class="text-xs font-black text-[#232f3e] uppercase mt-0.5 block">{{ formatDate(project.createdAt) }}</span>
            </div>
          </div>

        </div>
      </header>

      <!-- ═══════════════════════════════════════════════════════════════════
           MAIN HEADQUARTERS WORKSPACE TABS
      ═══════════════════════════════════════════════════════════════════ -->
      <main class="relative z-10 max-w-[1800px] mx-auto px-8 md:px-16 mt-8">
        
        <!-- Tab Bar -->
        <div class="flex border-b-2 border-[#eaeded] overflow-x-auto">
          <button
            v-for="tab in [
              { id: 'overview', label: 'Overview & Metrics' },
              { id: 'canvas', label: 'Pipeline Builder Canvas' },
              { id: 'files', label: `Datasets & Files (${project.files?.length || 0})` },
              { id: 'runs', label: `Runs & History (${project.runs.length})` },
              { id: 'endpoints', label: `Endpoints (${project.endpoints?.length || 0})` },
              { id: 'settings', label: 'Settings & Config' },
            ]"
            :key="tab.id"
            @click="activeTab = (tab.id as any)"
            class="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all border-b-2 -mb-0.5"
            :class="activeTab === tab.id
              ? 'border-[#ff9900] text-[#ff9900] bg-white'
              : 'border-transparent text-[#879196] hover:text-[#232f3e]'"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- ═══ TAB 1: OVERVIEW & METRICS ════════════════════════════════ -->
        <div v-if="activeTab === 'overview'" class="mt-8 space-y-8">
          
          <!-- Key Metric Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="bg-white border-2 border-[#eaeded] p-6 relative overflow-hidden group hover:border-[#ff9900] transition-all">
              <span class="text-[9px] font-black text-[#879196] uppercase tracking-[0.2em]">Latest Loss Metric</span>
              <p class="text-3xl font-black text-[#232f3e] mt-2">0.142 <span class="text-xs text-emerald-600 font-bold">(-14%)</span></p>
              <p class="text-[9px] text-[#879196] font-bold mt-1 uppercase">Optimal convergence</p>
            </div>

            <div class="bg-white border-2 border-[#eaeded] p-6 relative overflow-hidden group hover:border-[#ff9900] transition-all">
              <span class="text-[9px] font-black text-[#879196] uppercase tracking-[0.2em]">Evaluation Accuracy</span>
              <p class="text-3xl font-black text-[#ff9900] mt-2">96.4%</p>
              <p class="text-[9px] text-[#879196] font-bold mt-1 uppercase">Target: &gt;95%</p>
            </div>

            <div class="bg-white border-2 border-[#eaeded] p-6 relative overflow-hidden group hover:border-[#ff9900] transition-all">
              <span class="text-[9px] font-black text-[#879196] uppercase tracking-[0.2em]">Total Files Uploaded</span>
              <p class="text-3xl font-black text-[#232f3e] mt-2">{{ project.files?.length || 0 }} Files</p>
              <p class="text-[9px] text-[#879196] font-bold mt-1 uppercase">Training & validation datasets</p>
            </div>

            <div class="bg-white border-2 border-[#eaeded] p-6 relative overflow-hidden group hover:border-[#ff9900] transition-all">
              <span class="text-[9px] font-black text-[#879196] uppercase tracking-[0.2em]">Inference Endpoint Latency</span>
              <p class="text-3xl font-black text-emerald-600 mt-2">38 ms</p>
              <p class="text-[9px] text-[#879196] font-bold mt-1 uppercase">1,420 invocations total</p>
            </div>
          </div>

          <!-- Two Column Detail Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <!-- Left 2 Cols: Pipeline Stage Execution Summary -->
            <div class="lg:col-span-2 space-y-6">
              <div class="bg-white border-2 border-[#232f3e] p-8">
                <div class="flex justify-between items-center mb-6">
                  <h3 class="text-sm font-black text-[#232f3e] uppercase tracking-[0.2em]">Pipeline Workflow Architecture</h3>
                  <span class="text-[9px] font-black text-[#ff9900] uppercase tracking-widest">{{ project.pipeline.length }} STAGES ACTIVE</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  <div
                    v-for="(stage, idx) in project.pipeline"
                    :key="stage"
                    class="p-4 border-2 text-center transition-all"
                    :class="currentRunningStage === stage
                      ? 'border-[#ff9900] bg-[#fffaf2] animate-pulse'
                      : 'border-[#eaeded] bg-[#fafafa]'"
                  >
                    <span class="text-[9px] font-black text-[#879196] uppercase tracking-widest block mb-1">0{{ idx + 1 }}</span>
                    <span class="text-xs font-black text-[#232f3e] uppercase tracking-tight block">{{ stage }}</span>
                    <span class="inline-block mt-2 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700">OK</span>
                  </div>
                </div>
              </div>

              <!-- Real-time Console Log -->
              <div class="bg-[#1e242b] border-2 border-[#232f3e] p-6 text-white">
                <div class="flex justify-between items-center mb-4 pb-3 border-b border-white/10">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                    <span class="text-xs font-black uppercase tracking-widest">Live Control Plane Stream</span>
                  </div>
                  <span class="text-[9px] font-mono text-slate-400">sagemaker.log</span>
                </div>

                <div class="font-mono text-xs space-y-1.5 max-h-56 overflow-y-auto pr-2">
                  <div v-for="(log, lidx) in logEntries" :key="lidx" class="flex items-start gap-3">
                    <span class="text-slate-500 select-none">{{ log.ts }}</span>
                    <span
                      class="px-1 py-0.5 text-[8px] font-black uppercase rounded"
                      :class="{
                        'bg-blue-500/20 text-blue-400': log.level === 'info',
                        'bg-amber-500/20 text-amber-400': log.level === 'warn',
                        'bg-red-500/20 text-red-400': log.level === 'error',
                        'bg-slate-500/20 text-slate-400': log.level === 'debug',
                      }"
                    >
                      {{ log.level }}
                    </span>
                    <span class="text-slate-200">{{ log.msg }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Col: System Status & Infrastructure -->
            <div class="space-y-6">
              <div class="bg-[#fafafa] border-2 border-[#eaeded] p-6">
                <h3 class="text-xs font-black text-[#232f3e] uppercase tracking-[0.2em] mb-4">Infrastructure Readiness</h3>

                <div class="space-y-3">
                  <div v-for="item in [
                    { name: 'Compute Orchestrator', status: 'Active', ok: true },
                    { name: 'GPU Cluster (16GB VRAM)', status: 'Provisioned', ok: true },
                    { name: 'S3 Dataset Store', status: 'Connected', ok: true },
                    { name: 'Model Registry', status: 'Synced', ok: true },
                    { name: 'Inference Router', status: 'Healthy', ok: true },
                  ]" :key="item.name" class="flex justify-between items-center py-2 border-b border-[#eaeded] last:border-0">
                    <span class="text-xs font-bold text-[#545b64] uppercase">{{ item.name }}</span>
                    <span class="text-[9px] font-black uppercase tracking-widest text-emerald-600">● {{ item.status }}</span>
                  </div>
                </div>
              </div>

              <!-- Quick Launch Actions -->
              <div class="bg-white border-2 border-[#232f3e] p-6">
                <h3 class="text-xs font-black text-[#232f3e] uppercase tracking-[0.2em] mb-4">Project Controls</h3>
                
                <div class="space-y-3">
                  <button
                    @click="triggerPipelineRun"
                    class="w-full py-3 bg-[#232f3e] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#ff9900] transition-colors"
                  >
                    ▶ Run Pipeline Job
                  </button>

                  <button
                    @click="activeTab = 'endpoints'"
                    class="w-full py-3 bg-white border-2 border-[#232f3e] text-[#232f3e] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#232f3e] hover:text-white transition-colors"
                  >
                    🚀 Test Inference Endpoint
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- ═══ TAB 2: PIPELINE BUILDER CANVAS ═══════════════════════════ -->
        <div v-if="activeTab === 'canvas'" class="mt-8">
          <div class="bg-white border-2 border-[#232f3e] p-6 relative">
            <div class="flex justify-between items-center mb-6">
              <div>
                <h3 class="text-sm font-black text-[#232f3e] uppercase tracking-[0.2em]">Visual Node Canvas</h3>
                <p class="text-[10px] text-[#879196] font-bold uppercase mt-1">Drag and arrange pipeline stages, scripts, and execution dependencies</p>
              </div>

              <div class="flex items-center gap-3">
                <span class="text-xs font-bold text-[#232f3e]">Nodes: {{ project.nodes?.length || 0 }}</span>
              </div>
            </div>

            <!-- Canvas Container -->
            <div class="relative h-[480px] bg-[#fafafa] border-2 border-[#eaeded] overflow-hidden">
              
              <!-- Nodes -->
              <div
                v-for="node in project.nodes"
                :key="node.id"
                @click="selectedNodeId = node.id"
                class="absolute w-44 bg-white border-2 p-4 cursor-pointer transition-all hover:shadow-xl"
                :class="selectedNodeId === node.id ? 'border-[#ff9900] shadow-lg ring-2 ring-[#ff9900]/30' : 'border-[#232f3e]'"
                :style="{ left: node.x + 'px', top: node.y + 'px' }"
              >
                <div class="flex justify-between items-center mb-2 pb-2 border-b border-[#eaeded]">
                  <span class="text-xs font-black uppercase tracking-wider text-[#232f3e]">{{ node.type }}</span>
                  <span class="w-2 h-2 rounded-full" :class="statusDotColor(node.status)"></span>
                </div>

                <div class="text-[9px] font-bold text-[#545b64] uppercase space-y-1">
                  <div>VM: {{ node.vm || 'shared' }}</div>
                  <div>Scripts: {{ node.scripts?.length || 0 }}</div>
                </div>

                <div class="mt-3 pt-2 border-t border-[#eaeded] flex justify-between items-center">
                  <span class="text-[8px] font-black uppercase text-[#879196]">{{ node.status || 'idle' }}</span>
                  <span class="text-[9px] font-bold text-[#ff9900]">→</span>
                </div>
              </div>

              <!-- Node selection inspector drawer -->
              <div v-if="selectedNode" class="absolute right-0 top-0 bottom-0 w-72 bg-white border-l-2 border-[#232f3e] p-6 overflow-y-auto">
                <div class="flex justify-between items-center mb-4 pb-3 border-b border-[#eaeded]">
                  <h4 class="text-xs font-black uppercase tracking-widest text-[#232f3e]">Node Properties</h4>
                  <button @click="selectedNodeId = null" class="text-xs font-black text-[#879196] hover:text-[#232f3e]">✕</button>
                </div>

                <div class="space-y-4">
                  <div>
                    <label class="text-[9px] font-black uppercase text-[#879196] block mb-1">Stage Type</label>
                    <span class="text-xs font-black uppercase text-[#232f3e] block">{{ selectedNode.type }}</span>
                  </div>

                  <div>
                    <label class="text-[9px] font-black uppercase text-[#879196] block mb-1">Target VM Instance</label>
                    <span class="text-xs font-bold text-[#232f3e] block">{{ selectedNode.vm }}</span>
                  </div>

                  <div>
                    <label class="text-[9px] font-black uppercase text-[#879196] block mb-1">Destination Bucket</label>
                    <span class="text-xs font-mono text-[#545b64] block truncate">{{ selectedNode.destBucket }}</span>
                  </div>

                  <div>
                    <label class="text-[9px] font-black uppercase text-[#879196] block mb-2">Attached Scripts</label>
                    <div v-for="s in selectedNode.scripts" :key="s.id" class="p-2 bg-[#fafafa] border border-[#eaeded] text-xs font-mono text-[#232f3e] mb-1">
                      {{ s.name }}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- ═══ TAB 3: DATASETS & FILE REPOSITORY ════════════════════════ -->
        <div v-if="activeTab === 'files'" class="mt-8 space-y-6">
          
          <div class="flex justify-between items-center bg-white border-2 border-[#232f3e] p-6">
            <div>
              <h3 class="text-sm font-black text-[#232f3e] uppercase tracking-[0.2em]">Project Dataset & File Repository</h3>
              <p class="text-[10px] text-[#879196] font-bold uppercase mt-1">Uploaded files, datasets, and custom training scripts stored in S3</p>
            </div>

            <button
              @click="showUploadModal = true"
              class="px-6 py-3 bg-[#ff9900] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#ec7211] transition-all"
            >
              + Upload File to S3
            </button>
          </div>

          <!-- File List Table -->
          <div class="bg-white border-2 border-[#eaeded] overflow-hidden">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-[#fafafa] border-b-2 border-[#eaeded] text-[9px] font-black uppercase tracking-[0.2em] text-[#879196]">
                  <th class="p-4">File Name</th>
                  <th class="p-4">Role</th>
                  <th class="p-4">Size</th>
                  <th class="p-4">S3 Location</th>
                  <th class="p-4">Uploaded</th>
                  <th class="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#eaeded]">
                <tr v-for="file in project.files" :key="file.id" class="hover:bg-[#fafafa] transition-colors">
                  <td class="p-4">
                    <span class="text-xs font-black text-[#232f3e] block">{{ file.name }}</span>
                    <span class="text-[9px] font-bold text-[#879196] uppercase">{{ file.type }}</span>
                  </td>

                  <td class="p-4">
                    <span
                      class="px-2 py-1 text-[8px] font-black uppercase tracking-widest"
                      :class="{
                        'bg-[#ff9900]/10 text-[#ff9900]': file.role === 'training',
                        'bg-emerald-100 text-emerald-700': file.role === 'validation',
                        'bg-purple-100 text-purple-700': file.role === 'code',
                        'bg-blue-100 text-blue-700': file.role === 'artifact',
                      }"
                    >
                      {{ file.role }}
                    </span>
                  </td>

                  <td class="p-4 text-xs font-mono text-[#545b64]">
                    {{ formatBytes(file.size) }}
                  </td>

                  <td class="p-4 text-xs font-mono text-[#879196] max-w-xs truncate">
                    {{ file.path }}
                  </td>

                  <td class="p-4 text-xs font-bold text-[#545b64]">
                    {{ formatDate(file.uploadedAt) }}
                  </td>

                  <td class="p-4 text-right space-x-2">
                    <button
                      @click="addLog('info', `Generating presigned URL for [${file.name}] download...`)"
                      class="px-3 py-1 bg-white border border-[#232f3e] text-[9px] font-black uppercase tracking-widest text-[#232f3e] hover:bg-[#232f3e] hover:text-white transition-colors"
                    >
                      Download
                    </button>

                     <button
                      @click="removeFile(file.id)"
                      class="px-3 py-1 bg-white border border-[#232f3e] text-[9px] font-black uppercase tracking-widest text-[#232f3e] hover:bg-[#232f3e] hover:text-white transition-colors"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ═══ TAB 4: TRAINING RUNS & HISTORY ═══════════════════════════ -->
        <div v-if="activeTab === 'runs'" class="mt-8 space-y-6">
          <div class="bg-white border-2 border-[#232f3e] p-6">
            <h3 class="text-sm font-black text-[#232f3e] uppercase tracking-[0.2em]">Execution & Training Job Runs</h3>
            <p class="text-[10px] text-[#879196] font-bold uppercase mt-1">Complete run history and stage duration breakdown</p>
          </div>

          <div class="space-y-4">
            <div v-for="run in project.runs" :key="run.id" class="bg-white border-2 border-[#eaeded] p-6 hover:border-[#ff9900] transition-colors">
              <div class="flex flex-wrap justify-between items-center gap-4 mb-4 pb-4 border-b border-[#eaeded]">
                <div>
                  <span class="text-xs font-black uppercase tracking-wider text-[#232f3e]">{{ run.id }}</span>
                  <span class="text-[10px] text-[#879196] font-bold uppercase block mt-0.5">Started: {{ formatDate(run.startedAt) }}</span>
                </div>

                <div class="flex items-center gap-4">
                  <span v-if="run.metrics?.loss" class="text-xs font-bold text-[#545b64]">Loss: <strong class="text-[#232f3e]">{{ run.metrics.loss }}</strong></span>
                  <span v-if="run.metrics?.accuracy" class="text-xs font-bold text-[#545b64]">Accuracy: <strong class="text-[#ff9900]">{{ run.metrics.accuracy }}%</strong></span>

                  <span class="px-3 py-1 text-[9px] font-black uppercase tracking-widest" :class="statusBadgeColor(run.status)">
                    {{ run.status }}
                  </span>
                </div>
              </div>

              <!-- Stage Timeline -->
              <div class="flex flex-wrap gap-2">
                <div v-for="stg in run.stages || []" :key="stg.name" class="px-3 py-1.5 bg-[#fafafa] border border-[#eaeded] flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full" :class="statusDotColor(stg.status)"></span>
                  <span class="text-xs font-bold text-[#232f3e] uppercase">{{ stg.name }}</span>
                  <span v-if="stg.duration" class="text-[9px] text-[#879196] font-mono">({{ stg.duration }})</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ TAB 5: ENDPOINTS & INFERENCE PLAYGROUND ══════════════════ -->
        <div v-if="activeTab === 'endpoints'" class="mt-8 space-y-8">
          
          <!-- Endpoint Cards -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-1 bg-white border-2 border-[#232f3e] p-6 space-y-4">
              <div class="flex justify-between items-center pb-3 border-b border-[#eaeded]">
                <h3 class="text-xs font-black text-[#232f3e] uppercase tracking-[0.2em]">Active Endpoint</h3>
                <span class="px-2 py-0.5 bg-emerald-500 text-white text-[8px] font-black uppercase">InService</span>
              </div>

              <div v-for="ep in project.endpoints" :key="ep.id" class="space-y-3">
                <div>
                  <label class="text-[9px] font-black text-[#879196] uppercase">Endpoint Name</label>
                  <p class="text-xs font-black text-[#232f3e] mt-0.5">{{ ep.name }}</p>
                </div>

                <div>
                  <label class="text-[9px] font-black text-[#879196] uppercase">URL Endpoint</label>
                  <p class="text-[10px] font-mono text-[#545b64] mt-0.5 break-all">{{ ep.endpointUrl }}</p>
                </div>

                <div class="grid grid-cols-2 gap-3 pt-2">
                  <div class="p-2 bg-[#fafafa] border border-[#eaeded]">
                    <span class="text-[8px] font-black text-[#879196] uppercase block">Latency</span>
                    <span class="text-xs font-black text-emerald-600 block mt-0.5">{{ ep.latencyMs }} ms</span>
                  </div>

                  <div class="p-2 bg-[#fafafa] border border-[#eaeded]">
                    <span class="text-[8px] font-black text-[#879196] uppercase block">Invocations</span>
                    <span class="text-xs font-black text-[#232f3e] block mt-0.5">{{ ep.invocations }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Interactive Inference Playground -->
            <div class="lg:col-span-2 bg-white border-2 border-[#232f3e] p-6 space-y-6">
              <div class="flex justify-between items-center pb-3 border-b border-[#eaeded]">
                <div>
                  <h3 class="text-sm font-black text-[#232f3e] uppercase tracking-[0.2em]">Live Inference Playground</h3>
                  <p class="text-[10px] text-[#879196] font-bold uppercase mt-0.5">Test real-time model completions directly from your browser</p>
                </div>
              </div>

              <div class="space-y-4">
                <div>
                  <label class="text-[9px] font-black text-[#545b64] uppercase tracking-wider block mb-1.5">Input Prompt</label>
                  <textarea
                    v-model="testPrompt"
                    rows="3"
                    class="w-full p-4 border-2 border-[#eaeded] text-xs font-medium text-[#232f3e] focus:outline-none focus:border-[#ff9900]"
                  ></textarea>
                </div>

                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-6">
                    <div>
                      <span class="text-[9px] font-black text-[#879196] uppercase block">Temp: {{ modelTemperature }}</span>
                    </div>
                    <div>
                      <span class="text-[9px] font-black text-[#879196] uppercase block">Max Tokens: {{ modelMaxTokens }}</span>
                    </div>
                  </div>

                  <button
                    @click="runTestInference"
                    :disabled="inferencing"
                    class="px-6 py-3 bg-[#ff9900] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#ec7211] transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <svg v-if="inferencing" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    {{ inferencing ? 'Generating Response...' : 'Send Inference Prompt →' }}
                  </button>
                </div>

                <!-- Output Box -->
                <div v-if="inferenceResult || inferencing" class="p-6 bg-[#fafafa] border-2 border-[#232f3e] min-h-[140px]">
                  <span class="text-[9px] font-black text-[#ff9900] uppercase tracking-widest block mb-2">Model Completion Output:</span>
                  <p class="text-xs text-[#232f3e] font-mono leading-relaxed whitespace-pre-wrap">{{ inferenceResult }}</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- ═══ TAB 6: SETTINGS & CONFIG ═════════════════════════════════ -->
        <div v-if="activeTab === 'settings'" class="mt-8 space-y-6 max-w-3xl">
          <div class="bg-white border-2 border-[#232f3e] p-6 space-y-6">
            <h3 class="text-sm font-black text-[#232f3e] uppercase tracking-[0.2em]">Project Settings & Configuration</h3>

            <div class="space-y-4">
              <div>
                <label class="text-[9px] font-black text-[#545b64] uppercase block mb-1.5">Project Name</label>
                <input
                  v-model="project.name"
                  type="text"
                  class="w-full px-4 py-3 border-2 border-[#eaeded] text-sm text-[#232f3e] font-medium focus:outline-none focus:border-[#ff9900]"
                />
              </div>

              <div>
                <label class="text-[9px] font-black text-[#545b64] uppercase block mb-1.5">Description</label>
                <textarea
                  v-model="project.description"
                  rows="3"
                  class="w-full p-4 border-2 border-[#eaeded] text-sm text-[#232f3e] font-medium focus:outline-none focus:border-[#ff9900]"
                ></textarea>
              </div>
              <div>
                <label class="text-[9px] font-black text-[#545b64] uppercase block mb-1.5">Project ApiKey</label>
                <input
                  v-model="project.api_key"
                  type="text"
                  class="w-full px-4 py-3 border-2 border-[#eaeded] text-sm text-[#232f3e] font-medium focus:outline-none focus:border-[#ff9900]"
                />
              </div>
               <div>
                <label class="text-[9px] font-black text-[#545b64] uppercase block mb-1.5">Project Bucket ID</label>
                <input
                  v-model="project.bucket_id"
                  disabled
                  type="text"
                  class="w-full px-4 py-3 border-2 border-[#eaeded] text-sm text-[#232f3e] font-medium focus:outline-none focus:border-[#ff9900]"
                />
              </div>
<div>
                <label class="text-[9px] font-black text-[#545b64] uppercase block mb-1.5">Project Code Entry point</label>
                <input
                  v-model="project.entry_point"
                  type="text"
                  class="w-full px-4 py-3 border-2 border-[#eaeded] text-sm text-[#232f3e] font-medium focus:outline-none focus:border-[#ff9900]"
                />
              </div>
               <div>
                <label class="text-[9px] font-black text-[#545b64] uppercase block mb-1.5">Project CallBackUrl</label>
                <input
                  v-model="project.callback"
                  disabled
                  type="text"
                  class="w-full px-4 py-3 border-2 border-[#eaeded] text-sm text-[#232f3e] font-medium focus:outline-none focus:border-[#ff9900]"
                />
              </div>

              <div>
                <button
                  @click="updateProject"
                  class="px-6 py-3 bg-[#ff9900] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#ec7211] transition-all"
                >
                  Save Configuration Changes
                </button>
              </div>
            </div>
          </div>
        </div>

      </main>
    </template>

    <!-- ═══════════════════════════════════════════════════════════════════
         UPLOAD FILE MODAL
    ═══════════════════════════════════════════════════════════════════ -->
    <Transition name="fade">
      <div v-if="showUploadModal" class="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#232f3e]/60 backdrop-blur-md">
        <div class="bg-white border-2 border-[#232f3e] w-full max-w-lg p-8 shadow-2xl space-y-6">
          <div class="flex justify-between items-center pb-4 border-b border-[#eaeded]">
            <h3 class="text-lg font-black uppercase tracking-tight text-[#232f3e]">Upload Data File to S3</h3>
            <button @click="showUploadModal = false" class="text-sm font-black text-[#879196] hover:text-[#232f3e]">✕</button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="text-[9px] font-black uppercase text-[#545b64] block mb-1">File Role</label>
              <select v-model="newUploadRole" class="w-full px-4 py-3 border-2 border-[#eaeded] text-xs font-bold text-[#232f3e]">
                <option value="training">Training Dataset</option>
                <option value="validation">Validation Dataset</option>
                <option value="code">Custom Training Code</option>
              </select>
            </div>

            <div>
              <label class="text-[9px] font-black uppercase text-[#545b64] block mb-1">Select File</label>
              <input type="file" multiple @change="handleModalFileChange" class="w-full text-xs" />
            </div>

            <div v-if="uploadFiles.length" class="p-3 bg-[#fafafa] border border-[#eaeded] text-xs font-bold text-[#232f3e]">
              Selected: {{ uploadFiles.map(f => f.name).join(', ') }}
            </div>
          </div>

          <div class="flex justify-between pt-4 border-t border-[#eaeded]">
            <button @click="showUploadModal = false" class="px-6 py-3 border-2 border-[#eaeded] text-[10px] font-black uppercase text-[#545b64]">Cancel</button>
            <button
              @click="uploadNewFilesToProject"
              :disabled="!uploadFiles.length || uploadingFiles"
              class="px-6 py-3 bg-[#ff9900] text-white text-[10px] font-black uppercase tracking-[0.2em] disabled:opacity-50"
            >
              {{ uploadingFiles ? 'Uploading...' : 'Confirm Upload' }}
            </button>
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
