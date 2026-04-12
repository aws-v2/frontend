<template>
  <div class="env-page">
    <div class="page-header">
      <h1 class="page-title">Environment</h1>
      <button class="btn-outline">+ Create environment group</button>
    </div>

    <!-- Environment Variables Section -->
    <section class="env-section">
      <div class="section-card">
        <div class="card-header">
          <div class="header-left">
            <h3>Environment Variables</h3>
            <p>Set environment-specific config and secrets (such as API keys), then read those values from your code. <a
                href="#">Learn more</a>.</p>
          </div>
          <div class="header-right">
            <template v-if="isEditing">
              <button class="btn-save" @click="saveEnvVars">Save Changes</button>
              <button class="btn-cancel" @click="cancelEdit">Cancel</button>
            </template>
            <template v-else>
              <div class="btn-group">
                <button class="btn-control">Export ⌄</button>
                <button class="btn-control highlight" @click="startEdit">✎ Edit</button>
              </div>
            </template>
          </div>
        </div>

        <div class="env-table">
          <div class="table-header">
            <div class="col-key">KEY</div>
            <div class="col-value">VALUE</div>
          </div>
          <div class="table-body" :class="{ editing: isEditing }">
            <div v-for="(env, index) in envVars" :key="index" class="env-row">
              <div class="col-key">
                <input type="text" v-model="env.key" :placeholder="isEditing ? 'KEY' : ''" :readonly="!isEditing"
                  class="env-input" />
              </div>
              <div class="col-value">
                <div class="value-input-container">
                  <input :type="env.show ? 'text' : 'password'" v-model="env.value"
                    :placeholder="isEditing ? 'VALUE' : ''" :readonly="!isEditing" class="env-input" />
                  <button v-if="!isEditing" class="btn-show" @click="env.show = !env.show">
                    {{ env.show ? '👁️' : '👁️‍🗨️' }}
                  </button>
                </div>
              </div>
              <div v-if="isEditing" class="col-actions">
                <button class="btn-delete" @click="removeEnvVar(index)">🗑️</button>
              </div>
            </div>
          </div>

          <div v-if="isEditing" class="table-footer">
            <button class="btn-add" @click="addEnvVar">+ Add Environment Variable</button>
            <button class="btn-add" @click="showEnvModal = true">📄 Add from .env</button>
          </div>
        </div>

        <div class="card-footer">
          <button class="btn-show-more">↕ Show more</button>
        </div>
      </div>
    </section>

    <!-- Secret Files Section -->
    <section class="env-section">
      <div class="section-card">
        <div class="card-header">
          <div class="header-left">
            <h3>Secret Files</h3>
            <p>Store plaintext files containing secret data (such as a .env file or a private key). Access during builds
              from your app's root, or from /etc/secrets/&lt;filename&gt;.</p>
          </div>
        </div>
        <div class="card-content">
          <button class="btn-outline">+ Add ⌄</button>
        </div>
      </div>
    </section>

    <!-- Linked Environment Groups -->
    <section class="env-section">
      <div class="section-card">
        <div class="card-header">
          <div class="header-left">
            <h3>Linked Environment Groups</h3>
            <p>Environment groups are collections of environment variables and secret files that you can share across
              multiple services.</p>
          </div>
        </div>
        <div class="card-content">
          <p class="empty-state">No environment groups available to link.</p>
          <button class="btn-outline">+ New Environment Group</button>
        </div>
      </div>
    </section>

    <!-- Modals -->
    <AddFromEnvModal v-if="showEnvModal" @close="showEnvModal = false" @add="handleEnvImport" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import AddFromEnvModal from '../components/AddFromEnvModal.vue'

const isEditing = ref(false)
const showEnvModal = ref(false)

const appProfile = import.meta.env.APP_PROFILE
const isProdProfile = appProfile === 'prod'

const initialEnvVars = [
  { key: 'ALCHEMY_URL', value: 'https://eth-mainnet.g.alchemy.com/v2/your-api-key', show: false },
  { key: 'DATABASE_URL', value: `postgresql://root:root@${isProdProfile ? 'postgres' : 'localhost'}:5432/aws_cloud`, show: false },
  { key: 'DEV_MAIL_HOST', value: 'smtp.mailtrap.io', show: false },
  { key: 'DEV_MAIL_PASSWORD', value: 'your-password', show: false },
  { key: 'DEV_MAIL_PORT', value: '2525', show: false },
  { key: 'DEV_MAIL_USERNAME', value: 'your-username', show: false },
  { key: 'FRONTEND_URL', value: isProdProfile ? 'http://13.48.129.233:8080/api/v1/' : 'http://localhost:3000', show: false },
  { key: 'JWT_SECRET', value: 'your-super-secret-jwt-key', show: false },
  { key: 'NATI_FRIEND_API_KEY', value: 'nati-friend-api-key-12345', show: false },
  { key: 'APP_PROFILE', value: appProfile || 'dev', show: false },
]

const envVars = ref([...initialEnvVars])
let backupEnvVars: any[] = []

const startEdit = () => {
  backupEnvVars = JSON.parse(JSON.stringify(envVars.value))
  isEditing.value = true
}

const cancelEdit = () => {
  envVars.value = JSON.parse(JSON.stringify(backupEnvVars))
  isEditing.value = false
}

const saveEnvVars = () => {
  // In a real app, perform API call here
  isEditing.value = false
}

const addEnvVar = () => {
  envVars.value.push({ key: '', value: '', show: true })
}

const removeEnvVar = (index: number) => {
  envVars.value.splice(index, 1)
}

const handleEnvImport = (text: string) => {
  const lines = text.split('\n')
  lines.forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) {
      envVars.value.push({
        key: key.trim(),
        value: valueParts.join('=').trim(),
        show: false
      })
    }
  })
}
</script>

<style scoped>
.env-page {
  padding-bottom: 100px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
}

.env-section {
  margin-bottom: 32px;
}

.section-card {
  background-color: #000;
  border: 1px solid #1a1a1a;
  border-radius: 4px;
  overflow: hidden;
}

.card-header {
  padding: 32px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #1a1a1a;
}

.header-left h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.header-left p {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

.header-left a {
  color: #7b3fe4;
  text-decoration: none;
}

.header-right {
  display: flex;
  gap: 12px;
}

.btn-group {
  display: flex;
  gap: 8px;
}

.btn-control {
  background-color: #0c0c0c;
  border: 1px solid #333;
  color: #fff;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.btn-control.highlight {
  background-color: #fff;
  color: #000;
  border-color: #fff;
}

.btn-save {
  background-color: #7b3fe4;
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.btn-cancel {
  background: none;
  border: 1px solid #333;
  color: #999;
  padding: 8px 20px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
}

.env-table {
  background-color: #0c0c0c;
}

.table-header {
  display: flex;
  padding: 12px 32px;
  border-bottom: 1px solid #1a1a1a;
  font-size: 11px;
  font-weight: 700;
  color: #444;
  letter-spacing: 0.5px;
}

.col-key {
  flex: 1;
}

.col-value {
  flex: 2;
}

.col-actions {
  width: 40px;
}

.table-body {
  max-height: 500px;
  overflow-y: auto;
}

.env-row {
  display: flex;
  padding: 8px 32px;
  border-bottom: 1px solid #1a1a1a;
  align-items: center;
}

.env-row:hover {
  background-color: #111;
}

.env-input {
  width: 100%;
  background: none;
  border: 1px solid transparent;
  color: #ccc;
  padding: 8px 0;
  font-size: 13px;
  font-family: 'JetBrains Mono', monospace;
  outline: none;
}

.editing .env-input {
  background-color: #000;
  border-color: #222;
  padding: 8px 12px;
  border-radius: 4px;
  color: #fff;
}

.editing .env-input:focus {
  border-color: #7b3fe4;
}

.value-input-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-show {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 14px;
}

.btn-delete {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 14px;
}

.btn-delete:hover {
  color: #ff5252;
}

.table-footer {
  padding: 16px 32px;
  display: flex;
  gap: 16px;
  background-color: #000;
}

.btn-add {
  background: none;
  border: 1px solid #333;
  color: #999;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.btn-add:hover {
  color: #fff;
  border-color: #555;
}

.card-footer {
  padding: 16px 32px;
  background-color: #0c0c0c;
  border-top: 1px solid #1a1a1a;
}

.btn-show-more {
  background: none;
  border: 1px solid #333;
  color: #fff;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.card-content {
  padding: 32px;
}

.empty-state {
  font-size: 13px;
  color: #666;
  margin-bottom: 16px;
}

.btn-outline {
  background: none;
  border: 1px solid #333;
  color: #fff;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.btn-outline:hover {
  border-color: #555;
}
</style>
