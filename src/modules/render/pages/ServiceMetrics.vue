<template>
  <div class="metrics-page">
    <div class="metrics-main-layout">
      <div class="metrics-content">
        <!-- Banner -->
        <div class="integration-banner">
          <span class="info-icon">ℹ</span>
          Want to stream your metrics to another observability tool?
          <button class="btn-link">Visit Integrations</button>
          <button class="close-banner">×</button>
        </div>

        <!-- Controls -->
        <div class="metrics-controls">
          <div class="control-left">
            <div class="dropdown-container">
              <button class="btn-control" @click="showRange = !showRange">
                <span class="icon">🕒</span> {{ currentRange }} <span class="chevron">⌄</span>
              </button>
              <transition name="fade">
                <TimeRangeDropdown 
                  v-if="showRange" 
                  :currentRange="currentRange"
                  @select="selectRange"
                />
              </transition>
            </div>
            <button class="btn-control static">GMT+3</button>
          </div>
          <div class="control-right">
            <button class="btn-control">
              <span class="icon">🔍</span> Filter events <span class="badge">8</span> <span class="chevron">⌄</span>
            </button>
            <button class="btn-layout" @click="showTimeline = !showTimeline">
              <span :class="['layout-icon', { active: showTimeline }]">🗒</span>
            </button>
          </div>
        </div>

        <!-- Network Metrics -->
        <section class="metrics-section">
          <h2>Network Metrics</h2>
          
          <div class="metric-card">
            <h3>Outbound Bandwidth</h3>
            
            <div class="chart-container">
              <!-- Mock Chart Surface -->
              <div class="chart-surface">
                <div class="marker m1">31</div>
                <div class="marker m2">8</div>
                
                <svg width="100%" height="240" viewBox="0 0 800 240" preserveAspectRatio="none">
                  <!-- Grid Lines -->
                  <line x1="0" y1="40" x2="800" y2="40" stroke="#1a1a1a" />
                  <line x1="0" y1="80" x2="800" y2="80" stroke="#1a1a1a" />
                  <line x1="0" y1="120" x2="800" y2="120" stroke="#1a1a1a" />
                  <line x1="0" y1="160" x2="800" y2="160" stroke="#1a1a1a" />
                  <line x1="0" y1="200" x2="800" y2="200" stroke="#1a1a1a" />
                  
                  <!-- Purple Line (Service-Initiated) -->
                  <path d="M0 200 L300 180 L350 40 L370 200 L600 200 L650 80 L700 200 L800 220" 
                        fill="none" stroke="#7b3fe4" stroke-width="2" />
                  
                  <!-- Green Line (HTTP Responses) -->
                  <path d="M0 220 L300 210 L350 180 L370 220 L800 230" 
                        fill="none" stroke="#00c853" stroke-width="2" />
                </svg>

                <!-- Tooltip Mockup -->
                <div class="chart-tooltip">
                  <div class="tt-time">
                    GMT+3: Jan 18 10:00:00 AM<br>
                    UTC: Jan 18 07:00:00 AM
                  </div>
                  <div class="tt-row">
                    <span class="dot purple"></span> Service-Initiated <span class="val">0.27 MB</span>
                  </div>
                  <div class="tt-row">
                    <span class="dot green"></span> HTTP Responses <span class="val">0.01 MB</span>
                  </div>
                </div>
              </div>

              <!-- Legend and Axes -->
              <div class="chart-meta">
                <div class="y-axis">
                  <span>0.25 MB</span>
                  <span>0.2 MB</span>
                  <span>0.15 MB</span>
                  <span>0.1 MB</span>
                  <span>0.05 MB</span>
                  <span>0 MB</span>
                </div>
                <div class="x-axis">
                  <div class="x-tick">12am<br>1/15/26</div>
                  <div class="x-tick">12am<br>1/16</div>
                  <div class="x-tick">12am<br>1/17</div>
                  <div class="x-tick">12am<br>1/18</div>
                  <div class="x-tick">12am<br>1/19</div>
                  <div class="x-tick">12am<br>1/20</div>
                  <div class="x-tick">12am<br>1/21</div>
                </div>
              </div>
            </div>

            <p class="chart-notice">
              <span class="info-icon">ℹ</span> This graph's resolution is fixed at one data point per hour.
            </p>

            <div class="collapsible-usage">
              <span class="chevron">›</span> Usage this month
              <span class="val">1 MB</span>
            </div>
          </div>
        </section>

        <!-- Application Metrics -->
        <section class="metrics-section">
          <h2>Application Metrics</h2>
          
          <div class="upgrade-banner">
            <div class="badge-paid">PAID</div>
            Upgrade to any paid instance type to view application metrics like memory and CPU usage.
            <button class="btn-upgrade-white">Upgrade</button>
          </div>

          <div class="metric-card disabled">
            <div class="card-header">
              <h3>Memory</h3>
              <div class="toggle">
                <button class="active">Percentage</button>
                <button>Total</button>
              </div>
            </div>
            
            <div class="memory-info">
              <span class="label">Limit</span> 512 MiB
            </div>

            <div class="mock-grid">
              <div class="grid-line" v-for="i in 3" :key="i"></div>
              <div class="grid-labels">
                <span>40%</span>
                <span>20%</span>
                <span>0%</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Event Timeline Sidebar Overlay -->
      <transition name="slide">
        <EventTimeline v-if="showTimeline" @close="showTimeline = false" />
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TimeRangeDropdown from '../components/metrics/TimeRangeDropdown.vue'
import EventTimeline from '../components/metrics/EventTimeline.vue'

const showRange = ref(false)
const showTimeline = ref(true)
const currentRange = ref('Last 7 days')

const selectRange = (range: string) => {
  currentRange.value = range
  showRange.value = false
}
</script>

<style scoped>
.metrics-page {
  background-color: #000;
  min-height: 100vh;
  color: #fff;
}

.metrics-main-layout {
  display: flex;
  height: calc(100vh - 56px); /* Subtract header height */
  overflow: hidden;
}

.metrics-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 40px 100px;
}

/* Banner */
.integration-banner {
  background-color: #1a1033;
  color: #fff;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.btn-link { background: none; border: none; color: #fff; text-decoration: underline; cursor: pointer; padding: 0; margin-left: auto; font-size: 13px; }
.close-banner { background: none; border: none; color: #fff; cursor: pointer; font-size: 18px; }

/* Controls */
.metrics-controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 32px;
}

.control-left, .control-right { display: flex; gap: 8px; }

.dropdown-container { position: relative; }

.btn-control {
  background-color: #0c0c0c;
  border: 1px solid #333;
  color: #fff;
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.btn-control.static { cursor: default; }
.btn-control .badge { background-color: #111; color: #666; padding: 0 6px; border-radius: 2px; font-size: 11px; }

.btn-layout {
  background-color: #0c0c0c;
  border: 1px solid #333;
  color: #666;
  width: 34px;
  height: 34px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.layout-icon.active { color: #fff; }

/* Sections */
.metrics-section { margin-bottom: 60px; }
.metrics-section h2 { font-size: 18px; font-weight: 600; margin-bottom: 24px; }

.metric-card {
  border-top: 1px solid #1a1a1a;
  padding-top: 24px;
}

.metric-card h3 { font-size: 14px; font-weight: 600; margin-bottom: 24px; }

/* Chart Area */
.chart-container {
  background-color: #000;
  position: relative;
  margin-bottom: 20px;
}

.chart-surface {
  position: relative;
  height: 240px;
  border-bottom: 1px solid #1a1a1a;
  margin-right: 60px;
}

.marker {
  position: absolute;
  background-color: #0c0c0c;
  border: 1px solid #333;
  padding: 2px 6px;
  border-radius: 2px;
  font-size: 10px;
  z-index: 10;
}

.marker.m1 { top: 30px; left: 340px; }
.marker.m2 { top: 70px; left: 640px; }

.chart-tooltip {
  position: absolute;
  top: 80px;
  left: 200px;
  background-color: #0c0c0c;
  border: 1px solid #333;
  padding: 12px;
  border-radius: 4px;
  font-size: 11px;
  width: 180px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.8);
  pointer-events: none;
}

.tt-time { color: #666; margin-bottom: 8px; line-height: 1.4; }
.tt-row { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
.tt-row .val { margin-left: auto; font-weight: 600; }
.dot { width: 6px; height: 6px; border-radius: 50%; }
.dot.purple { background-color: #7b3fe4; }
.dot.green { background-color: #00c853; }

.chart-meta {
  position: relative;
}

.y-axis {
  position: absolute;
  right: 0;
  top: -240px;
  height: 240px;
  width: 60px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  font-size: 11px;
  color: #666;
}

.x-axis {
  display: flex;
  justify-content: space-between;
  margin-right: 60px;
  padding-top: 12px;
}

.x-tick { font-size: 11px; color: #666; text-align: center; line-height: 1.4; }

.chart-notice { font-size: 12px; color: #666; display: flex; align-items: center; gap: 8px; margin-top: 16px; }

.collapsible-usage {
  margin-top: 24px;
  padding: 12px 16px;
  background-color: #0c0c0c;
  border: 1px solid #1a1a1a;
  border-radius: 4px;
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.collapsible-usage .val { margin-left: auto; color: #fff; }

/* Application Metrics Specifics */
.upgrade-banner {
  background-color: #1a1033;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
}

.badge-paid { background-color: #7b3fe4; color: #fff; font-size: 10px; font-weight: 700; padding: 2px 4px; border-radius: 2px; }

.btn-upgrade-white {
  background-color: #fff;
  color: #000;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 12px;
  margin-left: auto;
  cursor: pointer;
}

.metric-card.disabled { opacity: 0.5; }

.card-header { display: flex; justify-content: space-between; margin-bottom: 24px; }

.toggle { background-color: #111; padding: 2px; border-radius: 4px; display: flex; }
.toggle button { background: none; border: none; color: #666; padding: 4px 8px; font-size: 12px; cursor: pointer; }
.toggle button.active { background-color: #1a1033; color: #7b3fe4; border-radius: 2px; }

.memory-info { font-size: 13px; margin-bottom: 20px; }
.memory-info .label { color: #666; font-weight: 600; margin-right: 8px; }

.mock-grid { position: relative; height: 120px; border-bottom: 1px solid #1a1a1a; }
.grid-line { border-top: 1px solid #1a1a1a; margin-bottom: 39px; }
.grid-labels { position: absolute; right: -40px; top: 0; height: 100%; display: flex; flex-direction: column; justify-content: space-between; font-size: 11px; color: #444; }

/* Animations */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-enter-active, .slide-leave-active { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }
</style>
