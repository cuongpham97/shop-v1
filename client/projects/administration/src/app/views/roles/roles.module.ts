import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RolesRoutingModule } from './roles-routing.module';
import { RolesComponent } from './roles.component';
import { DatatableModule } from '../datatable/datatable.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { RoleFormComponent } from './role-form/role-form.component';

@NgModule({
  declarations: [
    RolesComponent,
    RoleFormComponent
  ],
  imports: [
    CommonModule,
    RolesRoutingModule,
    DatatableModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class RolesModule { }
