import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TraceCategoryPathPipe } from './pipes/trace-category-path.pipe';
import { CategoryPickerComponent } from './components/category-picker/category-picker.component';
import { CurrencyPipe } from './pipes/currency.pipe';
import { ImageComponent } from './components/image/image.component';
import { DatetimeComponent } from './components/datetime/datetime.component';
import { PermissionFormComponent } from './components/permission-form/permission-form.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    CategoryPickerComponent,
    TraceCategoryPathPipe,
    CurrencyPipe,
    ImageComponent,
    DatetimeComponent,
    PermissionFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  exports: [
    CategoryPickerComponent,
    ImageComponent,
    TraceCategoryPathPipe,
    CurrencyPipe,
    DatetimeComponent,
    PermissionFormComponent
  ]
})
export class SharedModule { }
