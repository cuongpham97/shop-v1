import { Pipe, PipeTransform } from '@angular/core';
import * as currencyFormatter from 'currency-formatter';

@Pipe({
  name: 'currency'
})
export class CurrencyPipe implements PipeTransform {
  transform(value: unknown, symbol: unknown): unknown {
    if (!value) return '';
    return currencyFormatter.format(value, { symbol: symbol, decimal: ',', thousand: '.', precision: 0, format: '%v %s' });
  }
}
