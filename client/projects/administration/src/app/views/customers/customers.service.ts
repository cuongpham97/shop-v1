import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { UtilsService } from '../../services';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {

  constructor(
    private http: HttpClient,
    private utils: UtilsService
  ) { }

  // checkCustomerName(name) {
  //   return this.http.get(`/admin/customers/exists?name=${name}`)
  //     .pipe(map(response => response['existed']));
  // }

  getCustomerById(id) {
    return this.http.get(`/admin/customers/${id}`);
  }
  getManyCustomers(query) {
    const querystring = this.utils.serialize(query).replace('filters', 'regexes');
    return this.http.get('/admin/customers?' + querystring);
  }

  _prepareCustomer(data) {
    return data;
  }

  createCustomer(formData) {
    return this.http.post('/admin/customers', this._prepareCustomer(formData));
  }


  updateCustomer(id, formData) {
    return this.http.patch(`/admin/customers/${id}`,this._prepareCustomer(formData));
  }

  deleteCustomers(ids) {
    return this.http.delete('/admin/customers?ids=' + ids.join(','),{
      observe: 'response'
    });
  }
}
