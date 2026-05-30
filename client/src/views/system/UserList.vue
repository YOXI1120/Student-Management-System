
<!--
  用户管理页面（仅管理员）
-->
<template>
  <div class="page-container">
    <div class="page-header">
      <h3>用户管理</h3>
      <el-button type="primary" @click="openDialog()">
        <el-icon><plus /></el-icon> 新增用户
      </el-button>
    </div>

    <el-card shadow="never">
      <!-- 筛选 -->
      <el-form :model="filters" inline class="filter-bar">
        <el-form-item label="角色">
          <el-select v-model="filters.role" placeholder="全部" clearable @change="fetchData">
            <el-option label="管理员" value="admin" />
            <el-option label="教师" value="teacher" />
            <el-option label="学生" value="student" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部" clearable @change="fetchData">
            <el-option label="正常" value="active" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item label="搜索">
          <el-input v-model="filters.keyword" placeholder="用户名" clearable @clear="fetchData" @keyup.enter="fetchData" />
        </el-form-item>
        <el-form-item>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="row.role === 'admin' ? 'danger' : row.role === 'teacher' ? 'warning' : 'success'" size="small">
              {{ row.role === 'admin' ? '管理员' : row.role === 'teacher' ? '教师' : '学生' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
              {{ row.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="openDialog(row)">编辑</el-button>
            <el-button text type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="fetchData"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑用户' : '新增用户'" width="450px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="密码" :prop="isEdit ? '' : 'password'">
          <el-input v-model="form.password" type="password" show-password :placeholder="isEdit ? '留空则不修改' : '请输入密码'" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" style="width:100%">
            <el-option label="管理员" value="admin" />
            <el-option label="教师" value="teacher" />
            <el-option label="学生" value="student" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" style="width:100%">
            <el-option label="正常" value="active" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
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
import { getUsersApi, createUserApi, updateUserApi, deleteUserApi } from '../../api/modules/user'

const list = ref([])
const total = ref(0)
const loading = ref(true)
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const currentId = ref(null)
const formRef = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)

const form = ref({ username: '', password: '', role: 'student', status: 'active' })
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
}

const filters = ref({ role: null, status: null, keyword: '' })

async function fetchData() {
  loading.value = true
  try {
    const params = { page: currentPage.value, pageSize: pageSize.value }
    if (filters.value.role) params.role = filters.value.role
    if (filters.value.status) params.status = filters.value.status
    if (filters.value.keyword) params.keyword = filters.value.keyword
    const res = await getUsersApi(params)
    list.value = res.data?.rows || []
    total.value = res.data?.total || 0
  } catch (err) {
    console.error('获取用户列表失败:', err)
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  filters.value.role = null
  filters.value.status = null
  filters.value.keyword = ''
  currentPage.value = 1
  fetchData()
}

function openDialog(row) {
  if (row) {
    isEdit.value = true
    currentId.value = row.id
    form.value = { username: row.username, password: '', role: row.role, status: row.status }
  } else {
    isEdit.value = false
    currentId.value = null
    form.value = { username: '', password: '', role: 'student', status: 'active' }
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (isEdit.value) {
        const payload = { role: form.value.role, status: form.value.status }
        if (form.value.password) payload.password = form.value.password
        await updateUserApi(currentId.value, payload)
        ElMessage.success('修改成功')
      } else {
        await createUserApi(form.value)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      await fetchData()
    } catch (err) {
      console.error('提交失败:', err)
    } finally {
      submitting.value = false
    }
  })
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确定删除用户「${row.username}」吗？`, '警告', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning',
    })
    await deleteUserApi(row.id)
    ElMessage.success('删除成功')
    await fetchData()
  } catch (err) {
    console.error('删除失败:', err)
  }
}

onMounted(fetchData)
</script>

<style scoped>
.page-container { max-width: 1000px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h3 { font-size: 18px; color: #303133; }
.filter-bar { margin-bottom: 16px; }
.filter-bar .el-select {
  --el-select-width: 160px;
}
.pagination-wrap { display: flex; justify-content: center; margin-top: 20px; }
</style>
