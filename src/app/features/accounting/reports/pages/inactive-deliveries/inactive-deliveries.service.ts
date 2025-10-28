import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { ReportBaseService } from '../../shared/services/report-base.service';

export interface InactiveDeliveriesRequest {
  fechaInicio: string; // ISO format
  fechaFinal: string;  // ISO format
}

@Injectable()
export class InactiveDeliveriesService extends ReportBaseService {
  private readonly httpClient = inject(HttpClient);
  private readonly apiUrl = environment.apiURL + 'Reports/Drivers/WithoutDeliveries/Excel';

  /**
   * Generates the Inactive Deliveries report (Excel only)
   * API: {apiURL}Reports/Drivers/WithoutDeliveries/Excel
   *
   * Note: Uses environment.apiURL (main API, not apiURLReports)
   */
  override generateReport(request: InactiveDeliveriesRequest): Observable<string> {
    this.isLoading.set(true);

    const httpParams = new HttpParams()
      .set('fechaInicio', request.fechaInicio)
      .set('fechaFinal', request.fechaFinal);

    return this.httpClient.get(this.apiUrl, {
      params: httpParams,
      responseType: 'text'
    });
  }
}
