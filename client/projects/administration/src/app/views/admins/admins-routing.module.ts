import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminsComponent } from './admins.component';
//import { AdminFormComponent } from './--admin-form/admin-form.component';

const routes: Routes = [
  { 
    path: "", children: [
      { path: '', component: AdminsComponent }
      //{ path: 'new', component: AdminFormComponent },
      //{ path: 'edit/:id', component: AdminFormComponent }
    ] 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminsRoutingModule { }
