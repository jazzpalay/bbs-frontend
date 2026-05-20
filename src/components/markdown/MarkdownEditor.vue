<script setup lang="ts">
import { nextTick, ref } from 'vue'

const content = defineModel<string>(
  {
    type: String,
    default: ''
  }
)

const props = defineProps<{
  error?: boolean
}>()  

const emit = defineEmits<{
  'scroll': [scrollTop: number]
  'paste-image': [file: File]
  'add-image': [file: File]
}>()

const handleScroll = (e: Event) => {
  const textarea = e.target as HTMLTextAreaElement
  emit('scroll', textarea.scrollTop)
}

const handlePaste = (e: ClipboardEvent) => {
  const clipboardData = e.clipboardData?.items
  if (!clipboardData) return

  for (const item of clipboardData) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (!file) continue

      emit('add-image', file)
      e.preventDefault()
      }
    }
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()

  const files = e.dataTransfer?.files
  if (!files) return

  for (const file of files) {
    if (file.type.startsWith('image/')) {
      emit('add-image', file)
    }
  }
}

const textareaRef = ref<HTMLTextAreaElement | null>(null)

const insertAtCursor = (text: string) => {
  const textarea = textareaRef.value

  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd

  content.value =
    content.value.slice(0, start) +
    text +
    content.value.slice(end)

  nextTick(() => {
    if (!textarea) return
    textarea.focus()
    textarea.selectionStart =
      textarea.selectionEnd =
      start + text.length
  })
}

defineExpose({
  insertAtCursor
})

</script>

<template>
  <textarea 
    ref="textareaRef"
    v-model="content" 
    class="editor"
    :class="{ 'error': props.error }"
    @scroll="handleScroll"
    @paste="handlePaste"
    @drop="handleDrop"
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