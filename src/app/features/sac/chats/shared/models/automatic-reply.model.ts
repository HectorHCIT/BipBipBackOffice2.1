/**
 * Modelo de respuesta automática/predefinida
 *
 * Utilizado en el sistema de chat SAC para gestionar
 * respuestas rápidas que los agentes pueden insertar
 */

/**
 * Respuesta automática completa (del backend)
 */
export interface AutomaticReply {
  responseId: number;
  title: string;
  response: string;
  active: boolean;
  createdAt: Date;
  userCreated: string;
  updatedAt: Date;
}

/**
 * Payload para crear o actualizar una respuesta automática
 */
export interface AutomaticReplyPayload {
  title: string;
  response: string;
  active: boolean;
}

/**
 * Tipo para el formulario del dialog
 */
export interface AutomaticReplyFormData {
  title: string;
  response: string;
}
