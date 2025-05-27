<template>
  <v-navigation-drawer
      v-if="modelValue"
      :model-value="modelValue"
      @update:model-value="emit('update:modelValue', $event)"
      temporary
      location="right"
  >
    <v-list nav dense>
      <template v-if="auth.user">
        <v-list-item to="/mypage" title="마이페이지" prepend-icon="mdi-account" />
        <v-list-item to="/bids/history" title="입찰내역" prepend-icon="mdi-gavel" />
        <v-list-item to="/post" title="글 등록" prepend-icon="mdi-plus-box" />
        <v-list-item to="/support" title="고객센터" prepend-icon="mdi-headset" />
        <v-list-item to="/support/help/my-inquiries" title="내 문의글" prepend-icon="mdi-help-circle-outline" />
        <v-list-item @click="auth.logout" title="로그아웃" prepend-icon="mdi-logout" />
        <v-list-item @click="themeStore.toggleTheme()" title="테마변경" prepend-icon="mdi-palette" />
      </template>
      <template v-else>
        <v-list-item to="/auth/login" title="로그인" prepend-icon="mdi-login" />
      </template>

      <!-- ✅ 언어변경 메뉴 -->
      <v-list-group v-model="languageGroupOpen" prepend-icon="mdi-translate" value="language">
        <template #activator="{ props }">
          <v-list-item v-bind="props" title="언어변경" />
        </template>

        <v-list-item
            v-for="lang in languages"
            :key="lang.code"
            @click="changeLocale(lang.code)"
            :title="lang.label"
            :active="locale === lang.code"
        />
      </v-list-group>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { useI18n } from 'vue-i18n'

const themeStore = useThemeStore()
const auth = useAuthStore()
const { locale } = useI18n()

const languageGroupOpen = ref(false) // ✅ 드롭다운 열림 상태 관리

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const languages = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'zh', label: '中文' },
  { code: 'ru', label: 'Русский' }
]

const changeLocale = async (code: string) => {
  localStorage.setItem('lang', code)
  locale.value = code;
}

</script>
