<template>

  <v-snackbar v-model="visible" :color="color" timeout="3000" location="top">
    {{ text }}
  </v-snackbar>

</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { storeToRefs } from "pinia";
import { useSnackbarStore } from "@/stores/snackbarStore";
const store = useSnackbarStore();

const {
    visible,
    text,
    color
} = storeToRefs(store);
</script>