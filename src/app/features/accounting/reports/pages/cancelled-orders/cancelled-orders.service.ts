import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { ReportBaseService } from '../../shared/services/report-base.service';

export interface CancelledOrdersRequest {
  fechaI: string;     // Format: YYYY-MM-DD
  fechaF: string;     // Format: YYYY-MM-DD
  brandId: number;
  storeIds?: number[]; // Optional array
}

@Injectable()
export class CancelledOrdersService extends ReportBaseService {
  private readonly httpClient = inject(HttpClient);

  /**
   * Generates the Cancelled Orders report (Excel only)
   * API: {apiURL}Reports/OrdenesCanceladas
   *
   * Note: Uses environment.apiURL (main API, not apiURLReports)
   */
  override generateReport(request: CancelledOrdersRequest): Observable<string> {
    this.isLoading.set(true);

    let httpParams = new HttpParams()
      .set('fechaI', request.fechaI)
      .set('fechaF', request.fechaF)
      .set('brandId', request.brandId.toString());

    // Append each store ID as separate parameter (storeId=1&storeId=2)
    if (request.storeIds && request.storeIds.length > 0) {
      request.storeIds.forEach(storeId => {
        httpParams = httpParams.append('storeId', storeId.toString());
      });
    }

    return this.httpClient.get(environment.apiURL + 'Reports/OrdenesCanceladas', {
      params: httpParams,
      responseType: 'text'
    });
  }
}
