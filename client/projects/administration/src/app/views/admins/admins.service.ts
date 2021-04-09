import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { UtilsService } from '../../services';

@Injectable({
  providedIn: 'root'
})
export class AdminsService {

  constructor(
    private http: HttpClient,
    private utils: UtilsService
  ) { }

  checkAdminName(name) {
    return this.http.get(`/admin/admins/exists?name=${name}`)
      .pipe(map(response => response['existed']));
  }

  getAdminById(id) {
    return this.http.get(`/admin/admins/${id}`);
  }
  
  getManyAdmins(query) {
    const querystring = this.utils.serialize(query).replace('filters', 'regexes');
    return this.http.get('/admin/admins?&' + querystring);
  }

  _prepareNewAdmin(data) {
    if ('parent' in data && !data['parent']) {
      delete data['parent'];
    }

    return data;
  }

  createAdmin(formData) {
    return this.http.post('/admin/admins', this._prepareNewAdmin(formData));
  }

  _prepareUpdateAdmin(data) {
    return {
      name: data.name,
      parent: data.parent || null,
      order: data.order,
      description: data.description
    }
  }

  updateAdmin(id, formData) {
    return this.http.patch(`/admin/admins/${id}`,this. _prepareUpdateAdmin(formData));
  }

  deleteAdmins(ids) {
    return this.http.delete('/admin/admins?ids=' + ids.join(','),{
      observe: 'response'
    });
  }
}
