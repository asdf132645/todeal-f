<template>

  <div class="p-4">
    <h2 class="text-lg font-bold mb-2">{{ $t('auto_key_94') }}</h2>
    <ul>
      <li
          v-for="room in chatRooms"
          :key="room.id"
          class="border p-2 mb-2 rounded cursor-pointer"
          @click="goToRoom(room.id)"
      >
        🗨️ 딜 #{{ room.dealId }} / 참여자: {{ room.buyerId === userId ? '판매자' : '구매자' }}
      </li>
    </ul>
  </div>

</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
//  이렇게!
// ❗ 실제 로그인된 사용자 ID 사용
import { useRouter } from "vue-router";
import { onMounted, ref } from "vue";
import api from "~/utils/api";
const chatRooms = ref<any[]>([]);
const userId = localStorage.getItem("userId");
const router = useRouter();

const goToRoom = (id: number) => {
    router.push(`/chats/${id}`);
};

onMounted(async () => {
    const res = await api.get("/api/chats/room", {
        headers: {
            "X-USER-ID": userId
        }
    });

    chatRooms.value = res.data.data;
});
</script>