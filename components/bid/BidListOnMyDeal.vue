<template>

  <v-sheet rounded class="pa-2">
    <!-- 검색 필터 -->
    <div class="d-flex align-center mb-4" style="gap: 12px">
      <v-text-field
          v-model="keyword"
          label="제목 검색"
          hide-details
          density="compact"
          clearable
          @keyup.enter="handleSearch"
          class="flex-grow-1"
      />
      <v-btn color="primary" @click="handleSearch">{{ $t('auto_key_160') }}</v-btn>
    </div>

    <v-row dense v-if="groupedBids.length > 0">
      <v-col cols="12" v-for="group in groupedBids" :key="group.deal.id">
        <template v-if="group.deal.pricingType === 'BIDDING'">
          <v-card class="pa-4 mb-2 rounded-lg elevation-2">
            <!-- 상단 헤더 -->
            <div class="d-flex justify-space-between align-center mb-3">
              <div class="text-subtitle-1 font-weight-bold color-black">
                경매명: {{ group.deal.title }}
                <span class="text-caption text-grey-darken-1 ml-2">
                  ({{ group.bids.length }}명 입찰)
                </span>
              </div>
            </div>
            <div class="d-flex justify-space-between align-center">
              <v-chip
                  :color="group.deal.winnerBidId ? 'success' : 'info'"
                  size="small"
                  class="font-weight-bold"
              >
                {{ group.deal.winnerBidId ? '낙찰 확정됨' : '거래 진행중' }}
              </v-chip>
              <v-btn size="small" @click="toggleVisible(group.deal.id)">
                {{ visibleDeals.has(group.deal.id) ? '입찰자 숨기기' : '입찰자 보기' }}
              </v-btn>
            </div>

            <!-- 입찰 리스트 (토글 표시) -->
            <v-list v-if="visibleDeals.has(group.deal.id)" density="compact">
              <v-list-item
                  v-for="bid in group.bids"
                  :key="bid.id"
                  class="mb-3 pa-3 rounded-lg"
                  :class="group.deal.winnerBidId === bid.id ? 'bg-bid-winner' : 'bg-bid-default'"
                  :style="bid.evaluated ? 'opacity: 0.4;' : ''"
              >
                <div class="d-flex justify-space-between align-start flex-wrap" style="gap: 0.75rem">
                  <div style="min-width: 200px">
                    <div class="font-weight-bold customText1">
                      입찰가: {{ bid.amount.toLocaleString() }}원 / 입찰자 ID: {{ bid.nickname }}
                    </div>
                    <div
                        v-if="group.deal.winnerBidId === bid.id"
                        class="mt-1 text-caption font-weight-medium"
                        style="color: #B6FFC7"
                    >
                       낙찰자
                    </div>
                  </div>

                  <div class="d-flex flex-wrap align-center" style="gap: 0.5rem">
                    <v-btn
                        v-if="!group.deal.winnerBidId"
                        :style="{ backgroundColor: '#3F66F8', color: '#fff' }"
                        size="small"
                        class="rounded-pill"
                        @click="selectWinner(bid, group.deal.id)"
                    >
                      낙찰 확정
                    </v-btn>
                    <v-btn
                        v-if="group.deal.winnerBidId === bid.id && !bid.evaluated"
                        :style="{ backgroundColor: '#D9534F', color: '#fff' }"
                        size="small"
                        class="rounded-pill"
                        @click="cancelWinner(group.deal.id)"
                    >
                      확정 취소
                    </v-btn>
                    <v-btn
                        v-if="group.deal.winnerBidId === bid.id"
                        variant="tonal"
                        :style="{ backgroundColor: '#2B2E34', color: '#F2F3F4' }"
                        size="small"
                        class="rounded-pill"
                        @click="goToChat(group.deal.id, bid.userId)"
                    >
                      💬 채팅
                    </v-btn>
                    <v-btn
                        v-if="group.deal.winnerBidId === bid.id && !bid.evaluated"
                        variant="tonal"
                        :style="{ backgroundColor: '#393C47', color: '#FFE082' }"
                        size="small"
                        class="rounded-pill"
                        @click="openEvaluation(bid.userId, group.deal.id)"
                    >
                      ⭐ 평가하기
                    </v-btn>
                    <v-btn
                        size="x-small"
                        variant="text"
                        class="d-flex align-center text-caption px-1"
                        style="color: #FF6B6B"
                        @click="openReport(bid.userId, group.deal.id)"
                    >
                      <v-icon size="16" class="mr-1">mdi-alert-circle-outline</v-icon>
                      <span class="d-none d-sm-inline">{{ $t('auto_key_231') }}</span>
                    </v-btn>
                  </div>
                </div>
              </v-list-item>
            </v-list>

            <!-- 하단 거래종료 버튼 -->
            <v-divider class="my-2" />
            <div class="d-flex justify-end">
              <v-btn variant="text" color="grey" size="small" @click="deleteDeal(group.deal.id)">
                거래종료
              </v-btn>
            </div>
          </v-card>
        </template>

        <template v-else-if="group.deal.pricingType === 'FIXED'">
          <v-card class="pa-4 mb-2 rounded-xl elevation-2">
            <div class="text-subtitle-1 font-weight-bold color-black mb-2">
              {{ group.deal.title }}
            </div>
            <v-chip color="green" text-color="white">{{ $t('auto_key_232') }}</v-chip>
            <div class="mt-3 mb-2 custom-text-sm font-weight-medium">
              정가 {{ group.deal.currentPrice.toLocaleString() }}원에 지원한 사용자 목록
            </div>

            <v-list v-if="group.bids.length > 0" density="compact">
              <v-list-item
                  v-for="bid in group.bids"
                  :key="bid.id"
                  class="mb-3 pa-3 rounded-lg"
                  :class="group.deal.winnerBidId === bid.id ? 'bg-bid-winner' : 'bg-bid-default'"
                  :style="bid.evaluated ? 'opacity: 0.4;' : ''"
              >
                <div class="d-flex justify-space-between align-start flex-wrap" style="gap: 0.75rem">
                  <div>
                    <div class="font-weight-bold customText1">
                      {{ bid.nickname }} 님이 정가로 지원하였습니다.
                    </div>
                    <div
                        v-if="group.deal.winnerBidId === bid.id"
                        class="mt-1 text-caption font-weight-medium"
                        style="color: #B6FFC7"
                    >
                       낙찰자
                    </div>
                  </div>

                  <div class="d-flex flex-wrap align-center" style="gap: 0.5rem">
                    <v-btn
                        v-if="!group.deal.winnerBidId"
                        size="small"
                        class="rounded-pill"
                        color="primary"
                        @click="selectWinner(bid, group.deal.id)"
                    >
                      낙찰 확정
                    </v-btn>

                    <v-btn
                        v-else-if="group.deal.winnerBidId === bid.id && !bid.evaluated"
                        size="small"
                        class="rounded-pill"
                        color="error"
                        @click="cancelWinner(group.deal.id)"
                    >
                      확정 취소
                    </v-btn>

                    <!--  추가된 낙찰자용 버튼들 -->
                    <v-btn
                        v-if="group.deal.winnerBidId === bid.id"
                        variant="tonal"
                        :style="{ backgroundColor: '#2B2E34', color: '#F2F3F4' }"
                        size="small"
                        class="rounded-pill"
                        @click="goToChat(group.deal.id, bid.userId)"
                    >
                      💬 채팅
                    </v-btn>

                    <v-btn
                        v-if="group.deal.winnerBidId === bid.id && !bid.evaluated"
                        variant="tonal"
                        :style="{ backgroundColor: '#393C47', color: '#FFE082' }"
                        size="small"
                        class="rounded-pill"
                        @click="openEvaluation(bid.userId, group.deal.id)"
                    >
                      ⭐ 평가하기
                    </v-btn>

                    <v-btn
                        size="x-small"
                        variant="text"
                        class="d-flex align-center text-caption px-1"
                        style="color: #FF6B6B"
                        @click="openReport(bid.userId, group.deal.id)"
                    >
                      <v-icon size="16" class="mr-1">mdi-alert-circle-outline</v-icon>
                      <span class="d-none d-sm-inline">{{ $t('auto_key_231') }}</span>
                    </v-btn>
                  </div>
                </div>
              </v-list-item>
            </v-list>


            <div v-else class="text-caption text-grey mt-3">{{ $t('auto_key_233') }}</div>
          </v-card>
        </template>
      </v-col>
    </v-row>

    <div v-else class="text-caption text-grey text-center py-6">
      내 물건에 입찰된 내용이 없습니다
    </div>
    <!-- 페이지네이션 -->
    <v-pagination
        v-if="totalPages > 1"
        v-model="page"
        :length="totalPages"
        @update:model-value="fetchBids"
        class="mt-6 d-flex justify-center"
    />

    <!-- 평가 다이얼로그 (컴포넌트로 분리) -->
    <TrustScoreDialog
        v-model="showDialog"
        v-if="selectedEvaluation"
        :to-user-id="selectedEvaluation.toUserId"
        :deal-id="selectedEvaluation.dealId"
    />


    <!-- 신고 다이얼로그 -->
    <v-dialog v-model="showReportDialog" max-width="480">
      <v-card>
        <v-card-title>{{ $t('auto_key_234') }}</v-card-title>
        <v-card-text>
          <v-select
              v-model="reportReason"
              :items="reportReasons"
              label="신고 사유"
              required
          />
          <v-textarea v-model="reportDetail" label="상세 내용 (선택)" rows="3" />
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn text @click="showReportDialog = false">{{ $t('auto_key_174') }}</v-btn>
          <v-btn color="red" text @click="submitReport">{{ $t('auto_key_235') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-sheet>

</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
// console.log(res)
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { bidApi } from "@/domains/bid/infrastructure/bidApi";
import { dealApi } from "@/domains/deal/infrastructure/dealApi";
import { trustScoreApi } from "@/domains/trustscore/infrastructure/trustScoreApi";
import { apiClient } from "@/libs/http/apiClient";
import { useSnackbarStore } from "@/stores/snackbarStore";
import { useAuthStore } from "~/stores/authStore";
import { chatApi } from "~/domains/chat/infrastructure/chatApi";
import TrustScoreDialog from "@/components/trustScore/TrustScoreDialog.vue";
const router = useRouter();
const snackbar = useSnackbarStore();
const groupedBids = ref<any[]>([]);
const visibleDeals = ref<Set<number>>(new Set());
const showDialog = ref(false);

const selectedEvaluation = ref<{
    toUserId: number;
    dealId: number;
} | null>(null);

const showReportDialog = ref(false);

const reportTarget = ref<{
    toUserId: number;
    dealId: number;
} | null>(null);

const reportReason = ref("");
const reportDetail = ref("");
const reportReasons = ["욕설/비방", t("auto_key_240"), t("auto_key_241"), t("auto_key_242")];
const evaluationComment = ref("");
const page = ref(1);
const totalPages = ref(1);
const keyword = ref("");
const size = 10;

const toggleVisible = (dealId: number) => {
    visibleDeals.value.has(dealId) ? visibleDeals.value.delete(dealId) : visibleDeals.value.add(dealId);
};

const fetchBids = async () => {
    try {
        const res = await bidApi.getBidsOnMyDeals({
            page: page.value - 1,
            size,
            keyword: keyword.value
        });

        groupedBids.value = res?.content;
        totalPages.value = Math.ceil(res?.totalElements / size);
    } catch (e) {
        console.error(t("auto_key_243"), e);
    }
};

const handleSearch = () => {
    page.value = 1;
    fetchBids();
};

watch(page, fetchBids);

const selectWinner = async (bid: any, dealId: number) => {
    try {
        if (!confirm(t("auto_key_244")))
            return;

        await bidApi.selectWinnerBid(bid.id);

        selectedEvaluation.value = {
            toUserId: bid.userId,
            dealId
        };

        await fetchBids();
    } catch (e) {
        console.error(t("auto_key_245"), e);
    }
};

const openEvaluation = (toUserId: number, dealId: number) => {
    selectedEvaluation.value = {
        toUserId,
        dealId
    };

    showDialog.value = true;
};

const openReport = (toUserId: number, dealId: number) => {
    reportTarget.value = {
        toUserId,
        dealId
    };

    reportReason.value = "";
    reportDetail.value = "";
    showReportDialog.value = true;
};

const submitReport = async () => {
    if (!reportTarget.value || !reportReason.value) {
        snackbar.show("신고 사유를 입력해주세요.", "error");
        return;
    }

    try {
        await apiClient.post("/api/reports/submit", {
            toUserId: reportTarget.value.toUserId,
            dealId: reportTarget.value.dealId,
            reason: reportReason.value,
            detail: reportDetail.value
        });

        snackbar.show("신고가 접수되었습니다.");
        showReportDialog.value = false;
    } catch (e) {
        snackbar.show(e.response?.data?.message ?? t("auto_key_246"), "error");
    }
};

const cancelWinner = async (dealId: number) => {
    try {
        if (!confirm(t("auto_key_247")))
            return;

        await bidApi.cancelWinnerBid(dealId);
        fetchBids();
    } catch (e) {
        console.error(t("auto_key_248"), e);
    }
};

const deleteDeal = async (dealId: number) => {
    try {
        if (!confirm("정말 이 공고를 거래종료 처리하시겠습니까? 관련 채팅도 모두 삭제됩니다."))
            return;

        await dealApi.deleteDeal(dealId);
        fetchBids();
    } catch (e) {
        console.error(t("auto_key_249"), e);
    }
};

const goToChat = async (dealId: number, ownerId: number) => {
    const userId = useAuthStore().user.id;

    try {
        const existingRoom = await chatApi.checkChatRoomExist({
            dealId,
            userId1: userId,
            userId2: ownerId
        });

        let chatRoomId: number;

        if (existingRoom) {
            chatRoomId = existingRoom.id;
        } else {
            const created = await chatApi.createChatRoom({
                dealId,
                sellerId: ownerId,
                buyerId: userId
            });

            chatRoomId = created.id;
        }

        router.push({
            path: `/chats/${chatRoomId}`,

            query: {
                receiverId: ownerId
            }
        });
    } catch (e) {
        console.error(t("auto_key_250"), e);
        snackbar.show("채팅방 연결에 실패했습니다.", "error");
    }
};

onMounted(fetchBids);
</script>

.gap-2 {
  gap: 8px;
}