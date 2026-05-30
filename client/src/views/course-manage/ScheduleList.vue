<!--
  排课管理页面
  展示排课列表，支持新增、删除、必修课自动分配
-->
<template>
  <div class="page-container">
    <div class="page-header">
      <h3>排课管理</h3>
      <el-button v-if="userStore.isAdmin" type="primary" @click="openDialog">
        <el-icon><plus /></el-icon> 新增排课
      </el-button>
    </div>

    <el-card shadow="never">
      <!-- 筛选 -->
      <el-form :model="filters" inline class="filter-bar">
        <el-form-item label="学年">
          <el-select v-model="filters.academic_year" placeholder="选择学年" @change="fetchData">
            <el-option label="2024-2025" value="2024-2025" />
            <el-option label="2025-2026" value="2025-2026" />
            <el-option label="2026-2027" value="2026-2027" />
          </el-select>
        </el-form-item>
        <el-form-item label="学期">
          <el-select v-model="filters.semester" placeholder="选择学期" @change="fetchData">
            <el-option label="春季" value="spring" />
            <el-option label="秋季" value="autumn" />
          </el-select>
        </el-form-item>
        <el-form-item label="开课学院">
          <el-select v-model="filters.college_id" placeholder="选择学院" clearable @change="fetchData">
            <el-option v-for="col in colleges" :key="col.id" :label="col.name" :value="col.id" />
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

      <el-table :data="paginatedData" v-loading="loading" stripe>
        <el-table-column label="课程" min-width="150">
          <template #default="{ row }">{{ row.course_name }}</template>
        </el-table-column>
        <el-table-column prop="course_code" label="课程代码" width="100" />
        <el-table-column label="类型" width="70">
          <template #default="{ row }">
            <el-tag :type="row.course_type === 'required' ? 'primary' : 'success'" size="small">
              {{ row.course_type === 'required' ? '必修' : '选修' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="teacher_name" label="授课教师" width="120" />
        <el-table-column prop="class_name" label="班级" min-width="150" />
        <el-table-column label="上课时间" width="200">
          <template #default="{ row }">
            {{ dayLabel(row.day_of_week) }} 第{{ row.start_period }}-{{ row.end_period }}节
          </template>
        </el-table-column>
        <el-table-column prop="academic_year" label="学年" width="100" />
        <el-table-column prop="semester" label="学期" width="60">
          <template #default="{ row }">{{ row.semester === 'spring' ? '春' : '秋' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button v-if="userStore.isAdmin && row.course_type === 'required'" text type="success" @click="handleAutoAssign(row)">分配必修</el-button>
            <el-button v-if="userStore.isAdmin" text type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="list.length"
          layout="total, prev, pager, next"
          small
        />
      </div>
    </el-card>

    <!-- 新增排课对话框 -->
    <el-dialog v-model="dialogVisible" title="新增排课" width="550px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="课程" prop="course_id">
          <el-select v-model="form.course_id" style="width:100%">
            <el-option v-for="c in courses" :key="c.id" :label="`${c.name} (${c.code})`" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="授课教师" prop="teacher_id">
          <el-select v-model="form.teacher_id" style="width:100%">
            <el-option v-for="t in teachers" :key="t.id" :label="t.name" :value="t.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="班级" prop="class_id">
          <el-select v-model="form.class_id" style="width:100%">
            <el-option v-for="c in classes" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="学年" prop="academic_year">
              <el-select v-model="form.academic_year" style="width:100%">
                <el-option label="2024-2025" value="2024-2025" />
                <el-option label="2025-2026" value="2025-2026" />
                <el-option label="2026-2027" value="2026-2027" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学期" prop="semester">
              <el-select v-model="form.semester" style="width:100%">
                <el-option label="春季" value="spring" />
                <el-option label="秋季" value="autumn" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="星期" prop="day_of_week">
              <el-select v-model="form.day_of_week" style="width:100%">
                <el-option v-for="d in 7" :key="d" :label="'周' + '一二三四五六日'[d-1]" :value="d" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="开始节次" prop="start_period">
              <el-input-number v-model="form.start_period" :min="1" :max="12" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="结束节次" prop="end_period">
              <el-input-number v-model="form.end_period" :min="1" :max="12" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '../../store/user'
import { getSchedulesApi, createScheduleApi, deleteScheduleApi } from '../../api/modules/schedule'
import { getCoursesApi } from '../../api/modules/course'
import { getTeachersApi } from '../../api/modules/teacher'
import { getClassesApi } from '../../api/modules/class'
import { getCollegesApi } from '../../api/modules/college'
import { autoAssignCoursesApi } from '../../api/modules/studentCourse'

const userStore = useUserStore()
const list = ref([])
const courses = ref([])
const teachers = ref([])
const classes = ref([])
const colleges = ref([])
const loading = ref(true)
const dialogVisible = ref(false)
const submitting = ref(false)
const formRef = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return list.value.slice(start, start + pageSize.value)
})

const filters = ref({
  academic_year: '2025-2026',
  semester: 'spring',
  class_id: null,
  college_id: null,
})

const form = ref({
  course_id: null, teacher_id: null, class_id: null,
  academic_year: '2025-2026', semester: 'spring',
  day_of_week: 1, start_period: 1, end_period: 2,
})

const rules = {
  course_id: [{ required: true, message: '请选择课程', trigger: 'change' }],
  teacher_id: [{ required: true, message: '请选择教师', trigger: 'change' }],
  class_id: [{ required: true, message: '请选择班级', trigger: 'change' }],
  academic_year: [{ required: true, message: '请选择学年', trigger: 'change' }],
  semester: [{ required: true, message: '请选择学期', trigger: 'change' }],
  day_of_week: [{ required: true, message: '请选择星期', trigger: 'change' }],
  start_period: [{ required: true, message: '请选择开始节次', trigger: 'change' }],
  end_period: [{ required: true, message: '请选择结束节次', trigger: 'change' }],
}

function dayLabel(d) { return '周' + '一二三四五六日'[d - 1] }

function openDialog() {
  form.value = {
    course_id: '', teacher_id: '', class_id: '',
    academic_year: filters.value.academic_year || '2025-2026',
    semester: filters.value.semester || 'spring',
    day_of_week: 1, start_period: 1, end_period: 2,
  }
  dialogVisible.value = true
}

async function fetchData() {
  loading.value = true
  try {
    const params = {}
    if (filters.value.academic_year) params.academic_year = filters.value.academic_year
    if (filters.value.semester) params.semester = filters.value.semester
    if (filters.value.class_id) params.class_id = filters.value.class_id
    if (filters.value.college_id) params.college_id = filters.value.college_id
    const res = await getSchedulesApi(params)
    list.value = res.data?.data || res.data || []
    currentPage.value = 1
  } catch (err) {
    console.error('获取排课列表失败:', err)
  } finally {
    loading.value = false
  }
}

async function loadOptions() {
  try {
    const [couRes, teaRes, clsRes, colRes] = await Promise.all([
      getCoursesApi(),
      getTeachersApi(),
      getClassesApi(),
      getCollegesApi(),
    ])
    courses.value = couRes.data?.data || couRes.data || []
    teachers.value = teaRes.data?.data || teaRes.data || []
    classes.value = clsRes.data?.data || clsRes.data || []
    colleges.value = colRes.data?.data || colRes.data || []
  } catch (err) {
    console.error('加载选项失败:', err)
  }
}

function resetFilters() {
  filters.value.academic_year = '2025-2026'
  filters.value.semester = 'spring'
  filters.value.class_id = null
  filters.value.college_id = null
  fetchData()
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      await createScheduleApi(form.value)
      ElMessage.success('排课成功')
      dialogVisible.value = false
      await fetchData()
    } catch (err) {
      console.error('排课失败:', err)
    } finally {
      submitting.value = false
    }
  })
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm('确定删除此排课吗？', '警告', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning',
    })
    await deleteScheduleApi(row.id)
    ElMessage.success('删除成功')
    await fetchData()
  } catch (err) {
    console.error('删除失败:', err)
  }
}

async function handleAutoAssign(row) {
  try {
    await ElMessageBox.confirm(
      `将为班级「${row.class_name}」的所有学生自动分配课程「${row.course_name}」，确定吗？`,
      '确认自动分配',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'info' }
    )
    const res = await autoAssignCoursesApi({ course_schedule_id: row.id })
    ElMessage.success(res.message || '分配成功')
  } catch (err) {
    console.error('自动分配失败:', err)
  }
}

onMounted(() => {
  loadOptions()
  fetchData()
})
</script>

<style scoped>
.page-container { max-width: 1200px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h3 { font-size: 18px; color: #303133; }
.filter-bar { margin-bottom: 16px; }
.filter-bar .el-select {
  --el-select-width: 220px;
}
.pagination-wrap { display: flex; justify-content: center; margin-top: 20px; }
</style>
