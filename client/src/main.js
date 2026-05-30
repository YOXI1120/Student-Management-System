/**
 * 应用入口文件
 * 注册全局组件、插件、路由和状态管理
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// 注册状态管理
app.use(createPinia())

// 注册路由
app.use(router)

// 注册 Element Plus UI 库
app.use(ElementPlus, { locale: undefined }) // 使用中文

// 全局注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 挂载应用
app.mount('#app')
