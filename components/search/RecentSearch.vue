<template>

  <v-sheet class="pa-3 mb-3" rounded>
    <div class="text-caption font-weight-bold mb-2">{{ $t('auto_key_164') }}</div>
    <v-chip
        v-for="(item, index) in store.recentSearches"
        :key="index"
        class="ma-1"
        @click="goToSearchResult(item)"
        pill
        outlined
    >
      {{ getTypeLabel(item.type) }} / {{ item.keyword || '전체' }}
    </v-chip>
  </v-sheet>

</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { useSearchStore } from "@/stores/searchStore";
import { useRouter } from "vue-router";
const store = useSearchStore();
const router = useRouter();

const typeLabels = {
    used: t("auto_key_29"),
    parttime: t("auto_key_161"),
    "parttime-request": t("auto_key_162"),
    barter: t("auto_key_28")
};

const getTypeLabel = (type: string) => typeLabels[type] || type;

const goToSearchResult = (item: any) => {
    router.push({
        path: "/deals/search-result",

        query: {
            type: item.type,
            keyword: item.keyword || ""
        }
    });
};
</script>