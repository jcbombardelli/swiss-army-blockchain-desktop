<template>
  <div class="message-signer">
    <div class="header">
      <button @click="goBack" class="back-btn">← Voltar</button>
      <h2>Criar Assinatura de Mensagem</h2>
    </div>

    <!-- Wallet Connector -->
    <WalletConnector />

    <!-- Formulário de Assinatura -->
    <div class="sign-form-container">
      <form @submit.prevent="handleSignMessage" class="sign-form">
        <div class="form-group">
          <label for="messageText">Mensagem para assinar:</label>
          <textarea
            id="messageText"
            v-model="messageData.text"
            rows="6"
            required
            placeholder="Digite a mensagem que deseja assinar..."
            :disabled="isSigningMessage"
          ></textarea>
          <small class="form-help">A mensagem será assinada usando sua hardware wallet</small>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="messageData.useEIP191"
              :disabled="isSigningMessage"
            />
            <span class="checkmark"></span>
            Usar padrão EIP-191 (Ethereum Signed Message)
          </label>
          <small class="form-help">Recomendado para compatibilidade com aplicações Ethereum</small>
        </div>

        <div class="form-actions">
          <button
            type="button"
            @click="clearForm"
            class="clear-btn"
            :disabled="isSigningMessage"
          >
            Limpar
          </button>

          <button
            type="submit"
            :disabled="!canSignMessage"
            class="sign-btn"
          >
            <span v-if="isSigningMessage" class="loading-spinner"></span>
            {{ isSigningMessage ? 'Assinando...' : 'Assinar Mensagem' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Resultado da Assinatura -->
    <div v-if="signatureResult" class="signature-result">
      <div class="result-header">
        <h3>Assinatura Criada</h3>
        <span class="result-badge" :class="signatureStatusClass">
          {{ signatureResult.success ? 'Sucesso' : 'Erro' }}
        </span>
      </div>

      <div v-if="signatureResult.success" class="signature-info">
        <div class="info-section">
          <h4>Mensagem Original:</h4>
          <div class="message-display">{{ signatureResult.originalMessage }}</div>
        </div>

        <div class="info-section">
          <h4>Hash da Mensagem:</h4>
          <div class="hash-display">
            <span class="hash-text">{{ signatureResult.messageHash }}</span>
            <button @click="copyHash" class="copy-btn" title="Copiar hash">📋</button>
          </div>
        </div>

        <div class="info-section">
          <h4>Assinatura:</h4>
          <div class="signature-display">
            <span class="signature-text">{{ signatureResult.signature }}</span>
            <button @click="copySignature" class="copy-btn" title="Copiar assinatura">📋</button>
          </div>
        </div>

        <div class="info-section">
          <h4>Endereço do Signatário:</h4>
          <div class="address-display">
            <span class="address-text">{{ signatureResult.signerAddress }}</span>
            <button @click="copyAddress" class="copy-btn" title="Copiar endereço">📋</button>
          </div>
        </div>

        <div class="verification-section">
          <h4>Verificação:</h4>
          <div class="verification-info">
            <span class="verification-status" :class="{ 'verified': signatureResult.verified }">
              {{ signatureResult.verified ? '✅ Assinatura verificada' : '❌ Erro na verificação' }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="signatureResult.error" class="signature-error">
        <span class="error-icon">❌</span>
        <span class="error-text">{{ signatureResult.error }}</span>
      </div>
    </div>

    <!-- Histórico de Assinaturas -->
    <div v-if="signatureHistory.length > 0" class="signature-history">
      <h3>Histórico de Assinaturas</h3>
      <div class="history-list">
        <div
          v-for="(item, index) in signatureHistory"
          :key="index"
          class="history-item"
          @click="loadHistoryItem(item)"
        >
          <div class="history-info">
            <div class="history-message">{{ truncateText(item.originalMessage, 50) }}</div>
            <div class="history-date">{{ formatDate(item.timestamp) }}</div>
          </div>
          <div class="history-actions">
            <button @click.stop="copyHistorySignature(item)" class="copy-btn-small">📋</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { walletStore } from '../stores/wallet';
import { signMessage } from '../stores/messageSigning';
import WalletConnector from '../components/WalletConnector.vue';

const router = useRouter();

interface MessageData {
  text: string;
  useEIP191: boolean;
}

interface SignatureResult {
  success: boolean;
  originalMessage: string;
  messageHash: string;
  signature: string;
  signerAddress: string;
  verified: boolean;
  timestamp: number;
  error?: string;
}

const messageData = ref<MessageData>({
  text: '',
  useEIP191: true
});

const isSigningMessage = ref(false);
const signatureResult = ref<SignatureResult | null>(null);
const signatureHistory = ref<SignatureResult[]>([]);

const canSignMessage = computed(() =>
  walletStore.status === 'connected' &&
  messageData.value.text.trim() !== '' &&
  !isSigningMessage.value
);

const signatureStatusClass = computed(() => ({
  'status-success': signatureResult.value?.success,
  'status-error': signatureResult.value && !signatureResult.value.success
}));

const goBack = () => {
  router.push('/');
};

const clearForm = () => {
  messageData.value.text = '';
  messageData.value.useEIP191 = true;
  signatureResult.value = null;
};

const handleSignMessage = async () => {
  if (!canSignMessage.value) return;

  isSigningMessage.value = true;

  try {
    const result = await signMessage(
      messageData.value.text,
      messageData.value.useEIP191
    );

    signatureResult.value = {
      success: true,
      originalMessage: messageData.value.text,
      messageHash: result.messageHash,
      signature: result.signature,
      signerAddress: result.signerAddress,
      verified: result.verified,
      timestamp: Date.now()
    };

    // Adicionar ao histórico
    signatureHistory.value.unshift(signatureResult.value);

    // Manter apenas os últimos 10 itens
    if (signatureHistory.value.length > 10) {
      signatureHistory.value = signatureHistory.value.slice(0, 10);
    }

  } catch (error) {
    signatureResult.value = {
      success: false,
      originalMessage: messageData.value.text,
      messageHash: '',
      signature: '',
      signerAddress: '',
      verified: false,
      timestamp: Date.now(),
      error: error as string
    };
  } finally {
    isSigningMessage.value = false;
  }
};

const copyHash = async () => {
  if (signatureResult.value?.messageHash) {
    try {
      await navigator.clipboard.writeText(signatureResult.value.messageHash);
      // Adicionar feedback visual
    } catch (error) {
      console.error('Erro ao copiar hash:', error);
    }
  }
};

const copySignature = async () => {
  if (signatureResult.value?.signature) {
    try {
      await navigator.clipboard.writeText(signatureResult.value.signature);
      // Adicionar feedback visual
    } catch (error) {
      console.error('Erro ao copiar assinatura:', error);
    }
  }
};

const copyAddress = async () => {
  if (signatureResult.value?.signerAddress) {
    try {
      await navigator.clipboard.writeText(signatureResult.value.signerAddress);
      // Adicionar feedback visual
    } catch (error) {
      console.error('Erro ao copiar endereço:', error);
    }
  }
};

const copyHistorySignature = async (item: SignatureResult) => {
  try {
    await navigator.clipboard.writeText(item.signature);
    // Adicionar feedback visual
  } catch (error) {
    console.error('Erro ao copiar assinatura do histórico:', error);
  }
};

const loadHistoryItem = (item: SignatureResult) => {
  signatureResult.value = item;
  messageData.value.text = item.originalMessage;
};

const truncateText = (text: string, maxLength: number): string => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('pt-BR');
};
</script>

<style scoped>
.message-signer {
  max-width: 900px;
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

.sign-form-container {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.sign-form {
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

.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  transition: border-color 0.2s;
}

.form-group textarea:focus {
  outline: none;
  border-color: #2196F3;
}

.form-group textarea:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.checkbox-label {
  display: flex !important;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: normal !important;
}

.checkbox-label input[type="checkbox"] {
  margin: 0;
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

.clear-btn, .sign-btn {
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

.clear-btn {
  background: #f5f5f5;
  color: #333;
}

.clear-btn:hover {
  background: #e0e0e0;
}

.sign-btn {
  background: #FF9800;
  color: white;
}

.sign-btn:hover:not(:disabled) {
  background: #f57c00;
}

.sign-btn:disabled {
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

.signature-result {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.result-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.result-badge.status-success {
  background: #d4edda;
  color: #155724;
}

.result-badge.status-error {
  background: #f8d7da;
  color: #721c24;
}

.info-section {
  margin-bottom: 1.5rem;
}

.info-section h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 0.9rem;
}

.message-display {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 0.75rem;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 100px;
  overflow-y: auto;
}

.hash-display, .signature-display, .address-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 0.75rem;
}

.hash-text, .signature-text, .address-text {
  font-family: monospace;
  font-size: 0.85rem;
  word-break: break-all;
  flex: 1;
}

.copy-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem;
  border-radius: 3px;
  transition: background-color 0.2s;
}

.copy-btn:hover {
  background: rgba(0,0,0,0.1);
}

.verification-section {
  border-top: 1px solid #e9ecef;
  padding-top: 1rem;
}

.verification-status {
  font-weight: 600;
}

.verification-status.verified {
  color: #28a745;
}

.signature-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #ffebee;
  color: #c62828;
  padding: 0.75rem;
  border-radius: 4px;
  border-left: 4px solid #f44336;
}

.signature-history {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.signature-history h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.history-item:hover {
  background: #f8f9fa;
}

.history-info {
  flex: 1;
}

.history-message {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.history-date {
  font-size: 0.8rem;
  color: #666;
}

.copy-btn-small {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.25rem;
  border-radius: 3px;
  transition: background-color 0.2s;
}

.copy-btn-small:hover {
  background: rgba(0,0,0,0.1);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsividade */
@media (max-width: 768px) {
  .message-signer {
    padding: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .clear-btn, .sign-btn {
    width: 100%;
  }

  .result-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
