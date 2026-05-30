
<!--
  学生管理页面
  展示学生列表，支持分页、筛选、新增、编辑、删除、学籍变更
-->
<template>
  <div class="page-container">
    <div class="page-header">
      <h3>学生管理</h3>
      <el-button v-if="userStore.isAdmin" type="primary" @click="goTo('/students/add')">
        <el-icon><plus /></el-icon> 新增学生
      </el-button>
    </div>

    <!-- 筛选区域 -->
    <el-card shadow="never" class="filter-card">
      <el-form :model="filters" inline>
        <el-form-item label="学院">
          <el-select v-model="filters.college_id" placeholder="选择学院" clearable @change="onCollegeChange">
            <el-option v-for="c in colleges" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="班级">
          <el-select v-model="filters.class_id" placeholder="选择班级" clearable @change="fetchData">
            <el-option v-for="c in classes" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部" clearable @change="fetchData">
            <el-option label="在校" value="active" />
            <el-option label="毕业" value="graduated" />
            <el-option label="休学" value="suspended" />
            <el-option label="退学" value="dropped" />
          </el-select>
        </el-form-item>
        <el-form-item label="搜索">
          <el-input v-model="filters.keyword" placeholder="姓名/学号" clearable @clear="fetchData" @keyup.enter="fetchData" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchData">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <el-table :data="students" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="student_no" label="学号" width="100" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="gender" label="性别" width="60" />
        <el-table-column prop="id_card" label="身份证号" width="180" />
        <el-table-column prop="phone" label="电话" width="130" />
        <el-table-column prop="college_name" label="学院" min-width="150" />
        <el-table-column prop="class_name" label="班级" min-width="150" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">
              {{ statusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button v-if="userStore.isAdmin || userStore.isHeadTeacher" text type="primary" @click="goTo(`/students/${row.id}/edit`)">编辑</el-button>
            <el-button v-if="userStore.isAdmin || userStore.isHeadTeacher" text type="warning" @click="openStatusDialog(row)">学籍</el-button>
            <el-button v-if="userStore.isAdmin" text type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrap">
        <el-pagination
          :current-page="filters.page"
          :page-size="10"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="onPageChange"
        />
        <el-button text type="info" :loading="exporting" @click="handleExport">
          导出 Excel
        </el-button>
      </div>
    </el-card>

    <!-- 学籍变更对话框 -->
    <el-dialog v-model="statusDialog" title="学籍变更" width="450px">
      <div v-if="currentStudent" class="status-info">
        <p>当前学生：<strong>{{ currentStudent.name }}</strong>（{{ currentStudent.student_no }}）</p>
        <p>当前状态：<el-tag :type="statusType(currentStudent.status)" size="small">{{ statusLabel(currentStudent.status) }}</el-tag></p>
      </div>
      <el-form ref="statusFormRef" :model="statusForm" :rules="statusRules" label-width="100px" class="status-form">
        <el-form-item label="目标状态" prop="status">
          <el-select v-model="statusForm.status" placeholder="选择目标状态" style="width: 100%">
            <el-option label="在校" value="active" />
            <el-option label="毕业" value="graduated" />
            <el-option label="休学" value="suspended" />
            <el-option label="退学" value="dropped" />
          </el-select>
        </el-form-item>
        <el-form-item label="变更原因" prop="reason">
          <el-input v-model="statusForm.reason" type="textarea" :rows="3" placeholder="请输入变更原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusDialog = false">取消</el-button>
        <el-button type="primary" :loading="statusSubmitting" @click="handleChangeStatus">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '../../store/user'
import { getStudentsApi, deleteStudentApi, changeStudentStatusApi } from '../../api/modules/student'

const userStore = useUserStore()
import { getCollegesApi } from '../../api/modules/college'
import { getClassesApi } from '../../api/modules/class'
import request from '../../api/request'

const router = useRouter()

const students = ref([])
const colleges = ref([])
const classes = ref([])
const total = ref(0)
const loading = ref(true)
const exporting = ref(false)

// 筛选条件
const filters = ref({
  page: 1,
  pageSize: 10,
  college_id: null,
  class_id: null,
  keyword: '',
  status: null,
})

// 学籍变更对话框
const statusDialog = ref(false)
const currentStudent = ref(null)
const statusSubmitting = ref(false)
const statusFormRef = ref(null)
const statusForm = ref({ status: '', reason: '' })
const statusRules = {
  status: [{ required: true, message: '请选择目标状态', trigger: 'change' }],
}

function statusType(status) {
  const map = { active: 'success', graduated: 'info', suspended: 'warning', dropped: 'danger' }
  return map[status] || 'info'
}

function statusLabel(status) {
  const map = { active: '在校', graduated: '毕业', suspended: '休学', dropped: '退学' }
  return map[status] || status
}

async function fetchData() {
  loading.value = true
  try {
    // 只传递有值的参数，避免发送空字符串
    const params = { page: filters.value.page, pageSize: filters.value.pageSize }
    if (filters.value.college_id) params.college_id = filters.value.college_id
    if (filters.value.class_id) params.class_id = filters.value.class_id
    if (filters.value.keyword) params.keyword = filters.value.keyword
    if (filters.value.status) params.status = filters.value.status
    const res = await getStudentsApi(params)
    students.value = res.data?.rows || []
    total.value = res.data?.total || 0
  } catch (err) {
    console.error('获取学生列表失败:', err)
  } finally {
    loading.value = false
  }
}

async function loadFilterOptions() {
  try {
    const colRes = await getCollegesApi()
    colleges.value = colRes.data || []
    // 首次加载班级
    await loadClasses()
  } catch (err) {
    console.error('加载筛选选项失败:', err)
  }
}

async function loadClasses() {
  try {
    const params = {}
    if (filters.value.college_id) params.college_id = filters.value.college_id
    const clsRes = await getClassesApi(params)
    classes.value = clsRes.data?.length ? clsRes.data : (clsRes.data?.data || clsRes.data || [])
  } catch (err) {
    console.error('加载班级选项失败:', err)
  }
}

// 学院变更时，重新加载班级列表并清空已选的班级
async function onCollegeChange() {
  filters.value.class_id = null
  await loadClasses()
  await fetchData()
}

function resetFilters() {
  filters.value.page = 1
  filters.value.college_id = null
  filters.value.class_id = null
  filters.value.keyword = ''
  filters.value.status = null
  loadClasses()
  fetchData()
}

function onPageChange(page) {
  filters.value.page = page
  fetchData()
}

function goTo(path) {
  router.push(path)
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确定删除学生「${row.name}」吗？此操作不可恢复。`, '警告', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning',
    })
    await deleteStudentApi(row.id)
    ElMessage.success('删除成功')
    await fetchData()
  } catch (err) {
    console.error('删除失败:', err)
  }
}

function openStatusDialog(row) {
  currentStudent.value = row
  statusForm.value = { status: '', reason: '' }
  statusDialog.value = true
}

async function handleChangeStatus() {
  if (!statusFormRef.value) return
  await statusFormRef.value.validate(async (valid) => {
    if (!valid) return
    statusSubmitting.value = true
    try {
      await changeStudentStatusApi(currentStudent.value.id, statusForm.value)
      ElMessage.success('学籍变更成功')
      statusDialog.value = false
      await fetchData()
    } catch (err) {
      console.error('学籍变更失败:', err)
    } finally {
      statusSubmitting.value = false
    }
  })
}

async function handleExport() {
  exporting.value = true
  try {
    const params = {}
    if (filters.value.college_id) params.college_id = filters.value.college_id
    if (filters.value.class_id) params.class_id = filters.value.class_id
    if (filters.value.status) params.status = filters.value.status
    if (filters.value.keyword) params.keyword = filters.value.keyword

    // 使用 axios 直接请求获取 blob
    const token = localStorage.getItem('token')
    const response = await request.post('/export/students', params, {
      responseType: 'blob',
      headers: { Authorization: `Bearer ${token}` },
    })

    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `学生名单_${Date.now()}.xlsx`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (err) {
    console.error('导出失败:', err)
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
  }
}

onMounted(() => {
  loadFilterOptions()
  fetchData()
})
</script>

<style scoped>
.page-container { max-width: 1200px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h3 { font-size: 18px; color: #303133; }
.filter-card { margin-bottom: 16px; }
.filter-card .el-select {
  --el-select-width: 220px;
}
.pagination-wrap { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; }
.status-info { padding: 12px 16px; background: #f5f7fa; border-radius: 6px; margin-bottom: 20px; }
.status-info p { margin-bottom: 4px; }
.status-form { margin-top: 16px; }
</style>
