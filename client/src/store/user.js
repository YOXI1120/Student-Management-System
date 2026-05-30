/**
 * 用户状态管理（Pinia）
 *
 * 管理登录用户的 token、角色、个人信息
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loginApi, getProfileApi } from '../api/modules/auth'

export const useUserStore = defineStore('user', () => {
  // ==================== 状态 ====================

  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const role = ref(localStorage.getItem('role') || '')

  // ==================== 计算属性 ====================

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => role.value === 'admin')
  const isTeacher = computed(() => role.value === 'teacher')
  const isStudent = computed(() => role.value === 'student')
  const isHeadTeacher = computed(() => userInfo.value?.is_head_teacher === true)

  // ==================== 方法 ====================

  /**
   * 登录
   * @param {string} username
   * @param {string} password
   */
  async function login(username, password) {
    const res = await loginApi({ username, password })
    const data = res.data

    // 保存 token 到 localStorage 和 state
    token.value = data.token
    role.value = data.role
    localStorage.setItem('token', data.token)
    localStorage.setItem('role', data.role)

    // 获取用户详细信息
    await fetchUserInfo()
    return data
  }

  /**
   * 获取当前用户信息
   */
  async function fetchUserInfo() {
    try {
      const res = await getProfileApi()
      userInfo.value = res.data
      localStorage.setItem('user', JSON.stringify(res.data))
    } catch (err) {
      console.error('获取用户信息失败:', err)
    }
  }

  /**
   * 退出登录
   */
  function logout() {
    token.value = ''
    role.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('user')
  }

  return {
    token,
    userInfo,
    role,
    isLoggedIn,
    isAdmin,
    isTeacher,
    isStudent,
    isHeadTeacher,
    login,
    fetchUserInfo,
    logout,
  }
})
