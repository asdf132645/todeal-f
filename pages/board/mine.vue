<template>

  <div class="mt-2">
    <v-list lines="three" density="comfortable">
      <v-list-item v-for="(post, idx) in posts" :key="post.id" class="hoverable">
        <v-list-item-content @click="goToPost(post.id)">
          <v-list-item-title class="font-weight-bold">{{ post.title }}</v-list-item-title>
          <v-list-item-subtitle class="text-truncate">{{ post.content }}</v-list-item-subtitle>
          <v-list-item-subtitle class="text-caption text-grey">
            💬 {{ post.commentCount }} ・ {{ formatDate(post.createdAt) }}
          </v-list-item-subtitle>
        </v-list-item-content>

        <!--  점 세 개 메뉴로 수정/삭제 -->
        <template #append>
          <v-menu offset-y>
            <template #activator="{ props }">
              <v-btn icon v-bind="props">
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>

            <v-list>
              <v-list-item @click="editPost(post.id)">
                <v-list-item-title>{{ $t('auto_key_46') }}</v-list-item-title>
              </v-list-item>
              <v-list-item @click="deletePost(post.id)">
                <v-list-item-title>{{ $t('auto_key_47') }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>

        <v-divider v-if="idx !== posts.length - 1" class="my-2" />
      </v-list-item>
    </v-list>

    <!--  페이지네이션 -->
    <v-pagination
        v-if="totalPages > 1"
        v-model="page"
        :length="totalPages"
        @update:model-value="load"
        class="mt-4 d-flex justify-center"
    />
  </div>

</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
// 0-indexed
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { boardApi } from "@/domains/board/infrastructure/boardApi";
const posts = ref([]);
const page = ref(1);
const size = 5;
const totalPages = ref(1);
const router = useRouter();

const load = async () => {
    const res = await boardApi.getMyPosts({
        page: page.value - 1,
        size
    });

    posts.value = res?.content;
    totalPages.value = Math.ceil(res?.totalElements / size);
};

const deletePost = async (postId: number) => {
    if (confirm(t("auto_key_49"))) {
        await boardApi.deletePost(postId);
        await load();
    }
};

const goToPost = (id: number) => router.push(`/board/${id}`);
const editPost = (id: number) => router.push(`/board/edit/${id}`);
const formatDate = (iso: string) => new Date(iso).toLocaleDateString();
onMounted(load);
</script>