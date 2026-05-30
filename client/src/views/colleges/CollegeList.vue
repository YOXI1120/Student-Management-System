
<!--
  学院管理页面
  展示学院列表，支持增删改查
-->
<template>
  <div class="page-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h3>学院管理</h3>
      <el-button type="primary" @click="openDialog()">
        <el-icon><plus /></el-icon> 新增学院
      </el-button>
    </div>

    <!-- 学院列表 -->
    <el-card shadow="never">
      <el-table :data="list" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="code" label="学院代码" width="120" />
        <el-table-column prop="name" label="学院名称" min-width="180" />
        <el-table-column prop="dean" label="院长" width="150" />
        <el-table-column prop="phone" label="联系电话" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="openDialog(row)">编辑</el-button>
            <el-button text type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑学院' : '新增学院'"
      width="500px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="学院名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入学院名称" />
        </el-form-item>
        <el-form-item label="学院代码" prop="code">
          <el-input v-model="form.code" placeholder="请输入学院代码" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="院长" prop="dean">
          <el-input v-model="form.dean" placeholder="请输入院长姓名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
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
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCollegesApi, createCollegeApi, updateCollegeApi, deleteCollegeApi } from '../../api/modules/college'

const list = ref([])
const loading = ref(true)
const submitting = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentId = ref(null)
const formRef = ref(null)

const form = ref({
  name: '',
  code: '',
  dean: '',
  phone: '',
})

const rules = {
  name: [{ required: true, message: '请输入学院名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入学院代码', trigger: 'blur' }],
}

async function fetchData() {
  loading.value = true
  try {
    const res = await getCollegesApi()
    list.value = res.data || res.data?.data || []
  } catch (err) {
    console.error('获取学院列表失败:', err)
  } finally {
    loading.value = false
  }
}

function openDialog(row) {
  if (row) {
    isEdit.value = true
    currentId.value = row.id
    form.value = { ...row }
  } else {
    isEdit.value = false
    currentId.value = null
    form.value = { name: '', code: '', dean: '', phone: '' }
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
        await updateCollegeApi(currentId.value, form.value)
        ElMessage.success('修改成功')
      } else {
        await createCollegeApi(form.value)
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
    await ElMessageBox.confirm(`确定要删除学院「${row.name}」吗？`, '警告', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning',
    })
    await deleteCollegeApi(row.id)
    ElMessage.success('删除成功')
    await fetchData()
  } catch (err) {
    console.error('删除失败:', err)
  }
}

onMounted(fetchData)
</script>

<style scoped>
.page-container { max-width: 1200px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h3 { font-size: 18px; color: #303133; }
</style>
