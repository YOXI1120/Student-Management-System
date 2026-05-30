<!--
  课程管理页面
-->
<template>
  <div class="page-container">
    <div class="page-header">
      <h3>课程管理</h3>
      <el-button type="primary" @click="openDialog()">
        <el-icon><plus /></el-icon> 新增课程
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
        <el-form-item label="类型">
          <el-select v-model="filters.course_type" placeholder="全部" clearable @change="fetchData">
            <el-option label="必修" value="required" />
            <el-option label="选修" value="elective" />
          </el-select>
        </el-form-item>
        <el-form-item label="搜索">
          <el-input v-model="filters.keyword" placeholder="课程名称/代码" clearable @clear="fetchData" @keyup.enter="fetchData" />
        </el-form-item>
        <el-form-item>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="paginatedData" v-loading="loading" stripe>
        <el-table-column prop="code" label="课程代码" width="120" />
        <el-table-column prop="name" label="课程名称" min-width="180" />
        <el-table-column prop="credits" label="学分" width="70" />
        <el-table-column prop="hours" label="学时" width="70" />
        <el-table-column label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="row.course_type === 'required' ? 'primary' : 'success'" size="small">
              {{ row.course_type === 'required' ? '必修' : '选修' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="college_name" label="开课学院" min-width="150" />
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑课程' : '新增课程'" width="550px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="课程名称" prop="name">
              <el-input v-model="form.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="课程代码" prop="code">
              <el-input v-model="form.code" :disabled="isEdit" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="学分" prop="credits">
              <el-input-number v-model="form.credits" :min="0" :max="30" :step="0.5" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学时" prop="hours">
              <el-input-number v-model="form.hours" :min="0" :max="200" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="课程类型" prop="course_type">
          <el-radio-group v-model="form.course_type">
            <el-radio value="required">必修</el-radio>
            <el-radio value="elective">选修</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="开课学院" prop="college_id">
          <el-select v-model="form.college_id" style="width:100%">
            <el-option v-for="c in colleges" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程描述">
          <el-input v-model="form.description" type="textarea" :rows="3" />
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
import { getCoursesApi, createCourseApi, updateCourseApi, deleteCourseApi } from '../../api/modules/course'
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
  name: '', code: '', credits: 3, hours: 48,
  course_type: 'required', college_id: null, description: '',
})
const rules = {
  name: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入课程代码', trigger: 'blur' }],
  college_id: [{ required: true, message: '请选择开课学院', trigger: 'change' }],
}

const filters = ref({ college_id: null, course_type: null, keyword: '' })

async function fetchData() {
  loading.value = true
  try {
    const params = {}
    if (filters.value.college_id) params.college_id = filters.value.college_id
    if (filters.value.course_type) params.course_type = filters.value.course_type
    if (filters.value.keyword) params.keyword = filters.value.keyword
    const res = await getCoursesApi(params)
    list.value = res.data?.length ? res.data : (res.data?.data || res.data || [])
    currentPage.value = 1
  } catch (err) {
    console.error('获取课程列表失败:', err)
  } finally {
    loading.value = false
  }
}

async function loadColleges() {
  try {
    const res = await getCollegesApi()
    colleges.value = res.data || []
  } catch (err) {
    console.error('获取学院列表失败:', err)
  }
}

function resetFilters() {
  filters.value.college_id = null
  filters.value.course_type = null
  filters.value.keyword = ''
  fetchData()
}

function openDialog(row) {
  if (row) {
    isEdit.value = true
    currentId.value = row.id
    form.value = { name: row.name, code: row.code, credits: row.credits, hours: row.hours, course_type: row.course_type, college_id: row.college_id, description: row.description || '' }
  } else {
    isEdit.value = false
    currentId.value = null
    form.value = { name: '', code: '', credits: 3, hours: 48, course_type: 'required', college_id: filters.value.college_id || null, description: '' }
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
        await updateCourseApi(currentId.value, form.value)
        ElMessage.success('修改成功')
      } else {
        await createCourseApi(form.value)
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
    await ElMessageBox.confirm(`确定删除课程「${row.name}」吗？`, '警告', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning',
    })
    await deleteCourseApi(row.id)
    ElMessage.success('删除成功')
    await fetchData()
  } catch (err) {
    console.error('删除失败:', err)
  }
}

onMounted(() => {
  loadColleges()
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
