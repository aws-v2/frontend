<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="workspace-card active">
        <div class="workspace-header">
          <div class="avatar">K</div>
          <div class="info">
            <div class="name-row">
              <span class="name">Karani Martin's Workspace</span>
              <span class="hobby-badge">HOBBY</span>
            </div>
            <span class="members">1 member</span>
          </div>
        </div>
        <div class="workspace-actions">
          <div class="action-item">
            <span class="icon">💳</span>
            <span>Billing</span>
          </div>
          <div class="action-item">
            <span class="icon">⚙️</span>
            <span>Workspace settings</span>
          </div>
        </div>
      </div>
      
      <div class="separator"></div>
      
      <div class="new-workspace-btn">
        <span class="plus">+</span>
        <span>New Workspace</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits(['close'])
</script>

<style scoped>
.modal-overlay {
  position: absolute;
  top: 60px;
  left: 20px;
  z-index: 1000;
}

.modal-content {
  background-color: #0c0c0c;
  border: 1px solid #1a1a1a;
  border-radius: 8px;
  width: 320px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  overflow: hidden;
}

.workspace-card {
  padding: 16px;
}

.workspace-header {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.avatar {
  width: 32px;
  height: 32px;
  background-color: #d1b3ff;
  color: #000;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.info {
  display: flex;
  flex-direction: column;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.hobby-badge {
  font-size: 9px;
  background-color: #7b3fe4;
  color: #fff;
  padding: 1px 4px;
  border-radius: 3px;
  font-weight: bold;
}

.members {
  font-size: 11px;
  color: #666;
}

.workspace-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-left: 44px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #999;
  font-size: 13px;
  cursor: pointer;
}

.action-item:hover {
  color: #fff;
}

.separator {
  height: 1px;
  background-color: #1a1a1a;
}

.new-workspace-btn {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #999;
  font-size: 13px;
  cursor: pointer;
}

.new-workspace-btn:hover {
  background-color: #111;
  color: #fff;
}

.plus {
  width: 20px;
  display: flex;
  justify-content: center;
}
</style>
