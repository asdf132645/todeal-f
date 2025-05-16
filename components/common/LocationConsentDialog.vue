<!-- components/common/LocationConsentDialog.vue -->
<template>
  <v-dialog
      :model-value="modelValue"
      @update:model-value="emit('update:modelValue', $event)"
      width="600"
  >
    <v-card>
      <v-card-title class="font-weight-bold text-h6">위치정보 수집 및 이용 동의</v-card-title>
      <v-divider />
      <v-card-text style="max-height: 500px; overflow-y: auto;">
        <p class="mb-2">1. 위치정보의 수집 항목</p>
        <p class="text-body-2 mb-2">GPS 기반 위도, 경도 정보</p>

        <p class="mb-2">2. 수집 및 이용 목적</p>
        <p class="text-body-2 mb-2">
          - 반경 기반 거래글 추천<br />
          - 주변 알바 정보 매칭<br />
          - 위치 기반 검색 기능 제공
        </p>

        <p class="mb-2">3. 보유 및 이용 기간</p>
        <p class="text-body-2 mb-2">
          회원 탈퇴 또는 동의 철회 시 즉시 파기. 단, 내부 로그 보관 목적은 최대 1년까지 보관.
        </p>

        <p class="mb-2">4. 제3자 제공</p>
        <p class="text-body-2 mb-2">
          위치정보는 외부에 제공되지 않으며, 통계/분석 목적의 경우 익명화하여 처리합니다.
        </p>

        <p class="mb-2">5. 동의 거부 권리 및 불이익</p>
        <p class="text-body-2">
          이용자는 동의를 거부할 수 있으며, 이 경우 위치 기반 추천/검색 등 일부 서비스 이용이 제한될 수 있습니다.
        </p>
      </v-card-text>
      <v-divider />
      <v-card-actions class="justify-end">
        <v-btn text @click="emit('update:modelValue', false)">닫기</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
defineProps<{ modelValue: boolean }>()
const emit = defineEmits(['update:modelValue'])
</script>
