<template>
  <div class="trustscore-card text-center mt-4">
    <v-avatar size="32" class="mb-2" color="deep-orange lighten-4">
      <v-icon size="18" color="deep-orange">mdi-fire</v-icon>
    </v-avatar>
    <div class="text-caption text-grey-darken-1 font-weight-medium mb-1">투딜지수</div>
    <div class="text-h5 font-weight-bold" :class="scoreColor">{{ scoreDisplay }}점</div>
  </div>
</template>


<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { trustScoreApi } from '@/domains/trustscore/infrastructure/trustScoreApi'

const score = ref<number | null>(null)
const { user } = useAuthStore()

onMounted(async () => {
  try {
    const res = await trustScoreApi.getUserScores([user.value.id])
    score.value = res[user.value.id] ?? null
  } catch {
    score.value = null
  }
})

const scoreDisplay = computed(() =>
    score.value !== null && score.value >= 0 ? score.value.toFixed(1) : '-'
)
const scoreColor = computed(() => {
  if (score.value === null) return 'text-grey'
  if (score.value >= 4.5) return 'text-success'
  if (score.value >= 3) return 'text-warning'
  return 'text-error'
})

</script>

<style scoped>
.trustscore-card {
  border-radius: 12px;
  padding: 16px 12px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  width: 130px;
  margin: auto;
}
</style>
