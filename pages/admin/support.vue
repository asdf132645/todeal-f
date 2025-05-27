<template>
  <v-container class="py-6">
    <v-card class="pa-4" style="background: #1A1B1D; color: #F2F3F4">
      <div class="text-h6 font-weight-bold mb-4">📬 고객 문의 내역</div>

      <v-data-table
          :headers="headers"
          :items="inquiries"
          dense
          style="background: #1A1B1D"
          class="text-white"
      >
        <template #item.createdAt="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>

        <template #item.adminReply="{ item }">
          <div>
            <div v-if="item.adminReply" class="text-caption text-success mb-1">
              ▶ {{ item.adminReply }}
            </div>
            <v-btn
                size="x-small"
                class="ml-1"
                style="background-color: #FFD54F; color: #0E0F10"
                @click="openReplyDialog(item)"
            >
              {{ item.status === 'ANSWERED' ? '수정' : '답변' }}
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- 답변 입력 다이얼로그 -->
    <v-dialog v-model="dialog.visible" max-width="500">
      <v-card>
        <v-card-title class="text-subtitle-1 font-weight-bold">문의 답변 작성</v-card-title>
        <v-card-text>
          <v-textarea
              v-model="dialog.replyText"
              label="답변 내용"
              rows="4"
              outlined
              hide-details
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="dialog.visible = false">취소</v-btn>
          <v-btn color="primary"   text @click="submitReply">저장</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supportApi } from '@/domains/support/infrastructure/supportApi'

const inquiries = ref<any[]>([])
const headers = [
  { text: 'ID', value: 'id' },
  { text: '유형', value: 'type' },
  { text: '이메일', value: 'email' },
  { text: '제목', value: 'title' },
  { text: '내용', value: 'content' },
  { text: '작성일', value: 'createdAt' },
  { text: '답변', value: 'adminReply' }
]

const dialog = ref({
  visible: false,
  inquiryId: null as number | null,
  replyText: ''
})

onMounted(fetchInquiries)

async function fetchInquiries() {
  try {
    inquiries.value = await supportApi.fetchAll()
  } catch (e) {
    console.error('문의 내역 조회 실패', e)
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ko-KR')
}

function openReplyDialog(item: any) {
  dialog.value.inquiryId = item.id
  dialog.value.replyText = item.adminReply || ''
  dialog.value.visible = true
}

async function submitReply() {
  try {
    if (dialog.value.inquiryId !== null) {
      await supportApi.submitReply(dialog.value.inquiryId, dialog.value.replyText)
      await fetchInquiries()
      dialog.value.visible = false
    }
  } catch (e) {
    console.error('답변 저장 실패', e)
  }
}
</script>
