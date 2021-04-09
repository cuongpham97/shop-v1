import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CustomersComponent } from './customers.component';
//import { CustomerFormComponent } from './customer-form/customer-form.component';

const routes: Routes = [
  { 
    path: "", children: [
      { path: '', component: CustomersComponent }
      //{ path: 'new', component: CustomerFormComponent },
      //{ path: 'edit/:id', component: CustomerFormComponent }
    ] 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomersRoutingModule { }
