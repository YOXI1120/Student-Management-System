
<!--
  我的选课页面（学生端）
  展示已选课程和课表
-->
<template>
  <div class="page-container">
    <div class="page-header">
      <h3>我的选课 / 课表</h3>
    </div>

    <!-- 已选课程列表 -->
    <el-card shadow="never" class="section-card">
      <template #header><span>已选课程</span></template>
      <el-table :data="courseList" v-loading="loading" stripe>
        <el-table-column prop="course_name" label="课程名称" min-width="160" />
        <el-table-column prop="course_code" label="课程代码" width="100" />
        <el-table-column prop="credits" label="学分" width="60" />
        <el-table-column label="类型" width="70">
          <template #default="{ row }">
            <el-tag :type="row.is_auto ? 'primary' : 'success'" size="small">
              {{ row.is_auto ? '必修' : '选修' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="teacher_name" label="授课教师" width="120" />
        <el-table-column label="上课时间" width="200">
          <template #default="{ row }">
            周{{ '一二三四五六日'[row.day_of_week - 1] }} 第{{ row.start_period }}-{{ row.end_period }}节
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button v-if="!row.is_auto" text type="danger" size="small" @click="handleDrop(row)">退选</el-button>
            <span v-else class="auto-tag">自动分配</span>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="courseList.length === 0 && !loading" class="empty">暂无选课记录</div>
    </el-card>

    <!-- 课表视图 -->
    <el-card shadow="never">
      <template #header><span>本周课表</span></template>
      <div v-if="loading" class="empty">加载中...</div>
      <div v-else class="schedule-grid">
        <div class="schedule-header">
          <div class="time-col">节次</div>
          <div v-for="d in 5" :key="d" class="day-col">周{{ '一二三四五'[d-1] }}</div>
        </div>
        <div v-for="p in 8" :key="p" class="schedule-row">
          <div class="time-col">{{ p }}</div>
          <div v-for="d in 5" :key="d" class="day-col">
            <div
              v-for="course in getCourseAt(d, p)"
              :key="course.id"
              class="schedule-cell"
              :class="course.is_auto ? 'required' : 'elective'"
            >
              <div class="cell-name">{{ course.course_name }}</div>
              <div class="cell-teacher">{{ course.teacher_name }}</div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMyCoursesApi, dropCourseApi, getScheduleApi } from '../../api/modules/studentCourse'

const courseList = ref([])
const scheduleData = ref([])
const loading = ref(true)

async function fetchData() {
  loading.value = true
  try {
    const [courseRes, scheduleRes] = await Promise.all([
      getMyCoursesApi(),
      getScheduleApi(),
    ])
    courseList.value = courseRes.data?.data || courseRes.data || []
    scheduleData.value = scheduleRes.data?.schedule || []
  } catch (err) {
    console.error('获取选课数据失败:', err)
  } finally {
    loading.value = false
  }
}

function getCourseAt(day, period) {
  return scheduleData.value.filter(
    c => c.day_of_week === day && c.start_period <= period && c.end_period >= period
  )
}

async function handleDrop(row) {
  try {
    await ElMessageBox.confirm(`确定退选课程「${row.course_name}」吗？`, '提示', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning',
    })
    await dropCourseApi(row.id)
    ElMessage.success('退选成功')
    await fetchData()
  } catch (err) {
    if (err !== 'cancel') console.error('退选失败:', err)
  }
}

onMounted(fetchData)
</script>

<style scoped>
.page-container { max-width: 1000px; margin: 0 auto; }
.page-header { margin-bottom: 20px; }
.page-header h3 { font-size: 18px; color: #303133; }
.section-card { margin-bottom: 20px; }
.empty { text-align: center; padding: 40px; color: #909399; }
.auto-tag { color: #909399; font-size: 12px; }

/* 课表样式 */
.schedule-grid {
  border: 1px solid #ebeef5;
  border-radius: 4px;
}
.schedule-header, .schedule-row {
  display: grid;
  grid-template-columns: 60px repeat(5, 1fr);
  border-bottom: 1px solid #ebeef5;
}
.schedule-header {
  background: #f5f7fa;
  font-weight: bold;
}
.time-col, .day-col {
  padding: 8px;
  text-align: center;
  border-right: 1px solid #ebeef5;
  min-height: 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.time-col {
  color: #909399;
  font-size: 13px;
}
.day-col:last-child { border-right: none; }
.schedule-cell {
  width: 100%;
  padding: 4px 6px;
  border-radius: 4px;
  margin-bottom: 2px;
}
.schedule-cell.required { background: #ecf5ff; border: 1px solid #d9ecff; }
.schedule-cell.elective { background: #f0f9eb; border: 1px solid #e1f3d8; }
.cell-name { font-size: 12px; font-weight: 500; color: #303133; }
.cell-teacher { font-size: 11px; color: #909399; }
</style>
