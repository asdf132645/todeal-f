<template>

  <v-container class="py-6">
    <div class="text-h6 font-weight-bold mb-4">{{ $t('auto_key_34') }}</div>

    <v-alert v-if="!inquiries.length" type="info" text>
      아직 등록된 문의글이 없습니다.
    </v-alert>

    <v-card
        v-for="inquiry in inquiries"
        :key="inquiry.id"
        class="mb-3 pa-4"
        style="background-color: #1A1B1D; color: #F2F3F4"
    >
      <div class="font-weight-bold mb-1">{{ inquiry.title }}</div>
      <div class="text-caption mb-2" style="color: #AAA">{{ formatDate(inquiry.createdAt) }}</div>
      <div class="text-body-2">{{ inquiry.content }}</div>
      <v-divider class="my-3" />
      <div v-if="inquiry.adminReply" class="text-body-2">
        <strong>{{ $t('auto_key_35') }}</strong>
        <div class="mt-1">{{ inquiry.adminReply }}</div>
      </div>
      <div v-else class="text-caption text-grey mt-2">{{ $t('auto_key_36') }}</div>
    </v-card>
  </v-container>

</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
// console.log(res)
import { onMounted, ref } from "vue";
import { helpApi } from "@/domains/help/infrastructure/helpApi";
import { useAuthStore } from "@/stores/authStore";
const inquiries = ref<any[]>([]);
const auth = useAuthStore();

onMounted(async () => {
    try {
        const res = await helpApi.getMyInquiries();

        if (Array.isArray(res)) {
            inquiries.value = res;
        }
    } catch (e) {
        console.error(t("auto_key_37"), e);
    }
});

const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString("ko-KR");
};
</script>