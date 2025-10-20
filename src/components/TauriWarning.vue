<template>
  <div v-if="!isTauriContext" class="tauri-warning">
    <div class="warning-content">
      <span class="warning-icon">⚠️</span>
      <div class="warning-text">
        <h3>Modo Web Detectado</h3>
        <p>
          Para conectar hardware wallets, você precisa executar a aplicação no contexto Tauri.
        </p>
        <p><strong>Passos necessários:</strong></p>
        <ol>
          <li>Instale o Visual Studio Build Tools (veja TAURI_SETUP.md)</li>
          <li>Execute: <code>pnpm dev-tauri</code></li>
        </ol>
        <p>
          <small>No modo web atual, apenas funcionalidades básicas estão disponíveis.</small>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const isTauriContext = computed(() => {
  return typeof window !== 'undefined' && '__TAURI__' in window;
});
</script>

<style scoped>
.tauri-warning {
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  border: 1px solid #ffc107;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.warning-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.warning-icon {
  font-size: 2rem;
  margin-top: 0.25rem;
}

.warning-text h3 {
  margin: 0 0 0.5rem 0;
  color: #856404;
}

.warning-text p {
  margin: 0.5rem 0;
  color: #856404;
}

.warning-text ol {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
  color: #856404;
}

.warning-text li {
  margin: 0.25rem 0;
}

.warning-text code {
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-family: 'Courier New', monospace;
  color: #495057;
  display: inline-block;
  margin: 0.25rem 0;
}
</style>
