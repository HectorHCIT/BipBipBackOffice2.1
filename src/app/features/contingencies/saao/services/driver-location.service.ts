import { Injectable, inject } from '@angular/core';
import { Database, ref, onValue, off, DatabaseReference } from '@angular/fire/database';
import { Observable } from 'rxjs';

/**
 * Interface para la ubicación del driver en Firebase
 */
export interface DriverLocation {
  lat: number;
  lng: number;
}

/**
 * Servicio para manejar la ubicación en tiempo real de los drivers
 * usando Firebase Realtime Database
 *
 * Estructura en Firebase:
 * {cityId}/
 *   {driverCode}/
 *     lat: number
 *     lng: number
 */
@Injectable({
  providedIn: 'root'
})
export class DriverLocationService {
  private db = inject(Database);

  /**
   * Obtener la ubicación en tiempo real de un driver
   *
   * @param cityId ID de la ciudad
   * @param driverCode Código del driver (ej: "BIP-01161")
   * @returns Observable que emite la ubicación cada vez que cambia en Firebase
   */
  getDriverLocation(cityId: number, driverCode: string): Observable<DriverLocation | null> {
    return new Observable(subscriber => {
      // Crear referencia al path en Firebase: {cityId}/{driverCode}
      const locationRef: DatabaseReference = ref(this.db, `${cityId}/${driverCode}`);

      // Listener para cambios en tiempo real
      onValue(
        locationRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const location: DriverLocation = {
              lat: data.lat,
              lng: data.lng
            };
            subscriber.next(location);
          } else {
            subscriber.next(null);
          }
        },
        (error) => {
          console.error('❌ [Firebase] Error obteniendo ubicación:', error);
          subscriber.error(error);
        }
      );

      // Cleanup cuando se desuscriba
      return () => {
        off(locationRef);
      };
    });
  }

  /**
   * Calcular la distancia entre dos puntos geográficos usando la fórmula de Haversine
   *
   * @param lat1 Latitud del punto 1
   * @param lng1 Longitud del punto 1
   * @param lat2 Latitud del punto 2
   * @param lng2 Longitud del punto 2
   * @returns Distancia en kilómetros
   */
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Radio de la Tierra en kilómetros
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Redondear a 2 decimales
  }

  /**
   * Convertir grados a radianes
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
