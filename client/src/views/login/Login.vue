
<!--
  登录页面
  高校门户风格的登录界面
-->
<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="login-bg"></div>

    <!-- 登录卡片 -->
    <div class="login-card">
      <!-- 顶部标识 -->
      <div class="login-header">
        <div class="login-logo">📚</div>
        <h1 class="login-title">学生管理系统</h1>
        <p class="login-subtitle">Guangzhou University Student Management System</p>
      </div>

      <!-- 登录表单 -->
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
            size="large"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>

        <el-button
          type="primary"
          size="large"
          class="login-btn"
          :loading="loading"
          @click="handleLogin"
        >
          {{ loading ? '登录中...' : '登 录' }}
        </el-button>
      </el-form>

      <!-- 提示信息 -->
      <div class="login-footer">
        <p>管理员账号: admin / admin123</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '../../store/user'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function handleLogin() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      await userStore.login(form.username, form.password)
      ElMessage.success('登录成功')
      router.push('/dashboard')
    } catch (err) {
      // 错误已在请求拦截器中处理
      console.error('登录失败:', err)
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: linear-gradient(135deg, #1a2a6c 0%, #2d5a9e 50%, #1e4d7a 100%);
  overflow: hidden;
}

/* 背景装饰 */
.login-bg {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: bgMove 20s linear infinite;
}

@keyframes bgMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

/* 登录卡片 */
.login-card {
  width: 400px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-logo {
  font-size: 48px;
  margin-bottom: 12px;
}

.login-title {
  font-size: 24px;
  color: #1d2b3a;
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 13px;
  color: #909399;
}

.login-form {
  margin-bottom: 16px;
}

.login-btn {
  width: 100%;
  margin-top: 8px;
  height: 44px;
  font-size: 16px;
  background: linear-gradient(135deg, #2d5a9e, #1a2a6c);
  border: none;
}

.login-btn:hover {
  background: linear-gradient(135deg, #3a6ab8, #2d5a9e);
}

.login-footer {
  text-align: center;
  color: #c0c4cc;
  font-size: 12px;
}
</style>
