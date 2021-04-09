import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PermissionFormService {

  constructor(private http: HttpClient) { }

  getPermission() {
    return this.http.get('/admin/permission')
      .pipe(map(response => response['permission']))
      .pipe(map((permission) => {
        const result = {};

        for (const { name, action } of permission) {
          result[name] = action;
        }

        return result;
      }));
  }
}
