export interface ERC20Contract {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply?: string;
}

export interface ContractDeployment {
  contractAddress?: string;
  transactionHash?: string;
  blockNumber?: number;
  status: 'pending' | 'confirmed' | 'failed';
  error?: string;
}

export interface DeploymentResult {
  success: boolean;
  contractAddress?: string;
  transactionHash?: string;
  error?: string;
}
