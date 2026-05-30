
<!--
  班级管理页面
-->
<template>
  <div class="page-container">
    <div class="page-header">
      <h3>班级管理</h3>
      <el-button type="primary" @click="openDialog()">
        <el-icon><plus /></el-icon> 新增班级
      </el-button>
    </div>

    <el-card shadow="never">
      <!-- 筛选 -->
      <el-form :model="filters" inline class="filter-bar">
        <el-form-item label="学院">
          <el-select v-model="filters.college_id" placeholder="选择学院" clearable @change="fetchData">
            <el-option v-for="c in colleges" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="paginatedData" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="name" label="班级名称" min-width="180" />
        <el-table-column prop="grade" label="年级" width="100" />
        <el-table-column prop="college_name" label="所属学院" min-width="160" />
        <el-table-column prop="head_teacher_name" label="班主任" width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="viewDetail(row)">详情</el-button>
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑班级' : '新增班级'" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="班级名称" prop="name">
          <el-input v-model="form.name" placeholder="如: 计算机科学2023级1班" />
        </el-form-item>
        <el-form-item label="年级" prop="grade">
          <el-input v-model="form.grade" placeholder="如: 2023" />
        </el-form-item>
        <el-form-item label="所属学院" prop="college_id">
          <el-select v-model="form.college_id" style="width:100%">
            <el-option v-for="c in colleges" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="班主任">
          <el-select v-model="form.head_teacher_id" clearable style="width:100%">
            <el-option v-for="t in teachers" :key="t.id" :label="t.name" :value="t.id" />
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
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getClassesApi, createClassApi, updateClassApi, deleteClassApi } from '../../api/modules/class'
import { getCollegesApi } from '../../api/modules/college'
import { getTeachersApi } from '../../api/modules/teacher'

const router = useRouter()
const list = ref([])
const colleges = ref([])
const teachers = ref([])
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

const form = ref({ name: '', grade: '', college_id: null, head_teacher_id: null })
const rules = {
  name: [{ required: true, message: '请输入班级名称', trigger: 'blur' }],
  college_id: [{ required: true, message: '请选择所属学院', trigger: 'change' }],
}

const filters = ref({ college_id: null })

async function fetchData() {
  loading.value = true
  try {
    const params = {}
    if (filters.value.college_id) params.college_id = filters.value.college_id
    const res = await getClassesApi(params)
    list.value = res.data?.length ? res.data : (res.data?.data || res.data || [])
    currentPage.value = 1
  } catch (err) {
    console.error('获取班级列表失败:', err)
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  filters.value.college_id = null
  fetchData()
}

async function loadOptions() {
  try {
    const [colRes, teaRes] = await Promise.all([
      getCollegesApi(),
      getTeachersApi(),
    ])
    colleges.value = colRes.data || []
    teachers.value = teaRes.data?.data || teaRes.data || []
  } catch (err) {
    console.error('加载选项失败:', err)
  }
}

function openDialog(row) {
  if (row) {
    isEdit.value = true
    currentId.value = row.id
    form.value = { name: row.name, grade: row.grade, college_id: row.college_id, head_teacher_id: row.head_teacher_id || '' }
  } else {
    isEdit.value = false
    currentId.value = null
    form.value = { name: '', grade: '', college_id: filters.value.college_id || null, head_teacher_id: null }
  }
  dialogVisible.value = true
}

function viewDetail(row) {
  router.push(`/classes/${row.id}`)
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const data = { ...form.value }
      if (isEdit.value) {
        await updateClassApi(currentId.value, data)
        ElMessage.success('修改成功')
      } else {
        await createClassApi(data)
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
    await ElMessageBox.confirm(`确定删除班级「${row.name}」吗？`, '警告', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning',
    })
    await deleteClassApi(row.id)
    ElMessage.success('删除成功')
    await fetchData()
  } catch (err) {
    console.error('删除失败:', err)
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
.pagination-wrap { display: flex; justify-content: center; margin-top: 20px; }
.filter-bar .el-select {
  --el-select-width: 220px;
}
</style>
