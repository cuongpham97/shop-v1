import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TraceCategoryPathPipe } from './pipes/trace-category-path.pipe';
import { CategoryPickerComponent } from './components/category-picker/category-picker.component';
import { CurrencyPipe } from './pipes/currency.pipe';
import { ImageComponent } from './components/image/image.component';

@NgModule({
  declarations: [
    CategoryPickerComponent,
    TraceCategoryPathPipe,
    CurrencyPipe,
    ImageComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    CategoryPickerComponent,
    ImageComponent,
    TraceCategoryPathPipe,
    CurrencyPipe
  ]
})
export class SharedModule { }
