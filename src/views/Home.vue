<template>
  <div class="home-view">
    <TauriWarning />
    <MetroMenu />
  </div>
</template>

<script setup lang="ts">
import MetroMenu from '../components/MetroMenu.vue';
import TauriWarning from '../components/TauriWarning.vue';
</script>

<style scoped>
.home-view {
  min-height: 100vh;
}
</style>
