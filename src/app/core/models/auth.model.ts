/**
 * Auth Models & Interfaces
 * Tipos relacionados con autenticación, tokens y rutas
 */

export interface Login {
  userName: string;
  password: string;
}

export interface Tokens {
  userName: string;
  fullName: string;
  rolName: string;
  token: string;
  email: string;
  iHash: string;
  refreshToken: string;
  photo: string;
  modules: Route[];
}

export interface RefreshTokenRequest {
  tokenExpired: string;
  refreshToken: string;
}

export interface User {
  userHas: string;
  userName: string;
  fullName: string;
  rolName: string;
  photo: string;
  email: string;
}

export interface UserDataLogin {
  name: string;
  id: string;
}

export interface UserRole {
  UserRole: string | null;
}

export interface Route {
  id: number;
  routeId: number;
  name: string | null;
  parentId: number | null;
  link: string;
  allowed: boolean;
  subModule: Route[];
}

export interface Icon {
  id: number;
  svg: string;
}

export interface FirebaseData {
  id: number;
  allowed: boolean;
  route_id: number;
}

export interface Module {
  id: number;
  link: string;
  allowed: boolean;
}

/**
 * Navigation Item (usado en sidebar y routing)
 */
export interface NavigationItem {
  id: number | string;
  routeId?: number;
  title?: string;
  type?: 'basic' | 'collapsable' | 'divider';
  link?: string;
  svgIcon?: string;
  icon?: string;
  children?: NavigationItem[];
  unfolded?: boolean;
  exactMatch?: boolean;
  data?: any[];
  disabled?: boolean;
  externalLink?: boolean;
  hidden?: (item: NavigationItem) => boolean;
  badge?: string | number;
  badgeSeverity?: 'success' | 'info' | 'warn' | 'danger';
}
