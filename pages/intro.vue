<!-- pages/intro.vue -->
<template>
  <v-container class="fill-height d-flex justify-center align-center">
    <v-row style="max-width: 400px;" dense>
      <v-col cols="12" v-for="lang in languages" :key="lang.code">
        <v-btn block color="primary" @click="selectLanguage(lang.code)">
          {{ lang.label }}
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const router = useRouter()

const languages = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'zh', label: '中文' },
  { code: 'ru', label: 'Русский' }
]

const selectLanguage = (code: string) => {
  localStorage.setItem('lang', code)
  locale.value = code
  router.replace('/')
}
</script>
