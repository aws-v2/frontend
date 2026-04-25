<template>
  <div class="game-page" @mousedown="onMouseDown" @mouseup="onMouseUp">
    <div class="game-topbar">
      <button id="back-button" class="back-btn" @click="goBack">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>
      <div class="game-status">
        <span class="status-dot" :class="{ connected: wsConnected }"></span>
        <span class="status-label">{{ wsConnected ? 'Connected' : 'Connecting...' }}</span>
      </div>
    </div>

    <div class="game-viewport">
      <div ref="threeContainer" class="three-container"></div>

      <!-- Overlay (forced off after 2s for debug) -->
      <div v-if="loading" class="game-overlay">
        <div class="overlay-content">
          <div class="overlay-spinner"></div>
          <p>WebSocket Debug Mode Active</p>
          <p style="font-size: 12px; color: #a78bfa; margin-top: 10px;">[NOTICE] 3D Asset Loading Disabled</p>
          <p style="font-size: 10px; color: #666; margin-top: 5px;">Check console for real-time server data</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchGames } from '../services/gameliftApi'

import { connectWebSocket, sendMessage, disconnectWebSocket } from '../services/ws.js'
import { fetchGameManifest } from '../services/gameliftApi.js'
import * as THREE from 'three'
import { assetLoader } from '../services/three/loader.js'

const route = useRoute()
const router = useRouter()
const threeContainer = ref(null)
const wsConnected = ref(false)
const loading = ref(true)
const manifest = ref(null)

let renderer, scene, camera
let levelScene = null

// Synced Entities Map
const entities = reactive(new Map()) // name -> { mesh, targetState, currentState }

// Movement Settings (Legacy for local prediction if needed)
const MOVE_SPEED = 0.15
const keysPressed = {}

// --- Three.js Setup ---
function initThree() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x050510)

  const width = threeContainer.value.clientWidth || 800
  const height = threeContainer.value.clientHeight || 600
  const aspect = width / height

  camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  threeContainer.value.appendChild(renderer.domElement)

  // LIGHTING
  scene.add(new THREE.AmbientLight(0xffffff, 0.8))
  const sun = new THREE.DirectionalLight(0xffffff, 1.2)
  sun.position.set(10, 20, 10)
  scene.add(sun)

  window.addEventListener('resize', onWindowResize)
}

function onWindowResize() {
  if (!camera || !renderer || !threeContainer.value) return
  const width = threeContainer.value.clientWidth
  const height = threeContainer.value.clientHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

// --- Pointer Lock & Input ---
function setupPointerLock(playerMesh) {
  const container = threeContainer.value
  container.addEventListener('click', () => container.requestPointerLock())

  document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === container && playerMesh) {
      // Rotation logic remains local for smoothness
      playerMesh.rotation.y -= e.movementX * 0.002
      camera.rotation.x -= e.movementY * 0.002
      camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x))
    }
  })
}

// --- Asset Loading & Manifest Logic ---
async function loadGame() {
  try {
    console.log('[Game] Fetching manifest for game:', route.params.id)
    manifest.value = await fetchGameManifest(route.params.id)
    
    console.log('[Game] Asset loading bypassed for debug mode.')
    loading.value = false
  } catch (err) {
    console.error('[Game] Error loading gear:', err)
  }
}

function setupEntity(name, mesh) {
  entities.set(name, {
    mesh,
    target: { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z, yaw: mesh.rotation.y, pitch: 0 },
    current: { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z }
  })
}

// --- Game Loop ---
function tick() {
  requestAnimationFrame(tick)

  entities.forEach((entity, name) => {
    const { mesh, target } = entity
    // Interpolation
    mesh.position.x += (target.x - mesh.position.x) * 0.2
    mesh.position.y += (target.y - mesh.position.y) * 0.2
    mesh.position.z += (target.z - mesh.position.z) * 0.2
    
    // Only sync yaw for body unless it's a special type
    mesh.rotation.y += (target.yaw - mesh.rotation.y) * 0.2
    
    // If it's the player, sync camera pitch
    if (name === manifest.value?.player_node) {
      camera.rotation.x += (target.pitch - camera.rotation.x) * 0.2
    }
  })

  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
}

// --- WebSocket Handling ---
function handleServerMessage(event) {
  try {
    console.log('[WS][Data Received]', event.data)
    const data = JSON.parse(event.data)
    
    // We expect updates like: { "node": "PlayerCharacter", "x": 10, ... }
    // Or a list of updates? For now assume single node update
    const nodeName = data.node || manifest.value?.player_node
    const entity = entities.get(nodeName)
    
    if (entity) {
      if (typeof data.x === 'number') entity.target.x = data.x
      if (typeof data.y === 'number') entity.target.y = data.y
      if (typeof data.z === 'number') entity.target.z = data.z
      if (typeof data.yaw === 'number') entity.target.yaw = data.yaw
      if (typeof data.pitch === 'number') entity.target.pitch = data.pitch
    }
  } catch (err) {
    console.warn('[Game] Error parsing server message:', err)
  }
}

// --- Input Handling ---
const onKeyDown = (e) => {
  if (loading.value) return
  sendMessage({ type: 'keydown', key: e.key })
}
const onKeyUp = (e) => {
  if (loading.value) return
  sendMessage({ type: 'keyup', key: e.key })
}

function goBack() { cleanup(); router.push('/home') }

function cleanup() {
  disconnectWebSocket()
  wsConnected.value = false
  if (renderer) { renderer.dispose(); renderer.forceContextLoss() }
  window.removeEventListener('resize', onWindowResize)
}

onMounted(async () => {
  window.addEventListener('beforeunload', cleanup)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)

  initThree()
  await loadGame()
  tick()

  const socket = connectWebSocket()
  socket.addEventListener('open', () => {
    wsConnected.value = true
    sendMessage({ type: 'join', gameId: route.params.id })
  })
  socket.addEventListener('close', () => { wsConnected.value = false })
  socket.addEventListener('message', handleServerMessage)
})

onBeforeUnmount(() => {
  cleanup()
  window.removeEventListener('beforeunload', cleanup)
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
})
</script>

<style scoped>
.game-page {
  height: 100vh;
  background: #000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: none;
}

.game-topbar {
  padding: 12px 20px;
  background: #111;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 10;
}

.back-btn {
  background: #333;
  color: #fff;
  padding: 5px 15px;
  border-radius: 5px;
  cursor: pointer;
  border: none;
}

.game-viewport {
  flex: 1;
  position: relative;
}

.three-container {
  width: 100%;
  height: 100%;
  background: #000;
}

.game-status {
  color: #fff;
  font-size: 12px;
}

.game-overlay {
  position: absolute;
  inset: 0;
  background: #000;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.overlay-content {
  text-align: center;
}

.overlay-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #7c3aed;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
