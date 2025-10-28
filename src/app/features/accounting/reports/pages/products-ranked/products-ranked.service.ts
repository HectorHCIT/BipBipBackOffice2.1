import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { ReportBaseService } from '../../shared/services/report-base.service';

export interface ProductsRankedRequest {
  fechaInicio: string; // ISO format
  fechaFinal: string;  // ISO format
  marcas: number[];    // Array of brand IDs
  top?: number;        // Optional limit
}

@Injectable()
export class ProductsRankedService extends ReportBaseService {
  private readonly httpClient = inject(HttpClient);
  private readonly apiUrl = environment.apiURL + 'Reports/ProductsRanked/Excel';

  /**
   * Generates the Products Ranked report (Excel only)
   * API: {apiURL}Reports/ProductsRanked/Excel
   *
   * Note: Uses environment.apiURL (main API, not apiURLReports)
   */
  override generateReport(request: ProductsRankedRequest): Observable<string> {
    this.isLoading.set(true);

    let httpParams = new HttpParams()
      .set('fechaInicio', request.fechaInicio)
      .set('fechaFinal', request.fechaFinal);

    // Append each brand ID as separate parameter (marcas=1&marcas=2)
    request.marcas.forEach(marcaId => {
      httpParams = httpParams.append('marcas', marcaId.toString());
    });

    // Add 'top' parameter if provided
    if (request.top !== undefined && request.top > 0) {
      httpParams = httpParams.set('top', request.top.toString());
    }

    return this.httpClient.get(this.apiUrl, {
      params: httpParams,
      responseType: 'text'
    });
  }
}
