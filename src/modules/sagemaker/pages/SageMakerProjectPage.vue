<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '@/shared/api/apiClient'
const route = useRoute()
const router = useRouter()

// ─── Types ────────────────────────────────────────────────────────────────────
interface PipelineScript {
  id: string; name: string; path: string; routeTo?: string
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
  status?: 'pending'|'running'|'completed'|'failed'
  started_at?: string
  finished_at?: string
  vm?: string
  vmMode?: string
}

interface PipelineEdge { id: string; fromNodeId: string; toNodeId: string }
interface PipelineRun { id: string; status: 'pending' | 'running' | 'completed' | 'failed'; startedAt: string; finishedAt?: string }
interface LogEntry { ts: string; level: 'info' | 'warn' | 'error'; msg: string }
interface SageMakerProject {
  id: string; name: string; description: string; tags: string[]
  createdAt: string; lastRun?: string; status: 'idle' | 'running' | 'completed' | 'failed'
  runs: PipelineRun[]; nodes: PipelineNode[]; edges: PipelineEdge[]
  datasources: { name: string; type: string; path: string }[]
}

// ─── Project load / save ──────────────────────────────────────────────────────
const project = ref<SageMakerProject | null>(null)
const notFound = ref(false)

const buildDefaultNodes = (p: SageMakerProject): PipelineNode[] => {
  const legacy: string[] = (p as any).pipeline ?? ['ingest', 'clean', 'train', 'evaluate', 'deploy']
  return legacy.map((type, i) => ({
    id: `node-${i}`, type: type as PipelineNode['type'],
    x: 60 + i * 210, y: 100, scripts: [],
    vm: 'shared-01', vmMode: 'shared', destBucket: `s3://${type}/`,
  }))
}
const buildDefaultEdges = (ns: PipelineNode[]): PipelineEdge[] => {
  if (!ns || ns.length < 2) return []
  return ns.slice(0, -1).map((n, i) => ({ id: `edge-${i}`, fromNodeId: n.id, toNodeId: ns[i + 1].id }))
}
const updateProject = async () => {
  if (!project.value) return
  try {
    await apiClient.put(`/llm/training/jobs/${project.value.id}`, project.value)
  } catch (e) {
    console.error('Failed to save project', e)
  }
}
const saveProject = updateProject

const loadProject = async () => {
  try {
    const res = await apiClient.get(`/llm/training/jobs/${route.params.id}`)
    if (!res.data) { notFound.value = true; return }

    const found: SageMakerProject = res.data
    if (!found.nodes) found.nodes = buildDefaultNodes(found)
    if (!found.edges) found.edges = buildDefaultEdges(found.nodes)
    project.value = found
  } catch {
    notFound.value = true
  }
}

onMounted(loadProject)

const nodes = computed({ get: () => project.value?.nodes ?? [], set: v => { if (project.value) project.value.nodes = v } })
const edges = computed({ get: () => project.value?.edges ?? [], set: v => { if (project.value) project.value.edges = v } })

// ─── Palette config ───────────────────────────────────────────────────────────
const paletteTypes = [
  { type: 'ingest', label: 'ingest', icon: '⬇', desc: 'Pull data from sources' },
  { type: 'clean', label: 'clean', icon: '✦', desc: 'Normalize & deduplicate' },
  { type: 'train', label: 'train', icon: '◈', desc: 'Distributed model training' },
  { type: 'evaluate', label: 'eval', icon: '◉', desc: 'Score & compare models' },
  { type: 'deploy', label: 'deploy', icon: '↗', desc: 'Expose inference endpoint' },
  { type: 'custom', label: 'script', icon: '⟨⟩', desc: 'Custom script node' },
  { type: 'gate', label: 'gate', icon: '⑂', desc: 'Condition gate' },
]

// Node colours (light mode)
const nodeAccent = (type: string) => ({
  ingest: { border: 'border-blue-400', bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-600', dot: 'bg-blue-400' },
  clean: { border: 'border-emerald-400', bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600', dot: 'bg-emerald-400' },
  train: { border: 'border-violet-400', bg: 'bg-violet-50', icon: 'bg-violet-100 text-violet-600', dot: 'bg-violet-400' },
  evaluate: { border: 'border-amber-400', bg: 'bg-amber-50', icon: 'bg-amber-100 text-amber-600', dot: 'bg-amber-400' },
  deploy: { border: 'border-red-400', bg: 'bg-red-50', icon: 'bg-red-100 text-red-600', dot: 'bg-red-400' },
  custom: { border: 'border-gray-300', bg: 'bg-gray-50', icon: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  gate: { border: 'border-pink-400', bg: 'bg-pink-50', icon: 'bg-pink-100 text-pink-600', dot: 'bg-pink-400' },
}[type] ?? { border: 'border-gray-300', bg: 'bg-gray-50', icon: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' })

// ─── Selection & stats ────────────────────────────────────────────────────────
const selectedNodeId = ref<string | null>(null)
const selectedNode = computed(() => nodes.value.find(n => n.id === selectedNodeId.value) ?? null)
const successCount = computed(() => project.value?.runs?.filter(r => r.status === 'completed').length ?? 0)
const failCount = computed(() => project.value?.runs?.filter(r => r.status === 'failed').length ?? 0)

const statusColor = (s: string) => ({
  idle: 'text-gray-400', running: 'text-amber-500', completed: 'text-emerald-500', failed: 'text-red-500'
}[s] ?? 'text-gray-400')

const statusDotCss = (s: string) => ({
  idle: 'bg-gray-300', running: 'bg-amber-400 animate-pulse shadow-amber-300 shadow-md',
  completed: 'bg-emerald-400', failed: 'bg-red-400'
}[s] ?? 'bg-gray-300')

// ─── Node drag ────────────────────────────────────────────────────────────────
const draggingNodeId = ref<string | null>(null)
const dragOffset = ref({ x: 0, y: 0 })

const startNodeDrag = (e: MouseEvent, nodeId: string) => {
  if ((e.target as HTMLElement).closest('.port')) return
  draggingNodeId.value = nodeId
  selectedNodeId.value = nodeId
  const node = nodes.value.find(n => n.id === nodeId)!
  dragOffset.value = { x: e.clientX - node.x, y: e.clientY - node.y }
  window.addEventListener('mousemove', onNodeDragMove)
  window.addEventListener('mouseup', onNodeDragEnd)
}
const onNodeDragMove = (e: MouseEvent) => {
  if (!draggingNodeId.value || !project.value) return
  const node = project.value.nodes.find(n => n.id === draggingNodeId.value)
  if (!node) return
  node.x = Math.max(0, e.clientX - dragOffset.value.x)
  node.y = Math.max(0, e.clientY - dragOffset.value.y)
}
const onNodeDragEnd = () => {
  draggingNodeId.value = null; saveProject()
  window.removeEventListener('mousemove', onNodeDragMove)
  window.removeEventListener('mouseup', onNodeDragEnd)
}

// ─── Palette drag-drop ────────────────────────────────────────────────────────
const paletteDragType = ref<string | null>(null)
const onPaletteDragStart = (e: DragEvent, type: string) => {
  paletteDragType.value = type; e.dataTransfer?.setData('text/plain', type)
}
const onCanvasDrop = (e: DragEvent) => {
  if (!project.value) return
  const type = (e.dataTransfer?.getData('text/plain') ?? paletteDragType.value) as PipelineNode['type']
  if (!type) return
  const canvas = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const newNode: PipelineNode = {
    id: `node-${Date.now()}`, type, x: e.clientX - canvas.left - 90, y: e.clientY - canvas.top - 40,
    scripts: [], vm: 'shared-01', vmMode: 'shared', destBucket: `s3://${type}/`,
  }
  project.value.nodes.push(newNode)
  selectedNodeId.value = newNode.id
  saveProject(); paletteDragType.value = null
}

// ─── Add node via modal ───────────────────────────────────────────────────────
const showAddNode = ref(false)
const addNodeFromModal = (type: string) => {
  if (!project.value) return
  
  let node: PipelineNode
  if (splicingEdgeId.value) {
    const edge = project.value.edges.find(e => e.id === splicingEdgeId.value)
    if (edge) {
      const from = project.value.nodes.find(n => n.id === edge.fromNodeId)
      const to = project.value.nodes.find(n => n.id === edge.toNodeId)
      if (from && to) {
        node = {
          id: `node-${Date.now()}`, type: type as PipelineNode['type'],
          x: (from.x + to.x) / 2, y: (from.y + to.y) / 2,
          scripts: [], vm: 'shared-01', vmMode: 'shared', destBucket: `s3://${type}/`,
        }
        project.value.nodes.push(node)
        // Remove old edge, add two new ones
        project.value.edges = project.value.edges.filter(e => e.id !== splicingEdgeId.value)
        project.value.edges.push({ id: `edge-${Date.now()}-1`, fromNodeId: from.id, toNodeId: node.id })
        project.value.edges.push({ id: `edge-${Date.now()}-2`, fromNodeId: node.id, toNodeId: to.id })
        selectedNodeId.value = node.id
      }
    }
    splicingEdgeId.value = null
  } else {
    const last = project.value.nodes[project.value.nodes.length - 1]
    node = {
      id: `node-${Date.now()}`, type: type as PipelineNode['type'],
      x: last ? last.x + 210 : 60, y: last ? last.y : 100,
      scripts: [], vm: 'shared-01', vmMode: 'shared', destBucket: `s3://${type}/`,
    }
    project.value.nodes.push(node)
    if (last) project.value.edges.push({ id: `edge-${Date.now()}`, fromNodeId: last.id, toNodeId: node.id })
    selectedNodeId.value = node.id
  }
  
  showAddNode.value = false; saveProject()
}
const startSplice = (edgeId: string) => {
  splicingEdgeId.value = edgeId
  showAddNode.value = true
}

const deleteNode = (nodeId: string) => {
  if (!project.value) return
  project.value.nodes = project.value.nodes.filter(n => n.id !== nodeId)
  project.value.edges = project.value.edges.filter(e => e.fromNodeId !== nodeId && e.toNodeId !== nodeId)
  selectedNodeId.value = null; saveProject()
}

// ─── Edge drawing ─────────────────────────────────────────────────────────────
const edgesSvg = ref<SVGSVGElement | null>(null)
const drawingEdge = ref(false)
const drawingFromNodeId = ref<string | null>(null)
const hoveredEdgeId     = ref<string | null>(null)
const splicingEdgeId    = ref<string | null>(null)

const startEdgeDraw = (e: MouseEvent, nodeId: string) => {
  drawingEdge.value = true; drawingFromNodeId.value = nodeId
  window.addEventListener('mousemove', () => { })
  window.addEventListener('mouseup', onEdgeDrawEnd)
}
const onEdgeDrawEnd = () => {
  drawingEdge.value = false; drawingFromNodeId.value = null
  window.removeEventListener('mouseup', onEdgeDrawEnd)
}
const onPortConnect = (e: MouseEvent, toNodeId: string) => {
  if (!drawingEdge.value || !drawingFromNodeId.value || !project.value) return
  if (drawingFromNodeId.value !== toNodeId) {
    project.value.edges.push({ id: `edge-${Date.now()}`, fromNodeId: drawingFromNodeId.value, toNodeId })
  }
  drawingEdge.value = false; drawingFromNodeId.value = null; saveProject()
}

const NODE_W = 180; const NODE_H = 110
const computedEdges = computed(() => edges.value.map(edge => {
  const from = nodes.value.find(n => n.id === edge.fromNodeId)
  const to = nodes.value.find(n => n.id === edge.toNodeId)
  if (!from || !to) return null
  const x1 = from.x + NODE_W, y1 = from.y + NODE_H / 2, x2 = to.x, y2 = to.y + NODE_H / 2, cx = (x1 + x2) / 2
  return { 
    id: edge.id, 
    path: `M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}`,
    mx: (x1 + x2) / 2,
    my: (y1 + y2) / 2
  }
}).filter(Boolean))

// ─── Script modal ─────────────────────────────────────────────────────────────

// ─── Script modal ─────────────────────────────────────────────────────────────
const showScriptModal = ref(false)
const editingScript = ref<PipelineScript | null>(null)
const scriptFormNodeId = ref<string | null>(null)
const scriptFormNodeType = ref('')
const scriptForm = ref({
  routeTo: '',
  file: null as File | null
})

const onFileSelected = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    scriptForm.value.file = file
  }
}

const addScript = (nodeId: string) => {
  const node = nodes.value.find(n => n.id === nodeId); if (!node) return
  editingScript.value = null; scriptFormNodeId.value = nodeId; scriptFormNodeType.value = node.type
  scriptForm.value = { routeTo: '', file: null }; showScriptModal.value = true
}

const openScriptProps = (nodeId: string, scriptId: string) => {
  const node = nodes.value.find(n => n.id === nodeId)
  const script = node?.scripts.find(s => s.id === scriptId)
  if (!node || !script) return
  editingScript.value = script; scriptFormNodeId.value = nodeId; scriptFormNodeType.value = node.type
  scriptForm.value = { routeTo: script.routeTo ?? '', file: null }; showScriptModal.value = true
}
const saveScript = async () => {
  if (!scriptFormNodeId.value || !project.value) return
  const node = project.value.nodes.find(n => n.id === scriptFormNodeId.value); if (!node) return
  
  if (!scriptForm.value.file) {
    log('error', 'Please select a file to upload.')
    return
  }

  const formData = new FormData()
  formData.append('file', scriptForm.value.file)
  formData.append('node_id', scriptFormNodeId.value)
  formData.append('node_type', scriptFormNodeType.value)
  formData.append('route_to', scriptForm.value.routeTo)
  // Backend also checks 'name' and 'path' to decide if it's a file upload vs path string
  // but we want file upload, so we don't send those or we send them empty.

  log('info', `Initializing upload for [${scriptForm.value.file.name}]...`)
  try {
    const res = await apiClient.post(`/llm/training/jobs/${project.value.id}/scripts/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    if (res.data.upload_url) {
      log('info', `Uploading [${scriptForm.value.file.name}] to storage...`)
      await apiClient.put(res.data.upload_url.replace("/api/v1", ""), scriptForm.value.file, {
        headers: { 'Content-Type': scriptForm.value.file.type || 'application/octet-stream' }
      })
    }

    if (res.data.job) {
      project.value = res.data.job
    }
    
    log('info', `Script [${scriptForm.value.file.name}] uploaded successfully.`)
    showScriptModal.value = false
  } catch (e) {
    console.error('Upload failed', e)
    log('error', `Upload failed: ${e}`)
  }
}

const executeNode = async (nodeId: string) => {
  if (!project.value) return
  log('warn', `Executing node [${nodeId}] independently...`)
  try {
    await apiClient.post(`/llm/training/jobs/${project.value.id}/nodes/${nodeId}/execute`)
    log('info', `Node [${nodeId}] execution triggered successfully.`)
  } catch (e) {
    console.error('Failed to execute node', e)
    log('error', `Manual execution failed: ${e}`)
  }
}

const executeScript = async (nodeId: string, scriptId: string) => {
  if (!project.value) return
  const node = nodes.value.find(n => n.id === nodeId)
  const script = node?.scripts.find(s => s.id === scriptId)
  if (!script) return

  log('warn', `Executing script [${script.name}] in node [${nodeId}]...`)
  try {
    await apiClient.post(`/llm/training/jobs/${project.value.id}/nodes/${nodeId}/execute`, null, {
      params: { script_id: scriptId }
    })
    log('info', `Script [${script.name}] execution triggered successfully.`)
  } catch (e) {
    console.error('Failed to execute script', e)
    log('error', `Script execution failed: ${e}`)
  }
}

// ─── Run pipeline ─────────────────────────────────────────────────────────────
const running = ref(false)
const runLog = ref<LogEntry[]>([])
const activeBottomTab = ref<'RESOURCES' | 'RUN LOG' | 'ARTIFACTS'>('RESOURCES')
const log = (level: LogEntry['level'], msg: string) => runLog.value.unshift({ ts: new Date().toLocaleTimeString(), level, msg })

const runPipeline = () => {
  if (!project.value || running.value) return
  running.value = true; project.value.status = 'running'; project.value.lastRun = new Date().toISOString()
  activeBottomTab.value = 'RUN LOG'
  const run: PipelineRun = { id: `run-${Date.now()}`, status: 'running', startedAt: new Date().toISOString() }
  project.value.runs.unshift(run); saveProject()
  const ordered = [...project.value.nodes].sort((a, b) => a.x - b.x)
  let delay = 0
  for (const node of ordered) {
    const d = delay
    setTimeout(() => { log('info', `[${node.type.toUpperCase()}] starting · vm: ${node.vm}`) }, d)
    if (node.scripts.length) setTimeout(() => node.scripts.forEach(s => log('info', `  → ${s.name}`)), d + 200)
    delay += 900 + Math.random() * 500
    setTimeout(() => log('info', `[${node.type.toUpperCase()}] ✓ done`), delay)
    delay += 200
  }
  setTimeout(() => {
    if (!project.value) return
    run.status = 'completed'; run.finishedAt = new Date().toISOString()
    project.value.status = 'completed'; running.value = false
    log('info', '✓ pipeline completed'); saveProject()
  }, delay + 400)
}

// ─── Resource metrics (simulated) ────────────────────────────────────────────
const resourceMetrics = ref([
  { label: 'CPU', value: 0, tw: 'bg-blue-400' },
  { label: 'Memory', value: 0, tw: 'bg-violet-400' },
  { label: 'GPU', value: 0, tw: 'bg-amber-400' },
])
const activeVmCount = computed(() => running.value ? nodes.value.filter(n => n.vmMode === 'dedicated').length + 1 : 0)
let metricsTimer: ReturnType<typeof setInterval>
onMounted(() => {
  metricsTimer = setInterval(() => {
    if (running.value) {
      resourceMetrics.value[0].value = Math.min(95, resourceMetrics.value[0].value + Math.random() * 12 - 2)
      resourceMetrics.value[1].value = Math.min(90, resourceMetrics.value[1].value + Math.random() * 8 - 1)
      resourceMetrics.value[2].value = nodes.value.some(n => n.type === 'train') ? Math.min(100, resourceMetrics.value[2].value + Math.random() * 15) : 0
    } else {
      resourceMetrics.value[0].value = Math.max(0, resourceMetrics.value[0].value * 0.8)
      resourceMetrics.value[1].value = Math.max(0, resourceMetrics.value[1].value * 0.85)
      resourceMetrics.value[2].value = Math.max(0, resourceMetrics.value[2].value * 0.7)
    }
    resourceMetrics.value.forEach(m => { m.value = Math.round(m.value) })
  }, 900)
})
onUnmounted(() => clearInterval(metricsTimer))

// ─── Artifacts ────────────────────────────────────────────────────────────────
const artifacts = computed(() => project.value?.runs.filter(r => r.status === 'completed').map((r, i) => ({
  name: `model-v${project.value!.runs.length - i}.bin`,
  path: `s3://${project.value!.name.toLowerCase().replace(/\s+/g, '-')}/models/${r.id.slice(-6)}/`,
  size: `${Math.floor(Math.random() * 450 + 50)} MB`,
})) ?? [])

const bottomTabs = ['RESOURCES', 'RUN LOG', 'ARTIFACTS'] as const
const showHistory = ref(false)

const formatDate = (iso?: string) => iso ? new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'
</script>

<template>
  <div class="flex flex-col h-screen bg-white font-urbanist overflow-hidden text-[#232f3e]">

    <!-- ── Not Found ───────────────────────────────────────────────────────── -->
    <div v-if="notFound" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <h1 class="text-3xl font-black text-[#232f3e] uppercase tracking-tighter mb-3">Project Not Found</h1>
        <button @click="router.push('/sagemaker')"
          class="px-6 py-3 bg-[#ff9900] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#ec7211] transition-all">←
          Back to SageMaker</button>
      </div>
    </div>

    <template v-if="project">

      <!-- ══ TOP BAR ═══════════════════════════════════════════════════════════ -->
      <header class="flex items-center gap-3 h-12 px-4 bg-white border-b-2 border-[#eaeded] flex-shrink-0 z-20">

        <!-- Breadcrumb -->
        <nav class="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em]">
          <button @click="router.push('/sagemaker')"
            class="text-[#879196] hover:text-[#ff9900] transition-colors bg-transparent border-none cursor-pointer font-black uppercase tracking-[0.15em]">sagemaker</button>
          <span class="text-[#d1d5db]">›</span>
          <span class="text-[#879196]">projects</span>
          <span class="text-[#d1d5db]">›</span>
          <span class="text-[#ff9900]">{{ project.name }}</span>
        </nav>

        <!-- Status dot + name -->
        <div class="flex items-center gap-2 ml-2">
          <span class="w-2 h-2 rounded-full flex-shrink-0" :class="statusDotCss(project.status)"></span>
          <span class="text-xs font-bold text-[#232f3e]">{{ project.name }}</span>
        </div>

        <!-- Stat pills -->
        <div class="flex items-center gap-2 ml-2">
          <span
            class="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border border-[#eaeded] text-[#879196]">
            runs <span class="text-[#232f3e]">{{ project.runs?.length }}</span>
          </span>
          <span
            class="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border border-emerald-200 text-emerald-600">
            ok <span>{{ successCount }}</span>
          </span>
          <span class="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border border-red-200 text-red-500">
            fail <span>{{ failCount }}</span>
          </span>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 ml-auto">
          <button @click="showAddNode = true"
            class="px-3 py-1.5 border-2 border-[#232f3e] text-[#232f3e] text-[9px] font-black uppercase tracking-[0.15em] hover:bg-[#232f3e] hover:text-white transition-all flex items-center gap-1.5">
            + Node
          </button>
          <button @click="runPipeline" :disabled="running"
            class="px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-1.5 disabled:opacity-50"
            :class="running ? 'bg-[#232f3e] text-white' : 'bg-[#ff9900] text-white hover:bg-[#ec7211]'">
            <svg v-if="running" class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span v-else>▶</span>
            {{ running ? 'Running…' : 'Run Pipeline' }}
          </button>
        </div>
      </header>

      <!-- ══ WORKSPACE ══════════════════════════════════════════════════════════ -->
      <div class="flex flex-1 overflow-hidden">

        <!-- ── Palette (left) ── -->
        <aside
          class="w-14 bg-[#fafafa] border-r-2 border-[#eaeded] flex flex-col items-center py-3 gap-1 flex-shrink-0 z-10">
          <div v-for="pt in paletteTypes" :key="pt.type"
            class="w-10 h-10 flex flex-col items-center justify-center cursor-grab border border-transparent rounded hover:border-[#eaeded] hover:bg-white transition-all text-[#879196] hover:text-[#232f3e] select-none"
            :title="pt.desc" draggable="true" @dragstart="onPaletteDragStart($event, pt.type)">
            <span class="text-sm leading-none">{{ pt.icon }}</span>
            <span class="text-[7px] font-black uppercase tracking-wide mt-0.5 leading-none">{{ pt.label }}</span>
          </div>
        </aside>

        <!-- ── Canvas ── -->
        <section class="flex-1 relative overflow-hidden canvas-bg cursor-default" @dragover.prevent @drop="onCanvasDrop"
          @click.self="selectedNodeId = null">

          <!-- SVG edges -->
          <svg ref="edgesSvg" class="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
            <defs>
              <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5"
                orient="auto-start-reverse">
                <path d="M2 1L8 5L2 9" fill="none" stroke="#d1d5db" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </marker>
            </defs>
            <g v-for="edge in computedEdges" :key="edge?.id" class="pointer-events-auto group">
              <path v-if="edge" :d="edge.path" fill="none" stroke="#d1d5db" stroke-width="2" marker-end="url(#arr)" 
                class="hover:stroke-[#ff9900] transition-colors cursor-pointer" />
              <!-- Splice button on edge -->
              <circle v-if="edge" :cx="edge.mx" :cy="edge.my" r="8" fill="white" stroke="#eaeded" stroke-width="2" 
                class="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm hover:stroke-[#ff9900]"
                @click="startSplice(edge.id)" />
              <text v-if="edge" :x="edge.mx" :y="edge.my+3" text-anchor="middle" font-size="10" font-weight="900" fill="#232f3e"
                class="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none select-none">+</text>
            </g>
          </svg>

          <!-- Nodes -->
          <div v-for="node in nodes" :key="node.id"
            class="absolute w-[180px] bg-white rounded-lg border-2 cursor-move select-none transition-shadow duration-150 hover:shadow-lg"
            :class="[nodeAccent(node.type).border, selectedNodeId === node.id ? 'shadow-lg ring-2 ring-[#ff9900]/40' : 'shadow-sm']"
            :style="{ left: node.x + 'px', top: node.y + 'px' }" @click.stop="selectedNodeId = node.id"
            @mousedown="startNodeDrag($event, node.id)">

            <!-- Input port -->
            <div
              class="port absolute left-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-gray-300 hover:border-[#ff9900] hover:bg-amber-50 z-10 cursor-crosshair transition-colors"
              @mousedown.stop @mouseup="onPortConnect($event, node.id)"></div>

            <!-- Node header -->
            <div class="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
              <div class="w-6 h-6 rounded flex items-center justify-center text-xs flex-shrink-0"
                :class="nodeAccent(node.type).icon">
                {{ { ingest: '⬇', clean: '✦', train: '◈', evaluate: '◉', deploy: '↗', custom: '⟨⟩', gate: '⑂' }[node.type] ??
                '◆' }}
              </div>
              <span class="text-[10px] font-black uppercase tracking-wider text-[#232f3e] flex-1">{{ node.type }}</span>
              <span
                class="text-[8px] font-mono text-[#879196] bg-gray-50 px-1.5 py-0.5 rounded truncate max-w-[60px]">{{
                  node.vm ?? 'shared' }}</span>
            </div>

            <!-- Scripts -->
            <div class="px-2 py-1.5">
              <div v-for="script in node.scripts" :key="script.id"
                class="flex items-center justify-between px-2 py-1 mb-1 rounded bg-gray-50 border border-transparent hover:border-[#ff9900/30] group/script transition-all"
                @click.stop="openScriptProps(node.id, script.id)">
                <div class="flex items-center gap-1.5 min-w-0">
                  <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" :class="nodeAccent(node.type).dot"></span>
                  <span class="text-[9px] font-mono text-[#545b64] flex-1 truncate">{{ script.name }}</span>
                </div>
                <button @click.stop="executeScript(node.id, script.id)"
                  class="opacity-0 group-hover/script:opacity-100 hover:text-[#ff9900] transition-all p-0.5"
                  title="Execute script">
                  <svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                </button>
              </div>
              <button
                class="flex items-center gap-1 text-[9px] text-[#879196] hover:text-[#ff9900] transition-colors mt-1 px-2 font-black uppercase tracking-wide"
                @click.stop="addScript(node.id)">
                + add script
              </button>
            </div>

            <!-- Footer: dest bucket -->
            <div class="px-3 pb-2">
              <span class="text-[8px] font-mono text-[#d1d5db] truncate block">{{ node.destBucket ??
                's3://' +node.type+'/' }}</span>
            </div>

            <!-- Output port -->
            <div
              class="port absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-gray-300 hover:border-[#ff9900] hover:bg-amber-50 z-10 cursor-crosshair transition-colors"
              @mousedown.stop="startEdgeDraw($event, node.id)"></div>
          </div>

          <!-- Empty canvas hint -->
          <div v-if="nodes.length === 0"
            class="absolute inset-0 flex flex-col items-center justify-center text-[#d1d5db] pointer-events-none gap-3">
            <span class="text-4xl">⬡</span>
            <p class="text-[10px] font-black uppercase tracking-[0.2em]">Drag nodes from the palette to build your
              pipeline</p>
          </div>

          <!-- Bottom hint -->
          <div
            class="absolute bottom-3 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-[0.2em] text-[#d1d5db] pointer-events-none whitespace-nowrap">
            DRAG PALETTE → CANVAS · CLICK NODE TO CONFIGURE · DRAG PORT TO CONNECT
          </div>
        </section>

        <!-- ── Properties Panel ── -->
        <Transition name="slide-right">
          <aside v-if="selectedNode" class="w-64 bg-white border-l-2 border-[#eaeded] flex flex-col flex-shrink-0 overflow-y-auto z-10" @click.stop>

            <!-- Header -->
            <div class="px-4 py-3 border-b-2 border-[#eaeded]">
              <p class="text-[9px] font-black uppercase tracking-[0.2em] text-[#ff9900] mb-1">NODE CONFIGURATION</p>
              <input v-model="selectedNode.label" placeholder="Rename node..."
                @change="saveProject"
                class="w-full text-sm font-black text-[#232f3e] focus:outline-none focus:text-[#ff9900] bg-transparent border-none p-0" />
            </div>

            <!-- Basic Info -->
            <div class="px-4 py-3 border-b border-[#f0f0f0] space-y-3">
              <div>
                <p class="text-[9px] font-black uppercase tracking-[0.2em] text-[#879196] mb-1.5">Node Type</p>
                <select v-model="selectedNode.type" @change="saveProject"
                  class="w-full px-2 py-1.5 border border-[#eaeded] text-[9px] font-black uppercase tracking-wider text-[#232f3e] focus:border-[#ff9900] transition-colors bg-[#fafafa]">
                  <option v-for="pt in paletteTypes" :key="pt.type" :value="pt.type">{{ pt.label }}</option>
                </select>
              </div>

              <div>
                <p class="text-[9px] font-black uppercase tracking-[0.2em] text-[#879196] mb-1.5">Schedule & Triggers</p>
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-[9px] text-[#232f3e] font-black uppercase tracking-wide">Cascade Run</span>
                    <button
                      @click="selectedNode.cascade = !selectedNode.cascade; saveProject()"
                      class="w-8 h-4 rounded-full transition-colors relative"
                      :class="selectedNode.cascade ? 'bg-[#ff9900]' : 'bg-[#eaeded]'"
                    >
                      <span class="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all" :class="selectedNode.cascade ? 'left-4' : 'left-0.5'"></span>
                    </button>
                  </div>
                  <input v-model="selectedNode.schedule" @change="saveProject" placeholder="Schedule (e.g. 1h, 1am)"
                    class="w-full px-2 py-1.5 border border-[#eaeded] text-[9px] font-mono text-[#232f3e] focus:outline-none focus:border-[#ff9900] transition-colors bg-[#fafafa]" />
                </div>
              </div>
            </div>

            <!-- Scripts & Routes -->
            <div class="px-4 py-3 border-b border-[#f0f0f0]">
              <p class="text-[9px] font-black uppercase tracking-[0.2em] text-[#879196] mb-2">Scripts & Routes</p>
              <div v-for="script in selectedNode.scripts" :key="script.id" class="mb-2 bg-[#fafafa] rounded p-2 group/prop">
                <div class="flex items-center justify-between mb-1">
                  <p class="text-[10px] font-mono text-[#232f3e] truncate mr-2">{{ script.name }}</p>
                  <button @click="executeScript(selectedNode.id, script.id)"
                    class="opacity-0 group-hover/prop:opacity-100 text-[#545b64] hover:text-[#ff9900] transition-all"
                    title="Execute script">
                    <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  </button>
                </div>
                <div class="flex items-center gap-1 text-[9px] font-mono text-[#879196]">
                  <span>→</span>
                  <span class="text-emerald-500 truncate">{{ script.routeTo ?? '(default)' }}</span>
                </div>
              </div>
              <button class="w-full mt-1 py-1.5 border border-dashed border-[#eaeded] text-[9px] font-black uppercase tracking-[0.15em] text-[#879196] hover:border-[#ff9900] hover:text-[#ff9900] transition-all flex items-center justify-center gap-1"
                @click="addScript(selectedNode.id)">
                + ADD SCRIPT
              </button>
            </div>

            <!-- Storage & Backend -->
            <div class="px-4 py-3 border-b border-[#f0f0f0]">
              <p class="text-[9px] font-black uppercase tracking-[0.2em] text-[#879196] mb-2">Storage Destination</p>
              <input v-model="selectedNode.destBucket" @change="saveProject" placeholder="s3://target-bucket/"
                class="w-full px-2 py-1.5 border border-[#eaeded] text-[9px] font-mono text-[#232f3e] focus:outline-none focus:border-[#ff9900] transition-colors bg-[#fafafa]" />
            </div>

            <!-- Status & Execution Info -->
            <div class="px-4 py-3 border-b border-[#f0f0f0] space-y-2">
              <p class="text-[9px] font-black uppercase tracking-[0.2em] text-[#879196]">Runtime Info</p>
              <div class="flex justify-between items-center text-[9px]">
                <span class="text-[#879196] uppercase font-black tracking-wide">Status</span>
                <span class="font-bold uppercase tracking-tight" :class="statusColor(selectedNode.status || 'idle')">{{ selectedNode.status || 'idle' }}</span>
              </div>
              <div class="flex justify-between items-center text-[9px]">
                <span class="text-[#879196] uppercase font-black tracking-wide">Started</span>
                <span class="font-mono text-[#545b64]">{{ formatDate(selectedNode.started_at) }}</span>
              </div>
              <div class="flex justify-between items-center text-[9px]">
                <span class="text-[#879196] uppercase font-black tracking-wide">Finished</span>
                <span class="font-mono text-[#545b64]">{{ formatDate(selectedNode.finished_at) }}</span>
              </div>
            </div>

            <!-- Execute & Delete -->
            <div class="px-4 py-3 space-y-2 mt-auto text-center border-t-2 border-[#eaeded] bg-[#fafafa]">
              <button class="w-full py-2.5 bg-[#232f3e] text-white text-[9px] font-black uppercase tracking-[0.18em] hover:bg-[#ff9900] transition-all flex items-center justify-center gap-1.5 shadow-sm"
                @click="executeNode(selectedNode.id)">
                ▶ Execute Node
              </button>
              <button class="w-full py-2 border border-red-200 text-red-500 text-[8px] font-black uppercase tracking-[0.15em] hover:bg-red-50 transition-all flex items-center justify-center gap-1"
                @click="deleteNode(selectedNode.id)">
                ✕ Remove Node
              </button>
            </div>

          </aside>
        </Transition>

      </div><!-- end workspace -->

      <!-- ══ BOTTOM PANEL ═══════════════════════════════════════════════════════ -->
      <footer class="flex-shrink-0 h-28 bg-white border-t-2 border-[#eaeded] flex flex-col z-10">

        <!-- Tabs -->
        <div class="flex border-b border-[#eaeded]">
          <button v-for="tab in bottomTabs" :key="tab"
            class="px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] border-none border-b-2 transition-all -mb-px cursor-pointer bg-transparent"
            :class="activeBottomTab === tab ? 'border-[#ff9900] text-[#ff9900]' : 'border-transparent text-[#879196] hover:text-[#232f3e]'"
            @click="activeBottomTab = (tab as any)">
            {{ tab }}
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 flex items-center gap-6 px-5 overflow-hidden">

          <!-- Resources -->
          <template v-if="activeBottomTab === 'RESOURCES'">
            <div v-for="m in resourceMetrics" :key="m.label" class="flex flex-col gap-1 min-w-[100px]">
              <div class="flex justify-between text-[9px] font-black uppercase tracking-wide">
                <span class="text-[#879196]">{{ m.label }}</span>
                <span class="text-[#232f3e]">{{ m.value }}%</span>
              </div>
              <div class="h-3 bg-[#f0f0f0] rounded overflow-hidden">
                <div class="h-full rounded transition-all duration-500" :class="m.tw" :style="{ width: m.value + '%' }">
                </div>
              </div>
            </div>
            <div class="ml-auto flex gap-6">
              <div class="flex flex-col items-center">
                <span class="text-xl font-black text-[#232f3e] leading-tight">{{ activeVmCount }}</span>
                <span class="text-[8px] font-black uppercase tracking-widest text-[#879196]">VMs Active</span>
              </div>
              <div class="flex flex-col items-center">
                <span class="text-sm font-black leading-tight"
                  :class="running ? 'text-amber-500' : 'text-emerald-500'">{{ running ? 'running' : 'idle' }}</span>
                <span class="text-[8px] font-black uppercase tracking-widest text-[#879196]">Status</span>
              </div>
            </div>
          </template>

          <!-- Run log -->
          <template v-else-if="activeBottomTab === 'RUN LOG'">
            <div class="flex flex-col gap-1 flex-1 overflow-y-auto h-full py-1.5">
              <div v-for="entry in runLog" :key="entry.ts" class="flex gap-2 text-[9px] items-baseline font-mono">
                <span class="text-[#d1d5db] flex-shrink-0">{{ entry.ts }}</span>
                <span class="flex-shrink-0 px-1 rounded text-[8px]"
                  :class="{ 'bg-blue-50 text-blue-500': entry.level === 'info', 'bg-amber-50 text-amber-500': entry.level === 'warn', 'bg-red-50 text-red-500': entry.level === 'error' }">
                  {{ entry.level }}
                </span>
                <span class="text-[#545b64]">{{ entry.msg }}</span>
              </div>
              <div v-if="!runLog.length" class="text-[9px] font-mono text-[#d1d5db]">no log entries yet — run the
                pipeline first</div>
            </div>
          </template>

          <!-- Artifacts -->
          <template v-else-if="activeBottomTab === 'ARTIFACTS'">
            <div class="flex flex-col gap-1.5 flex-1 overflow-y-auto h-full py-1.5">
              <div v-for="art in artifacts" :key="art.name" class="flex items-center gap-3 text-[9px]">
                <span class="text-[#879196]">📦</span>
                <span class="font-mono font-bold text-[#232f3e]">{{ art.name }}</span>
                <span class="font-mono text-[#879196] flex-1 truncate">{{ art.path }}</span>
                <span class="text-[#879196] flex-shrink-0">{{ art.size }}</span>
              </div>
              <div v-if="!artifacts.length" class="text-[9px] font-mono text-[#d1d5db]">run the pipeline to generate
                artifacts</div>
            </div>
          </template>

        </div>
      </footer>

    </template><!-- end v-if project -->

    <!-- ══ ADD NODE MODAL ═════════════════════════════════════════════════════ -->
    <Transition name="fade">
      <div v-if="showAddNode"
        class="fixed inset-0 z-[200] flex items-center justify-center bg-[#232f3e]/50 backdrop-blur-sm p-6"
        @click.self="showAddNode = false">
        <div class="bg-white border-2 border-[#232f3e] w-full max-w-md shadow-2xl">
          <div class="flex items-center justify-between px-6 py-4 border-b-2 border-[#eaeded]">
            <div>
              <p class="text-[9px] font-black uppercase tracking-[0.2em] text-[#ff9900]">Pipeline</p>
              <h3 class="text-lg font-black text-[#232f3e] uppercase tracking-tighter">Add Node</h3>
            </div>
            <button @click="showAddNode = false"
              class="text-[#879196] hover:text-[#232f3e] transition-colors bg-transparent border-none cursor-pointer text-lg">✕</button>
          </div>
          <div class="p-6 grid grid-cols-2 gap-3">
            <div v-for="pt in paletteTypes" :key="pt.type"
              class="p-4 border-2 border-[#eaeded] hover:border-[#ff9900] cursor-pointer transition-all group"
              @click="addNodeFromModal(pt.type)">
              <p class="text-lg mb-1">{{ pt.icon }}</p>
              <p
                class="text-[10px] font-black uppercase tracking-wider text-[#232f3e] group-hover:text-[#ff9900] transition-colors">
                {{ pt.label }}</p>
              <p class="text-[9px] text-[#879196] mt-0.5">{{ pt.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ══ SCRIPT MODAL ═══════════════════════════════════════════════════════ -->
    <Transition name="fade">
      <div v-if="showScriptModal"
        class="fixed inset-0 z-[200] flex items-center justify-center bg-[#232f3e]/50 backdrop-blur-sm p-6"
        @click.self="showScriptModal = false">
        <div class="bg-white border-2 border-[#232f3e] w-full max-w-sm shadow-2xl">
          <div class="flex items-center justify-between px-6 py-4 border-b-2 border-[#eaeded]">
            <div>
              <p class="text-[9px] font-black uppercase tracking-[0.2em] text-[#ff9900]">Script</p>
              <h3 class="text-lg font-black text-[#232f3e] uppercase tracking-tighter">{{ editingScript ? 'Edit' : 'Add'
                }}
                Script</h3>
            </div>
            <button @click="showScriptModal = false"
              class="text-[#879196] hover:text-[#232f3e] transition-colors bg-transparent border-none cursor-pointer text-lg">✕</button>
          </div>
          <div class="px-6 py-4 space-y-4">
            <div>
              <p class="text-[9px] font-black uppercase tracking-[0.18em] text-amber-600 mb-2">FILE-ONLY UPLOAD</p>
              <label class="block text-[9px] font-black uppercase tracking-[0.18em] text-[#545b64] mb-1.5">Select Script</label>
              <div class="border-2 border-dashed border-[#eaeded] rounded-lg p-6 text-center hover:border-[#ff9900] transition-all cursor-pointer relative"
                @click="$refs.fileInput.click()">
                <input type="file" ref="fileInput" class="hidden" @change="onFileSelected" />
                <p class="text-xs font-bold text-[#232f3e]">{{ scriptForm.file?.name || 'Click to select script file' }}</p>
                <p class="text-[9px] text-[#879196] mt-1 uppercase tracking-widest">{{ scriptForm.file ? (scriptForm.file.size / 1024).toFixed(1) + ' KB' : 'Python, JS, or Shell' }}</p>
              </div>
            </div>

            <div v-if="scriptFormNodeType === 'ingest'">
              <label class="block text-[9px] font-black uppercase tracking-[0.18em] text-[#545b64] mb-1.5">Routes to cleaner</label>
              <select v-model="scriptForm.routeTo" class="w-full px-3 py-2.5 border-2 border-[#eaeded] text-sm text-[#232f3e] focus:outline-none focus:border-[#ff9900] transition-colors bg-white font-mono">
                <option value="">(none — use default)</option>
                <option v-for="cs in nodes.find(n => n.type==='clean')?.scripts ?? []" :key="cs.id" :value="cs.name">{{ cs.name }}</option>
              </select>
            </div>
          </div>
          <div class="flex gap-3 px-6 pb-6">
            <button @click="showScriptModal = false"
              class="flex-1 py-2.5 border-2 border-[#232f3e] text-[#232f3e] text-[9px] font-black uppercase tracking-[0.18em] hover:bg-gray-50 transition-all">Cancel</button>
            <button @click="saveScript" :disabled="!scriptForm.file" class="flex-1 py-2.5 bg-[#ff9900] text-white text-[9px] font-black uppercase tracking-[0.18em] hover:bg-[#ec7211] transition-all disabled:opacity-40">
              {{ editingScript ? 'Save' : 'Upload Script' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
/* Canvas dot-grid background — only thing we can't do cleanly in Tailwind */
.canvas-bg {
  background-image:
    radial-gradient(circle, #d1d5db 1px, transparent 1px);
  background-size: 24px 24px;
  background-color: #f9fafb;
}

/* Port positioning needs absolute — easiest here */
.port {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 5;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(16px);
  opacity: 0;
}
</style>