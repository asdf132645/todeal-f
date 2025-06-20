<template>

  <v-card
      class=" d-flex"
      elevation="2"
      @click="goToDetail"
      height="160"
      style="border-bottom: 1px solid #373333; border-radius: 0;"
  >
    <!-- 좌측 이미지 -->
    <v-img
        :src="job.images?.[0] || noImage"
        height="160"
        class="rounded-lg"

    />

    <!-- 우측 텍스트 -->
    <v-card-text class=" d-flex flex-column " style="flex: 1">
      <!-- 거래방식 -->
      <div class="chip-custom wid100 mb-1">
        {{ job.pricingType === 'FIXED' ? '정가 방식' : '경매 방식' }}
      </div>

      <div class="text-subtitle-2 font-weight-bold mb-1">
        {{ job.translatedTitle || job.title }}
      </div>
      <div class="text-subtitle-2 font-weight-bold mb-1">
       시급: <strong>{{ job.currentPrice.toLocaleString() }}원</strong>
      </div>

      <div class="grey--text custom-text-sm mb-1">
        {{ address || '위치 미지정' }}
      </div>
    </v-card-text>
  </v-card>

</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import noImage from "@/assets/img/noimg.jpg";

interface Job {
    id: number;
    title: string;
    translatedTitle?: string;
    description: string;
    currentPrice: number;
    latitude: number;
    longitude: number;
    type?: string;
    pricingType?: string;
    images?: string[];
}

const props = defineProps<{
    job: Job;
}>();

const address = ref("");
const router = useRouter();

onMounted(async () => {
    address.value = await getAddressFromCoords(props.job.latitude, props.job.longitude);
    const savedY = sessionStorage.getItem("scrollY");

    if (savedY) {
        window.scrollTo({
            top: parseInt(savedY),
            behavior: "auto"
        });

        sessionStorage.removeItem("scrollY");
    }
});

async function getAddressFromCoords(lat: number, lng: number): Promise<string> {
    try {
        const response = await fetch(
            `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${lng}&y=${lat}`,
            {
                headers: {
                    Authorization: `KakaoAK ${import.meta.env.VITE_KAKAO_REST_API_KEY}`
                }
            }
        );

        const data = await response.json();
        return data.documents?.[0]?.region_3depth_name || t("auto_key_184");
    } catch (error) {
        console.error(t("auto_key_185"), error);
        return t("auto_key_184");
    }
}

const goToDetail = () => {
    sessionStorage.setItem("scrollY", String(window.scrollY));

    router.push({
        path: `/deals/detail/${props.job.id}`,

        query: {
            type: props.job.type || "parttime"
        }
    });
};
</script>