<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '@/shared/api/apiClient'

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
    projects.value = res.data || []
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

// ─── Create Project Modal ────────────────────────────────────────────────────
const showCreateModal = ref(false)
const allStages = ['ingest', 'clean', 'train', 'evaluate', 'deploy']
const newProject = ref({
  name: '',
  description: '',
  tags: '',
  pipeline: ['ingest', 'clean', 'train', 'evaluate', 'deploy'] as string[]
})

const toggleStage = (stage: string) => {
  const idx = newProject.value.pipeline.indexOf(stage)
  if (idx === -1) newProject.value.pipeline.push(stage)
  else newProject.value.pipeline.splice(idx, 1)
}

const createProject = async () => {
  if (!newProject.value.name.trim()) return
  const proj: SageMakerProject = {
    id: `proj-${Date.now()}`,
    name: newProject.value.name.trim(),
    description: newProject.value.description.trim(),
    pipeline: [...newProject.value.pipeline],
    tags: newProject.value.tags.split(',').map(t => t.trim()).filter(Boolean),
    createdAt: new Date().toISOString(),
    status: 'idle',
    runs: [],
    datasources: []
  }
  
  try {
    await apiClient.post("/llm/training/jobs", proj)
    await loadProjects()
    showCreateModal.value = false
    newProject.value = { name: '', description: '', tags: '', pipeline: [...allStages] }
  } catch (e) {
    console.error('Failed to create project', e)
  }
}







// ─── Models & Training Jobs ──────────────────────────────────────────────────
const models = ref<any[]>([])
const trainingJobs = ref<any[]>([])
const loadingJobs = ref(false)

const fetchModels = async () => {
  try {
    const res = await apiClient.get('/llm/models')
    models.value = res.data || []
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
</script>

<template>
  <div class="min-h-screen pb-24 relative overflow-hidden bg-white font-urbanist selection:bg-[#ff9900]/30 selection:text-[#232f3e]">
    <!-- Subtle Grid -->
    <div class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none [mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)]"></div>

    <!-- ───── HEADER ─────────────────────────────────────────────────────── -->
    <header class="relative z-10 px-8 md:px-24 pt-20">
      <div class="max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <div class="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-white border border-[#ff9900]/30 text-[#ff9900] text-[10px] font-black tracking-[0.2em] uppercase">
            ML Orchestration Platform
          </div>
          <h1 class="text-5xl font-black text-[#232f3e] uppercase tracking-tighter leading-none mb-3">
            Sage<span class="text-[#ff9900]">Maker</span>
          </h1>
          <p class="text-[#545b64] text-lg font-medium italic">Schedule jobs · Provision workers · Track artifacts · Monitor pipelines</p>
        </div>
        <div class="flex gap-4">
          <button @click="router.push('/docs')"
            class="px-6 py-3 bg-white border-2 border-[#232f3e] text-[#232f3e] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#232f3e] hover:text-white transition-all transform active:scale-95">
            Documentation
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
          <div class="absolute top-0 right-0 w-16 h-16 bg-[#ff9900]/5 -rotate-45 translate-x-8 -translate-y-8 transition-transform group-hover:scale-150"></div>
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
            ]" :key="tab.id"
              @click="activeTab = (tab.id as any)"
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
                <p class="text-[10px] text-[#879196] mt-1 font-black uppercase tracking-widest italic">2 most recently active</p>
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
                <div class="absolute top-0 right-0 w-24 h-24 bg-[#ff9900]/5 -rotate-45 translate-x-12 -translate-y-12 transition-transform group-hover:scale-150"></div>

                <div class="relative z-10">
                  <!-- Status + title -->
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center gap-3">
                      <div class="w-2.5 h-2.5 rounded-full" :class="statusDot(project.status)"></div>
                      <h3 class="text-base font-black text-[#232f3e] uppercase tracking-tight group-hover:text-[#ff9900] transition-colors">{{ project.name }}</h3>
                    </div>
                    <div class="p-2 border-2 border-[#eaeded] group-hover:bg-[#ff9900] group-hover:border-[#ff9900] group-hover:text-white transition-all">
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
                    <span class="text-[9px] font-black text-[#879196] uppercase tracking-widest">Last run: {{ formatDate(project.lastRun) }}</span>
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
              <div v-if="recentProjects.length === 0" class="col-span-full bg-[#fafafa] p-16 border-2 border-dashed border-[#eaeded] text-center">
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
                      <p class="text-sm font-black text-[#232f3e] uppercase tracking-tight group-hover:text-[#ff9900] transition-colors">{{ project.name }}</p>
                      <p class="text-[10px] text-[#879196] font-bold">{{ project.pipeline?.join(' → ') }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-6">
                    <span class="text-[9px] font-black text-[#879196] uppercase tracking-widest">{{ formatDate(project.lastRun) }}</span>
                    <div class="px-2 py-1 text-[8px] font-black uppercase tracking-widest" :class="stageColor(project.status)">
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
                <p class="text-[10px] text-[#879196] mt-1 font-black uppercase tracking-widest italic">Registered GGUF models</p>
              </div>
              <button @click="router.push('/models/register')"
                class="px-6 py-3 bg-[#ff9900] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#ec7211] transition-all flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Upload GGUF
              </button>
            </div>
            <div v-if="models.length" class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div v-for="m in models" :key="m.ID"
                @click="router.push(`/models/${m.ID}`)"
                class="p-6 bg-white border-2 border-[#eaeded] hover:border-[#ff9900] cursor-pointer transition-all group">
                <h3 class="font-black text-[#232f3e] uppercase tracking-tight group-hover:text-[#ff9900] transition-colors">{{ m.Name }}</h3>
                <p class="text-[10px] text-[#879196] font-bold uppercase tracking-widest mt-1">GGUF Model</p>
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
                <p class="text-[10px] text-[#879196] mt-1 font-black uppercase tracking-widest italic">{{ trainingJobs.length }} jobs total</p>
              </div>
              <button @click="router.push('/training/new')"
                class="px-6 py-3 bg-[#232f3e] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#1a2530] transition-all">
                New Job
              </button>
            </div>
            <div v-if="trainingJobs.length" class="space-y-4">
              <div v-for="job in trainingJobs" :key="job.id"
                @click="router.push(`/training/jobs/${job.id}`)"
                class="px-6 py-5 bg-white border-2 border-[#eaeded] hover:border-[#ff9900] cursor-pointer transition-all group flex items-center justify-between">
                <div>
                  <h3 class="font-black text-[#232f3e] uppercase tracking-tight group-hover:text-[#ff9900] transition-colors">{{ job.name }}</h3>
                  <div class="mt-3 w-48 bg-[#eaeded] h-1.5">
                    <div class="h-1.5 bg-[#ff9900] transition-all" :style="{ width: (job.progress ?? 0) + '%' }"></div>
                  </div>
                  <p class="text-[9px] text-[#879196] font-black uppercase tracking-widest mt-1">{{ job.progress ?? 0 }}% complete</p>
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
                <p class="text-[10px] text-[#879196] mt-2 font-black uppercase tracking-widest italic">Runs per day · last 14 days</p>
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
              <div class="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[9px] text-[#879196] font-black">
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
                  <div class="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-2 bg-[#232f3e] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 min-w-[80px] text-center">
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
                <span class="text-[9px] font-black uppercase tracking-widest" :class="svc.ok ? 'text-emerald-600' : 'text-red-600'">{{ svc.status }}</span>
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
              <div class="absolute left-0 top-0 w-1 h-full bg-[#ff9900] -translate-x-full group-hover:translate-x-0 transition-all"></div>
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

    <!-- ═══ CREATE PROJECT MODAL ═══════════════════════════════════════════ -->
    <Transition name="fade">
      <div v-if="showCreateModal"
        class="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#232f3e]/60 backdrop-blur-md"
        @click.self="showCreateModal = false">
        <div class="bg-white border-2 border-[#232f3e] w-full max-w-2xl overflow-hidden shadow-2xl relative font-urbanist">
          <div class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none opacity-50"></div>

          <!-- Modal header -->
          <div class="p-10 border-b border-[#eaeded] bg-[#fafafa] flex justify-between items-center">
            <div>
              <h3 class="text-3xl font-black text-[#232f3e] uppercase tracking-tighter italic">
                New <span class="text-[#ff9900]">Project</span>
              </h3>
              <p class="text-[#545b64] text-sm font-bold uppercase tracking-[0.2em] mt-1">Configure your ML pipeline</p>
            </div>
            <button @click="showCreateModal = false"
              class="p-3 bg-white border border-[#eaeded] hover:border-[#ff9900] text-[#232f3e] hover:text-[#ff9900] transition-all">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Fields -->
          <div class="p-10 space-y-6">
            <div>
              <label class="block text-[9px] font-black uppercase tracking-[0.18em] text-[#545b64] mb-1.5">Project Name *</label>
              <input v-model="newProject.name" type="text" placeholder="e.g. Kalshi Prediction Market"
                class="w-full px-4 py-3 border-2 border-[#eaeded] text-sm text-[#232f3e] font-medium focus:outline-none focus:border-[#ff9900] transition-colors" />
            </div>
            <div>
              <label class="block text-[9px] font-black uppercase tracking-[0.18em] text-[#545b64] mb-1.5">Description</label>
              <textarea v-model="newProject.description" rows="2" placeholder="What will this pipeline do?"
                class="w-full px-4 py-3 border-2 border-[#eaeded] text-sm text-[#232f3e] font-medium focus:outline-none focus:border-[#ff9900] transition-colors resize-none"></textarea>
            </div>
            <div>
              <label class="block text-[9px] font-black uppercase tracking-[0.18em] text-[#545b64] mb-1.5">Tags (comma separated)</label>
              <input v-model="newProject.tags" type="text" placeholder="e.g. nlp, ensemble, real-time"
                class="w-full px-4 py-3 border-2 border-[#eaeded] text-sm text-[#232f3e] font-medium focus:outline-none focus:border-[#ff9900] transition-colors" />
            </div>
            <div>
              <label class="block text-[9px] font-black uppercase tracking-[0.18em] text-[#545b64] mb-3">Pipeline Stages</label>
              <div class="flex flex-wrap gap-3">
                <button v-for="stage in allStages" :key="stage"
                  @click="toggleStage(stage)"
                  class="px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] border-2 transition-all"
                  :class="newProject.pipeline.includes(stage)
                    ? 'bg-[#ff9900] border-[#ff9900] text-white'
                    : 'bg-white border-[#eaeded] text-[#879196] hover:border-[#ff9900]'">
                  {{ stage }}
                </button>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-4 px-10 pb-10">
            <button @click="showCreateModal = false"
              class="flex-1 px-4 py-3 border-2 border-[#232f3e] text-[#232f3e] text-[9px] font-black uppercase tracking-[0.18em] hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button @click="createProject"
              :disabled="!newProject.name.trim()"
              class="flex-1 px-4 py-3 bg-[#ff9900] text-white text-[9px] font-black uppercase tracking-[0.18em] hover:bg-[#ec7211] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              Create Project
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