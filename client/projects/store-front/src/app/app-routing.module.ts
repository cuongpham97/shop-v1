import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './views/containers/layout/layout.component';

const routes: Routes = [
  { 
    path: '', component: LayoutComponent, children: [
      { path: '', loadChildren: () => import('./views/home/home.module').then(m => m.HomeModule) }
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
