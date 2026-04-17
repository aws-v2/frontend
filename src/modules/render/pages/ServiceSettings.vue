<template>
  <div class="settings-page">
    <h1 class="page-title">Settings</h1>

    <!-- Sections Navigation (Right Side Sticky) -->
    <nav class="sections-nav">
      <a href="#general" class="nav-link active">General</a>
      <a href="#deploy" class="nav-link">Deploy</a>
      <a href="#domains" class="nav-link">Custom Domains</a>
      <a href="#caching" class="nav-link">Edge Caching</a>
      <a href="#notifications" class="nav-link">Notifications</a>
      <a href="#health" class="nav-link">Health Checks</a>
      <a href="#maintenance" class="nav-link">Maintenance Mode</a>
      <a href="#danger" class="nav-link delete">Delete or suspend</a>
    </nav>

    <div class="settings-sections">
      <!-- General Section -->
      <section id="general" class="settings-card">
        <h2 class="card-title">General</h2>
        
        <div class="setting-row">
          <div class="setting-label">
            <h3>Name</h3>
            <p>A unique name for your Web Service.</p>
          </div>
          <div class="setting-field">
            <template v-if="editing.name">
              <input type="text" v-model="form.name" class="edit-input" />
              <div class="edit-actions">
                <button class="btn-save" @click="save('name')">Save</button>
                <button class="btn-cancel" @click="cancel('name')">Cancel</button>
              </div>
            </template>
            <template v-else>
              <div class="field-value">{{ form.name }}</div>
              <button class="btn-edit" @click="editing.name = true">✎ Edit</button>
            </template>
          </div>
        </div>

        <div class="setting-row">
          <div class="setting-label">
            <h3>Region</h3>
            <p>Your services in the same region can communicate over a private network.</p>
          </div>
          <div class="setting-field">
            <div class="readonly-box">Oregon (US West)</div>
          </div>
        </div>

        <div class="setting-row">
          <div class="setting-label">
            <h3>Instance Type</h3>
          </div>
          <div class="setting-field">
            <div class="instance-box">
              <div class="instance-info">
                <span class="plan-name">Free</span>
                <span class="plan-specs">0.1 CPU · 512 MB</span>
              </div>
              <button class="btn-outline">Update</button>
            </div>
            <div class="notice-bar purple">
              <span class="icon">ℹ</span>
              Please enter your payment information to select an instance type with higher limits.
            </div>
          </div>
        </div>

        <div class="notice-bar dark">
          <span class="icon">🛈</span>
          See remaining free usage, or learn about free service limits
        </div>
      </section>

      <!-- Deploy Section -->
      <section id="deploy" class="settings-card">
        <h2 class="card-title">Deploy</h2>

        <div class="setting-row">
          <div class="setting-label">
            <h3>Image</h3>
            <p>The image URL and credential used for your Web Service</p>
          </div>
          <div class="setting-field full">
            <template v-if="editing.image">
              <div class="input-group">
                <label>Image URL</label>
                <input type="text" v-model="form.image" class="edit-input" />
              </div>
              <div class="input-group">
                <label>Credential (Optional)</label>
                <select class="edit-input">
                  <option>No credential</option>
                </select>
              </div>
              <div class="edit-actions">
                <button class="btn-save" @click="save('image')">Save</button>
                <button class="btn-cancel" @click="cancel('image')">Cancel</button>
              </div>
            </template>
            <template v-else>
              <div class="readonly-section">
                <div class="input-group">
                  <label>Image URL</label>
                  <div class="field-value dimmed">{{ form.image }}</div>
                </div>
                <div class="input-group">
                  <label>Credential (Optional)</label>
                  <div class="field-value dimmed">No credential</div>
                </div>
              </div>
              <button class="btn-edit" @click="editing.image = true">✎ Edit</button>
            </template>
          </div>
        </div>

        <div class="setting-row">
          <div class="setting-label">
            <h3>Docker Command</h3>
            <p>Optionally override your Dockerfile's <code>CMD</code> and <code>ENTRYPOINT</code> instructions with a different command to start your service.</p>
          </div>
          <div class="setting-field">
            <template v-if="editing.dockerCommand">
              <input type="text" v-model="form.dockerCommand" class="edit-input" />
              <div class="edit-actions">
                <button class="btn-save" @click="save('dockerCommand')">Save</button>
                <button class="btn-cancel" @click="cancel('dockerCommand')">Cancel</button>
              </div>
            </template>
            <template v-else>
              <div class="field-value empty">None</div>
              <button class="btn-edit" @click="editing.dockerCommand = true">✎ Edit</button>
            </template>
          </div>
        </div>

        <div class="setting-row">
          <div class="setting-label">
            <h3>Pre-Deploy Command <span class="badge-optional">Optional</span></h3>
            <p>Render runs this command before the start command. Useful for database migrations and static asset uploads.</p>
          </div>
          <div class="setting-field">
            <div class="command-input">
              <span class="prompt">$</span>
              <input type="text" v-model="form.preDeploy" readonly />
              <span class="icon-lock">🔒</span>
            </div>
            <button class="btn-edit" disabled>✎ Edit</button>
          </div>
        </div>

        <div class="setting-row">
          <div class="setting-label">
            <h3>Deploy Hook</h3>
            <p>Your private URL to trigger a deploy for this server. Remember to keep this a secret.</p>
          </div>
          <div class="setting-field">
            <div class="hook-box">
              <div class="hook-value">••••••••••••••••••••••••••••••••••••••••••••••••</div>
              <div class="hook-actions">
                <button class="icon-btn">👁</button>
                <button class="icon-btn">📑</button>
              </div>
            </div>
            <button class="btn-link-small">↻ Regenerate hook</button>
          </div>
        </div>
      </section>

      <!-- Custom Domains Section -->
      <section id="domains" class="settings-card">
        <h2 class="card-title">Custom Domains</h2>
        <p class="description">You can point custom domains you own to this service. See DNS configuration instructions.</p>
        
        <button class="btn-outline">+ Add Custom Domain</button>

        <div class="setting-row mt-24">
          <div class="setting-label">
            <h3>Render Subdomain</h3>
            <p>If enabled, your service remains reachable at its onrender.com subdomain in addition to all custom domains. Disable to serve exclusively from custom domains.</p>
          </div>
          <div class="setting-field space-between">
            <div class="toggle-group">
              <label class="switch">
                <input type="checkbox" checked disabled />
                <span class="slider round"></span>
              </label>
              <span class="toggle-label">Enabled</span>
            </div>
            <div class="subdomain-notice">
              Your service is reachable at <a href="#">https://frontend-latest-mdz1.onrender.com</a>
            </div>
          </div>
        </div>
      </section>

      <!-- Edge Caching Section -->
      <section id="caching" class="settings-card">
        <h2 class="card-title">Edge Caching</h2>
        <p class="description">Serve static content at the edge to improve performance and reduce service load. <a href="#">Learn more</a>.</p>
        
        <div class="setting-row">
          <div class="setting-label">
            <h3>Cacheable File Types</h3>
            <p>Specify which file types Render is allowed to cache for your service. You can fine-tune this behavior with Cache-Control headers.</p>
          </div>
          <div class="setting-field">
            <div class="readonly-box">None</div>
            <button class="btn-edit">✎ Edit</button>
          </div>
        </div>

        <div class="notice-bar paid">
          <div class="paid-badge">PAID</div>
          Edge Caching is only available for paid instances.
          <button class="btn-upgrade">Upgrade</button>
        </div>
      </section>

      <!-- Danger Zone -->
      <section id="danger" class="danger-actions">
        <button class="btn-danger">🗑 Delete Web Service</button>
        <button class="btn-suspend">⏸ Suspend Web Service</button>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const editing = reactive({
  name: false,
  image: false,
  dockerCommand: false,
})

const form = reactive({
  name: 'frontend:latest',
  image: 'docker.io/emqarani3/frontend:v1.0.0',
  dockerCommand: '',
  preDeploy: '',
})

const snapshot = { ...form }

const save = (field: keyof typeof editing) => {
  editing[field] = false
  // In a real app, perform API call here
  Object.assign(snapshot, form)
}

const cancel = (field: keyof typeof editing) => {
  editing[field] = false
  // @ts-ignore
  form[field] = snapshot[field]
}
</script>

<style scoped>
.settings-page {
  position: relative;
  max-width: 1200px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 32px;
}

.sections-nav {
  position: fixed;
  right: 40px;
  top: 140px;
  width: 180px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.nav-link {
  color: #666;
  text-decoration: none;
  font-size: 13px;
  transition: color 0.2s;
}

.nav-link:hover { color: #fff; }
.nav-link.active { color: #fff; font-weight: 600; }
.nav-link.delete { color: #ff5252; margin-top: 12px; }

.settings-sections {
  max-width: 800px;
  padding-bottom: 200px;
}

.settings-card {
  background-color: #000;
  border: 1px solid #1a1a1a;
  border-radius: 4px;
  padding: 32px;
  margin-bottom: 32px;
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 32px;
}

.setting-row {
  display: flex;
  gap: 40px;
  margin-bottom: 32px;
}

.setting-label {
  width: 240px;
}

.setting-label h3 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.setting-label p {
  font-size: 12px;
  color: #666;
  line-height: 1.5;
}

.setting-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  position: relative;
}

.setting-field.full {
  align-items: stretch;
}

.field-value {
  width: 100%;
  background-color: #0c0c0c;
  border: 1px solid #1a1a1a;
  padding: 10px 16px;
  border-radius: 4px;
  font-size: 13px;
  color: #fff;
}

.field-value.dimmed { color: #666; }
.field-value.empty { color: #444; }

.readonly-box {
  width: 100%;
  background-color: #0c0c0c;
  border: 1px solid #1a1a1a;
  padding: 10px 16px;
  border-radius: 4px;
  font-size: 13px;
  color: #999;
}

.instance-box {
  width: 100%;
  border: 1px solid #1a1a1a;
  padding: 16px;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plan-name { font-size: 14px; font-weight: 600; margin-right: 12px; }
.plan-specs { font-size: 13px; color: #666; }

.btn-edit {
  background: none;
  border: none;
  color: #999;
  font-size: 12px;
  cursor: pointer;
  align-self: flex-end;
}

.btn-edit:hover:not(:disabled) { color: #fff; }

.edit-input {
  width: 100%;
  background-color: #000;
  border: 1px solid #7b3fe4;
  color: #fff;
  padding: 10px 16px;
  border-radius: 4px;
  font-size: 13px;
  outline: none;
}

.edit-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-save { background-color: #fff; color: #000; border: none; padding: 6px 16px; border-radius: 4px; font-weight: 600; font-size: 12px; cursor: pointer; }
.btn-cancel { background: none; border: 1px solid #333; color: #fff; padding: 6px 16px; border-radius: 4px; font-size: 12px; cursor: pointer; }

.notice-bar {
  width: 100%;
  padding: 12px 16px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.notice-bar.purple { background-color: #1a1033; color: #fff; }
.notice-bar.dark { background-color: #0c0c0c; color: #666; border: 1px solid #1a1a1a; margin-top: 12px; }
.notice-bar.paid { background-color: #000; border: 1px solid #1a1a1a; margin-top: 24px; color: #999; }

.paid-badge { background-color: #1a1033; color: #7b3fe4; font-size: 10px; font-weight: 700; padding: 2px 4px; border-radius: 2px; }

.btn-upgrade { background-color: #fff; color: #000; border: none; padding: 4px 12px; border-radius: 2px; font-weight: 600; font-size: 11px; margin-left: auto; }

.command-input {
  width: 100%;
  background-color: #0c0c0c;
  border: 1px solid #1a1a1a;
  padding: 10px 16px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.command-input input { background: none; border: none; color: #444; flex: 1; outline: none; }
.icon-lock { font-size: 12px; color: #333; }

.hook-box {
  width: 100%;
  background-color: #0c0c0c;
  border: 1px solid #1a1a1a;
  padding: 10px 16px;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
}

.hook-value { color: #333; font-size: 12px; overflow: hidden; }
.hook-actions { display: flex; gap: 8px; }
.icon-btn { background: none; border: none; color: #666; cursor: pointer; }

.btn-link-small { background: none; border: none; color: #7b3fe4; font-size: 11px; cursor: pointer; text-align: right; }

.danger-actions {
  display: flex;
  gap: 16px;
}

.btn-danger { background-color: #ff5252; color: #fff; border: none; padding: 12px 24px; border-radius: 4px; font-weight: 600; cursor: pointer; }
.btn-suspend { background: none; border: 1px solid #333; color: #999; padding: 12px 24px; border-radius: 4px; font-weight: 600; cursor: pointer; }

.switch { position: relative; display: inline-block; width: 34px; height: 20px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; inset: 0; background-color: #222; transition: .4s; border-radius: 20px; }
.slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
input:checked + .slider { background-color: #7b3fe4; }
input:checked + .slider:before { transform: translateX(14px); }

.toggle-group { display: flex; align-items: center; gap: 12px; }
.toggle-label { font-size: 12px; color: #999; }
.subdomain-notice { font-size: 12px; color: #666; }
.subdomain-notice a { color: #7b3fe4; text-decoration: none; }

.btn-outline { background: none; border: 1px solid #333; color: #fff; padding: 8px 16px; border-radius: 4px; font-size: 12px; cursor: pointer; }
.mt-24 { margin-top: 24px; }
</style>
