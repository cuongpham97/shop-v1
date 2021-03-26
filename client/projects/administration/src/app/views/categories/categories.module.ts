import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CategoriesRoutingModule } from './categories-routing.module';
import { CategoriesComponent } from './categories.component';
import { DatatableModule } from '../datatable/datatable.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { CategoryFormComponent } from './category-form/category-form.component';

@NgModule({
  declarations: [CategoriesComponent, CategoryFormComponent],
  imports: [
    CommonModule,
    CategoriesRoutingModule,
    DatatableModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class CategoriesModule { }
