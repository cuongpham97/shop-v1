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

  _prepareAddress(formData) {
    formData['type'] = 'HOME';

    return formData;
  }

  createOrEditAddress(oldAddresses, index, formData) {
    const addresses = oldAddresses.map(address => {
      return {
        name: address.name,
        phone: address.phone,
        type: address.type,
        address: {
          street: address.address.street,
          ward: address.address.ward.code,
          district: address.address.district.code,
          province: address.address.province.code
        }
      }
    });

    if (index == -1) {
      addresses.push(this._prepareAddress(formData));
    
    } else {
      addresses[index] = this._prepareAddress(formData);
    }

    const uid = this.auth.getCurrentUser().uid;
    return this.http.patch(`/customers/${uid}`, { addresses: addresses })
      .pipe(map(response => response['addresses']));
  }

  deleteAddress(oldAddresses, index) {
    const addresses = oldAddresses.map(address => {
      return {
        name: address.name,
        phone: address.phone,
        type: address.type,
        address: {
          street: address.address.street,
          ward: address.address.ward.code,
          district: address.address.district.code,
          province: address.address.province.code
        }
      }
    });

    addresses.splice(index, 1);

    const uid = this.auth.getCurrentUser().uid;
    return this.http.patch(`/customers/${uid}`, { addresses: addresses })
      .pipe(map(response => response['addresses']));
  }

  _prepareOrder(formValue) {
    return formValue;
  }

  createOrder(formValue) {
    return this.http.post(`/orders`, this._prepareOrder(formValue));
  }
}
