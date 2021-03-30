import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (!this.auth.getCurrentUser()) {
      this.router.navigateByUrl(`/login?redirect=${state.url}`);
      return false;
    }

    let expected = next.data &&  next.data.permission;
    if (!expected) return true;

    if (this.auth.checkPermission(expected)) {
      return true;

    } else {
      this.router.navigateByUrl('/error');
    }
  }
}
