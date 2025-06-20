<template>

  <v-container fluid class="pa-4 pt-6" style="min-height: 100vh;">

    <v-tabs v-model="activeTab" fixed-tabs color="primary">
      <v-tab value="mine">{{ $t('auto_key_120') }}</v-tab>
      <v-tab value="on-my">{{ $t('auto_key_24') }}</v-tab>
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
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref } from "vue";
import BidListMine from "@/components/bid/BidListMine.vue";
import BidListOnMyDeal from "@/components/bid/BidListOnMyDeal.vue";
const activeTab = ref<"mine" | "on-my">("mine");
</script>