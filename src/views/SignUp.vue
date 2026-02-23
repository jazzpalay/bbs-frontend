<script setup lang="ts">
import CommonLayout from '@/views/layouts/CommonLayout.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signup } from '@/api/auth'
import { onMounted, onUnmounted } from 'vue'

const router = useRouter()

const email = ref('')
const userName = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

//スクロール禁止
onMounted(() => {
  document.body.style.overflow = 'hidden'
})
//スクロール禁止解除
onUnmounted(() => {
  document.body.style.overflow = ''
})

const submit = async () => {
  errorMessage.value = ''
  loading.value = true

  try {
    await signup(email.value, userName.value, password.value)

    // 成功したらサインアップ完了画面へ
    router.push('/signup/success')
  } catch (error: any) {
    console.error(error)

    errorMessage.value =
      error.response?.data?.message || 'サインアップに失敗しました'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <CommonLayout>
    <div class="auth-container">
      <div class="card">
        <h2>Sign Up</h2>

        <input v-model="email" type="mailAddress" placeholder="Email" />
        <input v-model="userName" type="userName" placeholder="User Name" />
        <input v-model="password" type="password" placeholder="Password" />

        <button @click="submit" :disabled="loading">
          {{ loading ? '登録中...' : 'サインアップ' }}
        </button>
        <p v-if="errorMessage" class="error">
          {{ errorMessage }}
        </p>
      </div>
      <p class="signin-text">
        アカウントをお持ちの方は
        <router-link to="/signin">サインイン</router-link>
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

.signin-text {
  margin-top: 16px;
  font-size: 14px;
  text-align: center;
}

.signin-text a {
  color: #14b8a6;
  font-weight: 600;
  text-decoration: none;
}

.signin-text a:hover {
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
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
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
  box-shadow: 0 0 0 3px rgba(20,184,166,0.2);
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

