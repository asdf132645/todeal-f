<template>
  <v-container class="py-6">
    <v-card class="pa-6 rounded-lg" elevation="2">
      <div class="text-h5 font-weight-bold mb-4">투딜 유료 플랜</div>

      <v-row>
        <v-col cols="12" md="4" v-for="plan in plans" :key="plan.id">
          <v-card class="pa-4" outlined>
            <div class="text-h6 font-weight-bold mb-2">{{ plan.name }}</div>
            <div class="text-body-2 mb-2">{{ plan.description }}</div>
            <div class="text-h6 font-weight-bold mb-3 text-primary">₩{{ plan.price.toLocaleString() }}</div>
            <v-btn color="primary" block @click="pay(plan.id)" :loading="loading === plan.id">
              결제하기
            </v-btn>
          </v-card>
        </v-col>
      </v-row>

      <div class="text-caption text-grey mt-6">
        📌 광고 없이 무제한 등록이 가능한 유료 플랜입니다. <br />
        무료 사용자도 광고 시청 후 계속 등록이 가능합니다.
      </div>
    </v-card>
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
    description: '30일간 광고 없이 무제한 등록',
    price: 3400
  },
  {
    id: 6,
    name: '6개월 플랜',
    description: '180일 + 30일 보너스 제공',
    price: 25000
  },
  {
    id: 12,
    name: '12개월 플랜',
    description: '365일 + 60일 보너스 제공',
    price: 39000
  },
  {
    id: 0,
    name: '단건 등록권',
    description: '딜 1건 등록권 (광고 없이)',
    price: 2900
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
