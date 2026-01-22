<template>
  <div class="manual-deploy-dropdown">
    <div class="menu-item">
      <span>Deploy latest reference</span>
    </div>
    <div class="divider"></div>
    <div class="menu-item">
      <span>Restart service</span>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.manual-deploy-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background-color: #0c0c0c;
  border: 1px solid #1a1a1a;
  border-radius: 4px;
  width: 200px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
  z-index: 1000;
  padding: 8px 0;
}

.menu-item {
  padding: 10px 16px;
  font-size: 13px;
  color: #fff;
  cursor: pointer;
}

.menu-item:hover { background-color: #111; }

.divider { height: 1px; background-color: #1a1a1a; margin: 4px 0; }
</style>
