import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { UtilsService } from '../../services';

@Injectable({
  providedIn: 'root'
})
export class CustomerGroupsService {

  constructor(
    private http: HttpClient,
    private utils: UtilsService
  ) { }

  checkGroupName(name) {
    return this.http.get(`/admin/customer-groups/exists?name=${name}`)
      .pipe(map(response => response['existed']));
  }

  getGroupById(id) {
    return this.http.get(`/admin/customer-groups/${id}`);
  }
  getManyGroups(query) {
    const querystring = this.utils.serialize(query).replace('filters', 'regexes');
    return this.http.get('/admin/customer-groups?' + querystring);
  }

  _prepareNewGroup(data) {
    return data;
  }

  createGroup(formData) {
    return this.http.post('/admin/customer-groups', this._prepareNewGroup(formData));
  }

  _prepareUpdateGroup(data) {
    return {
      name: data.name,
      description: data.description
    }
  }

  updateGroup(id, formData) {
    return this.http.patch(`/admin/customer-groups/${id}`,this. _prepareUpdateGroup(formData));
  }

  deleteGroups(ids) {
    return this.http.delete('/admin/customer-groups?ids=' + ids.join(','),{
      observe: 'response'
    });
  }
}
