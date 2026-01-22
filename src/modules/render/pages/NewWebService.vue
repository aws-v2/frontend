<template>
  <div class="new-web-service">
    <header class="page-header">
      <div class="breadcrumb">
        <span class="breadcrumb-item">
          <span class="icon">⬡</span> Karani Martin's Wor...
        </span>
        <span class="separator">/</span>
        <div class="dropdown-trigger" @click="showBreadcrumbDropdown = !showBreadcrumbDropdown">
          <span class="breadcrumb-item active">New Web Service</span>
          <span class="chevron">⌄</span>
          <transition name="fade">
            <BreadcrumbDropdown v-if="showBreadcrumbDropdown" />
          </transition>
        </div>
      </div>
    </header>

    <div class="content">
      <h1 class="page-title">New Web Service</h1>
      
      <div v-if="step === 'source'" class="step-container">
        <div class="field-layout">
          <div class="field-label">Source Code</div>
          <div class="field-input">
            <div class="tabs">
              <button 
                v-for="tab in ['Git Provider', 'Public Git Repository', 'Existing Image']" 
                :key="tab"
                :class="['tab', { active: activeTab === tab }]"
                @click="activeTab = tab"
              >
                {{ tab }}
              </button>
            </div>

            <!-- Tab Content: Git Provider -->
            <div v-if="activeTab === 'Git Provider'" class="tab-content">
              <div class="search-bar">
                <span class="search-icon">🔍</span>
                <input type="text" placeholder="Search" />
                <div class="credentials">
                  <span class="github-icon">🐙</span>
                  Credentials (1) ⌄
                </div>
              </div>

              <div class="repo-list">
                <div 
                  v-for="repo in mockRepos" 
                  :key="repo.name" 
                  class="repo-item"
                  @click="selectRepo(repo)"
                >
                  <span class="github-icon">🐙</span>
                  <span class="repo-owner">{{ repo.owner }} /</span>
                  <span class="repo-name">{{ repo.name }}</span>
                  <span class="repo-time">{{ repo.time }}</span>
                </div>
                <div class="loading-state">
                  <span class="spinner"></span> Loading...
                </div>
              </div>
            </div>

            <!-- Tab Content: Public Git Repository -->
            <div v-if="activeTab === 'Public Git Repository'" class="tab-content public-repo">
              <p class="description">PR Previews and Auto-Deploy are available only for repositories configured with render.yaml</p>
              <div class="input-with-icon">
                <span class="icon">🌐</span>
                <input type="text" placeholder="https://github.com/render-examples/express-hello-world" />
              </div>
              <div class="actions">
                <button class="btn-connect" disabled>Connect →</button>
              </div>
            </div>

            <!-- Tab Content: Existing Image -->
            <div v-if="activeTab === 'Existing Image'" class="tab-content existing-image">
              <div class="form-group">
                <label>Image URL</label>
                <p class="description">Deploy an image from a Docker registry</p>
                <div class="input-with-icon">
                  <span class="icon">📦</span>
                  <input type="text" placeholder="docker.io/library/nginx:latest" />
                </div>
              </div>

              <div class="form-group">
                <label>Credential (Optional)</label>
                <div class="custom-select">
                  <span>No credential</span>
                  <span class="chevron">⌄</span>
                </div>
                <div class="credential-list">
                  <div class="add-credential">+ Add credential</div>
                  <div class="credential-item">
                    <span class="icon">🐳</span> emqarani
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="step === 'config'" class="step-container config-step">
        <p class="onboarding-notice">It looks like you're using <strong>Go</strong>, so we've autofilled some fields accordingly.</p>
        
        <div class="config-sections">
          <div class="field-layout horizontal">
            <div class="field-label">Source Code</div>
            <div class="field-input readonly">
              <div class="repo-chip">
                <span class="github-icon">🐙</span>
                {{ selectedRepo.owner }}/{{ selectedRepo.name }} · {{ selectedRepo.time }}
              </div>
              <button class="edit-link" @click="step = 'source'">✎ Edit</button>
            </div>
          </div>

          <div class="field-layout horizontal">
            <div class="field-label">
              Name
              <p class="sub-label">A unique name for your web service.</p>
            </div>
            <div class="field-input">
              <input type="text" v-model="form.name" />
            </div>
          </div>

          <div class="field-layout horizontal">
            <div class="field-label">
              Project <span class="optional">Optional</span>
              <p class="sub-label">Add this web service to a project once it's created.</p>
            </div>
            <div class="field-input">
              <div class="project-onboarding">
                <span class="icon">⬡</span>
                <div class="text">
                  <h3>Create a new project to add this to?</h3>
                  <p>You don't have any projects in this workspace. Projects allow you to group resources into environments so you can better manage related resources.</p>
                  <button class="btn-outline">+ Create a project</button>
                </div>
              </div>
            </div>
          </div>

          <div class="field-layout horizontal">
            <div class="field-label">
              Language
              <p class="sub-label">Choose the runtime environment for this service.</p>
            </div>
            <div class="field-input">
              <div class="custom-select">
                <span>Docker</span>
                <span class="chevron">⌄</span>
              </div>
            </div>
          </div>

          <div class="field-layout horizontal">
            <div class="field-label">
              Branch
              <p class="sub-label">The Git branch to build and deploy.</p>
            </div>
            <div class="field-input">
              <div class="custom-select">
                <span>main</span>
                <span class="chevron">⌄</span>
              </div>
            </div>
          </div>

          <div class="field-layout horizontal">
            <div class="field-label">
              Region
              <p class="sub-label">Your services in the same region can communicate over a private network. You currently have services running in Oregon.</p>
            </div>
            <div class="field-input">
              <div class="region-selector active">
                <div class="region-info">
                  <span class="dot purple"></span> Oregon (US West)
                </div>
                <span class="stats">27 existing services</span>
              </div>
              <div class="deploy-location">Deploy in a new region +</div>
            </div>
          </div>

          <!-- Instance Type Section -->
          <div class="section-divider"></div>
          <div class="field-layout vertical">
            <h2 class="section-title">Instance Type</h2>
            <div class="instance-grid-container">
              <div class="pricing-sidebar">
                <div class="pricing-group">
                  <h4>For hobby projects</h4>
                </div>
                <div class="pricing-group">
                  <h4>For professional use</h4>
                  <p>For more power and to get the most out of Render, we recommend using one of our paid instance types. All paid instances support:</p>
                  <ul>
                    <li>Zero Downtime</li>
                    <li>SSH Access</li>
                    <li>Scaling</li>
                    <li>One-off jobs</li>
                    <li>Support for persistent disks</li>
                  </ul>
                </div>
              </div>
              <div class="instance-grid">
                <div v-for="plan in plans" :key="plan.name" :class="['plan-card', { active: form.plan === plan.name }]" @click="form.plan = plan.name">
                  <div class="plan-main">
                    <span class="plan-name">{{ plan.name }}</span>
                    <span class="plan-price">{{ plan.price }}/ month</span>
                  </div>
                  <div class="plan-specs">
                    <span>{{ plan.ram }} (RAM)</span>
                    <span>{{ plan.cpu }} CPU</span>
                  </div>
                </div>
              </div>
            </div>
            <p class="custom-notice">Need a custom instance type? We support up to 512 GB RAM and 64 CPUs.</p>
          </div>

          <!-- Environment Variables -->
          <div class="section-divider"></div>
          <div class="field-layout vertical">
            <h2 class="section-title">Environment Variables</h2>
            <p class="section-desc">Set environment-specific config and secrets (such as API keys), then read those values from your code. <a href="#">Learn more</a>.</p>
            
            <div class="env-vars">
              <div class="env-row" v-for="(env, index) in form.envVars" :key="index">
                <input type="text" placeholder="NAME_OF_VARIABLE" v-model="env.key" />
                <textarea placeholder="value" v-model="env.value"></textarea>
                <button class="btn-generate">🪄 Generate</button>
                <button class="btn-delete" @click="removeEnvVar(index)">🗑️</button>
              </div>
              <div class="env-actions">
                <button class="btn-outline" @click="addEnvVar">+ Add Environment Variable</button>
                <button class="btn-outline" @click="showEnvModal = true">📄 Add from .env</button>
              </div>
            </div>
          </div>

          <div class="section-divider"></div>
          <div class="collapsible-section">
            <span class="chevron">⌄</span> Advanced
          </div>

          <div class="form-footer">
            <button class="btn-deploy">Deploy Web Service</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <AddFromEnvModal 
      v-if="showEnvModal" 
      @close="showEnvModal = false" 
      @add="handleEnvImport"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import BreadcrumbDropdown from '../components/BreadcrumbDropdown.vue'
import AddFromEnvModal from '../components/AddFromEnvModal.vue'

const step = ref('source')
const activeTab = ref('Git Provider')
const selectedRepo = ref<any>(null)
const showBreadcrumbDropdown = ref(false)
const showEnvModal = ref(false)

const mockRepos = [
  { owner: 'Karani-m', name: 'ec2', time: '12h ago' },
  { owner: 'Karani-m', name: 'Binance', time: '1d ago' },
  { owner: 'Karani-m', name: 'kjhb', time: '1d ago' },
  { owner: 'Karani-m', name: 'aws-configuration', time: '7d ago' },
  { owner: 'Karani-m', name: 'sa-v2', time: '18d ago' },
  { owner: 'Karani-m', name: 'sacco', time: '23d ago' },
]

const plans = [
  { name: 'Free', price: '$0', ram: '512 MB', cpu: '0.1' },
  { name: 'Starter', price: '$7', ram: '512 MB', cpu: '0.5' },
  { name: 'Standard', price: '$25', ram: '2 GB', cpu: '1' },
  { name: 'Pro', price: '$85', ram: '4 GB', cpu: '2' },
  { name: 'Pro Plus', price: '$175', ram: '8 GB', cpu: '4' },
  { name: 'Pro Max', price: '$225', ram: '16 GB', cpu: '4' },
  { name: 'Pro Ultra', price: '$450', ram: '32 GB', cpu: '8' },
]

const form = reactive({
  name: 'ec2',
  plan: 'Starter',
  envVars: [{ key: '', value: '' }]
})

const selectRepo = (repo: any) => {
  selectedRepo.value = repo
  step.value = 'config'
}

const addEnvVar = () => form.envVars.push({ key: '', value: '' })
const removeEnvVar = (index: number) => form.envVars.splice(index, 1)

const handleEnvImport = (text: string) => {
  const lines = text.split('\n')
  lines.forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) {
      form.envVars.push({
        key: key.trim(),
        value: valueParts.join('=').trim()
      })
    }
  })
  // Remove initial empty var if it exists
  if (form.envVars[0] && form.envVars[0].key === '' && form.envVars[0].value === '') {
    form.envVars.shift()
  }
}
</script>

<style scoped>
.new-web-service {
  background-color: #000;
  min-height: 100vh;
  color: #fff;
  font-family: 'Inter', sans-serif;
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

.breadcrumb-item { color: #999; display: flex; align-items: center; gap: 6px; }
.breadcrumb-item.active { color: #fff; }
.separator { color: #333; }
.dropdown-trigger { display: flex; align-items: center; gap: 6px; cursor: pointer; }

.content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 60px 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 40px;
}

.field-layout {
  display: flex;
  gap: 60px;
  margin-bottom: 32px;
}

.field-layout.horizontal {
  align-items: flex-start;
}

.field-layout.vertical {
  flex-direction: column;
  gap: 20px;
}

.field-label {
  width: 240px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.sub-label {
  font-size: 12px;
  color: #666;
  font-weight: 400;
  margin-top: 4px;
}

.optional {
  color: #444;
  font-weight: 400;
  margin-left: 4px;
}

.field-input {
  flex: 1;
}

.tabs {
  display: flex;
  background-color: #0c0c0c;
  border: 1px solid #1a1a1a;
  padding: 4px;
  border-radius: 4px;
  width: fit-content;
  margin-bottom: 24px;
}

.tab {
  background: none;
  border: none;
  color: #999;
  padding: 6px 16px;
  font-size: 12px;
  border-radius: 4px;
  cursor: pointer;
}

.tab.active {
  background-color: #1a1033;
  color: #7b3fe4;
}

.tab-content {
  border: 1px solid #1a1a1a;
  border-radius: 4px;
  background-color: #000;
  overflow: hidden;
}

.search-bar {
  padding: 12px 16px;
  border-bottom: 1px solid #1a1a1a;
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-bar input {
  background: none;
  border: none;
  color: #fff;
  font-size: 13px;
  flex: 1;
  outline: none;
}

.credentials {
  font-size: 12px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #1a1a1a;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}

.repo-list {
  max-height: 400px;
  overflow-y: auto;
}

.repo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #0a0a0a;
}

.repo-item:hover { background-color: #0c0c0c; }
.repo-owner { color: #666; font-size: 13px; }
.repo-name { color: #fff; font-size: 13px; font-weight: 500; flex: 1; }
.repo-time { color: #444; font-size: 12px; }

.loading-state {
  padding: 20px;
  text-align: center;
  color: #444;
  font-size: 12px;
}

.onboarding-notice {
  background-color: #0c0c0c;
  border: 1px solid #1a1a1a;
  padding: 16px;
  border-radius: 4px;
  font-size: 13px;
  color: #999;
  margin-bottom: 40px;
}

.onboarding-notice strong { color: #fff; }

.repo-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: #0c0c0c;
  border: 1px solid #1a1a1a;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
}

.edit-link {
  background: none;
  border: none;
  color: #999;
  font-size: 12px;
  margin-left: 12px;
  cursor: pointer;
}

input[type="text"], textarea {
  width: 100%;
  background-color: #000;
  border: 1px solid #333;
  color: #fff;
  padding: 10px 12px;
  border-radius: 4px;
  font-size: 14px;
}

input:focus { border-color: #7b3fe4; outline: none; }

.project-onboarding {
  border: 1px solid #1a1a1a;
  border-radius: 4px;
  padding: 24px;
  display: flex;
  gap: 20px;
}

.project-onboarding .icon { font-size: 24px; color: #333; }
.project-onboarding h3 { font-size: 14px; color: #fff; margin-bottom: 4px; }
.project-onboarding p { font-size: 12px; color: #666; margin-bottom: 16px; line-height: 1.5; }

.btn-outline {
  background: none;
  border: 1px solid #333;
  color: #fff;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.custom-select {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #000;
  border: 1px solid #333;
  padding: 10px 12px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.region-selector.active {
  border: 2px solid #7b3fe4;
  background-color: #1a1033;
  padding: 12px 16px;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.region-info { display: flex; align-items: center; gap: 10px; font-size: 14px; }
.dot.purple { width: 8px; height: 8px; border-radius: 50%; background-color: #7b3fe4; }
.stats { font-size: 11px; color: #7b3fe4; }
.deploy-location { margin-top: 8px; font-size: 12px; color: #666; text-align: right; cursor: pointer; }

.section-divider { height: 1px; background-color: #1a1a1a; margin: 40px 0; }
.section-title { font-size: 18px; font-weight: 600; }
.section-desc { font-size: 13px; color: #666; margin-bottom: 16px; }
.section-desc a { color: #7b3fe4; text-decoration: none; }

.instance-grid-container { display: flex; gap: 40px; margin-top: 20px; }
.pricing-sidebar { width: 240px; }
.pricing-group h4 { font-size: 12px; color: #fff; margin-bottom: 12px; }
.pricing-group p { font-size: 12px; color: #666; line-height: 1.4; margin-bottom: 12px; }
.pricing-group ul { padding-left: 16px; color: #666; font-size: 11px; }
.pricing-group li { margin-bottom: 4px; }

.instance-grid { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.plan-card { border: 1px solid #1a1a1a; padding: 16px; border-radius: 4px; cursor: pointer; }
.plan-card.active { border-color: #7b3fe4; background-color: #1a1033; }
.plan-main { display: flex; justify-content: space-between; margin-bottom: 12px; }
.plan-name { font-size: 14px; font-weight: 600; color: #fff; }
.plan-price { font-size: 12px; color: #fff; }
.plan-specs { display: flex; justify-content: space-between; font-size: 12px; color: #666; }

.custom-notice { font-size: 11px; color: #7b3fe4; margin-top: 20px; text-align: center; }

.env-row { display: flex; gap: 12px; margin-bottom: 12px; align-items: flex-start; }
.env-row input { width: 40%; }
.env-row textarea { flex: 1; height: 42px; resize: none; }
.btn-generate { background: none; border: none; color: #7b3fe4; font-size: 12px; padding: 10px 0; cursor: pointer; }
.btn-delete { background: none; border: none; color: #444; padding: 10px 0; cursor: pointer; }

.env-actions { display: flex; gap: 12px; margin-top: 16px; }

.collapsible-section { padding: 16px 0; border-top: 1px solid #1a1a1a; display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 600; color: #fff; cursor: pointer; }

.form-footer { margin-top: 40px; }
.btn-deploy { background-color: #fff; color: #000; border: none; padding: 12px 24px; border-radius: 4px; font-weight: 600; font-size: 14px; cursor: pointer; }
</style>
