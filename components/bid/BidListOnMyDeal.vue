<template>
  <v-sheet rounded class="pa-2" color="white">
    <v-row dense v-if="groupedBids.length > 0">
      <v-col cols="12" v-for="group in groupedBids" :key="group.deal.id">
        <v-card class="pa-4 mb-4 rounded-xl elevation-2">
          <!-- 상단 헤더 -->
          <div class="d-flex justify-space-between align-center mb-3">
            <div class="text-subtitle-1 font-weight-bold">
              경매명: {{ group.deal.title }}
              <span class="text-caption text-grey-darken-1 ml-2">({{ group.bids.length }}명 입찰)</span>
            </div>

            <v-chip
                :color="group.deal.winnerBidId ? 'success' : 'info'"
                text-color="white"
                size="small"
                class="font-weight-bold"
            >
              {{ group.deal.winnerBidId ? '낙찰 확정됨' : '입찰 진행중' }}
            </v-chip>
          </div>

          <!-- 입찰 리스트 -->
          <v-list density="compact">
            <v-list-item
                v-for="bid in group.bids"
                :key="bid.id"
                class="mb-3 pa-3 rounded-lg"
                :class="group.deal.winnerBidId === bid.id ? 'bg-green-lighten-5' : 'bg-grey-lighten-4'"
            >
              <div class="d-flex justify-space-between align-center">
                <div>
                  <div class="font-weight-bold text-body-1">
                    입찰가: {{ bid.amount.toLocaleString() }}원 / 입찰자 ID: {{ bid.nickname }}
                  </div>
                  <div
                      v-if="group.deal.winnerBidId === bid.id"
                      class="text-success mt-1 text-caption font-weight-medium"
                  >
                    ✅ 낙찰자
                  </div>
                </div>

                <div class="d-flex align-center" style="gap: 6px">
                  <v-btn
                      v-if="!group.deal.winnerBidId"
                      color="primary"
                      size="small"
                      class="rounded-pill"
                      @click="selectWinner(bid, group.deal.id)"
                  >
                    낙찰 확정
                  </v-btn>

                  <v-btn
                      v-if="group.deal.winnerBidId === bid.id"
                      color="error"
                      size="small"
                      class="rounded-pill"
                      @click="cancelWinner(group.deal.id)"
                  >
                    확정 취소
                  </v-btn>

                  <v-btn
                      v-if="group.deal.winnerBidId === bid.id"
                      variant="tonal"
                      color="indigo"
                      size="small"
                      class="rounded-pill"
                      @click="goToChat(group.deal.id, bid.userId)"
                  >
                    💬 채팅
                  </v-btn>

                  <v-btn
                      v-if="group.deal.winnerBidId === bid.id"
                      variant="tonal"
                      color="deep-purple"
                      size="small"
                      class="rounded-pill"
                      @click="openEvaluation(bid.userId, group.deal.id)"
                  >
                    ⭐ 평가하기
                  </v-btn>

                  <!-- ✅ 입찰자 신고 버튼 -->
                  <v-btn
                      icon
                      color="red"
                      size="x-small"
                      title="입찰자 신고"
                      @click="openReport(bid.userId, group.deal.id)"
                  >
                    신고하기
                  </v-btn>
                </div>
              </div>
            </v-list-item>
          </v-list>

          <!-- 하단 거래종료 버튼 -->
          <v-divider class="my-2" />
          <div class="d-flex justify-end">
            <v-btn
                variant="text"
                color="grey"
                size="small"
                @click="deleteDeal(group.deal.id)"
            >
              거래종료
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <div v-else class="text-caption text-grey text-center py-6">
      내 물건에 입찰된 내용이 없습니다
    </div>

    <!-- 평가 다이얼로그 -->
    <v-dialog v-model="showDialog" max-width="360">
      <v-card>
        <v-card-title>투딜 평가</v-card-title>
        <v-card-text>
          해당 낙찰자에 대해 어떤 평가를 하시겠어요?
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn text color="red" @click="submitEvaluation(false)">👎 비호감</v-btn>
          <v-btn text color="green" @click="submitEvaluation(true)">👍 호감</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 신고 다이얼로그 -->
    <v-dialog v-model="showReportDialog" max-width="480">
      <v-card>
        <v-card-title>🚨 사용자 신고</v-card-title>
        <v-card-text>
          <v-select
              v-model="reportReason"
              :items="reportReasons"
              label="신고 사유"
              required
          />
          <v-textarea
              v-model="reportDetail"
              label="상세 내용 (선택)"
              rows="3"
          />
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn text @click="showReportDialog = false">닫기</v-btn>
          <v-btn color="red" text @click="submitReport">신고하기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-sheet>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { bidApi } from '@/domains/bid/infrastructure/bidApi'
import { dealApi } from '@/domains/deal/infrastructure/dealApi'
import { trustScoreApi } from '@/domains/trustscore/infrastructure/trustScoreApi'
import { apiClient } from '@/libs/http/apiClient'
import { useSnackbarStore } from '@/stores/snackbarStore'

const groupedBids = ref<any[]>([])
const router = useRouter()
const snackbar = useSnackbarStore()

const showDialog = ref(false)
const selectedEvaluation = ref<{ toUserId: number; dealId: number } | null>(null)

const showReportDialog = ref(false)
const reportTarget = ref<{ toUserId: number; dealId: number } | null>(null)
const reportReason = ref('')
const reportDetail = ref('')
const reportReasons = ['욕설/비방', '사기 의심', '허위 정보', '기타']

const fetchBids = async () => {
  try {
    const res = await bidApi.getBidsOnMyDeals()
    groupedBids.value = res
  } catch (e) {
    console.error('내 딜 입찰 목록 실패:', e)
  }
}

const selectWinner = async (bid: any, dealId: number) => {
  try {
    if (!confirm('이 입찰자를 낙찰자로 확정하시겠습니까?')) return
    await bidApi.selectWinnerBid(bid.id)
    selectedEvaluation.value = { toUserId: bid.userId, dealId }
    showDialog.value = true
    await fetchBids()
  } catch (e) {
    console.error('낙찰 실패', e)
  }
}

const openEvaluation = (toUserId: number, dealId: number) => {
  selectedEvaluation.value = { toUserId, dealId }
  showDialog.value = true
}

const submitEvaluation = async (isPositive: boolean) => {
  try {
    if (!selectedEvaluation.value) return
    await trustScoreApi.submitScore(
        selectedEvaluation.value.toUserId,
        selectedEvaluation.value.dealId,
        isPositive
    )
    snackbar.show('투딜 평가가 완료되었습니다!')
    showDialog.value = false
  } catch (e) {
    snackbar.show(e.response?.data?.message ?? '평가 실패', 'error')
    showDialog.value = false
  }
}

const openReport = (toUserId: number, dealId: number) => {
  reportTarget.value = { toUserId, dealId }
  reportReason.value = ''
  reportDetail.value = ''
  showReportDialog.value = true
}

const submitReport = async () => {
  if (!reportTarget.value || !reportReason.value) {
    snackbar.show('신고 사유를 입력해주세요.', 'error')
    return
  }

  try {
    await apiClient.post('/api/reports/submit', {
      toUserId: reportTarget.value.toUserId,
      dealId: reportTarget.value.dealId,
      reason: reportReason.value,
      detail: reportDetail.value
    })
    snackbar.show('신고가 접수되었습니다.')
    showReportDialog.value = false
  } catch (e) {
    snackbar.show(e.response?.data?.message ?? '신고 실패', 'error')
  }
}

const cancelWinner = async (dealId: number) => {
  try {
    if (!confirm('정말 낙찰 확정을 취소하시겠습니까?')) return
    await bidApi.cancelWinnerBid(dealId)
    fetchBids()
  } catch (e) {
    console.error('낙찰 취소 실패:', e)
  }
}

const deleteDeal = async (dealId: number) => {
  try {
    if (!confirm('정말 이 공고를 거래종료 처리하시겠습니까? 관련 채팅도 모두 삭제됩니다.')) return
    await dealApi.deleteDeal(dealId)
    fetchBids()
  } catch (e) {
    console.error('거래종료 실패:', e)
  }
}

const goToChat = (dealId: number, userId: number) => {
  router.push(`/chats/${dealId}`)
}

onMounted(fetchBids)
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>