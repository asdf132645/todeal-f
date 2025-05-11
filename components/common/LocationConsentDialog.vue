<template>
  <v-dialog v-model="internalVisible" persistent max-width="400">
    <v-card>
      <v-card-title class="text-h6 font-weight-bold">
        위치 사용 허용
      </v-card-title>
      <v-card-text>
        내 주변의 중고 거래와 알바를 보기 위해 위치 정보를 사용합니다. 허용하시겠습니까?
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="grey" text @click="emitConsent(false)">거부</v-btn>
        <v-btn color="primary" @click="emitConsent(true)">허용</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'consent', value: boolean): void
}>()

const internalVisible = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  internalVisible.value = val
})

watch(internalVisible, (val) => {
  emit('update:modelValue', val)
})

const emitConsent = (value: boolean) => {
  emit('consent', value)
  internalVisible.value = false
}
</script>
