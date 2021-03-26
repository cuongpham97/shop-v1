import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class CategoryPickerService {

  constructor(private http: HttpClient) { }

  getCategoryById(id) {
    return this.http.get(`/admin/categories/${id}?populate`);
  }

  getCategoriesTree() {
    return this.http.get(`/categories/tree`);
  }
}
