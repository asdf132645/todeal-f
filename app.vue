<template>
  <v-app>
   <Default/>
    <AppSnackbar />
  </v-app>
</template>

<script setup lang="ts">
import Default from "~/layout/default.vue";
import AppSnackbar from "~/components/common/AppSnackbar.vue";
</script>
