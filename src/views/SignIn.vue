<script setup lang="ts">
import CommonLayout from '@/views/layouts/CommonLayout.vue'
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { signin } from '@/api/auth'
import { refreshToken } from '@/api/auth'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')
const authStore = useAuthStore()

// 画面表示時の処理
onMounted(async () => {
  //スクロール禁止
  document.body.style.overflow = 'hidden'

  // すでにaccessTokenあるなら即リダイレクト
  if (authStore.accessToken) {
    router.push('/dashboard')
    return
  }

  try {
    const newAccessToken = await refreshToken()
    authStore.setToken(newAccessToken)
    router.push('/dashboard')
  } catch (e) {
    // refresh失敗 → 何もしない（サインイン画面表示）
    console.log('Token refresh failed:', e)
  }
})

//スクロール禁止解除
onUnmounted(() => {
  document.body.style.overflow = ''
})

//ログインボタン
const submit = async () => {
  errorMessage.value = ''
  loading.value = true

  try {
    const newAccessToken = await signin(email.value, password.value)
    authStore.setToken(newAccessToken.data.jwt)

    // 成功したらダッシュボード画面へ
    router.push('/dashboard')
  } catch (error: any) {
    console.error(error)

    errorMessage.value =
      error.response?.data?.message || 'サインインに失敗しました'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <CommonLayout>
    <div class="auth-container">
      <div class="card">
        <h2>Sign In</h2>

        <input v-model="email" type="email" placeholder="Email" />
        <input v-model="password" type="password" placeholder="Password" />

        <button @click="submit" :disabled="loading">
          {{ loading ? 'サインイン中...' : 'サインイン' }}
        </button>
        <p v-if="errorMessage" class="error">
          {{ errorMessage }}
        </p>

      </div>
      <p class="signup-text">
        初めてご利用の方は
        <router-link to="/signup">アカウントを作成</router-link>
      </p>
    </div>
  </CommonLayout>
</template>
<style scoped>
:deep(.right) {
  display: flex;
  justify-content: center;
  align-items: center !important;
}

.auth-container {
  width: min(90%, 420px);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.signup-text {
  margin-top: 16px;
  font-size: 14px;
  text-align: center;
}

.signup-text a {
  color: #14b8a6;
  font-weight: 600;
  text-decoration: none;
}

.signup-text a:hover {
  text-decoration: underline;
}

.card {
  width: min(90%, 420px);
  background: white;
  padding: 30px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.card h2 {
  text-align: center;
  color: #0f766e;
}

input {
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  outline: none;
  transition: 0.2s;
}

input:focus {
  border-color: #14b8a6;
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.2);
}

button {
  padding: 12px;
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

.error {
  color: #dc2626;
  font-size: 14px;
  text-align: center;
}
</style>
