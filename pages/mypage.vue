<template>
  <v-container fluid class="py-4 px-2">
    <v-card class="pa-0 rounded-lg" elevation="2">
      <v-tabs v-model="tab" background-color="white" grow>
        <v-tab>내 정보</v-tab>
        <v-tab>내 글</v-tab>
        <v-tab>기타</v-tab>
      </v-tabs>

      <v-divider />

      <v-window v-model="tab">
        <v-window-item>
          <MyProfileSection />
        </v-window-item>
        <v-window-item>
          <MyDealList />
        </v-window-item>
        <v-window-item>
          <MyEtcSettings />
        </v-window-item>
      </v-window>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import MyProfileSection from '~/components/mypage/MyProfileSection.vue';
import MyDealList from '~/components/mypage/MyDealList.vue';
import MyEtcSettings from '~/components/mypage/MyEtcSettings.vue';

import { useAuthStore } from '@/stores/authStore';
import { storeToRefs } from 'pinia';


const tab = ref(0)

const auth = useAuthStore()
const { user } = storeToRefs(auth)

onMounted(() => {
  if (!user.value) {
    auth.fetchMyInfo()
  }
})
</script>
