import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { ReportFormat } from '../../models/report-common.types';

export interface CashSalesRequest {
  dateFrom: string; // Format: D-M-YYYY (no padding)
  dateTo: string;   // Format: D-M-YYYY (no padding)
  format: ReportFormat;
}

@Injectable()
export class CashSalesService {
  private readonly http = inject(HttpClient);

  /**
   * Generates the Cash Sales report (PDF or Excel)
   * API: {apiURLReports}reporteFAC/ventasefectivo/{dateFrom}/{dateTo}/{format}
   *
   * Note: Uses environment.apiURLReports and D-M-YYYY format (no padding)
   */
  generateReport(request: CashSalesRequest): Observable<string> {
    const { dateFrom, dateTo, format } = request;
    return this.http.get<string>(
      `${environment.apiURLReports}reporteFAC/ventasefectivo/${dateFrom}/${dateTo}/${format}`
    );
  }
}
