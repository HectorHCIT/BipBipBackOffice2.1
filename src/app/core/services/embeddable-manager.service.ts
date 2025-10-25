import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  EmbeddableNames,
  TOKEN_KEY_TO_EMBEDDABLE_NAME as TOKEN_MAP
} from '../models/embeddable.model';
import type {
  TokenDash,
  EmbeddableResponse,
  EmbeddableInfo
} from '../models/embeddable.model';

/**
 * EmbeddableManagerService - Modernizado con Signals (Angular 20)
 *
 * Servicio para gestionar dinámicamente los IDs de embeddables y tokens de Embeddable.com
 *
 * Cambios vs versión anterior:
 * ✅ BehaviorSubject → Signals
 * ✅ Mejor type safety
 * ✅ Lazy loading de IDs
 * ✅ Caché en localStorage con expiración de 24 horas
 */
@Injectable({
  providedIn: 'root'
})
export class EmbeddableManagerService {
  private readonly STORAGE_KEY = 'bipbip_embeddable_ids';
  private readonly STORAGE_EXPIRY_KEY = 'bipbip_embeddable_ids_expiry';
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

  // 🔥 SIGNALS
  readonly embeddableIds = signal<Map<EmbeddableNames, string>>(new Map());

  private isInitialized = false;

  constructor() {
    this.loadFromCache();
  }

  /**
   * Inicializa el servicio de forma ligera - solo carga el caché si existe
   * Los IDs se obtienen bajo demanda cuando se necesiten
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // Solo cargar del caché si existe y es válido, NO hacer petición inicial
    const cachedData = this.getFromCache();
    const cacheExpired = this.isCacheExpired();

    if (cachedData && !cacheExpired) {
      this.embeddableIds.set(cachedData);
    }

    this.isInitialized = true;
  }

  /**
   * Obtiene los IDs de embeddables desde la API de Embeddable.com
   */
  private async fetchEmbeddableIds(): Promise<void> {
    if (!environment.embeddable?.apiKey) {
      throw new Error('API Key de Embeddable no configurada');
    }

    const response = await fetch('https://api.us.embeddable.com/api/v1/embeddables', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${environment.embeddable.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener embeddables: ${response.statusText}`);
    }

    const data: EmbeddableResponse = await response.json();
    const embeddableMap = this.processEmbeddableResponse(data);

    // Guardar en caché
    this.saveToCache(embeddableMap);
    this.embeddableIds.set(embeddableMap);
  }

  /**
   * Procesa la respuesta de la API y mapea solo los embeddables BipBip
   */
  private processEmbeddableResponse(data: EmbeddableResponse): Map<EmbeddableNames, string> {
    const embeddableMap = new Map<EmbeddableNames, string>();

    data.embeddables.forEach(embeddable => {
      // Solo procesar embeddables que comienzan con "BipBip"
      if (embeddable.name.startsWith('BipBip')) {
        // Buscar si el nombre coincide con alguno de nuestros enums
        const enumValue = Object.values(EmbeddableNames).find(
          enumName => enumName === embeddable.name
        ) as EmbeddableNames;

        if (enumValue) {
          embeddableMap.set(enumValue, embeddable.id);
        }
      }
    });

    return embeddableMap;
  }

  /**
   * Obtiene el ID de un embeddable específico de forma asíncrona
   * Si no está en caché, hace la petición para obtener todos los IDs
   */
  async getEmbeddableId(embeddableName: EmbeddableNames): Promise<string | null> {
    const currentIds = this.embeddableIds();
    const id = currentIds.get(embeddableName);

    if (id) {
      return id;
    }

    // Si no está en caché y no hemos hecho la petición, la hacemos
    if (currentIds.size === 0) {
      try {
        await this.ensureEmbeddablesLoaded();

        // Intentar de nuevo después de cargar
        const updatedIds = this.embeddableIds();
        const foundId = updatedIds.get(embeddableName);

        if (foundId) {
          return foundId;
        }
      } catch (error) {
        console.error('Error loading embeddable IDs:', error);
        return null;
      }
    }

    return null;
  }

  /**
   * Asegura que los embeddables estén cargados (lazy loading)
   */
  private async ensureEmbeddablesLoaded(): Promise<void> {
    const cachedData = this.getFromCache();

    if (cachedData && !this.isCacheExpired()) {
      this.embeddableIds.set(cachedData);
      return;
    }

    await this.fetchEmbeddableIds();
  }

  /**
   * Obtiene un token para un embeddable específico usando el nombre
   */
  async getTokenByEmbeddableName(embeddableName: EmbeddableNames, tokenKey: string): Promise<TokenDash> {
    const embeddableId = await this.getEmbeddableId(embeddableName);

    if (!embeddableId) {
      throw new Error(`ID de embeddable no encontrado para: ${embeddableName}`);
    }

    return this.getTokenWithExpiryCheck(tokenKey, embeddableId);
  }

  /**
   * Método de compatibilidad que mapea las claves de token actuales a nombres de embeddables
   */
  async getTokenByKey(tokenKey: string): Promise<TokenDash> {
    const embeddableName = TOKEN_MAP[tokenKey];

    if (!embeddableName) {
      throw new Error(`Clave de token no mapeada: ${tokenKey}`);
    }

    return this.getTokenByEmbeddableName(embeddableName, tokenKey);
  }

  /**
   * Lógica de token con verificación de expiración
   */
  private getTokenWithExpiryCheck(tokenKey: string, embeddableId: string): Promise<TokenDash> {
    return new Promise((resolve, reject) => {
      const storedToken = localStorage.getItem(tokenKey);

      if (storedToken) {
        try {
          const parsedToken: TokenDash = JSON.parse(storedToken);
          if (parsedToken.expiresAt && !this.isTokenExpired(parsedToken.expiresAt)) {
            resolve(parsedToken);
            return;
          }
          localStorage.removeItem(tokenKey);
        } catch (error) {
          localStorage.removeItem(tokenKey);
        }
      }

      this.fetchNewToken(embeddableId, tokenKey)
        .then(resolve)
        .catch(reject);
    });
  }

  /**
   * Obtiene un nuevo token desde la API de Embeddable.com
   */
  private async fetchNewToken(embeddableId: string, tokenKey: string): Promise<TokenDash> {
    if (!environment.embeddable?.apiUrl || !environment.embeddable?.apiKey) {
      throw new Error('Configuración de Embeddable incompleta');
    }

    const response = await fetch(environment.embeddable.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${environment.embeddable.apiKey}`,
      },
      body: JSON.stringify({
        embeddableId,
        expiryInSeconds: 60 * 60 * 24 * 7, // 7 días
        securityContext: {
          userId: '',
          regions: ['US'],
        },
        user: environment.embeddable.userId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch token');
    }

    const tokenResponse = await response.json();
    const expiresAt = this.calculateTokenExpiry(tokenResponse, 60 * 60 * 24 * 7);
    const token: TokenDash = { token: tokenResponse.token, expiresAt };

    localStorage.setItem(tokenKey, JSON.stringify(token));
    return token;
  }

  /**
   * Calcula la fecha de expiración del token
   */
  private calculateTokenExpiry(tokenResponse: any, expiryInSeconds: number): number {
    const jwtPayload = this.parseJwt(tokenResponse.token);
    if (jwtPayload && jwtPayload.exp) {
      return jwtPayload.exp * 1000; // Convert to milliseconds
    }
    return Date.now() + expiryInSeconds * 1000;
  }

  /**
   * Parsea un JWT token
   */
  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  /**
   * Verifica si un token ha expirado
   */
  private isTokenExpired(expiresAt: number): boolean {
    return Date.now() >= expiresAt;
  }

  /**
   * Guarda los IDs en localStorage con cifrado simple
   */
  private saveToCache(embeddableMap: Map<EmbeddableNames, string>): void {
    const dataToStore = Array.from(embeddableMap.entries());
    const encryptedData = btoa(JSON.stringify(dataToStore));

    localStorage.setItem(this.STORAGE_KEY, encryptedData);
    localStorage.setItem(this.STORAGE_EXPIRY_KEY, (Date.now() + this.CACHE_DURATION).toString());
  }

  /**
   * Carga los IDs desde localStorage
   */
  private loadFromCache(): void {
    const cachedData = this.getFromCache();
    if (cachedData && !this.isCacheExpired()) {
      this.embeddableIds.set(cachedData);
    }
  }

  /**
   * Obtiene datos del caché
   */
  private getFromCache(): Map<EmbeddableNames, string> | null {
    try {
      const encryptedData = localStorage.getItem(this.STORAGE_KEY);
      if (!encryptedData) return null;

      const decryptedData = atob(encryptedData);
      const parsedData = JSON.parse(decryptedData);
      return new Map(parsedData);
    } catch (error) {
      this.clearCache();
      return null;
    }
  }

  /**
   * Verifica si el caché ha expirado
   */
  private isCacheExpired(): boolean {
    const expiryTime = localStorage.getItem(this.STORAGE_EXPIRY_KEY);
    if (!expiryTime) return true;

    return Date.now() > parseInt(expiryTime, 10);
  }

  /**
   * Limpia el caché
   */
  clearCache(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.STORAGE_EXPIRY_KEY);
  }

  /**
   * Fuerza la recarga de los IDs desde la API
   */
  async refreshEmbeddableIds(): Promise<void> {
    this.clearCache();
    this.isInitialized = false;
    await this.initialize();
  }
}
