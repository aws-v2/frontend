<template>
  <div class="event-timeline-sidebar">
    <div class="sidebar-header">
      <h2>Event timeline</h2>
      <button class="close-btn" @click="$emit('close')">×</button>
    </div>

    <div class="timeline-content">
      <div v-for="group in groupedEvents" :key="group.date" class="date-group">
        <div class="date-header">{{ group.date }}</div>
        
        <div 
          v-for="event in group.events" 
          :key="event.id"
          class="event-node-container"
        >
          <div 
            :class="['event-node', { active: selectedEventId === event.id }]"
            @click="selectEvent(event)"
          >
            <span class="time">{{ event.time }}</span>
            <span class="title">{{ event.title }} for <span class="hash">{{ event.hash }}</span></span>
            <span :class="['status-box', event.status]"></span>
          </div>

          <!-- Expanded Event Details -->
          <div v-if="selectedEventId === event.id" class="event-details">
            <div class="details-header">
              <button class="back-btn" @click="selectedEventId = null">←</button>
              <h3>{{ event.title }} for <span class="hash">{{ event.hash }}</span></h3>
              <div class="event-time">{{ event.fullTime }}</div>
            </div>

            <div class="details-actions">
              <button class="btn-outline-small">🔍 View deploy logs</button>
              <button class="btn-outline-small">↺ Rollback</button>
            </div>

            <div class="details-info">
              <div class="info-row">
                <span class="label">Status</span>
                <span class="value"><span class="badge grey">Previously live</span></span>
              </div>
              <div class="info-row">
                <span class="label">Trigger</span>
                <span class="value link">Manually by you via Dashboard</span>
              </div>
              <div class="info-row">
                <span class="label">Source</span>
                <span class="value link">{{ event.hash }} ❐ v1.0.0</span>
              </div>
              <div class="info-row">
                <span class="label">Deploy ID</span>
                <span class="value link">{{ event.deployId }} ❐</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const selectedEventId = ref<number | null>(null)

const selectEvent = (event: any) => {
  selectedEventId.value = event.id
}

const groupedEvents = [
  {
    date: 'January 20, 2026',
    events: [
      { id: 1, time: '3:57 PM', title: 'Deploy live', hash: 'b99bd5e', status: 'live', fullTime: 'Jan 20 3:57:42 PM', deployId: 'dep-d5md3fngi27c...' },
      { id: 2, time: '2:57 PM', title: 'Deploy started', hash: 'b99bd5e', status: 'started', fullTime: 'Jan 20 2:57:42 PM', deployId: 'dep-d5md3fngi27c...' },
      { id: 3, time: '2:47 PM', title: 'Deploy live', hash: 'b28d84c', status: 'live', fullTime: 'Jan 20 2:47:42 PM', deployId: 'dep-d5md3fngi27c...' },
      { id: 4, time: '2:40 PM', title: 'Deploy started', hash: 'b28d84c', status: 'started', fullTime: 'Jan 20 2:40:42 PM', deployId: 'dep-d5md3fngi27c...' },
      { id: 5, time: '2:45 PM', title: 'Deploy failed', hash: '2b015d4', status: 'failed', fullTime: 'Jan 20 2:45:42 PM', deployId: 'dep-d5md3fngi27c...' },
    ]
  },
  {
    date: 'January 19, 2026',
    events: [
      { id: 6, time: '3:28 PM', title: 'Deploy live', hash: '09db009', status: 'live', fullTime: 'Jan 19 3:28:42 PM', deployId: 'dep-d5md3fngi27c...' },
      { id: 7, time: '3:27 PM', title: 'Deploy started', hash: '09db009', status: 'started', fullTime: 'Jan 19 3:27:42 PM', deployId: 'dep-d5md3fngi27c...' },
    ]
  }
]
</script>

<style scoped>
.event-timeline-sidebar {
  width: 320px;
  background-color: #0c0c0c;
  border-left: 1px solid #1a1a1a;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #1a1a1a;
}

.sidebar-header h2 { font-size: 14px; font-weight: 600; color: #fff; }
.close-btn { background: none; border: none; color: #666; font-size: 20px; cursor: pointer; }

.timeline-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 0;
}

.date-group {
  margin-bottom: 24px;
}

.date-header {
  padding: 0 20px 8px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
}

.event-node {
  padding: 8px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.event-node:hover { background-color: #111; }
.event-node.active { background-color: #1a1033; border-left: 2px solid #7b3fe4; padding-left: 18px; }

.time { font-size: 11px; color: #666; width: 56px; }
.title { font-size: 11px; color: #fff; flex: 1; }
.hash { font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; text-decoration: underline; }

.status-box { width: 14px; height: 14px; border-radius: 2px; }
.status-box.live { background-color: #008f11; }
.status-box.started { background-color: #333; }
.status-box.failed { background-color: #cf222e; }

/* Detail View */
.event-details {
  background-color: #000;
  padding: 20px;
  border-top: 1px solid #1a1a1a;
  border-bottom: 1px solid #1a1a1a;
}

.details-header { margin-bottom: 16px; }
.back-btn { background: none; border: none; color: #7b3fe4; cursor: pointer; font-size: 16px; margin-bottom: 8px; }
.details-header h3 { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
.event-time { font-size: 11px; color: #666; }

.details-actions { display: flex; gap: 8px; margin-bottom: 20px; }
.btn-outline-small { 
  background: none; 
  border: 1px solid #333; 
  color: #fff; 
  padding: 6px 12px; 
  border-radius: 4px; 
  font-size: 11px; 
  font-weight: 600;
  cursor: pointer;
}

.info-row { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
.info-row .label { font-size: 11px; color: #666; font-weight: 600; }
.info-row .value { font-size: 12px; color: #fff; }
.value.link { color: #7b3fe4; cursor: pointer; text-decoration: underline; }

.badge.grey { background-color: #1a1a1a; color: #999; padding: 2px 6px; border-radius: 4px; font-size: 10px; }
</style>
