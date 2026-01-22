<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="header">
        <span class="label">UPGRADE TO PRO</span>
      </div>
      
      <div class="features">
        <div class="feature-item">
          <span class="feature-name">Team size</span>
          <span class="feature-value">↕ 10 seats</span>
        </div>
        <div class="feature-item">
          <span class="feature-name">Custom domains</span>
          <span class="feature-value">Unlimited</span>
        </div>
        <div class="feature-item">
          <span class="feature-name">Horizontal autoscaling</span>
          <span class="feature-value">Included</span>
        </div>
      </div>

      <div class="actions">
        <button class="btn-plans">
          View Plans <span class="external">↗</span>
        </button>
        <button class="btn-upgrade-pro">
          Upgrade to Pro <span class="arrow">→</span>
        </button>
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
  right: 120px;
  z-index: 1000;
}

.modal-content {
  background-color: #0c0c0c;
  border: 1px solid #1a1a1a;
  border-radius: 8px;
  width: 380px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.8);
  padding: 24px;
}

.header {
  margin-bottom: 24px;
}

.label {
  font-size: 11px;
  font-weight: 700;
  color: #666;
  letter-spacing: 1px;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.feature-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #1a1a1a;
}

.feature-name {
  font-size: 14px;
  color: #fff;
}

.feature-value {
  font-size: 14px;
  color: #fff;
  font-weight: 500;
}

.actions {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.btn-plans {
  background: none;
  border: 1px solid #333;
  color: #fff;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 13px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
}

.btn-upgrade-pro {
  background-color: #fff;
  color: #000;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
}

.btn-plans:hover { border-color: #555; }
.btn-upgrade-pro:hover { background-color: #eee; }
</style>
