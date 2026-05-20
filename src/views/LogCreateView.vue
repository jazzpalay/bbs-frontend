<script setup lang="ts">
import CommonLayout from '@/views/layouts/CommonLayout.vue'
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { getTags, type Tag } from '@/api/tag'
import { createLog, getLogDetail, updateLog } from '@/api/log'
import { useRouter, useRoute } from 'vue-router'
import { AxiosError } from 'axios'

import MarkdownEditor from "@/components/markdown/MarkdownEditor.vue"
import MarkdownPreview from "@/components/markdown/MarkdownPreview.vue"
import MarkdownHelp from "@/components/markdown/MarkdownHelp.vue"

const router = useRouter()
const route = useRoute()
const logId = route.params.logId as string | undefined
const savedLogId = ref<string>('')
const isEdit = !!logId
const title = ref('')
const logDate = ref<string>(new Date().toISOString().split('T')[0]!)
const content = ref('')
const tagWrapper = ref<HTMLElement | null>(null)

const editorRef = ref<HTMLElement | null>(null)
const previewRef = ref<HTMLElement | null>(null)
const successMessage = ref('')
const createError = ref('')
const titleError = ref(false)
const contentError = ref(false)
const dateError = ref(false)
let isSyncing = false

const markdownEditorRef = ref<InstanceType<typeof MarkdownEditor> | null>(null)
const tempImageMap = new Map<string, File>()
const blobUrls = ref<string[]>([])

const activeTab = ref<'editor' | 'preview'>('editor')
const toggleTab = (tab: 'editor' | 'preview') => {
  activeTab.value = tab
}

const tags = ref<Tag[]>([])
const selectedTags = ref<Tag[]>([])
const isTagPanelOpen = ref(false)
const isHelpOpen = ref(false)

const codeLanguage = ref('javascript') // デフォルト言語

const codeLanguages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'bash', label: 'Bash' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'xml', label: 'XML' },
  { value: 'markdown', label: 'Markdown' },
]

onMounted(async () => {
  const res = await getTags()
  tags.value = res.list

  if (isEdit) {
    const log = await getLogDetail(logId!)

    title.value = log.title
    content.value = log.content
    logDate.value = log.logDate

    selectedTags.value = tags.value.filter(tag =>
      log.tags.some(t => t.tagId === tag.tagId)
    )
  }
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  // blob URL をクリーンアップ
  blobUrls.value.forEach(url => {
    URL.revokeObjectURL(url)
  })
})

const toggleTagPanel = () => { isTagPanelOpen.value = !isTagPanelOpen.value }
const toggleTag = (tag: Tag) => {
  const exists = selectedTags.value.some(t => t.tagId === tag.tagId)

  if (exists) {
    selectedTags.value = selectedTags.value.filter(t => t.tagId !== tag.tagId)
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
  const isActive = selectedTags.value.some(t => t.tagId === tag.tagId)
  return {
    backgroundColor: isActive ? tag.tagColor : hexToRgba(tag.tagColor, 0.2),
    color: isActive ? '#fff' : tag.tagColor,
    border: `1.5px solid ${tag.tagColor}`,
  }
}
const getSelectedTagStyle = (tag: Tag) => {
  const selectedTag = tags.value.find(t => t.tagName === tag.tagName)
  return selectedTag ? { backgroundColor: selectedTag.tagColor, color: '#fff' } : {}
}

const syncScroll = (source: "editor" | "preview", scrollTop?: number) => {
  if (isSyncing) return
  isSyncing = true

  const editor = editorRef.value
  const preview = previewRef.value

  if (!editor || !preview) return

  // textarea からのスクロールイベント
  if (source === "editor" && scrollTop !== undefined) {
    preview.scrollTop = scrollTop
  } else {
    // プレビューからのスクロールイベント
    const from = source === "editor" ? editor : preview
    const to = source === "editor" ? preview : editor
    to.scrollTop = from.scrollTop
  }

  isSyncing = false
}

// textarea の参照を取得する関数
const getTextarea = (): HTMLTextAreaElement | null => {
  return editorRef.value?.querySelector('textarea') as HTMLTextAreaElement
}

const insertMarkdown = (before: string, after: string, placeholder: string) => {
  const textarea = getTextarea()
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = content.value.substring(start, end)
  const beforeText = content.value.substring(0, start)
  const afterText = content.value.substring(end)

  const newText = selectedText || placeholder
  content.value = beforeText + before + newText + after + afterText

  // フォーカスを戻す
  nextTick(() => {
    textarea.focus()
    const newStart = start + before.length
    const newEnd = newStart + newText.length
    textarea.setSelectionRange(newStart, newEnd)
  })
}

const insertCodeBlock = () => {
  const textarea = getTextarea()
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = content.value.substring(start, end)
  const beforeText = content.value.substring(0, start)
  const afterText = content.value.substring(end)

  const codeText = selectedText || 'code'
  const newContent = `${beforeText}\`\`\`${codeLanguage.value}\n${codeText}\n\`\`\`${afterText}`
  content.value = newContent

  nextTick(() => {
    textarea.focus()
  })
}

const insertList = (type: 'ul' | 'ol') => {
  const textarea = getTextarea()
  if (!textarea) return

  const start = textarea.selectionStart
  const beforeText = content.value.substring(0, start)
  const afterText = content.value.substring(start)

  const prefix = type === 'ul' ? '- Item 1\n- Item 2\n- Item 3' : '1. Item 1\n2. Item 2\n3. Item 3'
  content.value = beforeText + prefix + '\n' + afterText

  nextTick(() => {
    textarea.focus()
  })
}

const insertLink = () => {
  const textarea = getTextarea()
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = content.value.substring(start, end)
  const beforeText = content.value.substring(0, start)
  const afterText = content.value.substring(end)

  const linkText = selectedText || 'Link text'
  const newContent = `${beforeText}[${linkText}](https://example.com)${afterText}`
  content.value = newContent

  nextTick(() => {
    textarea.focus()
  })
}

// 画像貼り付け処理
const handlePasteImage = (file: File) => {
  const tempUrl = URL.createObjectURL(file)

  //blob URL 一覧管理
  blobUrls.value.push(tempUrl)

  tempImageMap.set(tempUrl, file)

  const markdown =
    `![${file.name}](${tempUrl})`

  markdownEditorRef.value?.insertAtCursor(
    `\n${markdown}\n`
  )
}

// Markdown 内の blob URL を抽出する関数
const extractBlobUrls = (markdown: string): string[] => {
  const regex = /blob:[^)]+/g
  return markdown.match(regex) || []
}

// FormData作成関数
const createFormData = (
  blobUrls: string[]
): FormData => {

  const uploads: {
    blobUrl: string
    image: File
  }[] = []

  for (const blobUrl of blobUrls) {
    const image = tempImageMap.get(blobUrl)

    if (!image) continue

    uploads.push({
      blobUrl,
      image
    })
  }

  if (uploads.length === 0) {
    return new FormData()
  }

  const metadata = uploads.map(upload => ({
    blobUrl: upload.blobUrl
  }))

  const formData = new FormData()

  formData.append(
    'metadata',
    new Blob(
      [JSON.stringify(metadata)],
      { type: 'application/json' }
    )
  )

  uploads.forEach(upload => {
    formData.append('images', upload.image)
  })

  return formData
}

const clearTags = () => { selectedTags.value = [] }
const openHelp = () => { isHelpOpen.value = true }
const closeHelp = () => { isHelpOpen.value = false }

// 保存or更新処理
const handleSubmit = async () => {
  if (!title.value.trim()) {
    titleError.value = true
    return
  }
  if (!content.value.trim()) {
    contentError.value = true
    return
  }
  if (!logDate.value) {
    dateError.value = true
    return
  }

  try {
    successMessage.value = ''
    createError.value = ''

    // 画像アップロードの準備
    const blobUrls = extractBlobUrls(content.value)
    const formData = createFormData(blobUrls)

    if (isEdit) {

      // 更新処理
      const logForm = {
        title: title.value,
        content: content.value,
        logDate: logDate.value,
        tagIds: selectedTags.value.map(tag => tag.tagId)
      }
      formData.append('logForm', new Blob([JSON.stringify(logForm)], { type: 'application/json' }))
      await updateLog(logId!, formData)
      console.log('ログの更新に成功しました。');
      successMessage.value = 'ログを更新しました'

    } else {

      // 新規作成処理
      const logForm = {
        title: title.value,
        content: content.value,
        logDate: logDate.value,
        tagIds: selectedTags.value.map(tag => tag.tagId)
      }
      formData.append('logForm', new Blob([JSON.stringify(logForm)], { type: 'application/json' }))
      const newLogId = await createLog(
        formData
      );

      console.log('ログの作成に成功しました。:', newLogId);
      savedLogId.value = newLogId
      successMessage.value = 'ログを保存しました'

    }
  } catch (error) {
    console.error('ログの作成に失敗しました。:', error);
    const err = error as AxiosError<{ message: string }>
    createError.value = err?.response?.data?.message || '作成に失敗しました'
  }
}

const handleSuccess = () => {
  successMessage.value = ''
  const targetLogId = savedLogId.value || logId
  router.push(`/LogDetail/${targetLogId}`)
}
</script>

<template>
  <CommonLayout>
    <div class="log-create-container">

      <div class="card form-card">
        <div class="form-row title-row">
          <label>タイトル</label>
          <input v-model="title" :placeholder="titleError ? 'タイトルを入力してください' : 'タイトルを入力...'"
            :class="{ 'input-error': titleError }" @input="titleError = false" />
        </div>

        <div class="form-row date-row">
          <label>作業日</label>
          <input type="date" v-model="logDate" :class="{ 'date-error': dateError }" @input="dateError = false" />
        </div>
        <p v-if="dateError" class="date-error-message">
          作業日を入力してください
        </p>


        <div class="form-row tag-row">
          <label>タグ</label>
          <div class="tag-input-wrapper">
            <div class="tag-display">
              <span v-if="selectedTags.length === 0" class="tag-placeholder">未選択</span>
              <span v-for="tag in selectedTags" :key="tag.tagId" class="tag-chip" :style="getSelectedTagStyle(tag)">
                {{ tag.tagName }}
              </span>
            </div>
            <div ref="tagWrapper" class="tag-select-container">
              <button class="tag-select-btn" @click="toggleTagPanel">タグ選択</button>
              <div v-if="isTagPanelOpen" class="tag-panel">
                <div class="tag-panel-header">
                  <button v-if="selectedTags.length > 0" class="clear-btn" @click="clearTags">全解除</button>
                </div>
                <div class="tag-list">
                  <span v-for="tag in tags" :key="tag.tagId" class="filter-tag" :style="getTagStyle(tag)"
                    @click.stop="toggleTag(tag)">
                    {{ tag.tagName }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- エディタ部分にタブを追加 -->
      <div class="card editor-card">
        <div class="editor-header">
          <div class="editor-title">
            <h3>Markdown Editor</h3>
            <span class="sync-badge">Auto Sync On</span>
          </div>
          <button class="help-btn" @click="openHelp">Markdown Help</button>
        </div>

        <!-- スマホ用タブ -->
        <div class="editor-tabs">
          <button :class="['tab-btn', { active: activeTab === 'editor' }]" @click="toggleTab('editor')">
            Editor
          </button>
          <button :class="['tab-btn', { active: activeTab === 'preview' }]" @click="toggleTab('preview')">
            Preview
          </button>
        </div>

        <!-- エディタとプレビューの表示を条件付けに -->
        <div class="editor-area">
          <div :class="['pane', 'editor-pane', { hidden: activeTab === 'preview' }]" ref="editorRef">
            <MarkdownEditor v-model="content" ref="markdownEditorRef" @paste-image="handlePasteImage"
              @scroll="(scrollTop) => syncScroll('editor', scrollTop)" :error="contentError" />
            <div class="editor-toolbar">
              <button class="toolbar-btn" @click="insertMarkdown('**', '**', 'Bold')" title="Bold">
                <span class="icon">B</span>
              </button>
              <button class="toolbar-btn" @click="insertMarkdown('_', '_', 'Italic')" title="Italic">
                <span class="icon">I</span>
              </button>
              <button class="toolbar-btn" @click="insertMarkdown('~~', '~~', 'Strikethrough')" title="Strikethrough">
                <span class="icon">S</span>
              </button>
              <div class="toolbar-divider"></div>
              <button class="toolbar-btn" @click="insertMarkdown('`', '`', 'Code')" title="Inline Code">
                <span class="icon">&lt;&gt;</span>
              </button>
              <div class="code-block-wrapper">
                <select v-model="codeLanguage" class="code-language-select">
                  <option v-for="lang in codeLanguages" :key="lang.value" :value="lang.value">
                    {{ lang.label }}
                  </option>
                </select>
                <button class="toolbar-btn" @click="insertCodeBlock()" title="Code Block">
                  <span class="icon">{ }</span>
                </button>
              </div>
              <div class="toolbar-divider"></div>
              <button class="toolbar-btn" @click="insertMarkdown('# ', '\n', 'Heading 1')" title="Heading 1">
                <span class="icon">H1</span>
              </button>
              <button class="toolbar-btn" @click="insertMarkdown('## ', '\n', 'Heading 2')" title="Heading 2">
                <span class="icon">H2</span>
              </button>
              <button class="toolbar-btn" @click="insertMarkdown('> ', '\n', 'Quote')" title="Quote">
                <span class="icon">&gt;</span>
              </button>
              <div class="toolbar-divider"></div>
              <button class="toolbar-btn" @click="insertList('ul')" title="Unordered List">
                <span class="icon">•</span>
              </button>
              <button class="toolbar-btn" @click="insertList('ol')" title="Ordered List">
                <span class="icon">1</span>
              </button>
              <button class="toolbar-btn" @click="insertLink()" title="Link">
                <span class="icon">🔗</span>
              </button>
            </div>
          </div>
          <div :class="['pane', 'preview-pane', { hidden: activeTab === 'editor' }]" ref="previewRef"
            @scroll="syncScroll('preview')">
            <MarkdownPreview :content="content" />
          </div>
        </div>

        <div class="action-row">
          <div class="top-nav">
            <router-link to="/dashboard" class="back-link">
              <span class="icon">←</span> ダッシュボードに戻る
            </router-link>
          </div>
          <button class="submit-btn" @click="handleSubmit">
            {{ isEdit ? '更新' : '保存' }}
          </button>
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
  <div v-if="successMessage" class="modal-overlay">
    <div class="modal">
      <p>{{ successMessage }}</p>
      <div class="modal-actions">
        <button class="outline-btn" @click="handleSuccess()">
          閉じる
        </button>
      </div>
    </div>
  </div>
  <div v-if="createError" class="modal-overlay">
    <div class="modal">
      <p>{{ createError }}</p>
      <div class="modal-actions">
        <button class="outline-btn" @click="createError = ''">
          閉じる
        </button>
      </div>
    </div>
  </div>
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
  padding: 0;
}

.back-link {
  text-decoration: none;
  color: #64748b;
  font-weight: 600;
  font-size: 12px;
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
  flex: 0 1 auto;
}

.title-row {
  flex: 2;
}

.date-row {
  flex: 0 0 160px;
}

.tag-row {
  flex: 3;
}

.form-row input {
  width: 100%;
}

/* ===== Tag UI ===== */

.tag-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
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
  flex-shrink: 0;
}

.tag-panel {
  position: absolute;
  top: 50px;
  right: 0;
  width: 400px;
  background: white;
  z-index: 100;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 16px;
  box-sizing: border-box;
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
  /* PC ではこれで縦いっぱいに伸びる */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
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

.editor-title h3 {
  margin: 0;
  font-size: 16px;
}

.sync-badge {
  font-size: 9px;
  color: #14b8a6;
  background: #ccfbf1;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
  white-space: nowrap;
}

.date-field input {
  width: 100%;
  box-sizing: border-box;

  height: 40px;
  font-size: 16px;

  -webkit-appearance: none;
  appearance: none;

}

/* ===== Editor Area ===== */
.editor-area {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  overflow: hidden;
  min-height: 0;
}

.pane {
  height: 100%;
  overflow: hidden;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.editor-pane {
  background: #fafafa;
  border-right: 1px solid #e5e7eb;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 6px;
  background: #f5f5f5;
  border-top: 1px solid #e5e7eb;
  flex-wrap: wrap;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  color: #475569;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  background: #14b8a6;
  color: white;
  border-color: #14b8a6;
}

.toolbar-btn:active {
  transform: scale(0.95);
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: #d1d5db;
  margin: 0 4px;
}

.code-block-wrapper {
  display: flex;
  align-items: center;
  gap: 2px;
}

.code-language-select {
  padding: 4px 6px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 12px;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.code-language-select:hover {
  border-color: #14b8a6;
}

.code-language-select:focus {
  outline: none;
  border-color: #14b8a6;
  box-shadow: 0 0 0 2px rgba(20, 184, 166, 0.1);
}

.preview-pane {
  padding: 16px;
  box-sizing: border-box;
  background: white;
  overflow-y: auto;
  min-height: 0;
}

.editor-pane textarea {
  flex: 1;
  width: 100%;
  padding: 16px;

  border: none;
  outline: none;
  resize: none;

  font-size: 15px;
  line-height: 1.7;
  background: transparent;
  box-sizing: border-box;
  overflow: auto;

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
  padding: 8px 20px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;

  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.submit-btn {
  background: #14b8a6;
  color: white;
  padding: 8px 20px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 14px;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  background: #F1F5F9;
  transform: translateY(-2px);
}

.submit-btn:hover {
  background: #0d9488;
  /* 元の #14b8a6 より少しだけ濃い色 */
  transform: translateY(-2px);
  /* 少し浮く */
}

.submit-btn:active {
  transform: translateY(0);
  /* クリックした瞬間に沈む */
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

.tag-select-btn {
  border: 1.5px solid #14b8a6;
  background: transparent;
  color: #14b8a6;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  white-space: nowrap;
}

.help-btn {
  border: 1.5px solid #14b8a6;
  background: transparent;
  color: #14b8a6;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
}

/* ===== Modal ===== */

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: white;
  padding: 24px;
  border-radius: 16px;
  width: 320px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.modal-actions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.outline-btn {
  padding: 6px 14px;
  border-radius: 10px;
  border: 2px solid #14b8a6;
  background: white;
  color: #14b8a6;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
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

/* タブの追加スタイル */
.editor-tabs {
  display: none;
  /* PC では非表示 */
}

.input-error::placeholder {
  color: #ef4444;
}

.input-error {
  border: 1px solid #e53935;
}

.date-error {
  border: 1px solid #e53935;
}

.date-error-message {
  color: #e53935;
  font-size: 12px;
  margin-top: 4px;
}

.date-field {
  display: flex;
  flex-direction: column;
}



@media (max-width: 768px) {

  .log-create-container {
    height: auto;
    overflow: visible;
  }

  .card {
    margin: 0;
    border-radius: 0;
  }

  .editor-card {
    flex: none;
    display: flex;
    flex-direction: column;
    overflow: visible;
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
    padding: 0 16px;
    height: calc(100vh - 50px);
    /* フォーム部分を差し引く */
    min-height: 0;

  }

  .editor-header {
    padding: 8px 16px;
    flex-wrap: wrap;
    gap: 8px;
    flex-shrink: 0;
  }

  .editor-tabs {
    display: flex;
    gap: 0;
    border-bottom: 1px solid #e2e8f0;
    background: #fff;
    flex-shrink: 0;
  }

  .editor-area {
    flex: 1;
    display: block;
    overflow: hidden;
    min-height: 0;
    height: 100%;
  }

  .pane {
    height: 100%;
    overflow: hidden;
    display: none;
    flex-direction: column;
  }

  .pane:not(.hidden) {
    display: flex;
    flex-direction: column;
    overflow: auto;
  }

  .editor-pane {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .editor-pane textarea {
    flex: 1;
    width: 100%;
    padding: 16px;
    border: none;
    outline: none;
    resize: none;
    font-size: 15px;
    line-height: 1.7;
    background: transparent;
    box-sizing: border-box;
    min-height: 0;
  }

  .editor-toolbar {
    flex-shrink: 0;
    padding: 4px;
  }

  .action-row {
    flex-shrink: 0;
    padding: 6px 12px;
    gap: 8px;
  }

  /* スマホでのみ表示 */
  .editor-tabs {
    display: flex;
    gap: 0;
    border-bottom: 1px solid #e2e8f0;
    background: #fff;
  }

  .tab-btn {
    flex: 1;
    padding: 12px 16px;
    background: #f5f5f5;
    border: none;
    border-bottom: 3px solid transparent;
    cursor: pointer;
    font-weight: bold;
    color: #64748b;
    transition: all 0.2s;
  }

  .tab-btn.active {
    background: white;
    border-bottom-color: #14b8a6;
    color: #14b8a6;
  }

  /* フォーム部分を縦並びに */
  .form-card {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
    padding: 16px;
    border-radius: 0;
    border-bottom: 2px solid #f1f5f9;
    flex-shrink: 0;
  }

  .form-row {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: none;
    width: 100%;
  }

  .title-row,
  .date-row,
  .tag-row {
    flex: none;
    width: 100%;
  }

  label {
    white-space: nowrap;
    flex-shrink: 0;
    /* label の幅を固定 */
    width: auto;
    min-width: 60px;
  }

  .form-row input {
    flex: 1;
    /* input が余り領域を埋める */
    width: auto;
  }

  /* タグ部分の横並び調整 */
  .tag-input-wrapper {
    flex: 1;
    display: flex;
    align-items: flex-start;
    gap: 8px;
    flex-direction: column;
  }

  .tag-display {
    flex: 1;
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 8px 10px;
    min-height: auto;
    background: #fff;
    align-items: center;
    box-sizing: border-box;
  }

  .tag-chip {
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 10px;
    font-weight: bold;
  }

  .tag-placeholder {
    color: #94a3b8;
    font-size: 12px;
  }

  .tag-select-container {
    position: relative;
    width: 100%;
    box-sizing: border-box;
  }

  /* エディタ部分 */
  .editor-area {
    flex: 1;
    display: block;
    overflow: hidden;
    min-height: 0;
  }

  .pane {
    height: 100%;
    overflow: hidden;
    display: none;
    flex-direction: column;
  }

  .pane:not(.hidden) {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .editor-pane {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #fafafa;
  }

  .preview-pane {
    width: 100%;
  }

  .tag-panel {
    position: absolute;
    /* ボタン高さ（36px） + gap（8px）分 */
    top: 100%;
    right: 0;
    width: 100%;
    background: white;
    z-index: 9999;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 12px;
    max-height: 50vh;
    overflow-y: auto;
  }

  .tag-panel-header {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    margin-bottom: 8px;
  }

  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    justify-content: flex-start;
  }

  .filter-tag {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 16px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1.5px solid;
  }

  .filter-tag:hover {
    opacity: 0.8;
  }

  .tag-select-btn {
    width: 100%;
    border: 1.5px solid #14b8a6;
    background: transparent;
    color: #14b8a6;
    padding: 10px 12px;
    border-radius: 8px;
    font-weight: bold;
    font-size: 14px;
    cursor: pointer;
    white-space: nowrap;
    box-sizing: border-box;
  }

  .clear-btn {
    font-size: 11px;
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 4px 8px;
  }

  .clear-btn:hover {
    color: #0f172a;
  }

  .editor-header {
    padding: 8px 16px;
    gap: 8px;
  }

  .editor-title h3 {
    margin: 0;
    font-size: 14px;
  }

  .sync-badge {
    font-size: 8px;
    padding: 1px 4px;
  }

  .help-btn {
    padding: 6px 10px;
    font-size: 11px;
  }

  .editor-tabs {
    display: flex;
    gap: 0;
    border-bottom: 1px solid #e2e8f0;
    background: #fff;
  }

  .tab-btn {
    flex: 1;
    padding: 10px 12px;
    background: #f5f5f5;
    border: none;
    border-bottom: 3px solid transparent;
    cursor: pointer;
    font-weight: bold;
    font-size: 13px;
    color: #64748b;
    transition: all 0.2s;
  }

  .tab-btn.active {
    background: white;
    border-bottom-color: #14b8a6;
    color: #14b8a6;
  }

  .editor-area {
    flex: 1;
    display: block;
    overflow: hidden;
    min-height: 0;
  }

  .pane {
    height: 100%;
    overflow: hidden;
    display: none;
    flex-direction: column;
  }

  .pane:not(.hidden) {
    display: flex;
  }

  .editor-pane,
  .preview-pane {
    width: 100%;
  }

  .editor-toolbar {
    padding: 4px;
    gap: 1px;
  }

  .toolbar-btn {
    width: 24px;
    height: 24px;
    font-size: 9px;
  }

  .code-language-select {
    padding: 3px 5px;
    font-size: 10px;
  }

  .toolbar-divider {
    height: 16px;
    margin: 0 1px;
  }

  .action-row {
    padding: 6px 12px;
    gap: 8px;
  }

  .back-link {
    font-size: 11px;
  }

  .submit-btn {
    padding: 6px 16px;
    font-size: 13px;
  }

}

/* タブレット用 */
@media (max-width: 1024px) and (min-width: 769px) {
  .form-card {
    flex-wrap: wrap;
  }

  .title-row {
    flex: 1 1 100%;
  }

  .date-row,
  .tag-row {
    flex: 1 1 1;
  }
}
</style>