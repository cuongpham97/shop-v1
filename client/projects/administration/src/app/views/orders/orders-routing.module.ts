import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OrdersComponent } from './orders.component';
//import { OrderFormComponent } from './--order-form/order-form.component';

const routes: Routes = [
  { 
    path: "", children: [
      { path: '', component: OrdersComponent }
      //{ path: 'new', component: OrderFormComponent },
      //{ path: 'edit/:id', component: OrderFormComponent }
    ] 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdersRoutingModule { }
