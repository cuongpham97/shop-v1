import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { Observable, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { HeaderService } from '../header.service';

@Injectable({
  providedIn: 'root'
})
export class RegisterValidators {
  constructor(private service: HeaderService) { }

  checkEmail(email) {
    return timer(300)
      .pipe(switchMap(() => this.service.checkUniqueCustomer({ email: email })));
  }

  UniqueEmail(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {
      return this.checkEmail(control.value)
        .pipe(map(isExisted => {
          if (isExisted) {
            return { emailExists: isExisted };
          }
        }));
    };
  }

  checkPhone(phone) {
    return timer(300)
      .pipe(switchMap(() => this.service.checkUniqueCustomer({ phone: phone })));
  }

  UniquePhone(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {
      return this.checkPhone(control.value)
        .pipe(map(isExisted => {
          if (isExisted) {
            return { phoneExists: isExisted };
          }
        }));
    };
  }
}
