<template>
  <div class="render-dashboard">
    <div class="header">
      <h1 class="page-title">Overview</h1>
    </div>

    <section class="projects-section">
      <h2 class="section-title">Projects</h2>
      
      <div class="project-onboarding-card">
        <div class="onboarding-content">
          <div class="onboarding-icon">
            <span class="icon">⬡</span>
          </div>
          <div class="onboarding-text">
            <h3>Get organized with Projects</h3>
            <p>An easier way to organize your resources and collaborate with team members.</p>
            <div class="onboarding-actions">
              <button class="btn-primary">+ Create your first project</button>
              <a href="#" class="link">Learn more</a>
            </div>
          </div>
        </div>
        <div class="onboarding-illustration">
          <div class="mock-ui">
            <div class="mock-header">PROJECT</div>
            <div class="mock-title">Health Checks</div>
            <div class="mock-tabs">
              <span class="tab">PRODUCTION</span>
              <span class="tab">STAGING</span>
              <span class="tab">DEV</span>
            </div>
            <div class="mock-grid">
              <div class="grid-item"></div>
              <div class="grid-item"></div>
              <div class="grid-item"></div>
            </div>
          </div>
        </div>
        <button class="close-onboarding">×</button>
      </div>
    </section>

    <section class="services-section">
      <div class="services-header">
        <h2 class="section-title">Ungrouped Services</h2>
        <div class="service-filters">
          <button class="filter-btn active">Active (24)</button>
          <button class="filter-btn">Suspended (5)</button>
          <button class="filter-btn">All (29)</button>
        </div>
      </div>

      <div class="services-table-container">
        <div class="table-search">
          <span class="search-icon">🔍</span>
          <input type="text" placeholder="Search services" />
        </div>

        <table class="services-table">
          <thead>
            <tr>
              <th class="col-name">SERVICE NAME <span class="badge">24</span></th>
              <th class="col-status">STATUS</th>
              <th class="col-runtime">RUNTIME</th>
              <th class="col-region">REGION</th>
              <th class="col-updated">UPDATED ↓</th>
              <th class="col-actions"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="service in mockServices" :key="service.name">
              <td class="col-name">
                <span class="service-icon">🌐</span>
                <router-link :to="`/render/services/${service.name}`" class="service-name-link">
                  {{ service.name }}
                </router-link>
              </td>
              <td class="col-status">
                <span :class="['status-pill', service.statusClass]">
                  <span class="status-icon">{{ service.statusIcon }}</span>
                  {{ service.status }}
                </span>
              </td>
              <td class="col-runtime">
                <span class="runtime-chip">{{ service.runtime }}</span>
              </td>
              <td class="col-region">{{ service.region }}</td>
              <td class="col-updated">{{ service.updated }}</td>
              <td class="col-actions">
                <button class="action-dots">⋯</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const mockServices = [
  { name: 'frontend-latest', status: 'Deployed', statusIcon: '✓', statusClass: 'success', runtime: 'Image', region: 'Oregon', updated: '1d' },
  { name: 'crypto-exchange-bc-v1.0.0', status: 'Deployed', statusIcon: '✓', statusClass: 'success', runtime: 'Image', region: 'Oregon', updated: '1d' },
  { name: 'kjhb', status: 'Failed deploy', statusIcon: '×', statusClass: 'error', runtime: 'Node', region: 'Oregon', updated: '1d' },
  { name: 'crypto-exchange-fr-latest', status: 'Deploying', statusIcon: '○', statusClass: 'loading', runtime: 'Image', region: 'Oregon', updated: '3d' },
]
</script>

<style scoped>
.render-dashboard {
  max-width: 1100px;
  margin: 0 auto;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 40px;
  color: #fff;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #fff;
}

.projects-section {
  margin-bottom: 48px;
}

.project-onboarding-card {
  background-color: #0c0c0c;
  border: 1px solid #1a1a1a;
  border-radius: 8px;
  padding: 32px;
  display: flex;
  position: relative;
  overflow: hidden;
  gap: 40px;
}

.onboarding-content {
  flex: 1;
}

.onboarding-icon {
  width: 40px;
  height: 40px;
  background-color: #1a1033;
  color: #7b3fe4;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 24px;
}

.onboarding-text h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.onboarding-text p {
  color: #999;
  font-size: 14px;
  margin-bottom: 24px;
  max-width: 400px;
  line-height: 1.5;
}

.onboarding-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.btn-primary {
  background-color: #fff;
  color: #000;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.link {
  color: #7b3fe4;
  text-decoration: none;
  font-size: 14px;
}

.onboarding-illustration {
  flex: 1;
  background-image: radial-gradient(circle at center, #1a1033 0%, transparent 70%);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 300px;
}

.mock-ui {
  background-color: #000;
  border: 1px solid #333;
  border-radius: 4px;
  padding: 16px;
  width: 100%;
  max-width: 300px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

.mock-header { font-size: 8px; color: #666; margin-bottom: 4px; }
.mock-title { font-size: 12px; color: #fff; margin-bottom: 12px; }
.mock-tabs { display: flex; gap: 8px; margin-bottom: 12px; }
.tab { font-size: 7px; color: #444; border-bottom: 1px solid #222; padding-bottom: 2px; }
.mock-grid { display: flex; gap: 4px; }
.grid-item { width: 30px; height: 30px; border: 1px solid #222; border-radius: 2px; }

.close-onboarding {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: #444;
  font-size: 20px;
  cursor: pointer;
}

.services-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 16px;
}

.service-filters {
  display: flex;
  gap: 4px;
  background-color: #111;
  padding: 2px;
  border-radius: 6px;
}

.filter-btn {
  background: none;
  border: none;
  color: #666;
  padding: 4px 12px;
  font-size: 12px;
  border-radius: 4px;
  cursor: pointer;
}

.filter-btn.active {
  background-color: #1a1033;
  color: #7b3fe4;
}

.services-table-container {
  border: 1px solid #1a1a1a;
  border-radius: 8px;
  background-color: #000;
}

.table-search {
  padding: 12px 16px;
  border-bottom: 1px solid #1a1a1a;
  display: flex;
  align-items: center;
  gap: 12px;
}

.table-search input {
  background: none;
  border: none;
  color: #fff;
  font-size: 13px;
  width: 100%;
  outline: none;
}

.services-table {
  width: 100%;
  border-collapse: collapse;
}

.services-table th {
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  color: #666;
  padding: 12px 16px;
  border-bottom: 1px solid #1a1a1a;
  letter-spacing: 0.5px;
}

.badge {
  background-color: #222;
  color: #999;
  padding: 1px 4px;
  border-radius: 3px;
  margin-left: 4px;
}

.services-table td {
  padding: 16px;
  border-bottom: 1px solid #1a1a1a;
  font-size: 13px;
}

.col-name {
  display: flex;
  align-items: center;
  gap: 12px;
}

.service-name-link {
  color: #fff;
  text-decoration: none;
  font-weight: 500;
}

.service-name-link:hover {
  text-decoration: underline;
}

.service-icon {
  font-size: 16px;
  color: #999;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
}

.status-pill.success { background-color: rgba(0, 200, 83, 0.1); color: #00c853; border: 1px solid rgba(0, 200, 83, 0.2); }
.status-pill.error { background-color: rgba(255, 82, 82, 0.1); color: #ff5252; border: 1px solid rgba(255, 82, 82, 0.2); }
.status-pill.loading { background-color: rgba(255, 255, 255, 0.05); color: #999; border: 1px solid rgba(255, 255, 255, 0.1); }

.runtime-chip {
  background-color: rgba(255, 121, 0, 0.1);
  color: #ff7900;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  border: 1px solid rgba(255, 121, 0, 0.2);
}

.action-dots {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 18px;
}
</style>
