import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { Observable, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AdminsService } from './admins.service';

@Injectable({
  providedIn: 'root'
})
export class AdminsValidators {
  constructor(private service: AdminsService) { }

  checkAdminName(name) {
    return timer(300)
      .pipe(switchMap(() => this.service.checkAdminName(name)));
  }

  checkNameTaken(oldName?): AsyncValidatorFn {
    return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {
      if (oldName == control.value) {
        return new Observable(observer => {
          observer.next(null);
          observer.complete();
        });
      }

      return this.checkAdminName(control.value)
        .pipe(map((isExist: boolean) => {
          if (isExist) {
            return { exists: true };
          }
        }));
    };
  }
}
