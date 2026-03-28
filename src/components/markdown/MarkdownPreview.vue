<script setup lang="ts">
import { computed, watch, nextTick, ref } from "vue"
import { marked } from "marked"
import hljs from "highlight.js"
import DOMPurify from "dompurify"

const previewRef = ref<HTMLElement | null>(null)

marked.setOptions({
  breaks: true,
  gfm: true
})

const props = defineProps<{
  content: string
}>()

const renderedMarkdown = computed(() => {
  const rawHtml = marked.parse(props.content) as string

  return DOMPurify.sanitize(rawHtml)
})

watch(renderedMarkdown, async () => {

  await nextTick()

  const blocks = previewRef.value?.querySelectorAll("pre code")

  blocks?.forEach((block) => {

    hljs.highlightElement(block as HTMLElement)

    const pre = block.parentElement

    if (!pre) return

    // すでにボタンがある場合は作らない
    if (pre.querySelector(".copy-btn")) return

    const button = document.createElement("button")
    button.innerText = "Copy"
    button.className = "copy-btn"

    button.onclick = () => {
      navigator.clipboard.writeText(block.textContent || "")
      button.innerText = "Copied!"

      setTimeout(() => {
        button.innerText = "Copy"
      }, 1500)
    }

    pre.appendChild(button)

  })

})
</script>

<template>
  <div ref="previewRef" class="markdown-body" v-html="renderedMarkdown"></div>
</template>

<style>
.markdown-body {
  width: 100%;
  margin-bottom: 40px;
  /* 下部に余白を作る */
  word-break: break-word;
  overflow-wrap: break-word;
}

.markdown-body pre {
  position: relative;
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 18px;
  border-radius: 8px;

}

.markdown-body code {
  font-family: Consolas, Monaco, monospace;
  font-size: 14px;
}

.markdown-body pre code {
  background: none;
  font-family: Consolas, Monaco, monospace;
  font-size: 14px;
}

.markdown-body h1 {
  font-size: 28px;
  margin-top: 24px;
}

.markdown-body h2 {
  font-size: 22px;
  margin-top: 20px;
}

.markdown-body p {
  line-height: 1.8;
}

.copy-btn {
  position: absolute;
  top: 8px;
  right: 8px;

  font-size: 11px;
  padding: 4px 8px;

  border-radius: 6px;
  border: none;

  background: rgba(255, 255, 255, 0.08);
  color: #cbd5f5;

  cursor: pointer;

  opacity: 0;
  transition: all 0.2s ease;
}

/* hoverしたら表示 */
.markdown-body pre:hover .copy-btn {
  opacity: 1;
}

/* hover時 */
.copy-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}
</style>