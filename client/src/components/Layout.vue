
<!--
  主布局组件
  高校门户风格：顶部校名导航条 + 侧边栏菜单 + 主要内容区
-->
<template>
  <el-container class="layout-container">
    <!-- ========== 侧边栏 ========== -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="layout-aside">
      <!-- 校徽/系统标志 -->
      <div class="logo-area">
        <div class="logo-icon">📚</div>
        <transition name="fade">
          <span v-show="!isCollapse" class="logo-text">学生管理系统</span>
        </transition>
      </div>

      <!-- 导航菜单 -->
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :router="true"
        background-color="#1d2b3a"
        text-color="#b0bec5"
        active-text-color="#409eff"
        class="sidebar-menu"
      >
        <!-- 首页 -->
        <el-menu-item index="/dashboard">
          <el-icon><home-filled /></el-icon>
          <template #title>首页</template>
        </el-menu-item>

        <!-- 学院管理（仅管理员） -->
        <el-menu-item v-if="userStore.isAdmin" index="/colleges">
          <el-icon><school /></el-icon>
          <template #title>学院管理</template>
        </el-menu-item>

        <!-- 学生管理 -->
        <el-menu-item v-if="userStore.isAdmin || userStore.isTeacher" index="/students">
          <el-icon><user-filled /></el-icon>
          <template #title>学生管理</template>
        </el-menu-item>

        <!-- 教师管理（仅管理员） -->
        <el-menu-item v-if="userStore.isAdmin" index="/teachers">
          <el-icon><avatar /></el-icon>
          <template #title>教师管理</template>
        </el-menu-item>

        <!-- 班级管理 -->
        <el-menu-item v-if="userStore.isAdmin || userStore.isTeacher" index="/classes">
          <el-icon><collection /></el-icon>
          <template #title>班级管理</template>
        </el-menu-item>

        <!-- 课程管理（含课程列表 + 排课管理） -->
        <el-sub-menu v-if="userStore.isAdmin || userStore.isTeacher" index="course-group">
          <template #title>
            <el-icon><reading /></el-icon>
            <span>课程管理</span>
          </template>
          <el-menu-item index="/course-manage">课程列表</el-menu-item>
          <el-menu-item index="/course-manage/schedules">排课管理</el-menu-item>
        </el-sub-menu>

        <!-- 学生端：我的选课 -->
        <el-menu-item v-if="userStore.isStudent" index="/my-courses">
          <el-icon><notebook /></el-icon>
          <template #title>我的选课</template>
        </el-menu-item>

        <!-- 学生端：选修课选课 -->
        <el-menu-item v-if="userStore.isStudent" index="/courses/elective">
          <el-icon><select /></el-icon>
          <template #title>选修课选课</template>
        </el-menu-item>

        <!-- 成绩管理（含查询 + 录入 + 统计） -->
        <el-sub-menu v-if="userStore.isAdmin || userStore.isTeacher" index="score-group">
          <template #title>
            <el-icon><document /></el-icon>
            <span>成绩管理</span>
          </template>
          <el-menu-item index="/score-manage">成绩查询</el-menu-item>
          <el-menu-item index="/score-manage/entry">成绩录入</el-menu-item>
          <el-menu-item index="/score-manage/statistics">成绩统计</el-menu-item>
        </el-sub-menu>

        <!-- 学生端：成绩查询（独立入口） -->
        <el-menu-item v-if="userStore.isStudent" index="/score-manage">
          <el-icon><document /></el-icon>
          <template #title>成绩查询</template>
        </el-menu-item>

        <!-- 系统管理（仅管理员） -->
        <el-sub-menu v-if="userStore.isAdmin" index="system">
          <template #title>
            <el-icon><setting /></el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/users">用户管理</el-menu-item>
          <el-menu-item index="/announcements">公告管理</el-menu-item>
        </el-sub-menu>

        <!-- 公告查看（教师端只读） -->
        <el-menu-item v-if="userStore.isTeacher" index="/announcements">
          <el-icon><bell /></el-icon>
          <template #title>公告管理</template>
        </el-menu-item>

        <!-- 个人中心 -->
        <el-menu-item index="/profile">
          <el-icon><user /></el-icon>
          <template #title>个人中心</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- ========== 右侧主区域 ========== -->
    <el-container class="main-container">
      <!-- 顶部导航栏 -->
      <el-header class="layout-header">
        <div class="header-left">
          <!-- 折叠按钮 -->
          <el-button text @click="isCollapse = !isCollapse" style="border: none; font-size: 18px;">
            <el-icon :size="20">
              <fold v-if="!isCollapse" />
              <expand v-else />
            </el-icon>
          </el-button>
          <!-- 面包屑 -->
          <span class="page-title">{{ currentTitle }}</span>
        </div>
        <div class="header-right">
          <!-- 角色标签 -->
          <el-tag :type="roleTagType" size="small" class="role-tag">
            {{ roleLabel }}
          </el-tag>
          <!-- 用户信息 -->
          <el-dropdown trigger="click" @command="handleCommand">
            <span class="user-info">
              <el-icon :size="18"><user /></el-icon>
              <span>{{ userStore.userInfo?.name || userStore.userInfo?.username || '用户' }}</span>
              <el-icon><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主要内容区 -->
      <el-main class="layout-main">
        <router-view />
      </el-main>

      <!-- 页脚 -->
      <el-footer class="layout-footer">
        学生管理系统 © 2024 — 广东大学
      </el-footer>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useUserStore } from '../store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 侧边栏折叠状态
const isCollapse = ref(false)

// ==================== 计算属性 ====================

// 当前激活的菜单项
const activeMenu = computed(() => route.path)

// 当前页面标题
const currentTitle = computed(() => route.meta.title || '')

// 角色对应的标签类型
const roleTagType = computed(() => {
  const map = { admin: 'danger', teacher: 'warning', student: 'success' }
  return map[userStore.role] || 'info'
})

// 角色中文名
const roleLabel = computed(() => {
  const map = { admin: '管理员', teacher: '教师', student: '学生' }
  return map[userStore.role] || '未知'
})

// ==================== 方法 ====================

function handleCommand(command) {
  if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'logout') {
    handleLogout()
  }
}

async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    userStore.logout()
    router.push('/login')
  } catch {
    // 取消操作，不处理
  }
}

// 初始化：如果没有用户信息则从后端获取
onMounted(() => {
  if (!userStore.userInfo && userStore.isLoggedIn) {
    userStore.fetchUserInfo()
  }
})
</script>

<style scoped>
/* ========== 整体布局 ========== */
.layout-container {
  height: 100vh;
  background-color: #f0f2f5;
}

/* ========== 侧边栏 ========== */
.layout-aside {
  background-color: #1d2b3a;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
}
.layout-aside::-webkit-scrollbar {
  display: none;
}

.logo-area {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.logo-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.logo-text {
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  white-space: nowrap;
}

.sidebar-menu {
  border-right: none;
}

/* 菜单过渡动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* ========== 顶部导航栏 ========== */
.layout-header {
  height: 56px !important;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.role-tag {
  font-size: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: #606266;
  font-size: 14px;
}

.user-info:hover {
  color: #409eff;
}

/* ========== 主内容区 ========== */
.layout-main {
  background: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}

/* ========== 页脚 ========== */
.layout-footer {
  height: 40px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 12px;
  background: #fff;
  border-top: 1px solid #ebeef5;
}
</style>
