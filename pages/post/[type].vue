<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import DealFormBase from '@/components/deal/DealFormBase.vue'

const route = useRoute()
const router = useRouter()
const type = route.params.type as string

if (!['used', 'parttime', 'parttime-request', 'barter'].includes(type)) {
  router.replace('/')
}
</script>

<template>
  <DealFormBase :type="type" />
</template>
