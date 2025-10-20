export interface HardwareWallet {
  type: 'ledger' | 'trezor' | 'other';
  connected: boolean;
  address?: string;
  deviceId?: string;
  name?: string;
  version?: string;
}

export interface WalletConnection {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  wallet?: HardwareWallet;
  error?: string;
}

export interface WalletInfo {
  address: string;
  balance?: string;
  chainId?: number;
}

export interface SignatureResult {
  signature: string;
  recoveryId: number;
}
