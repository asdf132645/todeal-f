<template>
  <v-container class="d-flex justify-center align-center fill-height">
    <v-card class="pa-6" width="400" elevation="3">
      <div class="text-h6 font-weight-bold mb-6 text-center">회원가입</div>

      <!-- 이메일 -->
      <v-text-field
          v-model="form.email"
          label="이메일"
          placeholder="예: example@domain.com"
          outlined
          dense
          :error="errors.email"
          class="mb-1"
          @blur="checkEmailDuplicate"
      />
      <span v-if="errors.email" class="text-error text-caption mt-1 mb-2 d-block">{{ emailErrorMessage }}</span>

      <!-- 닉네임 -->
      <v-text-field
          v-model="form.nickname"
          label="닉네임"
          placeholder="최대 12자"
          outlined
          dense
          :error="errors.nickname"
          class="mb-1"
          counter="12"
          maxlength="12"
          @blur="checkNicknameDuplicate"
      />
      <span v-if="errors.nickname" class="text-error text-caption mt-1 mb-2 d-block">{{ nicknameErrorMessage }}</span>

      <!-- 전화번호 -->
      <v-text-field
          v-model="form.phone"
          label="전화번호"
          placeholder="숫자만 입력"
          outlined
          dense
          :error="errors.phone"
          class="mb-1"
          type="tel"
      />
      <span v-if="errors.phone" class="text-error text-caption mt-1 mb-2 d-block">숫자만 입력해 주세요.</span>

      <!-- 비밀번호 -->
      <v-text-field
          v-model="form.password"
          label="비밀번호"
          type="password"
          placeholder="8자 이상"
          outlined
          dense
          :error="errors.password"
          class="mb-1"
          @input="validatePassword"
      />
      <span v-if="errors.password" class="text-error text-caption mt-1 mb-2 d-block">
        비밀번호는 8자 이상이어야 합니다.
      </span>

      <!-- 비밀번호 확인 -->
      <v-text-field
          v-model="form.passwordConfirm"
          label="비밀번호 재확인"
          type="password"
          outlined
          dense
          :error="errors.passwordConfirm"
          class="mb-1"
          @input="validatePasswordConfirm"
      />
      <span v-if="errors.passwordConfirm" class="text-error text-caption mt-1 mb-2 d-block">
        비밀번호가 일치하지 않습니다.
      </span>

      <!-- 위치 동의 -->
      <div class="d-flex align-center text-body-2 mb-1">
        <v-checkbox v-model="form.locationAgree" :error="errors.location" class="ma-0 pa-0 mr-2" hide-details />
        <span>
          위치 정보 수집 및 이용에 동의합니다.
          <v-btn variant="text" size="small" @click="openDialog('location')" class="ml-1 px-1" style="min-width:auto;">
            <span class="text-primary text-decoration-underline">보기</span>
          </v-btn>
        </span>
      </div>
      <span v-if="errors.location" class="text-error text-caption mt-1 mb-2 d-block">필수 항목입니다.</span>

      <!-- 이용약관 -->
      <div class="d-flex align-center text-body-2 mb-1">
        <v-checkbox v-model="form.termsAgree" :error="errors.terms" class="ma-0 pa-0 mr-2" hide-details />
        <span>
          이용약관에 동의합니다.
          <v-btn variant="text" size="small" @click="openDialog('terms')" class="ml-1 px-1" style="min-width:auto;">
            <span class="text-primary text-decoration-underline">보기</span>
          </v-btn>
        </span>
      </div>
      <span v-if="errors.terms" class="text-error text-caption mt-1 mb-2 d-block">필수 항목입니다.</span>

      <!-- 개인정보 -->
      <div class="d-flex align-center text-body-2 mb-1">
        <v-checkbox v-model="form.privacyAgree" :error="errors.privacy" class="ma-0 pa-0 mr-2" hide-details />
        <span>
          개인정보 수집 및 이용에 동의합니다.
          <v-btn variant="text" size="small" @click="openDialog('privacy')" class="ml-1 px-1" style="min-width:auto;">
            <span class="text-primary text-decoration-underline">보기</span>
          </v-btn>
        </span>
      </div>
      <span v-if="errors.privacy" class="text-error text-caption mt-1 mb-4 d-block">필수 항목입니다.</span>

      <v-btn block color="primary" @click="handleSignup" large>회원가입 완료</v-btn>
    </v-card>

    <!-- 모달 -->
    <TermsDialog v-if="dialogType === 'terms' || dialogType === 'privacy'" v-model="dialog" :type="dialogType" />
    <LocationConsentDialog v-if="dialogType === 'location'" v-model="dialog" />
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TermsDialog from '@/components/common/TermsDialog.vue'
import LocationConsentDialog from '@/components/common/LocationConsentDialog.vue'
import { apiClient } from '~/libs/http/apiClient'
import { useAuthStore } from '@/stores/authStore'
import { useGeoStore } from '@/stores/geoStore'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const geo = useGeoStore()

const tempToken = route.query.tempToken as string
const dialog = ref(false)
const dialogType = ref<'terms' | 'privacy' | 'location'>('terms')

const form = reactive({
  email: '',
  nickname: '',
  phone: '',
  password: '',
  passwordConfirm: '',
  locationAgree: false,
  termsAgree: false,
  privacyAgree: false,
  latitude: null as number | null,
  longitude: null as number | null,
})

const errors = reactive({
  email: false,
  nickname: false,
  phone: false,
  password: false,
  passwordConfirm: false,
  terms: false,
  privacy: false,
  location: false,
})

const emailErrorMessage = ref('')
const nicknameErrorMessage = ref('')

const openDialog = (type: 'terms' | 'privacy' | 'location') => {
  dialogType.value = type
  dialog.value = true
}

onMounted(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        (pos) => {
          form.latitude = pos.coords.latitude
          form.longitude = pos.coords.longitude
          apiClient.post('/users/location', {
            latitude: geo.latitude,
            longitude: geo.longitude,
          })
        },
        (err) => console.warn('❌ 위치 가져오기 실패:', err)
    )
  }
})

const validatePassword = () => {
  errors.password = !form.password || form.password.length < 8
  validatePasswordConfirm()
}

const validatePasswordConfirm = () => {
  errors.passwordConfirm = form.passwordConfirm !== form.password
}

const checkEmailDuplicate = async () => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!regex.test(form.email)) {
    errors.email = true
    emailErrorMessage.value = '올바른 이메일 형식이 아닙니다.'
    return
  }

  try {
    const res = await apiClient.get(`/api/users/check-email?email=${form.email}`)
    if (res.exists) {
      errors.email = true
      emailErrorMessage.value = '이미 사용 중인 이메일입니다.'
    } else {
      errors.email = false
      emailErrorMessage.value = ''
    }
  } catch {
    errors.email = true
    emailErrorMessage.value = '이메일 중복 확인 중 오류가 발생했습니다.'
  }
}

const checkNicknameDuplicate = async () => {
  if (!form.nickname || form.nickname.length > 12) {
    errors.nickname = true
    nicknameErrorMessage.value = '닉네임은 12자 이하로 입력해 주세요.'
    return
  }

  try {
    const res = await apiClient.get(`/api/users/check-nickname?nickname=${form.nickname}`)
    if (res.exists) {
      errors.nickname = true
      nicknameErrorMessage.value = '이미 사용 중인 닉네임입니다.'
    } else {
      errors.nickname = false
      nicknameErrorMessage.value = ''
    }
  } catch {
    errors.nickname = true
    nicknameErrorMessage.value = '닉네임 중복 확인 중 오류가 발생했습니다.'
  }
}

const handleSignup = async () => {
  const phoneRegex = /^[0-9]{9,12}$/

  errors.email = !form.email || errors.email
  errors.nickname = !form.nickname || form.nickname.length > 12 || errors.nickname
  errors.phone = !phoneRegex.test(form.phone)
  errors.password = !form.password || form.password.length < 8
  validatePasswordConfirm()
  errors.terms = !form.termsAgree
  errors.privacy = !form.privacyAgree
  errors.location = !form.locationAgree

  if (Object.values(errors).some((v) => v)) return

  const payload = {
    ...form,
    agreements: ['terms', 'privacy', ...(form.locationAgree ? ['location'] : [])],
  }

  try {
    if (tempToken) {
      await auth.signupWithKakao(payload, tempToken)
    } else {
      await auth.signupBasic(payload)
    }

    const userInfo = await auth.fetchMyInfo?.()
    if (userInfo) auth.setUser(userInfo);
    await apiClient.post('/users/location', {
      latitude: geo.latitude,
      longitude: geo.longitude,
    })

    router.push('/')
  } catch (err) {
    console.error('회원가입 실패', err)
  }
}
</script>

<style scoped>
.text-decoration-underline {
  text-decoration: underline;
}
</style>