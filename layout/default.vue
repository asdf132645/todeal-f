<template>
  <v-app :class="{ 'light-mode': !themeStore.isDark }">
    <template v-if="!isIntroPage && isMainPage">
      <AppHeader />
    </template>
    <template v-else-if="!isIntroPage">
      <AppBackHeader :title="resolvedTitle" />
    </template>

    <v-main class="pb-16">
      <NuxtPage />
    </v-main>

    <AppBottomNav v-if="!isIntroPage" class="bottom-nav-fixed" />

    <v-dialog v-model="showConsentDialog" persistent max-width="400">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">
          {{ _t('location.permission_title') }}
        </v-card-title>
        <v-card-text>
          {{ _t('location.permission_description') }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" text @click="handleConsent(false)">
            {{ _t('common.deny') }}
          </v-btn>
          <v-btn color="primary" @click="handleConsent(true)">
            {{ _t('common.allow') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="showLocationError" color="red" timeout="8000">
      {{ geo.error }}
      <template #actions>
        <v-btn color="white" text @click="showConsentDialog = true">
          다시 허용하기
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useGeoStore } from '@/stores/geoStore'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { useI18n } from 'vue-i18n'

import AppHeader from '~/components/layout/AppHeader.vue'
import AppBottomNav from '~/components/layout/AppBottomNav.vue'
import AppBackHeader from '~/components/layout/AppBackHeader.vue'
import { analyticsApi } from '@/domains/analytics/infrastructure/analyticsApi'

const { t: _t } = useI18n()
const route = useRoute()

const isIntroPage = computed(() => route.path === '/intro')
const isMainPage = computed(() => route.path === '/')

const geo = useGeoStore()
const auth = useAuthStore()
const notification = useNotificationStore()

const LOCATION_KEY = 'locationConsent'
const showConsentDialog = ref(false)
const showLocationError = ref(false)

const socket = ref<WebSocket | null>(null)
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null

const themeStore = useThemeStore()
themeStore.initTheme()

const pageTitle = computed(() => {
  const path = route.path
  const map: Record<string, string> = {
    '/deals/search-result': 'page.search_result',
    '/deals/detail': 'page.deal_detail',
    '/post/used': 'page.post_used',
    '/post/barter': 'page.post_barter',
    '/post/parttime-request': 'page.parttime_request',
    '/mytodeal/sales': '내 판매 내역',
    '/post/parttime': 'page.parttime',
    '/chats': 'page.chat',
    '/plans': 'page.plans',
    '/support': 'page.support',
    '/post': 'page.post',
    '/mypage': 'page.mypage',
    '/mytodeal/bids': '내 거래 내역',
    '/mytodeal/bidders': '내 경매 입찰자 목록',
    '/board/mine' : '내가 쓴 게시글',
    '/mytodeal/reviews': '받은 후기',
    '/support/help/my-inquiries': 'page.my_inquiries',
    '/bids/history': 'page.bids',
    '/settings': 'page.settings',
    '/auth/login': 'page.login',
    '/deals/search': 'page.keyword_search',
    '/deals/barter': 'page.barter',
    '/deals/parttime': 'page.parttime_today',
    '/deals/used': 'page.used',
    '/deals/parttime-request': 'page.parttime_offer',
    '/board': 'page.community',
    '/board/write': 'page.write'
  }
  return map[path] || ''
})
const resolvedTitle = computed(() => _t(pageTitle.value))

const getUserId = (): number => {
  return auth.user?.id || Number(localStorage.getItem('userId') || 0)
}

const connectNotificationSocket = () => {
  const userId = getUserId()
  if (!userId) {
    console.warn(_t('log.missing_user_id'))
    return
  }

  if (socket.value && socket.value.readyState === WebSocket.OPEN) {
    // console.log(_t('log.socket_already_connected'))
    return
  }

  const ws = new WebSocket(`wss://app.to-deal.com/ws/notify?userId=${userId}`)
  socket.value = ws

  ws.onopen = () => {
    // console.log(_t('log.socket_connected'), userId)
    if (reconnectTimeout) clearTimeout(reconnectTimeout)
  }

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data)
      const userId = getUserId()
      if (msg.senderId === userId) return

      if (msg.type === 'chatNoti') {
        notification.add({
          type: 'chatNoti',
          chatRoomId: msg.chatRoomId,
          senderId: msg.senderId,
          message: msg.message,
          sentAt: msg.sentAt,
        })
        // console.log(_t('log.chat_received'), msg)
      }

      if (msg.type === 'deal') {
        notification.add({
          type: 'deal',
          dealId: msg.dealId,
          isBarter: msg.isBarter ?? false,
          dealTitle: msg.dealTitle,
          sentAt: msg.sentAt,
        })
        // console.log(_t('log.deal_received'), msg)
      }
    } catch (e) {
      // console.error(_t('log.socket_parse_error'), e)
    }
  }

  ws.onclose = () => {
    console.warn(_t('log.socket_disconnected'))
    socket.value = null
    reconnectTimeout = setTimeout(connectNotificationSocket, 3000)
  }

  ws.onerror = (e) => {
    console.error(_t('log.socket_error'), e)
    socket.value?.close()
  }
}

const handleConsent = async (agree: boolean) => {
  localStorage.setItem(LOCATION_KEY, agree ? 'granted' : 'denied')
  showConsentDialog.value = false

  try {
    await geo.initLocationWithConsent(agree)

    if (agree && geo.latitude && geo.longitude) {
      localStorage.setItem('userLat', String(geo.latitude))
      localStorage.setItem('userLng', String(geo.longitude))
      localStorage.setItem('userRegionName', geo.regionName)

      // ✅ 리로드 플래그가 없으면 새로고침 (딱 한 번만)
      if (!localStorage.getItem('locationConsentReloaded')) {
        localStorage.setItem('locationConsentReloaded', 'true')
        window.location.reload()
      }
    } else if (agree) {
      throw new Error('위치 정보 없음')
    }
  } catch (e) {
    console.error('위치 권한 허용 중 실패:', e)
    geo.error = '위치 정보를 가져올 수 없습니다. 휴대폰 위치(GPS)를 켜주세요.'
    showLocationError.value = true
    localStorage.removeItem(LOCATION_KEY)
    showConsentDialog.value = true
  }
}

onMounted(async () => {
  const today = new Date().toISOString().slice(0, 10)
  const loggedAt = localStorage.getItem('visitorLoggedAt')

  if (loggedAt === today) {
    // console.log(' 오늘은 이미 방문 로그 전송함')
  } else {
    try {
      await analyticsApi.logVisitor(route.fullPath, navigator.userAgent)
      // console.log(' 방문 로그 전송 완료')
    } catch (e) {
      console.warn('🚫 방문 로그 실패:', e)
    }
    // ✅ 성공 여부 관계없이 저장
    localStorage.setItem('visitorLoggedAt', today)
  }

  // 위치 동의 로직
  localStorage.removeItem('locationConsentReloaded')
  const consent = localStorage.getItem(LOCATION_KEY)
  if (consent === 'granted') {
    await geo.initLocationWithConsent(true)
  } else if (consent === 'denied') {
    await geo.initLocationWithConsent(false)
  } else {
    showConsentDialog.value = true
  }

  connectNotificationSocket()
})


watch(() => geo.error, (val) => {
  if (val) {
    showLocationError.value = true

    if (val.includes('denied') || val.includes('허용')) {
      setTimeout(() => {
        showConsentDialog.value = true
      }, 1000)
    }
  }
})
</script>
