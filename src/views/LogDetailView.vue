<script setup lang="ts">
import CommonLayout from '@/views/layouts/CommonLayout.vue'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { getTags, type Tag } from '@/api/tag'
import { getLogDetail, deleteLog } from '@/api/log'
import { useRouter, useRoute } from 'vue-router'

import MarkdownPreview from "@/components/markdown/MarkdownPreview.vue"

const router = useRouter()
const route = useRoute()
const logId = route.params.logId as string | undefined
const deleteTargetId = ref<string | null>(null)
const showDeleteModal = ref(false)
const isEdit = !!logId
const title = ref('')
const logDate = ref<string>(new Date().toISOString().split('T')[0]!)
const content = ref('')
const tagWrapper = ref<HTMLElement | null>(null)

const successMessage = ref('')
const createError = ref('')


const tags = ref<Tag[]>([])
const selectedTags = ref<Tag[]>([])
const isTagPanelOpen = ref(false)

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
})

const handleClickOutside = (event: MouseEvent) => {
  if (!tagWrapper.value || !tagWrapper.value.contains(event.target as Node)) {
    isTagPanelOpen.value = false
  }
}

const getSelectedTagStyle = (tag: Tag) => {
  const selectedTag = tags.value.find(t => t.tagName === tag.tagName)
  return selectedTag ? { backgroundColor: selectedTag.tagColor, color: '#fff' } : {}
}

const openDelete = (logId: string) => {
  deleteTargetId.value = logId
  showDeleteModal.value = true
}

const remove = async (logId: string) => {
  if (!deleteTargetId.value) return

  try {
    await deleteLog(logId)
    successMessage.value = 'ログを削除しました'
  } catch (e) {
    console.error('ログ削除失敗', e)
  } finally {
    showDeleteModal.value = false
    deleteTargetId.value = ''
  }
}

const handleEdit = (logId: string) => {
  router.push({
    name: 'LogEdit',
    params: { logId: logId }
  })
}
const handleSuccess = () => {
  successMessage.value = ''
  router.push('/dashboard')
}
</script>

<template>
  <CommonLayout>
    <div class="log-create-container">

      <div class="card form-card">
        <div class="form-row title-row">
          <label>タイトル</label>
          <input v-model="title" readonly />
        </div>

        <div class="form-row date-row">
          <label>作業日</label>
          <input type="date" v-model="logDate" readonly />
        </div>

        <div class="form-row tag-row">
          <label>タグ</label>
          <div class="tag-input-wrapper">
            <div class="tag-display">
              <span v-if="selectedTags.length === 0" class="tag-placeholder">未選択</span>
              <span v-for="tag in selectedTags" :key="tag.tagId" class="tag-chip" :style="getSelectedTagStyle(tag)">
                {{ tag.tagName }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- エディタ部分にタブを追加 -->
      <div class="card editor-card">
        <div class="editor-header">
          <div class="editor-title">
            <h3>Log Detail</h3>
          </div>
        </div>

        <!-- エディタとプレビューの表示を条件付けに -->

        <div class="preview-pane">
          <MarkdownPreview :content="content" />
        </div>


        <div class="action-row">
          <div class="top-nav">
            <router-link to="/dashboard" class="back-link">
              <span class="icon">←</span> ダッシュボードに戻る
            </router-link>
          </div>
          <div class="action-buttons">

            <button class="delete-submit-btn" @click="openDelete(logId!)">
              削除
            </button>
            <button class="update-submit-btn" @click="handleEdit(logId!)">
              編集
            </button>
          </div>
        </div>
      </div>
    </div>
  </CommonLayout>
  <div v-if="successMessage" class="modal-overlay">
    <div class="modal">
      <p>{{ successMessage }}</p>
      <div class="modal-actions">
        <button class="outline-btn" @click="handleSuccess">
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
  <div v-if="showDeleteModal" class="modal-overlay">
    <div class="modal">
      <p>このログを削除しますか？</p>

      <div class="modal-actions">
        <button class="outline-btn" @click="showDeleteModal = false">
          キャンセル
        </button>
        <button class="primary-btn" @click="remove(deleteTargetId!)">
          削除する
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

.date-field input {
  width: 100%;
  box-sizing: border-box;

  height: 40px;
  font-size: 16px;

  -webkit-appearance: none;
  appearance: none;

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

/* ===== Editor Area ===== */
.editor-area {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  overflow: visible;
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
  flex: 1;
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

.update-submit-btn {
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

.update-submit-btn:hover {
  background: #F1F5F9;
  transform: translateY(-2px);
}

.update-submit-btn:hover {
  background: #0d9488;
  /* 元の #14b8a6 より少しだけ濃い色 */
  transform: translateY(-2px);
  /* 少し浮く */
}

.update-submit-btn:active {
  transform: translateY(0);
  /* クリックした瞬間に沈む */
}

.delete-submit-btn {
  background: #ef4444;
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

.delete-submit-btn:hover {
  background: #F1F5F9;
  transform: translateY(-2px);
}

.delete-submit-btn:hover {
  background: #b91c1c;
  /* 元の #ef4444 より少しだけ濃い色 */
  transform: translateY(-2px);
  /* 少し浮く */
}

.delete-submit-btn:active {
  transform: translateY(0);
  /* クリックした瞬間に沈む */
}

.action-buttons {
  display: flex;
  gap: 30px;
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

  /* --- レイアウト根幹 --- */
  .log-create-container {
    height: auto;
    overflow: visible;
  }

  .card {
    margin: 0;
    border-radius: 0;
  }

  /* --- フォーム(上部カード) --- */
  .form-card {
    flex-direction: column;
    align-items: stretch;
    padding: 16px;
    border-bottom: 2px solid #f1f5f9;
    flex-shrink: 0;
    gap: 16px;
  }

  .form-row,
  .title-row,
  .date-row,
  .tag-row {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: none;
    width: 100%;
  }

  .form-row input {
    flex: 1;
    width: auto;
  }

  label {
    white-space: nowrap;
    flex-shrink: 0;
    min-width: 60px;
  }

  /* --- エディタ・プレビュー(下部カード) --- */
  .editor-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: visible;
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
    padding: 0 16px;
    height: calc(100vh - 50px);
    /* フォーム部分を差し引く */
    min-height: 600px;
  }

  .editor-header {
    padding: 8px 16px;
    gap: 8px;
    flex-wrap: wrap;
    flex-shrink: 0;
  }

  .editor-title h3 {
    margin: 0;
    font-size: 14px;
  }

  .editor-area {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: visible;
  }

  /* --- タブ切り替え --- */
  .editor-tabs {
    display: flex;
    gap: 0;
    border-bottom: 1px solid #e2e8f0;
    background: #fff;
    flex-shrink: 0;
  }

  /* --- 表示・非表示の制御 --- */
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

  .action-row {
    position: relative;
    padding: 12px;
    gap: 8px;
    flex-shrink: 0;
  }

  .action-buttons {
    gap: 20px;
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

  .tag-row {
    flex: 1 1 1;
  }
}
</style>