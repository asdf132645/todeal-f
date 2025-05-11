<template>
  <v-card flat class="pa-4">
    <div class="text-subtitle-1 font-weight-bold mb-2">입찰 내역</div>
    <v-list>
      <v-list-item v-for="bid in myBids" :key="bid.id">
        <v-list-item-content>
          <v-list-item-title>{{ bid.dealTitle }}</v-list-item-title>
          <v-list-item-subtitle>
            입찰가: {{ bid.amount.toLocaleString() }}원 / {{ bid.createdAt }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { bidApi } from '~/domains/bid/infrastructure/bidApi'

const myBids = ref([])

onMounted(async () => {
  const res = await bidApi.getMyBids()
  myBids.value = res
})
</script>
