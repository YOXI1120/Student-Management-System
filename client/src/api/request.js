/**
 * Axios HTTP 请求封装
 *
 * 功能：
 * 1. 统一设置 baseURL
 * 2. 自动携带 JWT token
 * 3. 统一错误处理
 * 4. 响应拦截器：401 自动跳转登录页
 */

import axios from 'axios'
import router from '../router'

// 创建 axios 实例
const request = axios.create({
  baseURL: '/api',              // 通过 Vite 代理转发到后端
  timeout: 15000,                // 请求超时时间（15秒）
})

// ==================== 请求拦截器 ====================
// 每次请求前自动携带 JWT token
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// ==================== 响应拦截器 ====================
// 统一处理响应和错误，组件自行决定是否提示
request.interceptors.response.use(
  (response) => {
    const res = response.data
    // 后端返回业务错误码时，只 reject 让组件自己处理
    if (res.code !== undefined && res.code !== 200 && res.code !== 201) {
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          // token 过期或无效，静默清除状态并跳转登录页
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          router.push('/login')
          break
        case 403:
          // 权限错误需要提示，让用户知道操作被拒绝
          ElMessage.warning('权限不足，无法执行此操作')
          break
        case 404:
          // 资源不存在是常见情况，不弹提示
          break
        case 500:
          // 服务器错误让组件自己决定是否提示
          break
        default:
          break
      }
    }
    return Promise.reject(error)
  }
)

export default request
