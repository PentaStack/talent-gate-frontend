<template>
  <div class="flex flex-col items-center">
    <div class="relative">
      <div
        v-if="loading"
        class="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center"
      >
        Loading...
      </div>
      <img
        v-else-if="preview"
        :src="preview"
        class="w-20 h-20 rounded-full object-cover"
      />
      <div
        v-else
        class="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold"
      >
        {{ initials }}
      </div>
      <input
        ref="input"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="hidden"
        @change="onFile"
      />
    </div>
    <button class="mt-2 text-sm text-blue-600" @click="pick">
      {{ label }}
    </button>
    <div v-if="error" class="text-red-600 text-sm mt-2">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { PropType } from "vue";
import { uploadAvatar } from "@/api/profile";

const props = defineProps({
  currentUrl: { type: String as PropType<string | null>, default: null },
  label: { type: String, default: "Change" },
  userInitials: { type: String, default: "U" },
});

const emits = defineEmits<{ (e: "uploaded", url: string): void }>();

const input = ref<HTMLInputElement | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const preview = ref<string | null>(props.currentUrl);

watch(
  () => props.currentUrl,
  (v) => {
    preview.value = v;
  },
);

const initials = computed(() => {
  return props.currentUrl ? "" : props.userInitials;
});

function pick() {
  error.value = null;
  input.value?.click();
}

async function onFile(e: Event) {
  const files = (e.target as HTMLInputElement).files;
  if (!files || files.length === 0) return;
  const file = files[0];

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    error.value = "Invalid file type";
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    // 2MB
    error.value = "File is too large (max 2MB)";
    return;
  }

  loading.value = true;
  try {
    const data = await uploadAvatar(file);
    const url = data.avatar_url ?? data.logo_url;
    preview.value = url;
    emits("uploaded", url);
  } catch (err: any) {
    error.value = err.message || "Upload failed";
  } finally {
    loading.value = false;
  }
}
</script>
