<script setup lang="ts">
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
  </div>
</template>

<style scoped>
.wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
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

@media (min-width: 768px) {
  .wrapper {
    flex-direction: row;
  }

  .left {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .right {
    flex: 7;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
