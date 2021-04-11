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

  registerNewCustomerAccount(user) {
    return this.http.post(`/users`, user);
  }

  checkUniqueCustomer(emailOrPhone: object) {
    return this.http.get(`/customers/exists?` + this.utils.serialize(emailOrPhone))
      .pipe(map(response => response['existed']));
  }
}
