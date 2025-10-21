// Interface para configurações da aplicação
export interface AppSettings {
  network: string;
  rpcEndpoint: string;
  gasPrice: string;
  autoConfirm: boolean;
  walletAddress: string;
  lastConnected: number;
}

// Configurações padrão
const DEFAULT_SETTINGS: AppSettings = {
  network: 'polygon',
  rpcEndpoint: 'https://polygon-rpc.com',
  gasPrice: '20',
  autoConfirm: false,
  walletAddress: '',
  lastConnected: 0
};

// Chave para localStorage
const SETTINGS_KEY = 'swiss-army-blockchain-settings';

// Classe para gerenciar configurações
export class SettingsService {
  private settings: AppSettings = { ...DEFAULT_SETTINGS };

  constructor() {
    this.loadSettings();
  }

  // Carregar configurações do localStorage
  loadSettings(): void {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.settings = { ...DEFAULT_SETTINGS, ...parsed };
        console.log('Configurações carregadas:', this.settings);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      this.settings = { ...DEFAULT_SETTINGS };
    }
  }

  // Salvar configurações no localStorage
  saveSettings(): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
      console.log('Configurações salvas:', this.settings);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  }

  // Obter todas as configurações
  getSettings(): AppSettings {
    return { ...this.settings };
  }

  // Atualizar uma configuração específica
  updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
    this.settings[key] = value;
    this.saveSettings();
  }

  // Atualizar múltiplas configurações
  updateSettings(updates: Partial<AppSettings>): void {
    this.settings = { ...this.settings, ...updates };
    this.saveSettings();
  }

  // Obter uma configuração específica
  getSetting<K extends keyof AppSettings>(key: K): AppSettings[K] {
    return this.settings[key];
  }

  // Resetar para configurações padrão
  resetSettings(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    this.saveSettings();
  }

  // Exportar configurações
  exportSettings(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  // Importar configurações
  importSettings(jsonString: string): boolean {
    try {
      const imported = JSON.parse(jsonString);
      this.settings = { ...DEFAULT_SETTINGS, ...imported };
      this.saveSettings();
      return true;
    } catch (error) {
      console.error('Erro ao importar configurações:', error);
      return false;
    }
  }

  // Limpar todas as configurações
  clearSettings(): void {
    try {
      localStorage.removeItem(SETTINGS_KEY);
      this.settings = { ...DEFAULT_SETTINGS };
      console.log('Configurações limpas');
    } catch (error) {
      console.error('Erro ao limpar configurações:', error);
    }
  }

  // Verificar se há configurações salvas
  hasSettings(): boolean {
    return localStorage.getItem(SETTINGS_KEY) !== null;
  }

  // Obter informações sobre as configurações
  getSettingsInfo(): {
    hasSettings: boolean;
    lastModified: number;
    size: number;
  } {
    const hasSettings = this.hasSettings();
    const item = localStorage.getItem(SETTINGS_KEY);
    const size = item ? item.length : 0;
    
    return {
      hasSettings,
      lastModified: this.settings.lastConnected,
      size
    };
  }
}

// Instância singleton
export const settingsService = new SettingsService();
