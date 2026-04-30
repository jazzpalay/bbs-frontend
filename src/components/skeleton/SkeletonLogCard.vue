<template>
  <div class="card">
    <div class="left">
      <div class="skeleton title"></div>

      <div class="tags">
        <div class="skeleton tag"></div>
        <div class="skeleton tag short"></div>
      </div>
    </div>

    <div class="right">
      <div class="skeleton date"></div>

      <div class="icons">
        <div class="skeleton icon"></div>
        <div class="skeleton icon"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  border-radius: 12px;
  background: #f5f5f5;
}

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

.title {
  width: 120px;
  height: 16px;
  margin-bottom: 12px;
}

.tags {
  display: flex;
  gap: 8px;
}

.tag {
  width: 60px;
  height: 24px;
  border-radius: 999px;
}

.tag.short {
  width: 40px;
}

.right {
  text-align: right;
}

.date {
  width: 80px;
  height: 12px;
  margin-bottom: 12px;
}

.icons {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.date-range {
  display: flex;
  gap: 8px;
}

@media (max-width: 768px) {
  .filter-container {
    flex-direction: column;
  }

  .date-range {
    flex-direction: column;
  }
}
</style>