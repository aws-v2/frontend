<template>
  <div class="events-page">
    <!-- Notification Bar -->
    <div class="notification-bar">
      <span class="icon">ℹ</span>
      Your free instance will spin down with inactivity, which can delay requests by 50 seconds or more
      <button class="btn-link">Upgrade now</button>
    </div>

    <!-- Events List -->
    <div class="events-container">
      <div class="filter-bar">
        <button class="filter-trigger">Filter events <span class="badge">31</span> ⌄</button>
      </div>

      <div class="event-timeline">
        <div v-for="event in mockEvents" :key="event.id" class="event-item">
          <div :class="['event-icon', event.status]">
            <span v-if="event.status === 'live'">✓</span>
            <span v-else>⬏</span>
          </div>
          <div class="event-details">
            <div class="event-main">
              <span class="event-title">{{ event.title }} for <span class="hash">{{ event.hash }}</span></span>
              <span class="version">{{ event.version }}</span>
            </div>
            <div class="event-meta">
              {{ event.trigger }} · {{ event.date }}
            </div>
          </div>
          <div class="event-actions" v-if="event.canRollback">
            <button class="btn-rollback">↺ Rollback</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const mockEvents = [
  { id: 1, status: 'live', title: 'Deploy live', hash: 'de7bf8c', version: 'v1.0.0', trigger: 'January 20, 2026 at 3:28 PM', date: '', canRollback: false },
  { id: 2, status: 'started', title: 'Deploy started', hash: 'de7bf9c', version: 'v1.0.0', trigger: 'Manually triggered by you via Dashboard', date: 'January 20, 2026 at 3:27 PM', canRollback: true },
  { id: 3, status: 'live', title: 'Deploy live', hash: '175f878', version: 'v1.0.0', trigger: 'January 20, 2026 at 3:21 PM', date: '', canRollback: false },
  { id: 4, status: 'started', title: 'Deploy started', hash: '175f878', version: 'v1.0.0', trigger: 'Manually triggered by you via Dashboard', date: 'January 20, 2026 at 3:21 PM', canRollback: true },
  { id: 5, status: 'live', title: 'Deploy live', hash: 'd3f5bf9', version: 'v1.0.0', trigger: 'January 20, 2026 at 3:12 PM', date: '', canRollback: true },
]
</script>

<style scoped>
.notification-bar {
  background-color: #1a1033;
  color: #fff;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 40px;
}

.btn-link { background: none; border: none; color: #fff; text-decoration: underline; cursor: pointer; padding: 0; margin-left: auto; }

.events-container { border: 1px solid #1a1a1a; border-radius: 8px; background-color: #000; }

.filter-bar { padding: 12px 24px; border-bottom: 1px solid #1a1a1a; }
.filter-trigger { background: none; border: none; color: #fff; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 8px; }

.event-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  border-bottom: 1px solid #1a1a1a;
}

.event-icon { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; }
.event-icon.live { border: 1px solid #00c853; color: #00c853; }
.event-icon.started { border: 1px solid #333; color: #666; }

.event-details { flex: 1; }
.event-main { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
.event-title { font-size: 14px; font-weight: 500; }
.hash { color: #fff; font-weight: 600; text-decoration: underline; }
.version { font-size: 11px; color: #666; }
.event-meta { font-size: 12px; color: #666; }

.btn-rollback { background: none; border: 1px solid #333; color: #fff; padding: 6px 12px; border-radius: 4px; font-size: 12px; cursor: pointer; }
.btn-rollback:hover { border-color: #555; }
</style>
