
<!--
  学生表单页面（新增/编辑共用）
-->
<template>
  <div class="page-container">
    <div class="page-header">
      <h3>{{ isEdit ? '编辑学生' : '新增学生' }}</h3>
    </div>

    <el-card shadow="never">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" class="student-form">
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-select v-model="form.gender" placeholder="请选择" style="width:100%">
                <el-option label="男" value="男" />
                <el-option label="女" value="女" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="身份证号" prop="id_card">
              <el-input v-model="form.id_card" placeholder="请输入18位身份证号" maxlength="18" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出生日期" prop="date_of_birth">
              <el-date-picker v-model="form.date_of_birth" type="date" placeholder="选择日期" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="住址" prop="address">
          <el-input v-model="form.address" placeholder="请输入家庭住址" />
        </el-form-item>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="所属学院">
              <el-select v-model="form.college_id" placeholder="选择学院" @change="loadClasses" style="width:100%">
                <el-option v-for="c in colleges" :key="c.id" :label="c.name" :value="c.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属班级" prop="class_id">
              <el-select v-model="form.class_id" placeholder="选择班级" style="width:100%">
                <el-option v-for="c in classes" :key="c.id" :label="c.name" :value="c.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="入学日期" prop="enrollment_date">
          <el-date-picker v-model="form.enrollment_date" type="date" placeholder="选择入学日期" style="width:100%" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getStudentByIdApi, createStudentApi, updateStudentApi } from '../../api/modules/student'
import { getCollegesApi } from '../../api/modules/college'
import { getClassesApi } from '../../api/modules/class'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const formRef = ref(null)
const submitting = ref(false)
const colleges = ref([])
const classes = ref([])

const form = ref({
  name: '', gender: '', id_card: '', date_of_birth: '',
  phone: '', email: '', address: '', class_id: '', enrollment_date: '',
})

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  id_card: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /^\d{17}[\dXx]$/, message: '身份证号格式不正确', trigger: 'blur' },
  ],
}

async function loadColleges() {
  try {
    const res = await getCollegesApi()
    colleges.value = res.data || []
  } catch (err) {
    console.error('加载学院列表失败:', err)
  }
}

async function loadClasses(collegeId) {
  if (!collegeId && !form.value.college_id) return
  try {
    const params = { college_id: collegeId || form.value.college_id }
    const res = await getClassesApi(params)
    classes.value = res.data?.data || res.data || []
  } catch (err) {
    console.error('加载班级列表失败:', err)
  }
}

async function loadStudent() {
  try {
    const res = await getStudentByIdApi(route.params.id)
    const data = res.data
    form.value = {
      name: data.name || '',
      gender: data.gender || '',
      id_card: data.id_card || '',
      date_of_birth: data.date_of_birth || '',
      phone: data.phone || '',
      email: data.email || '',
      address: data.address || '',
      class_id: data.class_id || '',
      enrollment_date: data.enrollment_date || '',
    }
    if (data.class_id) {
      await loadClasses()
    }
  } catch (err) {
    console.error('加载学生信息失败:', err)
  }
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const payload = { ...form.value }
      if (isEdit.value) {
        await updateStudentApi(route.params.id, payload)
        ElMessage.success('修改成功')
      } else {
        await createStudentApi(payload)
        ElMessage.success('创建成功')
      }
      router.push('/students')
    } catch (err) {
      console.error('提交失败:', err)
    } finally {
      submitting.value = false
    }
  })
}

function goBack() {
  router.push('/students')
}

onMounted(async () => {
  await loadColleges()
  if (isEdit.value) {
    await loadStudent()
  }
})
</script>

<style scoped>
.page-container { max-width: 900px; margin: 0 auto; }
.page-header { margin-bottom: 20px; }
.page-header h3 { font-size: 18px; color: #303133; }
.student-form { max-width: 800px; }
</style>
