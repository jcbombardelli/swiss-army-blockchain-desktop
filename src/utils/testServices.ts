// src/utils/testServices.ts
import { walletService, usbService } from '../services';

export const testUSBServices = async () => {
  console.log('🧪 Testando serviços USB...');

  try {
    // Testar serviço USB
    console.log(`📱 Serviço USB: ${usbService.getServiceType()}`);
    console.log(`✅ USB suportado: ${usbService.isSupported()}`);

    if (usbService.isSupported()) {
      try {
        const devices = await usbService.detectDevices();
        console.log(`🔍 Dispositivos encontrados: ${devices.length}`);
        devices.forEach(device => {
          console.log(`  - ${device.deviceName} (${device.vendorId}:${device.productId})`);
        });
      } catch (error) {
        console.warn('⚠️ Erro ao detectar dispositivos:', error);
      }
    }

    // Testar serviço de wallet
    console.log(`💰 Serviço Wallet: ${walletService.getServiceType()}`);
    console.log(`✅ Wallet suportado: ${walletService.isSupported()}`);

  } catch (error) {
    console.error('❌ Erro nos testes de serviço:', error);
  }
};

export const getServiceStatus = () => {
  return {
    usb: {
      type: usbService.getServiceType(),
      supported: usbService.isSupported()
    },
    wallet: {
      type: walletService.getServiceType(),
      supported: walletService.isSupported()
    },
    environment: {
      isTauri: !!window.__TAURI__,
      hasWebUSB: 'usb' in navigator,
      isHTTPS: location.protocol === 'https:',
      userAgent: navigator.userAgent
    }
  };
};
