<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store'
import { storeToRefs } from 'pinia'
import { signout } from '@/api/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
// リアクティブに状態を監視するために storeToRefs を使用
const { isAuthenticated } = storeToRefs(authStore)
const router = useRouter()
const handleSignOut = async () => {
  authStore.logout()
  await signout()
  router.push('/signin') // サインインページへリダイレクト
  return
};
console.log("アクセストークン:" + authStore.accessToken)
console.log(authStore.isAuthenticated)
</script>

<template>
  <div class="wrapper">
    <div class="left">
      <div class="brand">
        <h1>Work Log</h1>
        <p>作業ログアプリ</p>
      </div>
    </div>
    
    <div class="right">
      <slot></slot>
    </div>

      <button 
        v-if="isAuthenticated" 
        class="signout-btn pc-only" 
        @click="handleSignOut"
      >
        サインアウト
      </button>
  </div>
</template>

<style scoped>
/* --- 既存のスタイル --- */
.wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative; /* ボタンの基点にする */
}

.left {
  background: linear-gradient(135deg, #0f766e, #14b8a6);
  color: white;
  padding: 40px;
  text-align: center;
}

.right {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f1f5f9;
  padding: 20px;
}

/* --- サインアウトボタンの基本設定 (スマホ版) --- */
.signout-btn {
  position: absolute;
  top: 15px;      /* 右上配置 */
  right: 35px;
  padding: 6px 12px;
  font-size: 0.8rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid white;
  border-radius: 4px;
  cursor: pointer;
  z-index: 10;
}

.signout-btn:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: translateY(-3px);
}

/* --- PC版の設定 --- */
@media (min-width: 768px) {
  .wrapper {
    display: block;
  }

  .left {
    position: fixed;
    top: 0;
    left: 0;
    width: 150px; 
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 150px;
  }

  .right {
    margin-left: 200px;
    width: calc(100% - 200px);
    min-height: 100vh;
    align-items: flex-start;
  }

  /* PCでは左カラムの下側に固定 */
  .signout-btn {
    position: fixed;
    top: auto;      /* スマホの設定をリセット */
    bottom: 50px;   /* 下から40px */
    left: 115px;    /* left要素の幅に合わせて調整（中央付近） */
    transform: translateX(-50%);
    width: 120px;
    background: transparent;
  }

  .signout-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(-50%) translateY(-3px);
  }
}
</style>