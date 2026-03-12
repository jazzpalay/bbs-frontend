<script setup lang="ts">
import CommonLayout from '@/views/layouts/CommonLayout.vue'
import { onMounted, ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { getTags, type Tag } from '@/api/tag'
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
let observer: IntersectionObserver

onMounted(async () => {

  try {
    const [tagRes, userRes] = await Promise.all([
      getTags(),
      getUserProfile()
    ])

    tags.value = tagRes.list
    userName.value = userRes.userName

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

const clearTags = () => {
  selectedTags.value = []
}

const goToManage = () => {
  router.push('/TagManagement')
}

const logs = ref([
  { id: '1', title: 'ログ1', tags: ['タグ1', 'タグ2'], createdAt: '2024-06-01' },
  { id: '2', title: 'ログ2', tags: ['タグ2'], createdAt: '2024-06-02' },
  { id: '3', title: 'ログ3', tags: ['タグ3'], createdAt: '2024-06-03' },
  { id: '4', title: 'ログ4', tags: ['タグ1'], createdAt: '2024-06-03' },
  { id: '5', title: 'ログ5', tags: ['タグ3'], createdAt: '2024-06-03' },
  { id: '6', title: 'ログ6', tags: ['タグ1', 'タグ3'], createdAt: '2024-06-03' },
  { id: '7', title: 'ログ7', tags: ['タグ2'], createdAt: '2024-06-03' },
  { id: '8', title: 'ログ8', tags: ['タグ1'], createdAt: '2026-06-04' },

])

///////////////////////////

const filteredLogs =
  computed(() => {
    return logs.value.filter((log) => {
      const matcheKeyword = keyword.value === '' || log.title.includes(keyword.value)
      const matchTag = selectedTags.value.length === 0 || selectedTags.value.every(tag => log.tags.includes(tag))
      const matchStartDate = startDate.value === '' || log.createdAt >= startDate.value
      const matchEndDate = endDate.value === '' || log.createdAt <= endDate.value
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
        <div v-for="log in filteredLogs" :key="log.id" class="card log-card" ref="logCards">
          <div class="log-header">
            <h3>{{ log.title }}</h3>
            <span class="log-date">{{ log.createdAt }}</span>
          </div>
          <div class="log-tags">
            <span v-for="tag in log.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </CommonLayout>
</template>


<style scoped>
.dashboard-container {
  align-self: flex-start;
  width: min(95%, 1000px);
  margin: 10px auto 120px;
  display: flex;
  flex-direction: column;
  gap: 24px;
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
  gap: 16px;
}

.header-card {
  padding: 5px 20px;
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
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: sticky;
  top: 102px;
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

@media (min-width: 768px) {
  .search-card {
    display: grid;
    grid-template-columns: 3fr 1fr 1fr 1fr;
    gap: 16px;
    align-items: stretch;
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
  .tag-panel {
    position: fixed;
    top: 160px;
    left: 12px;
    right: 12px;
    width: auto;
  }

  .search-card {
    top: 125px;
  }

  
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
  /* カード間の余白 */
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
  background: #41aea5;
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
</style>
