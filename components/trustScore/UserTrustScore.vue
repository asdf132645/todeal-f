<template>
  <div class="trustscore-card text-center mt-4">
    <v-avatar size="32" class="mb-2" color="#FFD54F">
      <v-icon size="18" color="#0E0F10">mdi-fire</v-icon>
    </v-avatar>
    <div class="text-caption mb-1 color-white" style="color: #A6A9AD">투딜지수</div>
    <div class="text-h5 font-weight-bold" :class="scoreColor">{{ scoreDisplay }}점</div>

    <!-- ✅ 타입별 breakdown -->
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

const REVIEW_PAGE_SIZE = 100

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

// ✅ 타입 목록
const scoreTypes = [
  { label: '중고', value: 'USED' },
  { label: '알바', value: 'PARTTIME' },
  { label: '알바요청', value: 'PARTTIME_REQUEST' },
  { label: '빌려드려요', value: 'BARTER' }
]

// ✅ 타입별 점수 표시
const getTypeScoreDisplay = (type: string) => {
  const s = typeScores.value[type]
  if (s === null || s === undefined) return '-'
  return `${s.toFixed(1)}점`
}

// ✅ 타입별 색상
const getTypeColor = (type: string) => {
  const s = typeScores.value[type]
  if (s === null || s === undefined) return 'text-grey'
  if (s >= 80) return 'text-success'
  if (s >= 60) return 'text-warning'
  return 'text-error'
}
</script>

<style>
.trustscore-card {
  border-radius: 12px;
  padding: 16px 12px;
  background: #1A1B1D;
  color: #F2F3F4;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  width: 180px;
  margin: auto;
}
</style>
