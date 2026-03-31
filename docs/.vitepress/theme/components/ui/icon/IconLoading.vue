<template>
  <un-i-ph-circle-dashed-duotone
    class="icon-loading"
  />
</template>

<style scoped>
.icon-loading {
  animation: icon-spin 2s linear infinite;
}

@keyframes icon-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
