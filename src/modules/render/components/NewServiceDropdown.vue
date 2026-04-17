<template>
  <div class="dropdown-overlay" @click.self="$emit('close')">
    <div class="dropdown-menu">
      <div class="menu-section">
        <div class="menu-item">
          <span class="icon">🖥️</span>
          <div class="item-text">
            <span class="title">Static Site</span>
          </div>
        </div>
        <router-link to="/render/new/web-service" class="menu-item" @click="$emit('close')">
          <span class="icon">🌐</span>
          <div class="item-text">
            <span class="title">Web Service</span>
          </div>
        </router-link>
        <div class="menu-item">
          <span class="icon">🔒</span>
          <div class="item-text">
            <span class="title">Private Service</span>
          </div>
        </div>
        <div class="menu-item">
          <span class="icon">⚙️</span>
          <div class="item-text">
            <span class="title">Background Worker</span>
          </div>
        </div>
        <div class="menu-item">
          <span class="icon">⏰</span>
          <div class="item-text">
            <span class="title">Cron Job</span>
          </div>
        </div>
      </div>

      <div class="menu-divider"></div>

      <div class="menu-section">
        <div class="menu-item">
          <span class="icon">🗄️</span>
          <div class="item-text">
            <span class="title">Postgres</span>
          </div>
        </div>
        <div class="menu-item">
          <span class="icon">📦</span>
          <div class="item-text">
            <span class="title">Key Value</span>
          </div>
        </div>
      </div>

      <div class="menu-divider"></div>

      <div class="menu-section">
        <div class="menu-item">
          <span class="icon">⬡</span>
          <div class="item-text">
            <span class="title">Project</span>
          </div>
        </div>
        <div class="menu-item">
          <span class="icon">⚌</span>
          <div class="item-text">
            <span class="title">Blueprint</span>
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
.dropdown-overlay {
  position: absolute;
  top: 56px;
  right: 120px;
  z-index: 1000;
}

.dropdown-menu {
  background-color: #0c0c0c;
  border: 1px solid #1a1a1a;
  border-radius: 8px;
  width: 240px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  padding: 8px 0;
}

.menu-section {
  padding: 4px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background 0.1s;
}

.menu-item:hover {
  background-color: #111;
}

.icon {
  font-size: 16px;
  width: 20px;
  display: flex;
  justify-content: center;
}

.title {
  font-size: 13px;
  color: #fff;
}

.menu-divider {
  height: 1px;
  background-color: #1a1a1a;
  margin: 4px 16px;
}
</style>
