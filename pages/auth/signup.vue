<template>
  <v-container class="d-flex justify-center align-center fill-height">
    <v-card class="pa-6" width="420" elevation="2">

      <!-- STEP 1: 이메일 인증 -->
      <div v-if="step === 1 && !tempToken">
        <div class="text-h6 font-weight-bold mb-4 text-center">이메일 인증</div>
        <v-text-field
            v-model="form.email"
            label="이메일"
            placeholder="example@domain.com"
            :error="!!emailError"
            :disabled="emailVerified"
            @blur="checkEmail"
        />
        <v-btn
            v-if="!emailVerified"
            :loading="isSendingCode"
            :disabled="!form.email || isSendingCode"
            @click="sendCode"
            color="primary"
            block
            class="mb-3"
        >인증코드 전송</v-btn>

        <v-text-field
            v-if="codeSent && !emailVerified && !emailError"
            v-model="form.code"
            label="인증코드 입력"
            :error="!!codeError"
        />
        <v-btn
            v-if="codeSent && !emailVerified && !emailError"
            :loading="isVerifyingCode"
            :disabled="!form.code || isVerifyingCode"
            @click="verifyCode"
            color="primary"
            block
        >인증 완료</v-btn>

        <v-alert v-if="emailVerified" type="success" class="mt-3">이메일 인증 완료</v-alert>
        <v-alert v-if="emailError" type="error" dense class="mt-2">{{ emailError }}</v-alert>
        <v-alert v-if="codeError" type="error" dense class="mt-2">{{ codeError }}</v-alert>
        <v-alert
            v-if="isSendingCode && !emailError"
            type="info"
            dense
            class="mt-2"
        >
          인증코드를 이메일로 전송 중입니다. 잠시만 기다려주세요...
        </v-alert>

      </div>

      <!-- STEP 2: 기본 정보 -->
      <div v-if="step === 2">
        <div class="text-h6 font-weight-bold mb-4 text-center">기본 정보 입력</div>
        <v-text-field v-model="form.nickname" label="닉네임" @blur="checkNickname" :loading="isCheckingNickname" :disabled="!!tempToken" />
        <v-text-field v-model="form.password" type="password" label="비밀번호 (8자 이상)" :disabled="!!tempToken" />
        <v-text-field v-model="form.passwordConfirm" type="password" label="비밀번호 재확인" :disabled="!!tempToken" />
        <v-text-field v-model="form.phone" type="tel" label="전화번호 (숫자만)" :disabled="!!tempToken" />
        <v-alert v-if="basicError" type="error" dense class="mt-2">{{ basicError }}</v-alert>
      </div>

      <!-- STEP 3: 약관 동의 -->
<!--      <div v-if="step === 3">-->
      <div v-if="step === 3">
        <div class="text-h6 font-weight-bold mb-4 text-center">약관 동의</div>

        <v-checkbox
            v-model="form.agreeAll"
            label="모든 약관에 동의합니다."
            @change="toggleAll"
        />

        <v-checkbox v-model="form.termsAgree">
          <template #label>
            이용약관 동의
            <a @click.prevent="openTerms('terms')" class="text-link text-sm-body-1">[자세히 보기]</a>
          </template>
        </v-checkbox>

        <v-checkbox v-model="form.privacyAgree">
          <template #label>
            개인정보 수집 동의
            <a @click.prevent="openTerms('privacy')" class="text-link text-sm-body-1">[자세히 보기]</a>
          </template>
        </v-checkbox>

        <v-checkbox v-model="form.locationAgree">
          <template #label>
            위치정보 수집 동의
            <a @click.prevent="openTerms('location')" class="text-link mr-1 text-sm-body-1">[자세히 보기]</a>
          </template>
        </v-checkbox>

        <v-alert v-if="termsError" type="error" dense class="mt-2">{{ termsError }}</v-alert>
      </div>


      <!-- STEP 4: 완료 -->
      <div v-if="step === 4" class="text-center">
        <div class="text-h6 font-weight-bold mb-3">가입이 완료되었습니다 🎉</div>
        <v-btn color="primary" block @click="goHome">홈으로 이동</v-btn>
      </div>

      <!-- 하단 네비게이션 -->
      <div class="mt-6" v-if="step < 4">
        <v-btn
            :disabled="!canProceed"
            color="primary"
            block
            @click="nextStep"
        >다음</v-btn>
      </div>
    </v-card>
    <!-- 이용약관 / 개인정보 모달 -->
    <TermsDialog :model-value="showTermsDialog" :type="termsType" @update:model-value="showTermsDialog = $event"/>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { apiClient } from '~/libs/http/apiClient'
import TermsDialog from '~/components/common/TermsDialog.vue'
import {useAuthStore} from "~/stores/authStore";
const auth = useAuthStore()

const router = useRouter()
const step = ref(1)

const form = reactive({
  email: '',
  code: '',
  nickname: '',
  password: '',
  passwordConfirm: '',
  phone: '',
  termsAgree: false,
  privacyAgree: false,
  locationAgree: false,
  agreeAll: false,
})

const emailVerified = ref(false)
const codeSent = ref(false)
const emailError = ref('')
const codeError = ref('')
const basicError = ref('')
const termsError = ref('')
const showTermsDialog = ref(false)
const termsType = ref('')
const isSendingCode = ref(false)
const isVerifyingCode = ref(false)
const isCheckingNickname = ref(false)
const tempToken = localStorage.getItem('tempToken')

const checkEmail = async () => {
  emailError.value = ''
  try {
    const res = await apiClient.get(`/api/users/check-email?email=${form.email}`)
    if (res.exists) emailError.value = '이미 사용 중인 이메일입니다.'
  } catch {
    emailError.value = '이메일 확인 실패'
  }
}

const sendCode = async () => {
  if(emailError.value) {
    return
  }
  emailError.value = ''
  isSendingCode.value = true
  try {
    await apiClient.post('/api/emailVerification/send-verification', { email: form.email })
    codeSent.value = true
  } catch (err: any) {
    emailError.value = err.message || '인증코드 발송 실패'
  } finally {
    isSendingCode.value = false
  }
}

const verifyCode = async () => {
  codeError.value = ''
  isVerifyingCode.value = true
  try {
    await apiClient.post('/api/emailVerification/verify-code', {
      email: form.email,
      code: form.code,
    })
    emailVerified.value = true
  } catch (err: any) {
    codeError.value = err.message || '인증코드가 올바르지 않습니다.'
  } finally {
    isVerifyingCode.value = false
  }
}

const checkNickname = async () => {
  isCheckingNickname.value = true
  try {
    const res = await apiClient.get(`/api/users/check-nickname?nickname=${form.nickname}`)
    if (res?.exists) basicError.value = '이미 사용 중인 닉네임입니다.'
    else basicError.value = ''
  } catch {
    basicError.value = '닉네임 확인 실패'
  } finally {
    isCheckingNickname.value = false
  }
}

const toggleAll = () => {
  form.termsAgree = form.privacyAgree = form.locationAgree = form.agreeAll
}

const canProceed = computed(() => {
  if (step.value === 1) return emailVerified.value
  if (step.value === 2)
    return (
        form.nickname &&
        form.password.length >= 8 &&
        form.password === form.passwordConfirm
    )
  if (step.value === 3) return form.termsAgree && form.privacyAgree
  return true
})

const openTerms = (type: 'terms' | 'privacy') => {
  termsType.value = type
  showTermsDialog.value = true
}

const nextStep = async () => {
  if (step.value === 3) {
    try {
      const payload = tempToken
          ? {
            agreements: ['terms', 'privacy', ...(form.locationAgree ? ['location'] : [])],
          }
          : {
            email: form.email,
            nickname: form.nickname,
            phone: form.phone,
            password: form.password,
            agreements: ['terms', 'privacy', ...(form.locationAgree ? ['location'] : [])],
          }

      if (tempToken) {
        await auth.signupWithKakao(payload, tempToken)
      } else {
        await auth.signupBasic(payload)
      }

      const userInfo = await auth.fetchMyInfo?.()
      if (userInfo) auth.setUser(userInfo)
      step.value++
    } catch (err) {
      console.error('회원가입 실패', err)
      termsError.value = '회원가입 중 오류가 발생했습니다.'
    }
  } else {
    step.value++
  }
}


const goHome = () => router.push('/')
</script>

