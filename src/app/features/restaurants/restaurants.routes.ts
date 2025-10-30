import { Routes } from '@angular/router';

export const RESTAURANTS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'restaurant',
    pathMatch: 'full'
  },
  {
    path: 'restaurant',
    loadComponent: () =>
      import('./pages/restaurants-list/restaurants-list.component').then(
        m => m.RestaurantsListComponent
      ),
    title: 'Gestión de Restaurantes'
  },
  {
    path: 'restaurant/create',
    loadComponent: () =>
      import('./pages/restaurant-detail/restaurant-detail.component').then(
        m => m.RestaurantDetailComponent
      ),
    title: 'Crear Restaurante'
  },
  {
    path: 'restaurant/:id',
    loadComponent: () =>
      import('./pages/restaurant-detail/restaurant-detail.component').then(
        m => m.RestaurantDetailComponent
      ),
    title: 'Detalles del Restaurante'
  },
  {
    path: 'restaurant/:id/edit',
    loadComponent: () =>
      import('./pages/restaurant-detail/restaurant-detail.component').then(
        m => m.RestaurantDetailComponent
      ),
    title: 'Editar Restaurante'
  }
];
