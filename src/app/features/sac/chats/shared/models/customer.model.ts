/**
 * Modelo de información del cliente
 *
 * Obtenido del endpoint Customer/Profile
 */
export interface CustomerData {
  numcliente: number;           // ID del cliente
  nombre: string;               // Nombre completo
  telefono: string;             // Número de teléfono
  email: string;                // Correo electrónico
  genero: string;               // Género
  tipoAutorizacion: string;     // Tipo de autorización
  fechaRegistro: Date;          // Fecha de registro
  ciudad: string;               // Ciudad
  fechaNacimiento: Date;        // Fecha de nacimiento
  direccion: string;            // Dirección completa
  puntoReferencia: string;      // Punto de referencia
}
