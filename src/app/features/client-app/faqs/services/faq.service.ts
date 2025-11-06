import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { DataService } from '@core/services/data.service';
import { FaqList, FaqDetail, FaqPayload } from '../models';

@Injectable({
  providedIn: 'root'
})
export class FaqService {
  private readonly dataService = inject(DataService);

  readonly faqs = signal<FaqList[]>([]);
  readonly isLoading = signal(false);

  getFaqList(): Observable<FaqList[]> {
    this.isLoading.set(true);
    return this.dataService.get$<FaqList[]>('Faq/FaqList').pipe(
      tap(faqs => {
        this.faqs.set(faqs);
        this.isLoading.set(false);
      })
    );
  }

  getFaqById(id: number): Observable<FaqDetail> {
    return this.dataService.get$<FaqDetail>('Faq/FaqById', { id });
  }

  createFaq(payload: FaqPayload): Observable<any> {
    return this.dataService.post$('Faq/CreateFaq', payload);
  }

  editFaq(id: number, payload: FaqPayload): Observable<any> {
    return this.dataService.put$('Faq/EditFaq', payload, { id });
  }

  enableFaq(id: number, active: boolean): Observable<any> {
    return this.dataService.put$('Faq/EnableFaq', null, { id, active });
  }

  changeOrder(idFaq: number, numOrder: number): Observable<any> {
    return this.dataService.put$('Faq/ChangeSortOrderFaq', null, { idFaq, numOrder });
  }
}
