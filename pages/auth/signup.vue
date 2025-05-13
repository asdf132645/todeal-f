<template>
  <v-container class="d-flex justify-center align-center fill-height">
    <v-card class="pa-6 rounded-lg" width="360" elevation="3">
      <div class="text-h6 font-weight-bold mb-6 text-center">회원가입</div>

      <v-text-field
          v-model="form.email"
          label="이메일"
          outlined
          dense
          class="mb-4"
          type="email"
      />
      <v-text-field
          v-model="form.nickname"
          label="닉네임"
          outlined
          dense
          class="mb-4"
      />
      <v-text-field
          v-model="form.phone"
          label="전화번호"
          outlined
          dense
          class="mb-4"
      />
      <v-text-field
          v-model="form.password"
          label="비밀번호"
          type="password"
          outlined
          dense
          class="mb-4"
      />

      <v-checkbox
          v-model="form.locationAgree"
          label="위치 정보 제공에 동의합니다"
          class="mb-2"
      />

      <!-- 이용약관 동의 + 링크 -->
      <div class="d-flex align-center text-body-2 mb-4">
        <v-checkbox
            v-model="form.termsAgree"
            class="ma-0 pa-0 mr-2"
            hide-details
        />
        <span class="text-grey-darken-1">
          <span>이용약관에 동의합니다.</span>
          <v-btn variant="text" size="small" class="ml-2 px-1" @click="dialog = true" style="min-width: auto;">
            <span class="text-primary text-decoration-underline">약관 보기</span>
          </v-btn>
        </span>
      </div>

      <v-btn block color="primary" @click="handleSignup" large>
        회원가입 완료
      </v-btn>
    </v-card>

    <!-- 약관 모달 -->
    <v-dialog v-model="dialog" width="500">
      <v-card>
        <v-card-title class="font-weight-bold text-h6">이용약관</v-card-title>
        <v-divider />
        <v-card-text style="max-height: 400px; overflow-y: auto;">
          <p class="text-body-2 mb-2">1. 본 서비스는 누구나 자유롭게 사용할 수 있습니다.</p>
          <p class="text-body-2 mb-2">2. 운영자의 판단에 따라 부적절한 콘텐츠는 삭제될 수 있습니다.</p>
          <p class="text-body-2 mb-2">3. 위치 기반 정보는 회원 동의 시에만 수집합니다.</p>
          <p class="text-body-2 mb-2">4. 탈퇴 시 모든 개인정보는 즉시 파기됩니다.</p>
          <p class="text-body-2">5. 기타 상세 내용은 별도 운영 정책을 따릅니다.</p>
        </v-card-text>
        <v-divider />
        <v-card-actions class="justify-end">
          <v-btn text @click="dialog = false">닫기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { useRoute, useRouter } from 'vue-router'
import { reactive, ref, onMounted } from 'vue'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const tempToken = route.query.tempToken as string
const dialog = ref(false)
import {apiClient} from "~/libs/http/apiClient";
import {useGeoStore} from "~/stores/geoStore";
const geo = useGeoStore()

const form = reactive({
  email: '',
  nickname: '',
  phone: '',
  password: '',
  locationAgree: false,
  termsAgree: false,
  latitude: null as number | null,
  longitude: null as number | null,
})

// ✅ 현재 위치 자동 설정
onMounted(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        (pos) => {
          form.latitude = pos.coords.latitude
          form.longitude = pos.coords.longitude
          // console.log('✅ 위치 설정됨:', form.latitude, form.longitude)
          //여기서 위치 저장 API 호출
          apiClient.post('/users/location', {
            latitude: geo.latitude,
            longitude: geo.longitude
          })
        },
        (err) => {
          console.warn('❌ 위치 가져오기 실패:', err)
        }
    )
  } else {
    console.warn('❌ 브라우저에서 위치 정보를 지원하지 않습니다.')
  }
})

const handleSignup = async () => {
  if (!form.email) {
    alert('이메일을 입력해 주세요.')
    return
  }
  if (!form.termsAgree) {
    alert('이용약관에 동의해야 가입할 수 있습니다.')
    return
  }

  const payload = {
    ...form,
    agreements: form.termsAgree ? ['terms'] : []
  }

  try {
    if (tempToken) {
      await auth.signupWithKakao(payload, tempToken)
    } else {
      await auth.signupBasic(payload)
    }

    // ✅ 로그인 후 처리
    const userInfo = await auth.fetchMyInfo?.() // 선택적 구현 (필요 없으면 제거)
    if (userInfo) auth.setUser(userInfo)

    alert('회원가입이 완료되었습니다!')
    router.push('/')
  } catch (err: any) {
    alert(err.message || '회원가입 실패')
  }
}

</script>


<style scoped>
.text-decoration-underline {
  text-decoration: underline;
}
</style>
