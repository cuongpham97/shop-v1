import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { UtilsService } from '../../services';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  constructor(
    private http: HttpClient,
    private utils: UtilsService
  ) { }

  checkRoleName(name) {
    return this.http.get(`/admin/roles/exists?name=${name}`)
      .pipe(map(response => response['existed']));
  }

  getRoleById(id) {
    return this.http.get(`/admin/roles/${id}`);
  }
  
  getManyRoles(query) {
    const querystring = this.utils.serialize(query).replace('filters', 'regexes');
    return this.http.get('/admin/roles?&' + querystring);
  }

  _prepareRole(data) {
    return data;
  }

  createRole(formData) {
    return this.http.post('/admin/roles', this._prepareRole(formData));
  }

  updateRole(id, formData) {
    return this.http.patch(`/admin/roles/${id}`,this. _prepareRole(formData));
  }

  deleteRoles(ids) {
    return this.http.delete('/admin/roles?ids=' + ids.join(','),{
      observe: 'response'
    });
  }
}
