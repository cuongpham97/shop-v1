import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services';

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
    return this.http.get(`/customers/${uid}`);
  }

  getCheckOut() {
    return this.http.get(`/checkouts`);
  }

  _prepareOrder(formValue) {
    return formValue;
  }

  createOrder(formValue) {
    return this.http.post(`/orders`, this._prepareOrder(formValue));
  }
}
