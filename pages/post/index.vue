<template>
  <v-container class="py-6">
    <div class="text-h6 font-weight-bold mb-4">어떤 글을 등록할까요?</div>

    <v-row dense>
      <!-- 중고거래 등록 -->
      <v-col cols="12" sm="6">
        <v-card
            color="indigo-lighten-5"
            class="pa-5 d-flex flex-column align-center justify-center hover:scale elevation-1"
            to="/post/used"
        >
          <v-icon size="40" color="indigo-darken-3">mdi-bag-personal</v-icon>
          <div class="text-subtitle-1 font-weight-medium mt-3">중고 거래 등록</div>
          <div class="text-caption text-grey-darken-1 mt-1">중고 물품 경매 올리기</div>
        </v-card>
      </v-col>

      <!-- 알바 모집 등록 -->
      <v-col cols="12" sm="6">
        <v-card
            color="orange-lighten-5"
            class="pa-5 d-flex flex-column align-center justify-center hover:scale elevation-1"
            to="/post/parttime"
        >
          <v-icon size="40" color="orange-darken-2">mdi-storefront</v-icon>
          <div class="text-subtitle-1 font-weight-medium mt-3">알바 모집 등록</div>
          <div class="text-caption text-grey-darken-1 mt-1">시급 알바 경매 구하기</div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
