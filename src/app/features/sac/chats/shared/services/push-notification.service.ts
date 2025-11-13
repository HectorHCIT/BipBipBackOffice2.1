import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DataService } from '@core/services/data.service';

/**
 * Modelo para el cuerpo de la notificación push
 */
export interface PushNotificationBody {
  title: string;
  body: string;
}

/**
 * Servicio para enviar notificaciones push a clientes
 *
 * Endpoint: Chat/notify/{chatId}?orderId={orderId}&ticketId={ticketId}
 */
@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private readonly dataService = inject(DataService);

  /**
   * Envía una notificación push al cliente
   *
   * @param chatId ID del chat (ej: "help_424639" o "order_55454")
   * @param orderId ID de la orden (0 si es chat de ayuda)
   * @param ticketId ID del ticket (mismo que chatId generalmente)
   * @param message Cuerpo de la notificación
   */
  notifyCustomer(
    chatId: string,
    orderId: number,
    ticketId: string,
    message: PushNotificationBody
  ): Observable<void> {
    return this.dataService.post$<void>(
      `Chat/notify/${chatId}?orderId=${orderId}&ticketId=${ticketId}`,
      message
    );
  }
}
