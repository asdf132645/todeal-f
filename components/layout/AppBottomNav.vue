<template>
  <v-bottom-navigation height="70" grow app>
    <v-btn to="/" value="home">
      <v-icon>mdi-home</v-icon>
      <span class="text-caption">홈</span>
    </v-btn>

    <v-btn to="/deals/search" value="search">
      <v-icon>mdi-magnify</v-icon>
      <span class="text-caption">검색</span>
    </v-btn>

    <v-btn @click="handleProtectedRoute('/post')" value="post">
      <v-icon>mdi-plus-box</v-icon>
      <span class="text-caption">등록</span>
    </v-btn>

    <v-btn @click="handleProtectedRoute('/bids/history')" value="bids">
      <v-icon>mdi-gavel</v-icon>
      <span class="text-caption">입찰내역</span>
    </v-btn>

    <v-btn to="/mypage" value="mypage">
      <v-icon>mdi-account</v-icon>
      <span class="text-caption">마이페이지</span>
    </v-btn>
  </v-bottom-navigation>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const isLoggedIn = () => {
  return !!sessionStorage.getItem('accessToken')
}

const handleProtectedRoute = (path: string) => {
  if (!isLoggedIn()) {
    router.push('/auth/login')
  } else {
    router.push(path)
  }
}
</script>
