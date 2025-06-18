<template>
  <div class="trustscore-card">
    <div class="d-flex align-center justify-space-between mb-3">
      <div class="text-subtitle-1 font-weight-bold">투딜지수</div>
      <div class="text-h6 font-weight-bold" :class="scoreColor">
        {{ scoreDisplay }}점
      </div>
    </div>

    <v-divider class="my-3" />

    <div v-for="type in scoreTypes" :key="type.value" class="text-caption d-flex justify-space-between mb-1">
      <span>{{ type.label }}</span>
      <span :class="getTypeColor(type.value)">
        {{ getTypeScoreDisplay(type.value) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { trustScoreApi } from '@/domains/trustscore/infrastructure/trustScoreApi'

const score = ref<number | null>(null)
const typeScores = ref<Record<string, number | null>>({})

const { user } = useAuthStore()

onMounted(async () => {
  try {
    const res = await trustScoreApi.getUserScores([user.id])
    score.value = res?.[String(user.id)] ?? null
  } catch (e) {
    console.error('❌ 투딜지수 로딩 실패', e)
    score.value = null
    typeScores.value = {}
  }
})

const scoreDisplay = computed(() =>
    score.value !== null && score.value >= 0 ? score.value.toFixed(1) : '-'
)

const scoreColor = computed(() => {
  if (score.value === null) return 'text-grey'
  if (score.value >= 80) return 'text-success'
  if (score.value >= 60) return 'text-warning'
  return 'text-error'
})

const scoreTypes = [
  { label: '중고', value: 'USED' },
  { label: '알바', value: 'PARTTIME' },
  { label: '알바요청', value: 'PARTTIME_REQUEST' },
  { label: '빌려드려요', value: 'BARTER' }
]

const getTypeScoreDisplay = (type: string) => {
  const s = typeScores.value[type]
  if (s === null || s === undefined) return '-'
  return `${s.toFixed(1)}점`
}

const getTypeColor = (type: string) => {
  const s = typeScores.value[type]
  if (s === null || s === undefined) return 'text-grey'
  if (s >= 80) return 'text-success'
  if (s >= 60) return 'text-warning'
  return 'text-error'
}
</script>

<style scoped>
.trustscore-card {
  width: 100%;
  padding: 12px 8px;
  background: transparent;
  color: #F2F3F4;
}
</style>
