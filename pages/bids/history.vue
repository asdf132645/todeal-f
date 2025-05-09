// ✅ pages/bids/history.vue
<template>
  <v-container fluid class="pa-4 pt-6" style="min-height: 100vh; background-color: #FAFAFA;">
    <div class="text-h6 font-weight-bold mb-4">📋 입찰 내역</div>

    <v-tabs v-model="activeTab" fixed-tabs color="primary">
      <v-tab value="mine">📦 내가 입찰한 물건</v-tab>
      <v-tab value="on-my">📮 내 물건에 입찰된 건</v-tab>
    </v-tabs>

    <v-window v-model="activeTab">
      <v-window-item value="mine">
        <BidListMine />
      </v-window-item>

      <v-window-item value="on-my">
        <BidListOnMyDeal />
      </v-window-item>
    </v-window>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BidListMine from '@/components/bid/BidListMine.vue'
import BidListOnMyDeal from '@/components/bid/BidListOnMyDeal.vue'

const activeTab = ref<'mine' | 'on-my'>('mine')
</script>
