<template>

  <v-sheet class="pa-4 mb-4" rounded>
    <v-row dense>
      <v-col cols="12">
        <v-text-field
            v-model="form.keyword"
            label="검색어 입력"
            clearable
        />
      </v-col>
      <v-col cols="12">
        <v-text-field
            v-model="form.exclude"
            label="제외할 키워드 (예: 택배)"
            clearable
        />
      </v-col>
      <v-col cols="12">
        <v-select
            v-model="form.type"
            :items="typeOptions"
            item-title="label"
            item-value="value"
            label="카테고리"
        />
      </v-col>
    </v-row>
    <v-btn color="primary" block class="mt-3" @click="submit">{{ $t('auto_key_160') }}</v-btn>
  </v-sheet>

</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
// console.log(storedLat, storedLng)
//  검색어가 존재하면 백엔드에 검색 로그 기록
import { ref, onMounted } from "vue";
import { useSearchStore } from "@/stores/searchStore";
import { useRouter } from "vue-router";
import { analyticsApi } from "@/domains/analytics/infrastructure/analyticsApi";

onMounted(() => {
    const storedLat = parseFloat(localStorage.getItem("userLat") || "");
    const storedLng = parseFloat(localStorage.getItem("userLng") || "");
    const storedRadius = parseFloat(localStorage.getItem("userRadius") || "");

    if (!isNaN(storedLat) && !isNaN(storedLng)) {
        form.value.lat = storedLat;
        form.value.lng = storedLng;
        form.value.useLocation = true;
    }

    if (!isNaN(storedRadius)) {
        form.value.radius = storedRadius;
    }
});

const emit = defineEmits<{
    (
        e: "search",
        filters: {
            type: string;
            keyword?: string;
            exclude?: string;
            lat?: number;
            lng?: number;
            radius?: number;
            useLocation?: boolean;
        }
    ): void;
}>();

const store = useSearchStore();

const form = ref({
    keyword: "",
    exclude: "",
    type: "used",
    useLocation: false,
    radius: 5,
    lat: undefined as number | undefined,
    lng: undefined as number | undefined
});

const typeOptions = [{
    label: t("auto_key_29"),
    value: "used"
}, {
    label: t("auto_key_161"),
    value: "parttime"
}, {
    label: t("auto_key_162"),
    value: "parttime-request"
}, {
    label: t("auto_key_28"),
    value: "barter"
}];

const router = useRouter();

const submit = async () => {
    store.addRecentSearch(form.value);

    if (form.value.keyword?.trim()) {
        try {
            await analyticsApi.logSearch(form.value.keyword.trim());
        } catch (err) {
            console.warn(t("auto_key_163"), err);
        }
    }

    const filteredQuery = Object.fromEntries(Object.entries({
        ...form.value,
        page: 1
    }).filter(([_, v]) => v !== undefined && v !== ""));

    await router.push({
        path: "/deals/search-result",
        query: filteredQuery
    });
};
</script>