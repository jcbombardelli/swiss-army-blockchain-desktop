# Configuração do Tauri - Guia de Solução

## Problema Identificado
O erro `linker link.exe not found` indica que o Visual Studio Build Tools não está instalado.

## Soluções:

### Opção 1: Instalar Visual Studio Build Tools (Recomendado)
1. Baixe o Visual Studio Installer: https://visualstudio.microsoft.com/downloads/
2. Instale o "Build Tools for Visual Studio 2022"
3. Durante a instalação, certifique-se de selecionar:
   - ✅ C++ build tools
   - ✅ Windows 10/11 SDK
   - ✅ MSVC v143 - VS 2022 C++ x64/x86 build tools

### Opção 2: Instalar Visual Studio Community (Completo)
1. Baixe o Visual Studio Community (gratuito)
2. Durante a instalação, selecione:
   - ✅ Desktop development with C++
   - ✅ Windows SDK

### Opção 3: Usar winget (se disponível)
```cmd
winget install Microsoft.VisualStudio.2022.BuildTools
```

### Opção 4: Usar rustup para instalar toolchain GNU (Alternativa)
```cmd
rustup toolchain install stable-x86_64-pc-windows-gnu
rustup default stable-x86_64-pc-windows-gnu
```

## Após a instalação:
1. Reinicie o terminal/VS Code
2. Execute: `pnpm dev-tauri`

## Verificar se está funcionando:
```cmd
rustc --version
cargo --version
```

## Scripts disponíveis:
- `pnpm dev` - Modo web (sem hardware wallets)
- `pnpm dev-tauri` - Modo Tauri (com hardware wallets)
- `pnpm build-tauri` - Build para produção
