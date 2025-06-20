<template>

  <div class="mt-4">
    <v-text-field
        v-model="item"
        label="제안할 금액 (원)"
        outlined
        dense
        type="number"
        class="color-black"
        hide-spin-buttons
    />
    <v-textarea
        v-model="desc"
        label="추가 설명 (선택)"
        rows="2"
        outlined
        class="color-black"
        dense
    />
    <v-btn color="primary"   @click="submit">{{ $t('auto_key_195') }}</v-btn>
  </div>

</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
// 여기에 숫자 문자열 형태로 금액 들어감
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { barterBidApi } from "~/domains/barterBid/infrastructure/barterBidApi";
import { useSnackbarStore } from "~/stores/snackbarStore";
const snackbar = useSnackbarStore();

const props = defineProps<{
    deal: any;
}>();

const emit = defineEmits(["bid-complete"]);
const item = ref("");
const desc = ref("");
const auth = useAuthStore();
const router = useRouter();

const submit = async () => {
    if (props.deal.userId === auth.user.id) {
        snackbar.show(`자기 글에는 금액제안하기가 안됩니다.`, "error");
        return;
    }

    if (!auth.user) {
        router.push("/auth/login");
        return;
    }

    if (!item.value.trim()) {
        snackbar.show(`제안할 금액을 입력해주세요.`, "error");
        return;
    }

    await barterBidApi.propose({
        dealId: props.deal.id,
        proposedItem: item.value,
        description: desc.value,
        images: []
    });

    snackbar.show(`제안 완료!`, "success");
    emit("bid-complete");
};
</script>

/* 숫자 input에서 스핀 버튼 제거 (크롬/사파리용) */
input[type=number]::-webkit-outer-spin-button,
input[type=number]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type=number] {
  -moz-appearance: textfield; /* Firefox */
}