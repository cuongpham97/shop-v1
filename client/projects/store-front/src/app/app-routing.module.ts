import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './views/containers/layout/layout.component';

const routes: Routes = [
  { 
    path: '', component: LayoutComponent, children: [
      { path: '', loadChildren: () => import('./views/home/home.module').then(m => m.HomeModule) },
      { path: 'search', loadChildren: () => import('./views/search/search.module').then(m => m.SearchModule) },
      { path: 'products/:id', loadChildren: () => import('./views/detail/detail.module').then(m => m.DetailModule) },
      { path: 'cart', loadChildren: () => import('./views/cart/cart.module').then(m => m.CartModule) },
      { path: 'checkout', loadChildren: () => import('./views/checkout/checkout.module').then(m => m.CheckoutModule) },
      { path: 'customer', loadChildren: () => import('./views/customer/customer.module').then(m => m.CustomerModule) }
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
