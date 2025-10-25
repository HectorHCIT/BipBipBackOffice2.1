/**
 * Environment Configuration - EXAMPLE TEMPLATE
 *
 * Este archivo es una PLANTILLA de ejemplo.
 * El archivo real (environment.ts) se genera automáticamente desde .env
 *
 * 🚨 NO EDITAR environment.ts directamente!
 * 🚨 Para configurar variables, edita el archivo .env en la raíz
 *
 * Para generar el environment.ts:
 *   npm run generate:env        (desde .env)
 *   npm run generate:env:prod   (desde .env.prod)
 */

export const environment = {
  production: false,

  // API URLs
  apiURL: 'https://api-dev.bipbip.com/',
  apiURLReports: 'https://api-reports.bipbip.com/',
  apiURLSignalR: 'https://api-signalr.bipbip.com/',
  invoicesURL: 'https://invoices.bipbip.com/',

  // Maps
  mapboxToken: 'YOUR_MAPBOX_TOKEN',
  googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY',

  // S3 Buckets
  S3BucketImages: 'your-s3-bucket-images',
  s3BuckedBrands: 'your-s3-bucket-brands',

  // API Keys
  kpiChats: 'YOUR_KPI_CHATS_KEY',
  apiKeySignal: 'YOUR_API_KEY_SIGNAL',
  weatherApiKey: 'YOUR_WEATHER_API_KEY',
  xApiKey: 'YOUR_X_API_KEY',

  // Firebase Configuration
  firebaseConfigs: {
    apiKey: 'YOUR_FIREBASE_API_KEY',
    authDomain: 'your-project.firebaseapp.com',
    projectId: 'your-project-id',
    storageBucket: 'your-project.appspot.com',
    messagingSenderId: '123456789',
    appId: '1:123456789:web:abcdef',
    measurementId: 'G-XXXXXXXXXX',
    databaseURL: 'https://your-project.firebaseio.com',
  },

  // Embeddable Configuration
  embeddable: {
    apiUrl: 'https://embeddable-api.bipbip.com/',
    apiKey: 'YOUR_EMBEDDABLE_API_KEY',
    userId: 'YOUR_EMBEDDABLE_USER_ID',
  },
};
