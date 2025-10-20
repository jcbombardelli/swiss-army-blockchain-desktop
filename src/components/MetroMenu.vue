<template>
  <div class="metro-container">
    <h1 class="app-title">ERC-20 Contract Manager</h1>
    <div class="metro-grid">
            <div
        class="metro-tile primary"
        @click="navigateToPublish"
      >
        <div class="tile-icon">📄</div>
        <div class="tile-title">Publicar Contrato</div>
        <div class="tile-subtitle">Criar e publicar contratos ERC-20</div>
      </div>

      <div
        class="metro-tile accent"
        @click="navigateToSignMessage"
      >
        <div class="tile-icon">✍️</div>
        <div class="tile-title">Assinar Mensagem</div>
        <div class="tile-subtitle">Criar assinatura digital de mensagens</div>
      </div>

      <div
        class="metro-tile secondary"
        @click="navigateToSettings"
      >
        <div class="tile-icon">⚙️</div>
        <div class="tile-title">Configurações</div>
        <div class="tile-subtitle">Configurar wallets e redes</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const navigateToPublish = () => {
  router.push('/publish');
};

const navigateToSignMessage = () => {
  router.push('/sign-message');
};

const navigateToSettings = () => {
  router.push('/settings');
};
</script>

<style scoped>
.metro-container {
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.app-title {
  color: white;
  font-size: 2.5rem;
  font-weight: 300;
  margin-bottom: 3rem;
  text-align: center;
}

.metro-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.metro-tile {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.metro-tile:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.2);
}

.metro-tile.primary {
  border-left: 4px solid #4CAF50;
}

.metro-tile.accent {
  border-left: 4px solid #FF9800;
}

.metro-tile.secondary {
  border-left: 4px solid #2196F3;
}

.tile-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.tile-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.tile-subtitle {
  color: #666;
  font-size: 0.9rem;
}
</style>
