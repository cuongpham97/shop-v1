import { HttpBackend, HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import * as moment from 'moment';
import * as _ from 'lodash';

interface IUser {
  name: string,
  avatar: string,
  accessToken: string,
  expiresIn: string,
  refreshToken: string
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http: HttpClient;
  private _subject: BehaviorSubject<IUser>;
  public currentUser$: Observable<IUser>;

  private _forceLogin: Subject<any> = new Subject;
  public forceLogin$: Observable<any> = this._forceLogin.asObservable();

  constructor(
    @Inject('API_URL')
    private API_URL: string,
    private handler: HttpBackend
  ) { 
    this.http = new HttpClient(this.handler);
    this.retrieve()
  }

  retrieve() {
    const keys = ['name', 'avatar', 'accessToken', 'refreshToken'];

    try {
      const user: IUser = JSON.parse(localStorage.getItem('customer'));
      if (!user || !keys.every(key => key in user)) {
        throw new Error();
      }

      this._subject = new BehaviorSubject<IUser>(user);

    } catch (e) {
      this._subject = new BehaviorSubject<IUser>(null);
    
    } finally {
      this.currentUser$ = this._subject.asObservable();
    }
  }

  getCurrentUser() {
    return this._subject.getValue();
  }

  setCurrentUser(user: IUser) {
    this._subject.next(user);
    localStorage.setItem('customer', JSON.stringify(user));
  }

  forceLogin() {
    this._forceLogin.next();
  }

  _createBasicAuthHeader(username: string, password: string): string {
    const hash = btoa(`${username}:${password}`);

    return `Basic ${hash}`;
  }

  login(username: string, password: string) {
    const self = this;

    return this.http.get(this.API_URL + '/auth/token', {
      headers: { 'Authorization':  this._createBasicAuthHeader(username, password) }
    })
    .pipe(map(user => {
      user['expiresIn'] = moment().add(1, 'hours').format();
      self.setCurrentUser(user as IUser);
      
      return user;
    }));
  }

  logout() {
    localStorage.removeItem('customer');
    this._subject.next(null);

    return true;
  }

  refreshToken() {
    const refreshToken = this.getCurrentUser()['refreshToken'];
    if (!refreshToken) {
      this.logout();
      return;
    }

    return this.http.post(this.API_URL + '/auth/token/refresh', { refreshToken })
      .pipe(map(response => {
        const user = this.getCurrentUser();

        user['accessToken'] = response['accessToken'];
        user['refreshToken'] = response['refreshToken'];
        user['expiresIn'] = moment().add(1, 'hours').format();
        this.setCurrentUser(user);

        return response['accessToken'];
      }));
  }

  _createOauthLoginPopup(url, title, w, h) {
    const dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : window.screenX;
    const dualScreenTop = window.screenTop != undefined ? window.screenTop : window.screenY;

    const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

    const systemZoom = width / window.screen.availWidth;
    const left = (width - w) / 2 / systemZoom + dualScreenLeft;
    const top = (height - h) / 2 / systemZoom + dualScreenTop;
    const newWindow = window.open(url, title, 'scrollbars=yes, resizable=yes, width=' + w / systemZoom + ', height=' + h / systemZoom + ', top=' + top + ', left=' + left);

    if (window.focus) newWindow.focus();

    return newWindow;
  }

  loginWithOauth(provider, callback) {
    const popup = this._createOauthLoginPopup(this.API_URL + '/oauth/' + provider, 'Đăng nhập', 600, 650);
  
    callback();
  }
}
