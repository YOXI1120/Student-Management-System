<!--
  成绩统计页面
  按课程查看平均分、最高分、最低分、及格率、分数段分布
-->
<template>
  <div class="page-container">
    <div class="page-header">
      <h3>成绩统计</h3>
    </div>

    <el-card shadow="never" class="filter-card">
      <el-form :model="form" inline>
        <el-form-item label="选择课程（排课）">
          <el-select v-model="form.schedule_id" @change="fetchStats" style="width:350px">
            <el-option v-for="s in schedules" :key="s.id" :label="`${s.course_name} - ${s.class_name}`" :value="s.id" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <template v-if="stats">
      <el-row :gutter="20" class="stat-row">
        <el-col :span="6">
          <el-card shadow="never" class="stat-card">
            <div class="stat-label">参考人数</div>
            <div class="stat-value blue">{{ stats.summary?.total_count || 0 }}</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="never" class="stat-card">
            <div class="stat-label">平均分</div>
            <div class="stat-value green">{{ stats.summary?.avg_score || '-' }}</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="never" class="stat-card">
            <div class="stat-label">最高分</div>
            <div class="stat-value orange">{{ stats.summary?.max_score || '-' }}</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="never" class="stat-card">
            <div class="stat-label">及格率</div>
            <div class="stat-value red">{{ stats.summary?.pass_rate || '0' }}%</div>
          </el-card>
        </el-col>
      </el-row>

      <el-card shadow="never" class="section-card">
        <template #header><span>分数段分布</span></template>
        <el-table :data="distributionData" stripe>
          <el-table-column prop="label" label="分数段" width="120" />
          <el-table-column prop="count" label="人数" width="100" />
          <el-table-column label="占比">
            <template #default="{ row }">
              <el-progress
                :percentage="row.percent"
                :color="row.color"
                :stroke-width="20"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </template>

    <div v-else-if="!loading" class="empty">请选择课程查看统计</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getSchedulesApi } from '../../api/modules/schedule'
import { getScoreStatisticsApi } from '../../api/modules/score'

const schedules = ref([])
const stats = ref(null)
const loading = ref(false)

const form = ref({ schedule_id: '' })

const distributionData = computed(() => {
  if (!stats.value?.distribution) return []
  const d = stats.value.distribution
  const total = Object.values(d).reduce((a, b) => a + parseInt(b), 0) || 1
  const items = [
    { label: '优秀 (90-100)', count: parseInt(d.excellent), color: '#67c23a', percent: Math.round(parseInt(d.excellent) / total * 100) },
    { label: '良好 (80-89)', count: parseInt(d.good), color: '#409eff', percent: Math.round(parseInt(d.good) / total * 100) },
    { label: '中等 (70-79)', count: parseInt(d.medium), color: '#e6a23c', percent: Math.round(parseInt(d.medium) / total * 100) },
    { label: '及格 (60-69)', count: parseInt(d.pass), color: '#f56c6c', percent: Math.round(parseInt(d.pass) / total * 100) },
    { label: '不及格 (&lt;60)', count: parseInt(d.fail), color: '#c0c4cc', percent: Math.round(parseInt(d.fail) / total * 100) },
  ]
  return items
})

async function loadSchedules() {
  try {
    const res = await getSchedulesApi()
    schedules.value = res.data?.data || res.data || []
  } catch (err) {
    console.error('获取排课列表失败:', err)
  }
}

async function fetchStats() {
  if (!form.value.schedule_id) return
  loading.value = true
  try {
    const res = await getScoreStatisticsApi({ course_schedule_id: form.value.schedule_id })
    stats.value = res.data
  } catch (err) {
    console.error('获取统计失败:', err)
  } finally {
    loading.value = false
  }
}

onMounted(loadSchedules)
</script>

<style scoped>
.page-container { max-width: 1000px; margin: 0 auto; }
.page-header { margin-bottom: 20px; }
.page-header h3 { font-size: 18px; color: #303133; }
.filter-card { margin-bottom: 20px; }
.stat-row { margin-bottom: 20px; }
.stat-card { text-align: center; padding: 10px; }
.stat-label { font-size: 14px; color: #909399; margin-bottom: 8px; }
.stat-value { font-size: 28px; font-weight: bold; }
.stat-value.blue { color: #409eff; }
.stat-value.green { color: #67c23a; }
.stat-value.orange { color: #e6a23c; }
.stat-value.red { color: #f56c6c; }
.section-card { margin-bottom: 20px; }
.empty { text-align: center; padding: 60px; color: #909399; }
</style>
