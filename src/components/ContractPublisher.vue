<template>
  <div class="contract-publisher">
    <div class="header">
      <button @click="goBack" class="back-btn">← Voltar</button>
      <h2>Publicar Contrato ERC-20</h2>
    </div>

    <!-- Wallet Connector -->
    <WalletConnector />

    <!-- Formulário do Contrato -->
    <div class="contract-form-container">
      <form @submit.prevent="handlePublish" class="contract-form">
        <div class="form-group">
          <label for="contractName">Nome do Contrato:</label>
          <input
            id="contractName"
            v-model="contractStore.currentContract.name"
            type="text"
            required
            placeholder="Ex: MyToken"
            :disabled="contractStore.isDeploying"
          />
        </div>

        <div class="form-group">
          <label for="contractSymbol">Símbolo:</label>
          <input
            id="contractSymbol"
            v-model="contractStore.currentContract.symbol"
            type="text"
            required
            placeholder="Ex: MTK"
            maxlength="10"
            :disabled="contractStore.isDeploying"
          />
        </div>

        <div class="form-group">
          <label for="decimals">Casas Decimais:</label>
          <input
            id="decimals"
            v-model="contractStore.currentContract.decimals"
            type="number"
            readonly
            value="18"
          />
          <small class="form-help">Padrão ERC-20: 18 casas decimais</small>
        </div>

        <div class="form-group">
          <label for="totalSupply">Supply Inicial (opcional):</label>
          <input
            id="totalSupply"
            v-model="contractStore.currentContract.totalSupply"
            type="text"
            placeholder="Ex: 1000000"
            :disabled="contractStore.isDeploying"
          />
          <small class="form-help">Deixe vazio para supply de 0</small>
        </div>

        <div class="form-actions">
          <button
            type="button"
            @click="resetForm"
            class="reset-btn"
            :disabled="contractStore.isDeploying"
          >
            Limpar
          </button>

          <button
            type="submit"
            :disabled="!canPublish"
            class="publish-btn"
          >
            <span v-if="contractStore.isDeploying" class="loading-spinner"></span>
            {{ contractStore.isDeploying ? 'Publicando...' : 'Publicar Contrato' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Status do Deploy -->
    <div v-if="contractStore.deployment" class="deployment-status">
      <div class="status-header">
        <h3>Status do Deploy</h3>
        <span class="status-badge" :class="deploymentStatusClass">
          {{ deploymentStatusText }}
        </span>
      </div>

      <div v-if="contractStore.deployment.contractAddress" class="deployment-info">
        <div class="info-item">
          <div class="info-label">Endereço do Contrato:</div>
          <span class="contract-address">{{ contractStore.deployment.contractAddress }}</span>
          <button @click="copyContractAddress" class="copy-btn">📋</button>
        </div>

        <div v-if="contractStore.deployment.transactionHash" class="info-item">
          <div class="info-label">Hash da Transação:</div>
          <span class="tx-hash">{{ formatTxHash(contractStore.deployment.transactionHash) }}</span>
          <button @click="copyTxHash" class="copy-btn">📋</button>
        </div>
      </div>

      <div v-if="contractStore.deployment.error" class="deployment-error">
        <span class="error-icon">❌</span>
        <span class="error-text">{{ contractStore.deployment.error }}</span>
      </div>
    </div>

    <!-- Validação de Erros -->
    <div v-if="validationErrors.length > 0" class="validation-errors">
      <h4>Erros de Validação:</h4>
      <ul>
        <li v-for="error in validationErrors" :key="error" class="error-item">
          {{ error }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { walletStore } from '../stores/wallet';
import { contractStore, publishContract, resetContract, validateContractData } from '../stores/contract';
import WalletConnector from '../components/WalletConnector.vue';

const router = useRouter();
const validationErrors = ref<string[]>([]);

const canPublish = computed(() =>
  walletStore.status === 'connected' &&
  contractStore.currentContract.name.trim() !== '' &&
  contractStore.currentContract.symbol.trim() !== '' &&
  !contractStore.isDeploying
);

const deploymentStatusClass = computed(() => ({
  'status-pending': contractStore.deployment?.status === 'pending',
  'status-confirmed': contractStore.deployment?.status === 'confirmed',
  'status-failed': contractStore.deployment?.status === 'failed'
}));

const deploymentStatusText = computed(() => {
  switch (contractStore.deployment?.status) {
    case 'pending': return 'Pendente';
    case 'confirmed': return 'Confirmado';
    case 'failed': return 'Falhou';
    default: return 'Desconhecido';
  }
});

const goBack = () => {
  router.push('/');
};

const resetForm = () => {
  resetContract();
  validationErrors.value = [];
};

const handlePublish = async () => {
  // Validar dados
  validationErrors.value = validateContractData(contractStore.currentContract);

  if (validationErrors.value.length > 0) {
    return;
  }

  try {
    const result = await publishContract(contractStore.currentContract);

    if (result.success) {
      console.log('Contrato publicado com sucesso!');
      // Adicionar notificação de sucesso
    } else {
      console.error('Erro ao publicar contrato:', result.error);
      // Adicionar notificação de erro
    }
  } catch (error) {
    console.error('Erro inesperado:', error);
  }
};

const copyContractAddress = async () => {
  if (contractStore.deployment?.contractAddress) {
    try {
      await navigator.clipboard.writeText(contractStore.deployment.contractAddress);
      // Adicionar feedback visual
    } catch (error) {
      console.error('Erro ao copiar endereço:', error);
    }
  }
};

const copyTxHash = async () => {
  if (contractStore.deployment?.transactionHash) {
    try {
      await navigator.clipboard.writeText(contractStore.deployment.transactionHash);
      // Adicionar feedback visual
    } catch (error) {
      console.error('Erro ao copiar hash:', error);
    }
  }
};

const formatTxHash = (hash: string) => {
  return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
};
</script>

<style scoped>
.contract-publisher {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.back-btn {
  background: #f5f5f5;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background: #e0e0e0;
}

.header h2 {
  color: #333;
  margin: 0;
}

.contract-form-container {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.contract-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #333;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #2196F3;
}

.form-group input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.form-help {
  color: #666;
  font-size: 0.8rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.reset-btn, .publish-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
}

.reset-btn {
  background: #f5f5f5;
  color: #333;
}

.reset-btn:hover {
  background: #e0e0e0;
}

.publish-btn {
  background: #4CAF50;
  color: white;
}

.publish-btn:hover:not(:disabled) {
  background: #45a049;
}

.publish-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.deployment-status {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.status-confirmed {
  background: #d4edda;
  color: #155724;
}

.status-badge.status-failed {
  background: #f8d7da;
  color: #721c24;
}

.deployment-info .info-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.deployment-info .info-item .info-label {
  font-weight: 600;
  min-width: 150px;
}

.contract-address, .tx-hash {
  font-family: monospace;
  background: #f5f5f5;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.copy-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem;
}

.deployment-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #ffebee;
  color: #c62828;
  padding: 0.75rem;
  border-radius: 4px;
  border-left: 4px solid #f44336;
}

.validation-errors {
  background: #ffebee;
  border: 1px solid #f44336;
  border-radius: 4px;
  padding: 1rem;
}

.validation-errors h4 {
  color: #c62828;
  margin: 0 0 0.5rem 0;
}

.validation-errors ul {
  margin: 0;
  padding-left: 1.5rem;
}

.error-item {
  color: #c62828;
  margin-bottom: 0.25rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
