import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { Observable, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CategoriesService } from './categories.service';

@Injectable({
  providedIn: 'root'
})
export class CategoriesValidators {
  constructor(private service: CategoriesService) { }

  checkCategoryName(name) {
    return timer(300)
      .pipe(switchMap(() => this.service.checkCategoryName(name)));
  }

  uniqueName(oldName?): AsyncValidatorFn {
    return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {
      if (oldName == control.value) {
        return new Observable(observer => {
          observer.next(null);
          observer.complete();
        });
      }

      return this.checkCategoryName(control.value)
        .pipe(map(total => {
          if (total) {
            return { exists: true };
          }
        }));
    };
  }
}
