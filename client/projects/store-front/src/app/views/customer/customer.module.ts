import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerRoutingModule } from './customer-routing.module';
import { CustomerComponent } from './customer.component';
import { ProfileComponent } from './profile/profile.component';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  declarations: [CustomerComponent, ProfileComponent],
  imports: [
    CommonModule,
    CustomerRoutingModule,
    SharedModule
  ]
})
export class CustomerModule { }
