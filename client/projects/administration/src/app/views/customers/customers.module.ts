import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomersRoutingModule } from './customers.routing';
import { CustomersComponent } from './customers.component';
import { DatatableModule } from '../datatable/datatable.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
//import { CustomerFormComponent } from './customer-form/customer-form.component';

@NgModule({
  declarations: [
    CustomersComponent 
    //CustomerFormComponent
  ],
  imports: [
    CommonModule,
    CustomersRoutingModule,
    DatatableModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class CustomersModule { }
