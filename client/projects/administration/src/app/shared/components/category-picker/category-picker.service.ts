import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class CategoryPickerService {

  constructor(private http: HttpClient) { }

  getCategories(ids) {
    return this.http.get(`/admin/categories?ids=${ids}&populate&orders=name`)
      .pipe(map(dataset => dataset['data']));
  }

  getCategoriesTree() {
    return this.http.get(`/categories/tree`);
  }
}
