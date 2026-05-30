
<!--
  选修课选课页面（学生端）
  展示可选选修课列表，支持选课和冲突检测
-->
<template>
  <div class="page-container">
    <div class="page-header">
      <h3>选修课选课</h3>
    </div>

    <el-card shadow="never">
      <template #header>
        <span>可选选修课程</span>
      </template>

      <el-table :data="availableCourses" v-loading="loading" stripe>
        <el-table-column prop="course_name" label="课程名称" min-width="180" />
        <el-table-column prop="course_code" label="课程代码" width="100" />
        <el-table-column prop="credits" label="学分" width="60" />
        <el-table-column prop="teacher_name" label="授课教师" width="120" />
        <el-table-column label="上课时间" width="210">
          <template #default="{ row }">
            周{{ '一二三四五六日'[row.day_of_week - 1] }} 第{{ row.start_period }}-{{ row.end_period }}节
          </template>
        </el-table-column>
        <el-table-column prop="location" label="地点" width="120" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              :loading="selectingId === row.id"
              @click="handleSelect(row)"
            >
              选课
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="availableCourses.length === 0 && !loading" class="empty">
        当前没有可选的选修课程
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAvailableCoursesApi, selectCourseApi } from '../../api/modules/studentCourse'

const availableCourses = ref([])
const loading = ref(true)
const selectingId = ref(null)

async function fetchData() {
  loading.value = true
  try {
    const res = await getAvailableCoursesApi()
    availableCourses.value = res.data?.data || res.data || []
  } catch (err) {
    console.error('获取可选课程失败:', err)
  } finally {
    loading.value = false
  }
}

async function handleSelect(row) {
  selectingId.value = row.id
  try {
    const res = await selectCourseApi({ course_schedule_id: row.id })
    ElMessage.success(`选课成功：${row.course_name}`)
    await fetchData() // 刷新列表
  } catch (err) {
    // 错误已在请求拦截器中处理
    console.error('选课失败:', err)
  } finally {
    selectingId.value = null
  }
}

onMounted(fetchData)
</script>

<style scoped>
.page-container { max-width: 1000px; margin: 0 auto; }
.page-header { margin-bottom: 20px; }
.page-header h3 { font-size: 18px; color: #303133; }
.empty { text-align: center; padding: 40px; color: #909399; }
</style>
