<!--
  成绩查询页面
  按课程/班级/学生维度查询成绩
-->
<template>
  <div class="page-container">
    <div class="page-header">
      <h3>成绩查询</h3>
      <el-button v-if="!isStudent" text type="info" @click="handleExport">导出 Excel</el-button>
    </div>

    <el-card shadow="never" class="filter-card">
      <el-form :model="filters" inline>
        <el-form-item label="课程">
          <el-select v-model="filters.course_schedule_id" placeholder="选择排课" clearable @change="fetchData" style="width:250px">
            <el-option v-for="s in schedules" :key="s.id" :label="`${s.course_name} - ${s.class_name}`" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="班级">
          <el-select v-model="filters.class_id" placeholder="选择班级" clearable @change="fetchData">
            <el-option v-for="c in classes" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column prop="student_no" label="学号" width="100" />
        <el-table-column prop="student_name" label="姓名" width="100" />
        <el-table-column prop="class_name" label="班级" min-width="150" />
        <el-table-column prop="course_name" label="课程" min-width="150" />
        <el-table-column prop="score" label="成绩" width="100">
          <template #default="{ row }">
            <span :style="{ color: row.score < 60 ? '#f56c6c' : '#67c23a', fontWeight: 'bold' }">
              {{ row.score ?? '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="exam_type" label="考试类型" width="100">
          <template #default="{ row }">
            {{ row.exam_type === 'final' ? '期末' : row.exam_type === 'midterm' ? '期中' : row.exam_type === 'makeup' ? '补考' : '平时' }}
          </template>
        </el-table-column>
        <el-table-column prop="exam_date" label="考试日期" width="120" />
      </el-table>
      <div v-if="list.length === 0 && !loading" class="empty">请选择查询条件</div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../../store/user'
import { getScoresApi } from '../../api/modules/score'
import { getSchedulesApi } from '../../api/modules/schedule'
import { getClassesApi } from '../../api/modules/class'
import request from '../../api/request'

const userStore = useUserStore()
const isStudent = computed(() => userStore.isStudent)

const list = ref([])
const schedules = ref([])
const classes = ref([])
const loading = ref(false)

const filters = ref({ course_schedule_id: null, class_id: null })

async function fetchData() {
  loading.value = true
  try {
    const params = {}
    if (filters.value.course_schedule_id) params.course_schedule_id = filters.value.course_schedule_id
    if (filters.value.class_id) params.class_id = filters.value.class_id
    const res = await getScoresApi(params)
    list.value = res.data?.data || res.data || []
  } catch (err) {
    console.error('查询成绩失败:', err)
  } finally {
    loading.value = false
  }
}

async function loadOptions() {
  if (isStudent.value) return
  try {
    const [schRes, clsRes] = await Promise.all([
      getSchedulesApi(),
      getClassesApi(),
    ])
    schedules.value = schRes.data || []
    classes.value = clsRes.data?.data || clsRes.data || []
  } catch (err) {
    console.error('加载选项失败:', err)
  }
}

function resetFilters() {
  filters.value.course_schedule_id = null
  filters.value.class_id = null
  list.value = []
}

async function handleExport() {
  try {
    const params = {}
    if (filters.value.course_schedule_id) params.course_schedule_id = filters.value.course_schedule_id
    if (filters.value.class_id) params.class_id = filters.value.class_id

    const token = localStorage.getItem('token')
    const response = await request.post('/export/scores', params, {
      responseType: 'blob',
      headers: { Authorization: `Bearer ${token}` },
    })

    const url = window.URL.createObjectURL(new Blob([response]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `成绩单_${Date.now()}.xlsx`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (err) {
    console.error('导出失败:', err)
    ElMessage.error('导出失败')
  }
}

onMounted(loadOptions)
</script>

<style scoped>
.page-container { max-width: 1200px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h3 { font-size: 18px; color: #303133; }
.filter-card { margin-bottom: 16px; }
.filter-card .el-select {
  --el-select-width: 250px;
}
.empty { text-align: center; padding: 40px; color: #909399; }
</style>
