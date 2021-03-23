import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LayoutComponent } from './views/containers/layout/layout.component';
import { LoginComponent } from './views/login/login.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent, pathMatch: 'full' },
  { 
    path: '', component: LayoutComponent, 
    children: [
      { 
        path: 'categories', loadChildren: () => import('./views/categories/categories.module').then(m => m.CategoriesModule),
        data: { permission: 'category.read' },
        canActivate: [AuthGuard]
      }
    ] 
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    enableTracing: false, 
    scrollPositionRestoration: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
