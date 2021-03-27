import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerGroupsRoutingModule } from './customer-groups.routing';
import { CustomerGroupsComponent } from './customer-groups.component';
import { DatatableModule } from '../datatable/datatable.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { CustomerGroupFormComponent } from './customer-group-form/customer-group-form.component';

@NgModule({
  declarations: [CustomerGroupsComponent, CustomerGroupFormComponent],
  imports: [
    CommonModule,
    CustomerGroupsRoutingModule,
    DatatableModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class CustomerGroupsModule { }
