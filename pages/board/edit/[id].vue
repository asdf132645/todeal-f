<template>

  <div>
    <v-alert
        type="warning"
        dense
        class="mb-3 text-caption"
        text
        style="font-size: 0.8rem; line-height: 1.4;"
    >
      커뮤니티 가이드라인에 어긋나는 내용은 사전 통보 없이 삭제될 수 있습니다.
    </v-alert>

    <div class="mb-1 text-caption text-grey-darken-1">{{ $t('auto_key_119') }}</div>
    <v-select
        v-model="category"
        :items="categoryOptions"
        label="카테고리 선택"
        item-title="label"
        item-value="value"
        outlined
        clearable
        class="mb-4"
    />

    <!-- 이미지 업로더 -->
    <div class="image-upload-wrapper mb-5">
      <div class="image-grid">
        <div
            v-for="(img, index) in imageUrls"
            :key="index"
            class="upload-image-slot"
            @click="removeImage(index)"
        >
          <v-img :src="img" cover max-width="100" max-height="100" class="rounded" />
        </div>
        <div v-if="imageUrls.length < 5" class="upload-image-slot add" @click="triggerFileInput">
          <v-icon size="50">mdi-plus</v-icon>
        </div>
        <input
            type="file"
            ref="fileInput"
            accept="image/*"
            class="d-none"
            multiple
            @change="handleImageUpload"
        />
      </div>
      <div class="text-caption text-grey-darken-1 mt-1">{{ imageUrls.length }} / 5</div>
    </div>

    <!-- 번역 안내 및 버튼 -->
    <div class="mb-1 text-caption text-grey-darken-1">
      {{ _t('board.translate_tip') }}
    </div>
    <v-btn block color="primary" class="mb-4" @click="toggleTranslationPanel">
      <v-icon start>mdi-translate</v-icon>
      {{ showTranslatePanel ? _t('board.closeTranslation') : _t('board.openTranslationHelper') }}
    </v-btn>

    <v-expand-transition>
      <v-card v-show="showTranslatePanel" class="pa-4 mb-4">
        <div class="mb-1 text-caption text-grey-darken-1">
          제목과 내용을 선택한 언어로 번역해 드립니다. 정확한 번역을 위해 원문을 먼저 입력해주세요. 투딜에서 제공하는 번역은 완벽하지 않습니다.
        </div>

        <v-row dense class="mb-3">
          <v-col cols="6">
            <v-select
                v-model="sourceLang"
                :items="langOptions"
                label="원문 언어"
                item-title="label"
                item-value="value"
                dense
                outlined
            />
          </v-col>
          <v-col cols="6">
            <v-select
                v-model="targetLang"
                :items="langOptions"
                label="번역할 언어"
                item-title="label"
                item-value="value"
                dense
                outlined
            />
          </v-col>
        </v-row>

        <v-btn
            :disabled="!sourceLang || !targetLang || loadingTranslation"
            color="secondary"
            block
            class="mb-3"
            :loading="loadingTranslation"
            @click="runTranslation"
        >
          {{ loadingTranslation ? '번역 중입니다...' : '번역 시작' }}
        </v-btn>
      </v-card>
    </v-expand-transition>

    <!-- 제목 / 내용 -->
    <v-text-field v-model="display.title" label="제목" outlined clearable class="mb-3" />
    <v-textarea v-model="display.content" label="내용" outlined rows="4" auto-grow class="mb-3" />

    <!-- 수정 완료 버튼 -->
    <v-btn
        block
        color="primary"
        class="mt-2"
        :loading="loading"
        @click="submit"
    >
      수정 완료
    </v-btn>
  </div>

</template>

<script setup lang="ts">
const { t } = useI18n()
//  실제 저장되는 값
//  화면에 표시/편집용
//  화면에서 입력한 걸 저장용 변수에 반영
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { boardApi } from "@/domains/board/infrastructure/boardApi";
import { apiClient } from "@/libs/http/apiClient";
import { uploadImage } from "~/domains/upload/infrastructure/uploadApi";

const {
    t: _t
} = useI18n();

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const loadingTranslation = ref(false);
const postId = Number(route.params.id);

if (isNaN(postId)) {
    alert("잘못된 게시글 ID입니다.");
    router.replace("/board");
}

const title = ref("");
const content = ref("");

const display = ref({
    title: "",
    content: ""
});

const category = ref("");
const imageUrls = ref<string[]>([]);
const originalPost = ref<any>(null);
const showTranslatePanel = ref(false);
const sourceLang = ref("ko");
const targetLang = ref("");
const fileInput = ref<HTMLInputElement | null>(null);

const langOptions = [{
    label: t("auto_key_27"),
    value: "ko"
}, {
    label: t("auto_key_75"),
    value: "en"
}];

const categoryOptions = [{
    label: t("auto_key_101"),
    value: "local-life"
}, {
    label: t("auto_key_102"),
    value: "trade-help"
}, {
    label: t("auto_key_103"),
    value: "parttime"
}, {
    label: t("auto_key_104"),
    value: "language-exchange"
}, {
    label: t("auto_key_105"),
    value: "culture"
}, {
    label: "Q&A",
    value: "qna"
}, {
    label: t("auto_key_106"),
    value: "free"
}];

const load = async () => {
    try {
        const res = await boardApi.getPost(postId);
        const post = res?.data || res;
        originalPost.value = post;
        title.value = post.title;
        content.value = post.content;
        display.value.title = post.translatedTitle ? post.translatedTitle : post.title;
        display.value.content = post.translatedContent ? post.translatedContent : post.content;
        category.value = post.category;
        imageUrls.value = post.imageUrls || [];
        sourceLang.value = post.language || "ko";
    } catch (e) {
        alert("게시글을 불러올 수 없습니다.");
        router.replace("/board");
    }
};

const triggerFileInput = () => fileInput.value?.click();
const removeImage = (index: number) => imageUrls.value.splice(index, 1);

const handleImageUpload = async (e: Event) => {
    const files = (e.target as HTMLInputElement).files;

    if (!files)
        return;

    const selected = Array.from(files).slice(0, 5 - imageUrls.value.length);
    const uploaded: string[] = [];

    for (const file of selected) {
        try {
            const url = await uploadImage(file);
            uploaded.push(url);
        } catch (e) {
            alert(t("auto_key_78"));
            console.error(e);
        }
    }

    imageUrls.value.push(...uploaded);

    if (fileInput.value)
        fileInput.value.value = "";
};

const toggleTranslationPanel = () => {
    showTranslatePanel.value = !showTranslatePanel.value;
};

const runTranslation = async () => {
    if (!display.value.title || !display.value.content) {
        alert("제목과 내용을 먼저 입력해주세요.");
        return;
    }

    loadingTranslation.value = true;

    try {
        const [resTitle, resContent] = await Promise.all([apiClient.post("/api/translate", {
            source: sourceLang.value,
            target: targetLang.value,
            text: display.value.title
        }), apiClient.post("/api/translate", {
            source: sourceLang.value,
            target: targetLang.value,
            text: display.value.content
        })]);

        display.value.title = resTitle?.translatedText || display.value.title;
        display.value.content = resContent?.translatedText || display.value.content;
    } catch (e) {
        console.error(e);
        alert("번역 중 오류가 발생했습니다.");
    } finally {
        loadingTranslation.value = false;
    }
};

const submit = async () => {
    if (!display.value.title.trim() || !display.value.content.trim()) {
        alert("제목과 내용을 입력해주세요.");
        return;
    }

    if (!category.value) {
        alert("카테고리를 선택해주세요.");
        return;
    }

    title.value = display.value.title;
    content.value = display.value.content;

    try {
        loading.value = true;

        await boardApi.updatePost(postId, {
            title: title.value,
            content: content.value,
            category: category.value,
            language: sourceLang.value,
            latitude: originalPost.value.latitude,
            longitude: originalPost.value.longitude,
            nickname: originalPost.value.nickname,
            region: originalPost.value.region,
            imageUrls: imageUrls.value
        });

        router.push(`/board/${postId}`);
    } catch (e) {
        console.error(e);
        alert("게시글 수정 중 오류가 발생했습니다.");
    } finally {
        loading.value = false;
    }
};

onMounted(load);
</script>

.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.upload-image-slot {
  width: 100px;
  height: 100px;
  border: 1px dashed #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
}
.upload-image-slot.add:hover {
  background-color: #f5f5f5;
}