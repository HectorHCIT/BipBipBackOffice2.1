import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';
import { BipBipPreset } from '../styles/primeng-preset';
import { routes } from './app.routes';
import { environment } from '../environments/environment';

const BipBipTheme = definePreset(Aura, BipBipPreset);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(
      // TODO: Agregar interceptors cuando estén migrados
      // withInterceptors([apiKeyInterceptor, errorInterceptor])
    ),
    providePrimeNG({
      theme: {
        preset: BipBipTheme,
        options: {
          prefix: 'p',
          darkModeSelector: 'system',
          cssLayer: false
        }
      }
    }),
    // Firebase configuration
    provideFirebaseApp(() => initializeApp(environment.firebaseConfigs)),
    provideFirestore(() => getFirestore())
  ]
};
