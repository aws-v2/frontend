<template>
  <div class="breadcrumb-dropdown-container">
    <div class="dropdown-menu">
      <div class="menu-header">CHOOSE A SERVICE TYPE</div>
      
      <div class="menu-items">
        <div class="menu-item">
          <span class="icon">🖥️</span>
          <span class="title">Static Site</span>
        </div>
        <div class="menu-item active">
          <span class="icon">🌐</span>
          <span class="title">Web Service</span>
        </div>
        <div class="menu-item">
          <span class="icon">🔒</span>
          <span class="title">Private Service</span>
        </div>
        <div class="menu-item">
          <span class="icon">⚙️</span>
          <span class="title">Background Worker</span>
        </div>
        <div class="menu-item">
          <span class="icon">⏰</span>
          <span class="title">Cron Job</span>
        </div>
      </div>

      <div class="menu-divider"></div>

      <div class="menu-items">
        <div class="menu-item">
          <span class="icon">🗄️</span>
          <span class="title">Postgres</span>
        </div>
        <div class="menu-item">
          <span class="icon">📦</span>
          <span class="title">Key Value</span>
        </div>
      </div>

      <div class="menu-divider"></div>

      <div class="menu-footer">
        <span class="help-icon">?</span> Which to use?
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.breadcrumb-dropdown-container {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
  z-index: 1000;
}

.dropdown-menu {
  background-color: #0c0c0c;
  border: 1px solid #1a1a1a;
  border-radius: 4px;
  width: 220px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
}

.menu-header {
  font-size: 10px;
  font-weight: 700;
  color: #666;
  padding: 16px 16px 8px;
  letter-spacing: 0.5px;
}

.menu-items {
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

.menu-item.active {
  background-color: #1a1033;
  border-left: 2px solid #7b3fe4;
}

.menu-item.active .title {
  color: #fff;
}

.icon {
  font-size: 14px;
  width: 18px;
  display: flex;
  justify-content: center;
}

.title {
  font-size: 12px;
  color: #999;
}

.menu-divider {
  height: 1px;
  background-color: #1a1a1a;
  margin: 4px 0;
}

.menu-footer {
  padding: 12px 16px;
  font-size: 11px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.menu-footer:hover {
  color: #fff;
}

.help-icon {
  width: 14px;
  height: 14px;
  border: 1px solid #444;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
}
</style>
