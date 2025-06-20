<template>

  <div class="py-6">

    <v-row dense>
      <v-col cols="12" class="px-2" v-for="item in postOptions" :key="item.title">
        <v-card
            tag="router-link"
            :to="item.to"
            class="d-flex justify-space-between align-center px-4 py-4 mb-2 rounded-lg border hover-sheet"
            color="white"
            style="text-decoration: none;"
        >
          <div>
            <div class="customText1 font-weight-medium">{{ item.title }}</div>
            <div class="text-caption text-grey-darken-1 mt-1">{{ item.subtitle }}</div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>

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

.hover-sheet:hover {
  background-color: #f5f5f5;
  transition: background-color 0.2s ease;
}