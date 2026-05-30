<template>
  <div class="flex flex-col h-screen bg-[#070a10] text-[#e2e8f0] overflow-hidden" style="font-family:'Space Mono',monospace">

    <!-- ══ TOP BAR ══════════════════════════════════════════════════════════ -->
    <header class="flex items-center gap-3 px-5 h-13 bg-[#0a0e17] border-b border-[#1a2235] shrink-0 z-20">

      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-[10px]">
        <button @click="router.push('/render')" class="text-[#4a5568] hover:text-[#ff9900] transition-colors">render</button>
        <span class="text-[#1a2235]">›</span>
        <span class="text-[#ff9900]">new job</span>
      </nav>

      <!-- Job name input -->
      <input
        v-model="jobName"
        type="text"
        placeholder="untitled-render-job"
        class="ml-3 bg-transparent border-b border-[#1a2235] focus:border-[#ff9900] text-[11px] text-[#e2e8f0] outline-none px-1 py-0.5 w-44 placeholder-[#2a3548] transition-colors"
      />

      <!-- Status chips -->
      <div class="flex items-center gap-2 ml-4">
        <span class="flex items-center gap-1.5 px-2 py-0.5 border border-[#10b98133] bg-[#10b98108] text-[#10b981] text-[9px] tracking-widest">
          <span class="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span>WORKERS READY
        </span>
        <span class="flex items-center gap-1.5 px-2 py-0.5 border border-[#ff990033] bg-[#ff990008] text-[#ff9900] text-[9px] tracking-widest">
          <span class="w-1.5 h-1.5 rounded-full bg-[#ff9900]"></span>QUEUE OPEN
        </span>
        <span class="px-2 py-0.5 border border-[#1a2235] text-[#4a5568] text-[9px] tracking-widest">12 NODES</span>
      </div>

      <!-- Meta pills -->
      <div class="flex items-center gap-3 ml-4 text-[9px]">
        <span class="text-[#2a3548]">EST COST <span class="text-[#e2e8f0]">${{ estimatedCost }}</span></span>
        <span class="text-[#2a3548]">RUNTIME <span class="text-[#e2e8f0]">{{ runtime }}</span></span>
        <span class="text-[#2a3548]">PRIORITY <span class="text-[#ff9900]">{{ priority }}</span></span>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2 ml-auto">
        <button @click="router.push('/render')" class="px-4 py-1.5 border border-[#1a2235] text-[#4a5568] text-[9px] tracking-widest hover:border-[#2a3548] hover:text-[#9ca3af] transition-colors">
          CANCEL
        </button>
        <button class="px-4 py-1.5 border border-[#1a2235] text-[#9ca3af] text-[9px] tracking-widest hover:border-[#ff9900] hover:text-[#ff9900] transition-colors">
          SAVE PRESET
        </button>
        <button class="px-4 py-1.5 border border-[#1a2235] text-[#9ca3af] text-[9px] tracking-widest hover:border-[#ff9900] hover:text-[#ff9900] transition-colors">
          QUEUE JOB
        </button>
        <button
          @click="launchRender"
          :disabled="launching"
          class="group relative flex items-center gap-2 px-5 py-1.5 bg-[#ff9900] text-[#070a10] text-[9px] font-bold tracking-widest hover:bg-[#ffaa22] transition-colors overflow-hidden disabled:opacity-50"
        >
          <span class="absolute inset-0 bg-white/10 translate-x-full group-hover:translate-x-0 transition-transform duration-500 skew-x-12"></span>
          <svg v-if="launching" class="w-3 h-3 animate-spin relative z-10" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          <span v-else class="relative z-10">▶</span>
          <span class="relative z-10">{{ launching ? 'LAUNCHING…' : 'LAUNCH RENDER' }}</span>
        </button>
      </div>
    </header>

    <!-- ══ WORKSPACE ════════════════════════════════════════════════════════ -->
    <div class="flex flex-1 overflow-hidden">

      <!-- ── LEFT SIDEBAR — Assets ── -->
      <aside class="w-56 bg-[#0a0e17] border-r border-[#1a2235] flex flex-col shrink-0 overflow-y-auto z-10">

        <!-- Analyze button -->
        <button class="flex items-center gap-2 mx-3 mt-3 mb-2 px-3 py-2 border border-[#ff990033] text-[#ff9900] text-[9px] tracking-widest hover:bg-[#ff990010] transition-colors">
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
          </svg>
          ANALYZE SCENE
        </button>

        <!-- Asset sections -->
        <div v-for="section in assetSections" :key="section.label" class="mb-1">
          <button
            @click="section.open = !section.open"
            class="flex items-center gap-2 w-full px-4 py-2 text-[9px] tracking-widest text-[#4a5568] hover:text-[#9ca3af] transition-colors"
          >
            <svg class="w-2.5 h-2.5 transition-transform" :class="section.open ? 'rotate-90' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            {{ section.label }}
            <span class="ml-auto text-[#2a3548]">{{ section.files.length }}</span>
          </button>

          <div v-if="section.open" class="px-3 pb-1">
            <div
              v-for="file in section.files"
              :key="file.name"
              class="flex items-center gap-2 px-2 py-1.5 hover:bg-[#111827] rounded cursor-pointer group"
            >
              <svg class="w-3 h-3 shrink-0" :class="fileIconColor(file.state)" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <div class="flex-1 min-w-0">
                <p class="text-[10px] text-[#9ca3af] truncate">{{ file.name }}</p>
                <div class="flex items-center gap-2 mt-0.5">
                  <div class="flex-1 h-0.5 bg-[#1a2235] rounded overflow-hidden">
                    <div class="h-full bg-[#ff9900] transition-all" :style="{ width: file.progress + '%' }"></div>
                  </div>
                  <span class="text-[8px] text-[#2a3548] shrink-0">{{ file.size }}</span>
                </div>
              </div>
              <span class="text-[8px] shrink-0" :class="stateColor(file.state)">{{ file.state }}</span>
            </div>

            <!-- Drop zone -->
            <div
              class="mt-1 border border-dashed border-[#1a2235] hover:border-[#ff990044] text-[#2a3548] hover:text-[#ff990066] text-[8px] tracking-widest text-center py-2 cursor-pointer transition-colors"
              @dragover.prevent
              @drop="onAssetDrop($event, section.label)"
            >
              DROP FILES
            </div>
          </div>
        </div>
      </aside>

      <!-- ── CENTER CANVAS ── -->
      <section
        class="flex-1 relative overflow-hidden"
        style="background-image: linear-gradient(rgba(255,255,255,.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.015) 1px, transparent 1px); background-size: 28px 28px; background-color: #070a10;"
        @dragover.prevent
        @drop="onCanvasDrop"
        @click.self="selectedNodeId = null"
      >
        <!-- Palette strip across top of canvas -->
        <div class="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10 bg-[#0a0e17] border border-[#1a2235] px-2 py-1.5">
          <div
            v-for="pt in paletteTypes"
            :key="pt.type"
            draggable="true"
            @dragstart="onPaletteDragStart($event, pt.type)"
            class="flex flex-col items-center gap-0.5 px-3 py-1 cursor-grab hover:bg-[#111827] transition-colors border border-transparent hover:border-[#1a2235]"
            :title="pt.label"
          >
            <i :class="['ti', pt.icon, 'text-sm', pt.color]"></i>
            <span class="text-[7px] tracking-widest" :class="pt.color">{{ pt.label }}</span>
          </div>
        </div>

        <!-- SVG Edges -->
        <svg class="absolute inset-0 w-full h-full pointer-events-none overflow-visible" ref="edgesSvg">
          <defs>
            <marker id="rj-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M2 1L8 5L2 9" fill="none" stroke="#1a2235" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </marker>
          </defs>
          <path
            v-for="edge in computedEdges"
            :key="edge.id"
            :d="edge.path"
            fill="none"
            stroke="#1a2235"
            stroke-width="1.5"
            marker-end="url(#rj-arrow)"
          />
        </svg>

        <!-- Nodes -->
        <div
          v-for="node in nodes"
          :key="node.id"
          class="absolute w-44 bg-[#0a0e17] border rounded cursor-move select-none transition-shadow"
          :class="[
            selectedNodeId === node.id ? 'border-[#ff9900] shadow-[0_0_0_1px_#ff990033]' : 'border-[#1a2235] hover:border-[#2a3548]',
            nodeBorderTop(node.type)
          ]"
          :style="{ left: node.x + 'px', top: node.y + 'px' }"
          @click.stop="selectedNodeId = node.id"
          @mousedown="startNodeDrag($event, node.id)"
          :data-node-id="node.id"
        >
          <!-- Port in -->
          <div
            class="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-[#2a3548] bg-[#0a0e17] hover:border-[#ff9900] z-10 cursor-crosshair"
            @mousedown.stop
            @mouseup="onPortConnect($event, node.id)"
          ></div>

          <!-- Header -->
          <div class="flex items-center gap-2 px-2.5 py-2 border-b border-[#111827]">
            <div class="w-5 h-5 flex items-center justify-center shrink-0 rounded" :class="nodeIconBg(node.type)">
              <i :class="['ti', nodeIcon(node.type), 'text-xs', nodeIconColor(node.type)]"></i>
            </div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-[#e2e8f0] flex-1 truncate">{{ node.label }}</span>
            <!-- Status dot -->
            <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="nodeStatusDot(node.status)"></span>
          </div>

          <!-- Body -->
          <div class="px-2.5 py-2">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[8px] text-[#2a3548] tracking-widest">WORKERS</span>
              <span class="text-[9px] text-[#9ca3af]">{{ node.workers ?? 1 }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[8px] text-[#2a3548] tracking-widest">STATUS</span>
              <span class="text-[9px]" :class="nodeStatusColor(node.status)">{{ node.status }}</span>
            </div>
            <!-- Progress bar -->
            <div v-if="node.progress !== undefined" class="mt-2 h-0.5 bg-[#1a2235] rounded overflow-hidden">
              <div class="h-full bg-[#ff9900] transition-all" :style="{ width: node.progress + '%' }"></div>
            </div>
          </div>

          <!-- Port out -->
          <div
            class="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-[#2a3548] bg-[#0a0e17] hover:border-[#ff9900] z-10 cursor-crosshair"
            @mousedown.stop="startEdgeDraw($event, node.id)"
          ></div>
        </div>

        <!-- Empty hint -->
        <div v-if="nodes.length === 0" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <p class="text-[#1a2235] text-[10px] tracking-widest">DRAG NODES FROM PALETTE TO BUILD PIPELINE</p>
        </div>

        <!-- Canvas hint -->
        <p class="absolute bottom-3 left-1/2 -translate-x-1/2 text-[8px] text-[#1a2235] tracking-widest pointer-events-none whitespace-nowrap">
          DRAG · CONNECT PORTS · CLICK TO CONFIGURE
        </p>
      </section>

      <!-- ── RIGHT PANEL — Node Config ── -->
      <Transition
        enter-active-class="transition-all duration-200"
        enter-from-class="translate-x-5 opacity-0"
        leave-active-class="transition-all duration-200"
        leave-to-class="translate-x-5 opacity-0"
      >
        <aside v-if="selectedNode" class="w-56 bg-[#0a0e17] border-l border-[#1a2235] flex flex-col shrink-0 overflow-y-auto z-10">

          <!-- Header -->
          <div class="px-4 py-3 border-b border-[#1a2235]">
            <p class="text-[9px] text-[#ff9900] tracking-widest mb-1">● {{ selectedNode.type }} node</p>
            <p class="text-sm font-bold text-[#e2e8f0] capitalize">{{ selectedNode.label }}</p>
          </div>

          <!-- Config fields -->
          <div class="px-4 py-3 border-b border-[#111827]">
            <p class="text-[9px] text-[#2a3548] tracking-widest mb-3">CONFIGURATION</p>

            <div v-for="field in nodeConfigFields(selectedNode.type)" :key="field.key" class="mb-3">
              <label class="block text-[9px] text-[#4a5568] tracking-widest mb-1">{{ field.label }}</label>
              <select
                v-if="field.type === 'select'"
                v-model="selectedNode.config[field.key]"
                @change="saveNodes"
                class="w-full bg-[#111827] border border-[#1a2235] focus:border-[#ff9900] text-[10px] text-[#e2e8f0] px-2 py-1.5 outline-none transition-colors"
              >
                <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
              </select>
              <input
                v-else-if="field.type === 'number'"
                v-model.number="selectedNode.config[field.key]"
                type="number"
                @change="saveNodes"
                class="w-full bg-[#111827] border border-[#1a2235] focus:border-[#ff9900] text-[10px] text-[#e2e8f0] px-2 py-1.5 outline-none transition-colors"
              />
              <input
                v-else
                v-model="selectedNode.config[field.key]"
                type="text"
                @change="saveNodes"
                class="w-full bg-[#111827] border border-[#1a2235] focus:border-[#ff9900] text-[10px] text-[#e2e8f0] px-2 py-1.5 outline-none transition-colors"
              />
            </div>
          </div>

          <!-- Toggles -->
          <div class="px-4 py-3 border-b border-[#111827]">
            <p class="text-[9px] text-[#2a3548] tracking-widest mb-3">OPTIONS</p>
            <div v-for="tog in nodeToggles" :key="tog.key" class="flex items-center justify-between mb-2">
              <span class="text-[9px] text-[#9ca3af]">{{ tog.label }}</span>
              <button
                @click="selectedNode.config[tog.key] = !selectedNode.config[tog.key]; saveNodes()"
                class="w-8 h-4 rounded-full transition-colors relative"
                :class="selectedNode.config[tog.key] ? 'bg-[#ff9900]' : 'bg-[#1a2235]'"
              >
                <span
                  class="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all"
                  :class="selectedNode.config[tog.key] ? 'left-4' : 'left-0.5'"
                ></span>
              </button>
            </div>
          </div>

          <!-- Workers -->
          <div class="px-4 py-3 border-b border-[#111827]">
            <p class="text-[9px] text-[#2a3548] tracking-widest mb-2">WORKERS</p>
            <div class="flex items-center gap-2">
              <button @click="selectedNode.workers = Math.max(1, (selectedNode.workers ?? 1) - 1); saveNodes()" class="w-6 h-6 border border-[#1a2235] text-[#9ca3af] text-sm hover:border-[#ff9900] hover:text-[#ff9900] transition-colors flex items-center justify-center">−</button>
              <span class="flex-1 text-center text-[13px] font-bold text-[#e2e8f0]">{{ selectedNode.workers ?? 1 }}</span>
              <button @click="selectedNode.workers = (selectedNode.workers ?? 1) + 1; saveNodes()" class="w-6 h-6 border border-[#1a2235] text-[#9ca3af] text-sm hover:border-[#ff9900] hover:text-[#ff9900] transition-colors flex items-center justify-center">+</button>
            </div>
          </div>

          <!-- Delete -->
          <button @click="deleteNode(selectedNode.id)" class="mx-4 my-3 px-3 py-2 border border-[#450a0a] text-[#ef4444] text-[9px] tracking-widest hover:bg-[#450a0a] transition-colors flex items-center justify-center gap-2">
            <i class="ti ti-trash text-xs"></i> REMOVE NODE
          </button>
        </aside>
      </Transition>

    </div><!-- end workspace -->

    <!-- ══ BOTTOM PANEL ════════════════════════════════════════════════════ -->
    <footer class="h-28 bg-[#0a0e17] border-t border-[#1a2235] flex flex-col shrink-0 z-10">

      <!-- Tabs -->
      <div class="flex border-b border-[#1a2235]">
        <button
          v-for="tab in ['PROGRESS', 'LOG', 'WORKERS']"
          :key="tab"
          @click="activeTab = tab"
          class="px-4 py-1.5 text-[9px] tracking-widest border-b-2 transition-colors"
          :class="activeTab === tab ? 'text-[#ff9900] border-[#ff9900]' : 'text-[#4a5568] border-transparent hover:text-[#9ca3af]'"
        >{{ tab }}</button>
      </div>

      <div class="flex-1 px-4 py-2 flex items-center gap-6 overflow-hidden">

        <!-- Progress tab -->
        <template v-if="activeTab === 'PROGRESS'">
          <div v-for="m in metrics" :key="m.label" class="flex flex-col gap-1 min-w-24">
            <div class="flex justify-between text-[9px]">
              <span class="text-[#4a5568] tracking-widest">{{ m.label }}</span>
              <span class="text-[#9ca3af]">{{ m.value }}%</span>
            </div>
            <div class="h-1 bg-[#111827] rounded overflow-hidden">
              <div class="h-full rounded transition-all duration-500" :class="m.color" :style="{ width: m.value + '%' }"></div>
            </div>
          </div>
          <div class="ml-auto flex gap-6">
            <div class="text-center">
              <p class="text-lg font-bold text-[#e2e8f0]">{{ activeWorkers }}</p>
              <p class="text-[8px] text-[#4a5568] tracking-widest">WORKERS</p>
            </div>
            <div class="text-center">
              <p class="text-lg font-bold" :class="launching ? 'text-[#ff9900]' : 'text-[#4a5568]'">{{ launching ? 'RUNNING' : 'IDLE' }}</p>
              <p class="text-[8px] text-[#4a5568] tracking-widest">STATUS</p>
            </div>
          </div>
        </template>

        <!-- Log tab -->
        <template v-else-if="activeTab === 'LOG'">
          <div class="flex-1 flex flex-col gap-0.5 overflow-y-auto h-full">
            <div v-for="entry in runLog" :key="entry.ts" class="flex gap-3 text-[9px]">
              <span class="text-[#2a3548] shrink-0">{{ entry.ts }}</span>
              <span class="px-1 text-[8px] shrink-0" :class="entry.level === 'error' ? 'bg-[#450a0a] text-[#f87171]' : entry.level === 'warn' ? 'bg-[#451a03] text-[#fbbf24]' : 'bg-[#0c2340] text-[#60a5fa]'">{{ entry.level }}</span>
              <span class="text-[#6b7280]">{{ entry.msg }}</span>
            </div>
            <p v-if="!runLog.length" class="text-[9px] text-[#1a2235] tracking-widest">NO LOG ENTRIES YET</p>
          </div>
        </template>

        <!-- Workers tab -->
        <template v-else-if="activeTab === 'WORKERS'">
          <div class="flex gap-2 flex-wrap">
            <div
              v-for="w in workerList"
              :key="w.id"
              class="flex items-center gap-1.5 px-2 py-1 border text-[9px]"
              :class="w.active ? 'border-[#ff990033] text-[#ff9900]' : 'border-[#1a2235] text-[#4a5568]'"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="w.active ? 'bg-[#ff9900] animate-pulse' : 'bg-[#2a3548]'"></span>
              {{ w.id }}
            </div>
          </div>
        </template>

      </div>
    </footer>

    <!-- ══ ADD SCRIPT MODAL (reused from sagemaker) ════════════════════════ -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-200"
      leave-to-class="opacity-0"
    >
      <div v-if="showAddNode" class="fixed inset-0 z-50 flex items-center justify-center bg-[#070a10]/80 backdrop-blur-sm" @click.self="showAddNode = false">
        <div class="bg-[#0a0e17] border border-[#1a2235] w-96 shadow-2xl">
          <div class="flex items-center gap-3 px-5 py-4 border-b border-[#1a2235]">
            <span class="text-[9px] text-[#ff9900] tracking-widest">PIPELINE</span>
            <h3 class="text-sm font-bold text-[#e2e8f0] flex-1">Add Node</h3>
            <button @click="showAddNode = false" class="text-[#4a5568] hover:text-[#e2e8f0]"><i class="ti ti-x text-sm"></i></button>
          </div>
          <div class="p-4 grid grid-cols-2 gap-2">
            <div
              v-for="pt in paletteTypes"
              :key="pt.type"
              @click="addNodeFromModal(pt.type)"
              class="flex flex-col gap-1.5 p-3 border border-[#1a2235] hover:border-[#ff990044] hover:bg-[#111827] cursor-pointer transition-colors"
            >
              <i :class="['ti', pt.icon, 'text-base', pt.color]"></i>
              <span class="text-[10px] font-bold text-[#e2e8f0] capitalize">{{ pt.label }}</span>
              <span class="text-[9px] text-[#4a5568]">{{ pt.desc }}</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// ─── Types ───────────────────────────────────────────────────────────────────
interface LogEntry {
  ts: string
  level: 'info' | 'warn' | 'error'
  msg: string
}

interface RenderNode {
  id: string
  type: string
  label: string
  x: number; y: number
  workers: number
  status: 'IDLE' | 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'
  progress?: number
  config: Record<string, any>
}

interface RenderEdge {
  id: string
  fromNodeId: string
  toNodeId: string
}

interface AssetFile {
  name: string
  size: string
  progress: number
  state: 'LOADED' | 'SYNCING' | 'MISSING'
}

// ─── Main State ──────────────────────────────────────────────────────────────
const jobName = ref('')
const estimatedCost = ref('0.00')
const runtime = ref('0m 0s')
const priority = ref('NORMAL')
const launching = ref(false)
const activeTab = ref('PROGRESS')
const showAddNode = ref(false)

const nodes = ref<RenderNode[]>([])
const edges = ref<RenderEdge[]>([])
const selectedNodeId = ref<string | null>(null)

// ─── Assets State ─────────────────────────────────────────────────────────────
const assetSections = ref([
    { label: 'SCENE FILES', open: true, files: [
        { name: 'main_atrium_v08.usd', size: '1.2 GB', progress: 100, state: 'LOADED' },
        { name: 'lighting_rig_set.prop', size: '24 MB', progress: 100, state: 'LOADED' }
    ]},
    { label: 'TEXTURES', open: true, files: [
        { name: 'concrete_pavement_4k.exr', size: '156 MB', progress: 100, state: 'LOADED' },
        { name: 'sky_dome_sunset.hdr', size: '89 MB', progress: 45, state: 'SYNCING' }
    ]},
    { label: 'SCRIPTS', open: false, files: [] }
])

const fileIconColor = (state: string) => ({
    'LOADED': 'text-emerald-500',
    'SYNCING': 'text-[#ff9900]',
    'MISSING': 'text-red-500'
}[state] || 'text-[#4a5568]')

const stateColor = (state: string) => ({
    'LOADED': 'text-[#10b981]',
    'SYNCING': 'text-[#ff9900]',
    'MISSING': 'text-red-500'
}[state] || 'text-[#4a5568]')

const onAssetDrop = (e: DragEvent, sectionLabel: string) => {
    // Mock upload
    const section = assetSections.value.find(s => s.label === sectionLabel)
    if (section) {
        section.files.push({ name: 'new_asset.bin', size: '10 MB', progress: 0, state: 'SYNCING' })
    }
}

// ─── Canvas State ─────────────────────────────────────────────────────────────
const paletteTypes = [
    { type: 'SCENE', label: 'Scene', icon: 'ti-files', color: 'text-blue-400', desc: 'Ingest scene / world' },
    { type: 'FX', label: 'FX', icon: 'ti-wand', color: 'text-emerald-400', desc: 'Particle & Fluid effects' },
    { type: 'RT', label: 'RT', icon: 'ti-bolt', color: 'text-violet-400', desc: 'Realtime Raytracing' },
    { type: 'RENDER', label: 'Render', icon: 'ti-player-play', color: 'text-amber-400', desc: 'Frame sequence render' },
    { type: 'POST', label: 'Post', icon: 'ti-brush', color: 'text-red-400', desc: 'Color & Composite' }
]

const nodeIcon = (type: string) => ({
    'SCENE': 'ti-files', 'FX': 'ti-wand', 'RT': 'ti-bolt', 'RENDER': 'ti-player-play', 'POST': 'ti-brush'
}[type] || 'ti-box')

const nodeIconColor = (type: string) => ({
    'SCENE': 'text-blue-400', 'FX': 'text-emerald-400', 'RT': 'text-violet-400', 'RENDER': 'text-amber-400', 'POST': 'text-red-400'
}[type] || 'text-gray-400')

const nodeIconBg = (type: string) => ({
    'SCENE': 'bg-blue-400/10', 'FX': 'bg-emerald-400/10', 'RT': 'bg-violet-400/10', 'RENDER': 'bg-amber-400/10', 'POST': 'bg-red-400/10'
}[type] || 'bg-gray-400/10')

const nodeBorderTop = (type: string) => ({
    'SCENE': 'border-t-2 border-t-blue-500', 'FX': 'border-t-2 border-t-emerald-500', 'RT': 'border-t-2 border-t-violet-500', 'RENDER': 'border-t-2 border-t-amber-500', 'POST': 'border-t-2 border-t-red-500'
}[type] || '')

const nodeStatusDot = (status: string) => ({
    'IDLE': 'bg-[#1a2235]', 'PENDING': 'bg-blue-400', 'RUNNING': 'bg-[#ff9900] animate-pulse', 'COMPLETED': 'bg-emerald-500', 'FAILED': 'bg-red-500'
}[status] || 'bg-gray-500')

const nodeStatusColor = (status: string) => ({
    'IDLE': 'text-[#2a3548]', 'PENDING': 'text-blue-400', 'RUNNING': 'text-[#ff9900]', 'COMPLETED': 'text-emerald-500', 'FAILED': 'text-red-500'
}[status] || 'text-gray-500')

const nodeConfigFields = (type: string) => {
    const common = [{ key: 'priority', label: 'PRIORITY', type: 'select', options: ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'] }]
    if (type === 'SCENE') return [...common, { key: 'format', label: 'FORMAT', type: 'select', options: ['USD', 'FBX', 'ALEMBIC'] }, { key: 'simplify', label: 'SIMPLIFY COLLISION', type: 'text' }]
    if (type === 'RENDER') return [...common, { key: 'engine', label: 'ENGINE', type: 'select', options: ['Redshift', 'Octane', 'Arnold', 'Cycles'] }, { key: 'frames', label: 'FRAME RANGE', type: 'text' }]
    return common
}

const nodeToggles = [
    { key: 'warmStandby', label: 'WARM STANDBY' },
    { key: 'autoScaling', label: 'AUTO SCALING' },
    { key: 'preemptible', label: 'PREEMPTIBLE' }
]

// ─── Node Drag handling ───────────────────────────────────────────────────────
const draggingNodeId = ref<string | null>(null)
const dragOffset = ref({ x: 0, y: 0 })

const startNodeDrag = (e: MouseEvent, nodeId: string) => {
    draggingNodeId.value = nodeId
    const node = nodes.value.find(n => n.id === nodeId)!
    dragOffset.value = { x: e.clientX - node.x, y: e.clientY - node.y }
    window.addEventListener('mousemove', onNodeDragMove)
    window.addEventListener('mouseup', onNodeDragEnd)
}

const onNodeDragMove = (e: MouseEvent) => {
    if (!draggingNodeId.value) return
    const node = nodes.value.find(n => n.id === draggingNodeId.value)
    if (node) {
        node.x = e.clientX - dragOffset.value.x
        node.y = e.clientY - dragOffset.value.y
    }
}

const onNodeDragEnd = () => {
    draggingNodeId.value = null
    window.removeEventListener('mousemove', onNodeDragMove)
    window.removeEventListener('mouseup', onNodeDragEnd)
}

// ─── Palette / Modal ──────────────────────────────────────────────────────────
const paletteDragType = ref<string | null>(null)
const onPaletteDragStart = (e: DragEvent, type: string) => {
    paletteDragType.value = type
    e.dataTransfer?.setData('text', type)
}

const onCanvasDrop = (e: DragEvent) => {
    const type = e.dataTransfer?.getData('text') || paletteDragType.value
    if (!type) return
    const canvas = (e.currentTarget as HTMLElement).getBoundingClientRect()
    addNode(type, e.clientX - canvas.left - 88, e.clientY - canvas.top - 40)
}

const addNode = (type: string, x: number, y: number) => {
    const id = `node-${Date.now()}`
    nodes.value.push({
        id, type, x, y,
        label: `${type} NODE`,
        workers: 1,
        status: 'IDLE',
        config: { priority: 'NORMAL', warmStandby: false, autoScaling: true, preemptible: true }
    })
    selectedNodeId.value = id
}

const addNodeFromModal = (type: string) => {
    addNode(type, 100 + nodes.value.length * 20, 100 + nodes.value.length * 20)
    showAddNode.value = false
}

const deleteNode = (id: string) => {
    nodes.value = nodes.value.filter(n => n.id !== id)
    edges.value = edges.value.filter(e => e.fromNodeId !== id && e.toNodeId !== id)
    selectedNodeId.value = null
}

// ─── Edges ────────────────────────────────────────────────────────────────────
const drawingEdge = ref(false)
const drawingFromNodeId = ref<string | null>(null)

const startEdgeDraw = (e: MouseEvent, nodeId: string) => {
    drawingEdge.value = true
    drawingFromNodeId.value = nodeId
    window.addEventListener('mouseup', onEdgeDrawEnd)
}

const onEdgeDrawEnd = () => {
    drawingEdge.value = false
    drawingFromNodeId.value = null
    window.removeEventListener('mouseup', onEdgeDrawEnd)
}

const onPortConnect = (e: MouseEvent, toNodeId: string) => {
    if (!drawingEdge.value || !drawingFromNodeId.value || drawingFromNodeId.value === toNodeId) return
    const exists = edges.value.some(e => e.fromNodeId === drawingFromNodeId.value && e.toNodeId === toNodeId)
    if (!exists) {
        edges.value.push({ id: `edge-${Date.now()}`, fromNodeId: drawingFromNodeId.value!, toNodeId })
    }
}

const computedEdges = computed(() => {
    return edges.value.map(edge => {
        const from = nodes.value.find(n => n.id === edge.fromNodeId)
        const to = nodes.value.find(n => n.id === edge.toNodeId)
        if (!from || !to) return null
        const x1 = from.x + 176; const y1 = from.y + 50
        const x2 = to.x; const y2 = to.y + 50
        const cx = (x1 + x2) / 2
        return { id: edge.id, path: `M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}` }
    }).filter(Boolean)
})

// ─── Simulation ───────────────────────────────────────────────────────────────
const runLog = ref<LogEntry[]>([])
const metrics = ref([
    { label: 'RENDER QUEUE', value: 0, color: 'bg-blue-500' },
    { label: 'WORKER LOAD', value: 0, color: 'bg-[#ff9900]' },
    { label: 'LATENCY', value: 0, color: 'bg-emerald-500' }
])
const workerList = ref<any[]>([])
const activeWorkers = computed(() => workerList.value.filter(w => w.active).length)

const launchRender = () => {
    if (nodes.value.length === 0) return
    launching.value = true
    activeTab.value = 'LOG'
    
    // Save to localStorage
    const newJob = {
        id: `render-${Date.now()}`,
        name: jobName.value || 'untitled-render-job',
        status: 'Running',
        frames: '1-100', // Mock
        engine: 'Redshift', // Mock
        progress: 0,
        createdAt: new Date().toISOString()
    }
    const stored = JSON.parse(localStorage.getItem('renderJobs') || '[]')
    stored.unshift(newJob)
    localStorage.setItem('renderJobs', JSON.stringify(stored))

    // Simulate process
    nodes.value.forEach(n => { n.status = 'PENDING'; n.progress = 0 })
    
    let delay = 0
    const ordered = [...nodes.value].sort((a,b) => a.x - b.x)
    
    ordered.forEach((node, i) => {
        setTimeout(() => {
            node.status = 'RUNNING'
            log('info', `Initializing ${node.type} task on sequence ${i}`)
            
            // Progress simulation
            const interval = setInterval(() => {
                if (node.progress! < 100) {
                    node.progress! += Math.random() * 20
                    if (node.progress! > 100) node.progress = 100
                } else {
                    node.status = 'COMPLETED'
                    log('info', `${node.label} processing finalized. Final checksum: 0x${Math.random().toString(16).slice(2,8)}`)
                    clearInterval(interval)
                }
            }, 300)
        }, delay)
        delay += 1500
    })

    setTimeout(() => { launching.value = false; log('info', 'All render nodes completed sequence.') }, delay + 1000)
}

const log = (level: LogEntry['level'], msg: string) => {
    runLog.value.unshift({ ts: new Date().toLocaleTimeString(), level, msg })
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
let metricsTimer: any
onMounted(() => {
    // Generate workers
    for(let i=1; i<=12; i++) workerList.value.push({ id: `RND-${i.toString().padStart(3,'0')}`, active: false })
    
    metricsTimer = setInterval(() => {
        if (launching.value) {
            metrics.value[0].value = Math.min(100, Math.floor(Math.random() * 20 + 80))
            metrics.value[1].value = Math.min(100, Math.floor(Math.random() * 15 + 75))
            metrics.value[2].value = Math.floor(Math.random() * 10 + 5)
            workerList.value.forEach(w => w.active = Math.random() > 0.3)
            estimatedCost.value = (parseFloat(estimatedCost.value) + 0.05).toFixed(2)
        } else {
            metrics.value.forEach(m => m.value = Math.max(0, m.value - 10))
            workerList.value.forEach(w => w.active = false)
        }
    }, 1000)
})

onUnmounted(() => clearInterval(metricsTimer))

const saveNodes = () => {
    localStorage.setItem('renderNodes', JSON.stringify(nodes.value))
    localStorage.setItem('renderEdges', JSON.stringify(edges.value))
}

const selectedNode = computed(() => nodes.value.find(n => n.id === selectedNodeId.value))
</script>