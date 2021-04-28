import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(
    private http: HttpClient
  ) { }

  getCategoriesTree() {
    return this.http.get(`/categories/tree`)
      .pipe(map(response => response['categories']));
  }

  getNewArrival(page, pageSize = 8) {
    return this.http.get(`/collections/newArrival?page=${page}&pageSize=${pageSize}`);
  }

  getProductsOfCategory(categoryName) {
    return this.http.get(`/collections?regexes=categories.path=${categoryName}&orders=-_id`);
  }
}
