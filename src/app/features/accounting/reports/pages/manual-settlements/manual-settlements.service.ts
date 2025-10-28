import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';

export interface ManualSettlementsRequest {
  dateFrom: string; // Format: DD-MM-YYYY
  dateTo: string;   // Format: DD-MM-YYYY
}

@Injectable()
export class ManualSettlementsService {
  private readonly http = inject(HttpClient);

  /**
   * Generates the Manual Settlements report (PDF only)
   * API: {apiURLReports}reporteria/reporteliquidacionesmanuales/{dateFrom}/{dateTo}/1
   *
   * Note: Uses environment.apiURLReports instead of apiURL
   */
  generateReport(request: ManualSettlementsRequest): Observable<string> {
    const { dateFrom, dateTo } = request;
    return this.http.get<string>(
      `${environment.apiURLReports}reporteria/reporteliquidacionesmanuales/${dateFrom}/${dateTo}/1`
    );
  }
}
