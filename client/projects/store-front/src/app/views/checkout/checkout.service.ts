import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) { }

  getCustomer() {
    const uid = this.auth.getCurrentUser().uid;
    return this.http.get(`customers/${uid}`);
  }

  getProvinces() {
    return this.http.get('locations/provinces')
      .pipe(map(response => response['provinces']));
  }

  getDistrictsAndWards(province) {
    return this.http.get(`locations/provinces/${province}`);
  }

  getCheckOut() {
    return this.http.get(`checkouts`);
  }

  _prepareOrder(formValue) {
    return formValue;
  }

  createOrder(formValue) {
    return this.http.post(`/orders`, this._prepareOrder(formValue));
  }
}
