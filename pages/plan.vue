<template>
  <v-container class="py-10">
    <div class="text-center mb-8">
      <h2 class="text-h5 font-weight-bold">투딜 유료 플랜</h2>
      <p class="text-body-2 text-grey-darken-1">
        광고 없이 무제한 등록이 가능한 유료 플랜입니다.<br />무료 사용자도 광고 시청 후 계속 등록이 가능합니다.
      </p>
    </div>

    <v-row justify="center" align="stretch" class="text-center">
      <v-col cols="12" md="3" v-for="plan in plans" :key="plan.id">
        <v-card :elevation="plan.highlight ? 6 : 2" class="pa-6 rounded-xl" :class="{ 'bg-primary text-white': plan.highlight }">
          <div class="text-h6 font-weight-bold mb-2">{{ plan.name }}</div>
          <div class="text-h4 font-weight-black mb-3">₩{{ plan.price.toLocaleString() }}</div>
          <ul class="text-body-2 mb-4 text-left" :class="{ 'text-white': plan.highlight }">
            <li v-for="(benefit, i) in plan.benefits" :key="i" class="mb-1">• {{ benefit }}</li>
          </ul>
          <v-btn :color="plan.highlight ? 'white' : 'primary'" :text="!plan.highlight" block @click="pay(plan.id)" :loading="loading === plan.id">
            결제하기
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { requestBootpay } from '@/utils/requestBootpay'

const auth = useAuthStore()
const loading = ref<number | null>(null)

const plans = [
  {
    id: 1,
    name: '1개월 플랜',
    price: 3400,
    benefits: [
      '30일간 광고 없이 등록',
      '기본 등록권 포함',
      '자동 갱신 없음'
    ],
    highlight: false
  },
  {
    id: 6,
    name: '6개월 플랜',
    price: 25000,
    benefits: [
      '180일 + 30일 보너스',
      '광고 없이 등록 무제한',
      '가성비 플랜'
    ]
  },
  {
    id: 12,
    name: '12개월 플랜',
    price: 39000,
    benefits: [
      '365일 + 60일 보너스',
      '광고 없이 등록 무제한',
      '우선 지원 포함'
    ],
    highlight: true
  },
  {
    id: 0,
    name: '단건 등록권',
    price: 2900,
    benefits: [
      '1회 등록 가능',
      '광고 없이 바로 등록',
      '기간제한 없음'
    ]
  }
]

const pay = async (planId: number) => {
  const plan = plans.find(p => p.id === planId)
  if (!plan || !auth.user) return

  loading.value = plan.id
  try {
    await requestBootpay(plan, {
      id: auth.user.id,
      name: auth.user.nickname,
      email: auth.user.email
    })
  } catch (e) {
    // 내부 처리됨
  } finally {
    loading.value = null
  }
}
</script>

<style scoped>
ul {
  list-style: none;
  padding: 0;
}
</style>