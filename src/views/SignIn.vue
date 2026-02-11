<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')
const password = ref('')

const submit = () => {
  console.log(email.value, password.value)
}
</script>

<template>
  <h1>Sign In</h1>
  <input v-model="email" placeholder="email" />
  <input v-model="password" type="password" placeholder="password" />
  <button @click="submit">Sign In</button>
</template>
