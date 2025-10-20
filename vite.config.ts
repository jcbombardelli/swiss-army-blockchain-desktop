import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import fs from 'fs';
import path from 'path';

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// @ts-expect-error process is a nodejs global
const https = process.env.HTTPS === 'true';

// Função para configurar HTTPS
function getHttpsConfig() {
  const keyPath = path.resolve(__dirname, 'certs/localhost-key.pem');
  const certPath = path.resolve(__dirname, 'certs/localhost.pem');

  // Verificar se os certificados existem
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    return {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
  }

  // Fallback para certificado auto-assinado básico
  console.warn('⚠️  Certificados HTTPS não encontrados em ./certs/');
  console.warn('   Execute o script de geração de certificados ou use mkcert');
  return true; // Vite gerará certificado temporário
}

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [vue()],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    https: https ? getHttpsConfig() : false,
    hmr: host
      ? {
          protocol: https ? "wss" : "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
