import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';

@Pipe({
  name: 'firstSku'
})
export class FirstSkuPipe implements PipeTransform {

  transform(products: any): Array<any> {
    if (!products) return null;

    return _.cloneDeep(products).map(product => {

      const sku = product.skus[0];

      product['images'] = sku['images'];
      product['pricing'] = sku['pricing'];
      product['attributes'] = sku['attributes'];

      delete product.skus;
      delete product.price;
      
      return product;
    });
  }
}
