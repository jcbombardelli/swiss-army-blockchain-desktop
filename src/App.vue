<template>
  <div id="app">
    <RouterView />
    <ServiceNotification />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { loadSettings } from './stores/settings';
import { detectServiceType } from './stores/wallet';
import ServiceNotification from './components/ServiceNotification.vue';

// Carregar configurações e detectar serviços ao iniciar a aplicação
onMounted(async () => {
  await loadSettings();
  detectServiceType();
});
</script>

<style>
/* Importar estilos globais */
@import './assets/styles/main.css';
@import './assets/styles/metro.css';

#app {
  min-height: 100vh;
}
</style>
