<template>
  <v-container class="d-flex justify-center align-center fill-height">
    <v-card class="pa-6" width="400" elevation="3">
      <div class="text-h6 font-weight-bold mb-6 text-center color-black">회원가입</div>

      <!-- 이메일 -->
      <v-text-field
          v-model="form.email"
          label="이메일"
          placeholder="예: example@domain.com"
          outlined
          dense
          :error="errors.email"
          class="mb-1 color-black"
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
          class="mb-1 color-black"
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
          class="mb-1 color-black"
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
          class="mb-1 color-black"
      />
      <span v-if="errors.password" class="text-error text-caption mt-1 mb-2 d-block">비밀번호는 8자 이상이어야 합니다.</span>

      <!-- 비밀번호 확인 -->
      <v-text-field
          v-model="form.passwordConfirm"
          label="비밀번호 재확인"
          type="password"
          outlined
          dense
          :error="errors.passwordConfirm"
          class="mb-1 color-black"
      />
      <span v-if="errors.passwordConfirm" class="text-error text-caption mt-1 mb-2 d-block">비밀번호가 일치하지 않습니다.</span>

      <!-- 전체 동의 -->
      <v-checkbox
          v-model="form.agreeAll"
          class="ma-0 pa-0 mb-2 color-black"
          label="모든 약관에 동의합니다."
          hide-details
          @change="toggleAllAgreements"
      />

      <!-- 위치 동의 -->
      <v-checkbox
          v-model="form.locationAgree"
          :error="errors.location"
          class="ma-0 pa-0 mb-0 color-black"
          label="위치 정보 수집 및 이용에 동의합니다."
          hide-details
      />
      <div class="terms-link-wrapper">
        <a @click.prevent="openTerms('privacy')" class="text-link">[자세히 보기]</a>
      </div>
      <span v-if="errors.location" class="text-error text-caption mt-1 mb-2 d-block">필수 항목입니다.</span>

      <!-- 이용약관 동의 -->
      <v-checkbox
          v-model="form.termsAgree"
          :error="errors.terms"
          class="ma-0 pa-0 mb-0 color-black"
          label="이용약관에 동의합니다."
          hide-details
      />
      <div class="terms-link-wrapper">
        <a @click.prevent="openTerms('terms')" class="text-link">[자세히 보기]</a>
      </div>
      <span v-if="errors.terms" class="text-error text-caption mt-1 mb-2 d-block">필수 항목입니다.</span>

      <!-- 개인정보 수집 동의 -->
      <v-checkbox
          v-model="form.privacyAgree"
          :error="errors.privacy"
          class="ma-0 pa-0 mb-0 color-black"
          label="개인정보 수집 및 이용에 동의합니다."
          hide-details
      />
      <div class="terms-link-wrapper mb-2">
        <a @click.prevent="openTerms('privacy')" class="text-link">[자세히 보기]</a>
      </div>
      <span v-if="errors.privacy" class="text-error text-caption mt-1 mb-2 d-block">필수 항목입니다.</span>


      <v-btn :disabled="!form.agreeAll" block color="primary" @click="handleSignup" large>회원가입 완료</v-btn>
    </v-card>

    <!-- 이용약관 / 개인정보 모달 -->
    <TermsDialog :model-value="showTermsDialog" :type="termsType" @update:model-value="showTermsDialog = $event"/>
  </v-container>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted} from 'vue'
import {useRouter, useRoute} from 'vue-router'
import {apiClient} from '~/libs/http/apiClient'
import {useAuthStore} from '@/stores/authStore'
import TermsDialog from '@/components/common/TermsDialog.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const tempToken = route.query.tempToken as string

const form = reactive({
  email: '',
  nickname: '',
  phone: '',
  password: '',
  passwordConfirm: '',
  locationAgree: false,
  termsAgree: false,
  privacyAgree: false,
  agreeAll: false,
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

const showTermsDialog = ref(false)
const termsType = ref<'terms' | 'privacy'>('terms')

const toggleAllAgreements = () => {
  form.termsAgree = form.privacyAgree = form.locationAgree = form.agreeAll
}

const openTerms = (type: 'terms' | 'privacy') => {
  termsType.value = type
  showTermsDialog.value = true
}

const validateForm = () => {
  const phoneRegex = /^[0-9]{9,12}$/
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  errors.email = !form.email || !emailRegex.test(form.email)
  errors.nickname = !form.nickname || form.nickname.length > 12
  errors.phone = !phoneRegex.test(form.phone)
  errors.password = !form.password || form.password.length < 8
  errors.passwordConfirm = form.passwordConfirm !== form.password
  errors.terms = !form.termsAgree
  errors.privacy = !form.privacyAgree
  errors.location = !form.locationAgree

  return Object.values(errors).every(v => !v)
}

const checkEmailDuplicate = async () => {
  if (!form.email) return
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
  if (!validateForm()) return

  const payload = {
    email: form.email,
    nickname: form.nickname,
    phone: form.phone,
    password: form.password,
    agreements: ['terms', 'privacy', ...(form.locationAgree ? ['location'] : [])],
  }

  try {
    if (tempToken) {
      await auth.signupWithKakao(payload, tempToken)
    } else {
      await auth.signupBasic(payload)
    }

    const userInfo = await auth.fetchMyInfo?.()
    if (userInfo) auth.setUser(userInfo)

    router.push('/')
  } catch (err) {
    console.error('회원가입 실패', err)
  }
}
</script>

<style>
.text-decoration-underline {
  text-decoration: underline;
  cursor: pointer;
}

.text-h6 {
  font-size: clamp(1.125rem, 1.8vw, 1.5rem);
}

.text-caption {
  font-size: clamp(0.6rem, 1.4vw, 0.875rem);
  line-height: 1.4;
}

.v-card {
  width: 100%;
  max-width: 420px;
}

.v-text-field,
.v-checkbox {
  font-size: 0.95rem;
}

.v-btn {
  font-size: 0.8rem;
  padding-top: 0.8rem;
  padding-bottom: 0.8rem;
}

.v-checkbox .v-label {
  font-size: 0.875rem !important;
  line-height: 1.4;
}

/* 아래로 분리된 링크 스타일 */
.terms-link-wrapper {
  margin-top: -6px;
  margin-bottom: 0px;
  padding-left: 40px;
}

.text-link {
  font-size: 12px;
  color: #A6A9AD;
  text-decoration: underline;
  display: inline-block;
}

</style>
