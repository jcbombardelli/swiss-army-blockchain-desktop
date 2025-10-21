<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { blockchainService, type ERC20Token, type NetworkConfig } from "./services/blockchain";
import { settingsService, type AppSettings } from "./services/settings";

// Estados para controlar as telas
const currentView = ref('main');
const isConnected = ref(false);
const walletAddress = ref('');
const walletBalance = ref('0');
const isLoading = ref(false);
const error = ref('');

// Estados para formulários
const erc20Form = reactive<ERC20Token>({
  name: '',
  symbol: '',
  decimals: 18,
  totalSupply: '1000000'
});

const messageToSign = ref('');
const signedMessage = ref('');
const messageHash = ref('');
const signerAddress = ref('');

// Estados para configurações
const selectedNetwork = ref('polygon');
const rpcEndpoint = ref('');
const gasPrice = ref('20');
const autoConfirm = ref(false);

// Funções de navegação
function showERC20() {
  currentView.value = 'erc20';
}

function showMessageSigning() {
  currentView.value = 'message';
}

function showSettings() {
  currentView.value = 'settings';
}

function goBack() {
  currentView.value = 'main';
}

// Função para conectar com hardwallet
async function connectWallet() {
  try {
    isLoading.value = true;
    error.value = '';
    
    const walletInfo = await blockchainService.connectLedger();
    isConnected.value = walletInfo.isConnected;
    walletAddress.value = walletInfo.address;
    walletBalance.value = walletInfo.balance;
    
    // Salvar configurações quando conectar
    onWalletConnected(walletInfo.address);
    
  } catch (err: any) {
    error.value = err.message || 'Erro ao conectar com a wallet';
    console.error('Erro ao conectar:', err);
  } finally {
    isLoading.value = false;
  }
}

// Função para reconectar wallet
async function reconnectWallet() {
  try {
    isLoading.value = true;
    error.value = '';
    
    const walletInfo = await blockchainService.connectLedger();
    isConnected.value = walletInfo.isConnected;
    walletAddress.value = walletInfo.address;
    walletBalance.value = walletInfo.balance;
    
    // Salvar configurações quando reconectar
    onWalletConnected(walletInfo.address);
    
  } catch (err: any) {
    error.value = err.message || 'Erro ao reconectar com a wallet';
    console.error('Erro ao reconectar:', err);
  } finally {
    isLoading.value = false;
  }
}

// Função para desconectar wallet
async function disconnectWallet() {
  try {
    await blockchainService.disconnect();
    isConnected.value = false;
    walletAddress.value = '';
    walletBalance.value = '0';
    
    // Limpar configurações quando desconectar
    onWalletDisconnected();
  } catch (error) {
    console.error('Erro ao desconectar:', error);
    // Mesmo com erro, limpar o estado local
    isConnected.value = false;
    walletAddress.value = '';
    walletBalance.value = '0';
    onWalletDisconnected();
  }
}

// Função para fazer deploy do token ERC-20
async function deployToken() {
  try {
    isLoading.value = true;
    error.value = '';
    
    const txHash = await blockchainService.deployERC20Token(erc20Form);
    
    alert(`Token deployado com sucesso! Hash da transação: ${txHash}`);
    
    // Limpar formulário
    erc20Form.name = '';
    erc20Form.symbol = '';
    erc20Form.decimals = 18;
    erc20Form.totalSupply = '1000000';
    
    // Voltar para tela principal
    goBack();
    
  } catch (err: any) {
    error.value = err.message || 'Erro ao fazer deploy do token';
    console.error('Erro no deploy:', err);
  } finally {
    isLoading.value = false;
  }
}

// Função para assinar mensagem
async function signMessage() {
  try {
    isLoading.value = true;
    error.value = '';
    
    const result = await blockchainService.signMessage(messageToSign.value);
    signedMessage.value = result.signature;
    messageHash.value = result.messageHash;
    signerAddress.value = result.address;
    
    console.log('Assinatura completa:', result);
    
  } catch (err: any) {
    error.value = err.message || 'Erro ao assinar mensagem';
    console.error('Erro na assinatura:', err);
  } finally {
    isLoading.value = false;
  }
}

// Função para limpar dados de assinatura
function clearSignature() {
  signedMessage.value = '';
  messageHash.value = '';
  signerAddress.value = '';
  messageToSign.value = '';
}

// Função para copiar para área de transferência
async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    // Mostrar feedback visual (opcional)
    console.log('Copiado para área de transferência:', text);
  } catch (err) {
    console.error('Erro ao copiar:', err);
    // Fallback para navegadores mais antigos
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
}

// Função para alterar rede
async function changeNetwork() {
  try {
    await blockchainService.switchNetwork(selectedNetwork.value);
    alert(`Rede alterada para: ${blockchainService.getCurrentNetwork().name}`);
    
    // Salvar configurações quando alterar rede
    saveSettings();
  } catch (err: any) {
    error.value = err.message || 'Erro ao alterar rede';
    console.error('Erro ao alterar rede:', err);
  }
}

// Carregar configurações salvas
function loadSettings() {
  const settings = settingsService.getSettings();
  selectedNetwork.value = settings.network;
  rpcEndpoint.value = settings.rpcEndpoint;
  gasPrice.value = settings.gasPrice;
  autoConfirm.value = settings.autoConfirm;
  
  // Se há um endereço salvo, tentar reconectar
  if (settings.walletAddress && settings.lastConnected > 0) {
    walletAddress.value = settings.walletAddress;
    // Não conectar automaticamente, apenas mostrar o endereço
  }
}

// Salvar configurações
function saveSettings() {
  settingsService.updateSettings({
    network: selectedNetwork.value,
    rpcEndpoint: rpcEndpoint.value,
    gasPrice: gasPrice.value,
    autoConfirm: autoConfirm.value,
    walletAddress: walletAddress.value,
    lastConnected: isConnected.value ? Date.now() : 0
  });
}

// Salvar configurações quando a wallet conectar
function onWalletConnected(address: string) {
  walletAddress.value = address;
  settingsService.updateSettings({
    walletAddress: address,
    lastConnected: Date.now()
  });
}

// Limpar configurações quando desconectar
function onWalletDisconnected() {
  settingsService.updateSettings({
    walletAddress: '',
    lastConnected: 0
  });
}

// Exportar configurações
function exportSettings() {
  try {
    const settingsJson = settingsService.exportSettings();
    const blob = new Blob([settingsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'swiss-army-blockchain-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('Configurações exportadas com sucesso!');
  } catch (error) {
    console.error('Erro ao exportar configurações:', error);
    alert('Erro ao exportar configurações');
  }
}

// Resetar configurações
function resetSettings() {
  if (confirm('Tem certeza que deseja resetar todas as configurações para o padrão?')) {
    settingsService.resetSettings();
    loadSettings();
    alert('Configurações resetadas para o padrão!');
  }
}

// Função de diagnóstico
async function runDiagnostics() {
  try {
    isLoading.value = true;
    error.value = '';
    
    const diagnostics = {
      ledgerAvailable: false,
      connectionActive: false,
      ethereumAppOpen: false,
      lastError: ''
    };
    
    // Verificar se Ledger está disponível
    try {
      diagnostics.ledgerAvailable = await blockchainService.isLedgerAvailable();
    } catch (e) {
      diagnostics.lastError = e.message;
    }
    
    // Verificar se está conectado
    if (isConnected.value) {
      try {
        diagnostics.connectionActive = await blockchainService.isConnectionActive();
      } catch (e) {
        diagnostics.lastError = e.message;
      }
      
      // Verificar se app Ethereum está aberta
      if (diagnostics.connectionActive) {
        try {
          diagnostics.ethereumAppOpen = await blockchainService.checkEthereumApp();
        } catch (e) {
          diagnostics.lastError = e.message;
        }
      }
    }
    
    // Mostrar resultados
    const results = `
🔍 DIAGNÓSTICO DA LEDGER:

✅ Ledger Disponível: ${diagnostics.ledgerAvailable ? 'Sim' : 'Não'}
✅ Conectado: ${isConnected.value ? 'Sim' : 'Não'}
✅ Conexão Ativa: ${diagnostics.connectionActive ? 'Sim' : 'Não'}
✅ App Ethereum Aberta: ${diagnostics.ethereumAppOpen ? 'Sim' : 'Não'}

${diagnostics.lastError ? `❌ Último Erro: ${diagnostics.lastError}` : ''}

💡 SOLUÇÕES:
${!diagnostics.ledgerAvailable ? '• Verifique se a Ledger está conectada e desbloqueada' : ''}
${!isConnected.value ? '• Clique em "Conectar Hardwallet"' : ''}
${!diagnostics.connectionActive ? '• Clique em "Reconectar"' : ''}
${!diagnostics.ethereumAppOpen ? '• Abra a aplicação Ethereum na Ledger' : ''}
    `;
    
    alert(results);
    
  } catch (err: any) {
    error.value = err.message || 'Erro no diagnóstico';
    console.error('Erro no diagnóstico:', err);
  } finally {
    isLoading.value = false;
  }
}

// Verificar se Ledger está disponível ao carregar
onMounted(async () => {
  // Carregar configurações salvas
  loadSettings();
  
  const isAvailable = await blockchainService.isLedgerAvailable();
  if (!isAvailable) {
    console.warn('Ledger não está disponível neste navegador');
  }
});
</script>

<template>
  <div class="app">
    <!-- Tela Principal -->
    <div v-if="currentView === 'main'" class="main-screen">
      <header class="header">
        <h1 class="app-title">Swiss Army Blockchain</h1>
        <p class="app-subtitle">Ferramentas para contratos inteligentes</p>
        
        <div v-if="isConnected" class="wallet-status connected">
          <div class="wallet-info">
            <span class="status-indicator"></span>
            <span>Conectado: {{ walletAddress.slice(0, 6) }}...{{ walletAddress.slice(-4) }}</span>
            <span class="balance">Saldo: {{ parseFloat(walletBalance).toFixed(4) }} ETH</span>
          </div>
          <div class="wallet-actions">
            <button @click="reconnectWallet" class="btn-reconnect" :disabled="isLoading">
              {{ isLoading ? 'Reconectando...' : 'Reconectar' }}
            </button>
            <button @click="disconnectWallet" class="btn-disconnect">Desconectar</button>
          </div>
        </div>
        
        <div v-else class="wallet-status disconnected">
          <button @click="connectWallet" class="btn-connect" :disabled="isLoading">
            <span class="icon">🔗</span>
            {{ isLoading ? 'Conectando...' : 'Conectar Hardwallet' }}
          </button>
        </div>

        <!-- Mensagem de erro -->
        <div v-if="error" class="error-message">
          <span class="error-icon">⚠️</span>
          {{ error }}
          <button @click="error = ''" class="btn-close-error">×</button>
        </div>
      </header>

      <div class="tile-grid">
        <div class="tile large" @click="showERC20">
          <div class="tile-content">
            <div class="tile-icon">🪙</div>
            <h3>Criar Contrato ERC-20</h3>
            <p>Deploy de tokens ERC-20 personalizados</p>
          </div>
        </div>

        <div class="tile medium" @click="showMessageSigning">
          <div class="tile-content">
            <div class="tile-icon">✍️</div>
            <h3>Assinar Mensagem</h3>
            <p>Assinatura de mensagens arbitrárias</p>
          </div>
        </div>

        <div class="tile medium" @click="showSettings">
          <div class="tile-content">
            <div class="tile-icon">⚙️</div>
            <h3>Configurações</h3>
            <p>Configurar rede e preferências</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tela ERC-20 -->
    <div v-if="currentView === 'erc20'" class="screen">
      <header class="screen-header">
        <button @click="goBack" class="btn-back">← Voltar</button>
        <h2>Criar Contrato ERC-20</h2>
      </header>
      <div class="screen-content">
        <div class="form-container">
          <div class="input-group">
            <label>Nome do Token:</label>
            <input 
              type="text" 
              v-model="erc20Form.name"
              placeholder="Ex: Meu Token" 
            />
          </div>
          <div class="input-group">
            <label>Símbolo:</label>
            <input 
              type="text" 
              v-model="erc20Form.symbol"
              placeholder="Ex: MTK" 
            />
          </div>
          <div class="input-group">
            <label>Decimais:</label>
            <input 
              type="number" 
              v-model.number="erc20Form.decimals"
              min="0" 
              max="18"
            />
          </div>
          <div class="input-group">
            <label>Supply Inicial:</label>
            <input 
              type="text" 
              v-model="erc20Form.totalSupply"
              placeholder="1000000" 
            />
          </div>
          
          <!-- Mensagem de erro específica -->
          <div v-if="error" class="error-message">
            <span class="error-icon">⚠️</span>
            {{ error }}
          </div>
          
          <button 
            class="btn-primary" 
            :disabled="!isConnected || isLoading || !erc20Form.name || !erc20Form.symbol"
            @click="deployToken"
          >
            {{ isLoading ? 'Fazendo Deploy...' : (isConnected ? 'Deploy Contrato' : 'Conecte uma wallet primeiro') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Tela Assinatura de Mensagem -->
    <div v-if="currentView === 'message'" class="screen">
      <header class="screen-header">
        <button @click="goBack" class="btn-back">← Voltar</button>
        <h2>Assinar Mensagem</h2>
      </header>
      <div class="screen-content">
        <div class="form-container">
          <div class="input-group">
            <label>Mensagem para assinar:</label>
            <textarea 
              v-model="messageToSign"
              placeholder="Digite sua mensagem aqui..." 
              rows="6"
            ></textarea>
          </div>
          
          <!-- Mensagem de erro -->
          <div v-if="error" class="error-message">
            <span class="error-icon">⚠️</span>
            {{ error }}
          </div>
          
          <button 
            class="btn-primary" 
            :disabled="!isConnected || isLoading || !messageToSign.trim()"
            @click="signMessage"
          >
            {{ isLoading ? 'Assinando...' : (isConnected ? 'Assinar Mensagem' : 'Conecte uma wallet primeiro') }}
          </button>
          
          <!-- Resultado da assinatura -->
          <div v-if="signedMessage" class="signature-result">
            <h3>✅ Mensagem Assinada com Sucesso!</h3>
            
            <div class="signature-details">
              <div class="detail-item">
                <label>Assinatura:</label>
                <div class="signature-box">
                  <code>{{ signedMessage }}</code>
                </div>
              </div>
              
              <div class="detail-item">
                <label>Hash da Mensagem:</label>
                <div class="signature-box">
                  <code>{{ messageHash }}</code>
                </div>
              </div>
              
              <div class="detail-item">
                <label>Endereço do Signatário:</label>
                <div class="address-box">
                  <code>{{ signerAddress }}</code>
                </div>
              </div>
              
              <div class="detail-item">
                <label>Mensagem Original:</label>
                <div class="message-box">
                  <code>{{ messageToSign }}</code>
                </div>
              </div>
            </div>
            
            <div class="signature-actions">
              <button @click="clearSignature" class="btn-secondary">Limpar Tudo</button>
              <button @click="copyToClipboard(signedMessage)" class="btn-copy">Copiar Assinatura</button>
              <button @click="copyToClipboard(messageHash)" class="btn-copy">Copiar Hash</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tela Configurações -->
    <div v-if="currentView === 'settings'" class="screen">
      <header class="screen-header">
        <button @click="goBack" class="btn-back">← Voltar</button>
        <h2>Configurações</h2>
      </header>
      <div class="screen-content">
        <div class="settings-container">
          <div class="setting-group">
            <h3>Rede Blockchain</h3>
            <select v-model="selectedNetwork" @change="changeNetwork">
              <option value="ethereum">Ethereum Mainnet</option>
              <option value="polygon">Polygon</option>
              <option value="bsc">BSC</option>
              <option value="arbitrum">Arbitrum</option>
            </select>
            <p class="setting-description">Selecione a rede blockchain para suas transações</p>
          </div>
          
          <div class="setting-group">
            <h3>RPC Endpoint Personalizado</h3>
            <input 
              type="text" 
              v-model="rpcEndpoint"
              placeholder="https://mainnet.infura.io/v3/..." 
            />
            <p class="setting-description">Endpoint RPC personalizado (opcional)</p>
          </div>
          
          <div class="setting-group">
            <h3>Gas Price</h3>
            <input 
              type="text" 
              v-model="gasPrice"
              placeholder="20" 
            />
            <span class="unit">Gwei</span>
            <p class="setting-description">Preço do gas para transações</p>
          </div>
          
          <div class="setting-group">
            <h3>Configurações da Wallet</h3>
            <div class="checkbox-group">
              <label>
                <input type="checkbox" v-model="autoConfirm" />
                Confirmar transações automaticamente
              </label>
            </div>
            <p class="setting-description">Pular confirmação manual nas transações</p>
          </div>

          <div class="setting-group">
            <h3>Informações da Wallet</h3>
            <div class="wallet-info-display">
              <div class="info-item">
                <span class="label">Status:</span>
                <span :class="isConnected ? 'status-connected' : 'status-disconnected'">
                  {{ isConnected ? 'Conectada' : 'Desconectada' }}
                </span>
              </div>
              <div v-if="isConnected" class="info-item">
                <span class="label">Endereço:</span>
                <span class="address">{{ walletAddress }}</span>
              </div>
              <div v-if="isConnected" class="info-item">
                <span class="label">Saldo:</span>
                <span class="balance">{{ parseFloat(walletBalance).toFixed(4) }} ETH</span>
              </div>
            </div>
          </div>

          <div class="setting-group">
            <h3>Gerenciar Configurações</h3>
            <div class="settings-actions">
              <button @click="saveSettings" class="btn-save">Salvar Configurações</button>
              <button @click="loadSettings" class="btn-load">Recarregar Configurações</button>
              <button @click="exportSettings" class="btn-export">Exportar Configurações</button>
              <button @click="resetSettings" class="btn-reset">Resetar para Padrão</button>
            </div>
            <p class="setting-description">
              Suas configurações são salvas automaticamente. Use os botões acima para gerenciar manualmente.
            </p>
          </div>

          <div class="setting-group">
            <h3>Diagnóstico da Ledger</h3>
            <div class="diagnostic-actions">
              <button @click="runDiagnostics" class="btn-diagnostic" :disabled="isLoading">
                {{ isLoading ? 'Executando...' : '🔍 Executar Diagnóstico' }}
              </button>
            </div>
            <p class="setting-description">
              Execute o diagnóstico para identificar problemas com a Ledger e obter soluções específicas.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary-color: #0078d4;
  --primary-dark: #106ebe;
  --accent-color: #ff6b35;
  --success-color: #107c10;
  --warning-color: #ffb900;
  --error-color: #d13438;
  --background: #f3f2f1;
  --surface: #ffffff;
  --surface-secondary: #faf9f8;
  --text-primary: #323130;
  --text-secondary: #605e5c;
  --border: #edebe9;
  --shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  --shadow-hover: 0 4px 8px rgba(0, 0, 0, 0.16), 0 2px 4px rgba(0, 0, 0, 0.12);
  --border-radius: 4px;
  --font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
}

body {
  font-family: var(--font-family);
  background: var(--background);
  color: var(--text-primary);
  line-height: 1.5;
}

.app {
  min-height: 100vh;
  background: var(--background);
}

/* Tela Principal */
.main-screen {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.app-title {
  font-size: 2.5rem;
  font-weight: 300;
  color: var(--primary-color);
  margin-bottom: 8px;
}

.app-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 30px;
}

.wallet-status {
  display: inline-flex;
  align-items: center;
  padding: 12px 20px;
  border-radius: var(--border-radius);
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.wallet-status.connected {
  background: rgba(16, 124, 16, 0.1);
  border: 1px solid var(--success-color);
  color: var(--success-color);
}

.wallet-status.disconnected {
  background: rgba(0, 120, 212, 0.1);
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
}

.wallet-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 16px;
}

.wallet-info .balance {
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.wallet-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--success-color);
}

.btn-connect, .btn-disconnect {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.2s;
}

.btn-disconnect {
  background: var(--error-color);
}

.btn-connect:hover {
  background: var(--primary-dark);
}

.btn-disconnect:hover {
  background: #b52b2e;
}

.btn-reconnect {
  background: var(--warning-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.2s;
}

.btn-reconnect:hover:not(:disabled) {
  background: #e6a700;
}

.btn-reconnect:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Grid de Tiles */
.tile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.tile {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
  box-shadow: var(--shadow);
}

.tile:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.tile.large {
  grid-column: span 2;
}

.tile.medium {
  grid-column: span 1;
}

.tile-content {
  padding: 30px;
  text-align: center;
}

.tile-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.tile h3 {
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.tile p {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

/* Telas Secundárias */
.screen {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.screen-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
}

.btn-back {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-primary);
  padding: 8px 16px;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-back:hover {
  background: var(--surface-secondary);
  border-color: var(--primary-color);
}

.screen-header h2 {
  font-size: 1.8rem;
  font-weight: 300;
  color: var(--text-primary);
}

/* Formulários */
.form-container, .settings-container {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--border-radius);
  padding: 30px;
  box-shadow: var(--shadow);
}

.input-group {
  margin-bottom: 24px;
}

.input-group label {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.input-group input,
.input-group select,
.input-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-family: var(--font-family);
  background: var(--surface);
  color: var(--text-primary);
  transition: border-color 0.2s;
}

.input-group input:focus,
.input-group select:focus,
.input-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.2);
}

.input-group textarea {
  resize: vertical;
  min-height: 120px;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: background-color 0.2s;
  width: 100%;
  margin-top: 20px;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-dark);
}

.btn-primary:disabled {
  background: var(--text-secondary);
  cursor: not-allowed;
  opacity: 0.6;
}

/* Configurações */
.setting-group {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border);
}

.setting-group:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.setting-group h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: normal;
}

.checkbox-group input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.unit {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-left: 8px;
}

/* Mensagens de erro */
.error-message {
  background: rgba(209, 52, 56, 0.1);
  border: 1px solid var(--error-color);
  color: var(--error-color);
  padding: 12px 16px;
  border-radius: var(--border-radius);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.error-icon {
  font-size: 1.1rem;
}

.btn-close-error {
  background: none;
  border: none;
  color: var(--error-color);
  font-size: 1.2rem;
  cursor: pointer;
  margin-left: auto;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close-error:hover {
  background: rgba(209, 52, 56, 0.1);
  border-radius: 50%;
}

/* Resultado da assinatura */
.signature-result {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

.signature-result h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--success-color);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.signature-details {
  margin-bottom: 20px;
}

.detail-item {
  margin-bottom: 16px;
}

.detail-item label {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.signature-box, .address-box, .message-box {
  background: var(--surface-secondary);
  border: 1px solid var(--border);
  border-radius: var(--border-radius);
  padding: 12px;
  word-break: break-all;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.85rem;
  color: var(--text-primary);
  max-height: 100px;
  overflow-y: auto;
}

.address-box {
  background: rgba(0, 120, 212, 0.05);
  border-color: var(--primary-color);
}

.message-box {
  background: rgba(16, 124, 16, 0.05);
  border-color: var(--success-color);
}

.signature-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-copy {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.btn-copy:hover {
  background: var(--primary-dark);
}

/* Botões de configurações */
.settings-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.btn-save {
  background: var(--success-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.btn-save:hover {
  background: #0d6b0d;
}

.btn-load {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.btn-load:hover {
  background: var(--primary-dark);
}

.btn-export {
  background: var(--warning-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.btn-export:hover {
  background: #e6a700;
}

.btn-reset {
  background: var(--error-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.btn-reset:hover {
  background: #b52b2e;
}

/* Diagnóstico */
.diagnostic-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.btn-diagnostic {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-diagnostic:hover:not(:disabled) {
  background: #e55a2b;
}

.btn-diagnostic:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--surface-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border);
  padding: 8px 16px;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: var(--border);
  border-color: var(--text-secondary);
}

/* Configurações */
.setting-description {
  color: var(--text-secondary);
  font-size: 0.85rem;
  margin-top: 6px;
  margin-bottom: 0;
}

.wallet-info-display {
  background: var(--surface-secondary);
  border: 1px solid var(--border);
  border-radius: var(--border-radius);
  padding: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .label {
  font-weight: 600;
  color: var(--text-secondary);
}

.status-connected {
  color: var(--success-color);
  font-weight: 600;
}

.status-disconnected {
  color: var(--error-color);
  font-weight: 600;
}

.address {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.9rem;
  color: var(--text-primary);
  word-break: break-all;
  max-width: 200px;
  text-align: right;
}

/* Loading states */
.btn-connect:disabled,
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsividade */
@media (max-width: 768px) {
  .main-screen {
    padding: 16px;
  }
  
  .tile-grid {
    grid-template-columns: 1fr;
  }
  
  .tile.large {
    grid-column: span 1;
  }
  
  .app-title {
    font-size: 2rem;
  }
  
  .screen-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .wallet-status {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .wallet-info {
    margin-right: 0;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  :root {
    --background: #1a1a1a;
    --surface: #2d2d2d;
    --surface-secondary: #3a3a3a;
    --text-primary: #ffffff;
    --text-secondary: #cccccc;
    --border: #404040;
    --shadow: 0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2);
    --shadow-hover: 0 4px 8px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3);
  }
}
</style>