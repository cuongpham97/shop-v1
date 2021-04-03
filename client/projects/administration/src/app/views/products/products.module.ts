import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductsRoutingModule } from './products-routing.module';
import { ProductsComponent } from './products.component';
import { DatatableModule } from '../datatable/datatable.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { ProductFormComponent } from './product-form/product-form.component';
import { CKEditorModule } from 'ckeditor4-angular';

@NgModule({
  declarations: [
    ProductsComponent,
    ProductFormComponent
  ],
  imports: [
    CommonModule,
    ProductsRoutingModule,
    DatatableModule,
    FormsModule,
    ReactiveFormsModule,
    CKEditorModule,
    SharedModule
  ]
})
export class ProductsModule { }
