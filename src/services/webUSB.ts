// src/services/webUSB.ts
export class WebUSBService {
  private device: USBDevice | null = null;

  async requestDevice(): Promise<USBDevice | null> {
    try {
      if (!navigator.usb) {
        throw new Error('Web USB API não suportada neste navegador');
      }

      const device = await navigator.usb.requestDevice({
        filters: [
          { vendorId: 0x2c97 }, // Ledger
          { vendorId: 0x534c }, // Trezor
        ]
      });

      this.device = device;
      return device;
    } catch (error) {
      console.error('Erro ao solicitar dispositivo USB:', error);
      return null;
    }
  }

  async connectDevice(): Promise<boolean> {
    if (!this.device) {
      throw new Error('Nenhum dispositivo selecionado');
    }

    try {
      await this.device.open();
      await this.device.selectConfiguration(1);
      await this.device.claimInterface(0);
      return true;
    } catch (error) {
      console.error('Erro ao conectar dispositivo:', error);
      return false;
    }
  }

  async disconnectDevice(): Promise<void> {
    if (this.device) {
      try {
        await this.device.close();
        this.device = null;
      } catch (error) {
        console.error('Erro ao desconectar:', error);
      }
    }
  }

  async listDevices(): Promise<USBDevice[]> {
    if (!navigator.usb) {
      return [];
    }

    try {
      return await navigator.usb.getDevices();
    } catch (error) {
      console.error('Erro ao listar dispositivos:', error);
      return [];
    }
  }

  isSupported(): boolean {
    return 'usb' in navigator;
  }
}
