import { Routes } from '@angular/router';

export const productsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/product-list-page/product-list-page.component').then(
        (m) => m.ProductListPageComponent,
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/product-create-page/product-create-page.component').then(
        (m) => m.ProductCreatePageComponent,
      ),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/product-edit-page/product-edit-page.component').then(
        (m) => m.ProductEditPageComponent,
      ),
  },
];
