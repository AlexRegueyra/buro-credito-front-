import fsExtra from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isMock = process.argv.includes('mock');
const environment = isMock ? 'mock' : process.argv[2];

console.log(`📦 Setting up environment: ${environment}`);

try {
  // Copy environment file
  console.log('📄 Copying .env file...');
  const envSource = path.normalize(`./environments/.env.${environment}`);
  const envDest = path.normalize('./.env');
  fsExtra.copySync(envSource, envDest);
  console.log(`✅ Environment file copied: ${environment}`);

  // Copy keycloak config if exists
  console.log('🔑 Copying Keycloak config...');
  try {
    const keycloakConfigFile = isMock
      ? './environments/keycloak.mock.json'
      : `./environments/keycloak.${environment}.json`;
    fsExtra.copySync(
      path.normalize(keycloakConfigFile),
      path.normalize('./public/keycloak.json')
    );
    console.log('✅ Keycloak config copied');
  } catch (err) {
    console.log('ℹ️  No Keycloak config found (optional)');
  }

  console.log('✨ Environment setup complete!\n');
} catch (err) {
  console.error('❌ Error setting up environment:', err.message);
  process.exit(1);
}
