# Configuración de Vercel para BipBip BackOffice

Este documento describe cómo configurar el proyecto en Vercel.

## Archivos de Configuración

- **`vercel.json`**: Configuración principal de Vercel
- **`.vercelignore`**: Archivos a ignorar en el deployment

## Variables de Entorno

El proyecto utiliza un script de generación de variables de entorno (`scripts/generate-env.js`) que se ejecuta automáticamente durante el build.

### Configurar Variables en Vercel Dashboard

Debes configurar las siguientes variables de entorno en el dashboard de Vercel:

**Ruta:** Project Settings → Environment Variables

**IMPORTANTE:** Configura cada variable para los tres entornos:
- ✅ Production
- ✅ Preview
- ✅ Development

#### Generales
- `PRODUCTION` → `true` (ya está configurado en vercel.json para build)

#### API URLs
- `API_URL` → URL de tu API principal
- `API_URL_REPORTS` → URL de la API de reportes
- `API_URL_SIGNALR` → URL de SignalR
- `INVOICES_URL` → URL de facturas

#### Maps
- `MAPBOX_TOKEN` → Token de Mapbox
- `GOOGLE_MAPS_API_KEY` → API Key de Google Maps

#### S3 Buckets
- `S3_BUCKET_IMAGES` → Nombre del bucket de imágenes
- `S3_BUCKET_BRANDS` → Nombre del bucket de marcas

#### API Keys
- `KPI_CHATS` → API Key para KPI de chats
- `API_KEY_SIGNAL` → API Key de Signal
- `WEATHER_API_KEY` → API Key del clima
- `X_API_KEY` → X-API-Key general

#### Firebase
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `FIREBASE_MEASUREMENT_ID`
- `FIREBASE_DATABASE_URL`

#### Embeddable
- `EMBEDDABLE_API_URL`
- `EMBEDDABLE_API_KEY`
- `EMBEDDABLE_USER_ID`

## Proceso de Build

El proceso de build en Vercel ejecuta automáticamente:

1. `npm install` - Instala las dependencias
2. `npm run build:prod` - Ejecuta el build de producción
   - Esto ejecuta automáticamente `npm run generate:env:prod` (prebuild hook)
   - El script `generate-env.js` detecta que está en un entorno CI/CD (no encuentra `.env.prod`)
   - Usa automáticamente las variables de entorno del sistema (`process.env`) que Vercel proporciona
   - Crea el archivo `src/environments/environment.ts` con todas las variables configuradas

## Deployment

### Primera vez

1. Conecta tu repositorio de GitHub/GitLab/Bitbucket con Vercel
2. Selecciona el proyecto
3. Vercel detectará automáticamente que es un proyecto Angular
4. Configura las variables de entorno en el dashboard
5. Deploy!

### Deployments automáticos

- **Main branch**: Se deploya automáticamente a producción
- **Otras branches**: Se crean preview deployments automáticamente

## Configuración Avanzada

### Rewrites

El proyecto está configurado para redirigir todas las rutas a `index.html` (SPA routing):

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Headers de Cache

Se han configurado headers de cache optimizados para:
- Assets estáticos (1 año)
- Archivos JS/CSS compilados (1 año)

### Output Directory

El directorio de salida está configurado como:
```
dist/bip-bip-back-office2.1/browser
```

Si el nombre del proyecto cambia en `angular.json`, actualiza también el `outputDirectory` en `vercel.json`.

## Troubleshooting

### Error: No se encontró el archivo .env

✅ **Este es el comportamiento esperado en Vercel**. El script `generate-env.js` detecta automáticamente que está en un entorno CI/CD cuando no encuentra archivos `.env` y usa las variables de entorno del sistema (`process.env`) proporcionadas por Vercel.

### Build fallido

1. Verifica que todas las variables de entorno estén configuradas en Vercel
2. Revisa los logs de build en el dashboard de Vercel
3. Asegúrate de que el `outputDirectory` en `vercel.json` coincida con el nombre del proyecto en `angular.json`

### Rutas 404

Si las rutas de Angular retornan 404, verifica que la configuración de rewrites en `vercel.json` esté correcta.

## Comandos Útiles

```bash
# Desarrollo local
npm run start

# Build local de producción
npm run build:prod

# Generar environment.ts manualmente
npm run generate:env:prod

# Deploy manual (requiere Vercel CLI)
vercel --prod
```

## Referencias

- [Documentación de Vercel](https://vercel.com/docs)
- [Vercel + Angular](https://vercel.com/docs/frameworks/angular)
- [Configuración de vercel.json](https://vercel.com/docs/projects/project-configuration)
