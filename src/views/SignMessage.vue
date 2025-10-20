<template>
  <div class="sign-message-view">
    <MessageSigner />
  </div>
</template>

<script setup lang="ts">
import MessageSigner from '../components/MessageSigner.vue';
</script>

<style scoped>
.sign-message-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

@media (max-width: 768px) {
  .sign-message-view {
    padding: 0.5rem;
  }
}
</style>
