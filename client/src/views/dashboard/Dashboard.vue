
<!--
  首页仪表盘
  显示：最新公告、快捷入口、统计概览
-->
<template>
  <div class="dashboard">
    <!-- 欢迎横幅 -->
    <el-card class="welcome-card" shadow="never">
      <div class="welcome-content">
        <div class="welcome-text">
          <h2>欢迎回来，{{ userStore.userInfo?.name || '用户' }}</h2>
          <p>{{ today }}</p>
        </div>
        <div class="welcome-role">
          <el-tag :type="roleTagType" size="large" effect="dark">
            {{ roleLabel }}
          </el-tag>
        </div>
      </div>
    </el-card>

    <!-- 快捷入口（仅管理员和教师） -->
    <el-card v-if="userStore.isAdmin || userStore.isTeacher" class="section-card" shadow="never">
      <template #header>
        <span class="section-title">快捷入口</span>
      </template>
      <div class="quick-links">
        <el-button
          v-for="link in quickLinks"
          :key="link.path"
          :icon="link.icon"
          @click="goTo(link.path)"
          class="quick-btn"
        >
          {{ link.label }}
        </el-button>
      </div>
    </el-card>

    <!-- 最新公告 -->
    <el-card class="section-card" shadow="never">
      <template #header>
        <span class="section-title">最新公告</span>
      </template>
      <div v-if="loading" class="loading-state">
        <el-skeleton :rows="3" animated />
      </div>
      <div v-else-if="announcements.length === 0" class="empty-state">
        暂无公告
      </div>
      <div v-else class="announcement-list">
        <div
          v-for="item in announcements"
          :key="item.id"
          class="announcement-item"
        >
          <div class="announcement-title">{{ item.title }}</div>
          <div class="announcement-meta">
            <span>{{ item.publisher_name }}</span>
            <span>{{ formatDate(item.published_at) }}</span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 统计概览（仅管理员/教师） -->
    <el-row v-if="userStore.isAdmin || userStore.isTeacher" :gutter="20" class="stat-row">
      <el-col :span="6" v-for="stat in statistics" :key="stat.label">
        <el-card class="stat-card" shadow="never">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../store/user'
import { getLatestAnnouncementsApi } from '../../api/modules/announcement'
import { getStudentsApi } from '../../api/modules/student'
import { getTeachersApi } from '../../api/modules/teacher'
import { getCoursesApi } from '../../api/modules/course'
import { getClassesApi } from '../../api/modules/class'

const router = useRouter()
const userStore = useUserStore()

const announcements = ref([])
const loading = ref(true)
const statistics = ref([
  { label: '学生总数', value: 0 },
  { label: '教师总数', value: 0 },
  { label: '课程总数', value: 0 },
  { label: '班级总数', value: 0 },
])

// 今天日期
const today = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 星期${['日', '一', '二', '三', '四', '五', '六'][d.getDay()]}`
})

const roleTagType = computed(() => {
  const map = { admin: 'danger', teacher: 'warning', student: 'success' }
  return map[userStore.role] || 'info'
})
const roleLabel = computed(() => {
  const map = { admin: '管理员', teacher: '教师', student: '学生' }
  return map[userStore.role] || '未知'
})

// 快捷入口
const quickLinks = computed(() => {
  const items = []
  if (userStore.isAdmin) {
    items.push(
      { path: '/students/add', label: '录入学生', icon: 'Plus' },
      { path: '/course-manage/schedules', label: '排课管理', icon: 'Calendar' },
      { path: '/score-manage/entry', label: '录入成绩', icon: 'EditPen' },
      { path: '/users', label: '用户管理', icon: 'Setting' },
    )
  } else if (userStore.isTeacher) {
    items.push(
      { path: '/students', label: '学生列表', icon: 'UserFilled' },
      { path: '/course-manage/schedules', label: '排课查询', icon: 'Calendar' },
      { path: '/score-manage/entry', label: '录入成绩', icon: 'EditPen' },
    )
  }
  return items
})

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

function goTo(path) {
  router.push(path)
}

onMounted(async () => {
  try {
    const res = await getLatestAnnouncementsApi()
    announcements.value = res.data || []
  } catch (err) {
    console.error('获取公告失败:', err)
  } finally {
    loading.value = false
  }

  // 获取统计数据
  try {
    const [stuRes, teaRes, couRes, clsRes] = await Promise.allSettled([
      getStudentsApi({ pageSize: 1 }),
      getTeachersApi(),
      getCoursesApi(),
      getClassesApi(),
    ])
    statistics.value[0].value = stuRes.value?.data?.total || 0
    statistics.value[1].value = teaRes.value?.data?.length || 0
    statistics.value[2].value = couRes.value?.data?.length || 0
    statistics.value[3].value = clsRes.value?.data?.length || 0
  } catch (err) {
    console.error('获取统计失败:', err)
  }
})
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

/* 欢迎横幅 */
.welcome-card {
  background: linear-gradient(135deg, #2d5a9e, #1a2a6c);
  color: #fff;
  border: none;
  margin-bottom: 20px;
  border-radius: 8px;
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-text h2 {
  font-size: 22px;
  margin-bottom: 8px;
}

.welcome-text p {
  font-size: 14px;
  opacity: 0.85;
}

/* 快捷入口 */
.section-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.quick-links {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.quick-btn {
  padding: 20px 24px;
  font-size: 14px;
}

/* 公告列表 */
.announcement-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.announcement-item {
  padding: 12px 16px;
  border-radius: 6px;
  background: #f5f7fa;
  cursor: pointer;
  transition: background 0.2s;
}

.announcement-item:hover {
  background: #ecf5ff;
}

.announcement-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.announcement-meta {
  font-size: 12px;
  color: #909399;
  display: flex;
  gap: 16px;
}

/* 统计卡片 */
.stat-row {
  margin-top: 20px;
}

.stat-card {
  text-align: center;
  border-radius: 8px;
}

.stat-value {
  font-size: 36px;
  font-weight: bold;
  color: #2d5a9e;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.loading-state, .empty-state {
  padding: 20px;
  text-align: center;
  color: #909399;
}
</style>
