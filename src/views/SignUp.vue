<script setup lang="ts">
import CommonLayout from '@/views/layouts/CommonLayout.vue'
import { ref } from 'vue'

const email = ref('')
const password = ref('')

const submit = () => {
  console.log(email.value, password.value)
}
</script>

<template>
  <CommonLayout>
    <div class="auth-container">
      <div class="card">
        <h2>Sign Up</h2>

        <input v-model="email" type="email" placeholder="Email" />
        <input v-model="password" type="password" placeholder="Password" />

        <button @click="submit">Sign Up</button>
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
</style>

