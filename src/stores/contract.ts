import { reactive } from 'vue';
import { invoke } from '@tauri-apps/api/core';
import type { ERC20Contract, ContractDeployment, DeploymentResult } from '../types/contract';

export const contractStore = reactive({
  currentContract: {
    name: '',
    symbol: '',
    decimals: 18
  } as ERC20Contract,
  deployment: null as ContractDeployment | null,
  isDeploying: false,
  deploymentHistory: [] as ContractDeployment[]
});

export const publishContract = async (contract: ERC20Contract): Promise<DeploymentResult> => {
  try {
    contractStore.isDeploying = true;
    contractStore.deployment = {
      status: 'pending'
    };

    // Chama o comando Rust para publicar o contrato
    const result = await invoke<DeploymentResult>('publish_erc20_contract', {
      contract
    });

    if (result.success && result.contractAddress) {
      contractStore.deployment = {
        contractAddress: result.contractAddress,
        transactionHash: result.transactionHash,
        status: 'confirmed'
      };

      // Adiciona ao histórico
      contractStore.deploymentHistory.unshift({
        ...contractStore.deployment,
        blockNumber: 0 // Será preenchido posteriormente
      });
    } else {
      contractStore.deployment = {
        status: 'failed',
        error: result.error
      };
    }

    return result;
  } catch (error) {
    const errorMessage = error as string;
    contractStore.deployment = {
      status: 'failed',
      error: errorMessage
    };

    return {
      success: false,
      error: errorMessage
    };
  } finally {
    contractStore.isDeploying = false;
  }
};

export const resetContract = () => {
  contractStore.currentContract = {
    name: '',
    symbol: '',
    decimals: 18
  };
  contractStore.deployment = null;
};

export const validateContractData = (contract: ERC20Contract): string[] => {
  const errors: string[] = [];

  if (!contract.name.trim()) {
    errors.push('Nome do contrato é obrigatório');
  }

  if (!contract.symbol.trim()) {
    errors.push('Símbolo do contrato é obrigatório');
  }

  if (contract.symbol.length > 10) {
    errors.push('Símbolo deve ter no máximo 10 caracteres');
  }

  if (contract.decimals !== 18) {
    errors.push('Casas decimais devem ser 18');
  }

  return errors;
};
