import { reactive } from 'vue';
import { walletStore } from './wallet';
import { ethers } from 'ethers';

interface MessageSigningState {
  isLoading: boolean;
  lastSignature: string | null;
  signatureHistory: SignatureHistoryItem[];
  error: string | null;
}

interface SignatureHistoryItem {
  id: string;
  message: string;
  signature: string;
  hash: string;
  address: string;
  timestamp: number;
  verified: boolean;
}

interface SignMessageResult {
  signature: string;
  messageHash: string;
  signerAddress: string;
  verified: boolean;
}

export const messageSigningStore = reactive<MessageSigningState>({
  isLoading: false,
  lastSignature: null,
  signatureHistory: [],
  error: null
});

/**
 * Assina uma mensagem usando a wallet conectada
 */
export async function signMessage(
  message: string,
  useEIP191: boolean = true
): Promise<SignMessageResult> {
  if (walletStore.status !== 'connected' || !walletStore.wallet?.address) {
    throw new Error('Wallet não está conectada');
  }

  messageSigningStore.isLoading = true;
  messageSigningStore.error = null;

  try {
    let messageToSign = message;
    let messageHash: string;

    // Aplicar padrão EIP-191 se solicitado
    if (useEIP191) {
      // Prefixo padrão do Ethereum para mensagens assinadas
      const prefix = "\x19Ethereum Signed Message:\n";
      messageToSign = prefix + message.length + message;
      messageHash = ethers.keccak256(ethers.toUtf8Bytes(messageToSign));
    } else {
      messageHash = ethers.keccak256(ethers.toUtf8Bytes(message));
    }

    // Obter o serviço de wallet atual
    const { walletService } = await import('../services');
    if (!walletService) {
      throw new Error('Serviço de wallet não disponível');
    }

    // Assinar a mensagem
    const signature = await walletService.signMessage(message, useEIP191);

    // Verificar a assinatura
    let verified = false;
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      verified = recoveredAddress.toLowerCase() === walletStore.wallet?.address?.toLowerCase();
    } catch (verifyError) {
      console.warn('Erro na verificação da assinatura:', verifyError);
      verified = false;
    }

    const result: SignMessageResult = {
      signature,
      messageHash,
      signerAddress: walletStore.wallet.address!,
      verified
    };

    // Salvar no histórico
    const historyItem: SignatureHistoryItem = {
      id: Date.now().toString(),
      message,
      signature,
      hash: messageHash,
      address: walletStore.wallet.address!,
      timestamp: Date.now(),
      verified
    };

    addToHistory(historyItem);

    messageSigningStore.lastSignature = signature;
    return result;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao assinar mensagem';
    messageSigningStore.error = errorMessage;
    throw errorMessage;
  } finally {
    messageSigningStore.isLoading = false;
  }
}

/**
 * Verifica uma assinatura
 */
export function verifySignature(
  message: string,
  signature: string,
  expectedAddress?: string
): { isValid: boolean; recoveredAddress: string; error?: string } {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);

    const isValid = expectedAddress
      ? recoveredAddress.toLowerCase() === expectedAddress.toLowerCase()
      : true;

    return {
      isValid,
      recoveredAddress
    };
  } catch (error) {
    return {
      isValid: false,
      recoveredAddress: '',
      error: error instanceof Error ? error.message : 'Erro na verificação'
    };
  }
}

/**
 * Adiciona item ao histórico
 */
function addToHistory(item: SignatureHistoryItem) {
  // Adicionar no início do array
  messageSigningStore.signatureHistory.unshift(item);

  // Manter apenas os últimos 50 itens
  if (messageSigningStore.signatureHistory.length > 50) {
    messageSigningStore.signatureHistory = messageSigningStore.signatureHistory.slice(0, 50);
  }

  // Salvar no localStorage
  saveHistoryToStorage();
}

/**
 * Remove item do histórico
 */
export function removeFromHistory(id: string) {
  const index = messageSigningStore.signatureHistory.findIndex(item => item.id === id);
  if (index !== -1) {
    messageSigningStore.signatureHistory.splice(index, 1);
    saveHistoryToStorage();
  }
}

/**
 * Limpa todo o histórico
 */
export function clearHistory() {
  messageSigningStore.signatureHistory = [];
  saveHistoryToStorage();
}

/**
 * Carrega histórico do localStorage
 */
export function loadHistoryFromStorage() {
  try {
    const stored = localStorage.getItem('message-signing-history');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        messageSigningStore.signatureHistory = parsed;
      }
    }
  } catch (error) {
    console.warn('Erro ao carregar histórico do localStorage:', error);
  }
}

/**
 * Salva histórico no localStorage
 */
function saveHistoryToStorage() {
  try {
    localStorage.setItem(
      'message-signing-history',
      JSON.stringify(messageSigningStore.signatureHistory)
    );
  } catch (error) {
    console.warn('Erro ao salvar histórico no localStorage:', error);
  }
}

/**
 * Exporta assinatura como JSON
 */
export function exportSignature(item: SignatureHistoryItem): string {
  const exportData = {
    message: item.message,
    signature: item.signature,
    messageHash: item.hash,
    signerAddress: item.address,
    timestamp: item.timestamp,
    verified: item.verified,
    exportedAt: new Date().toISOString()
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Cria link para verificação externa (como Etherscan)
 */
export function createVerificationLink(signature: string, message: string): string {
  const params = new URLSearchParams({
    message,
    signature
  });

  // Link genérico para verificação - pode ser customizado
  return `https://etherscan.io/verifySig?${params.toString()}`;
}

/**
 * Formata assinatura para exibição
 */
export function formatSignature(signature: string, length: number = 20): string {
  if (signature.length <= length * 2) {
    return signature;
  }

  return `${signature.substring(0, length)}...${signature.substring(signature.length - length)}`;
}

/**
 * Formata hash para exibição
 */
export function formatHash(hash: string, length: number = 16): string {
  if (hash.length <= length * 2) {
    return hash;
  }

  return `${hash.substring(0, length)}...${hash.substring(hash.length - length)}`;
}

/**
 * Copia texto para área de transferência
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback para navegadores mais antigos
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.error('Erro ao copiar para área de transferência:', error);
    return false;
  }
}

/**
 * Limpa estado da store
 */
export function resetMessageSigningState() {
  messageSigningStore.isLoading = false;
  messageSigningStore.lastSignature = null;
  messageSigningStore.error = null;
}

/**
 * Inicializa a store carregando dados salvos
 */
export function initMessageSigningStore() {
  loadHistoryFromStorage();
}

// Carregar dados ao importar a store
initMessageSigningStore();
