import { ref, reactive } from 'vue';

// Função para obter o invoke do Tauri de forma segura
const getTauriInvoke = async () => {
  try {
    // Verifica se estamos no contexto Tauri
    if (typeof window !== 'undefined' && '__TAURI__' in window) {
      const { invoke } = await import('@tauri-apps/api/core');
      return invoke;
    }
    return null;
  } catch (error) {
    console.warn('Tauri não está disponível:', error);
    return null;
  }
};

export interface NetworkConfig {
  name: string;
  rpcUrl: string;
  chainId: number;
  symbol: string;
  blockExplorer?: string;
}

export interface AppSettings {
  selectedNetwork: NetworkConfig;
  autoConnect: boolean;
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
}

const defaultNetworks: NetworkConfig[] = [
  {
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
    chainId: 1,
    symbol: 'ETH',
    blockExplorer: 'https://etherscan.io'
  },
  {
    name: 'Ethereum Sepolia',
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID',
    chainId: 11155111,
    symbol: 'ETH',
    blockExplorer: 'https://sepolia.etherscan.io'
  },
  {
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    chainId: 137,
    symbol: 'MATIC',
    blockExplorer: 'https://polygonscan.com'
  }
];

export const settingsStore = reactive<AppSettings>({
  selectedNetwork: defaultNetworks[1], // Sepolia como padrão
  autoConnect: false,
  theme: 'auto',
  notifications: true
});

export const availableNetworks = ref<NetworkConfig[]>(defaultNetworks);

export const saveSettings = async () => {
  try {
    const invoke = await getTauriInvoke();
    if (invoke) {
      await invoke('save_app_settings', { settings: settingsStore });
      console.log('Configurações salvas com sucesso');
    } else {
      // Salvar no localStorage quando Tauri não estiver disponível
      localStorage.setItem('app_settings', JSON.stringify(settingsStore));
      console.log('Configurações salvas no localStorage');
    }
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    // Fallback para localStorage
    try {
      localStorage.setItem('app_settings', JSON.stringify(settingsStore));
      console.log('Configurações salvas no localStorage como fallback');
    } catch (storageError) {
      console.error('Erro ao salvar no localStorage:', storageError);
      throw error;
    }
  }
};

export const loadSettings = async () => {
  try {
    const invoke = await getTauriInvoke();
    if (invoke) {
      const saved = await invoke<AppSettings>('load_app_settings');
      if (saved) {
        Object.assign(settingsStore, saved);
      }
    } else {
      // Carregar do localStorage quando Tauri não estiver disponível
      const saved = localStorage.getItem('app_settings');
      if (saved) {
        const parsedSettings = JSON.parse(saved) as AppSettings;
        Object.assign(settingsStore, parsedSettings);
        console.log('Configurações carregadas do localStorage');
      }
    }
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
    // Fallback para localStorage
    try {
      const saved = localStorage.getItem('app_settings');
      if (saved) {
        const parsedSettings = JSON.parse(saved) as AppSettings;
        Object.assign(settingsStore, parsedSettings);
        console.log('Configurações carregadas do localStorage como fallback');
      }
    } catch (storageError) {
      console.error('Erro ao carregar do localStorage:', storageError);
    }
    // Usar configurações padrão se houver erro
  }
};

export const updateNetwork = (network: NetworkConfig) => {
  settingsStore.selectedNetwork = network;
  saveSettings();
};

export const addCustomNetwork = (network: NetworkConfig) => {
  availableNetworks.value.push(network);
  // Opcionalmente salvar redes customizadas
};

export const removeCustomNetwork = (chainId: number) => {
  const index = availableNetworks.value.findIndex(n => n.chainId === chainId);
  if (index > -1) {
    availableNetworks.value.splice(index, 1);
  }
};

export const applyTheme = (theme: 'light' | 'dark' | 'auto') => {
  try {
    const root = document.documentElement;

    if (theme === 'auto') {
      // Detectar preferência do sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');

      // Adicionar listener para mudanças na preferência do sistema
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        if (settingsStore.theme === 'auto') {
          root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
          updateThemeClasses(e.matches ? 'dark' : 'light');
        }
      };

      // Remover listener anterior se existir
      mediaQuery.removeEventListener('change', handleChange);
      // Adicionar novo listener
      mediaQuery.addEventListener('change', handleChange);

      updateThemeClasses(prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', theme);
      updateThemeClasses(theme);
    }

    console.log(`Tema aplicado: ${theme}`);
  } catch (error) {
    console.error('Erro ao aplicar tema:', error);
  }
};

const updateThemeClasses = (appliedTheme: 'light' | 'dark') => {
  const root = document.documentElement;
  // Aplicar classes CSS se necessário
  if (appliedTheme === 'dark') {
    root.classList.add('dark-theme');
    root.classList.remove('light-theme');
  } else {
    root.classList.add('light-theme');
    root.classList.remove('dark-theme');
  }
};
