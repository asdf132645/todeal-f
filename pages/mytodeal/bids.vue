<template>

  <BidListMine />

</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import BidListMine from "~/components/bid/BidListMine.vue";
</script>