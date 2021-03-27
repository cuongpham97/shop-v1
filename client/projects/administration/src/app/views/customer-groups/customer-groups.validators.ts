import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { Observable, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CustomerGroupsService } from './customer-groups.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerGroupsValidators {
  constructor(private service: CustomerGroupsService) { }

  checkGroupName(name) {
    return timer(300)
      .pipe(switchMap(() => this.service.checkGroupName(name)));
  }

  checkNameTaken(oldName?): AsyncValidatorFn {
    return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {
      if (oldName == control.value) {
        return new Observable(observer => {
          observer.next(null);
          observer.complete();
        });
      }

      return this.checkGroupName(control.value)
        .pipe(map((isExist: boolean) => {
          if (isExist) {
            return { exists: true };
          }
        }));
    };
  }
}
