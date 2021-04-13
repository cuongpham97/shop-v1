import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import { UtilsService } from 'projects/store-front/src/app/services';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  constructor(
    private http: HttpClient,
    private utils: UtilsService
  ) { }

  getCategoriesTree() {
    return this.http.get('/categories/tree')
      .pipe(map(response => response['categories']));
  }

  _prepareCustomer(data) {
    const customer = {
      displayName: data.name,
      gender: data.gender,
      birthday: data.birthday,
      local: {
        email: data.email,
        phone: data.phone,
        password: data.password
      }
    }

    if (!data.email) {
      delete customer.local.email;
    }

    return customer;
  }

  registerNewCustomerAccount(formData) {
    return this.http.post(`/customers`, this._prepareCustomer(formData));
  }

  checkUniqueCustomer(emailOrPhone: object) {
    return this.http.get(`/customers/exists?` + this.utils.serialize(emailOrPhone))
      .pipe(map(response => response['existed']));
  }
}
