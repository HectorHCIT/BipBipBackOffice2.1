/**
 * Datos que se emiten al enviar un mensaje
 */
export interface MessageSubmitData {
  message: string;
  imageFile: File | null;
  imageUrl: string | null;
  chatId: string;
}
