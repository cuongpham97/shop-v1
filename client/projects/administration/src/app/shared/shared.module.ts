import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TraceCategoryPathPipe } from './pipes/trace-category-path.pipe';
import { CategoryPickerComponent } from './components/category-picker/category-picker.component';

@NgModule({
  declarations: [
    CategoryPickerComponent,
    TraceCategoryPathPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    CategoryPickerComponent,
    TraceCategoryPathPipe
  ]
})
export class SharedModule { }
