<!-- components/common/TermsDialog.vue -->
<template>
  <v-dialog
      :model-value="modelValue"
      @update:model-value="emit('update:modelValue', $event)"
      width="600"
  >
    <v-card>
      <v-card-title class="font-weight-bold text-h6">
        {{ type === 'terms' ? '이용약관' : '개인정보 수집 및 이용 동의' }}
      </v-card-title>
      <v-divider />
      <v-card-text style="max-height: 500px; overflow-y: auto;">
        <template v-if="type === 'terms'">
          <p class="mb-2">제1조 (목적)</p>
          <p class="text-body-2 mb-2">
            본 약관은 투딜(ToDeal)이 제공하는 중고거래 및 알바 경매 서비스(이하 ‘서비스’)의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
          </p>

          <p class="mb-2">제2조 (정의)</p>
          <p class="text-body-2 mb-2">
            1. “회원”이란 본 약관에 동의하고 서비스를 이용하는 자를 말합니다.<br />
            2. “거래”란 회원 간 중고 물품, 일거리 등록 및 입찰, 낙찰 과정을 의미합니다.
          </p>

          <p class="mb-2">제3조 (약관의 게시 및 개정)</p>
          <p class="text-body-2 mb-2">
            회사는 본 약관을 서비스 초기화면 또는 연결화면에 게시하며, 관련 법령을 위반하지 않는 범위 내에서 변경할 수 있습니다.
          </p>

          <p class="mb-2">제4조 (회원의 의무)</p>
          <p class="text-body-2 mb-2">
            1. 회원은 실명 및 정확한 정보를 제공해야 하며, 타인의 정보를 도용해서는 안 됩니다.<br />
            2. 허위 게시물, 사기행위, 불법거래를 해서는 안 됩니다.
          </p>

          <p class="mb-2">제5조 (서비스 이용)</p>
          <p class="text-body-2 mb-2">
            1. 서비스 이용은 24시간 가능하나 시스템 점검 등 사유로 중단될 수 있습니다.<br />
            2. 회사는 회원 간 거래에 직접 개입하지 않으며, 거래 책임은 회원에게 있습니다.
          </p>

          <p class="mb-2">제6조 (금지행위)</p>
          <p class="text-body-2 mb-2">
            다음 행위는 금지되며, 적발 시 서비스 이용 제한 및 법적 조치를 받을 수 있습니다:<br />
            - 허위/불법 게시물 등록<br />
            - 반복적인 입찰 취소<br />
            - 타인 사칭, 욕설, 비방<br />
            - 시스템 해킹, 크롤링 등 기술적 침해
          </p>

          <p class="mb-2">제7조 (면책조항)</p>
          <p class="text-body-2 mb-2">
            회사는 회원 간 거래, 채팅 등 상호작용에 대해 책임지지 않으며, 분쟁은 당사자 간 해결이 원칙입니다.
          </p>

          <p class="mb-2">제8조 (준거법 및 관할)</p>
          <p class="text-body-2">
            본 약관은 대한민국 법률에 따르며, 분쟁 발생 시 관할법원은 서울중앙지방법원으로 합니다.
          </p>
        </template>

        <template v-else>
          <p class="mb-2">1. 수집 항목</p>
          <p class="text-body-2 mb-2">
            이메일, 비밀번호, 닉네임, 전화번호, GPS 위치정보
          </p>

          <p class="mb-2">2. 수집 목적</p>
          <p class="text-body-2 mb-2">
            - 회원 식별 및 인증<br />
            - 위치 기반 중고/알바 매칭<br />
            - 푸시 알림 발송<br />
            - 부정 이용 방지 및 서비스 개선
          </p>

          <p class="mb-2">3. 보유 및 이용 기간</p>
          <p class="text-body-2 mb-2">
            회원 탈퇴 시 또는 수집 목적 달성 후 파기. 단, 관계법령에 따라 보존 필요 시에는 그에 따릅니다.
          </p>

          <p class="mb-2">4. 제3자 제공</p>
          <p class="text-body-2 mb-2">
            법령에 근거하거나, 회원의 동의가 있는 경우를 제외하고 외부에 제공하지 않습니다.
          </p>

          <p class="mb-2">5. 동의 거부 시 불이익</p>
          <p class="text-body-2">
            필수 항목 동의 거부 시 서비스 이용이 제한될 수 있습니다.
          </p>
        </template>
      </v-card-text>
      <v-divider />
      <v-card-actions class="justify-end">
        <v-btn text @click="emit('update:modelValue', false)">닫기</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
  type: 'terms' | 'privacy'
}>()
const emit = defineEmits(['update:modelValue'])
</script>
