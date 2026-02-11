<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')
const password = ref('')
</script>

<template>
  <h1>Sign Up</h1>
  <input v-model="email" placeholder="email" />
  <input v-model="password" type="password" placeholder="password" />
  <button>Sign Up</button>
</template>
