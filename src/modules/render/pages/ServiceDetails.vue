<template>
  <div class="service-details">
    <!-- Breadcrumb Header -->
    <header class="page-header">
      <div class="breadcrumb">
        <router-link to="/render" class="breadcrumb-item">
          <span class="icon">⬡</span> Karani Martin's Wor...
        </router-link>
        <span class="separator">/</span>
        <div class="dropdown-trigger" @click="showSwitchService = !showSwitchService">
          <span class="breadcrumb-item active">
            <span class="icon">🌐</span> {{ serviceId }}
          </span>
          <span class="chevron">⌄</span>
          <transition name="fade">
            <SwitchServiceDropdown 
              v-if="showSwitchService" 
              :currentService="serviceId"
              @select="handleServiceSelect"
            />
          </transition>
        </div>
      </div>
    </header>

    <div class="layout-container">
      <!-- Service Sidebar -->
      <aside class="service-sidebar">
        <div class="nav-group">
          <router-link to="/render" class="nav-item">
            <span class="icon">←</span> Dashboard
          </router-link>
          <div class="service-identity">
            <span class="icon">🌐</span> {{ serviceId }}
          </div>
        </div>

        <nav class="sidebar-nav">
          <router-link :to="`/render/services/${serviceId}/events`" class="nav-item" active-class="active">
            <span class="icon">≡</span> Events
          </router-link>
          <router-link :to="`/render/services/${serviceId}/settings`" class="nav-item" active-class="active">
            <span class="icon">⚙</span> Settings
          </router-link>

          <div class="group-label">MONITOR</div>
          <router-link :to="`/render/services/${serviceId}/logs`" class="nav-item" active-class="active">
            <span class="icon">🔍</span> Logs
          </router-link>
          <router-link :to="`/render/services/${serviceId}/metrics`" class="nav-item" active-class="active">
            <span class="icon">📈</span> Metrics
          </router-link>

          <div class="group-label">MANAGE</div>
          <router-link :to="`/render/services/${serviceId}/env`" class="nav-item" active-class="active">
            <span class="icon">💻</span> Environment
          </router-link>
          <router-link :to="`/render/services/${serviceId}/shell`" class="nav-item" active-class="active">
            <span class="icon">🐚</span> Shell <span class="bolt">⚡</span>
          </router-link>
          <router-link :to="`/render/services/${serviceId}/scaling`" class="nav-item" active-class="active">
            <span class="icon">⚖</span> Scaling <span class="bolt">⚡</span>
          </router-link>
          <div class="nav-item">
            <span class="icon">👁</span> Previews
          </div>
          <router-link :to="`/render/services/${serviceId}/disk`" class="nav-item" active-class="active">
            <span class="icon">💾</span> Disk <span class="bolt">⚡</span>
          </router-link>
          <router-link :to="`/render/services/${serviceId}/jobs`" class="nav-item" active-class="active">
            <span class="icon">⌛</span> Jobs <span class="bolt">⚡</span>
          </router-link>
        </nav>

        <div class="sidebar-footer">
          <div class="footer-item">📄 Changelog</div>
          <div class="footer-item">🤝 Invite a friend</div>
          <div class="footer-item">📞 Contact support</div>
          <div class="status-indicator">
            <span class="dot green"></span> Render Status
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="main-content">
        <!-- Service Sticky Header -->
        <div class="service-header">
          <div class="header-left">
            <div class="type-label">🌐 WEB SERVICE</div>
            <div class="service-title">
              <h1>{{ serviceId }}</h1>
              <div class="badges">
                <span class="badge grey">Image</span>
                <span class="badge purple">Free</span>
                <button class="upgrade-link">Upgrade your instance →</button>
              </div>
            </div>
            <div class="service-info">
              <span class="info-item">Service ID: srv-d5m8l0re3dus73ea8a0 <button class="copy-btn">📑</button></span>
              <span class="info-item"><span class="github-icon">🐙</span> emqarani3 / frontend · <span class="branch">v1.0.0</span></span>
              <a href="#" class="service-url">https://frontend-latest-mdz.onrender.com ↗</a>
            </div>
          </div>
          <div class="header-right">
            <div class="action-buttons">
              <div class="btn-group">
                <button class="btn-secondary" @click="showConnect = !showConnect">Connect ⌄</button>
                <transition name="fade">
                  <ConnectDropdown v-if="showConnect" />
                </transition>
              </div>
              
              <div class="btn-group">
                <button class="btn-primary" @click="showManualDeploy = !showManualDeploy">Manual Deploy ⌄</button>
                <transition name="fade">
                  <ManualDeployDropdown v-if="showManualDeploy" />
                </transition>
              </div>
            </div>
          </div>
        </div>

        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SwitchServiceDropdown from '../components/service-details/SwitchServiceDropdown.vue'
import ConnectDropdown from '../components/service-details/ConnectDropdown.vue'
import ManualDeployDropdown from '../components/service-details/ManualDeployDropdown.vue'

const route = useRoute()
const router = useRouter()
const serviceId = ref(route.params.serviceId as string)

watch(() => route.params.serviceId, (newId) => {
  if (newId) serviceId.value = newId as string
})

const showSwitchService = ref(false)
const showConnect = ref(false)
const showManualDeploy = ref(false)

const handleServiceSelect = (id: string) => {
  showSwitchService.value = false
  router.push(`/render/services/${id}`)
}
</script>

<style scoped>
.service-details {
  background-color: #000;
  min-height: 100vh;
  color: #fff;
  font-family: 'Inter', sans-serif;
  display: flex;
  flex-direction: column;
}

.page-header {
  height: 56px;
  border-bottom: 1px solid #1a1a1a;
  display: flex;
  align-items: center;
  padding: 0 24px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.breadcrumb-item { color: #999; text-decoration: none; display: flex; align-items: center; gap: 6px; }
.breadcrumb-item:hover { color: #fff; }
.breadcrumb-item.active { color: #fff; }
.separator { color: #333; }
.dropdown-trigger { display: flex; align-items: center; gap: 6px; cursor: pointer; position: relative; }

.layout-container {
  flex: 1;
  display: flex;
}

.service-sidebar {
  width: 240px;
  border-right: 1px solid #1a1a1a;
  display: flex;
  flex-direction: column;
  background-color: #000;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  color: #999;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-item:hover { color: #fff; background-color: #111; }
.nav-item.active { background-color: #1a1033; color: #7b3fe4; font-weight: 500; }

.service-identity {
  padding: 12px;
  color: #fff;
  font-size: 13px;
  border-bottom: 1px solid #1a1a1a;
  margin-bottom: 16px;
}

.group-label {
  font-size: 10px;
  font-weight: 700;
  color: #444;
  padding: 24px 12px 8px;
}

.bolt { color: #ffeb3b; font-size: 10px; }

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #1a1a1a;
}

.footer-item { color: #666; font-size: 11px; margin-bottom: 8px; cursor: pointer; }
.status-indicator { display: flex; align-items: center; gap: 8px; font-size: 11px; color: #666; }
.dot.green { width: 6px; height: 6px; border-radius: 50%; background-color: #00c853; }

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 40px;
}

.service-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 40px;
}

.type-label { font-size: 10px; color: #666; letter-spacing: 0.5px; margin-bottom: 8px; }

.service-title {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.service-title h1 { font-size: 28px; font-weight: 600; }

.badges { display: flex; align-items: center; gap: 8px; }
.badge { font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px; }
.badge.grey { background-color: #1a1a1a; color: #999; }
.badge.purple { background-color: #1a1033; color: #7b3fe4; }

.upgrade-link { background: none; border: none; color: #7b3fe4; font-size: 12px; cursor: pointer; }

.service-info { display: flex; flex-direction: column; gap: 8px; }
.info-item { font-size: 13px; color: #999; display: flex; align-items: center; gap: 8px; }
.service-url { font-size: 13px; color: #7b3fe4; text-decoration: none; }

.header-right .action-buttons { display: flex; gap: 12px; }
.btn-group { position: relative; }

.btn-secondary { background-color: #0c0c0c; border: 1px solid #333; color: #fff; padding: 8px 16px; border-radius: 4px; font-size: 13px; cursor: pointer; }
.btn-primary { background-color: #7b3fe4; border: none; color: #fff; padding: 8px 16px; border-radius: 4px; font-size: 13px; font-weight: 600; cursor: pointer; }

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

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
