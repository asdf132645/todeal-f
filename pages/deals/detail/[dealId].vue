<template>

  <div v-if="deal" class="py-2">
    <v-alert
        v-if="isExpired"
        type="warning"
        color="grey-lighten-3"
        text
        prominent
        class="mb-2"
    >
      이 경매는 마감되었습니다.
    </v-alert>

    <v-card class="mb-2 pa-3" elevation="1">
      <div class="text-subtitle-2 font-weight-medium mb-1 color-black">{{ $t('auto_key_83') }}</div>
      <div class="text-body-2 mb-1 color-black">
        {{ deal.regionDepth1 }} {{ deal.regionDepth2 }} {{ deal.regionDepth3 }}
      </div>
      <div class="text-caption text-grey color-black">
        작성자 투딜지수: {{ trustScoreWriter }}
      </div>
    </v-card>

    <DealDetailBase :deal="deal" />

    <component
        :is="currentSection"
        :deal="deal"
        :isExpired="isExpired"
        @bid-complete="handleBidComplete"
        v-if="!isExpired"
    />

    <v-card class="mt-6 pa-4" v-if="bids && bids.length > 0">
      <div class="text-subtitle-1 font-weight-bold mb-3 color-black">{{ $t('auto_key_84') }}</div>
      <v-list>
        <v-list-item
            v-for="bid in bids"
            :key="bid.id"
            class="d-flex justify-space-between align-center"
        >
          <div v-if="type === 'barter'">
            제목: <strong>{{ bid.proposedItem }}</strong><br />
            설명 {{ bid.description }}<br />
            사용자 ID: {{ bid.nickname }}<br />
            <span class="text-caption text-grey">
              입찰자 투딜지수: {{ getBidderScore(bid.userId) }}
            </span>
          </div>
          <div v-else>
            {{ bid.amount.toLocaleString() }}원 / [닉네임 : {{ bid.nickname }}]<br />
            <span class="text-caption text-grey">
              입찰자 투딜지수: {{ getBidderScore(bid.userId) }}
            </span>
          </div>
        </v-list-item>
      </v-list>
    </v-card>
  </div>

</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
//  key가 string임을 반영
// console.log('🟢 투딜지수 응답:', result)
//  string key 기반 접근으로 수정
import { useRoute } from "vue-router";
import { onMounted, ref, computed } from "vue";
import { dealApi } from "~/domains/deal/infrastructure/dealApi";
import { bidApi } from "~/domains/bid/infrastructure/bidApi";
import { barterBidApi } from "~/domains/barterBid/infrastructure/barterBidApi";
import { trustScoreApi } from "@/domains/trustscore/infrastructure/trustScoreApi";
import DealDetailBase from "@/components/deal/DealDetailBase.vue";
import UsedDealSection from "@/components/deal/UsedDealSection.vue";
import ParttimeDealSection from "@/components/deal/ParttimeDealSection.vue";
import ParttimeRequestSection from "@/components/deal/ParttimeRequestSection.vue";
import BarterDealSection from "@/components/deal/BarterDealSection.vue";
const route = useRoute();
const dealId = Number(route.params.dealId);
const deal = ref<any>(null);
const bids = ref<any[]>([]);
const userId = ref("");
const trustScores = ref<Record<string, number>>({});
const type = (route.query.type as string)?.toLowerCase() || "";

const sectionMap = {
    used: UsedDealSection,
    parttime: ParttimeDealSection,
    "parttime-request": ParttimeRequestSection,
    barter: BarterDealSection
};

const currentSection = computed(() => sectionMap[type] || UsedDealSection);

const isExpired = computed(() => {
    if (!deal.value)
        return false;

    const now = new Date();
    const deadline = new Date(deal.value.deadline);
    const isTimeOver = deadline < now;
    const isWinnerConfirmed = !!deal.value.winnerBidId;
    return isTimeOver || isWinnerConfirmed;
});

const fetchDeal = async () => {
    deal.value = await dealApi.getDealById(dealId);
};

const fetchBids = async () => {
    if (type === "barter") {
        bids.value = await barterBidApi.getListByDealId(dealId);
    } else {
        bids.value = await bidApi.getBidListByDealId(dealId);
    }

    await fetchTrustScores();
};

const fetchTrustScores = async () => {
    const userIds = new Set<number>();

    if (typeof deal.value?.userId === "number") {
        userIds.add(deal.value.userId);
    }

    bids.value.forEach((b: any) => {
        if (typeof b.userId === "number") {
            userIds.add(b.userId);
        }
    });

    const winnerBid = bids.value.find(b => b.id === deal.value?.winnerBidId);

    if (winnerBid?.userId && typeof winnerBid.userId === "number") {
        userIds.add(winnerBid.userId);
    }

    const uniqueUserIds = Array.from(userIds);

    try {
        const result = await trustScoreApi.getUserScores(uniqueUserIds);
        trustScores.value = result;
    } catch (e) {
        console.warn(t("auto_key_85"), e);
    }
};

const trustScoreWriter = computed(() => {
    if (!deal.value || typeof deal.value.userId !== "number" || !trustScores.value || typeof trustScores.value[String(deal.value.userId)] !== "number")
        return "-";

    return trustScores.value[String(deal.value.userId)].toFixed(1) + t("auto_key_86");
});

const getBidderScore = (userId: number) => {
    if (!userId || typeof userId !== "number" || !trustScores.value || typeof trustScores.value[String(userId)] !== "number")
        return "-";

    return trustScores.value[String(userId)].toFixed(1) + t("auto_key_86");
};

const handleBidComplete = async () => {
    await fetchDeal();
    await fetchBids();
};

onMounted(() => {
    initPage();
});

const initPage = async () => {
    userId.value = localStorage.getItem("userId") || "";
    await fetchDeal();
    await fetchBids();
};
</script>