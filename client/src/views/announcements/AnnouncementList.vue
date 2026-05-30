
<!--
  公告管理页面（管理员）
-->
<template>
  <div class="page-container">
    <div class="page-header">
      <h3>公告管理</h3>
      <el-button v-if="userStore.isAdmin" type="primary" @click="openDialog()">
        <el-icon><plus /></el-icon> 发布公告
      </el-button>
    </div>

    <el-card shadow="never">
      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column label="内容" min-width="300">
          <template #default="{ row }">
            <span class="content-preview">{{ row.content }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="publisher_name" label="发布人" width="100" />
        <el-table-column prop="published_at" label="发布时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button v-if="userStore.isAdmin" text type="primary" @click="openDialog(row)">编辑</el-button>
            <el-button v-if="userStore.isAdmin" text type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑公告' : '发布公告'" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入公告标题" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="6" placeholder="请输入公告内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">发布</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '../../store/user'
import { getAnnouncementsApi, createAnnouncementApi, updateAnnouncementApi, deleteAnnouncementApi } from '../../api/modules/announcement'

const userStore = useUserStore()

const list = ref([])
const loading = ref(true)
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const currentId = ref(null)
const formRef = ref(null)

const form = ref({ title: '', content: '' })
const rules = {
  title: [{ required: true, message: '请输入公告标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入公告内容', trigger: 'blur' }],
}

async function fetchData() {
  loading.value = true
  try {
    const res = await getAnnouncementsApi()
    list.value = res.data?.data || res.data || []
  } catch (err) {
    console.error('获取公告列表失败:', err)
  } finally {
    loading.value = false
  }
}

function openDialog(row) {
  if (row) {
    isEdit.value = true
    currentId.value = row.id
    form.value = { title: row.title, content: row.content }
  } else {
    isEdit.value = false
    currentId.value = null
    form.value = { title: '', content: '' }
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
        await updateAnnouncementApi(currentId.value, form.value)
        ElMessage.success('修改成功')
      } else {
        await createAnnouncementApi(form.value)
        ElMessage.success('发布成功')
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
    await ElMessageBox.confirm(`确定删除公告「${row.title}」吗？`, '警告', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning',
    })
    await deleteAnnouncementApi(row.id)
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
.content-preview { display: inline-block; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
