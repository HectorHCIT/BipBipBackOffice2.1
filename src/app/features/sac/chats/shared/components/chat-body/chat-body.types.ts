/**
 * Información del chat para contexto
 */
export interface ChatInfo {
  emisor: string;       // Nombre del emisor (cliente)
  receptor: string;     // Nombre del receptor (agente)
  chatType: 'sac-cliente' | 'sac-driver' | 'cliente-driver';
}
