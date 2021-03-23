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
    let querystring = this.utils.serialize(query);
    
    querystring = querystring.replace(/(orders=(?:[-\w]+,)*)(([^,=]+)=(desc|asc)))/);

    return this.http.get('/admin/categories');
  }
}
