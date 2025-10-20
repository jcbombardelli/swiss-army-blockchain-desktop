// src/services/usbService.ts
import { invoke } from '@tauri-apps/api/core';
import { WebUSBService } from './webUSB';
import type { USBDevice, LedgerDevice } from '../types/usb';

export interface USBServiceInterface {
  detectDevices(): Promise<USBDevice[]>;
  detectLedgerDevices(): Promise<LedgerDevice[]>;
  isSupported(): boolean;
  getServiceType(): 'tauri' | 'webusb' | 'none';
}

class TauriUSBService implements USBServiceInterface {
  async detectDevices(): Promise<USBDevice[]> {
    try {
      return await invoke<USBDevice[]>('detect_usb_devices');
    } catch (error) {
      console.error('Erro ao detectar dispositivos USB via Tauri:', error);
      throw error;
    }
  }

  async detectLedgerDevices(): Promise<LedgerDevice[]> {
    try {
      return await invoke<LedgerDevice[]>('detect_ledger_devices');
    } catch (error) {
      console.error('Erro ao detectar dispositivos Ledger via Tauri:', error);
      throw error;
    }
  }

  isSupported(): boolean {
    return window.__TAURI__ !== undefined;
  }

  getServiceType(): 'tauri' | 'webusb' | 'none' {
    return 'tauri';
  }
}

class WebUSBServiceAdapter implements USBServiceInterface {
  private webUSBService: WebUSBService;

  constructor() {
    this.webUSBService = new WebUSBService();
  }

  async detectDevices(): Promise<USBDevice[]> {
    try {
      const devices = await this.webUSBService.listDevices();
      return devices.map(device => ({
        vendorId: device.vendorId,
        productId: device.productId,
        deviceName: this.getDeviceName(device.vendorId, device.productId),
        connected: device.opened,
        serialNumber: device.serialNumber
      }));
    } catch (error) {
      console.error('Erro ao detectar dispositivos USB via Web USB:', error);
      throw error;
    }
  }

  async detectLedgerDevices(): Promise<LedgerDevice[]> {
    try {
      const devices = await this.webUSBService.listDevices();
      const ledgerDevices = devices.filter(device => device.vendorId === 0x2c97);

      return ledgerDevices.map(device => ({
        vendorId: device.vendorId,
        productId: device.productId,
        deviceName: this.getLedgerDeviceName(device.productId),
        connected: device.opened,
        serialNumber: device.serialNumber,
        appName: undefined,
        appVersion: undefined,
        locked: true // Assumir bloqueado por padrão
      }));
    } catch (error) {
      console.error('Erro ao detectar dispositivos Ledger via Web USB:', error);
      throw error;
    }
  }

  private getDeviceName(vendorId: number, productId: number): string {
    const LEDGER_VENDOR_ID = 0x2c97;
    const TREZOR_VENDOR_ID = 0x534c;

    switch (vendorId) {
      case LEDGER_VENDOR_ID:
        return this.getLedgerDeviceName(productId);
      case TREZOR_VENDOR_ID:
        return this.getTrezorDeviceName(productId);
      default:
        return `Dispositivo USB ${vendorId.toString(16).padStart(4, '0')}:${productId.toString(16).padStart(4, '0')}`;
    }
  }

  private getLedgerDeviceName(productId: number): string {
    switch (productId) {
      case 0x0001:
        return 'Ledger Nano S';
      case 0x0004:
        return 'Ledger Nano X';
      case 0x0005:
        return 'Ledger Nano S Plus';
      default:
        return `Ledger Device ${productId.toString(16).padStart(4, '0')}`;
    }
  }

  private getTrezorDeviceName(productId: number): string {
    switch (productId) {
      case 0x0001:
        return 'Trezor One';
      case 0x0002:
        return 'Trezor Model T';
      default:
        return `Trezor Device ${productId.toString(16).padStart(4, '0')}`;
    }
  }

  isSupported(): boolean {
    return this.webUSBService.isSupported();
  }

  getServiceType(): 'tauri' | 'webusb' | 'none' {
    return 'webusb';
  }
}

class NoUSBService implements USBServiceInterface {
  async detectDevices(): Promise<USBDevice[]> {
    throw new Error('USB não suportado neste ambiente');
  }

  async detectLedgerDevices(): Promise<LedgerDevice[]> {
    throw new Error('USB não suportado neste ambiente');
  }

  isSupported(): boolean {
    return false;
  }

  getServiceType(): 'tauri' | 'webusb' | 'none' {
    return 'none';
  }
}

// Factory para criar o serviço apropriado
export class USBServiceFactory {
  private static instance: USBServiceInterface | null = null;

  static getInstance(): USBServiceInterface {
    if (!this.instance) {
      this.instance = this.createService();
    }
    return this.instance;
  }

  private static createService(): USBServiceInterface {
    // Verificar se está rodando no Tauri
    if (window.__TAURI__) {
      console.log('🚀 Usando Tauri USB Service');
      return new TauriUSBService();
    }

    // Verificar se Web USB está disponível
    if ('usb' in navigator) {
      console.log('🌐 Usando Web USB Service');
      return new WebUSBServiceAdapter();
    }

    // Fallback para nenhum suporte
    console.warn('❌ USB não suportado neste ambiente');
    return new NoUSBService();
  }

  // Método para forçar recriação (útil para testes)
  static reset(): void {
    this.instance = null;
  }
}

// Export do serviço singleton
export const usbService = USBServiceFactory.getInstance();
