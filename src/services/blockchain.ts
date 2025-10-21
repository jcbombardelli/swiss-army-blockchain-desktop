import { ethers } from 'ethers';
import ERC20Contract from '../contracts/ERC20Token.json';

// Lazy imports for Ledger libraries to avoid Buffer issues
let TransportWebHID: any;
let TransportWebUSB: any;
let Eth: any;

async function loadLedgerLibs() {
  if (!TransportWebHID) {
    const hid = await import('@ledgerhq/hw-transport-webhid');
    TransportWebHID = hid.default;
  }
  if (!TransportWebUSB) {
    const usb = await import('@ledgerhq/hw-transport-webusb');
    TransportWebUSB = usb.default;
  }
  if (!Eth) {
    const eth = await import('@ledgerhq/hw-app-eth');
    Eth = eth.default;
  }
}

// Interfaces
export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
}

export interface ERC20Token {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
}

export interface WalletInfo {
  address: string;
  balance: string;
  isConnected: boolean;
}

// Configurações de rede
export const NETWORKS: Record<string, NetworkConfig> = {
  ethereum: {
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
    explorerUrl: 'https://etherscan.io'
  },
  polygon: {
    name: 'Polygon',
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com'
  },
  bsc: {
    name: 'BSC',
    chainId: 56,
    rpcUrl: 'https://bsc-dataseed.binance.org',
    explorerUrl: 'https://bscscan.com'
  },
  arbitrum: {
    name: 'Arbitrum',
    chainId: 42161,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io'
  }
};

// Classe principal para gerenciar blockchain
export class BlockchainService {
  private provider: ethers.JsonRpcProvider | null = null;
  private ledgerApp: any = null;
  private transport: any = null;
  private currentNetwork: NetworkConfig = NETWORKS.polygon;
  private walletInfo: WalletInfo = {
    address: '',
    balance: '0',
    isConnected: false
  };

  // Conectar com Ledger
  async connectLedger(): Promise<WalletInfo> {
    try {
      // Carregar bibliotecas Ledger primeiro
      await loadLedgerLibs();
      
      // Limpar conexões anteriores
      if (this.transport) {
        try {
          await this.transport.close();
        } catch (e) {
          console.log('Erro ao fechar transporte anterior:', e);
        }
        this.transport = null;
      }
      
      // Tentar WebHID primeiro (mais moderno)
      try {
        console.log('Tentando conectar via WebHID...');
        this.transport = await TransportWebHID.create();
        console.log('Conectado via WebHID');
      } catch (webHidError) {
        console.log('WebHID falhou, tentando WebUSB...', webHidError);
        try {
          this.transport = await TransportWebUSB.create();
          console.log('Conectado via WebUSB');
        } catch (webUsbError) {
          console.error('Ambos WebHID e WebUSB falharam:', webUsbError);
          throw new Error('Não foi possível conectar com a Ledger. Verifique se está conectada e desbloqueada.');
        }
      }

      // Criar instância da aplicação Ethereum
      this.ledgerApp = new Eth(this.transport);
      
      // Obter endereço da conta 0
      const result = await this.ledgerApp.getAddress("44'/60'/0'/0/0");
      const address = result.address;
      
      // Configurar provider
      this.provider = new ethers.JsonRpcProvider(this.currentNetwork.rpcUrl);
      
      // Obter saldo
      const balance = await this.provider.getBalance(address);
      const balanceFormatted = ethers.formatEther(balance);
      
      this.walletInfo = {
        address,
        balance: balanceFormatted,
        isConnected: true
      };

      return this.walletInfo;
    } catch (error) {
      console.error('Erro ao conectar com Ledger:', error);
      throw new Error('Falha ao conectar com a Ledger. Verifique se está conectada e desbloqueada.');
    }
  }

  // Desconectar wallet
  async disconnect(): Promise<void> {
    try {
      if (this.transport) {
        await this.transport.close();
        this.transport = null;
      }
    } catch (error) {
      console.log('Erro ao fechar transporte:', error);
    }
    
    this.ledgerApp = null;
    this.provider = null;
    this.walletInfo = {
      address: '',
      balance: '0',
      isConnected: false
    };
  }

  // Obter informações da wallet
  getWalletInfo(): WalletInfo {
    return this.walletInfo;
  }

  // Alterar rede
  async switchNetwork(networkKey: string): Promise<void> {
    if (!NETWORKS[networkKey]) {
      throw new Error('Rede não suportada');
    }

    this.currentNetwork = NETWORKS[networkKey];
    
    if (this.walletInfo.isConnected) {
      this.provider = new ethers.JsonRpcProvider(this.currentNetwork.rpcUrl);
      
      // Atualizar saldo para nova rede
      const balance = await this.provider.getBalance(this.walletInfo.address);
      this.walletInfo.balance = ethers.formatEther(balance);
    }
  }

  // Obter rede atual
  getCurrentNetwork(): NetworkConfig {
    return this.currentNetwork;
  }

  // Deploy de contrato ERC-20
  async deployERC20Token(tokenData: ERC20Token): Promise<string> {
    if (!this.ledgerApp || !this.provider) {
      throw new Error('Wallet não conectada');
    }

    try {
      // Usar o bytecode do contrato compilado
      const factory = new ethers.ContractFactory(
        ERC20Contract.abi,
        ERC20Contract.bytecode,
        this.provider
      );
      
      // Criar transação de deploy
      const deployTx = await factory.getDeployTransaction(
        tokenData.name,
        tokenData.symbol,
        tokenData.decimals,
        tokenData.totalSupply
      );

      // Obter nonce e gas price
      const nonce = await this.provider.getTransactionCount(this.walletInfo.address);
      const feeData = await this.provider.getFeeData();
      
      deployTx.nonce = nonce;
      deployTx.gasLimit = BigInt(3000000); // Gas limit para deploy
      deployTx.gasPrice = feeData.gasPrice || BigInt(20000000000); // 20 gwei default

      // Assinar com Ledger
      const signedTx = await this.signTransaction(deployTx);
      
      // Enviar transação
      const txResponse = await this.provider.broadcastTransaction(signedTx);
      
      // Aguardar confirmação
      await txResponse.wait();
      
      return txResponse.hash;
    } catch (error: any) {
      console.error('Erro ao fazer deploy do token:', error);
      throw new Error(`Falha ao fazer deploy do contrato ERC-20: ${error.message || 'Erro desconhecido'}`);
    }
  }

  // Assinar transação
  async signTransaction(transaction: any): Promise<string> {
    if (!this.ledgerApp) {
      throw new Error('Ledger não conectada');
    }

    try {
      // Serializar transação usando ethers
      const serializedTx = ethers.Transaction.from(transaction).unsignedSerialized;
      
      // Assinar com Ledger
      const signature = await this.ledgerApp.signTransaction(
        "44'/60'/0'/0/0",
        serializedTx
      );
      
      // Adicionar assinatura à transação
      transaction.signature = signature;
      
      // Serializar transação assinada
      return ethers.Transaction.from(transaction).serialized;
    } catch (error: any) {
      console.error('Erro ao assinar transação:', error);
      throw new Error(`Falha ao assinar transação: ${error.message || 'Erro desconhecido'}`);
    }
  }

  // Assinar mensagem
  async signMessage(message: string): Promise<{ signature: string; messageHash: string; address: string }> {
    if (!message || message.trim().length === 0) {
      throw new Error('Mensagem não pode estar vazia');
    }

    // Verificar se precisa reconectar
    if (!await this.reconnectIfNeeded()) {
      throw new Error('Ledger não conectada. Tente conectar novamente.');
    }

    // Verificar se a aplicação Ethereum está aberta
    try {
      await this.checkEthereumApp();
    } catch (appError: any) {
      throw new Error(appError.message || 'Aplicação Ethereum não está aberta na Ledger');
    }

    try {
      // Carregar bibliotecas Ledger se necessário
      await loadLedgerLibs();
      
      // Converter mensagem para bytes usando ethers
      const messageBytes = ethers.toUtf8Bytes(message);
      
      // Criar hash da mensagem para assinatura personalizada
      const messageHash = ethers.keccak256(messageBytes);
      
      console.log('Assinando mensagem:', message);
      console.log('Hash da mensagem:', messageHash);
      
      // Verificar se ledgerApp está disponível
      if (!this.ledgerApp) {
        throw new Error('Aplicação Ledger não inicializada');
      }

      // Assinar com Ledger usando signPersonalMessage
      let result;
      try {
        result = await this.ledgerApp.signPersonalMessage(
          "44'/60'/0'/0/0",
          messageHash
        );
      } catch (signError: any) {
        console.error('Erro na assinatura:', signError);
        if (signError.message && signError.message.includes('User rejected')) {
          throw new Error('Assinatura cancelada pelo usuário na Ledger');
        } else if (signError.message && signError.message.includes('Device is locked')) {
          throw new Error('Ledger está bloqueada. Desbloqueie e tente novamente');
        } else {
          throw new Error(`Erro na assinatura: ${signError.message || 'Erro desconhecido'}`);
        }
      }
      
      // Verificar se o resultado tem a estrutura esperada
      if (!result) {
        throw new Error('Resposta vazia da Ledger');
      }
      
      if (!result.signature) {
        throw new Error('Assinatura não encontrada na resposta da Ledger');
      }
      
      // Verificar se a assinatura tem o formato correto
      if (typeof result.signature !== 'string' || result.signature.length === 0) {
        throw new Error('Assinatura inválida recebida da Ledger');
      }
      
      // Obter endereço da conta para validação
      const addressResult = await this.ledgerApp.getAddress("44'/60'/0'/0/0");
      
      console.log('Assinatura criada:', result.signature);
      console.log('Endereço:', addressResult.address);
      
      return {
        signature: result.signature,
        messageHash: messageHash,
        address: addressResult.address
      };
    } catch (error: any) {
      console.error('Erro ao assinar mensagem:', error);
      
      // Tratamento de erros específicos
      if (error.message && error.message.includes('User rejected')) {
        throw new Error('Assinatura cancelada pelo usuário na Ledger');
      } else if (error.message && error.message.includes('Device is locked')) {
        throw new Error('Ledger está bloqueada. Desbloqueie e tente novamente');
      } else if (error.message && error.message.includes('Transport')) {
        throw new Error('Erro de comunicação com a Ledger. Verifique a conexão');
      } else if (error.message && error.message.includes('Cannot read properties')) {
        throw new Error('Erro na comunicação com a Ledger. Tente reconectar');
      } else {
        throw new Error(`Falha ao assinar mensagem: ${error.message || 'Erro desconhecido'}`);
      }
    }
  }

  // Verificar assinatura de mensagem
  async verifyMessage(message: string, signature: string, expectedAddress: string): Promise<boolean> {
    try {
      // Recuperar endereço da assinatura
      const recoveredAddress = ethers.verifyMessage(message, signature);
      
      // Verificar se o endereço recuperado corresponde ao esperado
      return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error);
      return false;
    }
  }

  // Verificar se Ledger está disponível
  async isLedgerAvailable(): Promise<boolean> {
    try {
      await loadLedgerLibs();
      await TransportWebHID.isSupported();
      return true;
    } catch {
      try {
        await loadLedgerLibs();
        await TransportWebUSB.isSupported();
        return true;
      } catch {
        return false;
      }
    }
  }

  // Verificar se a conexão ainda está ativa
  async isConnectionActive(): Promise<boolean> {
    if (!this.ledgerApp || !this.transport) {
      return false;
    }

    try {
      // Tentar obter o endereço para verificar se a conexão ainda está ativa
      const result = await this.ledgerApp.getAddress("44'/60'/0'/0/0");
      return result && result.address && result.address.length > 0;
    } catch (error) {
      console.log('Conexão inativa:', error);
      return false;
    }
  }

  // Verificar se a aplicação Ethereum está aberta na Ledger
  async checkEthereumApp(): Promise<boolean> {
    if (!this.ledgerApp) {
      return false;
    }

    try {
      // Tentar uma operação simples para verificar se a app está aberta
      await this.ledgerApp.getAppConfiguration();
      return true;
    } catch (error: any) {
      console.log('Aplicação Ethereum não está aberta:', error);
      if (error.message && error.message.includes('0x6d00')) {
        throw new Error('Aplicação Ethereum não está aberta na Ledger. Abra a aplicação e tente novamente.');
      }
      return false;
    }
  }

  // Reconectar se necessário
  async reconnectIfNeeded(): Promise<boolean> {
    if (await this.isConnectionActive()) {
      return true;
    }

    try {
      console.log('Tentando reconectar...');
      
      // Limpar estado anterior completamente
      if (this.transport) {
        try {
          await this.transport.close();
        } catch (e) {
          console.log('Erro ao fechar transporte anterior:', e);
        }
        this.transport = null;
      }
      
      this.ledgerApp = null;
      
      // Reconectar
      await this.connectLedger();
      return true;
    } catch (error) {
      console.error('Falha ao reconectar:', error);
      return false;
    }
  }
}

// Instância singleton
export const blockchainService = new BlockchainService();
