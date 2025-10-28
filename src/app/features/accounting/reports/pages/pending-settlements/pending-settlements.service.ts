import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { DataService } from '../../../../../core/services/data.service';
import { Brand } from '../../models/report-common.types';

export interface PendingSettlementsRequest {
  date: string;    // Format: DD-MM-YYYY (with padding)
  brandId: number;
}

@Injectable()
export class PendingSettlementsService {
  private readonly http = inject(HttpClient);
  private readonly dataService = inject(DataService);

  /**
   * Generates the Pending Settlements report (PDF only)
   * API: {apiURLReports}backoffice/liquidacionXMarca/{date}/{date}/na/{brandId}
   *
   * Note: Uses environment.apiURLReports and DD-MM-YYYY format (with padding)
   * The date parameter is repeated twice in the URL
   */
  generateReport(request: PendingSettlementsRequest): Observable<string> {
    const { date, brandId } = request;
    return this.http.get<string>(
      `${environment.apiURLReports}backoffice/liquidacionXMarca/${date}/${date}/na/${brandId}`
    );
  }

  /**
   * Gets list of brands from API
   * Endpoint: Brand/BrandsListSorted
   */
  getBrands(): Observable<Brand[]> {
    return this.dataService.get$<Brand[]>('Brand/BrandsListSorted');
  }
}
