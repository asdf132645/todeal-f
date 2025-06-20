<template>

  <v-card class="post-popup-card" elevation="8">
    <v-row dense>
      <v-col cols="12" v-for="item in postOptions" :key="item.title">
        <v-card
            tag="div"
            class="d-flex justify-space-between align-center px-4 py-3 mb-2 rounded-lg hover-sheet"
            color="white"
            @click="$emit('select', item.to)"
        >
          <div>
            <div class="text-body-1 font-weight-medium">{{ item.title }}</div>
            <div class="text-caption text-grey-darken-1 mt-1">{{ item.subtitle }}</div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-card>

</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const postOptions = [{
    title: t("auto_key_38"),
    subtitle: t("auto_key_39"),
    to: "/post/barter"
}, {
    title: t("auto_key_40"),
    subtitle: t("auto_key_41"),
    to: "/post/used"
}, {
    title: t("auto_key_42"),
    subtitle: t("auto_key_43"),
    to: "/post/parttime"
}, {
    title: t("auto_key_44"),
    subtitle: t("auto_key_45"),
    to: "/post/parttime-request"
}];
</script>

.post-popup-card {
  position: fixed;
  bottom: 160px;
  right: 24px;
  width: 260px;
  padding: 12px;
  z-index: 999;
}

.hover-sheet:hover {
  background-color: #f5f5f5;
  transition: background-color 0.2s ease;
}