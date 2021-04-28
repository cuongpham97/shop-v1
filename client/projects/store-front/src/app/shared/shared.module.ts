import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatetimeComponent } from './components/datetime/datetime.component';
import { CurrencyPipe } from './pipes/currency.pipe';
import { FirstSkuPipe } from './pipes/first-sku.pipe';

@NgModule({
  declarations: [
    DatetimeComponent,
    CurrencyPipe,
    FirstSkuPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    DatetimeComponent,
    CurrencyPipe,
    FirstSkuPipe
  ]
})
export class SharedModule { }
