import { Routes } from '@angular/router';

export const CHAT_DETAILS_REPORT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/chat-details-report-page/chat-details-report-page.component').then(
        (m) => m.ChatDetailsReportPageComponent
      )
  }
];
