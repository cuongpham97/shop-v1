import { HttpBackend, HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as moment from 'moment';
import * as _ from 'lodash';
import { Router } from '@angular/router';

interface IUser {
  uid: string,
  name: string,
  avatar: string,
  accessToken: string,
  expiresIn: string,
  refreshToken: string,
  scopes: object
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http: HttpClient;
  private subject: BehaviorSubject<IUser>;
  public currentUser$: Observable<IUser>;

  constructor(
    @Inject('API_URL') 
    private API_URL: string,
    private handler: HttpBackend,
    private router: Router
  ) { 
    this.http = new HttpClient(this.handler);
    this.retrieve()
  }

  retrieve() {
    const keys = ['uid', 'name', 'avatar', 'accessToken', 'refreshToken', 'scopes'];

    try {
      const user: IUser = JSON.parse(localStorage.getItem('admin'));
      if (!user || !keys.every(key => key in user)) {
        throw new Error();
      }

      this.subject = new BehaviorSubject<IUser>(user);

    } catch (e) {
      this.subject = new BehaviorSubject<IUser>(null);
    
    } finally {
      this.currentUser$ = this.subject.asObservable();
    }
  }

  getCurrentUser() {
    return this.subject.getValue();
  }

  setCurrentUser(user: IUser) {
    this.subject.next(user);
    localStorage.setItem('admin', JSON.stringify(user));
  }

  _createBasicAuthHeader(username: string, password: string): string {
    const hash = btoa(`${username}:${password}`);

    return `Basic ${hash}`;
  }

  login(username: string, password: string) {
    const self = this;

    return this.http.get(this.API_URL + '/admin/auth/token', {
      headers: { 'Authorization':  this._createBasicAuthHeader(username, password) }
    })
    .pipe(map(user => {
      user['expiresIn'] = moment().add(1, 'hours').format();
      self.setCurrentUser(user as IUser);
      
      return user;
    }));
  }

  logout() {
    localStorage.removeItem('admin');
    this.subject.next(null);
    
    this.router.navigate(['/login']);
    return true;
  }

  hasPermission(expected) {
    const [collection, action] = expected.split('.');
    
    const user = this.getCurrentUser();
    if (!user) return false;

    const scopes = _.get(user, 'scopes');
    if (!scopes) return false;

    if (Array.isArray(scopes[collection])) {
      return scopes[collection].includes(action);
    }

    return scopes[collection] === action;
  }


  checkPermission(expected) {
    if (Array.isArray(expected)) {
      for (const permission of expected) {

        if (Array.isArray(permission)) {
          if (!permission.some(i => this.hasPermission(i))) {
            return false;
          }
        } else {
          if (!this.hasPermission(permission)) {
            return false;
          }
        }
      }

      return true;
    }

    return this.hasPermission(expected);
  }

  can = this.checkPermission;

  refreshToken() {
    const refreshToken = this.getCurrentUser()['refreshToken'];
    if (!refreshToken) {
      this.logout();
      return;
    }

    return this.http.post(this.API_URL + '/admin/auth/token/refresh', { refreshToken })
      .pipe(map(response => {
        const user = this.getCurrentUser();

        user['accessToken'] = response['accessToken'];
        user['refreshToken'] = response['refreshToken'];
        user['expiresIn'] = moment().add(1, 'hours').format();
        this.setCurrentUser(user);

        return response['accessToken'];
      }));
  }
}
