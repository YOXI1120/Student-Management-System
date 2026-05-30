
<!--
  个人中心页面
-->
<template>
  <div class="page-container">
    <el-row :gutter="24">
      <!-- 个人信息 -->
      <el-col :span="14">
        <el-card shadow="never">
          <template #header><span>个人信息</span></template>
          <el-descriptions :column="2" border v-if="userStore.userInfo">
            <el-descriptions-item label="用户名">{{ userStore.userInfo.username || '-' }}</el-descriptions-item>
            <el-descriptions-item label="角色">
              <el-tag :type="roleTagType" size="small">{{ roleLabel }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="姓名">{{ userStore.userInfo.name || '-' }}</el-descriptions-item>
            <el-descriptions-item label="性别">{{ userStore.userInfo.gender || '-' }}</el-descriptions-item>
            <el-descriptions-item label="身份证号">{{ userStore.userInfo.id_card || '-' }}</el-descriptions-item>
            <el-descriptions-item label="电话">{{ userStore.userInfo.phone || '-' }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ userStore.userInfo.email || '-' }}</el-descriptions-item>
            <el-descriptions-item v-if="userStore.userInfo.college_name" label="学院">{{ userStore.userInfo.college_name }}</el-descriptions-item>
            <el-descriptions-item v-if="userStore.userInfo.class_name" label="班级">{{ userStore.userInfo.class_name }}</el-descriptions-item>
          </el-descriptions>
          <div v-else class="loading-space">
            <el-skeleton :rows="4" animated />
          </div>
        </el-card>
      </el-col>

      <!-- 修改密码 -->
      <el-col :span="10">
        <el-card shadow="never">
          <template #header><span>修改密码</span></template>
          <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
            <el-form-item label="旧密码" prop="oldPassword">
              <el-input v-model="form.oldPassword" type="password" show-password />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input v-model="form.newPassword" type="password" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="submitting" @click="handleChangePwd">修改密码</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../../store/user'
import { changePasswordApi } from '../../api/modules/auth'

const userStore = useUserStore()
const formRef = ref(null)
const submitting = ref(false)

const form = ref({ oldPassword: '', newPassword: '' })
const rules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
}

const roleTagType = computed(() => {
  const map = { admin: 'danger', teacher: 'warning', student: 'success' }
  return map[userStore.role] || 'info'
})
const roleLabel = computed(() => {
  const map = { admin: '管理员', teacher: '教师', student: '学生' }
  return map[userStore.role] || '未知'
})

async function handleChangePwd() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      await changePasswordApi(form.value)
      ElMessage.success('密码修改成功')
      form.value = { oldPassword: '', newPassword: '' }
    } catch (err) {
      console.error('修改密码失败:', err)
    } finally {
      submitting.value = false
    }
  })
}
</script>

<style scoped>
.page-container { max-width: 1000px; margin: 0 auto; }
.loading-space { padding: 20px; }
</style>
