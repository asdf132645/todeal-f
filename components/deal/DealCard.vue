<template>

  <v-card
      class=" d-flex rounded-lg-custom"
      elevation="2"
      @click="goToDetail"
      height="160"
      style="border-bottom: 1px solid #373333; border-radius: 0;"
  >
    <!-- 좌측 이미지 -->
   <div class="d-flex flex-column customImg">
     <v-img
         :src="deal.images?.[0] || noImage"
         height="160"
     />
   </div>

    <!-- 우측 텍스트 -->
    <v-card-text class=" d-flex flex-column " style="flex: 1">
      <div class="chip-custom wid100 mb-1">
        {{ deal.pricingType === 'FIXED' ? '정가 방식' : '경매 방식' }}
      </div>

      <div class="text-subtitle-2 mb-1 font-weight-bold">
        {{ deal.translatedTitle || deal.title }}

      </div>
      <div class="text-subtitle-2 mb-1 font-weight-bold">
        <strong>{{ deal.currentPrice.toLocaleString() }}원</strong><br />
      </div>

      <div class="custom-text-sm mb-1 grey--text">
        {{ address || '위치 미지정' }} {{ formatTime(deal.deadline) }}
      </div>

      <div class=" text-caption custom-text-sm">
      </div>
    </v-card-text>
  </v-card>

</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { useRouter } from "#vue-router";
import type { Deal } from "@/domains/deal/domain/deal/dealTypes";
import noImage from "@/assets/img/noimg.jpg";
import { onMounted, ref } from "vue";

const props = defineProps<{
    deal: Deal;
}>();

const router = useRouter();
const address = ref("");

const goToDetail = () => {
    sessionStorage.setItem("scrollY", String(window.scrollY));

    router.push({
        path: `/deals/detail/${props.deal.id}`,

        query: {
            type: props.deal.type || "used"
        }
    });
};

const formatTime = (time: string) => new Date(time).toLocaleString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit"
});

onMounted(async () => {
    address.value = await getAddressFromCoords(props.deal.latitude, props.deal.longitude);
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
</script>