/**
 * Script para generar environment.ts desde variables de entorno .env o process.env
 *
 * Este script lee el archivo .env (si existe) o las variables de entorno del sistema
 * y genera el archivo src/environments/environment.ts con las variables correspondientes.
 *
 * Uso:
 *   node scripts/generate-env.js           (usa .env o process.env)
 *   node scripts/generate-env.js --prod    (usa .env.prod o process.env)
 *
 * En entornos CI/CD como Vercel, usa automáticamente las variables del sistema.
 */

const fs = require('fs');
const path = require('path');

// Determinar qué archivo .env usar
const isProd = process.argv.includes('--prod');
const envFile = isProd ? '.env.prod' : '.env';
const envPath = path.join(__dirname, '..', envFile);

console.log(`📝 Generando environment.ts...`);

// Parsear variables de entorno
let envVars = {};
let source = 'process.env (variables del sistema)';

// Intentar leer archivo .env si existe
if (fs.existsSync(envPath)) {
  console.log(`📄 Leyendo desde archivo: ${envFile}`);
  source = envFile;

  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    // Ignorar comentarios y líneas vacías
    if (line.trim() === '' || line.trim().startsWith('#')) {
      return;
    }

    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      envVars[key.trim()] = value;
    }
  });
} else {
  // En CI/CD (como Vercel), usar las variables de entorno del sistema
  console.log(`⚙️  Archivo ${envFile} no encontrado, usando variables del sistema`);
  console.log(`🔧 Modo CI/CD detectado`);

  // Usar process.env directamente
  envVars = process.env;
}

// Función helper para obtener valor o string vacío
const getEnvValue = (key) => {
  const value = envVars[key] || '';
  // Escapar comillas en el valor
  return value.replace(/'/g, "\\'");
};

// Generar contenido del environment.ts
const environmentContent = `/**
 * Environment Configuration
 *
 * 🚨 ESTE ARCHIVO ES GENERADO AUTOMÁTICAMENTE
 * 🚨 NO EDITAR MANUALMENTE
 *
 * Generado desde: ${source}
 * Fecha: ${new Date().toISOString()}
 *
 * Para modificar las variables de entorno:
 * - Desarrollo local: Edita el archivo ${envFile} y ejecuta npm run generate:env
 * - Vercel/CI: Configura las variables en el dashboard del servicio
 */

export const environment = {
  production: ${envVars.PRODUCTION === 'true'},

  // API URLs
  apiURL: '${getEnvValue('API_URL')}',
  apiURLReports: '${getEnvValue('API_URL_REPORTS')}',
  apiURLSignalR: '${getEnvValue('API_URL_SIGNALR')}',
  invoicesURL: '${getEnvValue('INVOICES_URL')}',

  // Maps
  mapboxToken: '${getEnvValue('MAPBOX_TOKEN')}',
  googleMapsApiKey: '${getEnvValue('GOOGLE_MAPS_API_KEY')}',

  // S3 Buckets
  S3BucketImages: '${getEnvValue('S3_BUCKET_IMAGES')}',
  s3BuckedBrands: '${getEnvValue('S3_BUCKET_BRANDS')}',

  // API Keys
  kpiChats: '${getEnvValue('KPI_CHATS')}',
  apiKeySignal: '${getEnvValue('API_KEY_SIGNAL')}',
  weatherApiKey: '${getEnvValue('WEATHER_API_KEY')}',
  xApiKey: '${getEnvValue('X_API_KEY')}',

  // Firebase Configuration
  firebaseConfigs: {
    apiKey: '${getEnvValue('FIREBASE_API_KEY')}',
    authDomain: '${getEnvValue('FIREBASE_AUTH_DOMAIN')}',
    projectId: '${getEnvValue('FIREBASE_PROJECT_ID')}',
    storageBucket: '${getEnvValue('FIREBASE_STORAGE_BUCKET')}',
    messagingSenderId: '${getEnvValue('FIREBASE_MESSAGING_SENDER_ID')}',
    appId: '${getEnvValue('FIREBASE_APP_ID')}',
    measurementId: '${getEnvValue('FIREBASE_MEASUREMENT_ID')}',
    databaseURL: '${getEnvValue('FIREBASE_DATABASE_URL')}',
  },

  // Embeddable Configuration
  embeddable: {
    apiUrl: '${getEnvValue('EMBEDDABLE_API_URL')}',
    apiKey: '${getEnvValue('EMBEDDABLE_API_KEY')}',
    userId: '${getEnvValue('EMBEDDABLE_USER_ID')}',
  },
};
`;

// Crear directorio src/environments si no existe
const environmentsDir = path.join(__dirname, '..', 'src', 'environments');
if (!fs.existsSync(environmentsDir)) {
  fs.mkdirSync(environmentsDir, { recursive: true });
  console.log('✅ Directorio src/environments creado');
}

// Escribir archivo environment.ts
const outputPath = path.join(environmentsDir, 'environment.ts');
fs.writeFileSync(outputPath, environmentContent);

console.log(`✅ Archivo generado: ${path.relative(process.cwd(), outputPath)}`);
console.log(`📊 Variables procesadas: ${Object.keys(envVars).length}`);
console.log(`🔒 Modo producción: ${envVars.PRODUCTION === 'true' ? 'SÍ' : 'NO'}`);
console.log('');
console.log('💡 Recuerda: El archivo environment.ts está en .gitignore y NO se debe subir a git');
