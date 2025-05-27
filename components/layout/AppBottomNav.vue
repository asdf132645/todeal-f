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

    <!-- 플로팅 버튼 -->
    <v-btn icon class="fab-post-btn"     v-if="!isChatPage"
           elevation="12" @click="toggleMenu">
      <div class="fab-circle">
        <v-icon size="28">mdi-plus</v-icon>
      </div>
    </v-btn>

    <!-- 하단 네비게이션 -->
    <v-bottom-navigation height="70" grow app class="bottom-nav-dark">
      <v-btn to="/" value="home" :class="{ active: isActive('/') }">
        <v-icon>mdi-home</v-icon>
        <span class="text-caption">홈</span>
      </v-btn>

      <v-btn to="/deals/search" value="search" :class="{ active: isActive('/deals/search') }">
        <v-icon>mdi-magnify</v-icon>
        <span class="text-caption">검색</span>
      </v-btn>

      <v-btn to="/board" value="board" :class="{ active: isActive('/board') }">
        <v-icon>mdi-forum-outline</v-icon>
        <span class="text-caption">커뮤니티</span>
      </v-btn>

      <v-btn to="/mypage" value="mypage" :class="{ active: isActive('/mypage') }">
        <v-icon>mdi-account</v-icon>
        <span class="text-caption">마이페이지</span>
      </v-btn>
    </v-bottom-navigation>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
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
const isChatPage = computed(() => {
  return route.path.startsWith('/chats/') && route.query.receiverId
})
const handleSelect = (path: string) => {
  showMenu.value = false
  handleProtectedRoute(path)
}

const isActive = (path: string) => {
  return route.path === path
}

const postOptions = [
  { title: '중고거래 등록', icon: 'mdi-tag-outline', to: '/post/used' },
  { title: '알바 등록', icon: 'mdi-account-hard-hat-outline', to: '/post/parttime' },
  { title: '빌려드려요 등록', icon: 'mdi-swap-horizontal', to: '/post/barter' },
  { title: '알바 구해요', icon: 'mdi-account-search', to: '/post/parttime-request' },
]
</script>

<style>
.fab-post-btn {
  position: fixed;
  bottom: 90px;
  right: 24px;
  z-index: 1000;
  background-color: transparent;
}

.fab-circle {
  background-color: #1A1B1D;
  border: 1px solid #FFD54F;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(255, 213, 79, 0.3);
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
  background-color: #1A1B1D;
  padding: 10px 16px;
  border-radius: 16px;
  border: 1px solid #FFD54F;
  box-shadow: 0 2px 6px rgba(255, 213, 79, 0.15);
  cursor: pointer;
  transition: background-color 0.2s;
}
.menu-option:hover {
  background-color: #2A2C30;
}

.icon {
  color: #FFD54F;
  margin-right: 10px;
}

.label {
  font-size: 14px;
  font-weight: 500;
  color: #FFD54F;
}

.bottom-nav-dark {
  background-color: #1A1B1D;
  border-top: 1px solid #2A2C30;
}

.v-btn.active .v-icon,
.v-btn.active span {
  color: #FFD54F !important;
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
