<template>
  <div class="render-app">
    <!-- Sidebar -->
    <aside class="render-sidebar">
      <div class="sidebar-header">
        <div class="render-logo">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" />
            <path d="M2 17L12 22L22 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M2 12L12 17L22 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <div class="workspace-selector" @click="toggleWorkspaceModal">
          <div class="workspace-avatar">K</div>
          <span class="workspace-name">Karani Martin's Wor...</span>
          <span class="chevron">↕</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section">
          <router-link to="/render" class="nav-item active">
            <span class="icon">⬡</span> Projects
          </router-link>
          <a href="#" class="nav-item">
            <span class="icon">⚌</span> Blueprints
          </a>
          <a href="#" class="nav-item">
            <span class="icon">⊞</span> Environment Groups
          </a>
        </div>

        <div class="nav-group">
          <div class="group-label">INTEGRATIONS</div>
          <a href="#" class="nav-item">
            <span class="icon">⚙</span> Observability
          </a>
          <a href="#" class="nav-item">
            <span class="icon">⚓</span> Webhooks
          </a>
          <a href="#" class="nav-item">
            <span class="icon">🔔</span> Notifications
          </a>
        </div>

        <div class="nav-group">
          <div class="group-label">NETWORKING</div>
          <a href="#" class="nav-item">
            <span class="icon">↔</span> Private Links
          </a>
        </div>

        <div class="nav-group">
          <div class="group-label">WORKSPACE</div>
          <a href="#" class="nav-item">
            <span class="icon">💳</span> Billing
          </a>
          <a href="#" class="nav-item">
            <span class="icon">⚙</span> Settings
          </a>
        </div>
      </nav>

      <div class="sidebar-footer">
        <a href="#" class="footer-item">
          <span class="icon">📄</span> Changelog
        </a>
        <a href="#" class="footer-item">
          <span class="icon">🤝</span> Invite a friend
        </a>
        <a href="#" class="footer-item">
          <span class="icon">📞</span> Contact support
        </a>
        <div class="status-indicator">
          <span class="dot green"></span> Render Status
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="render-main">
      <header class="render-navbar">
        <div class="navbar-left">
          <span class="breadcrumb-icon">⬡</span>
          <span class="breadcrumb-text">Projects</span>
        </div>
        <div class="navbar-right">
          <div class="search-trigger" @click="openSearch">
            <span class="search-icon">🔍</span>
            <span>Search</span>
            <span class="shortcut">⌃ K</span>
          </div>
          <button class="btn-new" @click="toggleNewDropdown">
            <span>+ New</span>
          </button>
          <button class="btn-upgrade" @click="openUpgradeModal">
            <span class="bolt">⚡</span> Upgrade
          </button>
          <button class="btn-help" @click="toggleHelpDropdown">
            <span class="help-icon">?</span>
          </button>
          <div class="user-avatar">E</div>
        </div>
      </header>

      <div class="content-viewport">
        <router-view />
      </div>

      <!-- Modals/Dropdowns -->
      <transition name="fade">
        <NewServiceDropdown v-if="showNewDropdown" @close="showNewDropdown = false" />
      </transition>
      
      <transition name="fade">
        <WorkspaceModal v-if="showWorkspaceModal" @close="showWorkspaceModal = false" />
      </transition>

      <transition name="fade">
        <UpgradeModal v-if="showUpgradeModal" @close="showUpgradeModal = false" />
      </transition>

      <transition name="fade">
        <HelpDropdown v-if="showHelpDropdown" @close="showHelpDropdown = false" />
      </transition>

      <transition name="fade">
        <SearchOverlay v-if="showSearch" @close="showSearch = false" />
      </transition>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import NewServiceDropdown from '../components/NewServiceDropdown.vue'
import WorkspaceModal from '../components/WorkspaceModal.vue'
import UpgradeModal from '../components/UpgradeModal.vue'
import HelpDropdown from '../components/HelpDropdown.vue'
import SearchOverlay from '../components/SearchOverlay.vue'

const showNewDropdown = ref(false)
const showWorkspaceModal = ref(false)
const showUpgradeModal = ref(false)
const showHelpDropdown = ref(false)
const showSearch = ref(false)

const toggleNewDropdown = () => { showNewDropdown.value = !showNewDropdown.value }
const toggleWorkspaceModal = () => { showWorkspaceModal.value = !showWorkspaceModal.value }
const openUpgradeModal = () => { showUpgradeModal.value = true }
const toggleHelpDropdown = () => { showHelpDropdown.value = !showHelpDropdown.value }
const openSearch = () => { showSearch.value = true }
</script>

<style scoped>
.render-app {
  display: flex;
  height: 100vh;
  background-color: #000;
  color: #fff;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.render-sidebar {
  width: 240px;
  border-right: 1px solid #1a1a1a;
  display: flex;
  flex-direction: column;
  background-color: #000;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #1a1a1a;
}

.render-logo {
  width: 32px;
  height: 32px;
  margin-bottom: 20px;
}

.workspace-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  background-color: #000;
  color: #fff;
}

.workspace-selector:hover {
  background-color: #111;
}

.workspace-avatar {
  width: 20px;
  height: 20px;
  background-color: #d1b3ff;
  color: #000;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
}

.workspace-name {
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chevron {
  font-size: 10px;
  color: #666;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 8px;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: 24px;
}

.nav-group {
  margin-bottom: 24px;
}

.group-label {
  font-size: 10px;
  font-weight: 600;
  color: #666;
  padding: 0 8px 8px;
  letter-spacing: 0.5px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 6px;
  color: #999;
  text-decoration: none;
  font-size: 13px;
  transition: all 0.2s;
}

.nav-item:hover {
  color: #fff;
  background-color: #111;
}

.nav-item.active {
  color: #fff;
  background-color: #1a1033;
  border: 1px solid #3d2b5c;
}

.icon {
  font-size: 14px;
  width: 16px;
  display: flex;
  justify-content: center;
}

.sidebar-footer {
  padding: 16px 8px;
  border-top: 1px solid #1a1a1a;
}

.footer-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  color: #999;
  text-decoration: none;
  font-size: 12px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  font-size: 11px;
  color: #999;
  margin-top: 8px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.dot.green {
  background-color: #00c853;
  box-shadow: 0 0 4px #00c853;
}

.render-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.render-navbar {
  height: 56px;
  border-bottom: 1px solid #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background-color: #000;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-size: 14px;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background-color: #111;
  border: 1px solid #1a1a1a;
  border-radius: 6px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  min-width: 120px;
}

.shortcut {
  background-color: #222;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 10px;
  margin-left: auto;
}

.btn-new {
  background-color: #7b3fe4;
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-upgrade {
  background-color: transparent;
  color: #fff;
  border: 1px solid #333;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-help {
  background-color: transparent;
  color: #999;
  border: 1px solid #333;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.user-avatar {
  width: 28px;
  height: 28px;
  background-color: #5c3b8c;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.content-viewport {
  flex: 1;
  padding: 40px;
  overflow-y: auto;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
