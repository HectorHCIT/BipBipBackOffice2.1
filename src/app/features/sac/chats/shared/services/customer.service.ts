import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { DataService } from '@core/services/data.service';
import { CustomerData } from '../models/customer.model';

/**
 * Servicio para gestionar información de clientes
 *
 * Endpoint: Customer/Profile?IdCustomer={customerId}
 */
@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly dataService = inject(DataService);

  /**
   * Obtiene la información completa de un cliente
   */
  getCustomerProfile(customerId: number): Observable<CustomerData> {
    return this.dataService.get$<CustomerData>(`Customer/Profile?IdCustomer=${customerId}`);
  }

  /**
   * Obtiene solo el nombre de un cliente (helper method)
   */
  getCustomerName(customerId: number): Observable<string> {
    return this.getCustomerProfile(customerId).pipe(
      map(customer => customer.nombre)
    );
  }
}
