import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UtilsService } from '../../services';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  constructor(
    private http: HttpClient,
    private utils: UtilsService
  ) { }

  getOrderById(id) {
    return this.http.get(`/admin/orders/${id}`);
  }
  
  getManyOrders(query) {
    const querystring = this.utils.serialize(query).replace('filters', 'regexes');
    return this.http.get('/admin/orders?&' + querystring);
  }

  _prepareNewOrder(data) {
    return data;
  }

  createOrder(formData) {
    return this.http.post('/admin/orders', this._prepareNewOrder(formData));
  }

  _prepareUpdateOrder(data) {
    return {
      name: data.name,
      parent: data.parent || null,
      order: data.order,
      description: data.description
    }
  }

  updateOrder(id, formData) {
    return this.http.patch(`/admin/orders/${id}`,this. _prepareUpdateOrder(formData));
  }

  deleteOrders(ids) {
    return this.http.delete('/admin/orders?ids=' + ids.join(','),{
      observe: 'response'
    });
  }
}
