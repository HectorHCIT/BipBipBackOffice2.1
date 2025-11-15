import { Routes } from '@angular/router';

export const CHAT_HISTORY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/chat-history-page')
      .then(m => m.ChatHistoryPageComponent),
    title: 'Historial de Chats'
  }
];
