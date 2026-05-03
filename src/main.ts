import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { loadRemoteConfig } from '@/shared/config/remoteConfig'

import App from './App.vue'
import router from './router'

async function init() {
  // Load configuration from config.json (prod/staging) or .env (dev)
  await loadRemoteConfig()

  const app = createApp(App)
  app.use(createPinia())
  app.use(router)
  app.mount('#app')
}

init()
