/**
 * Vite 构建配置
 * 配置开发服务器代理，将 API 请求转发到后端
 */

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],

  server: {
    port: 5173,                         // 开发服务器端口
    open: true,                         // 自动打开浏览器
    proxy: {
      // 将 /api 开头的请求代理到后端 Express 服务器
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },

  resolve: {
    alias: {
      '@': '/src',                      // @ 指向 src 目录，方便导入
    },
  },
})
