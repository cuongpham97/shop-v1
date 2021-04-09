import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrdersRoutingModule } from './orders-routing.module';
import { OrdersComponent } from './orders.component';
import { DatatableModule } from '../datatable/datatable.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
//import { OrderFormComponent } from './--order-form/order-form.component';

@NgModule({
  declarations: [
    OrdersComponent 
    //OrderFormComponent
  ],
  imports: [
    CommonModule,
    OrdersRoutingModule,
    DatatableModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class OrdersModule { }
