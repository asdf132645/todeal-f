<template>

  <v-list flat v-if="user">
    <div class="px-2 text-h6 font-weight-bold color-black mt-2">{{ user.nickname }}</div>
    <div class="px-2 text-body-2 color-black">{{ user.email }}</div>

    <!--  유저 정보 -->
    <UserTrustScore class="mt-4" />


    <v-divider class="my-4" />


  </v-list>

</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
// 유저 정보
// 후기 관련
import UserTrustScore from "@/components/trustscore/UserTrustScore";
import { useAuthStore } from "@/stores/authStore";
import { trustScoreApi } from "@/domains/trustscore/infrastructure/trustScoreApi";
import type { TrustScoreType } from "@/domains/trustscore/infrastructure/trustScoreType";
import { ref, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import dayjs from "dayjs";

const {
    user
} = storeToRefs(useAuthStore());

const reviews = ref([]);
const selectedType = ref<TrustScoreType | null>(null);
const page = ref(1);
const size = 5;
const totalPages = ref(1);

function fetchReviews() {
    if (!user.value?.id)
        return;

    trustScoreApi.getUserReviews(user.value.id, {
        page: page.value - 1,
        size,
        type: selectedType.value || undefined
    }).then(res => {
        reviews.value = res.content;
        totalPages.value = res.totalPages;
    });
}

watch([selectedType], () => {
    page.value = 1;
    fetchReviews();
});

onMounted(fetchReviews);
</script>