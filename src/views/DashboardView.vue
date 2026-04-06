<script setup lang="ts">
import CommonLayout from '@/views/layouts/CommonLayout.vue'
import { onMounted, ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { getTags, type Tag } from '@/api/tag'
import { getLogList, deleteLog, type LogList } from '@/api/log'
import { getUserProfile } from '@/api/user'

const logCards = ref<HTMLElement[]>([])
const router = useRouter()
const userName = ref('')
const keyword = ref('')
const selectedTags = ref<string[]>([])
const tagWrapper = ref<HTMLElement | null>(null)
const isTagPanelOpen = ref(false)
const startDate = ref('')
const endDate = ref('')
const tags = ref<Tag[]>([])
const logList = ref<LogList>({ userId: '', list: [] })
const deleteTargetId = ref('')
const showDeleteModal = ref(false)
const successMessage = ref('')

let observer: IntersectionObserver

onMounted(async () => {

  try {
    const [tagRes, userRes, logListRes] = await Promise.all([
      getTags(),
      getUserProfile(),
      getLogList()
    ])

    tags.value = tagRes.list
    userName.value = userRes.userName
    logList.value.list = logListRes.list

  } catch (e) {
    console.error('初期データ取得失敗', e)
  }

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          entry.target.classList.add('fade-out')
        } else {
          entry.target.classList.remove('fade-out')
        }
      })
    },
    {
      root: null,
      threshold: 0,
      rootMargin: "-250px 0px 0px 0px"
    }
  )

  observeCards()
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

const observeCards = async () => {
  await nextTick() // DOM更新待ち

  logCards.value.forEach(el => {
    observer.observe(el)
  })
}

const handleClickOutside = (event: MouseEvent) => {
  if (!tagWrapper.value) return

  if (!tagWrapper.value.contains(event.target as Node)) {
    isTagPanelOpen.value = false
  }
}

const goToCreate = () => {
  router.push('/LogCreation')
}

const goToDetail = (logId: string) => {
  router.push({ name: 'LogDetail', params: { logId } })
}

const openDelete = (logId: string) => {
  deleteTargetId.value = logId
  showDeleteModal.value = true
}
const remove = async (logId: string) => {
  if (!deleteTargetId.value) return

  try {
    await deleteLog(logId)
    const response = await getLogList()
    logList.value.list = response.list
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
}

const toggleTagPanel = () => {
  isTagPanelOpen.value = !isTagPanelOpen.value
}

const toggleTag = (tag: string) => {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter(t => t !== tag)
  } else {
    selectedTags.value.push(tag)
  }
}

//指定されたhexをalphaの透明度でrgbaに変換して返す
const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
//タグの色設定
const getTagStyle = (tag: Tag) => {
  const isActive = selectedTags.value.includes(tag.tagName)

  return {
    backgroundColor: isActive
      ? tag.tagColor
      : hexToRgba(tag.tagColor, 0.25), // ← 背景だけ薄く
    color: isActive
      ? '#ffffff'
      : tag.tagColor, // ← 文字はタグ色で濃く
    border: `2px solid ${tag.tagColor}`,
    boxShadow: isActive
      ? `0 6px 14px ${hexToRgba(tag.tagColor, 0.4)}`
      : 'none',
    transform: isActive ? 'scale(1.05)' : 'scale(1)',
  }
}

const getLogTagStyle = (tag: Tag) => {
  return {
    backgroundColor: tag.tagColor,
    color: '#ffffff',
    border: `1px solid ${tag.tagColor}`,
  }
}

const clearTags = () => {
  selectedTags.value = []
}

const goToManage = () => {
  router.push('/TagManagement')
}

const filteredLogs =
  computed(() => {
    return logList.value.list.filter((log) => {
      const matcheKeyword = keyword.value === '' || log.title.includes(keyword.value)
      const matchTag = selectedTags.value.length === 0 || selectedTags.value.every(tag => log.tags.some(t => t.tagName === tag))
      const matchStartDate = startDate.value === '' || log.logDate >= startDate.value
      const matchEndDate = endDate.value === '' || log.logDate <= endDate.value
      return matcheKeyword && matchTag && matchStartDate && matchEndDate
    });
  })

watch(filteredLogs, () => {
  observeCards()
})
</script>

<template>
  <CommonLayout>
    <div class="dashboard-container">

      <!-- Greeting Card -->
      <div class="card header-card">
        <div class="header-content">
          <div>
            <h3 class="greeting">
              <span class="hello-text">Hello</span>
              <span class="user-name">{{ userName }}</span>
            </h3>
            <p class="sub">今日の作業を追加</p>
          </div>
          <div class="header-buttons">
            <button @click="goToManage">
              タグ管理
            </button>
            <button @click="goToCreate">
              ＋ ログ追加
            </button>
          </div>
        </div>
      </div>

      <!-- Search Card -->
      <div class="card search-card" ref="searchCard">
        <input v-model="keyword" placeholder="タイトル検索" />
        <div ref="tagWrapper" class="tag-wrapper">
          <div class="tag-summary" :class="{ active: selectedTags.length > 0 }" @click="toggleTagPanel">
            <span>
              {{ selectedTags.length === 0 ? 'タグ未選択' : 'タグ選択中' }}
            </span>
            ▾
          </div>
          <div v-if="isTagPanelOpen" class="tag-panel">
            <div class="tag-panel-header">
              <button v-if="selectedTags.length > 0" class="clear-btn" @click="clearTags">
                全解除
              </button>
            </div>
            <span v-for="tag in tags" :key="tag.tagId"
              :class="['filter-tag', { active: selectedTags.includes(tag.tagName) }]" :style="getTagStyle(tag)"
              @click.stop="toggleTag(tag.tagName)">
              {{ tag.tagName }}
            </span>
          </div>
        </div>
        <div class="date-field">
          <label>From</label>
          <input type="date" v-model="startDate" />
        </div>
        <div class="date-field">
          <label>To</label>
          <input type="date" v-model="endDate" />
        </div>
      </div>
      <div ref="fadeLine" class="fade-line"></div>
      <!-- Log List -->
      <TransitionGroup name="fade" tag="div" class="log-list">
        <div v-for="log in filteredLogs" :key="log.logId" class="card log-card" ref="logCards"
          @click="goToDetail(log.logId)">
          <div class="log-header">
            <h3>{{ log.title }}</h3>
            <span class="log-date">{{ log.logDate }}</span>
          </div>
          <div class="log-tags">
            <span v-for="tag in log.tags" :key="tag.tagId" class="tag" :style="getLogTagStyle(tag)">{{ tag.tagName
            }}</span>
            <div class="log-actions">
              <button class="action-btn edit" title="編集" @click.stop="handleEdit(log.logId)">
                <span class="material-symbols-outlined">edit</span>
              </button>
              <button class="action-btn delete" title="削除" @click.stop="openDelete(log.logId)">
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </CommonLayout>
  <div v-if="showDeleteModal" class="modal-overlay">
    <div class="modal">
      <p>このログを削除しますか？</p>

      <div class="modal-actions">
        <button class="outline-btn" @click="showDeleteModal = false">
          キャンセル
        </button>
        <button class="primary-btn" @click="remove(deleteTargetId!)">
          削除
        </button>
      </div>
    </div>
  </div>
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
</template>


<style scoped>
.dashboard-container {
  align-self: flex-start;
  width: min(95%, 1000px);
  margin: 10px auto 120px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

:deep(.right) {
  align-items: flex-start !important;
  justify-content: flex-start !important;
  padding-top: 5px;
}

.card {
  background: white;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
}

.header-card {
  padding: 2px 20px;
  position: sticky;
  top: 0;
  z-index: 20;
  background: white;
}

.header-card h3 {
  font-size: clamp(11px, 3.5vw, 15px);
}

.header-card p {
  font-size: clamp(11px, 3.5vw, 15px);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.header-content>div:first-child {
  flex: 1;
  min-width: 0;
}

.sub {
  font-size: 14px;
  color: #64748b;
}

.search-card {
  padding: 10px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: sticky;
  top: 105px;
  /* Headerカードの高さを考慮 */
  z-index: 10;
  /* Headerより下に */
  background: white;
}

.greeting {
  display: flex;
  align-items: center;
  gap: 6px;
}

.log-card {
  cursor: pointer;
  position: relative;
  padding-bottom: 20px
}

.log-actions {
  position: absolute;
  bottom: 12px;
  right: 16px;
  display: flex;
  gap: 8px;
}

/* アイコンボタン共通設定 */
.action-btn {
  width: 30px;
  height: 30px;
  padding: 0;
  border-radius: 50%;
  /* 正円にする */
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  cursor: pointer;
}

/* 更新ボタン（緑系） */
.action-btn.edit {
  color: #14b8a6;
}

.action-btn.edit:hover {
  background: #f0fdfa;
  border-color: #14b8a6;
  color: #0f766e;
}

/* 削除ボタン（赤系） */
.action-btn.delete {
  color: #ef4444;
}

.action-btn.delete:hover {
  background: #fef2f2;
  border-color: #ef4444;
  color: #b91c1c;
}

/* アイコン自体のサイズ調整 */
.material-symbols-outlined {
  font-size: 20px;
}

input,
select {
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  outline: none;
  transition: 0.2s;
}

input:focus,
select:focus {
  border-color: #14b8a6;
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.2);
}

button {
  padding: clamp(6px, 2vw, 12px) clamp(10px, 3vw, 18px);
  border-radius: clamp(10px, 1.5vw, 14px);
  border: none;
  background: #14b8a6;
  color: white;
  font-weight: bold;
  font-size: clamp(11px, 3.5vw, 15px);
  cursor: pointer;
  transition: 0.2s;
}

button:hover {
  background: #0f766e;
  transform: translateY(-2px);
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 16px;

}

.log-card {
  background: #f8fafc;
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: opacity 0.3s ease;
}

.log-header {
  display: flex;
  justify-content: space-between;
  /* タイトルと日付を左右に配置 */
  align-items: center;
}

.log-card h3 {
  margin: 0;
  font-size: 16px;
  color: #0f766e;
}

.tag {
  padding: 4px 10px;
  font-size: 12px;
  color: white;
  border-radius: 999px;
  font-weight: 500;
  white-space: nowrap;
}

.tag-wrapper {
  position: relative;
  display: inline-block;
}

.tag-summary {
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 8px 12px;
  min-height: 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  background: white;
}

.tag-summary.active {
  background: #14b8a6;
  color: white;
  border-color: #14b8a6;
}

/* パネル全体の調整 */
.tag-panel {
  position: absolute;
  z-index: 999;
  top: calc(100% + 6px);

  left: 50%;
  transform: translateX(-50%);

  width: min(95vw, 420px);
  max-height: 260px;
  overflow-y: auto;

  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 16px;

  display: flex;
  flex-wrap: wrap;
  gap: 10px 8px;
}

/* ヘッダー（全解除ボタン）がタグの並びを邪魔しないように調整 */
.tag-panel-header {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  margin-bottom: 4px;
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

.filter-tag {
  display: inline-block;
  /* 幅と高さを認識させる */
  padding: 8px 16px;
  /* 上下を少し厚く、左右もしっかり確保 */
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  font-size: clamp(9px, 3.5vw, 15px);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.filter-tag:hover {
  background: #e2e8f0;
}

.filter-tag.active {
  background: #14b8a6;
  color: white;
  /* 選択中であることを強調する場合 */
  box-shadow: 0 4px 10px rgba(20, 184, 166, 0.2);
}

.log-date {
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
}

.date-field {
  position: relative;
  min-width: 0;
}

.date-field input {
  width: 100%;
  box-sizing: border-box;
}

.date-field label {
  position: absolute;
  top: -8px;
  /* ← 上に出す */
  left: 12px;
  background: white;
  /* ← 背景で枠線を隠す */
  padding: 0 4px;
  font-size: 11px;
  color: #94a3b8;
  pointer-events: none;
}

.fade-out {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.log-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.header-buttons {
  display: flex;
  gap: clamp(8px, 2vw, 16px);
  align-items: center;
}

.header-buttons button:first-child {
  background: white;
  color: #14b8a6;
  border: 2px solid #14b8a6;
  transition: all 0.2s ease;
}

.header-buttons button:first-child:hover {
  background: #F1F5F9;
  border-color: #0f766e;
  color: #0f766e;
  transform: translateY(-2px);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
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

.outline-btn:hover {
  background: #f0fdfa;
}

/* 削除用 */
.outline-btn.danger {
  border-color: #ef4444;
  color: #ef4444;
}

.outline-btn.danger:hover {
  background: #fef2f2;
}

@media (min-width: 768px) {
  .search-card {
    display: grid;
    grid-template-columns: 3fr 1fr 1fr 1fr;
    gap: 16px;
    align-items: stretch;
    top: 95px;
  }

  .tag-summary {
    font-size: clamp(1px, 1.4vw, 15px);
  }

}

@media (max-width: 500px) {
  .greeting {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .header-card {
    padding: 0px 20px;
    position: sticky;
    top: 0;
    z-index: 20;
    background: white;
  }

  .user-name {
    font-size: 13px;
    font-weight: bold;
  }

  .tag-panel {
    position: absolute;
    top: calc(100% + 8px);
    /* 検索カードのすぐ下に配置 */

    width: 90%;
    /* 画面幅の90%くらいにする */

    /* 中身の調整 */
    max-height: 40vh;
    overflow-y: auto;
    padding: 14px;
    /* 気持ち少し広げると「いい感じ」です */
    gap: 8px 6px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    /* 影を少し強めて浮かせる */
    background: white;
    z-index: 9999;

    display: flex;
    flex-wrap: wrap;
  }

  .filter-tag {
    padding: 6px 12px;
    /* タグ自体も少し小さめに */
    font-size: 12px;
    /* 文字サイズを固定して可読性確保 */
  }

  .tag-panel-header {
    margin-bottom: 2px;
    /* ヘッダーの余白を詰める */
  }

  .search-card {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    align-items: stretch;
    top: 110px;
    padding: 12px 14px;
  }

  /* タイトル検索は1行全部使う */
  .search-card input:first-child {
    grid-column: 1 / -1;
  }

  /* タグ選択も1行全部 */
  .tag-wrapper {
    grid-column: 1 / -1;
  }

  /* From To を横並び */
  .date-field {
    width: 100%;
  }

  input:not([type="date"]),
  .tag-summary {
    height: 34px;
    padding: 6px 10px;
    font-size: 13px;
    box-sizing: border-box;
  }

  /* tag-summaryの縦中央 */
  .tag-summary {
    display: flex;
    align-items: center;
  }

  /* ラベル位置微調整 */
  .date-field label {
    font-size: 10px;
    top: -7px;
  }

  input,
  .tag-summary {
    height: 34px;
    padding: 6px 10px;
    font-size: 13px;
    box-sizing: border-box;
  }

  /* tag-summaryの縦中央 */
  .tag-summary {
    display: flex;
    align-items: center;
  }

  .tag {
    padding: 2px 8px;
    font-size: 8px;
    color: white;
    border-radius: 999px;
    font-weight: 500;
    white-space: nowrap;
  }

  .log-card {
    padding: 10px 15px;
  }

  .log-header h3 {
    font-size: 12px;
  }

  .log-actions {
    bottom: 6px;
    right: 10px;
  }
}
</style>
