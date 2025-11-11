import { Routes } from '@angular/router';

export const CHAT_REPORT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/chat-report-page/chat-report-page.component').then(
        (m) => m.ChatReportPageComponent
      )
  }
];
