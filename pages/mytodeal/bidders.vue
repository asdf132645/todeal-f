<template>

  <BidListOnMyDeal />

</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import BidListOnMyDeal from "~/components/bid/BidListOnMyDeal.vue";
</script>