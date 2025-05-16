<template>
  <v-container fluid class="pa-4" style="background-color: #F9FAFB">
    <v-alert type="warning" color="#FFE9C4" text-color="#8A6D1A" dense border="start" class="mb-4  text-body-2 text-sm-caption">
      마감된 지 7일 지난 경매글은 자동으로 삭제돼요.
    </v-alert>

    <v-row class="mb-4" align="center" dense>
      <v-col cols="12" sm="4">
        <v-select
            v-model="selectedType"
            :items="typeOptions"
            label="딜 타입 필터"
            dense
            hide-details
            variant="outlined"
            @update:model-value="refreshBids"
        />
      </v-col>

      <v-col cols="12" sm="8">
        <v-text-field
            v-model="keywordInput"
            label="상품명 검색"
            prepend-inner-icon="mdi-magnify"
            hide-details
            dense
            variant="outlined"
            @input="handleSearchDebounced"
        />
      </v-col>
    </v-row>

    <v-row dense v-if="bids.length > 0">
      <v-col
          cols="12"
          v-for="bid in sortedBids"
          :key="bid.id"
          @click="goToDeal(bid.deal.id)"
          v-intersect.once="onScrollTrigger"
      >
        <v-card
            class="px-4 py-3 rounded-lg"
            :style="{
            border: '1px solid #E0E0E0',
            background: bid.deal.winnerBidId !== null ? '#F8F8F8' : '#fff',
            boxShadow: 'none',
            opacity: bid.deal.winnerBidId !== null ? 0.7 : 1
          }"
        >
          <div class="d-flex justify-space-between align-center mb-2">
            <div class="font-weight-bold cursor-pointer text-body-1 text-sm-subtitle-2" style="color: #2A2E9D">
              {{ bid.deal.title }}
              <!-- ✅ 신고 텍스트 버튼 -->
              <span
                  class="ml-2 text-caption text-red clickable"
                  style="text-decoration: underline"
                  @click.stop="openReport(bid.deal.userId, bid.deal.id)"
              >신고하기</span>
            </div>
            <v-chip
                v-if="bid.deal.winnerBidId === null"
                size="small"
                style="background-color: #E3EDFF; color: #2A2E9D; font-weight: 500"
                label
                outlined
                class="text-caption"
            >입찰 진행중</v-chip>
            <v-chip
                v-else-if="bid.deal.winnerBidId === bid.id"
                size="small"
                style="background-color: #219653; color: white; font-weight: 500"
                label
                class="text-caption"
            >🎉 낙찰 성공</v-chip>
            <v-chip
                v-else
                size="small"
                style="background-color: #BDBDBD; color: white; font-weight: 500"
                label
                class="text-caption"
            >낙찰 실패</v-chip>
          </div>

          <div class="text-body-2 text-sm-caption" style="color: #444; margin-bottom: 6px">
            내 입찰가: <span style="font-weight: bold; color: #111">{{ bid.amount.toLocaleString() }}원</span>
          </div>
          <div class="text-body-2 text-sm-caption" style="color: #888">
            마감일: {{ formatDate(bid.deal.deadline) }}
          </div>

          <v-btn
              v-if="bid.deal.winnerBidId === null"
              style="margin-top: 12px; background-color: #FF6B6B; color: white"
              size="small"
              @click.stop="cancelBid(bid.id)"
              class="text-caption"
          >
            입찰 취소
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <div v-else class="text-caption text-grey text-center py-6">
      입찰한 물건이 없습니다
    </div>

    <!-- 신고 다이얼로그 -->
    <v-dialog v-model="showReportDialog" max-width="480">
      <v-card>
        <v-card-title>🚨 작성자 신고</v-card-title>
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
  </v-container>
</template>


<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { bidApi } from '@/domains/bid/infrastructure/bidApi'
import { apiClient } from '@/libs/http/apiClient'
import { useDebounceFn } from '@vueuse/core'
import { useSnackbarStore } from '@/stores/snackbarStore'

const router = useRouter()
const snackbar = useSnackbarStore()

const bids = ref<any[]>([])
const page = ref(0)
const size = 10
const totalPages = ref(1)
const isLoading = ref(false)

const keyword = ref<string | null>(null)
const keywordInput = ref('')
const selectedType = ref<string | null>(null)

const showReportDialog = ref(false)
const reportTarget = ref<{ toUserId: number; dealId: number } | null>(null)
const reportReason = ref('')
const reportDetail = ref('')
const reportReasons = ['욕설/비방', '사기 의심', '허위 정보', '기타']

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
    snackbar.show(e.response?.data?.message || '신고 실패', 'error')
  }
}

const typeOptions = [
  { title: '전체', value: null },
  { title: '중고', value: 'used' },
  { title: '알바', value: 'parttime' },
  { title: '물물교환', value: 'barter' },
  { title: '알바구해요', value: 'parttime-request' }
]

const onScrollTrigger = () => {
  if (!isLoading.value && page.value < totalPages.value) {
    fetchBids()
  }
}

const sortedBids = computed(() => {
  const ongoing = bids.value.filter(b => b.deal.winnerBidId === null)
  const completed = bids.value.filter(b => b.deal.winnerBidId !== null)
  return [...ongoing, ...completed]
})

const formatDate = (iso: string) => {
  const date = new Date(iso)
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`
}

const cancelBid = async (bidId: number) => {
  try {
    const isConfirmed = confirm("정말 이 입찰을 취소하시겠습니까?")
    if (!isConfirmed) return
    await bidApi.cancelBid(bidId)
    snackbar.show('입찰이 취소되었습니다.')
    refreshBids()
  } catch (e) {
    snackbar.show('입찰 취소 실패', 'error')
    console.error('입찰 취소 실패:', e)
  }
}

const fetchBids = async () => {
  if (isLoading.value || page.value >= totalPages.value) return
  isLoading.value = true

  try {
    const res = await bidApi.getMyBids({
      page: page.value,
      size,
      keyword: keyword.value,
      type: selectedType.value
    })
    bids.value.push(...res.content)
    totalPages.value = res.totalPages
    page.value++
  } catch (e) {
    snackbar.show('입찰 목록 불러오기 실패', 'error')
    console.error('입찰 목록 불러오기 실패:', e)
  } finally {
    isLoading.value = false
  }
}

const refreshBids = () => {
  page.value = 0
  totalPages.value = 1
  bids.value = []
  fetchBids()
}

const goToDeal = (dealId: number) => {
  router.push(`/deals/detail/${dealId}`)
}

const handleSearchDebounced = useDebounceFn(() => {
  keyword.value = keywordInput.value.trim() || null
  refreshBids()
}, 500)

fetchBids()
</script>
