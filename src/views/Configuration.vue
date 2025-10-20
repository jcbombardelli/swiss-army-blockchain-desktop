<template>
  <div class="settings-view">
    <div class="settings-container">
      <div class="header">
        <button @click="goBack" class="back-btn">← Voltar</button>
        <h2>Configurações</h2>
      </div>

      <!-- Aviso do Tauri -->
      <TauriWarning />

      <!-- Conexão da Wallet -->
      <div class="settings-section">
        <h3>Hardware Wallet</h3>
        <WalletConnector />
      </div>

      <!-- Configurações de Rede -->
      <div class="settings-section">
        <h3>Configurações de Rede</h3>
        <div class="setting-item">
          <label for="network-select">Rede Ativa:</label>
          <select
            id="network-select"
            v-model="selectedNetworkId"
            @change="handleNetworkChange"
            class="network-select"
          >
            <option
              v-for="network in availableNetworks"
              :key="network.chainId"
              :value="network.chainId"
            >
              {{ network.name }} ({{ network.symbol }})
            </option>
          </select>
        </div>

        <div class="network-info">
          <div class="info-item">
            <div class="info-label">RPC URL:</div>
            <span class="info-value">{{ settingsStore.selectedNetwork.rpcUrl }}</span>
          </div>
          <div class="info-item">
            <div class="info-label">Chain ID:</div>
            <span class="info-value">{{ settingsStore.selectedNetwork.chainId }}</span>
          </div>
          <div v-if="settingsStore.selectedNetwork.blockExplorer" class="info-item">
            <div class="info-label">Block Explorer:</div>
            <a
              :href="settingsStore.selectedNetwork.blockExplorer"
              target="_blank"
              class="explorer-link"
            >
              {{ settingsStore.selectedNetwork.blockExplorer }}
            </a>
          </div>
        </div>
      </div>

      <!-- Configurações da Wallet -->
      <div class="settings-section">
        <h3>Configurações da Wallet</h3>
        <div class="setting-item">
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="settingsStore.autoConnect"
              @change="handleAutoConnectChange"
            />
            <span class="checkmark"></span>
            Conectar automaticamente ao iniciar
          </label>
        </div>
      </div>

      <!-- Configurações da Interface -->
      <div class="settings-section">
        <h3>Interface</h3>
        <div class="setting-item">
          <label for="theme-select">Tema:</label>
          <select
            id="theme-select"
            v-model="settingsStore.theme"
            @change="handleThemeChange"
            class="theme-select"
          >
            <option value="light">Claro</option>
            <option value="dark">Escuro</option>
            <option value="auto">Automático</option>
          </select>
        </div>

        <div class="setting-item">
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="settingsStore.notifications"
              @change="handleNotificationsChange"
            />
            <span class="checkmark"></span>
            Mostrar notificações
          </label>
        </div>
      </div>

      <!-- Adicionar Rede Customizada -->
      <div class="settings-section">
        <h3>Rede Customizada</h3>
        <form @submit.prevent="addCustomNetwork" class="custom-network-form">
          <div class="form-row">
            <div class="form-group">
              <label for="custom-name">Nome:</label>
              <input
                id="custom-name"
                v-model="customNetwork.name"
                type="text"
                placeholder="Ex: Local Network"
                required
              />
            </div>
            <div class="form-group">
              <label for="custom-symbol">Símbolo:</label>
              <input
                id="custom-symbol"
                v-model="customNetwork.symbol"
                type="text"
                placeholder="Ex: ETH"
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="custom-rpc">RPC URL:</label>
              <input
                id="custom-rpc"
                v-model="customNetwork.rpcUrl"
                type="url"
                placeholder="https://..."
                required
              />
            </div>
            <div class="form-group">
              <label for="custom-chain">Chain ID:</label>
              <input
                id="custom-chain"
                v-model="customNetwork.chainId"
                type="number"
                placeholder="1337"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="custom-explorer">Block Explorer:</label>
            <input
              id="custom-explorer"
              v-model="customNetwork.blockExplorer"
              type="url"
              placeholder="https://... (opcional)"
            />
          </div>

          <button type="submit" class="add-network-btn">
            Adicionar Rede
          </button>
        </form>
      </div>

      <!-- Botões de Ação -->
      <div class="settings-actions">
        <button @click="resetSettings" class="reset-btn">
          Restaurar Padrões
        </button>
        <button @click="saveAllSettings" class="save-btn">
          Salvar Configurações
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { settingsStore, availableNetworks, updateNetwork, addCustomNetwork as addNetwork, saveSettings, loadSettings, applyTheme } from '../stores/settings';
import type { NetworkConfig } from '../stores/settings';
import WalletConnector from '../components/WalletConnector.vue';
import TauriWarning from '../components/TauriWarning.vue';

const router = useRouter();

const selectedNetworkId = ref(settingsStore.selectedNetwork.chainId);

const customNetwork = ref<NetworkConfig>({
  name: '',
  rpcUrl: '',
  chainId: 0,
  symbol: '',
  blockExplorer: ''
});

const goBack = () => {
  router.push('/');
};

const handleNetworkChange = () => {
  const network = availableNetworks.value.find(n => n.chainId === selectedNetworkId.value);
  if (network) {
    updateNetwork(network);
  }
};

const handleAutoConnectChange = () => {
  saveSettings();
};

const handleThemeChange = () => {
  // Aplicar tema imediatamente
  applyTheme(settingsStore.theme);
  saveSettings();
};

const handleNotificationsChange = () => {
  saveSettings();
};

const addCustomNetwork = () => {
  if (customNetwork.value.name && customNetwork.value.rpcUrl && customNetwork.value.chainId) {
    // Verificar se a rede já existe
    const exists = availableNetworks.value.some(n => n.chainId === customNetwork.value.chainId);
    if (exists) {
      alert('Uma rede com este Chain ID já existe');
      return;
    }

    addNetwork({ ...customNetwork.value });

    // Limpar formulário
    customNetwork.value = {
      name: '',
      rpcUrl: '',
      chainId: 0,
      symbol: '',
      blockExplorer: ''
    };

    alert('Rede adicionada com sucesso!');
  }
};

const resetSettings = async () => {
  if (confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
    // Resetar para configurações padrão
    settingsStore.selectedNetwork = availableNetworks.value[1]; // Sepolia
    settingsStore.autoConnect = false;
    settingsStore.theme = 'auto';
    settingsStore.notifications = true;
    selectedNetworkId.value = settingsStore.selectedNetwork.chainId;

    // Aplicar tema resetado
    applyTheme(settingsStore.theme);

    await saveSettings();
    alert('Configurações restauradas!');
  }
};

const saveAllSettings = async () => {
  try {
    await saveSettings();
    alert('Configurações salvas com sucesso!');
  } catch (error) {
    alert('Erro ao salvar configurações');
    console.error('Erro:', error);
  }
};

// Carregar configurações ao montar
loadSettings();
</script>

<style scoped>
.settings-view {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 2rem;
}

.settings-container {
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.back-btn {
  background: white;
  border: 1px solid #ddd;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background: #f5f5f5;
}

.header h2 {
  color: #333;
  margin: 0;
}

.settings-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.settings-section h3 {
  color: #333;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-item label {
  font-weight: 600;
  min-width: 120px;
  color: #333;
}

.network-select, .theme-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-width: 200px;
}

.checkbox-label {
  display: flex !important;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  min-width: auto !important;
}

.checkbox-label input[type="checkbox"] {
  margin: 0;
}

.checkmark {
  font-weight: normal;
}

.network-info {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .info-label {
  font-weight: 600;
  color: #666;
  min-width: auto;
}

.info-value {
  font-family: monospace;
  background: white;
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
  font-size: 0.9rem;
}

.explorer-link {
  color: #2196F3;
  text-decoration: none;
  font-size: 0.9rem;
}

.explorer-link:hover {
  text-decoration: underline;
}

.custom-network-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.form-group label {
  font-weight: 600;
  color: #333;
  min-width: auto;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #2196F3;
}

.add-network-btn {
  background: #2196F3;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  align-self: flex-start;
  transition: background-color 0.2s;
}

.add-network-btn:hover {
  background: #0b7dda;
}

.settings-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.reset-btn, .save-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.reset-btn {
  background: #f44336;
  color: white;
}

.reset-btn:hover {
  background: #da190b;
}

.save-btn {
  background: #4CAF50;
  color: white;
}

.save-btn:hover {
  background: #45a049;
}
</style>
