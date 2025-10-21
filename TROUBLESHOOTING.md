# 🔧 Guia de Solução de Problemas - Swiss Army Blockchain

## 🚨 Problemas Comuns com Ledger

### ❌ "Erro na comunicação com a Ledger. Tente reconectar"

**Possíveis Causas:**
1. Ledger desconectada ou bloqueada
2. Aplicação Ethereum não está aberta na Ledger
3. Problema de driver USB
4. Conflito com outras aplicações

**Soluções:**

#### 1. **Verificar Ledger**
- ✅ Ledger está desbloqueada?
- ✅ Cabo USB está bem conectado?
- ✅ Ledger está ligada?

#### 2. **Abrir Aplicação Ethereum**
- ✅ Navegue até a aplicação "Ethereum" na Ledger
- ✅ Abra a aplicação (não apenas navegue)
- ✅ Aguarde a tela "Application is ready"

#### 3. **Reconectar**
- ✅ Clique no botão "Reconectar" na aplicação
- ✅ Ou desconecte e conecte novamente
- ✅ Tente um cabo USB diferente

#### 4. **Reiniciar Aplicação**
- ✅ Feche a aplicação desktop
- ✅ Desconecte a Ledger
- ✅ Reconecte a Ledger
- ✅ Abra a aplicação novamente

### ❌ "Cannot read properties of undefined" ou "Cannot read properties of undefined (reading '0')"

**Causa:** Problema na comunicação com a Ledger ou aplicação Ethereum não está aberta

**Soluções:**
1. **Usar Diagnóstico Automático**
   - Vá em Configurações
   - Clique em "🔍 Executar Diagnóstico"
   - Siga as soluções específicas mostradas

2. **Verificar Aplicação Ethereum**
   - Abra a aplicação "Ethereum" na Ledger
   - Aguarde a tela "Application is ready"
   - Não apenas navegue, mas abra a aplicação

3. **Reconectar Ledger**
   - Clique em "Reconectar" na interface
   - Ou desconecte e reconecte fisicamente
   - Aguarde a reconexão completar

4. **Verificar Estado da Ledger**
   - Ledger deve estar desbloqueada
   - Cabo USB bem conectado
   - Aplicação Ethereum realmente aberta

### ❌ "Ledger não está disponível neste navegador"

**Causa:** Navegador não suporta WebHID/WebUSB

**Soluções:**
1. **Usar Chrome/Edge**
   - Chrome 89+ ou Edge 89+
   - Firefox não suporta WebHID

2. **Habilitar Flags**
   - Chrome: `chrome://flags/#enable-experimental-web-platform-features`
   - Edge: `edge://flags/#enable-experimental-web-platform-features`

3. **HTTPS/Localhost**
   - Aplicação deve rodar em HTTPS ou localhost
   - Tauri já fornece isso automaticamente

### ❌ "User rejected" ou "Assinatura cancelada"

**Causa:** Usuário cancelou na Ledger

**Soluções:**
1. **Confirmar na Ledger**
   - Verifique a tela da Ledger
   - Pressione o botão direito para confirmar
   - Não cancele com o botão esquerdo

2. **Verificar Transação**
   - Confirme os detalhes na tela da Ledger
   - Verifique o endereço de destino
   - Confirme o valor

### ❌ "Device is locked"

**Causa:** Ledger está bloqueada

**Soluções:**
1. **Desbloquear Ledger**
   - Digite o PIN na Ledger
   - Aguarde a tela inicial

2. **Abrir Aplicação**
   - Navegue até Ethereum
   - Abra a aplicação
   - Aguarde "Application is ready"

## 🔍 Diagnóstico Avançado

### 1. Verificar Console
Abra o DevTools (F12) e verifique:
```javascript
// Deve mostrar:
"Polyfills loaded successfully"
"Buffer available: true"
"Tentando conectar via WebHID..."
"Conectado via WebHID"
```

### 2. Testar Conexão
```javascript
// No console do navegador:
const { blockchainService } = await import('./src/services/blockchain.ts');
const isAvailable = await blockchainService.isLedgerAvailable();
console.log('Ledger disponível:', isAvailable);
```

### 3. Verificar Status
```javascript
// Verificar se está conectado:
const isActive = await blockchainService.isConnectionActive();
console.log('Conexão ativa:', isActive);
```

## 🛠️ Soluções por Sistema Operacional

### Windows
1. **Instalar Ledger Live**
   - Baixe do site oficial
   - Instale os drivers USB

2. **Verificar Dispositivos**
   - Painel de Controle > Dispositivos
   - Verificar se Ledger aparece

3. **Permissões USB**
   - Executar como Administrador
   - Verificar antivírus

### macOS
1. **Permissões de Segurança**
   - Sistema > Segurança e Privacidade
   - Permitir aplicações de desenvolvedores

2. **Ledger Live**
   - Instalar Ledger Live
   - Conectar Ledger pelo Live primeiro

### Linux
1. **Regras USB**
   ```bash
   sudo nano /etc/udev/rules.d/20-hw1.rules
   ```
   Adicionar:
   ```
   SUBSYSTEM=="usb", ATTRS{idVendor}=="2c97", MODE="0666"
   ```

2. **Reiniciar Serviços**
   ```bash
   sudo udevadm control --reload-rules
   sudo udevadm trigger
   ```

## 📞 Suporte Adicional

### Logs Úteis
- Console do navegador (F12)
- Logs da aplicação Tauri
- Logs do Ledger Live

### Informações para Suporte
- Sistema operacional
- Versão do navegador
- Modelo da Ledger (Nano S/X)
- Versão do firmware
- Logs de erro completos

### Contatos
- GitHub Issues: [Link do repositório]
- Ledger Support: [support.ledger.com]
- Documentação: [docs.ledger.com]

---

**💡 Dica:** Sempre mantenha sua Ledger atualizada com o firmware mais recente!
