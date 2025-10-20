<template>
  <div class="wallet-connector">
    <!-- Service Type Indicator -->
    <div class="service-info">
      <span class="service-badge" :class="`service-${serviceType}`">
        {{ getServiceDescription(serviceType) }}
      </span>
    </div>

    <div class="wallet-status">
      <div class="status-indicator" :class="walletStatusClass">
        <span class="status-dot"></span>
        <span class="status-text">{{ walletStatusText }}</span>
      </div>

      <div class="wallet-actions">
        <button
          v-if="walletStore.status !== 'connected'"
          @click="connectWallet"
          :disabled="walletStore.status === 'connecting'"
          class="connect-btn"
        >
          <span class="btn-icon">🔗</span>
          {{ walletStore.status === 'connecting' ? 'Conectando...' : 'Conectar Ledger' }}
        </button>

        <button
          v-else
          @click="disconnectWallet"
          class="disconnect-btn"
        >
          <span class="btn-icon">🔌</span>
          Desconectar
        </button>

        <button
          @click="checkDevices"
          class="refresh-btn"
          :disabled="isCheckingDevices"
        >
          <span class="btn-icon">🔄</span>
          {{ isCheckingDevices ? 'Verificando...' : 'Verificar USB' }}
        </button>
      </div>
    </div>

    <div v-if="walletStore.status === 'connected' && walletInfo" class="wallet-info">
      <div class="info-item">
        <div class="info-label">Endereço:</div>
        <span class="address">{{ formatAddress(walletInfo.address) }}</span>
        <button @click="copyAddress" class="copy-btn">📋</button>
      </div>

      <div v-if="walletInfo.balance" class="info-item">
        <div class="info-label">Saldo:</div>
        <span class="balance">{{ formatBalance(walletInfo.balance) }} ETH</span>
        <button @click="refreshBalance" class="refresh-balance-btn">🔄</button>
      </div>
    </div>

    <div v-if="walletStore.status === 'error'" class="error-message">
      <span class="error-icon">❌</span>
      <span class="error-text">{{ walletStore.error }}</span>
      <button @click="clearError" class="clear-error-btn">✖️</button>
    </div>

    <div v-if="usbDevices.length > 0" class="usb-devices">
      <h4>Dispositivos USB Detectados:</h4>
      <ul class="device-list">
        <li v-for="device in usbDevices" :key="`${device.vendorId}-${device.productId}`" class="device-item">
          <span class="device-name">{{ device.deviceName }}</span>
          <span class="device-status" :class="{ connected: device.connected }">
            {{ device.connected ? 'Conectado' : 'Desconectado' }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { walletStore, walletInfo, serviceType, detectServiceType, connectLedger, disconnectWallet as disconnect, checkUSBDevices, refreshWalletBalance } from '../stores/wallet';
import type { USBDevice } from '../types/usb';

const usbDevices = ref<USBDevice[]>([]);
const isCheckingDevices = ref(false);

// Detectar tipo de serviço ao montar o componente
onMounted(() => {
  detectServiceType();
});

const getServiceDescription = (type: string) => {
  switch (type) {
    case 'tauri':
      return '🚀 Tauri (Nativo)';
    case 'webusb':
      return '🌐 Web USB (Browser)';
    case 'none':
      return '❌ USB não suportado';
    default:
      return '🔍 Detectando...';
  }
};

const walletStatusClass = computed(() => ({
  'status-connected': walletStore.status === 'connected',
  'status-connecting': walletStore.status === 'connecting',
  'status-error': walletStore.status === 'error',
  'status-disconnected': walletStore.status === 'disconnected'
}));

const walletStatusText = computed(() => {
  switch (walletStore.status) {
    case 'connected':
      return `Conectado: ${walletStore.wallet?.name || 'Hardware Wallet'}`;
    case 'connecting':
      return 'Conectando...';
    case 'error':
      return 'Erro de conexão';
    default:
      return 'Desconectado';
  }
});

const connectWallet = async () => {
  await connectLedger();
};

const disconnectWallet = async () => {
  await disconnect();
};

const checkDevices = async () => {
  isCheckingDevices.value = true;
  try {
    const devices = await checkUSBDevices();
    usbDevices.value = devices as USBDevice[];
  } catch (error) {
    console.error('Erro ao verificar dispositivos:', error);
  } finally {
    isCheckingDevices.value = false;
  }
};

const clearError = () => {
  walletStore.error = undefined;
  if (walletStore.status === 'error') {
    walletStore.status = 'disconnected';
  }
};

const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const formatBalance = (balance: string) => {
  return parseFloat(balance).toFixed(4);
};

const copyAddress = async () => {
  if (walletInfo.value?.address) {
    try {
      await navigator.clipboard.writeText(walletInfo.value.address);
      // Adicionar feedback visual aqui
    } catch (error) {
      console.error('Erro ao copiar endereço:', error);
    }
  }
};

const refreshBalance = async () => {
  await refreshWalletBalance();
};
</script>

<style scoped>
.wallet-connector {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.service-info {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.service-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  background: #f0f0f0;
  color: #666;
}

.service-badge.service-tauri {
  background: #e8f5e8;
  color: #2e7d2e;
}

.service-badge.service-webusb {
  background: #e3f2fd;
  color: #1976d2;
}

.service-badge.service-none {
  background: #ffebee;
  color: #c62828;
}

.wallet-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ccc;
}

.status-connected .status-dot {
  background: #4CAF50;
}

.status-connecting .status-dot {
  background: #FF9800;
  animation: pulse 1s infinite;
}

.status-error .status-dot {
  background: #f44336;
}

.wallet-actions {
  display: flex;
  gap: 0.5rem;
}

.connect-btn, .disconnect-btn, .refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.connect-btn {
  background: #4CAF50;
  color: white;
}

.connect-btn:hover {
  background: #45a049;
}

.connect-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.disconnect-btn {
  background: #f44336;
  color: white;
}

.disconnect-btn:hover {
  background: #da190b;
}

.refresh-btn {
  background: #2196F3;
  color: white;
}

.refresh-btn:hover {
  background: #0b7dda;
}

.wallet-info {
  border-top: 1px solid #eee;
  padding-top: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.info-item .info-label {
  font-weight: 600;
  min-width: 80px;
}

.address, .balance {
  font-family: monospace;
  background: #f5f5f5;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.copy-btn, .refresh-balance-btn, .clear-error-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #ffebee;
  color: #c62828;
  padding: 0.75rem;
  border-radius: 4px;
  border-left: 4px solid #f44336;
}

.usb-devices {
  border-top: 1px solid #eee;
  padding-top: 1rem;
  margin-top: 1rem;
}

.device-list {
  list-style: none;
  padding: 0;
}

.device-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.device-status.connected {
  color: #4CAF50;
  font-weight: 600;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
</style>
