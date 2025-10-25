import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// PrimeNG Components
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

import { AuthService } from '@core/services/auth.service';

/**
 * HomeComponent - Página principal después del login
 */
@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    CardModule,
    ButtonModule
  ],
  template: `
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white">
          ¡Bienvenido a BipBip Backoffice!
        </h1>
        <p class="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Hola, <span class="font-semibold text-[#fb0021]">{{ userFullName() }}</span>
        </p>
      </div>

      <!-- Stats Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Card 1: Usuarios -->
        <p-card styleClass="bg-white dark:bg-gray-800">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Total Usuarios</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">1,234</p>
            </div>
            <i class="pi pi-users text-4xl text-blue-500"></i>
          </div>
        </p-card>

        <!-- Card 2: Empresas -->
        <p-card styleClass="bg-white dark:bg-gray-800">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Empresas Activas</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">89</p>
            </div>
            <i class="pi pi-building text-4xl text-green-500"></i>
          </div>
        </p-card>

        <!-- Card 3: Reportes -->
        <p-card styleClass="bg-white dark:bg-gray-800">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Reportes Hoy</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">45</p>
            </div>
            <i class="pi pi-chart-bar text-4xl text-purple-500"></i>
          </div>
        </p-card>

        <!-- Card 4: Alertas -->
        <p-card styleClass="bg-white dark:bg-gray-800">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Alertas Pendientes</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">12</p>
            </div>
            <i class="pi pi-bell text-4xl text-red-500"></i>
          </div>
        </p-card>
      </div>

      <!-- Welcome Card -->
      <p-card styleClass="bg-white dark:bg-gray-800 mb-8">
        <div class="text-center py-8">
          <i class="pi pi-check-circle text-6xl text-green-500 mb-4"></i>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Sistema Actualizado
          </h2>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            BipBip Backoffice migrado exitosamente a Angular 20
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-500 mb-8">
            Con PrimeNG, Signals y Tailwind CSS
          </p>

          <!-- User Info -->
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6 text-left max-w-md mx-auto">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-3">Información del Usuario:</h3>
            <div class="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <p><strong>Usuario:</strong> {{ userName() }}</p>
              <p><strong>Nombre Completo:</strong> {{ userFullName() }}</p>
              <p><strong>Rol:</strong> {{ userRole() }}</p>
              <p><strong>Estado:</strong> <span class="text-green-600 font-semibold">● Activo</span></p>
            </div>
          </div>
        </div>
      </p-card>

      <!-- Migration Progress -->
      <p-card styleClass="bg-white dark:bg-gray-800">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Progreso de Migración:</h3>
        <ul class="space-y-3 text-sm">
          <li class="flex items-start gap-2 text-gray-700 dark:text-gray-300">
            <i class="pi pi-check text-green-600 mt-0.5"></i>
            <span>AuthService migrado con Signals</span>
          </li>
          <li class="flex items-start gap-2 text-gray-700 dark:text-gray-300">
            <i class="pi pi-check text-green-600 mt-0.5"></i>
            <span>Login page con PrimeNG</span>
          </li>
          <li class="flex items-start gap-2 text-gray-700 dark:text-gray-300">
            <i class="pi pi-check text-green-600 mt-0.5"></i>
            <span>Layout con Navbar y Sidebar</span>
          </li>
          <li class="flex items-start gap-2 text-gray-700 dark:text-gray-300">
            <i class="pi pi-circle text-gray-400 mt-0.5"></i>
            <span>Migrar GetDataService</span>
          </li>
          <li class="flex items-start gap-2 text-gray-700 dark:text-gray-300">
            <i class="pi pi-circle text-gray-400 mt-0.5"></i>
            <span>Migrar Dashboard module</span>
          </li>
        </ul>
      </p-card>
    </div>
  `
})
export class HomeComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Computed values from AuthService
  readonly userName = this.authService.userName;
  readonly userFullName = this.authService.userFullName;
  readonly userRole = this.authService.userRole;

  async logout(): Promise<void> {
    await this.authService.logout();
  }
}
