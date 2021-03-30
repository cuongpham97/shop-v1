import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LayoutComponent } from './views/containers/layout/layout.component';
import { SignInComponent } from './views/sign-in/sign-in.component';
import { NotFoundComponent } from './views/not-found/not-found.component';

const routes: Routes = [
  { path: 'login', component: SignInComponent, pathMatch: 'full' },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { 
    path: '', component: LayoutComponent, 
    children: [
      { 
        path: 'dashboard', loadChildren: () => import('./views/dashboard/dashboard.module').then(m => m.DashboardModule),
        canActivate: [AuthGuard]
      },
      { 
        path: 'catalog', children: [
          { 
            path: 'categories', loadChildren: () => import('./views/categories/categories.module').then(m => m.CategoriesModule),
            data: { permission: 'category.read' },
            canActivate: [AuthGuard]
          },
          { 
            path: 'products', loadChildren: () => import('./views/products/products.module').then(m => m.ProductsModule),
            data: { permission: 'product.read' },
            canActivate: [AuthGuard]
          }
        ] 
      },
      {
        path: 'customers', children: [
          { 
            path: 'customer-groups', loadChildren: () => import('./views/customer-groups/customer-groups.module').then(m => m.CustomerGroupsModule),
            data: { permission: 'customer-group.read' },
            canActivate: [AuthGuard]
          }
        ]
      },
      { path: 'page-not-found', component: NotFoundComponent },
      { path: '**', component: NotFoundComponent }
    ] 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    enableTracing: false, 
    scrollPositionRestoration: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
