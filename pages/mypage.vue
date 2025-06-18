<template>
  <div class="pa-0 px-2 mt-2">
    <MyProfileSection />
    <v-list nav class="py-0  mt-2">
      <div class="customText1 mb-2 mt-4">서비스</div>
      <v-list-item to="/mytodeal/bids" prepend-icon="mdi-gavel">
        <v-list-item-title>내 거래 내역</v-list-item-title>
      </v-list-item>
      <v-list-item to="/mytodeal/bidders" prepend-icon="mdi-account-group">
        <v-list-item-title>내 경매 입찰자 목록</v-list-item-title>
      </v-list-item>
      <v-list-item to="/mytodeal/reviews" prepend-icon="mdi-star-outline">
        <v-list-item-title>받은 후기</v-list-item-title>
      </v-list-item>
    </v-list>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import MyProfileSection from "~/components/mypage/MyProfileSection.vue";

const router = useRouter()
const auth = useAuthStore()
const { user } = storeToRefs(auth)

if (!user.value) {
  auth.fetchMyInfo()
}

const goToSettings = () => router.push('/settings')
</script>
