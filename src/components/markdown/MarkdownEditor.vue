<script setup lang="ts">
import { ref } from 'vue'

const content = defineModel<string>()
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const emit = defineEmits<{
  'scroll': [scrollTop: number]
}>()

const handleScroll = (e: Event) => {
  const textarea = e.target as HTMLTextAreaElement
  emit('scroll', textarea.scrollTop)
}
</script>

<template>
  <textarea 
    ref="textareaRef"
    v-model="content" 
    class="editor"
    @scroll="handleScroll"
    placeholder="Markdownを書いてください" 
  />
</template>

<style scoped>
.editor {
  width: 100%;
  height: 100%;
  padding: 16px;
  font-family: monospace;
  border: none;
  outline: none;
  resize: none;
  box-sizing: border-box;
  overflow: auto;
  display: block;
}
</style>