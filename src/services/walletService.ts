// src/services/walletService.ts
import { invoke } from '@tauri-apps/api/core';
import { WebUSBService } from './webUSB';
import type { HardwareWallet, WalletInfo } from '../types/wallet';

export interface WalletServiceInterface {
  connectLedger(): Promise<HardwareWallet>;
  disconnectWallet(): Promise<void>;
  getWalletInfo(address: string): Promise<WalletInfo>;
  signMessage(message: string, useEIP191?: boolean): Promise<string>;
  isSupported(): boolean;
  getServiceType(): 'tauri' | 'webusb' | 'none';
}

class TauriWalletService implements WalletServiceInterface {
  async connectLedger(): Promise<HardwareWallet> {
    try {
      return await invoke<HardwareWallet>('connect_ledger');
    } catch (error) {
      console.error('Erro ao conectar Ledger via Tauri:', error);
      throw error;
    }
  }

  async disconnectWallet(): Promise<void> {
    try {
      await invoke('disconnect_wallet');
    } catch (error) {
      console.error('Erro ao desconectar wallet via Tauri:', error);
      throw error;
    }
  }

  async getWalletInfo(address: string): Promise<WalletInfo> {
    try {
      return await invoke<WalletInfo>('get_wallet_info', { address });
    } catch (error) {
      console.error('Erro ao obter informações da wallet via Tauri:', error);
      throw error;
    }
  }

  async signMessage(message: string, useEIP191: boolean = true): Promise<string> {
    try {
      return await invoke<string>('sign_message', {
        message,
        useEip191: useEIP191
      });
    } catch (error) {
      console.error('Erro ao assinar mensagem via Tauri:', error);
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

class WebUSBWalletService implements WalletServiceInterface {
  private webUSBService: WebUSBService;
  private connectedDevice: USBDevice | null = null;

  constructor() {
    this.webUSBService = new WebUSBService();
  }

  async connectLedger(): Promise<HardwareWallet> {
    try {
      // Solicitar dispositivo Ledger
      const device = await this.webUSBService.requestDevice();
      if (!device) {
        throw new Error('Nenhum dispositivo Ledger selecionado');
      }

      // Conectar ao dispositivo
      const connected = await this.webUSBService.connectDevice();
      if (!connected) {
        throw new Error('Falha ao conectar com o dispositivo Ledger');
      }

      this.connectedDevice = device;

      // Simular obtenção de endereço (na implementação real, seria via APDU)
      const address = await this.simulateGetAddress();

      return {
        type: 'ledger',
        connected: true,
        address,
        deviceId: device.serialNumber || `${device.vendorId}-${device.productId}`,
        name: this.getDeviceName(device.productId),
        version: undefined // Seria obtido via APDU
      };
    } catch (error) {
      console.error('Erro ao conectar Ledger via Web USB:', error);
      throw error;
    }
  }

  async disconnectWallet(): Promise<void> {
    try {
      await this.webUSBService.disconnectDevice();
      this.connectedDevice = null;
    } catch (error) {
      console.error('Erro ao desconectar wallet via Web USB:', error);
      throw error;
    }
  }

  async getWalletInfo(address: string): Promise<WalletInfo> {
    try {
      // Simular busca de saldo (na implementação real, usaria RPC)
      const balance = await this.simulateGetBalance(address);

      return {
        address,
        balance,
        chainId: 1 // Ethereum mainnet
      };
    } catch (error) {
      console.error('Erro ao obter informações da wallet via Web USB:', error);
      throw error;
    }
  }

  private getDeviceName(productId: number): string {
    switch (productId) {
      case 0x0001:
        return 'Ledger Nano S';
      case 0x0004:
        return 'Ledger Nano X';
      case 0x0005:
        return 'Ledger Nano S Plus';
      default:
        return 'Ledger Device';
    }
  }

  private async simulateGetAddress(): Promise<string> {
    // Simular delay de comunicação
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Retornar endereço simulado
    return '0x742d35Cc6634C0532925a3b8D64C65F8f4c7AD05';
  }

  private async simulateGetBalance(_address: string): Promise<string> {
    // Simular delay de consulta
    await new Promise(resolve => setTimeout(resolve, 500));

    // Retornar saldo simulado
    return '1.2345';
  }

  async signMessage(message: string, useEIP191: boolean = true): Promise<string> {
    try {
      if (!this.connectedDevice) {
        throw new Error('Nenhum dispositivo Ledger conectado');
      }

      // Simular delay de assinatura
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Na implementação real, seria enviado comandos APDU para o Ledger
      // Por enquanto, simular uma assinatura
      const simulatedSignature = this.simulateSignature(message, useEIP191);

      return simulatedSignature;
    } catch (error) {
      console.error('Erro ao assinar mensagem via Web USB:', error);
      throw error;
    }
  }

  private simulateSignature(message: string, useEIP191: boolean): string {
    // Simular uma assinatura Ethereum válida (apenas para demonstração)
    // Na implementação real, seria obtida do dispositivo Ledger
    const messageHash = useEIP191 ?
      `Ethereum Signed Message:\n${message.length}${message}` :
      message;

    // Para debug - log do hash (remover em produção)
    console.debug('Message hash for signing:', messageHash);

    // Retornar assinatura simulada (estrutura válida mas valores fictícios)
    return '0x' +
      '1b'.padStart(2, '0') + // v
      'a'.repeat(64) + // r
      'b'.repeat(64);  // s
  }

  isSupported(): boolean {
    return this.webUSBService.isSupported();
  }

  getServiceType(): 'tauri' | 'webusb' | 'none' {
    return 'webusb';
  }
}

class NoWalletService implements WalletServiceInterface {
  async connectLedger(): Promise<HardwareWallet> {
    throw new Error('Conexão com hardware wallet não suportada neste ambiente');
  }

  async disconnectWallet(): Promise<void> {
    throw new Error('Desconexão de hardware wallet não suportada neste ambiente');
  }

  async getWalletInfo(_address: string): Promise<WalletInfo> {
    throw new Error('Obtenção de informações da wallet não suportada neste ambiente');
  }

  async signMessage(_message: string, _useEIP191?: boolean): Promise<string> {
    throw new Error('Assinatura de mensagem não suportada neste ambiente');
  }

  isSupported(): boolean {
    return false;
  }

  getServiceType(): 'tauri' | 'webusb' | 'none' {
    return 'none';
  }
}

// Factory para criar o serviço apropriado
export class WalletServiceFactory {
  private static instance: WalletServiceInterface | null = null;

  static getInstance(): WalletServiceInterface {
    if (!this.instance) {
      this.instance = this.createService();
    }
    return this.instance;
  }

  private static createService(): WalletServiceInterface {
    // Verificar se está rodando no Tauri
    if (window.__TAURI__) {
      console.log('🚀 Usando Tauri Wallet Service');
      return new TauriWalletService();
    }

    // Verificar se Web USB está disponível
    if ('usb' in navigator) {
      console.log('🌐 Usando Web USB Wallet Service');
      return new WebUSBWalletService();
    }

    // Fallback para nenhum suporte
    console.warn('❌ Hardware wallet não suportado neste ambiente');
    return new NoWalletService();
  }

  // Método para forçar recriação (útil para testes)
  static reset(): void {
    this.instance = null;
  }
}

// Export do serviço singleton
export const walletService = WalletServiceFactory.getInstance();
