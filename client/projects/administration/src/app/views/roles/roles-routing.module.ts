import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RolesComponent } from './roles.component';
import { RoleFormComponent } from './role-form/role-form.component';

const routes: Routes = [
  { 
    path: "", children: [
      { path: '', component: RolesComponent },
      { path: 'new', component: RoleFormComponent },
      { path: 'edit/:id', component: RoleFormComponent }
    ] 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RolesRoutingModule { }
