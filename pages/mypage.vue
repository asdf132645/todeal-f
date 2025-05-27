<template>
  <v-container fluid class="py-4 px-2">
    <!-- ✅ 상단 프로필 영역 (간단 요약) -->
    <v-card class="pa-4 mb-4" elevation="2">
      <div class="d-flex align-center justify-space-between">
        <div>
          <div class="text-caption text-grey-darken-1">나의 활동을 한눈에 확인해보세요</div>
        </div>
      </div>
    </v-card>

    <!-- ✅ 메뉴 선택용 네비게이션 버튼 -->
    <v-chip-group
        v-model="tab"
        class="mb-4"
        column
        mandatory
        active-class="bg-primary text-white"
    >
      <v-chip v-for="(label, idx) in tabLabels" :key="idx" class="ma-1" outlined>
        {{ label }}
      </v-chip>
    </v-chip-group>

    <!-- ✅ 각 섹션 표시 -->
    <v-window v-model="tab">
      <v-window-item :value="0">
        <MyProfileSection />
      </v-window-item>
      <v-window-item :value="1">
        <MyDealList />
      </v-window-item>
      <v-window-item :value="2">
        <BidListMine />
      </v-window-item>
      <v-window-item :value="3">
        <BidListOnMyDeal />
      </v-window-item>
      <v-window-item :value="4">
        <TrustReviewList />
      </v-window-item>
    </v-window>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'

import MyProfileSection from '~/components/mypage/MyProfileSection.vue'
import MyDealList from '~/components/mypage/MyDealList.vue'
import BidListMine from '~/components/bid/BidListMine.vue'
import BidListOnMyDeal from '~/components/bid/BidListOnMyDeal.vue'
import TrustReviewList from '~/components/mypage/TrustReviewList.vue'

const tab = ref(0)
const tabLabels = ['내 정보', '내 글', '내 거래 내역', '내 경매 입찰자 목록', '받은 후기']

const auth = useAuthStore()
const { user } = storeToRefs(auth)

onMounted(() => {
  if (!user.value) {
    auth.fetchMyInfo()
  }
})
</script>
