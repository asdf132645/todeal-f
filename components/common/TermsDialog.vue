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
            본 약관은 투딜(ToDeal)이 제공하는 중고거래 및 알바 경매 플랫폼 서비스(이하 ‘서비스’)의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
          </p>

          <p class="mb-2">제2조 (정의 및 가입자격)</p>
          <p class="text-body-2 mb-2">
            1. “회원”이란 본 약관에 동의하고 서비스를 이용하는 자를 말합니다.<br />
            2. “거래”란 회원 간 중고 물품, 알바, 물물교환 등의 입찰, 제안, 낙찰 과정을 의미합니다.<br />
            3. 본 서비스는 만 19세 이상만 가입 및 이용이 가능하며, 미성년자 이용은 제한됩니다.
          </p>

          <p class="mb-2">제3조 (약관의 게시 및 개정)</p>
          <p class="text-body-2 mb-2">
            회사는 본 약관을 서비스 초기화면 또는 연결화면에 게시하며, 관련 법령을 위반하지 않는 범위 내에서 변경할 수 있습니다.
          </p>

          <p class="mb-2">제4조 (회원의 의무)</p>
          <p class="text-body-2 mb-2">
            1. 회원은 실명 및 정확한 정보를 제공해야 하며, 타인의 정보를 도용해서는 안 됩니다.<br />
            2. 허위 게시물, 사기행위, 불법거래, 음란물 또는 불쾌한 콘텐츠 등록을 해서는 안 됩니다.
          </p>

          <p class="mb-2">제5조 (서비스 이용)</p>
          <p class="text-body-2 mb-2">
            1. 서비스는 연중무휴 24시간 제공되나, 시스템 점검 등의 사유로 일시 중단될 수 있습니다.<br />
            2. 회사는 플랫폼을 제공할 뿐, 회원 간 거래나 대화에 개입하지 않으며 법적 책임을 지지 않습니다.
          </p>

          <p class="mb-2">제6조 (금지행위 및 제재)</p>
          <p class="text-body-2 mb-2">
            다음 행위가 적발될 경우 사전 통보 없이 서비스 이용 제한, 탈퇴, 법적 조치가 취해질 수 있습니다:<br />
            - 반복적인 허위 게시물 또는 입찰 취소<br />
            - 타인 사칭, 욕설, 비방, 명예훼손<br />
            - 기술적 침해 (해킹, 크롤링, 스크래핑 등)<br />
            - 거래 사기, 미이행, 불법적인 대면 요구<br />
            - 신고 누적 (10회 이상) 시 자동 정지 처리
          </p>

          <p class="mb-2">제7조 (유료 서비스 및 환불)</p>
          <p class="text-body-2 mb-2">
            1. 서비스 내 유료 상품(예: 등록권, 유료 플랜)은 결제 완료 즉시 효력이 발생하며, 원칙적으로 환불되지 않습니다.<br />
            2. 단, 전자상거래법 등 관련 법령에 따른 청약철회 요건 충족 시 환불 가능합니다.<br />
            3. 이용자는 결제 전 해당 상품의 상세 내용을 충분히 확인해야 합니다.
          </p>

          <p class="mb-2">제8조 (서비스 종료 및 데이터 처리)</p>
          <p class="text-body-2 mb-2">
            회사는 서비스 제공을 종료할 수 있으며, 이 경우 사전 고지를 통해 이용자에게 통지합니다.<br />
            서비스 종료 시 회원의 게시물, 채팅, 이미지 등은 일정 보관 기간 이후 모두 삭제될 수 있습니다.
          </p>

          <p class="mb-2">제9조 (면책조항)</p>
          <p class="text-body-2 mb-2">
            회사는 회원 간의 거래, 채팅, 약속 불이행 등 상호작용에 대해 법적 책임을 지지 않으며, 분쟁은 당사자 간 해결을 원칙으로 합니다.<br />
            또한 회사는 서비스 장애, 데이터 손실, 계정 해킹 등에 대해 고의 또는 중대한 과실이 없는 한 책임을 지지 않습니다.
          </p>

          <p class="mb-2">제10조 (개인정보 보관 및 제3자 위탁)</p>
          <p class="text-body-2 mb-2">
            회사는 회원의 개인정보를 Amazon Web Services(AWS), Google Firebase, Stripe 등 외부 업체에 안전하게 위탁 또는 저장할 수 있습니다.<br />
            이때 위탁 목적과 범위는 개인정보처리방침에 따르며, 이용자는 이에 동의해야 서비스를 이용할 수 있습니다.
          </p>

          <p class="mb-2">제11조 (준거법 및 관할)</p>
          <p class="text-body-2 mb-4">
            본 약관은 대한민국 법률에 따르며, 서비스와 관련한 분쟁은 서울중앙지방법원을 전속 관할법원으로 합니다.
          </p>

          <v-divider class="my-4" />
          <p class="mb-2 font-weight-bold">[책임 고지]</p>
          <p class="text-body-2">
            본 서비스는 회원 간 자유로운 경매 및 소통을 위한 플랫폼으로, 회사는 이에 대한 직접 개입 없이 시스템만을 제공합니다.<br />
            이용자가 등록하거나 수행하는 행위에 대한 모든 법적 책임은 전적으로 해당 회원 본인에게 있으며, 서비스 제공자는 그에 대해 책임지지 않습니다.
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

          <p class="mb-2">4. 제3자 제공 및 위탁</p>
          <p class="text-body-2 mb-2">
            수집된 개인정보는 다음과 같은 외부 업체에 위탁/보관될 수 있습니다:<br />
            - Amazon Web Services (서버, 이미지 저장)<br />
            - Google Firebase (푸시 알림 발송)<br />
            - 부트페이 (결제 처리)<br />
            - 카카오(간편 로그인)<br />
            외 제공은 법령에 근거하거나 회원 동의 시에만 이루어집니다.
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
