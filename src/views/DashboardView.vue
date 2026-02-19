<script setup lang="ts">
import CommonLayout from '@/views/layouts/CommonLayout.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()



const keyword = ref('')
const selectedTag = ref('')
const startDate = ref('')
const endDate = ref('')

///////////////// 仮のデータ//////////////
const userName = ref('')
const tags = ref([
  { id: '1', name: 'タグ1' },
  { id: '2', name: 'タグ2' },
  { id: '3', name: 'タグ3' },
])

const goToCreate = () => {
  router.push('/create')
}

const filteredLogs = ref([
  { id: '1', title: 'ログ1', description: '内容1', createdAt: '2024-06-01' },
  { id: '2', title: 'ログ2', description: '内容2', createdAt: '2024-06-02' },
  { id: '3', title: 'ログ3', description: '内容3', createdAt: '2024-06-03' },
])

///////////////////////////



</script>

<template>
  <CommonLayout>
    <div class="dashboard-container">

      <!-- Greeting Card -->
      <div class="card header-card">
        <div class="header-content">
          <div>
            <h3>Hello {{ userName }}</h3>
            <p class="sub">今日の作業を追加</p>
          </div>
          <button @click="goToCreate">
            ＋ ログ追加
          </button>
        </div>
      </div>

      <!-- Search Card -->
      <div class="card search-card">
        <input v-model="keyword" placeholder="タイトル検索" />

        <select v-model="selectedTag">
          <option value="">タグすべて</option>
          <option v-for="tag in tags" :key="tag.id" :value="tag.id">
            {{ tag.name }}
          </option>
        </select>
        <div class="date-field">
          <label>From</label>
          <input type="date" v-model="startDate" />
        </div>
        <div class="date-field">
          <label>To</label>
          <input type="date" v-model="endDate" />
        </div>
      </div>

      <!-- Log List -->
      <div class="log-list">
        <div v-for="log in filteredLogs" :key="log.id" class="card log-card">
          <h3>{{ log.title }}</h3>
          <p>{{ log.description }}</p>
          <span class="log-date">{{ log.createdAt }}</span>
        </div>
      </div>

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
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.header-card {
  padding: 4px 20px;
  position: sticky;
  top: 0;
  z-index: 20;
  background: white;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sub {
  font-size: 14px;
  color: #64748b;
}

.search-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (min-width: 768px) {
  .search-card {
    display: grid;
    grid-template-columns: 3fr 1fr minmax(120px, 1fr) minmax(120px, 1fr);
    gap: 16px;
    align-items: stretch;;
  }
}

input, select {
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  outline: none;
  transition: 0.2s;
}

input:focus, select:focus {
  border-color: #14b8a6;
  box-shadow: 0 0 0 3px rgba(20,184,166,0.2);
}

button {
  padding: 12px 18px;
  border-radius: 12px;
  border: none;
  background: #14b8a6;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
}

button:hover {
  background: #0f766e;
  transform: translateY(-2px);
}

.log-card h3 {
  margin: 0;
  color: #0f766e;
}

.log-date {
  font-size: 12px;
  color: #64748b;
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
  top: -8px;          /* ← 上に出す */
  left: 12px;
  background: white;  /* ← 背景で枠線を隠す */
  padding: 0 4px;
  font-size: 11px;
  color: #94a3b8;
  pointer-events: none;
}




</style>

