# Swiss Army Blockchain Desktop

Uma aplicação desktop construída com Tauri e Vue.js para interação com blockchain através de hardwallets como Ledger Nano.

## 🚀 Funcionalidades

### ✅ Implementadas

- **Interface Metro UI Moderna**: Design baseado no Microsoft Fluent Design
- **Conexão com Ledger Nano**: Suporte completo para hardwallets
- **Deploy de Contratos ERC-20**: Criação de tokens personalizados
- **Assinatura de Mensagens**: Assinatura de mensagens arbitrárias com verificação
- **Configurações Avançadas**: Múltiplas redes blockchain (Polygon como padrão)
- **Sistema de Configurações Salvas**: Persistência de configurações no localStorage
- **Exportação/Importação**: Backup e restauração de configurações
- **Responsividade**: Interface adaptável para diferentes tamanhos

### 🔧 Tecnologias Utilizadas

- **Frontend**: Vue.js 3 + TypeScript
- **Desktop**: Tauri 2.0
- **Blockchain**: Ethers.js v6
- **Hardwallet**: Ledger Live SDK
- **Styling**: CSS Custom Properties (Metro UI)

## 📋 Pré-requisitos

### Hardware
- **Ledger Nano S/X**: Para assinatura de transações
- **Cabo USB**: Para conectar a Ledger ao computador

### Software
- **Node.js**: v18+ 
- **pnpm**: Gerenciador de pacotes
- **Rust**: Para compilação do Tauri
- **Ledger Live**: Para gerenciamento da wallet

## 🛠️ Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd swiss-army-blockchain-desktop
```

2. **Instale as dependências**
```bash
pnpm install
```

3. **Execute em modo desenvolvimento**
```bash
pnpm run tauri dev
```

4. **Build para produção**
```bash
pnpm run tauri build
```

## 🎯 Como Usar

### 1. Conectar Ledger Nano

1. Conecte sua Ledger Nano ao computador via USB
2. Abra a aplicação
3. Clique em "Conectar Hardwallet"
4. Autorize a conexão na Ledger
5. A aplicação mostrará seu endereço e saldo

### 2. Criar Token ERC-20

1. Na tela principal, clique em "Criar Contrato ERC-20"
2. Preencha os campos:
   - **Nome do Token**: Ex: "Meu Token"
   - **Símbolo**: Ex: "MTK"
   - **Decimais**: Padrão 18
   - **Supply Inicial**: Quantidade total de tokens
3. Clique em "Deploy Contrato"
4. Confirme a transação na Ledger
5. Aguarde a confirmação na blockchain

### 3. Assinar Mensagem

1. Na tela principal, clique em "Assinar Mensagem"
2. Digite sua mensagem no campo de texto
3. Clique em "Assinar Mensagem"
4. Confirme a assinatura na Ledger
5. A assinatura será exibida na tela

### 4. Configurações

1. Na tela principal, clique em "Configurações"
2. Configure:
   - **Rede Blockchain**: Ethereum, Polygon, BSC, Arbitrum
   - **RPC Endpoint**: Para redes personalizadas
   - **Gas Price**: Preço do gas em Gwei
   - **Auto-confirmação**: Pular confirmações manuais

## 🌐 Redes Suportadas

| Rede | Chain ID | RPC | Explorer |
|------|----------|-----|----------|
| Ethereum | 1 | Infura/Alchemy | Etherscan |
| Polygon | 137 | Polygon RPC | Polygonscan |
| BSC | 56 | BSC RPC | BSCscan |
| Arbitrum | 42161 | Arbitrum RPC | Arbiscan |

## 🔒 Segurança

- **Chaves Privadas**: Nunca saem da Ledger
- **Assinatura Offline**: Transações são assinadas no dispositivo
- **Verificação Visual**: Sempre confirme transações na tela da Ledger
- **Backup**: Mantenha backup da seed phrase da Ledger

## 🐛 Solução de Problemas

### Ledger não conecta
- Verifique se a Ledger está desbloqueada
- Confirme que a aplicação Ethereum está aberta na Ledger
- Teste com outro cabo USB
- Reinicie a aplicação

### Transação falha
- Verifique se tem ETH suficiente para gas
- Ajuste o gas price nas configurações
- Confirme que está na rede correta
- Verifique se a transação não foi cancelada na Ledger

### Erro de rede
- Verifique sua conexão com a internet
- Teste com outro RPC endpoint
- Confirme se a rede está funcionando

## 📁 Estrutura do Projeto

```
src/
├── App.vue              # Componente principal
├── main.ts              # Ponto de entrada
├── services/
│   └── blockchain.ts    # Serviço de blockchain
└── contracts/
    ├── ERC20Token.sol   # Contrato Solidity
    └── ERC20Token.json  # Bytecode compilado
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## ⚠️ Avisos Importantes

- **Testnet First**: Sempre teste em redes de teste antes da mainnet
- **Backup**: Mantenha backup seguro da seed phrase
- **Verificação**: Sempre verifique endereços e valores antes de confirmar
- **Atualizações**: Mantenha a Ledger Live e firmware atualizados

## 📞 Suporte

Para suporte e dúvidas:
- Abra uma issue no GitHub
- Consulte a documentação da Ledger
- Verifique os logs da aplicação (F12 no navegador)

---

**Desenvolvido com ❤️ para a comunidade blockchain**