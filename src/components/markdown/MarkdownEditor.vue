<script setup lang="ts">

const content = defineModel<string>()

const props = defineProps<{
  error?: boolean
}>()  

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
    :class="{ 'error': props.error }"
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

.editor.error::placeholder {
  color: #e53935; /* ← 赤 */
}
</style>