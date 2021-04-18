import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(
    private http: HttpClient
  ) { }

  getNewArrival(page, pageSize = 8) {
    return this.http.get(`/collections/newArrival?page=${page}&pageSize=${pageSize}`);
  }

  getProductsOfCategory(categoryName) {
    return this.http.get(`/collections?regexes=categories.path=${categoryName}&orders=-_id`);
  }
}
