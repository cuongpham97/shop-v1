import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UtilsService } from '../../services';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  constructor(
    private http: HttpClient,
    private utils: UtilsService
  ) { }

  getManyCategories(query) {
    const querystring = this.utils.serialize(query).replace('filters', 'regexes');
    
    return this.http.get('/admin/categories?populate&' + querystring);
  }
}
