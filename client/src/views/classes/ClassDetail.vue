
<!--
  班级详情页面
  展示班级信息及该班级下的学生列表
-->
<template>
  <div class="page-container">
    <div class="page-header">
      <h3>{{ classInfo?.name || '班级详情' }}</h3>
      <el-button @click="goBack">返回</el-button>
    </div>

    <!-- 班级信息 -->
    <el-card shadow="never" class="info-card">
      <el-descriptions :column="3" border>
        <el-descriptions-item label="班级名称">{{ classInfo?.name }}</el-descriptions-item>
        <el-descriptions-item label="年级">{{ classInfo?.grade }}</el-descriptions-item>
        <el-descriptions-item label="所属学院">{{ classInfo?.college_name }}</el-descriptions-item>
        <el-descriptions-item label="班主任">{{ classInfo?.head_teacher_name || '未设置' }}</el-descriptions-item>
        <el-descriptions-item label="学生人数">{{ students.length }} 人</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 学生列表 -->
    <el-card shadow="never">
      <template #header>
        <span>班级学生列表</span>
      </template>
      <el-table :data="students" v-loading="loading" stripe>
        <el-table-column prop="student_no" label="学号" width="100" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="gender" label="性别" width="60" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
              {{ row.status === 'active' ? '在校' : row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getClassByIdApi } from '../../api/modules/class'

const route = useRoute()
const router = useRouter()

const classInfo = ref(null)
const students = ref([])
const loading = ref(true)

async function fetchData() {
  loading.value = true
  try {
    const res = await getClassByIdApi(route.params.id)
    const data = res.data
    classInfo.value = {
      name: data.name,
      grade: data.grade,
      college_name: data.college_name,
      head_teacher_name: data.head_teacher_name,
    }
    students.value = data.students || []
  } catch (err) {
    console.error('获取班级详情失败:', err)
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push('/classes')
}

onMounted(fetchData)
</script>

<style scoped>
.page-container { max-width: 1000px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h3 { font-size: 18px; color: #303133; }
.info-card { margin-bottom: 20px; }
</style>
