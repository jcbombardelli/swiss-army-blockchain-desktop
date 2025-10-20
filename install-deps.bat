@echo off
echo Instalando dependencias do ERC-20 Contract Manager...
echo.

REM Limpar cache e node_modules se existir
if exist node_modules (
    echo Removendo node_modules existente...
    rmdir /s /q node_modules
)

if exist .pnpm-cache (
    echo Limpando cache do pnpm...
    rmdir /s /q .pnpm-cache
)

echo Instalando dependencias com pnpm...
call pnpm install

if %errorlevel% neq 0 (
    echo.
    echo Erro na instalacao das dependencias!
    echo Tentando instalacao com npm como fallback...
    call npm install --legacy-peer-deps
)

echo.
echo Instalacao concluida!
echo.
echo Para executar a aplicacao:
echo   pnpm run tauri dev
echo.
echo Ou como fallback:
echo   npm run tauri dev
echo.
pause
