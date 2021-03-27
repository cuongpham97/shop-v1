import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CustomerGroupsComponent } from './customer-groups.component';
import { CustomerGroupFormComponent } from './customer-group-form/customer-group-form.component';

const routes: Routes = [
  { 
    path: "", children: [
      { path: '', component: CustomerGroupsComponent },
      { path: 'new', component: CustomerGroupFormComponent },
      { path: 'edit/:id', component: CustomerGroupFormComponent }
    ] 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerGroupsRoutingModule { }
