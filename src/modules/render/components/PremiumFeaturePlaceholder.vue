<template>
  <div class="premium-placeholder">
    <div class="placeholder-content">
      <div class="badge-premium">PREMIUM</div>
      <h1 class="title">{{ title }}</h1>
      <p class="description">{{ description }}</p>
      
      <div class="feature-mockup">
        <div class="mock-line" v-for="i in 5" :key="i" :style="{ width: Math.random() * 60 + 40 + '%' }"></div>
      </div>

      <button class="btn-upgrade">Upgrade to a paid instance to use this feature</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<style scoped>
.premium-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 80px 40px;
  background-color: #000;
  min-height: 400px;
}

.placeholder-content {
  max-width: 500px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.badge-premium {
  background-color: #1a1033;
  color: #7b3fe4;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 4px;
  margin-bottom: 24px;
  letter-spacing: 0.5px;
}

.title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #fff;
}

.description {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 40px;
}

.feature-mockup {
  width: 100%;
  background-color: #0c0c0c;
  border: 1px solid #1a1a1a;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 40px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  opacity: 0.3;
}

.mock-line {
  height: 8px;
  background-color: #1a1a1a;
  border-radius: 4px;
}

.btn-upgrade {
  background-color: #7b3fe4;
  color: #fff;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-upgrade:hover {
  background-color: #6a35c9;
}
</style>
