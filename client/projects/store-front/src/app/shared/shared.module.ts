import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatetimeComponent } from './components/datetime/datetime.component';

@NgModule({
  declarations: [
    DatetimeComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    DatetimeComponent
  ]
})
export class SharedModule { }
