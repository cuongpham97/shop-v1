import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UtilsService } from '../../services';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(
    private http: HttpClient,
    private utils: UtilsService
  ) { }

  getProductById(id) {
    return this.http.get(`/admin/products/${id}`);
  }

  getManyProducts(query) {
    const querystring = this.utils.serialize(query).replace('filters', 'regexes');
    
    return this.http.get('/admin/products?fields=-description&' + querystring);
  }

  _prepareProduct(data) {
    const product = _.cloneDeep(data);

    product.skus.forEach(sku => {
      sku.images = sku.images.filter(Boolean).map(image => image._id);
    });
    
    console.log(product);

    return product;
  }

  createProduct(formData) {
    return this.http.post('/admin/products', this._prepareProduct(formData));
  }



  updateProduct(id, formData) {
    return this.http.patch(`/admin/products/${id}`,this. _prepareProduct(formData));
  }

  deleteProducts(ids) {
    return this.http.delete('/admin/products?ids=' + ids.join(','), {
      observe: 'response'
    });
  }

  getAllCustomerGroups() {
    return this.http.get('/admin/customer-groups')
      .pipe(map(dataset => dataset['data']));
  }
}
