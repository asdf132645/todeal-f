// ✅ TrustScoreDialog.vue
<template>
  <v-dialog v-model="dialog" max-width="360">
    <v-card class="pa-4">
      <v-card-title class="text-h6 font-weight-bold">거래 상대를 평가해주세요</v-card-title>
      <v-card-text>
        <div class="text-body-2 mb-4 text-grey-darken-1">평가는 투딜지수에 반영되며, 신뢰도 유지에 도움이 됩니다.</div>
        <div class="d-flex justify-space-around">
          <v-btn color="green" @click="submit(true)">👍 신뢰할 수 있어요</v-btn>
          <v-btn color="red" class="ml-2" @click="submit(false)">👎 별로였어요</v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useSnackbarStore } from '@/stores/snackbarStore'
import { trustScoreApi } from '@/domains/trustscore/infrastructure/trustScoreApi'

const props = defineProps<{ toUserId: number; dealId: number }>()
const dialog = defineModel<boolean>()
const snackbar = useSnackbarStore()

const submit = async (isPositive: boolean) => {
  try {
    await trustScoreApi.submitScore(props.toUserId, props.dealId, isPositive)
    snackbar.show('평가가 완료되었습니다.', 'success')
  } catch (e) {
    snackbar.show('평가 중 오류가 발생했습니다.', 'error')
  } finally {
    dialog.value = false
  }
}
</script>