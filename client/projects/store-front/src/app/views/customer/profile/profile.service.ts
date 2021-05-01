import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../../../services';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(
    private auth: AuthService,
    private http: HttpClient
  ) { }

  getCurrentCustomer() {
    const uid = this.auth.getCurrentUser().uid;
    return this.http.get(`/customers/${uid}`);
  }

  _prepareCustomer(formValue) {
    return formValue;
  }

  updateCustomer(formValue) {
    const uid = this.auth.getCurrentUser().uid;
    return this.http.patch(`/customers/${uid}`, this._prepareCustomer(formValue));
  }
}
