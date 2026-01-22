<template>
  <div class="switch-service-dropdown">
    <div class="dropdown-header">SWITCH SERVICE</div>
    
    <div class="service-list">
      <div 
        v-for="service in services" 
        :key="service"
        :class="['service-item', { active: service === currentService }]"
        @click="$emit('select', service)"
      >
        <span class="icon">🌐</span>
        <span class="name">{{ service }}</span>
      </div>
    </div>

    <div class="dropdown-divider"></div>

    <div class="dropdown-footer">
      <span class="icon">📁</span> All services
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  currentService: string
}>()

defineEmits(['select'])

const services = [
  'frontend:latest',
  'crypto-exchange-bc:v1.0.0',
  'kjhb',
  'crypto-exchange-fr:latest',
  'crypto-exchange-bc:latest-1',
  'crypto-exchange-bc:latest',
  'aws-prod:prod-config-server-1.0.0',
  'Binance',
  'sacco-1',
  'sacco',
  'ke.equitygroupholdings.com',
  'captain-nova',
  'hj',
  'xbottt-latest',
  'xbot:v4',
  'xbot:v3-1',
  'xbot:v3',
  'xbot:latest',
  'serwin:1.0.1',
  'lock',
  'watchvideo',
  'pax',
  'asl',
  'app',
  'forever_frontend',
  'forever_admin',
  'parknwash_backend',
  'deriv',
  'zeraki-backend-assessment-monolithic...',
]
</script>

<style scoped>
.switch-service-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
  background-color: #0c0c0c;
  border: 1px solid #1a1a1a;
  border-radius: 4px;
  width: 320px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
  z-index: 1000;
}

.dropdown-header {
  font-size: 10px;
  font-weight: 700;
  color: #666;
  padding: 16px 16px 8px;
  letter-spacing: 0.5px;
}

.service-list {
  max-height: 480px;
  overflow-y: auto;
  padding: 4px 0;
}

/* Custom scrollbar */
.service-list::-webkit-scrollbar { width: 4px; }
.service-list::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }

.service-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  cursor: pointer;
}

.service-item:hover { background-color: #111; }
.service-item.active { background-color: #1a1033; color: #fff; border-left: 2px solid #7b3fe4; }

.icon { font-size: 14px; width: 18px; display: flex; justify-content: center; color: #666; }
.active .icon { color: #7b3fe4; }

.name { font-size: 12px; color: #999; }
.active .name { color: #fff; }

.dropdown-divider { height: 1px; background-color: #1a1a1a; margin: 4px 0; }

.dropdown-footer {
  padding: 12px 16px;
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.dropdown-footer:hover { background-color: #111; color: #fff; }
</style>
