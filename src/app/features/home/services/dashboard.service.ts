import { Injectable, inject } from '@angular/core';
import { Observable, of, combineLatest } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import type { DashboardData } from '../models/dashboard.model';
import { GlobalDataService } from '@core/services/global-data.service';

/**
 * DashboardService
 *
 * Servicio para obtener datos del dashboard
 * Combina datos del backend con catálogos globales
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly globalDataService = inject(GlobalDataService);

  /**
   * Obtiene los datos del dashboard
   * TODO: Conectar con el backend real para los totales
   */
  getDashboardData(): Observable<DashboardData> {
    // Datos mock de órdenes - reemplazar con llamada HTTP real
    const mockOrderData = {
      totalOrders: 14969,
      deliveredOrders: 14944,
      ordersInProgress: 25,
      ordersByPaymentMethod: [
        { method: 'Efectivo', total: 10300 },
        { method: 'Tarjeta', total: 4597 },
        { method: 'Puntos Bips', total: 53 },
        { method: 'Pendiente', total: 19 }
      ],
      ordersByChannel: [
        { channel: 'Domicilio', total: 6140, percentage: 41 },
        { channel: '*5000', total: 4793, percentage: 32 },
        { channel: 'Para llevar', total: 4036, percentage: 27 },
        { channel: 'Restaurante', total: 0, percentage: 0 }
      ],
      // Mock data para marcas (totales inventados)
      ordersByBrand: [
        { brandId: 1, total: 10541 },
        { brandId: 2, total: 2533 },
        { brandId: 3, total: 1334 },
        { brandId: 4, total: 475 },
        { brandId: 5, total: 86 }
      ],
      // Mock data para ciudades (totales inventados)
      ordersByCity: [
        { cityId: 1, total: 1289056 },
        { cityId: 2, total: 1130069 },
        { cityId: 3, total: 261327 },
        { cityId: 4, total: 187448 },
        { cityId: 5, total: 157089 },
        { cityId: 6, total: 153602 },
        { cityId: 7, total: 116265 },
        { cityId: 8, total: 105213 }
      ]
    };

    // Combinar mock data con datos reales de GlobalDataService
    return combineLatest([
      of(mockOrderData).pipe(delay(500)),
      of(this.globalDataService.brands()),
      of(this.globalDataService.citiesShort())
    ]).pipe(
      map(([orderData, brands, cities]) => {
        // Mapear marcas con sus logos
        const ordersByBrand = orderData.ordersByBrand.map(order => {
          const brand = brands.find(b => b.id === order.brandId);
          return {
            brandId: order.brandId,
            brandName: brand?.name || 'Desconocido',
            logo: brand?.logo || '',
            total: order.total
          };
        });

        // Mapear ciudades con sus nombres
        const ordersByCity = orderData.ordersByCity.map(order => {
          const city = cities.find(c => c.id === order.cityId);
          return {
            cityId: order.cityId,
            cityName: city?.name || 'Desconocida',
            total: order.total
          };
        });

        return {
          totalOrders: orderData.totalOrders,
          deliveredOrders: orderData.deliveredOrders,
          ordersInProgress: orderData.ordersInProgress,
          ordersByPaymentMethod: orderData.ordersByPaymentMethod,
          ordersByChannel: orderData.ordersByChannel,
          ordersByBrand,
          ordersByCity
        };
      })
    );
  }
}
