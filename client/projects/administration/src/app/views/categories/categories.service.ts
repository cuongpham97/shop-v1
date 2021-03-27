import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { UtilsService } from '../../services';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  constructor(
    private http: HttpClient,
    private utils: UtilsService
  ) { }

  checkCategoryName(name) {
    return this.http.get(`/admin/categories/exists?name=${name}`)
      .pipe(map(response => response['existed']));
  }

  getCategoryById(id) {
    return this.http.get(`/admin/categories/${id}`);
  }
  getManyCategories(query) {
    const querystring = this.utils.serialize(query).replace('filters', 'regexes');
    return this.http.get('/admin/categories?populate&' + querystring);
  }

  _prepareNewCategory(data) {
    if ('parent' in data && !data['parent']) {
      delete data['parent'];
    }

    return data;
  }

  createCategory(formData) {
    return this.http.post('/admin/categories', this._prepareNewCategory(formData));
  }

  _prepareUpdateCategory(data) {
    return {
      name: data.name,
      parent: data.parent || null,
      order: data.order,
      description: data.description
    }
  }

  updateCategory(id, formData) {
    return this.http.patch(`/admin/categories/${id}`,this. _prepareUpdateCategory(formData));
  }

  deleteCategories(ids) {
    return this.http.delete('/admin/categories?ids=' + ids.join(','),{
      observe: 'response'
    });
  }
}
