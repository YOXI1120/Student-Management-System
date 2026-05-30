<!--
  成绩录入页面
  选择排课 → 加载学生列表 → 批量录入成绩
-->
<template>
  <div class="page-container">
    <div class="page-header">
      <h3>成绩录入</h3>
    </div>

    <!-- 第一步：选择排课 -->
    <el-card shadow="never" class="filter-card">
      <el-form :model="form" inline>
        <el-form-item label="选择排课">
          <el-select v-model="form.schedule_id" placeholder="选择排课" @change="loadStudents" style="width:350px">
            <el-option
              v-for="s in schedules"
              :key="s.id"
              :label="`${s.course_name} - ${s.class_name} (${s.teacher_name})`"
              :value="s.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="考试类型">
          <el-select v-model="form.exam_type" style="width:120px">
            <el-option label="期末" value="final" />
            <el-option label="期中" value="midterm" />
            <el-option label="补考" value="makeup" />
          </el-select>
        </el-form-item>
      </el-form>
      <!-- 空状态提示 -->
      <el-empty v-if="!loading && schedules.length === 0" :description="emptyHint" :image-size="80" />
    </el-card>

    <!-- 第二步：录入成绩 -->
    <el-card v-if="form.schedule_id" shadow="never">
      <template #header>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span>成绩录入表</span>
          <el-button type="primary" :loading="saving" @click="handleSave">保存成绩</el-button>
        </div>
      </template>

      <el-table :data="scoreList" v-loading="loading" stripe>
        <el-table-column prop="student_no" label="学号" width="100" />
        <el-table-column prop="student_name" label="姓名" width="100" />
        <el-table-column prop="class_name" label="班级" width="150" />
        <el-table-column label="成绩" width="150">
          <template #default="{ row, $index }">
            <el-input-number
              v-model="row.score"
              :min="0"
              :max="100"
              :precision="1"
              controls-position="right"
              style="width:150px"
              :class="{ 'score-low': row.score !== undefined && row.score < 60 }"
            />
          </template>
        </el-table-column>
        <el-table-column label="考试日期" width="150">
          <template #default="{ row }">
            <el-date-picker v-model="row.exam_date" type="date" style="width:140px" />
          </template>
        </el-table-column>
        <el-table-column label="备注">
          <template #default="{ row }">
            <el-input v-model="row.remarks" placeholder="可选备注" size="small" />
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../../store/user'
import { getSchedulesApi } from '../../api/modules/schedule'
import { getScoresApi, batchSaveScoresApi } from '../../api/modules/score'
import { getStudentsApi } from '../../api/modules/student'
import { getStudentCoursesByScheduleApi } from '../../api/modules/studentCourse'

const userStore = useUserStore()
const schedules = ref([])
const scoreList = ref([])
const loading = ref(false)
const saving = ref(false)

const form = ref({
  schedule_id: '',
  exam_type: 'final',
})

const emptyHint = computed(() => {
  if (userStore.isTeacher) {
    return '暂无您所教的课程，请联系管理员进行排课'
  }
  return '暂无排课数据'
})

async function loadSchedules() {
  try {
    const res = await getSchedulesApi()
    schedules.value = res.data?.data || res.data || []
  } catch (err) {
    console.error('获取排课列表失败:', err)
  }
}

async function loadStudents() {
  if (!form.value.schedule_id) return
  loading.value = true
  try {
    const [scRes, scoreRes, schedule] = await Promise.all([
      getStudentCoursesByScheduleApi(form.value.schedule_id),
      getScoresApi({ course_schedule_id: form.value.schedule_id }),
      Promise.resolve(schedules.value.find(s => s.id === form.value.schedule_id)),
    ])
    if (!schedule) return

    const stuRes = await getStudentsApi({ class_id: schedule.class_id, pageSize: 9999 })
    const students = stuRes.data?.rows || []

    // 构建 student_id → student_course_id 映射
    const scMap = {}
    for (const sc of (scRes.data || [])) {
      scMap[sc.student_id] = sc.student_course_id
    }

    const existingScores = scoreRes.data?.data || scoreRes.data || []

    scoreList.value = students.map(stu => {
      const existing = existingScores.find(
        e => e.student_no === stu.student_no && e.exam_type === form.value.exam_type
      )
      return {
        student_no: stu.student_no,
        student_name: stu.name,
        class_name: stu.class_name,
        student_course_id: scMap[stu.id] || null,
        score: existing?.score ?? undefined,
        exam_date: existing?.exam_date || null,
        remarks: existing?.remarks || '',
      }
    })
  } catch (err) {
    console.error('加载学生数据失败:', err)
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  saving.value = true
  try {
    const payload = {
      scores: scoreList.value
        .filter(item => item.score !== undefined && item.score !== null)
        .map(item => ({
          student_course_id: item.student_course_id,
          score: item.score,
          exam_type: form.value.exam_type,
          exam_date: item.exam_date || null,
          remarks: item.remarks || null,
        })),
    }
    const res = await batchSaveScoresApi(payload)
    ElMessage.success(res.message || '保存成功')
  } catch (err) {
    console.error('保存成绩失败:', err)
  } finally {
    saving.value = false
  }
}

onMounted(loadSchedules)
</script>

<style scoped>
.page-container { max-width: 1200px; margin: 0 auto; }
.page-header { margin-bottom: 20px; }
.page-header h3 { font-size: 18px; color: #303133; }
.filter-card { margin-bottom: 16px; }
:deep(.score-low .el-input__inner) { color: #f56c6c; }
</style>
