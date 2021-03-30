import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UtilsService } from '../../services';

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

  _prepareNewProduct(data) {
    
    //TODO;
    return data;
  }

  createProduct(formData) {
    return this.http.post('/admin/products', this._prepareNewProduct(formData));
  }

  _prepareUpdateProduct(data) {
    return {
      //TODO;
    }
  }

  updateProduct(id, formData) {
    return this.http.patch(`/admin/products/${id}`,this. _prepareUpdateProduct(formData));
  }

  deleteProducts(ids) {
    return this.http.delete('/admin/products?ids=' + ids.join(','),{
      observe: 'response'
    });
  }
}
