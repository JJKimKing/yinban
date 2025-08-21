import App from './App'

import { createPinia } from 'pinia'
import './api/request.js'

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()
  
  
  app.use(pinia)
  
  return {
    app
  }
}
