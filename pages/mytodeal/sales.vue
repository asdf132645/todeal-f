<template>

  <div class="mt-4">
    <v-card
        v-for="deal in deals"
        :key="deal.id"
        class="pa-3 position-relative border-1"
        elevation="1"
    >
      <!-- 오른쪽 상단 점세개 메뉴 -->
      <v-menu offset-y>
        <template #activator="{ props }">
          <v-btn icon v-bind="props" size="small" class="top-right-icon" flat>
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="editDeal(deal.id)">
            <v-list-item-title>{{ $t('auto_key_46') }}</v-list-item-title>
          </v-list-item>
          <v-list-item @click="deleteDeal(deal.id)">
            <v-list-item-title>{{ $t('auto_key_47') }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <!-- 딜 정보 -->
      <div @click="goToDetail(deal.id, deal.type)" class="cursor-pointer">
        <div class="font-weight-bold mb-1">{{ deal.title }}</div>
        <div class="text-caption text-grey">
          {{ formatDate(deal.createdAt) }} ・ {{ deal.currentPrice.toLocaleString() }}원
        </div>
      </div>
    </v-card>

    <!-- 페이지네이션 -->
    <div class="d-flex justify-center mt-4" v-if="totalPages > 1">
      <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="5"
      />
    </div>
  </div>

</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { dealApi } from "@/domains/deal/infrastructure/dealApi";
const router = useRouter();
const deals = ref<any[]>([]);
const currentPage = ref(1);
const totalPages = ref(1);
const size = 5;

const loadDeals = async () => {
    try {
        const res = await dealApi.getMyDeals({
            page: currentPage.value - 1,
            size
        });

        deals.value = res.content;
        totalPages.value = res.totalPages;
    } catch (e) {
        console.error(t("auto_key_48"), e);
    }
};

const goToDetail = (id: number, type: string) => {
    router.push(`/deals/detail/${id}?type=${type}`);
};

const editDeal = (id: number) => {
    router.push(`/deals/${id}/edit`);
};

const deleteDeal = async (id: number) => {
    if (confirm(t("auto_key_49"))) {
        await dealApi.deleteDeal(id);
        loadDeals();
    }
};

const formatDate = (iso: string) => {
    const date = new Date(iso);

    return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
};

onMounted(loadDeals);
watch(currentPage, loadDeals);
</script>

.cursor-pointer {
  cursor: pointer;
}
.top-right-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
}