<template>
  <v-app-bar flat style="background-color: #1A1B1D; color: #F2F3F4">
    <v-btn icon @click="router.back()" style="color: #F2F3F4">
      <v-icon>mdi-arrow-left</v-icon>
    </v-btn>

    <v-toolbar-title class="ml-2 text-subtitle-1 font-weight-medium" style="color: #F2F3F4">
      {{ title }}
    </v-toolbar-title>

    <v-spacer />

    <!-- 🔔 알림 공통 컴포넌트 -->
    <NotificationBell />

    <!-- ☰ 햄버거 메뉴 -->
    <v-btn icon  @click="toggleDrawer" style="color: #F2F3F4">
      <v-icon>mdi-menu</v-icon>
    </v-btn>
  </v-app-bar>

  <!-- 공통 드로어 컴포넌트 -->
  <AppDrawer v-if="drawer" v-model="drawer" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import NotificationBell from '@/components/common/NotificationBell.vue'
import AppDrawer from "~/components/common/AppDrawer.vue";

// Props
defineProps<{ title: string }>()

const router = useRouter()
const auth = useAuthStore()
const drawer = ref(false);

const toggleDrawer = () => {
  drawer.value = !drawer.value
}

</script>

<style>
.v-toolbar-title {
  cursor: default;
}
</style>
