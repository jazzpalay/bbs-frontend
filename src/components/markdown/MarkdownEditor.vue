<script setup lang="ts">
import { ref, watch, onMounted } from "vue"

defineEmits(['typing'])

const content = defineModel<string>()
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const resize = () => {
  const el = textareaRef.value
  if (!el) return

  el.style.height = "auto"
  el.style.height = el.scrollHeight + "px"
}

onMounted(resize)
watch(content, resize)
</script>

<template>
  <textarea
    v-model="content"
    ref="textareaRef"
    class="editor"
    @input="$emit('typing')"
    placeholder="Markdownを書いてください"
  />
</template>

<style scoped>
.editor{
  width:100%;
  min-height:100%;
  padding:16px;
  font-family:monospace;
  resize:none;
  overflow:hidden;
  box-sizing:border-box;
}
</style>