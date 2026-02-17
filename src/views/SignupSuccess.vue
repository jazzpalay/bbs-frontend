<script setup lang="ts">
import CommonLayout from '@/views/layouts/CommonLayout.vue'
</script>

<template>
  <CommonLayout>
    <div class="auth-container">
      <div class="card success">
        <h2>🎉 サインアップ完了</h2>

        <p class="message">
          アカウントの作成が完了しました。<br />
          ログインしてサービスをご利用ください。
        </p>

        <router-link to="/signin" class="login-button">
          ログイン画面へ
        </router-link>
      </div>
    </div>
  </CommonLayout>
</template>

<style scoped>
.auth-container {
  width: min(90%, 420px);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card {
  width: 100%;
  background: white;
  padding: 40px 30px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.success h2 {
  color: #0f766e;
}

.message {
  font-size: 14px;
  line-height: 1.6;
  color: #475569;
}

.login-button {
  display: inline-block;
  padding: 12px;
  border-radius: 12px;
  background: #14b8a6;
  color: white;
  font-weight: bold;
  text-decoration: none;
  transition: 0.2s;
}

.login-button:hover {
  background: #0f766e;
  transform: translateY(-2px);
}
</style>
