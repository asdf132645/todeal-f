<template>

  <v-container fluid class="pa-1 bg-app">
    <BannerArea />

    <!-- 태그 필터 그룹 + ⋯ 메뉴 -->
    <div class="mt-4 mb-4">
      <v-slide-group v-model="selectedTag">
        <!-- ⏺ 맨 앞 ⋯ 드롭다운 메뉴 -->
        <v-slide-group-item>
          <v-menu transition="fade-transition" offset-y>
            <template #activator="{ props }">
              <v-chip
                  class="ma-1 d-flex align-center"
                  color="grey-lighten-3"
                  variant="flat"
                  v-bind="props"
              >
                ⋯
              </v-chip>
            </template>

            <v-list>
              <v-list-item
                  v-for="tag in tagFilters"
                  :key="'menu-' + tag.value"
                  @click="goToCategory(categories[tag.value])"
              >
                <v-list-item-title>{{ tag.label }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-slide-group-item>

        <!-- 나머지 태그 필터 버튼들 -->
        <v-slide-group-item
            v-for="tag in tagFilters"
            :key="tag.value"
            :value="tag.value"
        >
          <v-chip
              :color="selectedTag === tag.value ? 'primary' : 'grey-lighten-3-custom'"
              class="ma-1 d-flex align-center"
              variant="flat"
              @click="onTagChange(tag.value)"
          >
            {{ tag.label }}
          </v-chip>
        </v-slide-group-item>
      </v-slide-group>
    </div>

    <!-- 오늘 올라온 게시글 -->
    <CommunityFlashBoard />

    <!-- 게시글 리스트 -->
    <v-container class="mt-4 px-0">
      <v-row dense>
        <v-col
            cols="12"
            v-for="deal in pagedDeals"
            :key="deal.id"
            class="pt-0 pb-0"
        >
          <JobCard
              v-if="selectedTag === 'parttime' || selectedTag === 'parttime-request'"
              :job="deal"
              class="card-item"
          />
          <DealCard
              v-else
              :deal="deal"
              class="card-item"
          />
        </v-col>
      </v-row>

      <!-- 무한스크롤 트리거 -->
      <div ref="scrollTrigger" style="height: 1px; margin-top: 80px;" />
      <v-progress-circular
          v-if="loadingMore"
          indeterminate
          color="primary"
          class="d-block mx-auto my-4"
      />
    </v-container>

    <!-- 빈 상태 -->
    <div v-if="pagedDeals.length === 0" class="section-empty">
      관련 게시글이 없습니다 😢
    </div>
  </v-container>

</template>

<script setup lang="ts">
const { t } = useI18n()
// 🔥 기존 캐시 제거
//  조건부 캐시 저장
//  이거 필수
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "#vue-router";
import { useI18n } from "vue-i18n";
import { dealApi } from "@/domains/deal/infrastructure/dealApi";
import { useGeoStore } from "@/stores/geoStore";
import DealCard from "@/components/deal/DealCard.vue";
import JobCard from "@/components/job/JobCard.vue";
import CommunityFlashBoard from "@/components/community/CommunityFlashBoard.vue";
import BannerArea from "~/components/layout/BannerArea.vue";
import type { Deal } from "@/domains/deal/domain/deal/dealTypes";

const {
    t: _t
} = useI18n();

const router = useRouter();
const geo = useGeoStore();
const cursorId = ref<number | null>(null);
const selectedTag = ref("barter");
const allDeals = ref<Deal[]>([]);
const loadedCount = ref(8);
const loadingMore = ref(false);
const scrollTrigger = ref<HTMLElement | null>(null);
const page = ref(1);
const hasNext = ref(true);

const tagFilters = [{
    label: t("auto_key_28"),
    value: "barter"
}, {
    label: t("auto_key_29"),
    value: "used"
}, {
    label: t("auto_key_30"),
    value: "parttime-request"
}, {
    label: t("auto_key_31"),
    value: "parttime"
}];

const categories = {
    barter: "/deals/barter",
    used: "/deals/used",
    "parttime-request": "/deals/parttime-request",
    parttime: "/deals/parttime"
};

const currentCategoryRoute = computed(() => categories[selectedTag.value]);
const pagedDeals = computed(() => allDeals.value.slice(0, loadedCount.value));

const onTagChange = async (tag: string) => {
    selectedTag.value = tag;
    sessionStorage.setItem("selectedTag", tag);
    sessionStorage.removeItem("dealsCache");
    sessionStorage.removeItem("cursorIdCache");
    loadedCount.value = 8;
    page.value = 1;
    hasNext.value = true;
    allDeals.value = [];
    cursorId.value = null;
    await fetchDeals();
};

const goToCategory = (path: string) => router.push(path);

const fetchDeals = async () => {
    if (!hasNext.value || loadingMore.value)
        return;

    loadingMore.value = true;

    try {
        const lat = Number(localStorage.getItem("userLat"));
        const lng = Number(localStorage.getItem("userLng"));

        const res = await dealApi.searchDeals({
            type: selectedTag.value,
            cursorId: cursorId.value,
            pageSize: 10,
            useLocation: true,
            radius: Number(localStorage.getItem("userRadius") || "5"),
            lat,
            lng
        });

        if (res.items.length === 0) {
            hasNext.value = false;
        } else {
            const ids = new Set(allDeals.value.map(d => String(d.id)));
            const newDeals = res.items.filter(d => !ids.has(String(d.id)));
            allDeals.value.push(...newDeals);
            cursorId.value = res.nextCursorId;
            const prevCache = sessionStorage.getItem("dealsCache");
            const prevCursor = sessionStorage.getItem("cursorIdCache");
            const currentItems = JSON.stringify(allDeals.value);
            const currentCursor = String(cursorId.value);

            if (prevCache !== currentItems || prevCursor !== currentCursor) {
                sessionStorage.setItem("dealsCache", currentItems);
                sessionStorage.setItem("cursorIdCache", currentCursor);
            }
        }
    } catch (e) {
        console.error(t("auto_key_32"), e);
    } finally {
        loadingMore.value = false;
    }
};

const loadMore = () => {
    if (!loadingMore.value && hasNext.value) {
        loadedCount.value += 10;
        fetchDeals();
    }
};

let observer: IntersectionObserver | null = null;

const observeScroll = () => {
    if (observer)
        observer.disconnect();

    observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting)
            loadMore();
    }, {
        threshold: 0.5
    });

    if (scrollTrigger.value)
        observer.observe(scrollTrigger.value);
};

onMounted(async () => {
    const savedTag = sessionStorage.getItem("selectedTag");

    if (savedTag && categories[savedTag])
        selectedTag.value = savedTag;

    const cachedDeals = sessionStorage.getItem("dealsCache");
    const cachedCursor = sessionStorage.getItem("cursorIdCache");
    const savedScroll = sessionStorage.getItem("scrollY");

    if (cachedDeals && cachedCursor) {
        const deals = JSON.parse(cachedDeals);
        allDeals.value = deals;
        cursorId.value = Number(cachedCursor);
        loadedCount.value = deals.length;

        if (savedScroll) {
            requestAnimationFrame(() => {
                window.scrollTo({
                    top: parseInt(savedScroll),
                    behavior: "auto"
                });

                sessionStorage.removeItem("scrollY");
            });
        }
    } else {
        await geo.initLocationOnce();
        await fetchDeals();
    }

    observeScroll();
});

onBeforeUnmount(() => {
    if (observer)
        observer.disconnect();
});
</script>

.section-empty {
  text-align: center;
  color: #999;
  padding: 20px;
}
.card-item {
  width: 100%;
}