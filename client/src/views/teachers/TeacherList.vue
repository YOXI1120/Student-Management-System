
<!--
  教师管理页面
-->
<template>
  <div class="page-container">
    <div class="page-header">
      <h3>教师管理</h3>
      <el-button type="primary" @click="openDialog()">
        <el-icon><plus /></el-icon> 新增教师
      </el-button>
    </div>

    <!-- 筛选区域 -->
    <el-card shadow="never" class="filter-card">
      <el-form :model="filters" inline>
        <el-form-item label="学院">
          <el-select v-model="filters.college_id" placeholder="选择学院" clearable @change="fetchData">
            <el-option v-for="c in colleges" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="搜索">
          <el-input v-model="filters.keyword" placeholder="姓名/教师编号" clearable @clear="fetchData" @keyup.enter="fetchData" />
        </el-form-item>
        <el-form-item>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <el-table :data="paginatedData" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="teacher_no" label="教师编号" width="130" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="gender" label="性别" width="60" />
        <el-table-column prop="id_card" label="身份证号" width="180" />
        <el-table-column prop="phone" label="电话" width="130" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="college_name" label="所属学院" min-width="150" />
        <el-table-column label="操作" width="200" fixed="right">
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
          :total="list.length"
          layout="total, prev, pager, next"
          small
        />
      </div>
    </el-card>

    <!-- 对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑教师' : '新增教师'" width="550px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别">
              <el-select v-model="form.gender" style="width:100%">
                <el-option label="男" value="男" />
                <el-option label="女" value="女" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="身份证号" prop="id_card">
          <el-input v-model="form.id_card" maxlength="18" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="电话">
              <el-input v-model="form.phone" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱">
              <el-input v-model="form.email" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="所属学院">
          <el-select v-model="form.college_id" style="width:100%">
            <el-option v-for="c in colleges" :key="c.id" :label="c.name" :value="c.id" />
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
import { getTeachersApi, createTeacherApi, updateTeacherApi, deleteTeacherApi } from '../../api/modules/teacher'
import { getCollegesApi } from '../../api/modules/college'

const list = ref([])
const colleges = ref([])
const loading = ref(true)
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const currentId = ref(null)
const formRef = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return list.value.slice(start, start + pageSize.value)
})

const form = ref({
  name: '', id_card: '', gender: '', phone: '', email: '', college_id: null,
})
const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  id_card: [{ required: true, message: '请输入身份证号', trigger: 'blur' }],
}

const filters = ref({ college_id: null, keyword: '' })

async function fetchData() {
  loading.value = true
  try {
    const params = {}
    if (filters.value.college_id) params.college_id = filters.value.college_id
    if (filters.value.keyword) params.keyword = filters.value.keyword
    const res = await getTeachersApi(params)
    list.value = res.data?.length ? res.data : (res.data?.data || res.data || [])
    currentPage.value = 1
  } catch (err) {
    console.error('获取教师列表失败:', err)
  } finally {
    loading.value = false
  }
}

async function fetchColleges() {
  try {
    const res = await getCollegesApi()
    colleges.value = res.data || []
  } catch (err) {
    console.error('获取学院列表失败:', err)
  }
}

function resetFilters() {
  filters.value.college_id = null
  filters.value.keyword = ''
  fetchData()
}

function openDialog(row) {
  if (row) {
    isEdit.value = true
    currentId.value = row.id
    form.value = { ...row }
  } else {
    isEdit.value = false
    currentId.value = null
    form.value = { name: '', id_card: '', gender: '', phone: '', email: '', college_id: filters.value.college_id || null }
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
        await updateTeacherApi(currentId.value, form.value)
        ElMessage.success('修改成功')
      } else {
        await createTeacherApi(form.value)
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
    await ElMessageBox.confirm(`确定删除教师「${row.name}」吗？`, '警告', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning',
    })
    await deleteTeacherApi(row.id)
    ElMessage.success('删除成功')
    await fetchData()
  } catch (err) {
    console.error('删除失败:', err)
  }
}

onMounted(() => {
  fetchColleges()
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
.pagination-wrap { display: flex; justify-content: center; margin-top: 20px; }
</style>
