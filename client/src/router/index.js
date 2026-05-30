/**
 * 路由配置
 *
 * 包含：
 * 1. 所有页面路由定义
 * 2. 路由守卫（未登录跳转登录页）
 * 3. 角色权限控制
 */

import { createRouter, createWebHistory } from 'vue-router'

// 路由表定义
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/Login.vue'),
    meta: { title: '登录', noAuth: true },   // noAuth 表示不需要登录即可访问
  },
  {
    path: '/',
    component: () => import('../components/Layout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/Dashboard.vue'),
        meta: { title: '首页', icon: 'HomeFilled' },
      },

      // ========== 学院管理 ==========
      {
        path: 'colleges',
        name: 'Colleges',
        component: () => import('../views/colleges/CollegeList.vue'),
        meta: { title: '学院管理', icon: 'School', roles: ['admin'] },
      },

      // ========== 学生管理 ==========
      {
        path: 'students',
        name: 'Students',
        component: () => import('../views/students/StudentList.vue'),
        meta: { title: '学生列表', icon: 'UserFilled', roles: ['admin', 'teacher'] },
      },
      {
        path: 'students/add',
        name: 'StudentAdd',
        component: () => import('../views/students/StudentForm.vue'),
        meta: { title: '新增学生', hidden: true, roles: ['admin'] },
      },
      {
        path: 'students/:id/edit',
        name: 'StudentEdit',
        component: () => import('../views/students/StudentForm.vue'),
        meta: { title: '编辑学生', hidden: true, roles: ['admin'] },
      },

      // ========== 教师管理 ==========
      {
        path: 'teachers',
        name: 'Teachers',
        component: () => import('../views/teachers/TeacherList.vue'),
        meta: { title: '教师管理', icon: 'Avatar', roles: ['admin'] },
      },

      // ========== 班级管理 ==========
      {
        path: 'classes',
        name: 'Classes',
        component: () => import('../views/classes/ClassList.vue'),
        meta: { title: '班级管理', icon: 'Collection', roles: ['admin', 'teacher'] },
      },
      {
        path: 'classes/:id',
        name: 'ClassDetail',
        component: () => import('../views/classes/ClassDetail.vue'),
        meta: { title: '班级详情', hidden: true, roles: ['admin', 'teacher'] },
      },

      // ========== 课程管理（含课程列表 + 排课管理） ==========
      {
        path: 'course-manage',
        name: 'CourseManage',
        component: () => import('../views/course-manage/CourseList.vue'),
        meta: { title: '课程管理', icon: 'Reading', roles: ['admin', 'teacher'] },
      },
      {
        path: 'course-manage/schedules',
        name: 'ScheduleList',
        component: () => import('../views/course-manage/ScheduleList.vue'),
        meta: { title: '排课管理', icon: 'Calendar', roles: ['admin', 'teacher'] },
      },

      // ========== 选课管理（学生端） ==========
      {
        path: 'my-courses',
        name: 'MyCourses',
        component: () => import('../views/my-courses/MyCourses.vue'),
        meta: { title: '我的选课', icon: 'Notebook', roles: ['student'] },
      },
      {
        path: 'courses/elective',
        name: 'Elective',
        component: () => import('../views/elective/ElectiveList.vue'),
        meta: { title: '选修课选课', icon: 'Select', roles: ['student'] },
      },

      // ========== 成绩管理（含查询 + 录入 + 统计） ==========
      {
        path: 'score-manage',
        name: 'ScoreManage',
        component: () => import('../views/score-manage/ScoreList.vue'),
        meta: { title: '成绩查询', icon: 'Document', roles: ['admin', 'teacher', 'student'] },
      },
      {
        path: 'score-manage/entry',
        name: 'ScoreEntry',
        component: () => import('../views/score-manage/ScoreEntry.vue'),
        meta: { title: '成绩录入', icon: 'EditPen', roles: ['admin', 'teacher'] },
      },
      {
        path: 'score-manage/statistics',
        name: 'ScoreStatistics',
        component: () => import('../views/score-manage/ScoreStatistics.vue'),
        meta: { title: '成绩统计', icon: 'DataAnalysis', roles: ['admin', 'teacher'] },
      },

      // ========== 系统管理 ==========
      {
        path: 'users',
        name: 'Users',
        component: () => import('../views/system/UserList.vue'),
        meta: { title: '用户管理', icon: 'Setting', roles: ['admin'] },
      },
      {
        path: 'announcements',
        name: 'Announcements',
        component: () => import('../views/announcements/AnnouncementList.vue'),
        meta: { title: '公告管理', icon: 'Bell', roles: ['admin', 'teacher'] },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../views/system/Profile.vue'),
        meta: { title: '个人中心', icon: 'User', roles: ['admin', 'teacher', 'student'] },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ==================== 路由守卫 ====================

/**
 * 全局前置守卫
 * 1. 检查登录状态，未登录跳转登录页
 * 2. 检查角色权限，无权限跳转首页
 */
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 学生管理系统` : '学生管理系统'

  // 如果页面不需要登录（如登录页），直接放行
  if (to.meta.noAuth) {
    next()
    return
  }

  // 未登录，跳转登录页
  if (!token) {
    next('/login')
    return
  }

  // 检查角色权限（如果路由配置了 roles）
  if (to.meta.roles && !to.meta.roles.includes(role)) {
    next('/dashboard')    // 无权限，跳首页
    return
  }

  next()
})

export default router
