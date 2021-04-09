import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminsRoutingModule } from './admins-routing.module';
import { AdminsComponent } from './admins.component';
import { DatatableModule } from '../datatable/datatable.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
//import { AdminFormComponent } from './--admin-form/admin-form.component';

@NgModule({
  declarations: [
    AdminsComponent 
    //AdminFormComponent
  ],
  imports: [
    CommonModule,
    AdminsRoutingModule,
    DatatableModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class AdminsModule { }
