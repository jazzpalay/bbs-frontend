<script setup lang="ts">
import CommonLayout from '@/views/layouts/CommonLayout.vue'
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { getTags, type Tag } from '@/api/tag'

import MarkdownEditor from "@/components/markdown/MarkdownEditor.vue"
import MarkdownPreview from "@/components/markdown/MarkdownPreview.vue"
import MarkdownHelp from "@/components/markdown/MarkdownHelp.vue"

const title = ref('')
const date = ref(new Date().toISOString().split('T')[0])
const content = ref('')
const tagWrapper = ref<HTMLElement | null>(null)

const editorRef = ref<HTMLElement | null>(null)
const previewRef = ref<HTMLElement | null>(null)

const tags = ref<Tag[]>([])
const selectedTags = ref<string[]>([])
const isTagPanelOpen = ref(false)
const isHelpOpen = ref(false)
const isTyping = ref(false)

onMounted(async () => {
    const res = await getTags()
    tags.value = res.list
    document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
})

const toggleTagPanel = () => { isTagPanelOpen.value = !isTagPanelOpen.value }
const toggleTag = (tag: string) => {
    if (selectedTags.value.includes(tag)) {
        selectedTags.value = selectedTags.value.filter(t => t !== tag)
    } else {
        selectedTags.value.push(tag)
    }
}
const handleClickOutside = (event: MouseEvent) => {
    if (!tagWrapper.value || !tagWrapper.value.contains(event.target as Node)) {
        isTagPanelOpen.value = false
    }
}
const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
const getTagStyle = (tag: Tag) => {
    const isActive = selectedTags.value.includes(tag.tagName)
    return {
        backgroundColor: isActive ? tag.tagColor : hexToRgba(tag.tagColor, 0.2),
        color: isActive ? '#fff' : tag.tagColor,
        border: `1.5px solid ${tag.tagColor}`,
    }
}
const getSelectedTagStyle = (tagName: string) => {
    const tag = tags.value.find(t => t.tagName === tagName)
    return tag ? { backgroundColor: tag.tagColor, color: '#fff' } : {}
}

const syncScroll = (source: "editor" | "preview") => {

    const editor = editorRef.value
    const preview = previewRef.value

    if (!editor || !preview) return

    const from = source === "editor" ? editor : preview
    const to = source === "editor" ? preview : editor

    const ratio =
        from.scrollTop /
        (from.scrollHeight - from.clientHeight)

    to.scrollTop =
        ratio *
        (to.scrollHeight - to.clientHeight)
}

watch(content, async () => {

  if (isTyping.value) return

  await nextTick()

  const editor = editorRef.value
  const preview = previewRef.value

  if (!editor || !preview) return

  const ratio =
    editor.scrollTop /
    (editor.scrollHeight - editor.clientHeight)

  preview.scrollTop =
    ratio *
    (preview.scrollHeight - preview.clientHeight)

})

const clearTags = () => { selectedTags.value = [] }
const openHelp = () => { isHelpOpen.value = true }
const closeHelp = () => { isHelpOpen.value = false }
const saveLog = () => { console.log('Saving...', { title: title.value, content: content.value }) }
</script>

<template>
    <CommonLayout>
        <div class="log-create-container">

            <div class="card form-card">
                <div class="form-row title-row">
                    <label>タイトル</label>
                    <input v-model="title" placeholder="タイトルを入力..." />
                </div>

                <div class="form-row date-row">
                    <label>作業日</label>
                    <input type="date" v-model="date" />
                </div>

                <div class="form-row tag-row">
                    <label>タグ</label>
                    <div class="tag-input-wrapper">
                        <div class="tag-display">
                            <span v-if="selectedTags.length === 0" class="tag-placeholder">未選択</span>
                            <span v-for="tagName in selectedTags" :key="tagName" class="tag-chip"
                                :style="getSelectedTagStyle(tagName)">
                                {{ tagName }}
                            </span>
                        </div>
                        <div ref="tagWrapper" class="tag-select-container">
                            <button class="tag-select-btn" @click="toggleTagPanel">タグ選択</button>
                            <div v-if="isTagPanelOpen" class="tag-panel">
                                <div class="tag-panel-header">
                                    <button v-if="selectedTags.length > 0" class="clear-btn"
                                        @click="clearTags">全解除</button>
                                </div>
                                <div class="tag-list">
                                    <span v-for="tag in tags" :key="tag.tagId" class="filter-tag"
                                        :style="getTagStyle(tag)" @click.stop="toggleTag(tag.tagName)">
                                        {{ tag.tagName }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card editor-card">
                <div class="editor-header">
                    <div class="editor-title">
                        <h3>Markdown Editor</h3>
                        <span class="sync-badge">Auto Sync On</span>
                    </div>
                    <button class="help-btn" @click="openHelp">Markdown Help</button>
                </div>

                <div class="editor-area">
                    <div class="pane editor-pane" ref="editorRef" @scroll="syncScroll('editor')">
                        <MarkdownEditor v-model="content" class="full-editor" @typing="isTyping = true" />
                    </div>
                    <div class="pane preview-pane" ref="previewRef" @scroll="syncScroll('preview')">
                        <div class="preview-label">Live Preview</div>
                        <MarkdownPreview :content="content" class="full-preview" />
                    </div>
                </div>

                <div class="action-row">
                    <div class="top-nav">
                        <router-link to="/dashboard" class="back-link">
                            <span class="icon">←</span> ダッシュボードに戻る
                        </router-link>
                    </div>
                    <button class="submit-btn" @click="saveLog">ログを保存する</button>
                </div>
            </div>
        </div>

        <div v-if="isHelpOpen" class="modal-overlay" @click="closeHelp">
            <div class="modal" @click.stop>
                <div class="modal-header">
                    <h3>Markdown Guide</h3>
                    <button class="close-btn" @click="closeHelp">✕</button>
                </div>
                <MarkdownHelp />
            </div>
        </div>
    </CommonLayout>
</template>

<style scoped>
/* ===== Layout ===== */

.log-create-container {
  width: min(95%, 1500px);
  margin: 5px auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: calc(100vh - 40px);
  overflow: hidden;
}

.top-nav {
  padding: 0 10px;
}

.back-link {
  text-decoration: none;
  color: #64748b;
  font-weight: 600;
  font-size: 14px;
  transition: color 0.2s;
}

.back-link:hover {
  color: #14b8a6;
}

/* ===== Form Card ===== */

.form-card {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 16px 24px;
  border-bottom: 2px solid #f1f5f9;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.title-row {
  flex: 0 0 350px;
}

.date-row {
  flex: 0 0 auto;
}

.tag-row {
  flex: 1;
}

.form-row input {
  width: 100%;
}

/* ===== Tag UI ===== */

.tag-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.tag-display {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 6px 12px;
  min-height: 42px;
  background: #fff;
  align-items: center;
}

.tag-panel-header {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  margin-bottom: 4px;
}

.tag-select-container {
  position: relative;
}

.tag-panel {
  position: absolute;
  top: 50px;
  right: 0;
  width: 400px;
  background: white;
  z-index: 100;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  padding: 16px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-tag {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 999px;
  font-size: clamp(9px, 3.5vw, 15px);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.filter-tag:hover {
  opacity: 0.8;
}

.clear-btn {
  font-size: 12px;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 4px 8px;
}

.clear-btn:hover {
  color: #0f172a;
}

/* ===== Editor Card ===== */

.editor-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.06);

  padding: 0 30px;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
}

.editor-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sync-badge {
  font-size: 10px;
  color: #14b8a6;
  background: #ccfbf1;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: bold;
}

/* ===== Editor Area ===== */

.editor-area {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  overflow: hidden;

}

.pane {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
}

.editor-pane {
  background: #fafafa;
  border-right: 1px solid #e5e7eb;
}

.preview-pane {
  padding: 28px;
  padding-bottom: 80px;
  background: white;
}

.editor-pane textarea {
  width: 100%;
  min-height: 100%;
  padding: 20px;

  border: none;
  outline: none;
  resize: none;

  font-size: 15px;
  line-height: 1.7;
  background: transparent;
  box-sizing: border-box;
  overflow: hidden;
}

.preview-label {
  position: absolute;
  top: 10px;
  right: 20px;
  font-size: 11px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* ===== Action Row ===== */

.action-row {
  padding: 12px 24px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;

  display: flex;
  justify-content: space-between;
  align-items: center;
}

.submit-btn {
  background: #14b8a6;
  color: white;
  padding: 10px 30px;
  border-radius: 8px;
  font-weight: bold;
  border: none;
  cursor: pointer;
}

/* ===== Common ===== */

label {
  font-weight: bold;
  color: #475569;
  font-size: 14px;
  white-space: nowrap;
}

input {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.tag-chip {
  padding: 3px 10px;
  border-radius: 15px;
  font-size: 11px;
  font-weight: bold;
}

.tag-placeholder {
  color: #94a3b8;
  font-size: 13px;
}

.tag-select-btn,
.help-btn {
  border: 1.5px solid #14b8a6;
  background: transparent;
  color: #14b8a6;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

/* ===== Modal ===== */

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);

  display: flex;
  justify-content: center;
  align-items: center;

  z-index: 1000;
}

.modal {
  background: #fff;
  padding: 24px;
  border-radius: 12px;

  width: min(800px, 90%);
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

/* ===== Scroll Hack ===== */

.full-editor,
.full-preview {
  min-height: 100%;
}
</style>