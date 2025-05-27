<template>
  <v-dialog v-model="dialog" max-width="400">
    <v-card class="pa-4">
      <v-card-title class="text-h6 font-weight-bold">거래 상대를 평가해주세요</v-card-title>
      <v-card-text>
        <div class="text-body-2 mb-4 text-grey-darken-1">
          평가는 투딜지수에 반영되며, 신뢰도 유지에 도움이 됩니다.
        </div>

        <v-textarea
            v-model="comment"
            label="한 줄 후기 (선택)"
            rows="2"
            clearable
            class="mb-4"
        />

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

const comment = ref('')

const submit = async (isPositive: boolean) => {
  try {
    await trustScoreApi.createReview({
      toUserId: props.toUserId,
      dealId: props.dealId,
      isPositive,
      comment: comment.value.trim()
    })
    snackbar.show('평가가 완료되었습니다.', 'success')
  } catch (e) {
    snackbar.show(e.response?.data?.message ?? '평가 실패', 'error')
  } finally {
    dialog.value = false
    comment.value = ''
  }
}
</script>
