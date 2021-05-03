import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  constructor(
    private http: HttpClient
  ) { }

  getOrders() {
    return this.http.get(`/orders?orders=-createdAt`)
      .pipe(map(response => response['data']));
  }

  cancelOrder(id, status) {
    return this.http.post(`/orders/${id}/status`, status, {
      observe: 'response'
    });
  }
}
