<template>
  <div>
    <!-- 등록 메뉴 팝업 -->
    <transition name="fade">
      <div v-if="showMenu" class="floating-menu">
        <div
            v-for="item in postOptions"
            :key="item.title"
            class="menu-option"
            @click="handleSelect(item.to)"
        >
          <v-icon class="icon">{{ item.icon }}</v-icon>
          <span class="label">{{ item.title }}</span>
        </div>
      </div>
    </transition>

    <!-- 플로팅 버튼 (흰 배경 + 당근 오렌지 아이콘) -->
    <v-btn
        icon
        class="fab-post-btn"
        elevation="12"
        @click="toggleMenu"
    >
      <div class="fab-circle">
        <v-icon size="28" color="#2A2E9D">mdi-plus</v-icon>
      </div>
    </v-btn>


    <!-- 하단 네비게이션 -->
    <v-bottom-navigation height="70" grow app>
      <v-btn to="/" value="home">
        <v-icon>mdi-home</v-icon>
        <span class="text-caption">홈</span>
      </v-btn>

      <v-btn to="/deals/search" value="search">
        <v-icon>mdi-magnify</v-icon>
        <span class="text-caption">검색</span>
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showMenu = ref(false)

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const isLoggedIn = () => {
  return !!localStorage.getItem('accessToken')
}

const handleProtectedRoute = (path: string) => {
  if (!isLoggedIn()) {
    router.push('/auth/login')
  } else {
    router.push(path)
  }
}

const handleSelect = (path: string) => {
  showMenu.value = false
  handleProtectedRoute(path)
}

const postOptions = [
  { title: '중고거래 등록', icon: 'mdi-tag-outline', to: '/post/used' },
  { title: '알바 등록', icon: 'mdi-account-hard-hat-outline', to: '/post/parttime' },
  { title: '물물교환 등록', icon: 'mdi-swap-horizontal', to: '/post/barter' },
  { title: '알바 구해요', icon: 'mdi-account-search', to: '/post/parttime-request' },
]
</script>

<style scoped>
.fab-post-btn {
  position: fixed;
  bottom: 90px;
  right: 24px;
  z-index: 1000;
  background-color: transparent;
}

.fab-circle {
  background-color: white;
  border: 1px solid #E0E0E0;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(42, 46, 157, 0.25); /* Primary Blue tone */
}

.floating-menu {
  position: fixed;
  bottom: 160px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 999;
}

.menu-option {
  display: flex;
  align-items: center;
  background-color: white;
  padding: 10px 16px;
  border-radius: 16px;
  border: 1px solid #E0E0E0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: background-color 0.2s;
}
.menu-option:hover {
  background-color: #F0F2FF; /* Light Blue hover */
}

.icon {
  color: #2A2E9D; /* ToDeal Primary Blue */
  margin-right: 10px;
}

.label {
  font-size: 14px;
  font-weight: 500;
  color: #2A2E9D;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

</style>
