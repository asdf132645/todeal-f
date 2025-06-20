<template>

  <v-container fluid class="pa-4 pt-6" style="min-height: 100vh;">
<!--    <div class="text-h6 font-weight-bold mb-3">{{ $t('auto_key_62') }}</div>-->

    <v-row v-if="results.length > 0" dense>
      <v-col cols="12" v-for="deal in results" :key="deal.id">
        <DealCard :deal="deal" />
      </v-col>
    </v-row>
    <div v-else class="text-caption text-grey text-center py-6">{{ $t('auto_key_63') }}</div>

    <!--  감지용 요소 -->
    <div ref="infiniteScrollTrigger" style="height: 1px;" />

    <!--  로딩 표시 -->
    <v-progress-circular
        v-if="loadingMore"
        indeterminate
        color="primary"
        class="d-block mx-auto my-4"
    />
  </v-container>

</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
//  세션 캐시 저장
//  route.query 변경 감지 (초기화 + fetch)
//  렌더링 완료될 때까지 대기
// ← 이게 핵심
import { ref, watch, onMounted, onUnmounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import DealCard from "@/components/deal/DealCard.vue";
import { dealApi } from "@/domains/deal/infrastructure/dealApi";
import type { Deal } from "@/domains/deal/domain/deal/dealTypes";
const route = useRoute();
const results = ref<Deal[]>([]);
const loadingMore = ref(false);
const hasNext = ref(true);
const infiniteScrollTrigger = ref<HTMLElement | null>(null);
const cursorId = ref<number | null>(null);
let observer: IntersectionObserver | null = null;

const fetchPage = async () => {
    if (!hasNext.value || loadingMore.value)
        return;

    loadingMore.value = true;

    try {
        const res = await dealApi.searchDeals({
            type: route.query.type as string,
            keyword: route.query.keyword as string,
            exclude: route.query.exclude as string,
            cursorId: cursorId.value,
            pageSize: 10,
            lat: route.query.lat ? parseFloat(route.query.lat as string) : undefined,
            lng: route.query.lng ? parseFloat(route.query.lng as string) : undefined,
            radius: route.query.radius ? parseFloat(route.query.radius as string) : 5,
            useLocation: route.query.useLocation === "true"
        });

        if (res.items.length === 0) {
            hasNext.value = false;
        } else {
            const ids = new Set(results.value.map(d => d.id));
            const newItems = res.items.filter(item => !ids.has(item.id));
            results.value.push(...newItems);
            cursorId.value = res.nextCursorId ?? null;
            sessionStorage.setItem("searchResults", JSON.stringify(results.value));
            sessionStorage.setItem("searchCursor", cursorId.value ? String(cursorId.value) : "");
        }
    } catch (e) {
        console.error(t("auto_key_64"), e);
    } finally {
        loadingMore.value = false;
    }
};

const observeScroll = () => {
    if (observer)
        observer.disconnect();

    observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !loadingMore.value) {
            fetchPage();
        }
    }, {
        threshold: 0.5
    });

    if (infiniteScrollTrigger.value)
        observer.observe(infiniteScrollTrigger.value);
};

watch(() => route.query, async () => {
    results.value = [];
    cursorId.value = null;
    hasNext.value = true;
    sessionStorage.removeItem("searchResults");
    sessionStorage.removeItem("searchCursor");
    sessionStorage.removeItem("scrollY");
    await fetchPage();
}, {
    immediate: true
});

onMounted(async () => {
    observeScroll();
    const cached = sessionStorage.getItem("searchResults");
    const cachedCursor = sessionStorage.getItem("searchCursor");
    const cachedScroll = sessionStorage.getItem("scrollY");

    if (cached && cachedCursor) {
        results.value = JSON.parse(cached);
        cursorId.value = cachedCursor ? parseInt(cachedCursor) : null;
        await nextTick();
        await new Promise(resolve => setTimeout(resolve, 100));

        if (cachedScroll) {
            window.scrollTo({
                top: parseInt(cachedScroll),
                behavior: "auto"
            });

            sessionStorage.removeItem("scrollY");
        }
    } else {
        await fetchPage();
    }
});

onUnmounted(() => {
    if (observer)
        observer.disconnect();
});
</script>