import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DetailService {

  constructor(private http: HttpClient) { }

  getProduct(id) {
    return this.http.get(`/collections/products/${id}`);
  }

  getCategory(id) {
    return this.http.get(`/categories/${id}?populates=categories.ancestors`);
  }

  getReviews(pid, page = 0, pageSize = 5 ) {
    return this.http.get(`/reviews?filters=item=${pid}&page=${page}&pageSize=${pageSize}&orders=-updatedAt`)
      .pipe(map(response => (response as any).reviews));
  }
}
