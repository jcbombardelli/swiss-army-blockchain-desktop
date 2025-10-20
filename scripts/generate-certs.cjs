const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const certsDir = path.join(__dirname, '..', 'certs');

// Criar diretório de certificados se não existir
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
}

const keyPath = path.join(certsDir, 'localhost-key.pem');
const certPath = path.join(certsDir, 'localhost.pem');

// Verificar se já existem certificados
if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  console.log('✅ Certificados HTTPS já existem!');
  console.log(`   Key:  ${keyPath}`);
  console.log(`   Cert: ${certPath}`);
  process.exit(0);
}

console.log('🔐 Gerando certificados HTTPS locais...');

try {
  // Tentar usar mkcert se estiver disponível
  try {
    execSync('mkcert -version', { stdio: 'ignore' });
    console.log('📋 Usando mkcert para gerar certificados...');

    // Gerar certificados com mkcert
    execSync(`mkcert -key-file "${keyPath}" -cert-file "${certPath}" localhost 127.0.0.1 ::1`, {
      cwd: certsDir,
      stdio: 'inherit'
    });

    console.log('✅ Certificados gerados com sucesso usando mkcert!');
  } catch (mkcertError) {
    // Fallback para OpenSSL
    console.log('📋 mkcert não encontrado, tentando OpenSSL...');

    // Gerar chave privada
    execSync(`openssl genrsa -out "${keyPath}" 2048`, { stdio: 'inherit' });

    // Gerar certificado
    const opensslCommand = `openssl req -new -x509 -key "${keyPath}" -out "${certPath}" -days 365 -subj "/C=BR/ST=Local/L=Local/O=Dev/OU=Dev/CN=localhost"`;
    execSync(opensslCommand, { stdio: 'inherit' });

    console.log('✅ Certificados gerados com sucesso usando OpenSSL!');
  }

  console.log('\n📁 Certificados criados em:');
  console.log(`   Key:  ${keyPath}`);
  console.log(`   Cert: ${certPath}`);

  console.log('\n🚀 Agora você pode executar:');
  console.log('   pnpm dev-https       (modo web com HTTPS)');
  console.log('   pnpm dev-tauri-https (modo Tauri com HTTPS)');

} catch (error) {
  console.error('❌ Erro ao gerar certificados:', error.message);
  console.log('\n💡 Alternativas:');
  console.log('1. Instale mkcert: https://github.com/FiloSottile/mkcert');
  console.log('2. Instale OpenSSL: https://slproweb.com/products/Win32OpenSSL.html');
  console.log('3. Use o modo HTTPS básico do Vite (certificado temporário)');
  process.exit(1);
}
