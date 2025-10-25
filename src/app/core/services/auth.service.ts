import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, tap, catchError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
// TODO: Importar Firestore cuando se migren los métodos de Firebase
// import { Firestore, collection, doc, docData, onSnapshot } from '@angular/fire/firestore';

import type {
  Login,
  Tokens,
  RefreshTokenRequest,
  User,
  UserDataLogin,
  UserRole,
  Route,
  NavigationItem
} from '../models/auth.model';

import { IntercomService } from './intercom.service';
import { NavigationCacheService } from './navigation-cache.service';
import { environment } from '../../../environments/environment';

/**
 * AuthService - Modernizado con Signals (Angular 20)
 *
 * Cambios principales vs versión anterior:
 * ✅ BehaviorSubject → Signals
 * ✅ Constructor injection → inject()
 * ✅ Mejor type safety
 * ✅ Computed values para estado derivado
 * ✅ Mantiene toda la lógica de cache con IndexedDB
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Dependency injection con inject()
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  // TODO: Descomentar cuando se configure Firebase
  // private readonly firestore = inject(Firestore);
  private readonly intercom = inject(IntercomService);
  private readonly navigationCache = inject(NavigationCacheService);

  // TODO: Inyectar GetDataService cuando esté migrado
  // private readonly dataService = inject(GetDataService);

  // Constants
  private readonly JWT_TOKEN = 'JWT_TOKEN';
  private readonly REFRESH_TOKEN = 'REFRESH_TOKEN';
  private readonly USER = 'USER';

  // 🔥 SIGNALS - Estado reactivo
  readonly routesAllow = signal<NavigationItem[]>([]);
  readonly routeBackend = signal<Route[]>([]);
  readonly tokensData = signal<Tokens | null>(null);
  readonly currentUser = signal<User | null>(this.getUser());

  // 🔥 COMPUTED - Estado derivado
  readonly isLoggedIn = computed(() => !!this.getJwtToken());
  readonly userName = computed(() => this.currentUser()?.userName ?? '');
  readonly userFullName = computed(() => this.currentUser()?.fullName ?? '');
  readonly userRole = computed(() => this.currentUser()?.rolName ?? '');
  readonly userPhoto = computed(() => this.currentUser()?.photo ?? '');

  // 🎨 PRIMENG ICONS - Mapeo de routeId a PrimeIcons
  private readonly iconMap = new Map<number, string>([
    [1, 'pi pi-home'],           // Home
    [2, 'pi pi-chart-bar'],      // Dashboard
    [3, 'pi pi-headphones'],     // SAC/Support
    [4, 'pi pi-users'],          // Users
    [5, 'pi pi-comments'],       // Chat/Info
    [6, 'pi pi-car'],            // Drivers
    [7, 'pi pi-shopping-bag'],   // Shops
    [8, 'pi pi-cog'],            // Settings
    [9, 'pi pi-dollar'],         // Money/Accounting
    [10, 'pi pi-exclamation-triangle'], // Warnings/Contingencies
    [11, 'pi pi-building'],      // Restaurants
    [12, 'pi pi-shopping-cart'], // Comercios
  ]);

  constructor() {
    this.initializeCache();
  }

  // ============================================================================
  // CACHE INITIALIZATION
  // ============================================================================

  private async initializeCache(): Promise<void> {
    try {
      const isAvailable = await this.navigationCache.isCacheAvailable();
      if (isAvailable) {
        const deletedCount = await this.navigationCache.cleanOldCache();
        if (deletedCount > 0) {
          console.log(`🧹 Cleaned ${deletedCount} old cache entries`);
        }

        // Log cache stats in development
        if (this.isDevelopment()) {
          const stats = await this.navigationCache.getCacheStats();
          console.log('📊 Cache stats:', stats);
        }
      }
    } catch (error) {
      console.error('❌ Error initializing navigation cache:', error);
    }
  }

  // ============================================================================
  // LOGIN & LOGOUT
  // ============================================================================

  /**
   * Login usuario
   */
  login(credentials: Login): Observable<Tokens | null> {
    return this.http.post<Tokens>(`${environment.apiURL}Access/Login`, credentials).pipe(
      tap(async (result) => {
        // 🧹 Limpiar storage ANTES de guardar nueva data
        console.log('🧹 Limpiando storage antes del login...');
        await this.clearStorageOnLogin();

        // Guardar datos de autenticación
        this.routeBackend.set(result.modules);
        this.routesAllow.set(result.modules as any); // Convertir después
        this.authSave(result);

        // Cache routes for the user
        const userId = this.getUserId();
        const roleData = this.getUserRole();
        if (userId && roleData?.UserRole) {
          const navigationItems = this.convertRoutesToNavigationItem(result.modules);
          await this.navigationCache.saveUserRoutes(
            userId,
            navigationItems,
            roleData.UserRole
          );
        }

        // TODO: Descomentar cuando GetDataService esté migrado
        // this.dataService.getDataFromApis();

        this.tokensData.set(result);
        this.currentUser.set(this.getUser());

        console.log('✅ Login completado con data limpia');
      }),
      catchError((error) => {
        console.error('❌ Error en login:', error);
        return of(null);
      })
    );
  }

  /**
   * Logout usuario
   */
  async logout(): Promise<void> {
    // Clear user cache from IndexedDB
    const userId = this.getUserId();
    if (userId) {
      try {
        await this.navigationCache.deleteUserRoutes(userId);
        console.log('✅ User cache cleared from IndexedDB');
      } catch (error) {
        console.error('❌ Error clearing user cache:', error);
      }
    }

    this.doLogoutUser();
    this.goBackToLogin();
    this.intercom.shutdown();
  }

  /**
   * Limpiar datos del usuario
   */
  private doLogoutUser(): void {
    this.removeTokens();

    // Clear signals
    this.routesAllow.set([]);
    this.routeBackend.set([]);
    this.tokensData.set(null);
    this.currentUser.set(null);

    // Clear sessionStorage routes
    sessionStorage.removeItem('routesAllow');

    // Clear cached data from localStorage
    const keysToRemove: string[] = [
      'shortChannelList',
      'shortBrandList',
      'cityList',
      'countryList',
      'shortCityList',
      'shortPaymentMethodsList',
      'bipbip_embeddable_ids'
    ];

    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Clear dashboard tokens
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('Das') ||
        key.startsWith('Dash') ||
        key.includes('token') ||
        key.includes('cache') ||
        key.includes('embeddable')
      )) {
        localStorage.removeItem(key);
      }
    }

    sessionStorage.clear();

    console.log('🧹 Logout completo: localStorage y sessionStorage limpiados');
  }

  // ============================================================================
  // TOKEN MANAGEMENT
  // ============================================================================

  getJwtToken(): string | null {
    return localStorage.getItem(this.JWT_TOKEN);
  }

  getUserId(): string | null {
    const token = this.getJwtToken();
    if (!token) return null;

    try {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.UserId;
    } catch (error) {
      console.error('❌ Error decodificando el token', error);
      return null;
    }
  }

  getUserDataFromToken(): UserDataLogin | null {
    const token = this.getJwtToken();
    if (!token) return null;

    try {
      const decodedToken: any = jwtDecode(token);
      return {
        name: decodedToken.UserName,
        id: decodedToken.UserId
      };
    } catch (error) {
      console.error('❌ Error decodificando el token', error);
      return null;
    }
  }

  getUserRole(): UserRole | null {
    const token = this.getJwtToken();
    if (!token) return null;

    try {
      const decodedToken: any = jwtDecode(token);
      return { UserRole: decodedToken.UserRole || null };
    } catch (error) {
      console.error('❌ Error decodificando el token', error);
      return null;
    }
  }

  getUser(): User | null {
    const user = localStorage.getItem(this.USER);
    return user ? JSON.parse(user) : null;
  }

  private authSave(tokens: Tokens): void {
    localStorage.setItem(this.JWT_TOKEN, tokens.token);
    localStorage.setItem(this.REFRESH_TOKEN, tokens.refreshToken);

    const user: User = {
      userHas: tokens.iHash,
      userName: tokens.userName,
      fullName: tokens.fullName,
      rolName: tokens.rolName,
      photo: tokens.photo,
      email: tokens.email,
    };

    localStorage.setItem(this.USER, JSON.stringify(user));
  }

  /**
   * Refresh token
   */
  refreshToken(): Observable<Tokens> {
    return this.http.post<Tokens>(`${environment.apiURL}Access/RefreshToken`, {
      tokenExpired: this.getJwtToken(),
      refreshToken: this.getRefreshToken(),
    } as RefreshTokenRequest).pipe(
      tap((tokens: Tokens) => {
        localStorage.setItem(this.JWT_TOKEN, tokens.token);
        localStorage.setItem(this.REFRESH_TOKEN, tokens.refreshToken);
      })
    );
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN);
  }

  private removeTokens(): void {
    localStorage.removeItem(this.JWT_TOKEN);
    localStorage.removeItem(this.REFRESH_TOKEN);
    localStorage.removeItem(this.USER);
  }

  // ============================================================================
  // NAVIGATION & ROUTES
  // ============================================================================

  /**
   * Convertir rutas del backend a NavigationItems
   */
  private convertRoutesToNavigationItem(backendRoutes: Route[]): NavigationItem[] {
    const convertRoute = (route: Route, isTopLevel = false): NavigationItem => {
      const hasChildren = route.subModule?.length > 0;

      return {
        id: route.id,
        routeId: route.routeId,
        title: route.name ?? '',
        type: isTopLevel ? 'collapsable' : undefined,
        link: route.link,
        svgIcon: this.iconMap.get(route.routeId), // 🎨 PrimeIcons (nombre svgIcon por convención)
        children: hasChildren
          ? route.subModule.map(sub => convertRoute(sub))
          : undefined,
        unfolded: !isTopLevel && hasChildren ? false : undefined
      } as NavigationItem;
    };

    return backendRoutes
      .map(route => convertRoute(route, true))
      .sort((a, b) => (a.id as number) - (b.id as number));
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  goBackToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  /**
   * Limpiar storage antes del login
   */
  private async clearStorageOnLogin(): Promise<void> {
    try {
      const oldUserId = this.getUserId();
      if (oldUserId) {
        await this.navigationCache.deleteUserRoutes(oldUserId);
        console.log('🗑️ Cache del usuario anterior eliminado');
      }

      sessionStorage.clear();

      const keysToRemove: string[] = [
        'routesAllow',
        'shortChannelList',
        'shortBrandList',
        'cityList',
        'countryList',
        'shortCityList',
        'shortPaymentMethodsList',
        'bipbip_embeddable_ids'
      ];

      keysToRemove.forEach(key => localStorage.removeItem(key));

      console.log(`🧹 Storage limpiado: ${keysToRemove.length} items removidos`);
    } catch (error) {
      console.error('❌ Error limpiando storage en login:', error);
    }
  }

  /**
   * Verificar si estamos en desarrollo
   */
  private isDevelopment(): boolean {
    return window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1';
  }
}
