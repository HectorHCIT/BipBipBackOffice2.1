import { Injectable, signal, computed, inject, untracked } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Firestore, collection, query, where, onSnapshot, Unsubscribe } from '@angular/fire/firestore';

import { NavigationItem, FirebaseData, Route } from '../models/auth.model';
import { navigationData } from '../data/navigation.data';

/**
 * NavigationService
 *
 * Gestiona la navegación del sidebar con:
 * - Filtrado de rutas según permisos del usuario
 * - Estado de colapso/expansión de items
 * - Active route detection
 * - Firebase permissions integration
 * - Signals para estado reactivo
 */
@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private readonly router = inject(Router);
  private readonly firestore = inject(Firestore);

  // Private writable signals
  private readonly _navigation = signal<NavigationItem[]>([]);
  private readonly _isLoading = signal(false);
  private readonly _countSAC = signal(0);
  private readonly _countSACDriver = signal(0);

  // Public readonly signals
  readonly navigation = this._navigation.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly countSAC = this._countSAC.asReadonly();
  readonly countSACDriver = this._countSACDriver.asReadonly();

  // Computed signals
  readonly countChatActive = computed(() => this._countSAC() + this._countSACDriver());

  // Unsubscribe functions for Firebase listeners
  private unsubscribes: Unsubscribe[] = [];

  constructor() {
    // Listen to route changes to update active states
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateExactMatches(event.urlAfterRedirects);
      });
  }

  /**
   * Carga y filtra las rutas de navegación según permisos del usuario
   *
   * @param allowedRoutes - Rutas permitidas desde el backend (result.modules del login)
   * @param firebasePermissions - Permisos adicionales desde Firebase
   */
  loadNavigation(allowedRoutes: Route[], firebasePermissions?: FirebaseData[]): void {
    this._isLoading.set(true);

    try {
      // Convertir rutas del backend a NavigationItems
      const navigationItems = this.convertRoutesToNavigationItems(allowedRoutes);

      // Inicializar propiedades unfolded
      this.ensureUnfoldedInitialized(navigationItems);

      // Actualizar signal
      this._navigation.set(navigationItems);

      // Actualizar exact matches con URL actual
      this.updateExactMatches(this.router.url);
    } catch (error) {
      console.error('Error loading navigation:', error);
      this._navigation.set([]);
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Convierte rutas del backend a NavigationItems
   * Mantiene TODA la estructura de 3 niveles (padre → hijo → nieto)
   */
  private convertRoutesToNavigationItems(backendRoutes: Route[]): NavigationItem[] {
    const convertRoute = (route: Route, isTopLevel = false): NavigationItem => {
      const hasChildren = route.subModule && route.subModule.length > 0;

      // Mapeo de routeId a iconos PrimeNG
      const iconMap = new Map<number, string>([
        [1, 'pi pi-home'],
        [2, 'pi pi-chart-bar'],
        [3, 'pi pi-headphones'],
        [4, 'pi pi-user'],
        [5, 'pi pi-bell'],
        [6, 'pi pi-car'],
        [7, 'pi pi-building'],
        [8, 'pi pi-cog'],
        [9, 'pi pi-dollar'],
        [10, 'pi pi-exclamation-triangle'],
        [11, 'pi pi-exclamation-triangle'],
        [12, 'pi pi-shopping-bag'],
      ]);

      return {
        id: route.id,
        routeId: route.routeId,
        title: route.name ?? '',
        type: isTopLevel ? 'collapsable' : undefined,
        link: route.link,
        icon: iconMap.get(route.routeId), // Usar 'icon' en lugar de 'svgIcon'
        children: hasChildren
          ? route.subModule!.map(sub => convertRoute(sub, false))
          : undefined,
        unfolded: false
      } as NavigationItem;
    };

    return backendRoutes
      .map(route => convertRoute(route, true))
      .sort((a, b) => (a.id as number) - (b.id as number));
  }

  /**
   * Filtra recursivamente las rutas según los IDs permitidos
   *
   * Lógica:
   * 1. Filtrar items que están permitidos O que tienen hijos permitidos
   * 2. Para cada item permitido, filtrar recursivamente sus hijos
   */
  private filterNavigationByPermissions(
    items: NavigationItem[],
    allowedIds: Set<number>
  ): NavigationItem[] {
    const filtered: NavigationItem[] = [];

    for (const item of items) {
      const itemId = Number(item.id);

      // Filtrar recursivamente los hijos primero
      const filteredChildren = item.children && item.children.length > 0
        ? this.filterNavigationByPermissions(item.children, allowedIds)
        : undefined;

      // Incluir el item si:
      // 1. Está en la lista de permitidos, O
      // 2. Tiene al menos un hijo permitido (después del filtrado)
      const isAllowed = allowedIds.has(itemId);
      const hasAllowedChildren = filteredChildren && filteredChildren.length > 0;

      if (isAllowed || hasAllowedChildren) {
        filtered.push({
          ...item,
          children: filteredChildren
        });
      }
    }

    return filtered;
  }

  /**
   * Inicializa la propiedad unfolded en false si no existe
   */
  private ensureUnfoldedInitialized(items: NavigationItem[]): void {
    items.forEach(item => {
      if (item.unfolded === undefined) {
        item.unfolded = false;
      }
      if (item.children) {
        this.ensureUnfoldedInitialized(item.children);
      }
    });
  }

  /**
   * Actualiza los estados de exactMatch según la URL actual
   */
  updateExactMatches(url: string): void {
    const currentNavigation = [...this._navigation()];

    currentNavigation.forEach((item) => {
      item.exactMatch = false;

      if (item.children) {
        item.children.forEach((child) => {
          child.exactMatch = false;

          if (child.children) {
            child.children.forEach((grandChild) => {
              if (grandChild.link) {
                if (this.urlsMatch(url, grandChild.link)) {
                  item.exactMatch = true;
                  child.exactMatch = true;
                  grandChild.exactMatch = true;
                } else {
                  grandChild.exactMatch = false;
                }
              }
            });
          } else if (child.link) {
            if (this.urlsMatch(url, child.link)) {
              item.exactMatch = true;
              child.exactMatch = true;
            }
          }
        });
      } else if (item.link) {
        if (this.urlsMatch(url, item.link)) {
          item.exactMatch = true;
        }
      }
    });

    this._navigation.set(currentNavigation);
  }

  /**
   * Verifica si dos URLs coinciden
   */
  private urlsMatch(currentUrl: string, linkUrl: string): boolean {
    // Exact match
    if (currentUrl.includes(linkUrl)) {
      return true;
    }

    // Special case for commerce/comercios
    if (currentUrl.includes('/commerce') && linkUrl.includes('/comercios')) {
      return true;
    }

    // Get first segment for broader matching
    const currentSegments = currentUrl.split('/').filter(s => s);
    const linkSegments = linkUrl.split('/').filter(s => s);

    if (currentSegments.length > 0 && linkSegments.length > 0) {
      // Check if they share the same base route
      return currentSegments[0] === linkSegments[0];
    }

    return false;
  }

  /**
   * Toggle del estado unfolded de un item de navegación
   */
  toggleNavigationItem(itemId: string | number): void {
    const currentNavigation = [...this._navigation()];
    this.updateItemInNavigation(currentNavigation, itemId, (item) => {
      item.unfolded = !item.unfolded;
    });
    this._navigation.set(currentNavigation);
  }

  /**
   * Actualiza un item específico en la navegación
   */
  private updateItemInNavigation(
    navigation: NavigationItem[],
    itemId: string | number,
    updateFn: (item: NavigationItem) => void
  ): boolean {
    for (const navItem of navigation) {
      if (navItem.id === itemId) {
        updateFn(navItem);
        return true;
      }
      if (navItem.children && this.updateItemInNavigation(navItem.children, itemId, updateFn)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Resetea todos los items a estado collapsed
   */
  resetNavigationState(): void {
    const resetItem = (item: NavigationItem): void => {
      item.unfolded = false;
      item.exactMatch = false;
      if (item.children?.length) {
        item.children.forEach(resetItem);
      }
    };

    const currentNavigation = [...this._navigation()];
    currentNavigation.forEach(resetItem);
    this._navigation.set(currentNavigation);
  }

  /**
   * Conecta con Firebase para contar chats activos (SAC)
   * Esto actualiza los badges en el sidebar
   *
   * @param userId - ID del usuario para filtrar notificaciones
   */
  connectChatNotifications(userId: string): void {
    if (!userId) {
      console.warn('No user ID provided for chat notifications');
      return;
    }

    // Ejecutar las llamadas a Firebase fuera del contexto de signals para evitar warnings
    untracked(() => {
      // Query para SAC
      const qSAC = query(
        collection(this.firestore, 'SAC'),
        where('userId', '==', userId)
      );

      // Query para SACDriver
      const qDriver = query(
        collection(this.firestore, 'SACDriver'),
        where('userId', '==', userId)
      );

      // Suscripción a SAC
      const unsubSAC = onSnapshot(
        qSAC,
        (snap) => {
          this._countSAC.set(snap.size);
          this.updateChatBadges();
        },
        (err) => console.error('Error SAC:', err)
      );
      this.unsubscribes.push(unsubSAC);

      // Suscripción a SACDriver
      const unsubDriver = onSnapshot(
        qDriver,
        (snap) => {
          this._countSACDriver.set(snap.size);
          this.updateChatBadges();
        },
        (err) => console.error('Error SACDriver:', err)
      );
      this.unsubscribes.push(unsubDriver);
    });
  }

  /**
   * Actualiza los badges de notificaciones en los items del sidebar
   */
  private updateChatBadges(): void {
    const totalChats = this.countChatActive();

    if (totalChats === 0) return;

    const currentNavigation = [...this._navigation()];

    // Buscar el item de SAC (id: 3) y actualizar su badge
    const sacItem = currentNavigation.find(item => item.id === 3);
    if (sacItem) {
      sacItem.badge = totalChats;
      sacItem.badgeSeverity = 'danger';
    }

    this._navigation.set(currentNavigation);
  }

  /**
   * Limpia todas las suscripciones de Firebase
   */
  cleanup(): void {
    this.unsubscribes.forEach(unsub => unsub());
    this.unsubscribes = [];
  }

  /**
   * Navega a una ruta
   */
  navigate(route: string): void {
    this.router.navigate([route]);
  }
}
