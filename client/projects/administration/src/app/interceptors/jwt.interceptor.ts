import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services';
import { catchError, mergeMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import * as moment from 'moment';

@Injectable()
export class JWTInterceptor implements HttpInterceptor {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    //Add authorization header with jwt token if available
    const user = this.auth.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    const expiresIn = user['expiresIn'];
    const now = moment();

    if (now.isAfter(expiresIn)) {
      return this.auth.refreshToken() 
        .pipe(mergeMap(accessToken => {
          request = request.clone({ setHeaders: { 'Authorization': `Bearer ${accessToken}` } });
          return next.handle(request);
        }))
        .pipe(catchError(response => {
          const error = response.error;

          if (error && error.code === 'CREDENTIALS_HAVE_CHANGED') {
            //TODO: notify to user;
            alert('Username or password has been changed');
          }

          this.auth.logout();
          return next.handle(request);
        }));

    } else {
      const token = user['accessToken'];
      if (!token) {
        this.auth.logout();
        return next.handle(request);
      }

      request = request.clone({ setHeaders: { 'Authorization': `Bearer ${token}` } });
      return next.handle(request);
    }
  }

}
