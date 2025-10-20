# ERC-20 Contract Manager

Uma aplicação Tauri para criação e publicação de smart contracts ERC-20 com integração de hardware wallets.

## 🚀 Funcionalidades

- **Interface Metro UI**: Menu principal estilo Windows Metro
- **Criação de Contratos ERC-20**: Formulário intuitivo para criar contratos
- **Hardware Wallet Support**: Integração com Ledger Nano (extensível para outras wallets)
- **Conexão USB Híbrida**:
  - 🚀 **Tauri (Nativo)**: Acesso completo aos dispositivos USB
  - 🌐 **Web USB (Browser)**: Fallback para ambiente web (limitado)
  - 🔄 **Detecção Automática**: Seleciona automaticamente o melhor método
- **Multi-rede**: Suporte para Ethereum, Polygon e outras redes
- **Configurações**: Tela completa de configurações da aplicação

## 🛠️ Instalação

1. **Instalar dependências** (recomendado - pnpm):
```bash
pnpm install
```

Ou usar npm como alternativa:
```bash
npm install
```

2. **Executar em modo desenvolvimento**:

**Como aplicação nativa (recomendado):**
```bash
pnpm run tauri dev
```

**Como aplicação web (fallback):**
```bash
pnpm run dev
```

## 🔄 **Conexão USB Híbrida**

A aplicação detecta automaticamente o ambiente e escolhe o melhor método de conexão:

### 🚀 **Tauri (Aplicação Nativa)**
- ✅ Acesso completo aos dispositivos USB
- ✅ Comunicação direta com hardware wallets
- ✅ Maior segurança e performance
- ✅ Funciona offline

### 🌐 **Web USB (Browser)**
- ⚠️ Funciona apenas em **HTTPS**
- ⚠️ Suporte limitado a tipos específicos de dispositivos
- ⚠️ Requer permissão manual do usuário
- ⚠️ Disponível apenas em navegadores compatíveis

### 🔍 **Detecção Automática**
A aplicação exibe uma notificação indicando qual método está sendo usado.

Ou com npm:
```bash
npm run tauri dev
```

## 📋 Próximos Passos - Backend Rust

1. **Comandos Tauri necessários**:
   - `connect_ledger()` - Conectar com Ledger Nano
   - `disconnect_wallet()` - Desconectar wallet
   - `detect_usb_devices()` - Detectar dispositivos USB
   - `publish_erc20_contract(contract)` - Publicar contrato
   - `get_wallet_info(address)` - Obter informações da wallet

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
