import { Injectable } from '@angular/core';

/**
 * IntercomService
 * Servicio para integración con Intercom
 */
@Injectable({
  providedIn: 'root'
})
export class IntercomService {
  private get ic() {
    return (window as any).Intercom;
  }

  /**
   * Inicializar Intercom con datos del usuario
   */
  boot(settings: Record<string, any>): void {
    this.ic('shutdown'); // Limpiar sesión previa
    this.ic('boot', settings); // Arrancar con datos de usuario
  }

  /**
   * Actualizar datos del usuario en Intercom
   */
  update(attrs?: Record<string, any>): void {
    this.ic('update', attrs || {});
  }

  /**
   * Cerrar sesión de Intercom
   */
  shutdown(): void {
    this.ic('shutdown');
  }
}
