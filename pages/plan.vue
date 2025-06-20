<template>

  <v-container class="py-10">
    <div class="text-center mb-8">
      <h2 class="text-h5 font-weight-bold">{{ $t('auto_key_6') }}</h2>
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
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
// 내부 처리됨
import { ref } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { requestBootpay } from "@/utils/requestBootpay";
const auth = useAuthStore();
const loading = ref<number | null>(null);

const plans = [{
    id: 1,
    name: t("auto_key_7"),
    price: 3400,
    benefits: [t("auto_key_8"), t("auto_key_9"), t("auto_key_10")],
    highlight: false
}, {
    id: 6,
    name: t("auto_key_11"),
    price: 25000,
    benefits: [t("auto_key_12"), t("auto_key_13"), t("auto_key_14")]
}, {
    id: 12,
    name: t("auto_key_15"),
    price: 39000,
    benefits: [t("auto_key_16"), t("auto_key_13"), t("auto_key_17")],
    highlight: true
}, {
    id: 0,
    name: t("auto_key_18"),
    price: 2900,
    benefits: [t("auto_key_19"), t("auto_key_20"), t("auto_key_21")]
}];

const pay = async (planId: number) => {
    const plan = plans.find(p => p.id === planId);

    if (!plan || !auth.user)
        return;

    loading.value = plan.id;

    try {
        await requestBootpay(plan, {
            id: auth.user.id,
            name: auth.user.nickname,
            email: auth.user.email
        });
    } catch (e) {} finally {
        loading.value = null;
    }
};
</script>

ul {
  list-style: none;
  padding: 0;
}