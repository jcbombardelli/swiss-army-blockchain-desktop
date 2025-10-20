import { ref, reactive } from 'vue';
import { walletService, usbService } from '../services';
import type { WalletConnection, WalletInfo } from '../types/wallet';
import type { USBDevice } from '../types/usb';

export const walletStore = reactive<WalletConnection>({
  status: 'disconnected'
});

export const walletInfo = ref<WalletInfo | null>(null);
export const serviceType = ref<'tauri' | 'webusb' | 'none'>('none');

// Detectar tipo de serviço disponível
export const detectServiceType = () => {
  serviceType.value = walletService.getServiceType();
  console.log(`💡 Serviço de wallet detectado: ${serviceType.value}`);
};

export const connectLedger = async (): Promise<boolean> => {
  try {
    walletStore.status = 'connecting';
    walletStore.error = undefined;

    // Usar o serviço apropriado (Tauri ou Web USB)
    const result = await walletService.connectLedger();
    walletStore.wallet = result;
    walletStore.status = 'connected';

    // Busca informações da wallet
    if (result.address) {
      const info = await walletService.getWalletInfo(result.address);
      walletInfo.value = info;
    }

    return true;
  } catch (error) {
    walletStore.status = 'error';
    walletStore.error = error as string;
    console.error('Erro ao conectar Ledger:', error);
    return false;
  }
};

export const disconnectWallet = async () => {
  try {
    if (walletStore.wallet) {
      await walletService.disconnectWallet();
    }
  } catch (error) {
    console.error('Erro ao desconectar wallet:', error);
  } finally {
    walletStore.status = 'disconnected';
    walletStore.wallet = undefined;
    walletStore.error = undefined;
    walletInfo.value = null;
  }
};

export const checkUSBDevices = async (): Promise<USBDevice[]> => {
  try {
    const devices = await usbService.detectDevices();
    return devices;
  } catch (error) {
    console.error('Erro ao detectar dispositivos USB:', error);
    return [];
  }
};

export const refreshWalletBalance = async () => {
  if (walletStore.wallet?.address) {
    try {
      const info = await walletService.getWalletInfo(walletStore.wallet.address);
      walletInfo.value = info;
    } catch (error) {
      console.error('Erro ao atualizar saldo:', error);
    }
  }
};
