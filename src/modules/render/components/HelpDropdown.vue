<template>
  <div class="dropdown-overlay" @click.self="$emit('close')">
    <div class="dropdown-menu">
      <div class="menu-section">
        <div class="menu-item">
          <span class="icon">📖</span>
          <span class="title">Render docs</span>
          <span class="external">↗</span>
        </div>
        <div class="menu-item">
          <span class="icon">🔀</span>
          <span class="title">API reference</span>
          <span class="external">↗</span>
        </div>
        <div class="menu-item">
          <span class="icon">📜</span>
          <span class="title">MCP Server</span>
          <span class="external">↗</span>
        </div>
        <div class="menu-item">
          <span class="icon">👥</span>
          <span class="title">Community</span>
          <span class="external">↗</span>
        </div>
        <div class="menu-item">
          <span class="icon">💬</span>
          <span class="title">Feedback</span>
          <span class="external">↗</span>
        </div>
      </div>

      <div class="menu-divider"></div>

      <div class="menu-section">
        <div class="menu-item">
          <span class="icon">⚙️</span>
          <span class="title">Coding Agents</span>
        </div>
        <div class="menu-item">
          <span class="icon">📄</span>
          <span class="title">Compliance and documents</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits(['close'])
</script>

<style scoped>
.dropdown-overlay {
  position: absolute;
  top: 56px;
  right: 60px;
  z-index: 1000;
}

.dropdown-menu {
  background-color: #0c0c0c;
  border: 1px solid #1a1a1a;
  border-radius: 8px;
  width: 280px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  padding: 8px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  cursor: pointer;
}

.menu-item:hover {
  background-color: #111;
}

.icon { width: 20px; text-align: center; }
.title { flex: 1; font-size: 13px; color: #fff; }
.external { color: #666; font-size: 12px; }

.menu-divider {
  height: 1px;
  background-color: #1a1a1a;
  margin: 4px 16px;
}
</style>
