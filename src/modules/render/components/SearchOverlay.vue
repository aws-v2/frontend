<template>
  <div class="search-overlay">
    <div class="search-container">
      <header class="search-header">
        <div class="navbar-left">
          <div class="logo">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" />
            </svg>
          </div>
          <div class="workspace-avatar">K</div>
          <span class="workspace-name">Karani Martin's Wor...</span>
          <span class="chevron">↕</span>
        </div>
        
        <div class="search-input-wrapper">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search your workspace for a project, resource, environment..."
            autofocus
          />
        </div>

        <div class="navbar-right">
          <button class="close-search" @click="$emit('close')">
            <span>×</span> Close search <span class="esc">ESC</span>
          </button>
          <button class="btn-new">+ New</button>
          <button class="btn-upgrade">⚡ Upgrade</button>
          <button class="btn-help">?</button>
          <div class="user-avatar">E</div>
        </div>
      </header>

      <div class="search-body">
        <div class="search-canvas">
          <div class="canvas-grid">
            <div class="grid-line horizontal" v-for="i in 5" :key="'h'+i" :style="{ top: i * 20 + '%' }"></div>
            <div class="grid-line vertical" v-for="i in 9" :key="'v'+i" :style="{ left: i * 10 + '%' }"></div>
          </div>
          
          <div class="search-illustration">
            <div class="central-box">
              <span class="big-search-icon">🔍</span>
            </div>
            
            <div class="floating-icons">
              <div class="f-icon p1">⬡</div>
              <div class="f-icon p2">⚌</div>
              <div class="f-icon p3">🌐</div>
              <div class="f-icon p4">🔒</div>
              <div class="f-icon p5">⏰</div>
              <div class="f-icon p6">🗄️</div>
              <div class="f-icon p7">📦</div>
              <div class="f-icon p8">⚙️</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits(['close'])
</script>

<style scoped>
.search-overlay {
  position: fixed;
  inset: 0;
  background-color: #000;
  z-index: 2000;
  display: flex;
  flex-direction: column;
}

.search-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.search-header {
  height: 56px;
  border-bottom: 1px solid #1a1a1a;
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 20px;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.workspace-avatar {
  width: 20px;
  height: 20px;
  background-color: #d1b3ff;
  color: #000;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
}

.workspace-name { font-size: 13px; color: #fff; }
.chevron { font-size: 10px; color: #666; }

.search-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input-wrapper input {
  background: none;
  border: none;
  color: #fff;
  font-size: 14px;
  width: 100%;
  outline: none;
}

.search-icon { color: #7b3fe4; }

.navbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.close-search {
  background: none;
  border: 1px solid #333;
  color: #fff;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.esc { background-color: #222; padding: 2px 4px; border-radius: 3px; font-size: 10px; }

.btn-new { background-color: #1a1a1a; border: none; color: #666; padding: 6px 12px; border-radius: 6px; }
.btn-upgrade { background-color: #1a1a1a; border: none; color: #666; padding: 6px 12px; border-radius: 6px; }
.btn-help { background-color: #1a1a1a; border: none; color: #666; width: 32px; height: 32px; border-radius: 6px; }
.user-avatar { width: 28px; height: 28px; background-color: #5c3b8c; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1a1a1a; font-weight: bold; }

.search-body {
  flex: 1;
  background-color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-canvas {
  width: 80%;
  height: 80%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.canvas-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.grid-line { background-color: #0a0a0a; position: absolute; }
.horizontal { height: 1px; width: 100%; }
.vertical { width: 1px; height: 100%; }

.search-illustration {
  position: relative;
  z-index: 10;
}

.central-box {
  width: 120px;
  height: 120px;
  background-color: #1a1033;
  border: 4px solid #3d2b5c;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.big-search-icon { font-size: 40px; color: #7b3fe4; }

.floating-icons {
  position: absolute;
  inset: -100px;
}

.f-icon {
  position: absolute;
  width: 40px;
  height: 40px;
  background-color: #0c0c0c;
  border: 1px solid #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.p1 { top: 10px; left: 10px; }
.p2 { top: -40px; left: 50%; margin-left: -20px; }
.p3 { top: 10px; right: 10px; }
.p4 { top: 50%; right: -40px; margin-top: -20px; }
.p5 { bottom: 10px; right: 10px; }
.p6 { bottom: -40px; left: 50%; margin-left: -20px; }
.p7 { bottom: 10px; left: 10px; }
.p8 { top: 50%; left: -40px; margin-top: -20px; }
</style>
