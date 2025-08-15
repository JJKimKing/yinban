import App from './App'
import uviewPlus from 'uview-plus'
import { createPinia } from 'pinia'
import './api/request.js'

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()
  
  app.use(uviewPlus)
  app.use(pinia)
  
  return {
    app
  }
}
