<template>
  <div class="tag-card">
    <div class="left">
      <div class="skeleton tag"></div>
    </div>

    <div class="right">
      <div class="skeleton button"></div>
      <div class="skeleton button"></div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.tag-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-radius: 12px;
  background: #f5f5f5;
  margin-bottom: 12px;
}

/* 共通スケルトン */
.skeleton {
  background: #ddd;
  border-radius: 6px;
  position: relative;
  overflow: hidden;
}

.skeleton::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255,255,255,0.5),
    transparent
  );
  animation: shimmer 1.2s infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

/* タグ部分 */
.tag {
  width: 80px;
  height: 28px;
  border-radius: 999px;
}

/* 右ボタン */
.right {
  display: flex;
  gap: 8px;
}

.button {
  width: 60px;
  height: 32px;
  border-radius: 16px;
}
</style>