# Configuração HTTPS Local

## Métodos Disponíveis

### 1. Modo Básico (Certificado Temporário do Vite)
```bash
pnpm dev-https
```
- ✅ Mais fácil de usar
- ⚠️ Navegador mostrará aviso de certificado não confiável
- ⚠️ Certificado regenerado a cada reinicialização

### 2. Certificados Locais Confiáveis (Recomendado)

#### Opção A: Usando mkcert (Recomendado)
1. **Instalar mkcert:**
   ```bash
   # Via Chocolatey
   choco install mkcert

   # Via Scoop
   scoop install mkcert

   # Ou baixe de: https://github.com/FiloSottile/mkcert/releases
   ```

2. **Configurar CA local:**
   ```bash
   mkcert -install
   ```

3. **Gerar certificados:**
   ```bash
   pnpm generate-certs
   ```

4. **Executar com HTTPS:**
   ```bash
   pnpm dev-https        # Modo web
   pnpm dev-tauri-https  # Modo Tauri
   ```

#### Opção B: Usando OpenSSL
1. **Instalar OpenSSL:**
   - Download: https://slproweb.com/products/Win32OpenSSL.html
   - Adicionar ao PATH do sistema

2. **Gerar certificados:**
   ```bash
   pnpm generate-certs
   ```

3. **Executar com HTTPS:**
   ```bash
   pnpm dev-https
   ```

### 3. Configuração Manual

#### Criar certificados manualmente:
```bash
# Criar diretório
mkdir certs

# Gerar chave privada
openssl genrsa -out certs/localhost-key.pem 2048

# Gerar certificado
openssl req -new -x509 -key certs/localhost-key.pem -out certs/localhost.pem -days 365 -subj "/C=BR/ST=Local/L=Local/O=Dev/OU=Dev/CN=localhost"
```

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Modo web HTTP padrão |
| `pnpm dev-https` | Modo web com HTTPS |
| `pnpm dev-tauri` | Modo Tauri HTTP |
| `pnpm dev-tauri-https` | Modo Tauri com HTTPS |
| `pnpm generate-certs` | Gerar certificados locais |
| `pnpm preview-https` | Preview build com HTTPS |

## Configuração do Tauri para HTTPS

Se usar HTTPS, atualize `src-tauri/tauri.conf.json`:

```json
{
  "build": {
    "beforeDevCommand": "pnpm dev-https",
    "devUrl": "https://localhost:1420"
  }
}
```

## Resolução de Problemas

### ❌ "NET::ERR_CERT_AUTHORITY_INVALID"
- **Causa:** Certificado não confiável
- **Solução:** Use mkcert ou aceite o certificado no navegador

### ❌ "Error: ENOENT: no such file or directory"
- **Causa:** Certificados não encontrados
- **Solução:** Execute `pnpm generate-certs`

### ❌ "Port 1420 is already in use"
- **Causa:** Porta ocupada
- **Solução:** Pare outros servidores ou mude a porta no vite.config.ts

### ❌ Erro ao gerar certificados
- **Causa:** OpenSSL/mkcert não instalado
- **Solução:** Instale uma das ferramentas ou use modo básico

## Benefícios do HTTPS Local

- ✅ Testa recursos que exigem HTTPS (Service Workers, Web Crypto API)
- ✅ Simula ambiente de produção
- ✅ Evita mixed content warnings
- ✅ Permite testar PWA features
- ✅ Necessário para hardware wallets em alguns casos

## URLs de Acesso

- **HTTP:** http://localhost:1420
- **HTTPS:** https://localhost:1420

## Notas de Segurança

- Certificados locais são apenas para desenvolvimento
- Nunca use certificados de desenvolvimento em produção
- Os certificados gerados expiram em 365 dias
