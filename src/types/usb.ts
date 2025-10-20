export interface USBDevice {
  vendorId: number;
  productId: number;
  deviceName: string;
  connected: boolean;
  serialNumber?: string;
}

export interface LedgerDevice extends USBDevice {
  appName?: string;
  appVersion?: string;
  locked: boolean;
}

export interface USBDetectionResult {
  devices: USBDevice[];
  ledgerDevices: LedgerDevice[];
}

export interface DeviceConnectionStatus {
  isConnected: boolean;
  deviceType?: string;
  error?: string;
}
